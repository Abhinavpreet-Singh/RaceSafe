import { ethers } from 'ethers';

interface RiskAssessment {
  overall: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  categories: {
    mev: number;
    slippage: number;
    gas: number;
    timing: number;
    liquidity: number;
  };
  recommendations: string[];
  protectionStrategies: string[];
}

export class RiskCalculator {
  /**
   * Calculate comprehensive risk for a transaction
   */
  calculateRisk(params: {
    txValue: string; // in ETH
    gasPrice: string;
    baseGasPrice: string;
    slippage: number;
    isSwap: boolean;
    mempoolSize: number;
    blockPosition?: number;
  }): RiskAssessment {
    const categories = {
      mev: this.calculateMEVRisk(params),
      slippage: this.calculateSlippageRisk(params.slippage, params.isSwap),
      gas: this.calculateGasRisk(params.gasPrice, params.baseGasPrice),
      timing: this.calculateTimingRisk(params.mempoolSize, params.blockPosition),
      liquidity: this.calculateLiquidityRisk(params.txValue),
    };

    // Weighted average
    const overall = (
      categories.mev * 0.35 +
      categories.slippage * 0.25 +
      categories.gas * 0.20 +
      categories.timing * 0.10 +
      categories.liquidity * 0.10
    );

    // Determine level
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (overall > 80) level = 'critical';
    else if (overall > 60) level = 'high';
    else if (overall > 35) level = 'medium';
    else level = 'low';

    // Generate recommendations
    const recommendations = this.generateRecommendations(categories, overall);
    const protectionStrategies = this.generateProtectionStrategies(categories, overall);

    return {
      overall,
      level,
      categories,
      recommendations,
      protectionStrategies,
    };
  }

  /**
   * Calculate MEV risk score
   */
  private calculateMEVRisk(params: {
    txValue: string;
    gasPrice: string;
    baseGasPrice: string;
    isSwap: boolean;
  }): number {
    const value = parseFloat(params.txValue);
    const gasRatio = parseFloat(params.gasPrice) / parseFloat(params.baseGasPrice);

    let score = 0;

    // Value factor (higher value = more attractive to attackers)
    if (value > 10) score += 40;
    else if (value > 5) score += 30;
    else if (value > 1) score += 20;
    else if (value > 0.1) score += 10;

    // Gas price factor (higher gas = more likely to be frontrun)
    if (gasRatio > 2.0) score += 30;
    else if (gasRatio > 1.5) score += 20;
    else if (gasRatio > 1.2) score += 10;

    // Swap factor (swaps are prime MEV targets)
    if (params.isSwap) score += 30;

    return Math.min(score, 100);
  }

  /**
   * Calculate slippage risk score
   */
  private calculateSlippageRisk(slippage: number, isSwap: boolean): number {
    if (!isSwap) return 0;

    let score = 0;

    if (slippage > 5) score = 100;
    else if (slippage > 3) score = 80;
    else if (slippage > 1) score = 60;
    else if (slippage > 0.5) score = 40;
    else if (slippage > 0.1) score = 20;
    else score = 5;

    return score;
  }

  /**
   * Calculate gas price risk
   */
  private calculateGasRisk(gasPrice: string, baseGasPrice: string): number {
    const ratio = parseFloat(gasPrice) / parseFloat(baseGasPrice);

    let score = 0;

    if (ratio > 3.0) score = 90;
    else if (ratio > 2.0) score = 70;
    else if (ratio > 1.5) score = 50;
    else if (ratio > 1.2) score = 30;
    else if (ratio > 1.0) score = 10;

    return score;
  }

  /**
   * Calculate timing risk (mempool congestion)
   */
  private calculateTimingRisk(mempoolSize: number, blockPosition?: number): number {
    let score = 0;

    // Mempool congestion
    if (mempoolSize > 10000) score += 30;
    else if (mempoolSize > 5000) score += 20;
    else if (mempoolSize > 1000) score += 10;

    // Block position (if known)
    if (blockPosition !== undefined) {
      if (blockPosition < 5) score += 20; // First 5 positions are high risk
      else if (blockPosition < 10) score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate liquidity risk
   */
  private calculateLiquidityRisk(txValue: string): number {
    const value = parseFloat(txValue);

    // Simplified - in real impl, would check pool liquidity
    let score = 0;

    if (value > 50) score = 80;
    else if (value > 20) score = 60;
    else if (value > 10) score = 40;
    else if (value > 5) score = 20;

    return score;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    categories: RiskAssessment['categories'],
    overall: number
  ): string[] {
    const recommendations: string[] = [];

    if (overall > 80) {
      recommendations.push('🚨 CRITICAL: Do NOT submit this transaction publicly');
      recommendations.push('🔒 Use Flashbots RPC to protect from MEV attacks');
    } else if (overall > 60) {
      recommendations.push('⚠️ HIGH RISK: Strong MEV protection recommended');
      recommendations.push('🔒 Consider using Flashbots for safety');
    }

    if (categories.mev > 70) {
      recommendations.push('🎯 High-value transaction detected - prime MEV target');
      recommendations.push('💡 Split into smaller transactions if possible');
    }

    if (categories.slippage > 60) {
      recommendations.push('📉 Reduce slippage tolerance to minimize losses');
      recommendations.push('⏰ Wait for better market conditions');
    }

    if (categories.gas > 70) {
      recommendations.push('⛽ Gas price very high - consider waiting');
      recommendations.push('📊 Check gas tracker for optimal timing');
    }

    if (categories.timing > 50) {
      recommendations.push('🕒 High mempool congestion detected');
      recommendations.push('⏳ Wait for quieter period or increase gas');
    }

    if (categories.liquidity > 60) {
      recommendations.push('💧 Large trade relative to liquidity');
      recommendations.push('🔀 Use DEX aggregator for better execution');
    }

    // Always add a safe option
    if (recommendations.length === 0) {
      recommendations.push('✅ Transaction appears safe to submit');
      recommendations.push('💡 Still monitor for any suspicious activity');
    }

    return recommendations;
  }

  /**
   * Generate protection strategies
   */
  private generateProtectionStrategies(
    categories: RiskAssessment['categories'],
    overall: number
  ): string[] {
    const strategies: string[] = [];

    if (overall > 60) {
      strategies.push('Use Flashbots Protect RPC');
      strategies.push('Enable transaction privacy mode');
    }

    if (categories.mev > 60) {
      strategies.push('Submit via private relay');
      strategies.push('Set custom block target');
    }

    if (categories.slippage > 50) {
      strategies.push('Set tighter slippage tolerance (0.1-0.5%)');
      strategies.push('Use limit orders instead of market orders');
    }

    if (categories.gas > 60) {
      strategies.push('Wait for off-peak hours (2-6 AM UTC)');
      strategies.push('Use dynamic gas pricing');
    }

    if (categories.timing > 40) {
      strategies.push('Schedule transaction for quieter period');
      strategies.push('Use time-weighted execution');
    }

    if (categories.liquidity > 50) {
      strategies.push('Split order across multiple DEXs');
      strategies.push('Use DEX aggregator (1inch, Matcha)');
    }

    // Fallback
    if (strategies.length === 0) {
      strategies.push('Continue with standard submission');
      strategies.push('Monitor transaction in mempool');
    }

    return strategies;
  }

  /**
   * Calculate sandwich attack profit potential
   */
  calculateSandwichProfitPotential(params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    slippage: number;
    poolLiquidity: string;
  }): {
    profitPotential: number; // in ETH
    isProfitable: boolean;
    attackLikelihood: number; // 0-100
  } {
    // Simplified calculation
    const amountIn = parseFloat(params.amountIn);
    const slippage = params.slippage;
    const liquidity = parseFloat(params.poolLiquidity);

    // Profit potential = slippage * amount * 0.7 (attacker takes 70% of slippage)
    const profitPotential = (amountIn * slippage / 100) * 0.7;

    // Is it worth attacking? (profit > gas costs ~$20)
    const isProfitable = profitPotential > 0.01; // ~$20 at $2000/ETH

    // Likelihood increases with profit potential
    let attackLikelihood = 0;
    if (profitPotential > 1) attackLikelihood = 95;
    else if (profitPotential > 0.5) attackLikelihood = 80;
    else if (profitPotential > 0.1) attackLikelihood = 60;
    else if (profitPotential > 0.05) attackLikelihood = 40;
    else if (profitPotential > 0.01) attackLikelihood = 20;
    else attackLikelihood = 5;

    return {
      profitPotential,
      isProfitable,
      attackLikelihood,
    };
  }

  /**
   * Calculate optimal gas price to avoid frontrunning
   */
  calculateOptimalGasPrice(params: {
    baseGasPrice: string;
    urgency: 'low' | 'medium' | 'high';
    mevRisk: number;
  }): {
    recommended: string;
    min: string;
    max: string;
    explanation: string;
  } {
    const base = parseFloat(params.baseGasPrice);

    let multiplier = 1.1; // Default

    // Adjust based on urgency
    if (params.urgency === 'high') multiplier = 1.3;
    else if (params.urgency === 'medium') multiplier = 1.2;

    // Reduce if high MEV risk (don't want to attract frontrunners)
    if (params.mevRisk > 70) {
      multiplier = 1.0; // Use base fee
    }

    const recommended = (base * multiplier).toFixed(2);
    const min = (base * 1.0).toFixed(2);
    const max = (base * 1.5).toFixed(2);

    let explanation = '';
    if (params.mevRisk > 70) {
      explanation = 'Using base fee to avoid attracting MEV bots. Use Flashbots instead.';
    } else if (params.urgency === 'high') {
      explanation = '30% above base for fast inclusion';
    } else {
      explanation = 'Standard gas price for normal inclusion';
    }

    return {
      recommended,
      min,
      max,
      explanation,
    };
  }
}

export const riskCalculator = new RiskCalculator();
