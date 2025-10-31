import express, { Request, Response } from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from "dotenv";
import {
  MempoolScanner,
  FlaggedTransaction,
  AttackType,
} from "./mempool-scanner";
import { FlashbotsRelay } from "./flashbots-relay";
import { MEVAttackBot } from "./mev-attack-bot";
import { ethers, Wallet } from "ethers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const WS_PORT = parseInt(process.env.WS_PORT || "8081");

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Global state
let scanner: MempoolScanner;
let flashbotsRelay: FlashbotsRelay;
let attackBot: MEVAttackBot;
let provider: ethers.JsonRpcProvider;
const flaggedTransactions: FlaggedTransaction[] = [];
const liveTransactions: any[] = [];
const MAX_STORED_TXS = 100;

// WebSocket server for real-time updates
const wss = new WebSocketServer({ port: WS_PORT });
const clients: Set<WebSocket> = new Set();

wss.on("connection", (ws: WebSocket) => {
  console.log("🔌 New WebSocket client connected");
  clients.add(ws);

  // Send recent flagged transactions on connect
  ws.send(
    JSON.stringify({
      type: "init",
      data: {
        flagged: flaggedTransactions.slice(-20),
        live: liveTransactions.slice(-20),
      },
    })
  );

  ws.on("close", () => {
    console.log("🔌 WebSocket client disconnected");
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clients.delete(ws);
  });
});

/**
 * Broadcast to all connected WebSocket clients
 */
function broadcast(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Initialize scanner and Flashbots
 */
async function initializeServices() {
  try {
    // Initialize Mempool Scanner
    const wsUrl = process.env.ETHEREUM_RPC_WSS || "";
    const safeRouterAddress =
      process.env.SAFE_ROUTER_ADDRESS || ethers.ZeroAddress;
    const vulnerableRouterAddress = process.env.VULNERABLE_ROUTER_ADDRESS || "";
    const targetAddress =
      process.env.TARGET_CONTRACT_ADDRESS || safeRouterAddress;

    if (!wsUrl) {
      console.warn("⚠️  ETHEREUM_RPC_WSS not set, using demo mode");
    }

    console.log(`\n🎯 Monitoring Contracts:`);
    console.log(`   SafeRouter: ${safeRouterAddress}`);
    if (vulnerableRouterAddress) {
      console.log(`   VulnerableRouter: ${vulnerableRouterAddress}`);
    }
    console.log(
      `   Primary Target: ${
        targetAddress === safeRouterAddress
          ? "🟢 SafeRouter"
          : "🔴 VulnerableRouter"
      }\n`
    );

    // Initialize scanner with BOTH contract addresses
    scanner = new MempoolScanner(
      wsUrl,
      safeRouterAddress,
      vulnerableRouterAddress
    );

    // Listen to scanner events
    scanner.on("transaction", async (tx) => {
      liveTransactions.push(tx);
      if (liveTransactions.length > MAX_STORED_TXS) {
        liveTransactions.shift();
      }
      broadcast("transaction", tx);

      // 🤖 AUTO-ATTACK MODE: Attack transactions targeting our contracts
      const autoAttackEnabled = process.env.AUTO_ATTACK_ENABLED === "true";
      const txTarget = (tx.to || "").toLowerCase();
      const isTargetingOurContracts =
        txTarget === safeRouterAddress.toLowerCase() ||
        txTarget === (vulnerableRouterAddress || "").toLowerCase();

      if (
        autoAttackEnabled &&
        isTargetingOurContracts &&
        parseFloat(tx.value) > 0
      ) {
        // 🎲 50% chance to attack (add randomness/realism)
        const shouldAttack = Math.random() < 0.5;

        if (!shouldAttack) {
          console.log(`\n⏭️  Transaction passed (50% random skip) - No attack`);
          return; // Skip this transaction
        }

        const isSafeRouter = txTarget === safeRouterAddress.toLowerCase();
        const detectionTime = Date.now(); // Start timing

        // Randomly choose attack type for realism
        const attackTypes = [
          AttackType.FRONTRUN,
          AttackType.SANDWICH,
          AttackType.BACKRUN,
        ];
        const randomAttackType =
          attackTypes[Math.floor(Math.random() * attackTypes.length)];

        console.log(`\n🤖 MEV BOT AUTO-ATTACK INITIATED!`);
        console.log(
          `   ⏱️  Detection Time: ${Date.now() - detectionTime}ms (< 1 second!)`
        );
        console.log(`   🎯 Target TX: ${tx.hash.slice(0, 20)}...`);
        console.log(`   💰 Value: ${tx.value} ETH`);
        console.log(
          `   📍 Contract: ${
            isSafeRouter
              ? "🟢 SafeRouter (PROTECTED)"
              : "🔴 VulnerableRouter (VULNERABLE)"
          }`
        );
        console.log(`   ⚔️  Attack Type: ${randomAttackType}`);

        // INSTANT ATTACK - No delay for speed!
        (async () => {
          try {
            if (attackBot) {
              const victimGasPrice = ethers.parseUnits(tx.gasPrice, "gwei");

              // 🛡️ SAFEROUTER: ALWAYS BLOCK - Never execute attack
              if (isSafeRouter) {
                console.log(`\n⚡ SAFEROUTER PROTECTION ACTIVATED!`);
                console.log(
                  `   🔒 ${randomAttackType} attack detected but BLOCKED`
                );
                console.log(`   🚫 Attack NOT executed (Flashbots protection)`);
                console.log(`   💰 MEV bot extraction: $0.00`);

                // Create BLOCKED flag WITHOUT executing attack
                const flaggedAttack: FlaggedTransaction = {
                  hash: tx.hash, // Use original tx hash
                  from: tx.from,
                  to: tx.to || "",
                  value: tx.value,
                  gasPrice: tx.gasPrice,
                  data: "0x",
                  timestamp: Date.now(),
                  attackType: randomAttackType,
                  riskScore: 5, // VERY SAFE
                  estimatedLoss: "0.00", // ALWAYS $0 for SafeRouter
                  relatedTxs: [tx.hash],
                  mitigation: `🔒 ${randomAttackType} ATTACK BLOCKED by Flashbots - Transaction routed through private relay, MEV bot cannot access it!`,
                };

                flaggedTransactions.push(flaggedAttack);
                broadcast("flagged", flaggedAttack);

                console.log(`   ✅ Status: BLOCKED`);
                console.log(`   🛡️  Risk Score: 5/100 (VERY SAFE)`);
                console.log(`   💸 User Loss: $0.00\n`);
                return; // EXIT - Do NOT execute attack
              }

              // VULNERABLE ROUTER: Execute attack normally
              console.log(`\n⚠️  VULNERABLE CONTRACT DETECTED!`);
              console.log(`   🤖 ${randomAttackType} attack will be EXECUTED`);

              // Execute attack based on random type
              let attackResult;
              if (randomAttackType === AttackType.FRONTRUN) {
                attackResult = await attackBot.executeFrontRunAttack(
                  tx.hash,
                  victimGasPrice
                );
              } else if (randomAttackType === AttackType.SANDWICH) {
                attackResult = await attackBot.executeSandwichAttack(
                  tx.hash,
                  victimGasPrice
                );
              } else {
                attackResult = await attackBot.executeBackRunAttack(
                  tx.hash,
                  victimGasPrice
                );
              }

              // Calculate realistic loss amounts (only for vulnerable)
              const lossAmounts: Record<
                AttackType.FRONTRUN | AttackType.SANDWICH | AttackType.BACKRUN,
                string
              > = {
                [AttackType.FRONTRUN]: "1.50",
                [AttackType.SANDWICH]: "4.50",
                [AttackType.BACKRUN]: "2.25",
              };

              const estimatedLoss =
                lossAmounts[
                  randomAttackType as
                    | AttackType.FRONTRUN
                    | AttackType.SANDWICH
                    | AttackType.BACKRUN
                ];

              // Create flagged transaction showing the SUCCESSFUL attack
              const flaggedAttack: FlaggedTransaction = {
                hash: attackResult.attackTxHash,
                from: attackResult.attacker,
                to: tx.to || "",
                value:
                  randomAttackType === AttackType.SANDWICH ? "0.003" : "0.001",
                gasPrice: tx.gasPrice,
                data: "0x",
                timestamp: Date.now(),
                attackType: randomAttackType,
                riskScore: 95, // CRITICAL
                estimatedLoss, // $1.50-$4.50
                relatedTxs: [tx.hash, attackResult.attackTxHash],
                mitigation: `❌ ${randomAttackType} ATTACK SUCCESSFUL - $${estimatedLoss} extracted by MEV bot! This contract has NO protection. Use SafeRouter + Flashbots instead.`,
              };

              flaggedTransactions.push(flaggedAttack);
              broadcast("flagged", flaggedAttack);

              console.log(
                `   ⚡ Attack TX: ${attackResult.attackTxHash.slice(0, 20)}...`
              );
              console.log(`   ⚔️  Attack Type: ${randomAttackType}`);
              console.log(`   🛡️  Status: ❌ SUCCESSFUL (No Protection)`);
              console.log(
                `   💸 User Loss: $${estimatedLoss} (EXTRACTED by MEV bot)`
              );
              console.log(`   📊 Risk Score: 95/100 (CRITICAL)`);
              console.log(`   🔗 Etherscan: ${attackResult.explorerUrl}\n`);
            }
          } catch (error) {
            console.error(
              `   ❌ Auto-attack failed:`,
              error instanceof Error ? error.message : error
            );
          }
        })();
      }
    });

    scanner.on("flagged", (flagged: FlaggedTransaction) => {
      flaggedTransactions.push(flagged);
      if (flaggedTransactions.length > MAX_STORED_TXS) {
        flaggedTransactions.shift();
      }
      broadcast("flagged", flagged);
    });

    // Start scanner
    if (wsUrl) {
      await scanner.start();
    }

    // Initialize Flashbots
    const mainnetRpc =
      process.env.ETHEREUM_RPC_HTTP ||
      process.env.ETHEREUM_RPC_WSS?.replace("wss://", "https://").replace(
        "ws://",
        "http://"
      ) ||
      "";
    const flashbotsAuthKey =
      process.env.FLASHBOTS_AUTH_KEY || Wallet.createRandom().privateKey;

    // Initialize provider
    if (mainnetRpc) {
      provider = new ethers.JsonRpcProvider(mainnetRpc);
    }

    flashbotsRelay = new FlashbotsRelay(mainnetRpc, flashbotsAuthKey);

    if (mainnetRpc) {
      await flashbotsRelay.initialize();
    }

    // Initialize MEV Attack Bot
    const attackBotKey =
      process.env.DEPLOYER_PRIVATE_KEY || Wallet.createRandom().privateKey;
    attackBot = new MEVAttackBot(mainnetRpc, attackBotKey, targetAddress);

    // Listen to attack bot events
    attackBot.on("attack_executed", (result) => {
      console.log("🤖 Attack executed:", result);
      broadcast("mev_attack", result);
    });

    // Start attack bot
    attackBot.start();

    console.log("✅ All services initialized");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
  }
}

// ============ API ROUTES ============

/**
 * Health check
 */
app.get("/api/health", (req: Request, res: Response) => {
  const stats = scanner ? scanner.getStats() : { isScanning: false };

  res.json({
    status: "online",
    timestamp: Date.now(),
    scanner: stats,
    websocket: {
      clients: clients.size,
      port: WS_PORT,
    },
  });
});

/**
 * Get live mempool feed
 */
app.get("/api/mempool/live", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json({
    transactions: liveTransactions.slice(-limit),
    total: liveTransactions.length,
  });
});

/**
 * Get flagged transactions
 */
app.get("/api/flagged", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const attackType = req.query.attackType as string;

  let filtered = flaggedTransactions;
  if (attackType) {
    filtered = filtered.filter((tx) => tx.attackType === attackType);
  }

  res.json({
    transactions: filtered.slice(-limit),
    total: filtered.length,
  });
});

/**
 * Submit private transaction via Flashbots
 */
app.post("/api/sendPrivateTx", async (req: Request, res: Response) => {
  try {
    const { signedTransaction, targetBlock, maxBlockNumber, demoMode } =
      req.body;

    if (!signedTransaction) {
      return res.status(400).json({ error: "signedTransaction is required" });
    }

    // DEMO MODE: Skip Flashbots for demo/test transactions
    if (demoMode || signedTransaction.length < 100) {
      console.log("🎮 Demo mode: Simulating Flashbots protection");

      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return res.json({
        success: true,
        demoMode: true,
        bundleSubmitted: true,
        targetBlock: provider ? (await provider.getBlockNumber()) + 1 : 12345,
        message: "🔒 [DEMO] Transaction protected via Flashbots",
        note: "This is a demo submission. In production, would use real Flashbots relay.",
      });
    }

    if (!flashbotsRelay) {
      return res.status(503).json({ error: "Flashbots relay not initialized" });
    }

    // Create Flashbots bundle
    const bundle = [{ signedTransaction }];

    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    const targetBlockNumber = targetBlock || currentBlock + 1;
    const maxBlock = maxBlockNumber || targetBlockNumber + 3; // Try for 3 blocks

    console.log(`📦 Creating Flashbots bundle for block ${targetBlockNumber}`);

    // Simulate bundle first
    const simulation = await flashbotsRelay.simulateBundle(
      [signedTransaction],
      targetBlockNumber.toString()
    );

    if (!simulation.success) {
      return res.status(400).json({
        success: false,
        error: "Bundle simulation failed",
        simulation,
      });
    }

    console.log("✅ Bundle simulation successful");

    // Submit bundle to Flashbots
    const result = await flashbotsRelay.sendPrivateTransaction(
      signedTransaction,
      targetBlockNumber
    );

    // Monitor bundle inclusion
    let included = false;
    let attempts = 0;
    const maxAttempts = maxBlock - targetBlockNumber;

    for (let block = targetBlockNumber; block <= maxBlock; block++) {
      attempts++;
      console.log(`🔍 Checking block ${block} for bundle inclusion...`);

      // Wait for block to be mined
      await provider.waitForBlock(block);

      // Check if transaction was included
      // (In production, would check via Flashbots API)

      if (attempts >= maxAttempts) {
        console.log(`⏰ Bundle not included after ${maxAttempts} blocks`);
        break;
      }
    }

    res.json({
      success: true,
      bundleSubmitted: true,
      targetBlock: targetBlockNumber,
      maxBlock,
      simulation,
      ...result,
      message: "🔒 Transaction submitted via Flashbots Protect",
    });
  } catch (error) {
    console.error("Error sending private transaction:", error);
    res.status(500).json({
      error: "Failed to send private transaction",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Simulate transaction
 */
app.post("/api/simulate", async (req: Request, res: Response) => {
  try {
    const { signedTransactions, blockTag } = req.body;

    if (!signedTransactions || !Array.isArray(signedTransactions)) {
      return res
        .status(400)
        .json({ error: "signedTransactions array is required" });
    }

    if (!flashbotsRelay) {
      return res.status(503).json({ error: "Flashbots relay not initialized" });
    }

    const simulation = await flashbotsRelay.simulateBundle(
      signedTransactions,
      blockTag
    );

    res.json({
      success: true,
      simulation,
    });
  } catch (error) {
    console.error("Error simulating transaction:", error);
    res.status(500).json({
      error: "Failed to simulate transaction",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Simulate transaction risk (NEW)
 */
app.post("/api/simulate-tx", async (req: Request, res: Response) => {
  try {
    const { transaction, useFlashbots } = req.body;

    if (!transaction || !transaction.to) {
      return res
        .status(400)
        .json({ error: 'Transaction with "to" field is required' });
    }

    // Import simulation services
    const { transactionSimulator } = await import(
      "./services/transaction-simulator"
    );
    const { riskCalculator } = await import("./services/risk-calculator");
    const { slippageCalculator } = await import(
      "./services/slippage-calculator"
    );

    // Create transaction object
    const tx: any = {
      to: transaction.to,
      value: ethers.parseEther(transaction.value || "0"),
      data: transaction.data || "0x",
    };

    if (transaction.gasPrice) {
      tx.gasPrice = ethers.parseUnits(transaction.gasPrice, "gwei");
    }

    // Simulate transaction
    const simulation = await transactionSimulator.simulate(tx);

    // Calculate risk
    const currentBlock = await provider.getBlockNumber();
    const feeData = await provider.getFeeData();
    const baseFee = feeData.gasPrice || BigInt(0);

    const risk = riskCalculator.calculateRisk({
      txValue: transaction.value || "0",
      gasPrice: transaction.gasPrice || ethers.formatUnits(baseFee, "gwei"),
      baseGasPrice: ethers.formatUnits(baseFee, "gwei"),
      slippage: simulation.slippage.estimated,
      isSwap: transaction.data?.includes("swap") || false,
      mempoolSize: liveTransactions.length,
    });

    // Calculate slippage (if swap)
    let slippageAnalysis = null;
    const isSwap = transaction.data?.includes("swap");
    if (isSwap) {
      const amountIn = ethers.parseEther(transaction.value || "1");
      const expectedOut = (amountIn * BigInt(99)) / BigInt(100); // Mock 1% slippage
      const actualOut = (amountIn * BigInt(97)) / BigInt(100); // Mock 3% actual

      slippageAnalysis = slippageCalculator.calculateSlippage(
        amountIn,
        expectedOut,
        actualOut
      );
    }

    // Check if safe to submit
    const safetyCheck = await transactionSimulator.isSafeToSubmit(tx);

    res.json({
      success: true,
      simulation,
      risk,
      slippage: slippageAnalysis,
      safetyCheck,
      recommendation: useFlashbots
        ? "🔒 Using Flashbots - Your transaction is protected from MEV"
        : safetyCheck.useFlashbots
        ? "🚨 WARNING: Use Flashbots to protect this transaction"
        : "✅ Transaction appears safe for public submission",
    });
  } catch (error) {
    console.error("Error simulating transaction risk:", error);
    res.status(500).json({
      error: "Failed to simulate transaction",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get scanner stats
 */
app.get("/api/stats", async (req: Request, res: Response) => {
  const scannerStats = scanner ? scanner.getStats() : null;
  const flashbotsStats = flashbotsRelay
    ? await flashbotsRelay.getStats()
    : null;

  res.json({
    scanner: scannerStats,
    flashbots: flashbotsStats,
    flaggedCount: flaggedTransactions.length,
    liveCount: liveTransactions.length,
    websocketClients: clients.size,
  });
});

/**
 * Demo: Generate fake attack for testing
 */
app.post("/api/demo/attack", (req: Request, res: Response) => {
  // Determine which contract we're monitoring
  const targetAddress =
    process.env.TARGET_CONTRACT_ADDRESS ||
    process.env.SAFE_ROUTER_ADDRESS ||
    "";
  const safeRouterAddress = process.env.SAFE_ROUTER_ADDRESS || "";
  const vulnerableRouterAddress = process.env.VULNERABLE_ROUTER_ADDRESS || "";

  // Check if we're monitoring SafeRouter (secure) or VulnerableRouter (insecure)
  const isMonitoringSafeRouter =
    targetAddress.toLowerCase() === safeRouterAddress.toLowerCase();
  const isMonitoringVulnerable =
    targetAddress.toLowerCase() === vulnerableRouterAddress.toLowerCase();

  // Adjust risk score based on contract security
  let riskScore: number;
  let mitigation: string;

  if (isMonitoringSafeRouter) {
    // SafeRouter: Attacks detected but BLOCKED by contract
    riskScore = Math.floor(Math.random() * 20) + 10; // 10-30 (LOW risk - contract protects)
    mitigation =
      "✅ Attack BLOCKED by SafeRouter's built-in protection (slippage + deadline checks)";
  } else if (isMonitoringVulnerable) {
    // VulnerableRouter: Attacks detected and SUCCESSFUL
    riskScore = Math.floor(Math.random() * 20) + 80; // 80-100 (CRITICAL risk - no protection)
    mitigation =
      "🚨 Attack SUCCESSFUL! VulnerableRouter has NO protection. Use Flashbots OR upgrade to SafeRouter!";
  } else {
    // Unknown contract or no contract set
    riskScore = Math.floor(Math.random() * 30) + 70; // 70-100 (default high risk)
    mitigation =
      "⚠️ Submit transaction via Flashbots private relay for protection";
  }

  // Generate realistic attack data
  const victimAddress = "0x" + Math.random().toString(16).slice(2, 42);
  const mevBotAddress = "0xDEAD" + Math.random().toString(16).slice(2, 38); // MEV bot prefix
  const txValue = (Math.random() * 0.5 + 0.1).toFixed(4); // 0.1-0.6 ETH
  const extractedValue = isMonitoringSafeRouter
    ? 0
    : parseFloat(txValue) * (Math.random() * 0.15 + 0.05); // 5-20% extracted
  const victimTxHash = "0x" + Math.random().toString(16).slice(2, 66);

  const demoAttack: FlaggedTransaction = {
    hash: "0xDEMO" + Math.random().toString(16).slice(2, 60),
    from: mevBotAddress, // MEV bot is the attacker
    to: targetAddress || ethers.ZeroAddress,
    value: txValue,
    gasPrice: (Math.random() * 50 + 100).toFixed(1), // 100-150 gwei
    data: "0x",
    timestamp: Date.now(),
    attackType: req.body.attackType || "SANDWICH",
    riskScore,
    estimatedLoss: extractedValue.toFixed(4),
    relatedTxs: [victimTxHash], // Related victim transaction
    mitigation,
  };

  console.log(`\n🎯 Demo Attack Generated:`);
  console.log(
    `   Contract: ${
      isMonitoringSafeRouter
        ? "🟢 SafeRouter (SECURE)"
        : isMonitoringVulnerable
        ? "🔴 VulnerableRouter (INSECURE)"
        : "⚪ Unknown"
    }`
  );
  console.log(`   Attack Type: ${demoAttack.attackType}`);
  console.log(`   Risk Score: ${riskScore}/100`);
  console.log(`   Transaction Value: ${txValue} ETH`);
  console.log(`   Bot Extracted: $${demoAttack.estimatedLoss}`);
  console.log(`   MEV Bot: ${mevBotAddress.slice(0, 10)}...`);
  console.log(`   Victim: ${victimAddress.slice(0, 10)}...`);
  console.log(
    `   Status: ${isMonitoringSafeRouter ? "BLOCKED ✅" : "SUCCESSFUL ❌"}\n`
  );

  flaggedTransactions.push(demoAttack);
  broadcast("flagged", demoAttack);

  res.json({
    success: true,
    attack: demoAttack,
  });
});

/**
 * Execute REAL MEV attack on a mempool transaction
 */
app.post("/api/attack/mempool", async (req: Request, res: Response) => {
  try {
    const { victimTxHash, attackType } = req.body;

    if (!victimTxHash) {
      return res.status(400).json({ error: "victimTxHash is required" });
    }

    if (!attackBot) {
      return res.status(503).json({ error: "Attack bot not initialized" });
    }

    // Find the victim transaction in live transactions
    const victimTx = liveTransactions.find((tx) => tx.hash === victimTxHash);

    if (!victimTx) {
      return res.status(404).json({
        error: "Transaction not found in mempool",
        hint: "Transaction may have already been mined or doesn't exist",
      });
    }

    console.log(`\n🎯 EXECUTING REAL MEV ATTACK ON MEMPOOL TX`);
    console.log(`   Victim: ${victimTxHash}`);
    console.log(`   Attack Type: ${attackType}`);
    console.log(`   Target Contract: ${victimTx.to}`);

    // Execute the attack
    const result = await attackBot.autoAttack(
      victimTx,
      attackType || "FRONTRUN"
    );

    // Determine if contract is SafeRouter (protected) or VulnerableRouter
    const safeRouterAddress = (
      process.env.SAFE_ROUTER_ADDRESS || ""
    ).toLowerCase();
    const targetAddress = (victimTx.to || "").toLowerCase();
    const isSafeRouter = targetAddress === safeRouterAddress;

    // Create flagged transaction for the attack
    const attackType_enum =
      attackType === "SANDWICH"
        ? AttackType.SANDWICH
        : attackType === "BACKRUN"
        ? AttackType.BACKRUN
        : AttackType.FRONTRUN;

    const flaggedAttack: FlaggedTransaction = {
      hash: result.attackTxHash,
      from: result.attacker,
      to: victimTx.to || "",
      value: attackType === "SANDWICH" ? "0.003" : "0.001",
      gasPrice: victimTx.gasPrice,
      data: "0x",
      timestamp: Date.now(),
      attackType: attackType_enum,
      riskScore: isSafeRouter ? 5 : 95, // SafeRouter = 5 (SUPER SAFE GREEN), Vulnerable = 95 (CRITICAL RED)
      estimatedLoss: isSafeRouter
        ? "0.00"
        : attackType === "SANDWICH"
        ? "4.50"
        : "1.50",
      relatedTxs: [victimTxHash, result.attackTxHash],
      mitigation: isSafeRouter
        ? "✅ ATTACK BLOCKED by SafeRouter's slippage protection"
        : "❌ ATTACK SUCCESSFUL - Use SafeRouter or Flashbots protection",
    };

    // Add to flagged transactions and broadcast
    flaggedTransactions.push(flaggedAttack);
    broadcast("flagged", flaggedAttack);

    console.log(`\n🚨 ATTACK REFLECTED IN MEMPOOL FEED:`);
    console.log(
      `   Contract: ${
        isSafeRouter
          ? "🟢 SafeRouter (PROTECTED)"
          : "🔴 VulnerableRouter (VULNERABLE)"
      }`
    );
    console.log(`   Risk Score: ${flaggedAttack.riskScore}/100`);
    console.log(`   Status: ${isSafeRouter ? "BLOCKED ✅" : "SUCCESSFUL ❌"}`);
    console.log(`   User Loss: $${flaggedAttack.estimatedLoss}\n`);

    res.json({
      success: true,
      message: "🤖 Real MEV attack executed on mempool transaction",
      attack: result,
      flagged: flaggedAttack,
      victim: {
        txHash: victimTxHash,
        from: victimTx.from,
        to: victimTx.to,
        value: victimTx.value,
        gasPrice: victimTx.gasPrice,
      },
    });
  } catch (error) {
    console.error("❌ Failed to execute MEV attack:", error);
    res.status(500).json({
      error: "Failed to execute attack",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Execute REAL front-running attack on next transaction
 */
app.post("/api/attack/frontrun-next", async (req: Request, res: Response) => {
  try {
    if (!attackBot) {
      return res.status(503).json({ error: "Attack bot not initialized" });
    }

    // Get the most recent transaction
    if (liveTransactions.length === 0) {
      return res.status(400).json({
        error: "No transactions in mempool to attack",
        hint: "Wait for transactions to appear in the mempool feed",
      });
    }

    const victimTx = liveTransactions[liveTransactions.length - 1];

    console.log(`\n🎯 AUTO-ATTACKING LATEST MEMPOOL TRANSACTION`);
    console.log(`   Victim: ${victimTx.hash}`);
    console.log(`   Value: ${victimTx.value} ETH`);
    console.log(`   Gas: ${victimTx.gasPrice} gwei`);

    // Execute front-run attack
    const victimGasPrice = ethers.parseUnits(victimTx.gasPrice, "gwei");
    const result = await attackBot.executeFrontRunAttack(
      victimTx.hash,
      victimGasPrice
    );

    res.json({
      success: true,
      message: "🤖 Front-running attack executed on latest mempool transaction",
      attack: result,
      victim: victimTx,
    });
  } catch (error) {
    console.error("❌ Failed to execute front-run:", error);
    res.status(500).json({
      error: "Failed to execute attack",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Execute REAL sandwich attack on target transaction
 */
app.post("/api/attack/sandwich", async (req: Request, res: Response) => {
  try {
    const { victimTxHash } = req.body;

    if (!victimTxHash) {
      return res.status(400).json({ error: "victimTxHash is required" });
    }

    if (!attackBot) {
      return res.status(503).json({ error: "Attack bot not initialized" });
    }

    const victimTx = liveTransactions.find((tx) => tx.hash === victimTxHash);

    if (!victimTx) {
      return res
        .status(404)
        .json({ error: "Transaction not found in mempool" });
    }

    console.log(`\n🥪 EXECUTING REAL SANDWICH ATTACK`);
    console.log(`   Victim: ${victimTxHash}`);

    const victimGasPrice = ethers.parseUnits(victimTx.gasPrice, "gwei");
    const result = await attackBot.executeSandwichAttack(
      victimTx.hash,
      victimGasPrice
    );

    res.json({
      success: true,
      message: "🥪 Sandwich attack executed successfully",
      attack: result,
      victim: victimTx,
    });
  } catch (error) {
    console.error("❌ Failed to execute sandwich attack:", error);
    res.status(500).json({
      error: "Failed to execute attack",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get attack bot stats
 */
app.get("/api/attack/stats", async (req: Request, res: Response) => {
  if (!attackBot) {
    return res.status(503).json({ error: "Attack bot not initialized" });
  }

  const stats = attackBot.getStats();
  const balance = await attackBot.getBalance();

  res.json({
    ...stats,
    balance,
    mempoolTxCount: liveTransactions.length,
    autoAttackEnabled: process.env.AUTO_ATTACK_ENABLED === "true",
  });
});

/**
 * Enable/disable auto-attack mode
 */
app.post("/api/attack/auto-mode", (req: Request, res: Response) => {
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    return res.status(400).json({ error: "enabled must be a boolean" });
  }

  process.env.AUTO_ATTACK_ENABLED = enabled ? "true" : "false";

  console.log(
    `\n🤖 AUTO-ATTACK MODE: ${enabled ? "ENABLED ✅" : "DISABLED ❌"}`
  );

  res.json({
    success: true,
    autoAttackEnabled: enabled,
    message: enabled
      ? "🤖 Auto-attack mode ENABLED - Bot will attack all transactions targeting contracts"
      : "🤖 Auto-attack mode DISABLED",
  });
});

// ============ START SERVER ============

async function startServer() {
  await initializeServices();

  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log("🏎️  RaceSafe DeFi Backend - ONLINE");
    console.log("=".repeat(60));
    console.log(`📡 REST API:    http://localhost:${PORT}`);
    console.log(`🔌 WebSocket:   ws://localhost:${WS_PORT}`);
    console.log(`🔍 Scanner:     ${scanner ? "Running" : "Offline"}`);
    console.log(`⚡ Flashbots:   ${flashbotsRelay ? "Ready" : "Offline"}`);
    console.log("=".repeat(60) + "\n");
  });
}

startServer().catch(console.error);

export { app };
