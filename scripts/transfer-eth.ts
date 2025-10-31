import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Transfer ETH from your deployer account to another address
 * This simulates a user sending funds through your system
 */
async function main() {
  console.log("\n💸 RaceSafe - Transfer ETH Between Accounts");
  console.log("==========================================\n");

  // Get your deployer wallet (the one with 0.1536 ETH)
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("FROM (Your Account):");
  console.log("   Address:", deployer.address);
  console.log("   Balance:", ethers.formatEther(balance), "ETH\n");

  // RECIPIENT ADDRESS - Change this to YOUR other account!
  const recipientAddress =
    process.env.RECIPIENT_ADDRESS || "0xYOUR_OTHER_WALLET_ADDRESS_HERE";

  if (recipientAddress === "0xYOUR_OTHER_WALLET_ADDRESS_HERE") {
    console.log("⚠️  Please set RECIPIENT_ADDRESS in .env file!");
    console.log("   Or provide it as argument:\n");
    console.log("   Add to .env:");
    console.log("   RECIPIENT_ADDRESS=0x1234567890abcdef...\n");
    console.log("==========================================\n");
    return;
  }

  console.log("TO (Recipient Account):");
  console.log("   Address:", recipientAddress);

  const recipientBalance = await ethers.provider.getBalance(recipientAddress);
  console.log(
    "   Current Balance:",
    ethers.formatEther(recipientBalance),
    "ETH\n"
  );

  // Amount to transfer
  const amountToSend = ethers.parseEther("0.01"); // 0.01 ETH

  console.log("==========================================");
  console.log("📝 TRANSFER PLAN:");
  console.log("==========================================\n");
  console.log(`Amount: ${ethers.formatEther(amountToSend)} ETH`);
  console.log(`From: ${deployer.address}`);
  console.log(`To: ${recipientAddress}`);
  console.log(`Estimated Gas: ~0.0001 ETH`);
  console.log(`Total Cost: ~0.0101 ETH\n`);

  // Check if enough balance
  const estimatedGas = ethers.parseEther("0.0001");
  const totalNeeded = amountToSend + estimatedGas;

  if (balance < totalNeeded) {
    console.error("❌ Insufficient balance!");
    console.error(`   Need: ${ethers.formatEther(totalNeeded)} ETH`);
    console.error(`   Have: ${ethers.formatEther(balance)} ETH`);
    return;
  }

  console.log("==========================================");
  console.log("🚀 Sending transaction...\n");

  try {
    // Send the transaction
    const tx = await deployer.sendTransaction({
      to: recipientAddress,
      value: amountToSend,
      gasLimit: 21000, // Standard ETH transfer
    });

    console.log("✅ Transaction sent!");
    console.log("   Hash:", tx.hash);
    console.log("   Waiting for confirmation...\n");

    const receipt = await tx.wait();

    console.log("==========================================");
    console.log("🎉 TRANSFER COMPLETE!");
    console.log("==========================================\n");

    console.log("✅ Transaction confirmed!");
    console.log("   Block:", receipt?.blockNumber);
    console.log("   Gas Used:", receipt?.gasUsed.toString());
    console.log(
      "   Status:",
      receipt?.status === 1 ? "Success ✅" : "Failed ❌"
    );
    console.log("");

    // Check new balances
    const newSenderBalance = await ethers.provider.getBalance(deployer.address);
    const newRecipientBalance = await ethers.provider.getBalance(
      recipientAddress
    );

    console.log("💰 Updated Balances:");
    console.log("");
    console.log("   Sender (You):");
    console.log(`      Before: ${ethers.formatEther(balance)} ETH`);
    console.log(`      After: ${ethers.formatEther(newSenderBalance)} ETH`);
    console.log(
      `      Spent: ${ethers.formatEther(balance - newSenderBalance)} ETH`
    );
    console.log("");
    console.log("   Recipient:");
    console.log(`      Before: ${ethers.formatEther(recipientBalance)} ETH`);
    console.log(`      After: ${ethers.formatEther(newRecipientBalance)} ETH`);
    console.log(
      `      Received: ${ethers.formatEther(
        newRecipientBalance - recipientBalance
      )} ETH`
    );
    console.log("");

    console.log("🔗 View on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log("");

    console.log("==========================================");
    console.log("📊 YOUR BACKEND SHOULD DETECT THIS!");
    console.log("==========================================\n");
    console.log("✅ This transaction will appear in your dashboard");
    console.log("✅ Check: http://localhost:3000/dashboard");
    console.log("✅ Your MEV detection system is monitoring it!\n");
  } catch (error) {
    console.error("\n❌ Transfer failed:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
