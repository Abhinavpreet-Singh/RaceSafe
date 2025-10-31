import { ethers } from 'ethers';
// Note: These services are for reference only
// The actual backend uses the implementation in index.ts
// import { blockchainService } from './blockchain.service';
// import { mevDetectionService } from './mev-detection.service';
// import { websocketService } from './websocket.service';
import { config } from '../config';
import { blockchainService } from './blockchain.service';
import { websocketService } from './websocket.service';
import { mevDetectionService } from './mev-detection.service';

class BlockMonitorService {
  private isMonitoring: boolean = false;
  private latestBlock: number = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;

  async start(): Promise<void> {
    if (this.isMonitoring) {
      console.log('⚠️  Block monitoring already running');
      return;
    }

    try {
      this.latestBlock = await blockchainService.getBlockNumber();
      console.log(`🏁 Starting block monitoring from block ${this.latestBlock}`);
      
      this.isMonitoring = true;
      this.monitorBlocks();
      
      // Also set up interval-based monitoring as fallback
      this.monitoringInterval = setInterval(() => {
        this.monitorBlocks();
      }, config.blockPollingInterval);

      console.log('✅ Block monitoring started');
    } catch (error) {
      console.error('❌ Failed to start block monitoring:', error);
      throw error;
    }
  }

  private async monitorBlocks(): Promise<void> {
    if (!this.isMonitoring) return;

    try {
      const currentBlock = await blockchainService.getBlockNumber();

      if (currentBlock > this.latestBlock) {
        // Process all missed blocks
        for (let blockNum = this.latestBlock + 1; blockNum <= currentBlock; blockNum++) {
          await this.processBlock(blockNum);
        }
        this.latestBlock = currentBlock;
      }
    } catch (error) {
      console.error('Error monitoring blocks:', error);
    }
  }

  private async processBlock(blockNumber: number): Promise<void> {
    try {
      const block = await blockchainService.getBlock(blockNumber);
      
      if (!block) {
        console.warn(`Block ${blockNumber} not found`);
        return;
      }

      console.log(`⛓️  Processing block ${blockNumber} with ${block.transactions.length} transactions`);

      // Broadcast block info via WebSocket
      websocketService.broadcast({
        type: 'block',
        data: {
          number: block.number,
          hash: block.hash,
          timestamp: block.timestamp,
          transactionCount: block.transactions.length,
          gasUsed: block.gasUsed?.toString(),
          baseFeePerGas: block.baseFeePerGas?.toString(),
        },
        timestamp: Date.now(),
      });

      // Process transactions for MEV detection
      if (block.transactions && block.transactions.length > 0) {
        await this.processTransactions(block);
      }
    } catch (error) {
      console.error(`Error processing block ${blockNumber}:`, error);
    }
  }

  private async processTransactions(block: ethers.Block): Promise<void> {
    const transactions = block.transactions;
    
    for (const tx of transactions) {
      if (typeof tx === 'string') continue;

      const txResponse = tx as ethers.TransactionResponse;

      try {
        // Detect MEV
        const mevDetection = await mevDetectionService.detectMEV(txResponse, block);

        if (mevDetection) {
          console.log(`🚨 MEV Detected: ${mevDetection.mevType} in tx ${txResponse.hash}`);
          
          // Broadcast MEV alert
          websocketService.broadcast({
            type: 'mev_alert',
            data: mevDetection,
            timestamp: Date.now(),
          });
        }

        // Broadcast transaction
        websocketService.broadcast({
          type: 'transaction',
          data: {
            hash: txResponse.hash,
            from: txResponse.from,
            to: txResponse.to,
            value: txResponse.value.toString(),
            gasPrice: txResponse.gasPrice?.toString(),
            blockNumber: block.number,
          },
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error(`Error processing transaction ${txResponse.hash}:`, error);
      }
    }
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Block monitoring stopped');
  }

  isRunning(): boolean {
    return this.isMonitoring;
  }

  getLatestBlock(): number {
    return this.latestBlock;
  }
}

export const blockMonitorService = new BlockMonitorService();
