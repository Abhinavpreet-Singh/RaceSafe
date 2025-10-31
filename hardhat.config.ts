import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      // Forking disabled for local development - uncomment below to enable mainnet forking
      // forking: process.env.MAINNET_RPC_URL
      //   ? {
      //       url: process.env.MAINNET_RPC_URL,
      //       blockNumber: 18000000, // Pin to specific block for consistency
      //     }
      //   : undefined,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts:
        process.env.DEPLOYER_PRIVATE_KEY !== undefined
          ? [process.env.DEPLOYER_PRIVATE_KEY]
          : [],
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts:
        process.env.DEPLOYER_PRIVATE_KEY !== undefined
          ? [process.env.DEPLOYER_PRIVATE_KEY]
          : [],
      chainId: 1,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
