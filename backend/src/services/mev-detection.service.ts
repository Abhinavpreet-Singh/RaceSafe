import { ethers } from 'ethers';
import { MEVDetection, Transaction } from '../types';
import { config } from '../config';

class MEVDetectionService {
  private detectedMEV: MEVDetection[] = [];
  private readonly UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  private readonly UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

  /**
   * Analyze transaction for MEV patterns
   */
  async detectMEV(tx: ethers.TransactionResponse, block: ethers.Block): Promise<MEVDetection | null> {
    try {
      // Check for sandwich attacks
      const sandwichDetection = this.detectSandwich(tx, block);
      if (sandwichDetection) return sandwichDetection;

      // Check for frontrunning
      const frontrunDetection = this.detectFrontrun(tx, block);
      if (frontrunDetection) return frontrunDetection;

      // Check for arbitrage
      const arbitrageDetection = this.detectArbitrage(tx);
      if (arbitrageDetection) return arbitrageDetection;

      // Check for liquidation
      const liquidationDetection = this.detectLiquidation(tx);
      if (liquidationDetection) return liquidationDetection;

      return null;
    } catch (error) {
      console.error('Error in MEV detection:', error);
      return null;
    }
  }

  /**
   * Detect sandwich attacks
   */
  private detectSandwich(tx: ethers.TransactionResponse, block: ethers.Block): MEVDetection | null {
    if (!block.transactions || block.transactions.length < 3) return null;

    const txIndex = block.transactions.findIndex((t) => 
      typeof t === 'string' ? t === tx.hash : (t as ethers.TransactionResponse).hash === tx.hash
    );

    if (txIndex === -1 || txIndex === 0 || txIndex === block.transactions.length - 1) {
      return null;
    }

    // Check if transaction interacts with DEX
    const isDEXInteraction = this.isDEXTransaction(tx);
    if (!isDEXInteraction) return null;

    // Look for suspicious patterns: same sender before and after
    const prevTx = block.transactions[txIndex - 1];
    const nextTx = block.transactions[txIndex + 1];

    if (typeof prevTx === 'string' || typeof nextTx === 'string') return null;

    const prevTxResponse = prevTx as ethers.TransactionResponse;
    const nextTxResponse = nextTx as ethers.TransactionResponse;

    // Simple heuristic: same from address in prev/next tx
    if (prevTxResponse.from === nextTxResponse.from && prevTxResponse.from !== tx.from) {
      const confidence = this.calculateConfidence([
        isDEXInteraction,
        (prevTxResponse.gasPrice || BigInt(0)) > (tx.gasPrice || BigInt(0)),
        (nextTxResponse.gasPrice || BigInt(0)) < (tx.gasPrice || BigInt(0)),
      ]);

      if (confidence >= config.mevDetectionThreshold) {
        const detection: MEVDetection = {
          transactionHash: tx.hash,
          mevType: 'sandwich',
          severity: 'high',
          confidence,
          targetedUser: tx.from,
          timestamp: Date.now(),
        };

        this.detectedMEV.push(detection);
        return detection;
      }
    }

    return null;
  }

  /**
   * Detect frontrunning
   */
  private detectFrontrun(tx: ethers.TransactionResponse, block: ethers.Block): MEVDetection | null {
    if (!block.transactions || block.transactions.length < 2) return null;

    const txIndex = block.transactions.findIndex((t) => 
      typeof t === 'string' ? t === tx.hash : (t as ethers.TransactionResponse).hash === tx.hash
    );

    if (txIndex === -1 || txIndex === 0) return null;

    const prevTx = block.transactions[txIndex - 1];
    if (typeof prevTx === 'string') return null;

    const prevTxResponse = prevTx as ethers.TransactionResponse;

    // Check if both transactions interact with same contract
    const sameTarget = prevTxResponse.to === tx.to;
    const higherGasPrice = (prevTxResponse.gasPrice || BigInt(0)) > (tx.gasPrice || BigInt(0));
    const isDEX = this.isDEXTransaction(tx);

    if (sameTarget && higherGasPrice && isDEX) {
      const confidence = this.calculateConfidence([sameTarget, higherGasPrice, isDEX]);

      if (confidence >= config.mevDetectionThreshold) {
        const detection: MEVDetection = {
          transactionHash: tx.hash,
          mevType: 'frontrun',
          severity: 'medium',
          confidence,
          targetedUser: tx.from,
          timestamp: Date.now(),
        };

        this.detectedMEV.push(detection);
        return detection;
      }
    }

    return null;
  }

  /**
   * Detect arbitrage opportunities
   */
  private detectArbitrage(tx: ethers.TransactionResponse): MEVDetection | null {
    // Check for multiple DEX interactions in single transaction
    const isComplexDEX = tx.data.length > 1000 && this.isDEXTransaction(tx);
    const highValue = tx.value > ethers.parseEther('10');

    if (isComplexDEX || highValue) {
      const confidence = this.calculateConfidence([isComplexDEX, highValue]);

      if (confidence >= 0.5) {
        const detection: MEVDetection = {
          transactionHash: tx.hash,
          mevType: 'arbitrage',
          severity: 'low',
          confidence,
          timestamp: Date.now(),
        };

        this.detectedMEV.push(detection);
        return detection;
      }
    }

    return null;
  }

  /**
   * Detect liquidations
   */
  private detectLiquidation(tx: ethers.TransactionResponse): MEVDetection | null {
    // Check for common lending protocol interactions
    const lendingProtocols = [
      '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', // Aave V2
      '0x398eC7346DcD622eDc5ae82352F02bE94C62d119', // Compound
    ];

    const isLendingProtocol = lendingProtocols.includes(tx.to?.toLowerCase() || '');
    const methodId = tx.data.slice(0, 10);
    const isLiquidation = methodId === '0x00a718a9'; // liquidationCall

    if (isLendingProtocol && isLiquidation) {
      const detection: MEVDetection = {
        transactionHash: tx.hash,
        mevType: 'liquidation',
        severity: 'medium',
        confidence: 0.9,
        timestamp: Date.now(),
      };

      this.detectedMEV.push(detection);
      return detection;
    }

    return null;
  }

  /**
   * Check if transaction interacts with DEX
   */
  private isDEXTransaction(tx: ethers.TransactionResponse): boolean {
    const dexAddresses = [
      this.UNISWAP_V2_ROUTER.toLowerCase(),
      this.UNISWAP_V3_ROUTER.toLowerCase(),
      '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'.toLowerCase(), // Sushiswap
      '0x1111111254fb6c44bAC0beD2854e76F90643097d'.toLowerCase(), // 1inch
    ];

    return dexAddresses.includes(tx.to?.toLowerCase() || '');
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(indicators: boolean[]): number {
    const trueCount = indicators.filter(Boolean).length;
    return trueCount / indicators.length;
  }

  /**
   * Get all detected MEV
   */
  getDetectedMEV(): MEVDetection[] {
    return this.detectedMEV;
  }

  /**
   * Get MEV statistics
   */
  getStatistics() {
    const total = this.detectedMEV.length;
    const byType = this.detectedMEV.reduce((acc, detection) => {
      acc[detection.mevType] = (acc[detection.mevType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.detectedMEV.reduce((acc, detection) => {
      acc[detection.severity] = (acc[detection.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byType, bySeverity };
  }

  /**
   * Clear old detections (older than 1 hour)
   */
  clearOldDetections(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.detectedMEV = this.detectedMEV.filter((d) => d.timestamp > oneHourAgo);
  }
}

export const mevDetectionService = new MEVDetectionService();
