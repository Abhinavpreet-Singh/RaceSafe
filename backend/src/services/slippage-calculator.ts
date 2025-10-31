import { ethers } from 'ethers';

interface SlippageResult {
  estimatedSlippage: number; // percentage
  estimatedLoss: string; // in ETH
  estimatedLossUSD: string; // in USD
  priceImpact: number; // percentage
  isSafe: boolean;
  recommendation: string;
}

interface PoolState {
  reserve0: bigint;
  reserve1: bigint;
  token0: string;
  token1: string;
}

export class SlippageCalculator {
  private ethPriceUSD: number = 2000; // Mock ETH price

  /**
   * Calculate slippage for a transaction
   */
  calculateSlippage(
    amountIn: bigint,
    expectedAmountOut: bigint,
    actualAmountOut: bigint
  ): SlippageResult {
    // Calculate slippage percentage
    const slippageBigInt = ((expectedAmountOut - actualAmountOut) * BigInt(10000)) / expectedAmountOut;
    const slippagePercent = Number(slippageBigInt) / 100;

    // Calculate loss in wei
    const lossWei = expectedAmountOut - actualAmountOut;
    const lossEth = ethers.formatEther(lossWei);
    const lossUSD = (parseFloat(lossEth) * this.ethPriceUSD).toFixed(2);

    // Determine if safe
    const isSafe = slippagePercent <= 0.5; // 0.5% threshold

    // Generate recommendation
    let recommendation = '';
    if (slippagePercent > 5) {
      recommendation = '🚨 CRITICAL: Use Flashbots to avoid this attack!';
    } else if (slippagePercent > 1) {
      recommendation = '⚠️ HIGH RISK: Consider using private relay';
    } else if (slippagePercent > 0.5) {
      recommendation = '⚠️ MODERATE: Set tighter slippage tolerance';
    } else {
      recommendation = '✅ SAFE: Slippage within acceptable range';
    }

    return {
      estimatedSlippage: slippagePercent,
      estimatedLoss: lossEth,
      estimatedLossUSD: lossUSD,
      priceImpact: slippagePercent, // Simplified
      isSafe,
      recommendation,
    };
  }

  /**
   * Calculate price impact for a swap
   */
  calculatePriceImpact(
    amountIn: bigint,
    poolState: PoolState
  ): number {
    // Using constant product formula: x * y = k
    const { reserve0, reserve1 } = poolState;

    // Calculate new reserves after swap
    const newReserve0 = reserve0 + amountIn;
    const newReserve1 = (reserve0 * reserve1) / newReserve0;

    // Calculate price impact
    const amountOut = reserve1 - newReserve1;
    const effectivePrice = Number(amountIn) / Number(amountOut);
    const spotPrice = Number(reserve1) / Number(reserve0);
    
    const priceImpact = ((effectivePrice - spotPrice) / spotPrice) * 100;

    return Math.abs(priceImpact);
  }

  /**
   * Estimate slippage for a DEX swap
   */
  estimateDEXSlippage(
    amountIn: bigint,
    path: string[],
    poolReserves: PoolState[]
  ): SlippageResult {
    // Get expected output using current reserves
    const expectedOut = this.getAmountOut(amountIn, poolReserves[0]);

    // Simulate 0.5% slippage
    const slippageAmount = (expectedOut * BigInt(50)) / BigInt(10000);
    const actualOut = expectedOut - slippageAmount;

    return this.calculateSlippage(amountIn, expectedOut, actualOut);
  }

  /**
   * Get amount out using constant product formula
   */
  private getAmountOut(amountIn: bigint, pool: PoolState): bigint {
    const { reserve0, reserve1 } = pool;
    
    // With 0.3% fee
    const amountInWithFee = amountIn * BigInt(997);
    const numerator = amountInWithFee * reserve1;
    const denominator = (reserve0 * BigInt(1000)) + amountInWithFee;
    
    return numerator / denominator;
  }

  /**
   * Calculate safe slippage tolerance based on volatility
   */
  getSafeSlippageTolerance(volatility: number): number {
    // volatility: 0-100
    if (volatility > 50) return 2.0; // High volatility
    if (volatility > 20) return 1.0; // Medium volatility
    return 0.5; // Low volatility
  }

  /**
   * Analyze MEV attack slippage
   */
  analyzeMEVAttack(victimTx: {
    amountIn: string;
    expectedOut: string;
    actualOut: string;
  }): SlippageResult {
    const amountIn = ethers.parseEther(victimTx.amountIn);
    const expectedOut = ethers.parseEther(victimTx.expectedOut);
    const actualOut = ethers.parseEther(victimTx.actualOut);

    return this.calculateSlippage(amountIn, expectedOut, actualOut);
  }

  /**
   * Get recommended slippage settings
   */
  getRecommendedSettings(
    txValue: bigint,
    volatility: number
  ): {
    maxSlippage: number;
    deadline: number;
    useFlashbots: boolean;
    gasPrice: string;
  } {
    const valueInEth = Number(ethers.formatEther(txValue));
    const slippage = this.getSafeSlippageTolerance(volatility);

    return {
      maxSlippage: slippage,
      deadline: Math.floor(Date.now() / 1000) + 1200, // 20 minutes
      useFlashbots: valueInEth > 1 || volatility > 30, // High value or volatile
      gasPrice: volatility > 50 ? 'fast' : 'standard',
    };
  }

  /**
   * Update ETH price (for accurate USD calculations)
   */
  updateEthPrice(priceUSD: number): void {
    this.ethPriceUSD = priceUSD;
  }
}

export const slippageCalculator = new SlippageCalculator();
