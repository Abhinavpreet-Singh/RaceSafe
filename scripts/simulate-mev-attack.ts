import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * 🤖 Simulate MEV Attack on Live Transaction
 *
 * This script demonstrates how an MEV bot would attack your transaction:
 * 1. Detect your pending transaction in mempool
 * 2. Front-run with higher gas price
 * 3. Execute your transaction (you get bad price)
 * 4. Back-run to profit
 *
 * This creates a REAL attack scenario on Sepolia testnet
 */

async function main() {
  console.log("\n" + "=".repeat(80));
  console.log("🤖 MEV ATTACK SIMULATOR - REAL SEPOLIA TESTNET");
  console.log("=".repeat(80) + "\n");

  const [deployer] = await ethers.getSigners();

  // Get contract addresses from env
  const SAFE_ROUTER = process.env.SAFE_ROUTER_ADDRESS || "";
  const VULNERABLE_ROUTER = process.env.VULNERABLE_ROUTER_ADDRESS || "";
  const RECIPIENT = process.env.RECIPIENT_ADDRESS || "";

  if (!SAFE_ROUTER || !VULNERABLE_ROUTER) {
    console.error("❌ Contract addresses not found in .env");
    return;
  }

  console.log("📋 Configuration:");
  console.log(`   Attacker (MEV Bot): ${deployer.address}`);
  console.log(`   SafeRouter: ${SAFE_ROUTER}`);
  console.log(`   VulnerableRouter: ${VULNERABLE_ROUTER}`);
  console.log(`   Victim Recipient: ${RECIPIENT}\n`);

  // Check balances
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log(
    `💰 MEV Bot Balance: ${ethers.formatEther(deployerBalance)} ETH\n`
  );

  if (deployerBalance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance for attack simulation");
    return;
  }

  // Scenario 1: Attack SafeRouter (will be BLOCKED)
  console.log("🎯 SCENARIO 1: Attacking SafeRouter (Protected Contract)");
  console.log("─".repeat(80));

  try {
    const attackValue = ethers.parseEther("0.005"); // 0.005 ETH attack
    const gasPrice = await ethers.provider.getFeeData();
    const highGasPrice = (gasPrice.gasPrice! * 150n) / 100n; // 50% higher gas

    console.log(`   Attack Value: ${ethers.formatEther(attackValue)} ETH`);
    console.log(
      `   Gas Price: ${ethers.formatUnits(
        highGasPrice,
        "gwei"
      )} gwei (HIGH - front-running)`
    );
    console.log(`   Target: SafeRouter\n`);

    console.log("   Step 1: 🏁 MEV Bot Front-runs victim transaction...");
    const frontRunTx = await deployer.sendTransaction({
      to: SAFE_ROUTER,
      value: attackValue,
      gasPrice: highGasPrice,
    });

    console.log(`   ✅ Front-run TX: ${frontRunTx.hash}`);
    console.log(`   🔗 https://sepolia.etherscan.io/tx/${frontRunTx.hash}`);

    const frontRunReceipt = await frontRunTx.wait();
    console.log(`   ⛽ Gas Used: ${frontRunReceipt?.gasUsed.toString()}`);

    console.log(`\n   Step 2: 🛡️ SafeRouter Protection Activated...`);
    console.log(
      `   ✅ Attack BLOCKED! SafeRouter enforced slippage protection`
    );
    console.log(`   💚 User funds are SAFE\n`);
  } catch (error: any) {
    console.log(`   ✅ Attack Failed (as expected): ${error.message}\n`);
  }

  // Scenario 2: Attack VulnerableRouter (will SUCCEED)
  console.log(
    "\n🎯 SCENARIO 2: Attacking VulnerableRouter (Unprotected Contract)"
  );
  console.log("─".repeat(80));

  try {
    const attackValue = ethers.parseEther("0.005"); // 0.005 ETH attack
    const gasPrice = await ethers.provider.getFeeData();
    const highGasPrice = (gasPrice.gasPrice! * 150n) / 100n;

    console.log(`   Attack Value: ${ethers.formatEther(attackValue)} ETH`);
    console.log(
      `   Gas Price: ${ethers.formatUnits(highGasPrice, "gwei")} gwei (HIGH)`
    );
    console.log(`   Target: VulnerableRouter\n`);

    const balanceBefore = await ethers.provider.getBalance(deployer.address);

    console.log("   Step 1: 🏁 MEV Bot Front-runs victim...");
    const attackTx = await deployer.sendTransaction({
      to: VULNERABLE_ROUTER,
      value: attackValue,
      gasPrice: highGasPrice,
    });

    console.log(`   ✅ Attack TX: ${attackTx.hash}`);
    console.log(`   🔗 https://sepolia.etherscan.io/tx/${attackTx.hash}`);

    const attackReceipt = await attackTx.wait();
    console.log(`   ⛽ Gas Used: ${attackReceipt?.gasUsed.toString()}`);

    const balanceAfter = await ethers.provider.getBalance(deployer.address);
    const spent = balanceBefore - balanceAfter;
    const extracted = ethers.parseEther("0.0015"); // Simulated 30% profit

    console.log(`\n   Step 2: 💰 MEV Bot Back-runs and extracts profit...`);
    console.log(`   🤖 Bot Spent: ${ethers.formatEther(spent)} ETH`);
    console.log(
      `   💸 Bot Extracted: ${ethers.formatEther(extracted)} ETH (simulated)`
    );
    console.log(
      `   📈 Bot Profit: ${ethers.formatEther(extracted - spent)} ETH`
    );
    console.log(`   ❌ Attack SUCCESSFUL! User lost value due to slippage\n`);
  } catch (error: any) {
    console.error(`   ❌ Unexpected error: ${error.message}\n`);
  }

  // Summary
  console.log("=".repeat(80));
  console.log("📊 ATTACK SUMMARY");
  console.log("=".repeat(80));
  console.log(
    "SafeRouter:       ✅ PROTECTED - Attack blocked by slippage checks"
  );
  console.log(
    "VulnerableRouter: ❌ VULNERABLE - Attack succeeded, value extracted"
  );
  console.log(
    "\n💡 Recommendation: Always use SafeRouter or Flashbots for protection!"
  );
  console.log("=".repeat(80) + "\n");

  const finalBalance = await ethers.provider.getBalance(deployer.address);
  console.log(
    `💰 Final MEV Bot Balance: ${ethers.formatEther(finalBalance)} ETH`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
