// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockDEXRouter
 * @notice Mock DEX router for testing swaps
 */
contract MockDEXRouter {
    // Simple 1:1 swap rate for testing
    uint256 public swapRate = 1e18; // 1:1 by default
    
    function setSwapRate(uint256 _rate) external {
        swapRate = _rate;
    }
    
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(deadline >= block.timestamp, "Expired");
        require(path.length >= 2, "Invalid path");
        
        IERC20 tokenIn = IERC20(path[0]);
        IERC20 tokenOut = IERC20(path[path.length - 1]);
        
        // Transfer tokens from sender
        tokenIn.transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate output based on swap rate
        uint256 amountOut = (amountIn * swapRate) / 1e18;
        require(amountOut >= amountOutMin, "Insufficient output");
        
        // Transfer output tokens
        tokenOut.transfer(to, amountOut);
        
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[amounts.length - 1] = amountOut;
        
        return amounts;
    }
    
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts) {
        require(deadline >= block.timestamp, "Expired");
        require(path.length >= 2, "Invalid path");
        
        IERC20 tokenOut = IERC20(path[path.length - 1]);
        
        uint256 amountOut = (msg.value * swapRate) / 1e18;
        require(amountOut >= amountOutMin, "Insufficient output");
        
        tokenOut.transfer(to, amountOut);
        
        amounts = new uint256[](path.length);
        amounts[0] = msg.value;
        amounts[amounts.length - 1] = amountOut;
        
        return amounts;
    }
}
