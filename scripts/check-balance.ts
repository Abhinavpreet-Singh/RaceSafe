import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Check your SepoliaETH balance and contract status
 */
async function main() {
  console.log("\n💰 RaceSafe - Balance & Status Check");
  console.log("==========================================\n");

  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  const network = await ethers.provider.getNetwork();

  console.log("📊 YOUR WALLET:");
  console.log("   Address:", signer.address);
  console.log("   Network:", network.name, `(ChainID: ${network.chainId})`);
  console.log("   Balance:", ethers.formatEther(balance), "ETH");
  console.log("");

  const safeRouterAddress = process.env.SAFE_ROUTER_ADDRESS;
  const vulnerableRouterAddress = process.env.VULNERABLE_ROUTER_ADDRESS;

  console.log("📝 YOUR DEPLOYED CONTRACTS:");
  console.log("   SafeRouter:", safeRouterAddress || "Not set");
  console.log("   VulnerableRouter:", vulnerableRouterAddress || "Not set");
  console.log("");

  // Check contract balances
  if (safeRouterAddress) {
    const safeBalance = await ethers.provider.getBalance(safeRouterAddress);
    const code = await ethers.provider.getCode(safeRouterAddress);
    console.log("🟢 SafeRouter Status:");
    console.log("   Deployed:", code !== "0x" ? "✅ Yes" : "❌ No");
    console.log("   Balance:", ethers.formatEther(safeBalance), "ETH");
    console.log(
      "   Etherscan:",
      `https://sepolia.etherscan.io/address/${safeRouterAddress}`
    );
    console.log("");
  }

  if (vulnerableRouterAddress) {
    const vulnBalance = await ethers.provider.getBalance(
      vulnerableRouterAddress
    );
    const code = await ethers.provider.getCode(vulnerableRouterAddress);
    console.log("🔴 VulnerableRouter Status:");
    console.log("   Deployed:", code !== "0x" ? "✅ Yes" : "❌ No");
    console.log("   Balance:", ethers.formatEther(vulnBalance), "ETH");
    console.log(
      "   Etherscan:",
      `https://sepolia.etherscan.io/address/${vulnerableRouterAddress}`
    );
    console.log("");
  }

  console.log("==========================================");
  console.log("💡 WHAT YOU CAN DO:");
  console.log("==========================================\n");

  console.log("✅ Your SepoliaETH is ready to use!");
  console.log(`   Available: ${ethers.formatEther(balance)} ETH\n`);

  console.log("Options:\n");

  console.log("1️⃣  Send test transaction to SafeRouter:");
  console.log("   npx hardhat run scripts/test-real-swap.ts --network sepolia");
  console.log("   Cost: ~0.001 ETH\n");

  console.log("2️⃣  Generate demo attacks (FREE):");
  console.log("   Go to http://localhost:3000/pit-crew");
  console.log("   Click 'Generate Demo Attack'\n");

  console.log("3️⃣  Monitor live mempool (FREE):");
  console.log("   Already running! Check dashboard.\n");

  console.log("4️⃣  Test Flashbots protection (FREE in demo mode):");
  console.log("   Generate attack, click 'Submit via Flashbots'\n");

  const estimatedForTests = ethers.parseEther("0.01");
  const remaining = balance - estimatedForTests;

  console.log("==========================================");
  console.log("📊 BUDGET:");
  console.log("==========================================\n");
  console.log(`   Current Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`   For Testing: ${ethers.formatEther(estimatedForTests)} ETH`);
  console.log(
    `   Remaining: ${ethers.formatEther(remaining > 0n ? remaining : 0n)} ETH`
  );
  console.log(
    `   Status: ${
      balance > estimatedForTests ? "✅ Plenty for testing!" : "⚠️  Low balance"
    }\n`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
