import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Ethereum
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  chainId: parseInt(process.env.CHAIN_ID || '1', 10),
  flashbotsRpc: process.env.FLASHBOTS_RPC || 'https://rpc.flashbots.net',

  // Database
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,

  // Monitoring
  blockPollingInterval: parseInt(process.env.BLOCK_POLLING_INTERVAL || '12000', 10),
  mevDetectionThreshold: parseFloat(process.env.MEV_DETECTION_THRESHOLD || '0.7'),

  // API Keys
  etherscanApiKey: process.env.ETHERSCAN_API_KEY,
};

export default config;
