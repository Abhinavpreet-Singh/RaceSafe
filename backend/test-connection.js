const { ethers } = require('ethers');
require('dotenv').config();

async function testConnection() {
  console.log('🧪 Testing Alchemy RPC Connection...\n');
  
  const rpcUrl = process.env.ETHEREUM_RPC_HTTP;
  if (!rpcUrl) {
    console.error('❌ ETHEREUM_RPC_HTTP not set in .env');
    return;
  }
  
  console.log('📡 RPC URL:', rpcUrl.replace(/\/v2\/.*/, '/v2/***'));
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Test 1: Get block number
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Current Block Number:', blockNumber);
    
    // Test 2: Get network
    const network = await provider.getNetwork();
    console.log('✅ Network:', network.name, '(Chain ID:', network.chainId.toString() + ')');
    
    // Test 3: Get gas price
    const feeData = await provider.getFeeData();
    const gasPrice = ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    console.log('✅ Current Gas Price:', gasPrice, 'Gwei');
    
    console.log('\n🎉 Connection test PASSED!');
  } catch (error) {
    console.error('❌ Connection test FAILED:', error.message);
  }
}

testConnection();