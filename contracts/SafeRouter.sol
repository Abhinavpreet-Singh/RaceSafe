// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SafeRouter
 * @notice Hardened DeFi token swap router with MEV protection
 * @dev Implements multiple security layers:
 *      - Reentrancy guard to prevent recursive calls
 *      - Pausable circuit breaker for emergency stops
 *      - Slippage protection via minAmountOut
 *      - Access control for admin functions
 *      - Safe token transfers
 *      - Event logging for all critical operations
 * 
 * Formula-1 Theme: This is the "Pit Crew" contract - ensuring safe pit stops (swaps)
 */
contract SafeRouter is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // ============ STATE VARIABLES ============
    
    /// @notice Maximum slippage tolerance (basis points: 100 = 1%)
    uint256 public constant MAX_SLIPPAGE_BPS = 500; // 5% max
    
    /// @notice Minimum trade amount to prevent dust attacks
    uint256 public minTradeAmount = 1000; // Can be adjusted by owner
    
    /// @notice Fee in basis points (100 = 1%)
    uint256 public feeBps = 30; // 0.3% default fee
    
    /// @notice Fee recipient address
    address public feeRecipient;
    
    /// @notice Mapping to track approved DEX routers
    mapping(address => bool) public approvedRouters;
    
    // ============ EVENTS ============
    
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    
    event RouterApprovalChanged(address indexed router, bool approved);
    event FeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address indexed newRecipient);
    event MinTradeAmountUpdated(uint256 newAmount);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    
    // ============ ERRORS ============
    
    error InvalidAmount();
    error SlippageTooHigh();
    error DeadlineExpired();
    error UnauthorizedRouter();
    error InsufficientOutput();
    error TransferFailed();
    error InvalidAddress();
    error BelowMinimumTrade();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @notice Initialize the SafeRouter
     * @param _feeRecipient Address to receive trading fees
     */
    constructor(address _feeRecipient) Ownable(msg.sender) {
        if (_feeRecipient == address(0)) revert InvalidAddress();
        feeRecipient = _feeRecipient;
    }
    
    // ============ CORE SWAP FUNCTIONS ============
    
    /**
     * @notice Execute a token swap with MEV protection
     * @dev Implements slippage protection, reentrancy guard, and deadline check
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum acceptable output (slippage protection)
     * @param deadline Transaction must be mined before this timestamp
     * @param router Approved DEX router to use for swap
     * @param swapData Encoded swap call data
     * @return amountOut Actual amount of output tokens received
     */
    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline,
        address router,
        bytes calldata swapData
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 amountOut) 
    {
        // ========== VALIDATION CHECKS ==========
        
        // Check deadline to prevent stale transactions (MEV protection)
        if (block.timestamp > deadline) revert DeadlineExpired();
        
        // Validate input amount
        if (amountIn == 0) revert InvalidAmount();
        if (amountIn < minTradeAmount) revert BelowMinimumTrade();
        
        // Ensure router is approved (prevents malicious router attacks)
        if (!approvedRouters[router]) revert UnauthorizedRouter();
        
        // Validate addresses
        if (tokenIn == address(0) || tokenOut == address(0)) revert InvalidAddress();
        
        // ========== FEE CALCULATION ==========
        
        uint256 feeAmount = (amountIn * feeBps) / 10000;
        uint256 amountInAfterFee = amountIn - feeAmount;
        
        // ========== TOKEN TRANSFERS ==========
        
        // Transfer tokens from user to this contract
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Transfer fee to fee recipient
        if (feeAmount > 0) {
            IERC20(tokenIn).safeTransfer(feeRecipient, feeAmount);
        }
        
        // ========== SWAP EXECUTION ==========
        
        // Get balance before swap
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));
        
        // Approve router to spend tokens
        IERC20(tokenIn).safeIncreaseAllowance(router, amountInAfterFee);
        
        // Execute swap via approved router
        (bool success, ) = router.call(swapData);
        if (!success) revert TransferFailed();
        
        // Get balance after swap
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        amountOut = balanceAfter - balanceBefore;
        
        // ========== SLIPPAGE PROTECTION ==========
        
        // Enforce minimum output to prevent slippage attacks
        if (amountOut < minAmountOut) revert InsufficientOutput();
        
        // Additional check: ensure slippage is within acceptable bounds
        uint256 expectedAmount = minAmountOut * 10000 / (10000 - MAX_SLIPPAGE_BPS);
        if (amountOut < minAmountOut || amountIn > expectedAmount) {
            revert SlippageTooHigh();
        }
        
        // ========== TRANSFER OUTPUT ==========
        
        // Transfer output tokens to user
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        
        // ========== EVENT LOGGING ==========
        
        emit SwapExecuted(
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            feeAmount
        );
        
        return amountOut;
    }
    
    /**
     * @notice Execute a native ETH to token swap
     * @dev Similar protections as swapTokens but handles native ETH
     */
    function swapETHForTokens(
        address tokenOut,
        uint256 minAmountOut,
        uint256 deadline,
        address router,
        bytes calldata swapData
    ) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        returns (uint256 amountOut) 
    {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (msg.value == 0) revert InvalidAmount();
        if (msg.value < minTradeAmount) revert BelowMinimumTrade();
        if (!approvedRouters[router]) revert UnauthorizedRouter();
        
        uint256 feeAmount = (msg.value * feeBps) / 10000;
        uint256 amountInAfterFee = msg.value - feeAmount;
        
        // Transfer fee
        if (feeAmount > 0) {
            (bool sent, ) = feeRecipient.call{value: feeAmount}("");
            if (!sent) revert TransferFailed();
        }
        
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));
        
        // Execute swap with remaining ETH
        (bool success, ) = router.call{value: amountInAfterFee}(swapData);
        if (!success) revert TransferFailed();
        
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        amountOut = balanceAfter - balanceBefore;
        
        if (amountOut < minAmountOut) revert InsufficientOutput();
        
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        
        emit SwapExecuted(
            msg.sender,
            address(0), // ETH represented as address(0)
            tokenOut,
            msg.value,
            amountOut,
            feeAmount
        );
        
        return amountOut;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Approve or revoke a DEX router
     * @dev Only owner can call - prevents malicious router injection
     */
    function setRouterApproval(address router, bool approved) external onlyOwner {
        if (router == address(0)) revert InvalidAddress();
        approvedRouters[router] = approved;
        emit RouterApprovalChanged(router, approved);
    }
    
    /**
     * @notice Update trading fee
     * @dev Capped at 1% to prevent excessive fees
     */
    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 100, "Fee too high"); // Max 1%
        feeBps = newFeeBps;
        emit FeeUpdated(newFeeBps);
    }
    
    /**
     * @notice Update fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidAddress();
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
    
    /**
     * @notice Update minimum trade amount
     */
    function setMinTradeAmount(uint256 newAmount) external onlyOwner {
        minTradeAmount = newAmount;
        emit MinTradeAmountUpdated(newAmount);
    }
    
    /**
     * @notice Circuit breaker - pause all trading
     * @dev Emergency function to stop trading during attacks
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Resume trading after pause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Emergency withdrawal function
     * @dev Only callable when paused - last resort to rescue funds
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner whenPaused {
        if (token == address(0)) {
            (bool sent, ) = owner().call{value: amount}("");
            if (!sent) revert TransferFailed();
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
        emit EmergencyWithdraw(token, amount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Check if a router is approved
     */
    function isRouterApproved(address router) external view returns (bool) {
        return approvedRouters[router];
    }
    
    /**
     * @notice Get current fee configuration
     */
    function getFeeConfig() external view returns (uint256 fee, address recipient) {
        return (feeBps, feeRecipient);
    }
    
    /**
     * @notice Calculate fee for a given amount
     */
    function calculateFee(uint256 amount) external view returns (uint256) {
        return (amount * feeBps) / 10000;
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /// @notice Allow contract to receive ETH
    receive() external payable {}
}
