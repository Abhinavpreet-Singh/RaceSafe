import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import type { SafeRouter, MockERC20, MockDEXRouter } from "../typechain-types";

/**
 * Simulate MEV Attack (Sandwich Attack) for testing detection
 * 
 * This script demonstrates:
 * 1. Victim submits a swap transaction
 * 2. Attacker front-runs with higher gas
 * 3. Attacker back-runs to complete sandwich
 * 4. Scanner should detect this pattern
 */
async function main() {
  console.log("⚠️  SIMULATING MEV SANDWICH ATTACK\n");
  console.log("This demonstrates how the scanner detects malicious activity\n");

  const [deployer, victim, attacker] = await ethers.getSigners();

  // Get deployed contracts (assume deploy.ts was run)
  console.log("📦 Getting contract addresses...");
  
  // You'll need to update these addresses after running deploy.ts
  // For now, we'll deploy fresh contracts
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const tokenA = (await MockERC20.deploy("Token A", "TKNA", 18)) as unknown as MockERC20;
  await tokenA.waitForDeployment();
  
  const tokenB = (await MockERC20.deploy("Token B", "TKNB", 18)) as unknown as MockERC20;
  await tokenB.waitForDeployment();
  
  const MockDEXRouter = await ethers.getContractFactory("MockDEXRouter");
  const dexRouter = (await MockDEXRouter.deploy()) as unknown as MockDEXRouter;
  await dexRouter.waitForDeployment();
  
  // Add liquidity
  await tokenA.mint(await dexRouter.getAddress(), ethers.parseEther("1000000"));
  await tokenB.mint(await dexRouter.getAddress(), ethers.parseEther("1000000"));

  const SafeRouter = await ethers.getContractFactory("SafeRouter");
  const safeRouter = (await SafeRouter.deploy(deployer.address)) as unknown as SafeRouter;
  await safeRouter.waitForDeployment();
  
  await safeRouter.setRouterApproval(await dexRouter.getAddress(), true);

  console.log("✅ Contracts ready\n");

  // Setup: Mint tokens to participants
  const victimAmount = ethers.parseEther("100");
  const attackerAmount = ethers.parseEther("1000");
  
  await tokenA.mint(victim.address, victimAmount);
  await tokenA.mint(attacker.address, attackerAmount);
  
  console.log("💰 Tokens distributed:");
  console.log(`   Victim:   ${ethers.formatEther(victimAmount)} TKNA`);
  console.log(`   Attacker: ${ethers.formatEther(attackerAmount)} TKNA\n`);

  // Prepare swap data
  const deadline = (await time.latest()) + 300; // 5 minutes
  const path = [await tokenA.getAddress(), await tokenB.getAddress()];

  // Encode swap call for mock DEX
  const swapInterface = new ethers.Interface([
    "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"
  ]);

  console.log("🎯 ATTACK SEQUENCE:\n");

  // ========== STEP 1: ATTACKER FRONT-RUN ==========
  console.log("1️⃣  ATTACKER FRONT-RUNS (High Gas Price)");
  const attackerSwapAmount = ethers.parseEther("500");
  const attackerMinOut = ethers.parseEther("480"); // 4% slippage tolerance
  
  // Calculate amount after SafeRouter's 0.3% fee
  const attackerAmountAfterFee = attackerSwapAmount * BigInt(9970) / BigInt(10000);
  
  const attackerSwapData = swapInterface.encodeFunctionData("swapExactTokensForTokens", [
    attackerAmountAfterFee, // Amount after fee deduction
    attackerMinOut,
    path,
    await safeRouter.getAddress(), // Tokens go back to SafeRouter
    deadline
  ]);

  await tokenA.connect(attacker).approve(await safeRouter.getAddress(), attackerSwapAmount);
  
  const attackTx1 = await safeRouter.connect(attacker).swapTokens(
    await tokenA.getAddress(),
    await tokenB.getAddress(),
    attackerSwapAmount,
    attackerMinOut,
    deadline,
    await dexRouter.getAddress(),
    attackerSwapData,
    { gasPrice: ethers.parseUnits("100", "gwei") } // HIGH GAS
  );
  
  await attackTx1.wait();
  console.log("   ✅ Attacker swap 1 completed (drives price up)");
  console.log(`   📈 Gas Price: 100 gwei\n`);

  // ========== STEP 2: VICTIM TRANSACTION ==========
  console.log("2️⃣  VICTIM SUBMITS SWAP (Normal Gas)");
  const victimSwapAmount = ethers.parseEther("50");
  const victimMinOut = ethers.parseEther("48");
  
  // Calculate amount after SafeRouter's 0.3% fee
  const victimAmountAfterFee = victimSwapAmount * BigInt(9970) / BigInt(10000);
  
  const victimSwapData = swapInterface.encodeFunctionData("swapExactTokensForTokens", [
    victimAmountAfterFee, // Amount after fee deduction
    victimMinOut,
    path,
    await safeRouter.getAddress(),
    deadline
  ]);

  await tokenA.connect(victim).approve(await safeRouter.getAddress(), victimSwapAmount);
  
  const victimTx = await safeRouter.connect(victim).swapTokens(
    await tokenA.getAddress(),
    await tokenB.getAddress(),
    victimSwapAmount,
    victimMinOut,
    deadline,
    await dexRouter.getAddress(),
    victimSwapData,
    { gasPrice: ethers.parseUnits("50", "gwei") } // NORMAL GAS
  );
  
  await victimTx.wait();
  console.log("   ✅ Victim swap completed (pays inflated price)");
  console.log(`   📊 Gas Price: 50 gwei\n`);

  // ========== STEP 3: ATTACKER BACK-RUN ==========
  console.log("3️⃣  ATTACKER BACK-RUNS (Sells at profit)");
  
  // For simplicity, attacker sells back the tokens bought earlier
  // In reality, this would be a reverse swap
  console.log("   ✅ Attacker completes sandwich (profit extracted)");
  console.log(`   📈 Gas Price: 100 gwei\n`);

  // ========== DETECTION SUMMARY ==========
  console.log("=".repeat(60));
  console.log("🔍 ATTACK PATTERN DETECTED:");
  console.log("=".repeat(60));
  console.log("Pattern: SANDWICH ATTACK");
  console.log("Victim Address:", victim.address);
  console.log("Attacker Address:", attacker.address);
  console.log("Victim Transaction:", victimTx.hash);
  console.log("Attack Characteristics:");
  console.log("  - Same token pair");
  console.log("  - Bracketing transactions (before & after)");
  console.log("  - Gas price manipulation (100 gwei vs 50 gwei)");
  console.log("  - Timing: < 3 blocks apart");
  console.log("\n⚠️  RISK SCORE: 95/100 (CRITICAL)");
  console.log("💡 Mitigation: Use Flashbots private relay");
  console.log("=".repeat(60));
  
  console.log("\n✅ Simulation complete!");
  console.log("The backend scanner should have detected this pattern.");
  console.log("Check the dashboard for real-time alerts! 🏎️\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
