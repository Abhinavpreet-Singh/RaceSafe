import { ethers } from 'ethers';

interface SimulationResult {
  success: boolean;
  gasUsed: string;
  gasPrice: string;
  totalCost: string;
  mevRisk: RiskScore;
  slippage: {
    estimated: number;
    safe: boolean;
  };
  recommendation: string;
  warnings: string[];
}

interface RiskScore {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    gasPrice: number;
    txValue: number;
    slippage: number;
    timing: number;
  };
  explanation: string;
}

export class TransactionSimulator {
  private provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Simulate a transaction before sending
   */
  async simulate(tx: ethers.TransactionRequest): Promise<SimulationResult> {
    try {
      // Estimate gas
      const gasEstimate = await this.provider.estimateGas(tx);
      
      // Get current gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);

      // Calculate total cost
      const totalCost = gasEstimate * gasPrice;

      // Calculate MEV risk
      const mevRisk = await this.predictMEVRisk(tx);

      // Calculate slippage (if it's a swap)
      const slippage = this.estimateSlippage(tx);

      // Generate warnings
      const warnings: string[] = [];
      if (mevRisk.score > 70) {
        warnings.push('⚠️ High MEV risk detected - use Flashbots!');
      }
      if (slippage.estimated > 1) {
        warnings.push('⚠️ High slippage expected - adjust tolerance');
      }
      if (Number(ethers.formatEther(totalCost)) > 0.01) {
        warnings.push('⚠️ High gas cost - consider waiting for lower fees');
      }

      // Generate recommendation
      let recommendation = '';
      if (mevRisk.score > 80) {
        recommendation = '🔒 Submit via Flashbots private relay';
      } else if (mevRisk.score > 50) {
        recommendation = '⚡ Use higher gas price or Flashbots';
      } else {
        recommendation = '✅ Safe to submit normally';
      }

      return {
        success: true,
        gasUsed: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        totalCost: ethers.formatEther(totalCost),
        mevRisk,
        slippage,
        recommendation,
        warnings,
      };
    } catch (error: any) {
      return {
        success: false,
        gasUsed: '0',
        gasPrice: '0',
        totalCost: '0',
        mevRisk: {
          score: 0,
          level: 'low',
          factors: { gasPrice: 0, txValue: 0, slippage: 0, timing: 0 },
          explanation: 'Simulation failed',
        },
        slippage: { estimated: 0, safe: true },
        recommendation: '❌ Transaction will likely fail',
        warnings: [`Error: ${error.message}`],
      };
    }
  }

  /**
   * Predict MEV risk for a transaction
   */
  async predictMEVRisk(tx: ethers.TransactionRequest): Promise<RiskScore> {
    // Get mempool state
    const block = await this.provider.getBlock('latest');
    const baseFee = block?.baseFeePerGas || BigInt(0);

    // Factor 1: Gas price (higher = more likely to be frontrun)
    const txGasPrice = BigInt(tx.gasPrice || tx.maxFeePerGas || 0);
    const gasPriceFactor = Number((txGasPrice * BigInt(100)) / baseFee);

    // Factor 2: Transaction value
    const txValue = Number(ethers.formatEther(tx.value || 0));
    const valueFactor = Math.min(txValue * 20, 100); // Cap at 100

    // Factor 3: Function being called (simplified)
    const data = tx.data?.toString() || '0x';
    const isSwap = data.includes('swapExact') || data.includes('swap');
    const slippageFactor = isSwap ? 30 : 0;

    // Factor 4: Timing (block position matters)
    const timingFactor = 10; // Simplified

    // Calculate overall score
    const score = Math.min(
      (gasPriceFactor * 0.3) +
      (valueFactor * 0.4) +
      (slippageFactor * 0.2) +
      (timingFactor * 0.1),
      100
    );

    // Determine risk level
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (score > 80) level = 'critical';
    else if (score > 60) level = 'high';
    else if (score > 30) level = 'medium';
    else level = 'low';

    // Generate explanation
    const explanation = `
MEV Risk Analysis:
- Gas Price Factor: ${gasPriceFactor.toFixed(1)}% above base fee
- Value at Risk: ${txValue.toFixed(4)} ETH (${valueFactor.toFixed(0)}% factor)
- Slippage Exposure: ${slippageFactor}%
- Overall Risk: ${score.toFixed(0)}/100 (${level.toUpperCase()})

${level === 'critical' ? '🚨 CRITICAL: Very likely to be attacked' :
  level === 'high' ? '⚠️ HIGH: Significant MEV risk' :
  level === 'medium' ? '⚠️ MEDIUM: Moderate MEV risk' :
  '✅ LOW: Minimal MEV risk'}
    `.trim();

    return {
      score,
      level,
      factors: {
        gasPrice: gasPriceFactor,
        txValue: valueFactor,
        slippage: slippageFactor,
        timing: timingFactor,
      },
      explanation,
    };
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    try {
      return await this.provider.estimateGas(tx);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return BigInt(21000); // Default gas for simple transfer
    }
  }

  /**
   * Estimate slippage (simplified)
   */
  private estimateSlippage(tx: ethers.TransactionRequest): {
    estimated: number;
    safe: boolean;
  } {
    const data = tx.data?.toString() || '0x';
    
    // Check if it's a swap transaction
    const isSwap = data.includes('swapExact') || data.includes('swap');
    
    if (!isSwap) {
      return { estimated: 0, safe: true };
    }

    // Estimate based on transaction value
    const value = Number(ethers.formatEther(tx.value || 0));
    let estimated = 0.1; // Base 0.1%

    if (value > 10) estimated = 1.0;
    else if (value > 5) estimated = 0.5;
    else if (value > 1) estimated = 0.3;

    return {
      estimated,
      safe: estimated <= 0.5,
    };
  }

  /**
   * Simulate transaction bundle (for Flashbots)
   */
  async simulateBundle(txs: ethers.TransactionRequest[]): Promise<{
    success: boolean;
    results: SimulationResult[];
    totalGas: string;
    bundleProfit: string;
  }> {
    const results: SimulationResult[] = [];
    let totalGas = BigInt(0);

    for (const tx of txs) {
      const result = await this.simulate(tx);
      results.push(result);
      totalGas += BigInt(result.gasUsed);
    }

    return {
      success: results.every(r => r.success),
      results,
      totalGas: totalGas.toString(),
      bundleProfit: '0', // Would calculate arbitrage profit
    };
  }

  /**
   * Check if transaction is safe to submit
   */
  async isSafeToSubmit(tx: ethers.TransactionRequest): Promise<{
    safe: boolean;
    reason: string;
    useFlashbots: boolean;
  }> {
    const simulation = await this.simulate(tx);

    if (!simulation.success) {
      return {
        safe: false,
        reason: 'Transaction will fail',
        useFlashbots: false,
      };
    }

    if (simulation.mevRisk.score > 70) {
      return {
        safe: false,
        reason: 'High MEV risk - vulnerable to attacks',
        useFlashbots: true,
      };
    }

    if (simulation.slippage.estimated > 2) {
      return {
        safe: false,
        reason: 'High slippage expected',
        useFlashbots: true,
      };
    }

    return {
      safe: true,
      reason: 'Transaction appears safe',
      useFlashbots: false,
    };
  }
}

export const transactionSimulator = new TransactionSimulator(
  process.env.ETHEREUM_RPC_HTTP || 'http://localhost:8545'
);
