import { ethers } from "hardhat";

/**
 * Deploy SafeRouter and mock contracts for testing
 */
async function main() {
  console.log("🏎️  Deploying RaceSafe DeFi Contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy Mock Tokens for testing
  console.log("📦 Deploying Mock Tokens...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  const tokenA = await MockERC20.deploy("Token A", "TKNA", 18);
  await tokenA.waitForDeployment();
  console.log("✅ Token A deployed to:", await tokenA.getAddress());
  
  const tokenB = await MockERC20.deploy("Token B", "TKNB", 18);
  await tokenB.waitForDeployment();
  console.log("✅ Token B deployed to:", await tokenB.getAddress());

  // Deploy Mock DEX Router
  console.log("\n🔄 Deploying Mock DEX Router...");
  const MockDEXRouter = await ethers.getContractFactory("MockDEXRouter");
  const dexRouter = await MockDEXRouter.deploy();
  await dexRouter.waitForDeployment();
  console.log("✅ Mock DEX Router deployed to:", await dexRouter.getAddress());

  // Setup liquidity in mock DEX
  const liquidityAmount = ethers.parseEther("1000000");
  await tokenA.mint(await dexRouter.getAddress(), liquidityAmount);
  await tokenB.mint(await dexRouter.getAddress(), liquidityAmount);
  console.log("💧 Added liquidity to DEX");

  // Deploy SafeRouter
  console.log("\n🔒 Deploying SafeRouter...");
  const feeRecipient = deployer.address; // Use deployer as fee recipient for testing
  const SafeRouter = await ethers.getContractFactory("SafeRouter");
  const safeRouter = await SafeRouter.deploy(feeRecipient);
  await safeRouter.waitForDeployment();
  console.log("✅ SafeRouter deployed to:", await safeRouter.getAddress());

  // Approve DEX router in SafeRouter
  const tx = await safeRouter.setRouterApproval(await dexRouter.getAddress(), true);
  await tx.wait();
  console.log("✅ DEX Router approved in SafeRouter");

  // Mint tokens to deployer for testing
  const testAmount = ethers.parseEther("10000");
  await tokenA.mint(deployer.address, testAmount);
  await tokenB.mint(deployer.address, testAmount);
  console.log("✅ Minted test tokens to deployer");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🏁 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Token A:        ", await tokenA.getAddress());
  console.log("Token B:        ", await tokenB.getAddress());
  console.log("Mock DEX:       ", await dexRouter.getAddress());
  console.log("SafeRouter:     ", await safeRouter.getAddress());
  console.log("Fee Recipient:  ", feeRecipient);
  console.log("=".repeat(60));

  // Save deployment addresses
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    tokenA: await tokenA.getAddress(),
    tokenB: await tokenB.getAddress(),
    mockDEX: await dexRouter.getAddress(),
    safeRouter: await safeRouter.getAddress(),
    feeRecipient: feeRecipient,
    deployer: deployer.address,
  };

  console.log("\n📋 Deployment config:");
  console.log(JSON.stringify(deployment, null, 2));
  
  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
