// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VulnerableRouter
 * @notice INTENTIONALLY VULNERABLE contract for comparison demo
 * @dev This contract has MULTIPLE security flaws to demonstrate:
 *      ❌ NO reentrancy protection
 *      ❌ NO slippage protection
 *      ❌ NO deadline enforcement
 *      ❌ NO access control
 *      ❌ UNSAFE token transfers
 *      ❌ NO pause mechanism
 * 
 * WARNING: DO NOT USE IN PRODUCTION - FOR EDUCATIONAL PURPOSES ONLY
 * 
 * Formula-1 Theme: This is the "CRASHED CAR" - no safety features
 */
contract VulnerableRouter {
    // ============ STATE VARIABLES ============
    
    /// @notice Fee in basis points (100 = 1%)
    uint256 public feeBps = 30; // 0.3% fee
    
    /// @notice Fee recipient
    address public feeRecipient;
    
    // ❌ NO nonReentrant modifier
    // ❌ NO pausable
    // ❌ NO access control
    // ❌ NO approved routers mapping
    
    // ============ EVENTS ============
    
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    // ============ VULNERABLE SWAP FUNCTION ============
    
    /**
     * @notice VULNERABLE swap function - DO NOT USE!
     * @dev Multiple security flaws:
     *      1. NO reentrancy guard → Can be attacked recursively
     *      2. NO slippage protection → User can lose unlimited funds
     *      3. NO deadline check → Transactions can be held and executed later
     *      4. NO router validation → Any malicious contract can be called
     *      5. UNSAFE transfers → Can fail silently
     */
    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut, // ❌ NOT ENFORCED!
        uint256 deadline,      // ❌ NOT CHECKED!
        address router,        // ❌ NOT VALIDATED!
        bytes calldata swapData
    ) 
        external 
        returns (uint256 amountOut) 
    {
        // ❌ VULNERABILITY 1: No deadline check
        // Allows MEV bots to hold transaction and execute when profitable
        
        // ❌ VULNERABILITY 2: No minimum amount validation
        if (amountIn == 0) revert("Invalid amount");
        
        // ❌ VULNERABILITY 3: Unsafe token transfer (no SafeERC20)
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate fee
        uint256 feeAmount = (amountIn * feeBps) / 10000;
        uint256 amountInAfterFee = amountIn - feeAmount;
        
        // ❌ VULNERABILITY 4: Unsafe transfer
        if (feeAmount > 0) {
            IERC20(tokenIn).transfer(feeRecipient, feeAmount);
        }
        
        // ❌ VULNERABILITY 5: No balance check before swap
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));
        
        // ❌ VULNERABILITY 6: Approve without checking router
        IERC20(tokenIn).approve(router, amountInAfterFee);
        
        // ❌ VULNERABILITY 7: No validation on router address
        // Any malicious contract can be called here!
        (bool success, ) = router.call(swapData);
        require(success, "Swap failed");
        
        // ❌ VULNERABILITY 8: No balance check after swap
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        amountOut = balanceAfter - balanceBefore;
        
        // ❌ VULNERABILITY 9: NO SLIPPAGE PROTECTION!
        // minAmountOut is completely ignored!
        // User can receive ANY amount, even 0!
        
        // ❌ VULNERABILITY 10: Unsafe transfer to user
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        emit SwapExecuted(
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut
        );
        
        return amountOut;
    }
    
    /**
     * @notice VULNERABLE ETH swap - Even worse!
     * @dev Additional vulnerabilities with native ETH handling
     */
    function swapETHForTokens(
        address tokenOut,
        uint256 minAmountOut, // ❌ IGNORED
        uint256 deadline,      // ❌ IGNORED
        address router,
        bytes calldata swapData
    ) 
        external 
        payable 
        returns (uint256 amountOut) 
    {
        // ❌ No deadline check
        // ❌ No minimum value check
        // ❌ No router validation
        
        uint256 feeAmount = (msg.value * feeBps) / 10000;
        uint256 amountInAfterFee = msg.value - feeAmount;
        
        // ❌ VULNERABILITY: Unsafe ETH transfer
        if (feeAmount > 0) {
            payable(feeRecipient).transfer(feeAmount);
        }
        
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));
        
        // ❌ Call any router without validation
        (bool success, ) = router.call{value: amountInAfterFee}(swapData);
        require(success, "Swap failed");
        
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        amountOut = balanceAfter - balanceBefore;
        
        // ❌ NO slippage protection!
        
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        emit SwapExecuted(
            msg.sender,
            address(0),
            tokenOut,
            msg.value,
            amountOut
        );
        
        return amountOut;
    }
    
    // ❌ VULNERABILITY 11: Anyone can change fee!
    function setFeeBps(uint256 newFeeBps) external {
        feeBps = newFeeBps; // No access control!
    }
    
    // ❌ VULNERABILITY 12: Anyone can change fee recipient!
    function setFeeRecipient(address newRecipient) external {
        feeRecipient = newRecipient; // No access control!
    }
    
    // ❌ VULNERABILITY 13: No emergency pause
    // ❌ VULNERABILITY 14: No emergency withdrawal
    // ❌ VULNERABILITY 15: Contract can receive ETH but has no withdrawal
    
    receive() external payable {}
}

/**
 * VULNERABILITY SUMMARY (For SecureDApp Audit):
 * ═══════════════════════════════════════════════
 * 
 * CRITICAL (3):
 * 1. No reentrancy protection → Recursive call attacks
 * 2. No slippage enforcement → Unlimited user loss
 * 3. No access control → Anyone can change parameters
 * 
 * HIGH (5):
 * 4. No deadline validation → MEV front-running
 * 5. No router validation → Malicious contract calls
 * 6. Unsafe token transfers → Silent failures
 * 7. No emergency pause → Cannot stop attacks
 * 8. No minimum trade amount → Dust attacks
 * 
 * MEDIUM (4):
 * 9. No balance validation → Incorrect accounting
 * 10. Unlimited approvals → Token theft risk
 * 11. No event logging for admin functions
 * 12. Missing input validation
 * 
 * LOW (3):
 * 13. Gas optimization issues
 * 14. Missing NatSpec documentation
 * 15. No upgrade mechanism
 * 
 * Expected SecureDApp Score: F (25-35%)
 * Critical Issues: 3
 * High Issues: 5
 * 
 * Compare this to SafeRouter.sol (A+ / 98%)
 */
