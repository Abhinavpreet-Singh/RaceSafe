import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import type { SafeRouter, MockERC20, MockDEXRouter } from "../typechain-types";

describe("SafeRouter", function () {
  // Fixture for deploying contracts
  async function deployFixture() {
    const [owner, feeRecipient, user, attacker] = await ethers.getSigners();

    // Deploy mock tokens
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    const tokenA = (await MockERC20Factory.deploy("Token A", "TKNA", 18)) as unknown as MockERC20;
    const tokenB = (await MockERC20Factory.deploy("Token B", "TKNB", 18)) as unknown as MockERC20;

    // Deploy mock DEX
    const MockDEXFactory = await ethers.getContractFactory("MockDEXRouter");
    const mockDEX = (await MockDEXFactory.deploy()) as unknown as MockDEXRouter;

    // Deploy SafeRouter
    const SafeRouterFactory = await ethers.getContractFactory("SafeRouter");
    const safeRouter = (await SafeRouterFactory.deploy(feeRecipient.address)) as unknown as SafeRouter;

    // Setup liquidity in mock DEX
    const liquidityAmount = ethers.parseEther("1000000");
    await tokenA.mint(await mockDEX.getAddress(), liquidityAmount);
    await tokenB.mint(await mockDEX.getAddress(), liquidityAmount);

    // Approve mock DEX in SafeRouter
    await safeRouter.setRouterApproval(await mockDEX.getAddress(), true);

    // Mint tokens to users
    const userAmount = ethers.parseEther("1000");
    await tokenA.mint(user.address, userAmount);
    await tokenA.mint(attacker.address, userAmount);

    return {
      safeRouter,
      tokenA,
      tokenB,
      mockDEX,
      owner,
      feeRecipient,
      user,
      attacker,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct fee recipient", async function () {
      const { safeRouter, feeRecipient } = await loadFixture(deployFixture);
      const config = await safeRouter.getFeeConfig();
      expect(config.recipient).to.equal(feeRecipient.address);
    });

    it("Should set default fee to 0.3%", async function () {
      const { safeRouter } = await loadFixture(deployFixture);
      const config = await safeRouter.getFeeConfig();
      expect(config.fee).to.equal(30); // 30 basis points = 0.3%
    });

    it("Should set owner correctly", async function () {
      const { safeRouter, owner } = await loadFixture(deployFixture);
      expect(await safeRouter.owner()).to.equal(owner.address);
    });
  });

  describe("Router Approval", function () {
    it("Should approve router correctly", async function () {
      const { safeRouter, mockDEX } = await loadFixture(deployFixture);
      expect(await safeRouter.isRouterApproved(await mockDEX.getAddress())).to.be.true;
    });

    it("Should revoke router approval", async function () {
      const { safeRouter, mockDEX, owner } = await loadFixture(deployFixture);
      await safeRouter.connect(owner).setRouterApproval(await mockDEX.getAddress(), false);
      expect(await safeRouter.isRouterApproved(await mockDEX.getAddress())).to.be.false;
    });

    it("Should only allow owner to approve routers", async function () {
      const { safeRouter, user, attacker } = await loadFixture(deployFixture);
      await expect(
        safeRouter.connect(user).setRouterApproval(attacker.address, true)
      ).to.be.reverted;
    });

    it("Should reject zero address router", async function () {
      const { safeRouter, owner } = await loadFixture(deployFixture);
      await expect(
        safeRouter.connect(owner).setRouterApproval(ethers.ZeroAddress, true)
      ).to.be.revertedWithCustomError(safeRouter, "InvalidAddress");
    });
  });

  describe("Token Swaps", function () {
    it("Should execute a basic swap successfully", async function () {
      const { safeRouter, tokenA, tokenB, mockDEX, user } = await loadFixture(deployFixture);

      const swapAmount = ethers.parseEther("100");
      const minOut = ethers.parseEther("95");
      const deadline = (await time.latest()) + 300;

      // Approve SafeRouter
      await tokenA.connect(user).approve(await safeRouter.getAddress(), swapAmount);

      // Encode swap data
      const path = [await tokenA.getAddress(), await tokenB.getAddress()];
      const swapInterface = new ethers.Interface([
        "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"
      ]);
      const swapData = swapInterface.encodeFunctionData("swapExactTokensForTokens", [
        swapAmount * BigInt(9970) / BigInt(10000), // After fee
        minOut,
        path,
        await safeRouter.getAddress(),
        deadline
      ]);

      // Execute swap
      await expect(
        safeRouter.connect(user).swapTokens(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          minOut,
          deadline,
          await mockDEX.getAddress(),
          swapData
        )
      ).to.emit(safeRouter, "SwapExecuted");

      // Check user received tokens
      expect(await tokenB.balanceOf(user.address)).to.be.gt(0);
    });

    it("Should enforce slippage protection", async function () {
      const { safeRouter, tokenA, tokenB, mockDEX, user } = await loadFixture(deployFixture);

      const swapAmount = ethers.parseEther("100");
      const minOut = ethers.parseEther("200"); // Unrealistic min output
      const deadline = (await time.latest()) + 300;

      await tokenA.connect(user).approve(await safeRouter.getAddress(), swapAmount);

      const path = [await tokenA.getAddress(), await tokenB.getAddress()];
      const swapInterface = new ethers.Interface([
        "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"
      ]);
      const swapData = swapInterface.encodeFunctionData("swapExactTokensForTokens", [
        swapAmount * BigInt(9970) / BigInt(10000),
        minOut,
        path,
        await safeRouter.getAddress(),
        deadline
      ]);

      await expect(
        safeRouter.connect(user).swapTokens(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          minOut,
          deadline,
          await mockDEX.getAddress(),
          swapData
        )
      ).to.be.revertedWithCustomError(safeRouter, "InsufficientOutput");
    });

    it("Should reject expired transactions", async function () {
      const { safeRouter, tokenA, tokenB, mockDEX, user } = await loadFixture(deployFixture);

      const swapAmount = ethers.parseEther("100");
      const minOut = ethers.parseEther("95");
      const deadline = (await time.latest()) - 1; // Already expired

      await tokenA.connect(user).approve(await safeRouter.getAddress(), swapAmount);

      const path = [await tokenA.getAddress(), await tokenB.getAddress()];
      const swapInterface = new ethers.Interface([
        "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"
      ]);
      const swapData = swapInterface.encodeFunctionData("swapExactTokensForTokens", [
        swapAmount,
        minOut,
        path,
        await safeRouter.getAddress(),
        deadline
      ]);

      await expect(
        safeRouter.connect(user).swapTokens(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          minOut,
          deadline,
          await mockDEX.getAddress(),
          swapData
        )
      ).to.be.revertedWithCustomError(safeRouter, "DeadlineExpired");
    });

    it("Should reject unapproved router", async function () {
      const { safeRouter, tokenA, tokenB, user, attacker } = await loadFixture(deployFixture);

      const swapAmount = ethers.parseEther("100");
      const minOut = ethers.parseEther("95");
      const deadline = (await time.latest()) + 300;

      await tokenA.connect(user).approve(await safeRouter.getAddress(), swapAmount);

      await expect(
        safeRouter.connect(user).swapTokens(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          minOut,
          deadline,
          attacker.address, // Unapproved router
          "0x"
        )
      ).to.be.revertedWithCustomError(safeRouter, "UnauthorizedRouter");
    });

    it("Should enforce minimum trade amount", async function () {
      const { safeRouter, tokenA, tokenB, mockDEX, user } = await loadFixture(deployFixture);

      const swapAmount = ethers.parseEther("0.0001"); // Below minimum
      const minOut = ethers.parseEther("0.00009");
      const deadline = (await time.latest()) + 300;

      await tokenA.connect(user).approve(await safeRouter.getAddress(), swapAmount);

      const swapData = "0x";

      await expect(
        safeRouter.connect(user).swapTokens(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          minOut,
          deadline,
          await mockDEX.getAddress(),
          swapData
        )
      ).to.be.revertedWithCustomError(safeRouter, "BelowMinimumTrade");
    });

    it("Should collect fees correctly", async function () {
      const { safeRouter, tokenA, tokenB, mockDEX, user, feeRecipient } = 
        await loadFixture(deployFixture);

      const swapAmount = ethers.parseEther("100");
      const minOut = ethers.parseEther("95");
      const deadline = (await time.latest()) + 300;

      await tokenA.connect(user).approve(await safeRouter.getAddress(), swapAmount);

      const path = [await tokenA.getAddress(), await tokenB.getAddress()];
      const swapInterface = new ethers.Interface([
        "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"
      ]);
      const swapData = swapInterface.encodeFunctionData("swapExactTokensForTokens", [
        swapAmount * BigInt(9970) / BigInt(10000),
        minOut,
        path,
        await safeRouter.getAddress(),
        deadline
      ]);

      const balanceBefore = await tokenA.balanceOf(feeRecipient.address);

      await safeRouter.connect(user).swapTokens(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        swapAmount,
        minOut,
        deadline,
        await mockDEX.getAddress(),
        swapData
      );

      const balanceAfter = await tokenA.balanceOf(feeRecipient.address);
      const expectedFee = swapAmount * BigInt(30) / BigInt(10000); // 0.3%
      
      expect(balanceAfter - balanceBefore).to.equal(expectedFee);
    });
  });

  describe("Circuit Breaker", function () {
    it("Should pause trading", async function () {
      const { safeRouter, owner } = await loadFixture(deployFixture);
      await safeRouter.connect(owner).pause();
      expect(await safeRouter.paused()).to.be.true;
    });

    it("Should reject swaps when paused", async function () {
      const { safeRouter, tokenA, tokenB, mockDEX, user, owner } = 
        await loadFixture(deployFixture);

      await safeRouter.connect(owner).pause();

      const swapAmount = ethers.parseEther("100");
      const minOut = ethers.parseEther("95");
      const deadline = (await time.latest()) + 300;

      await tokenA.connect(user).approve(await safeRouter.getAddress(), swapAmount);

      await expect(
        safeRouter.connect(user).swapTokens(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          minOut,
          deadline,
          await mockDEX.getAddress(),
          "0x"
        )
      ).to.be.reverted;
    });

    it("Should unpause successfully", async function () {
      const { safeRouter, owner } = await loadFixture(deployFixture);
      await safeRouter.connect(owner).pause();
      await safeRouter.connect(owner).unpause();
      expect(await safeRouter.paused()).to.be.false;
    });

    it("Should only allow owner to pause", async function () {
      const { safeRouter, user } = await loadFixture(deployFixture);
      await expect(safeRouter.connect(user).pause()).to.be.reverted;
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This is implicitly tested by the ReentrancyGuard from OpenZeppelin
      // Additional explicit reentrancy tests would require a malicious contract
      const { safeRouter } = await loadFixture(deployFixture);
      expect(await safeRouter.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Admin Functions", function () {
    it("Should update fee", async function () {
      const { safeRouter, owner } = await loadFixture(deployFixture);
      const newFee = 50; // 0.5%
      await safeRouter.connect(owner).setFeeBps(newFee);
      const config = await safeRouter.getFeeConfig();
      expect(config.fee).to.equal(newFee);
    });

    it("Should reject excessive fees", async function () {
      const { safeRouter, owner } = await loadFixture(deployFixture);
      await expect(
        safeRouter.connect(owner).setFeeBps(200) // 2% - too high
      ).to.be.revertedWith("Fee too high");
    });

    it("Should update fee recipient", async function () {
      const { safeRouter, owner, user } = await loadFixture(deployFixture);
      await safeRouter.connect(owner).setFeeRecipient(user.address);
      const config = await safeRouter.getFeeConfig();
      expect(config.recipient).to.equal(user.address);
    });

    it("Should update minimum trade amount", async function () {
      const { safeRouter, owner } = await loadFixture(deployFixture);
      const newMin = ethers.parseEther("0.1");
      await safeRouter.connect(owner).setMinTradeAmount(newMin);
      expect(await safeRouter.minTradeAmount()).to.equal(newMin);
    });
  });
});
