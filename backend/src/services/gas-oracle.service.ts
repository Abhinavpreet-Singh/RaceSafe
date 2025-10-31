import { blockchainService } from './blockchain.service';
import { websocketService } from './websocket.service';
import { GasPrice } from '../types';

class GasOracleService {
  private currentGasPrice: GasPrice | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  async start(): Promise<void> {
    // Update gas prices immediately
    await this.updateGasPrices();

    // Update every 12 seconds (average block time)
    this.updateInterval = setInterval(() => {
      this.updateGasPrices();
    }, 12000);

    console.log('⛽ Gas oracle service started');
  }

  private async updateGasPrices(): Promise<void> {
    try {
      const feeData = await blockchainService.getProvider().getFeeData();
      
      const baseGasPrice = feeData.gasPrice || BigInt(0);
      const maxFeePerGas = feeData.maxFeePerGas || baseGasPrice;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || BigInt(0);

      // Calculate different speed tiers
      const slow = baseGasPrice * BigInt(90) / BigInt(100); // 90% of base
      const standard = baseGasPrice;
      const fast = baseGasPrice * BigInt(110) / BigInt(100); // 110% of base
      const instant = baseGasPrice * BigInt(125) / BigInt(100); // 125% of base

      this.currentGasPrice = {
        slow: slow.toString(),
        standard: standard.toString(),
        fast: fast.toString(),
        instant: instant.toString(),
        timestamp: Date.now(),
      };

      // Broadcast gas update
      websocketService.broadcast({
        type: 'gas_update',
        data: this.currentGasPrice,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating gas prices:', error);
    }
  }

  getCurrentGasPrice(): GasPrice | null {
    return this.currentGasPrice;
  }

  async estimateTransactionCost(gasLimit: bigint): Promise<{
    slow: string;
    standard: string;
    fast: string;
    instant: string;
  }> {
    if (!this.currentGasPrice) {
      await this.updateGasPrices();
    }

    if (!this.currentGasPrice) {
      throw new Error('Failed to fetch gas prices');
    }

    return {
      slow: (BigInt(this.currentGasPrice.slow) * gasLimit).toString(),
      standard: (BigInt(this.currentGasPrice.standard) * gasLimit).toString(),
      fast: (BigInt(this.currentGasPrice.fast) * gasLimit).toString(),
      instant: (BigInt(this.currentGasPrice.instant) * gasLimit).toString(),
    };
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('⛽ Gas oracle service stopped');
  }
}

export const gasOracleService = new GasOracleService();
