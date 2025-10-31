import { ethers } from "ethers";
import { EventEmitter } from "events";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * MEV Attack Pattern Types
 */
export enum AttackType {
  SANDWICH = "SANDWICH",
  FRONTRUN = "FRONTRUN",
  BACKRUN = "BACKRUN",
  GAS_MANIPULATION = "GAS_MANIPULATION",
  UNKNOWN = "UNKNOWN",
}

/**
 * Flagged Transaction Interface
 */
export interface FlaggedTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  data: string;
  timestamp: number;
  attackType: AttackType;
  riskScore: number; // 0-100
  estimatedLoss: string;
  relatedTxs: string[]; // Related attack transactions
  mitigation: string;
}

/**
 * Mempool Transaction
 */
interface MempoolTx {
  hash: string;
  from: string;
  to: string;
  value: bigint;
  gasPrice: bigint;
  data: string;
  timestamp: number;
}

/**
 * MempoolScanner - Real-time mempool monitoring and MEV detection
 *
 * This class monitors the Ethereum mempool via WebSocket and detects
 * MEV attack patterns including:
 * - Sandwich attacks (front-run + back-run)
 * - Front-running
 * - Gas price manipulation
 */
export class MempoolScanner extends EventEmitter {
  private provider: ethers.WebSocketProvider;
  private targetContract: string;
  private vulnerableContract: string; // Add vulnerable contract tracking
  private pendingTxs: Map<string, MempoolTx> = new Map();
  private recentTxs: MempoolTx[] = [];
  private maxRecentTxs = 1000; // Keep last 1000 transactions
  private isScanning = false;

  constructor(
    wsUrl: string,
    targetContract: string,
    vulnerableContract?: string
  ) {
    super();
    this.provider = new ethers.WebSocketProvider(wsUrl);
    this.targetContract = targetContract.toLowerCase();
    this.vulnerableContract = (vulnerableContract || "").toLowerCase();

    console.log("🔍 MempoolScanner initialized");
    console.log("📡 WebSocket URL:", wsUrl.replace(/\/[^\/]+$/, "/***"));
    console.log("🎯 Monitoring SafeRouter:", targetContract);
    if (vulnerableContract) {
      console.log("🎯 Monitoring VulnerableRouter:", vulnerableContract);
    }
  }

  /**
   * Start scanning the mempool
   */
  async start(): Promise<void> {
    if (this.isScanning) {
      console.log("⚠️  Scanner already running");
      return;
    }

    this.isScanning = true;
    console.log("🏁 Starting mempool scanner...");

    try {
      // Subscribe to pending transactions
      this.provider.on("pending", async (txHash: string) => {
        try {
          await this.processPendingTransaction(txHash);
        } catch (error) {
          // Silently handle individual tx errors to prevent spam
          if (
            error instanceof Error &&
            !error.message.includes("transaction not found")
          ) {
            console.error("Error processing tx:", error.message);
          }
        }
      });

      // Periodically clean up old transactions
      setInterval(() => this.cleanupOldTransactions(), 60000); // Every minute

      console.log("✅ Mempool scanner started successfully");
      this.emit("started");
    } catch (error) {
      console.error("❌ Failed to start scanner:", error);
      this.isScanning = false;
      throw error;
    }
  }

  /**
   * Stop scanning
   */
  stop(): void {
    if (!this.isScanning) return;

    this.provider.removeAllListeners("pending");
    this.isScanning = false;
    console.log("⏹️  Mempool scanner stopped");
    this.emit("stopped");
  }

  /**
   * Process a pending transaction from the mempool
   */
  private async processPendingTransaction(txHash: string): Promise<void> {
    // Fetch transaction details
    const tx = await this.provider.getTransaction(txHash);

    if (!tx) return;

    // Check if transaction targets our contract
    const isTargeted = tx.to?.toLowerCase() === this.targetContract;

    if (!isTargeted && tx.to) {
      // Also check if data contains our contract address
      const dataLower = tx.data.toLowerCase();
      const contractLower = this.targetContract.toLowerCase().replace("0x", "");
      if (!dataLower.includes(contractLower)) {
        return; // Not relevant
      }
    }

    // Create mempool transaction record
    const mempoolTx: MempoolTx = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to || "",
      value: tx.value,
      gasPrice: tx.gasPrice || 0n,
      data: tx.data,
      timestamp: Date.now(),
    };

    // Store transaction
    this.pendingTxs.set(txHash, mempoolTx);
    this.recentTxs.push(mempoolTx);

    // Emit live transaction event
    this.emit("transaction", {
      hash: txHash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      gasPrice: ethers.formatUnits(tx.gasPrice || 0n, "gwei"),
      timestamp: mempoolTx.timestamp,
    });

    // Analyze for MEV patterns
    await this.analyzeMEVPattern(mempoolTx);
  }

  /**
   * Analyze transaction for MEV attack patterns
   * ONLY flag attacks targeting our deployed contracts!
   */
  private async analyzeMEVPattern(tx: MempoolTx): Promise<void> {
    // 🎯 FILTER: Only analyze transactions targeting our contracts
    const txTarget = (tx.to || "").toLowerCase();
    const isTargetingOurContracts =
      txTarget === this.targetContract || txTarget === this.vulnerableContract;

    // Skip if not targeting our contracts
    if (!isTargetingOurContracts) {
      return; // Ignore attacks on other contracts
    }

    const flags: FlaggedTransaction[] = [];

    // Pattern 1: Sandwich Attack Detection
    const sandwichAttack = this.detectSandwichAttack(tx);
    if (sandwichAttack) {
      flags.push(sandwichAttack);
    }

    // Pattern 2: Front-running Detection
    const frontRun = this.detectFrontRunning(tx);
    if (frontRun) {
      flags.push(frontRun);
    }

    // Pattern 3: Gas Manipulation
    const gasManip = this.detectGasManipulation(tx);
    if (gasManip) {
      flags.push(gasManip);
    }

    // Emit flagged transactions
    flags.forEach((flag) => {
      const contractType =
        txTarget === this.targetContract
          ? "🟢 SafeRouter"
          : "🔴 VulnerableRouter";
      console.log(
        `\n🚨 MEV ATTACK DETECTED: ${flag.attackType} (Risk: ${flag.riskScore}/100)`
      );
      console.log(`   Target: ${contractType}`);
      console.log(`   Tx: ${flag.hash}`);
      console.log(`   Attacker: ${flag.from}`);
      console.log(`   Estimated Loss: ${flag.estimatedLoss} ETH\n`);
      this.emit("flagged", flag);
    });
  }

  /**
   * Detect sandwich attack pattern
   *
   * Pattern: Two transactions from same address bracketing a victim transaction
   * - Front-run: Higher gas, buy before victim
   * - Back-run: Sell after victim
   */
  private detectSandwichAttack(tx: MempoolTx): FlaggedTransaction | null {
    // Look for transactions from same sender in recent history
    const recentFromSender = this.recentTxs.filter(
      (t) =>
        t.from === tx.from &&
        t.hash !== tx.hash &&
        tx.timestamp - t.timestamp < 30000 // Within 30 seconds
    );

    if (recentFromSender.length === 0) return null;

    // Check for bracketing pattern
    const hasHigherGas = recentFromSender.some((t) => t.gasPrice > tx.gasPrice);
    const targetsSameContract = recentFromSender.some((t) => t.to === tx.to);

    if (hasHigherGas && targetsSameContract) {
      // Potential sandwich attack
      const riskScore = this.calculateRiskScore(
        tx,
        recentFromSender,
        AttackType.SANDWICH
      );

      if (riskScore > 70) {
        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          gasPrice: ethers.formatUnits(tx.gasPrice, "gwei"),
          data: tx.data,
          timestamp: tx.timestamp,
          attackType: AttackType.SANDWICH,
          riskScore,
          estimatedLoss: this.estimateLoss(tx),
          relatedTxs: recentFromSender.map((t) => t.hash),
          mitigation:
            "Submit transaction via Flashbots private relay to bypass public mempool",
        };
      }
    }

    return null;
  }

  /**
   * Detect front-running
   *
   * Pattern: Similar transaction with higher gas price submitted shortly before
   */
  private detectFrontRunning(tx: MempoolTx): FlaggedTransaction | null {
    // Look for similar transactions with higher gas
    const similarTxs = this.recentTxs.filter((t) => {
      const timeDiff = tx.timestamp - t.timestamp;
      const isSimilarTarget = t.to === tx.to;
      const hasHigherGas = t.gasPrice > (tx.gasPrice * 110n) / 100n; // 10% higher
      const isRecent = timeDiff > 0 && timeDiff < 10000; // 10 seconds before

      return isSimilarTarget && hasHigherGas && isRecent && t.from !== tx.from;
    });

    if (similarTxs.length > 0) {
      const riskScore = this.calculateRiskScore(
        tx,
        similarTxs,
        AttackType.FRONTRUN
      );

      if (riskScore > 60) {
        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          gasPrice: ethers.formatUnits(tx.gasPrice, "gwei"),
          data: tx.data,
          timestamp: tx.timestamp,
          attackType: AttackType.FRONTRUN,
          riskScore,
          estimatedLoss: this.estimateLoss(tx),
          relatedTxs: similarTxs.map((t) => t.hash),
          mitigation: "Increase gas price or use private relay",
        };
      }
    }

    return null;
  }

  /**
   * Detect gas price manipulation
   */
  private detectGasManipulation(tx: MempoolTx): FlaggedTransaction | null {
    // Calculate average gas price from recent transactions
    const recentGasPrices = this.recentTxs
      .slice(-50)
      .map((t) => Number(ethers.formatUnits(t.gasPrice, "gwei")));

    if (recentGasPrices.length === 0) return null;

    const avgGas =
      recentGasPrices.reduce((a, b) => a + b, 0) / recentGasPrices.length;
    const currentGas = Number(ethers.formatUnits(tx.gasPrice, "gwei"));

    // Flag if gas is 3x average or more
    if (currentGas > avgGas * 3) {
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasPrice: ethers.formatUnits(tx.gasPrice, "gwei"),
        data: tx.data,
        timestamp: tx.timestamp,
        attackType: AttackType.GAS_MANIPULATION,
        riskScore: Math.min(100, Math.floor((currentGas / avgGas) * 30)),
        estimatedLoss: "0",
        relatedTxs: [],
        mitigation: "Transaction may be attempting to manipulate tx ordering",
      };
    }

    return null;
  }

  /**
   * Calculate risk score (0-100)
   */
  private calculateRiskScore(
    tx: MempoolTx,
    relatedTxs: MempoolTx[],
    attackType: AttackType
  ): number {
    let score = 0;

    // Base score by attack type
    const baseScores = {
      [AttackType.SANDWICH]: 80,
      [AttackType.FRONTRUN]: 70,
      [AttackType.GAS_MANIPULATION]: 50,
      [AttackType.BACKRUN]: 60,
      [AttackType.UNKNOWN]: 30,
    };

    score = baseScores[attackType];

    // Adjust based on number of related transactions
    score += Math.min(15, relatedTxs.length * 5);

    // Adjust based on gas price delta
    if (relatedTxs.length > 0) {
      const maxRelatedGas = relatedTxs.reduce(
        (max, t) => (t.gasPrice > max ? t.gasPrice : max),
        0n
      );
      const gasDelta =
        Number(maxRelatedGas - tx.gasPrice) / Number(tx.gasPrice);
      score += Math.min(10, Math.floor(gasDelta * 100));
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Estimate potential loss from MEV attack
   */
  private estimateLoss(tx: MempoolTx): string {
    // Simple heuristic: 1-5% of transaction value
    const loss = (tx.value * 3n) / 100n; // 3% estimated slippage
    return ethers.formatEther(loss);
  }

  /**
   * Clean up old transactions from memory
   */
  private cleanupOldTransactions(): void {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes

    // Clean pending transactions
    for (const [hash, tx] of this.pendingTxs.entries()) {
      if (now - tx.timestamp > maxAge) {
        this.pendingTxs.delete(hash);
      }
    }

    // Keep only recent transactions
    this.recentTxs = this.recentTxs.filter((tx) => now - tx.timestamp < maxAge);

    // Limit array size
    if (this.recentTxs.length > this.maxRecentTxs) {
      this.recentTxs = this.recentTxs.slice(-this.maxRecentTxs);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      isScanning: this.isScanning,
      pendingTxs: this.pendingTxs.size,
      recentTxs: this.recentTxs.length,
      targetContract: this.targetContract,
    };
  }
}
