import { ethers } from 'ethers';
import { config } from '../config';

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private isConnected: boolean = false;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
  }

  async initialize(): Promise<void> {
    try {
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      this.isConnected = true;
    } catch (error) {
      console.error('❌ Failed to connect to blockchain:', error);
      throw error;
    }
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Error getting block number:', error);
      throw error;
    }
  }

  async getBlock(blockNumber: number): Promise<ethers.Block | null> {
    try {
      return await this.provider.getBlock(blockNumber, true);
    } catch (error) {
      console.error(`Error getting block ${blockNumber}:`, error);
      return null;
    }
  }

  async getTransaction(txHash: string): Promise<ethers.TransactionResponse | null> {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      console.error(`Error getting transaction ${txHash}:`, error);
      return null;
    }
  }

  async getGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice || BigInt(0);
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw error;
    }
  }

  async estimateGas(transaction: ethers.TransactionRequest): Promise<bigint> {
    try {
      return await this.provider.estimateGas(transaction);
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<bigint> {
    try {
      return await this.provider.getBalance(address);
    } catch (error) {
      console.error(`Error getting balance for ${address}:`, error);
      throw error;
    }
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error(`Error getting receipt for ${txHash}:`, error);
      return null;
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}

export const blockchainService = new BlockchainService();
