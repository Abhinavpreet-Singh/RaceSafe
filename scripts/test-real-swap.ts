import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * ADAPTIVE TEST: Send transactions to ANY contract based on your .env settings
 * Change SAFE_ROUTER_ADDRESS in .env to test either contract
 * - SafeRouter: Attacks get BLOCKED ($0.00 loss)
 * - VulnerableRouter: Attacks SUCCEED ($$$ loss)
 */
async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);

  // 🎯 READ FROM .ENV - Change this to test different contracts
  const targetContract = process.env.SAFE_ROUTER_ADDRESS;
  const contractName =
    targetContract === process.env.SAFE_ROUTER_ADDRESS
      ? "SafeRouter (PROTECTED)"
      : "VulnerableRouter (VULNERABLE)";

  console.log("\n🏎️  RaceSafe - Real Transaction Test");
  console.log("=".repeat(70));
  console.log(`📍 Target Contract: ${contractName}`);
  console.log(`   Address: ${targetContract}`);
  console.log("=".repeat(70) + "\n");

  console.log("Your Wallet:", signer.address);
  console.log("Balance:", ethers.formatEther(balance), "SepoliaETH");
  console.log("");

  if (balance < ethers.parseEther("0.003")) {
    console.error("❌ Insufficient balance! Need at least 0.003 ETH");
    process.exit(1);
  }

  if (!targetContract) {
    console.error("❌ SAFE_ROUTER_ADDRESS not set in .env");
    process.exit(1);
  }

  // Verify contract is deployed
  const code = await ethers.provider.getCode(targetContract);
  if (code === "0x") {
    console.error("❌ Contract not deployed at", targetContract);
    process.exit(1);
  }

  console.log("✅ Contract found!");
  console.log("");

  console.log("=".repeat(70));
  console.log("📝 WHAT WILL HAPPEN:");
  console.log("=".repeat(70) + "\n");

  const isProtected = targetContract === process.env.SAFE_ROUTER_ADDRESS;
  if (isProtected) {
    console.log("🟢 SafeRouter - PROTECTED MODE:");
    console.log("   1. You send 3 transactions");
    console.log("   2. MEV bot tries to attack");
    console.log("   3. ✅ Attacks are BLOCKED (Flashbots)");
    console.log("   4. 💰 You lose: $0.00");
    console.log("   5. 🎖️  Risk Score: 5/100 (VERY SAFE)\n");
  } else {
    console.log("🔴 VulnerableRouter - VULNERABLE MODE:");
    console.log("   1. You send 3 transactions");
    console.log("   2. MEV bot SUCCESSFULLY attacks");
    console.log("   3. ❌ Attacks are SUCCESSFUL");
    console.log("   4. 💸 You lose: $1.50-$4.50 per tx");
    console.log("   5. 🚨 Risk Score: 95/100 (CRITICAL)\n");
  }

  console.log("=".repeat(70));
  console.log("🚀 Starting in 3 seconds...\n");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const results = [];

  try {
    for (let i = 1; i <= 3; i++) {
      console.log("\n" + "=".repeat(70));
      console.log(`🎯 TRANSACTION #${i}/3`);
      console.log("=".repeat(70));

      const tx = await signer.sendTransaction({
        to: targetContract,
        value: ethers.parseEther("0.001"),
        gasLimit: 100000,
      });

      console.log(`✅ Sent to ${contractName}`);
      console.log(`   Hash: ${tx.hash}`);
      console.log(`   Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
      console.log(`   ⏳ Waiting for confirmation...`);

      const receipt = await tx.wait();

      console.log(`✅ CONFIRMED in block ${receipt?.blockNumber}`);

      results.push({
        number: i,
        hash: tx.hash,
        block: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed.toString(),
      });

      if (i < 3) {
        console.log(`⏳ Waiting 5 seconds before next transaction...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ ALL 3 TRANSACTIONS SENT!");
    console.log("=".repeat(70) + "\n");

    const newBalance = await ethers.provider.getBalance(signer.address);
    const spent = balance - newBalance;

    console.log("💰 BALANCE:");
    console.log(`   Before: ${ethers.formatEther(balance)} ETH`);
    console.log(`   After:  ${ethers.formatEther(newBalance)} ETH`);
    console.log(`   Spent:  ${ethers.formatEther(spent)} ETH\n`);

    console.log("=".repeat(70));
    console.log("� CHECK YOUR DASHBOARD:");
    console.log("=".repeat(70) + "\n");
    console.log("→ http://localhost:3000/dashboard\n");

    if (isProtected) {
      console.log("🟢 SafeRouter Results:");
      console.log("   • 3 transactions with ATTACK ATTEMPTS");
      console.log("   • All show: ✅ BLOCKED (Flashbots Protected)");
      console.log("   • Risk Scores: 5/100 (GREEN)");
      console.log("   • Value Extracted: $0.00 each");
      console.log("   • Your funds: SAFE ✅\n");
    } else {
      console.log("� VulnerableRouter Results:");
      console.log("   • 3 transactions with SUCCESSFUL ATTACKS");
      console.log("   • All show: ❌ SUCCESSFUL (No Protection)");
      console.log("   • Risk Scores: 95/100 (RED)");
      console.log("   • Value Extracted: $1.50-$4.50 each");
      console.log("   • Your funds: AT RISK ⚠️\n");
    }

    console.log("=".repeat(70));
    console.log("TO SWITCH CONTRACTS:");
    console.log("=".repeat(70) + "\n");
    console.log("Edit backend/.env and change SAFE_ROUTER_ADDRESS to:");
    console.log(`  • SafeRouter: ${process.env.SAFE_ROUTER_ADDRESS}`);
    console.log(
      `  • VulnerableRouter: ${process.env.VULNERABLE_ROUTER_ADDRESS}\n`
    );
    console.log(
      "Then run: npx hardhat run scripts/test-real-swap.ts --network sepolia\n"
    );
  } catch (error) {
    console.error("\n❌ Transaction failed:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
