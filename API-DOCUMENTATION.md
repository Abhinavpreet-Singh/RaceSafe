# 🏎️ RaceSafe DeFi - API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:8080`  
**WebSocket URL**: `ws://localhost:8081`  
**Last Updated**: October 28, 2025

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [REST API Endpoints](#rest-api-endpoints)
4. [WebSocket API](#websocket-api)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limits](#rate-limits)
8. [Examples](#examples)

---

## 🌐 **Overview**

The RaceSafe DeFi API provides real-time MEV attack detection, transaction simulation, and Flashbots integration for secure DeFi transactions.

### **Key Features**
- 🔍 Real-time mempool monitoring
- 🚨 MEV attack detection (Sandwich, Frontrun, Arbitrage, etc.)
- 🔒 Flashbots private transaction submission
- 📊 Transaction risk analysis
- 💹 Slippage calculation
- ⚡ WebSocket real-time updates

### **Technology Stack**
- **Runtime**: Node.js + Express.js
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Provider**: Alchemy WebSocket/HTTP RPC
- **MEV Protection**: Flashbots Protect
- **Real-time**: WebSocket (ws library)

---

## 🔐 **Authentication**

Currently, the API is **publicly accessible** for testing purposes.

**CORS Configuration**:
- Allowed Origin: `http://localhost:3000` (configurable via `CORS_ORIGIN` env variable)
- Methods: `GET`, `POST`, `OPTIONS`
- Headers: `Content-Type`, `Authorization`

**Future Authentication** (Production):
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 📡 **REST API Endpoints**

### **1. Health Check**

Check if the API server is running and get service status.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "online",
  "timestamp": 1698451200000,
  "scanner": {
    "isScanning": true,
    "totalTransactions": 12345,
    "flaggedTransactions": 42,
    "uptime": 3600.5
  },
  "websocket": {
    "clients": 5,
    "port": 8081
  }
}
```

**Status Codes**:
- `200 OK` - Server is healthy
- `503 Service Unavailable` - Server is down

**Example**:
```bash
curl http://localhost:8080/api/health
```

---

### **2. Get Live Mempool Transactions**

Retrieve recent transactions detected in the mempool.

**Endpoint**: `GET /api/mempool/live`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Max number of transactions to return |

**Response**:
```json
{
  "transactions": [
    {
      "hash": "0xabc123...",
      "from": "0x742d35...",
      "to": "0x5FC8d3...",
      "value": "1.5",
      "gasPrice": "50",
      "timestamp": 1698451200000
    }
  ],
  "total": 12345
}
```

**Example**:
```bash
curl "http://localhost:8080/api/mempool/live?limit=10"
```

---

### **3. Get Flagged MEV Attacks**

Retrieve transactions flagged as potential MEV attacks.

**Endpoint**: `GET /api/flagged`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Max number of flagged transactions |
| `attackType` | string | null | Filter by attack type (SANDWICH, FRONTRUN, etc.) |

**Response**:
```json
{
  "transactions": [
    {
      "hash": "0xdef456...",
      "from": "0xAttacker123...",
      "to": "0x5FC8d3...",
      "value": "100.0",
      "gasPrice": "150",
      "data": "0x...",
      "timestamp": 1698451200000,
      "attackType": "SANDWICH",
      "riskScore": 95,
      "estimatedLoss": "2.5",
      "relatedTxs": ["0xtx1...", "0xtx2..."],
      "mitigation": "Use Flashbots private relay to avoid this attack"
    }
  ],
  "total": 42
}
```

**Attack Types**:
- `SANDWICH` - Sandwich attack (frontrun + backrun)
- `FRONTRUN` - Front-running attack
- `BACKRUN` - Back-running attack
- `ARBITRAGE` - Arbitrage opportunity
- `LIQUIDATION` - Liquidation attack
- `GAS_MANIPULATION` - Gas price manipulation

**Example**:
```bash
# Get all flagged transactions
curl http://localhost:8080/api/flagged

# Get only sandwich attacks
curl "http://localhost:8080/api/flagged?attackType=SANDWICH&limit=5"
```

---

### **4. Get Scanner Statistics**

Get comprehensive statistics about the mempool scanner and Flashbots relay.

**Endpoint**: `GET /api/stats`

**Response**:
```json
{
  "scanner": {
    "isScanning": true,
    "totalTransactions": 12345,
    "flaggedTransactions": 42,
    "uptime": 3600.5,
    "targetContract": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
  },
  "flashbots": {
    "bundlesSubmitted": 10,
    "bundlesIncluded": 8,
    "successRate": 80.0,
    "totalValueProtected": "125.5"
  },
  "flaggedCount": 42,
  "liveCount": 12345,
  "websocketClients": 5
}
```

**Example**:
```bash
curl http://localhost:8080/api/stats
```

---

### **5. Simulate Transaction Risk** ⭐ **NEW**

Analyze a transaction for MEV risk before submission.

**Endpoint**: `POST /api/simulate-tx`

**Request Body**:
```json
{
  "transaction": {
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "value": "1.5",
    "gasPrice": "50",
    "data": "0x38ed1739..."
  },
  "useFlashbots": false
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transaction.to` | string | ✅ Yes | Destination address |
| `transaction.value` | string | No | ETH value (default: "0") |
| `transaction.gasPrice` | string | No | Gas price in Gwei |
| `transaction.data` | string | No | Transaction data (default: "0x") |
| `useFlashbots` | boolean | No | Whether using Flashbots (default: false) |

**Response**:
```json
{
  "success": true,
  "simulation": {
    "success": true,
    "gasUsed": "21000",
    "gasPrice": "50000000000",
    "totalCost": "0.00105",
    "mevRisk": {
      "score": 45.5,
      "level": "medium",
      "factors": {
        "gasPrice": 25.5,
        "txValue": 15.0,
        "slippage": 10.0,
        "timing": 5.0
      },
      "explanation": "Medium MEV risk due to above-average gas price..."
    },
    "slippage": {
      "estimated": 0.5,
      "safe": true
    },
    "recommendation": "✅ Transaction appears safe",
    "warnings": []
  },
  "risk": {
    "overall": 42.5,
    "level": "medium",
    "categories": {
      "mev": 45,
      "slippage": 20,
      "gas": 50,
      "timing": 30,
      "liquidity": 25
    },
    "recommendations": [
      "⚠️ Consider using Flashbots for high-value transactions",
      "💡 Wait for lower gas prices to reduce MEV risk"
    ],
    "protectionStrategies": [
      {
        "name": "Flashbots Protect",
        "effectiveness": 95,
        "description": "Submit via private relay..."
      }
    ]
  },
  "slippage": {
    "percentage": 2.5,
    "ethLoss": "0.025",
    "usdLoss": "50.00",
    "isSafe": false,
    "severity": "medium",
    "recommendation": "⚠️ Slippage is higher than recommended..."
  },
  "safetyCheck": {
    "safe": false,
    "reason": "High MEV risk detected",
    "useFlashbots": true
  },
  "recommendation": "🚨 WARNING: Use Flashbots to protect this transaction"
}
```

**Risk Levels**:
- `low` (0-25): Safe to submit publicly
- `medium` (25-50): Consider Flashbots
- `high` (50-75): Strongly recommend Flashbots
- `critical` (75-100): MUST use Flashbots

**Example**:
```bash
curl -X POST http://localhost:8080/api/simulate-tx \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "value": "0.5",
      "gasPrice": "50"
    },
    "useFlashbots": false
  }'
```

---

### **6. Submit Private Transaction via Flashbots**

Submit a signed transaction through Flashbots Protect to avoid MEV.

**Endpoint**: `POST /api/sendPrivateTx`

**Request Body**:
```json
{
  "signedTransaction": "0x02f8b305...",
  "targetBlock": 5234580,
  "maxBlockNumber": 5234583
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `signedTransaction` | string | ✅ Yes | Signed transaction hex string |
| `targetBlock` | integer | No | Target block number (default: next block) |
| `maxBlockNumber` | integer | No | Max block to try (default: target + 3) |

**Response**:
```json
{
  "success": true,
  "bundleSubmitted": true,
  "targetBlock": 5234580,
  "maxBlock": 5234583,
  "simulation": {
    "success": true,
    "gasUsed": "150000",
    "coinbaseDiff": "0.01",
    "ethSentToCoinbase": "0.005"
  },
  "bundleHash": "0xbundle123...",
  "message": "🔒 Transaction submitted via Flashbots Protect"
}
```

**Status Codes**:
- `200 OK` - Bundle submitted successfully
- `400 Bad Request` - Invalid transaction or simulation failed
- `503 Service Unavailable` - Flashbots relay not initialized

**Example**:
```bash
curl -X POST http://localhost:8080/api/sendPrivateTx \
  -H "Content-Type: application/json" \
  -d '{
    "signedTransaction": "0x02f8b305048459682f008459682f0e8301388094742d35cc6634c0532925a3b844bc9e7595f0beb880de0b6b3a764000080c001a0...",
    "targetBlock": 5234580,
    "maxBlockNumber": 5234583
  }'
```

---

### **7. Simulate Flashbots Bundle**

Test a bundle of transactions before submitting to Flashbots.

**Endpoint**: `POST /api/simulate`

**Request Body**:
```json
{
  "signedTransactions": [
    "0x02f8b305...",
    "0x02f8b306..."
  ],
  "blockTag": "latest"
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `signedTransactions` | array | ✅ Yes | Array of signed transaction hex strings |
| `blockTag` | string | No | Block tag (default: "latest") |

**Response**:
```json
{
  "success": true,
  "simulation": {
    "success": true,
    "transactions": [
      {
        "txHash": "0xtx1...",
        "gasUsed": "150000",
        "value": "1.5"
      },
      {
        "txHash": "0xtx2...",
        "gasUsed": "200000",
        "value": "0.5"
      }
    ],
    "coinbaseDiff": "0.02",
    "ethSentToCoinbase": "0.01",
    "totalGasUsed": "350000"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:8080/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "signedTransactions": [
      "0x02f8b305048459682f008459682f0e830138809...",
      "0x02f8b306048459682f008459682f0e830138809..."
    ],
    "blockTag": "latest"
  }'
```

---

### **8. Generate Demo Attack** 🎭

Generate a fake MEV attack for testing/demo purposes.

**Endpoint**: `POST /api/demo/attack`

**Request Body**:
```json
{
  "attackType": "SANDWICH"
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `attackType` | string | No | Attack type (default: "SANDWICH") |

**Response**:
```json
{
  "success": true,
  "attack": {
    "hash": "0xdemo123...",
    "from": "0xAttacker456...",
    "to": "0x5FC8d3...",
    "value": "100.0",
    "gasPrice": "150",
    "data": "0x",
    "timestamp": 1698451200000,
    "attackType": "SANDWICH",
    "riskScore": 87,
    "estimatedLoss": "3.2",
    "relatedTxs": [],
    "mitigation": "Submit transaction via Flashbots private relay"
  }
}
```

**Example**:
```bash
# Generate sandwich attack
curl -X POST http://localhost:8080/api/demo/attack \
  -H "Content-Type: application/json" \
  -d '{"attackType": "SANDWICH"}'

# Generate frontrun attack
curl -X POST http://localhost:8080/api/demo/attack \
  -H "Content-Type: application/json" \
  -d '{"attackType": "FRONTRUN"}'
```

---

## 🔌 **WebSocket API**

Real-time updates for MEV attacks and transactions.

**Connection URL**: `ws://localhost:8081`

### **Connection Lifecycle**

1. **Connect**: Client connects to WebSocket server
2. **Init**: Server sends initial data (recent flagged + live transactions)
3. **Subscribe**: Client receives real-time updates
4. **Disconnect**: Client closes connection

### **Message Types**

#### **1. Init Message** (on connect)

Sent immediately after connection.

```json
{
  "type": "init",
  "data": {
    "flagged": [
      {
        "hash": "0xabc...",
        "attackType": "SANDWICH",
        "riskScore": 95
      }
    ],
    "live": [
      {
        "hash": "0xdef...",
        "from": "0x123...",
        "value": "1.5"
      }
    ]
  },
  "timestamp": 1698451200000
}
```

#### **2. Flagged Transaction** (real-time)

Sent when a new MEV attack is detected.

```json
{
  "type": "flagged",
  "data": {
    "hash": "0xmev123...",
    "from": "0xAttacker...",
    "to": "0x5FC8d3...",
    "value": "100.0",
    "gasPrice": "200",
    "timestamp": 1698451200000,
    "attackType": "FRONTRUN",
    "riskScore": 88,
    "estimatedLoss": "2.1",
    "relatedTxs": ["0xtx1...", "0xtx2..."],
    "mitigation": "Use Flashbots Protect"
  },
  "timestamp": 1698451200000
}
```

#### **3. Live Transaction** (real-time)

Sent when a new transaction enters the mempool.

```json
{
  "type": "transaction",
  "data": {
    "hash": "0xlive123...",
    "from": "0x742d35...",
    "to": "0x5FC8d3...",
    "value": "0.5",
    "gasPrice": "50",
    "timestamp": 1698451200000
  },
  "timestamp": 1698451200000
}
```

### **JavaScript Client Example**

```javascript
const ws = new WebSocket('ws://localhost:8081');

ws.onopen = () => {
  console.log('✅ Connected to RaceSafe WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'init':
      console.log('📊 Initial data:', message.data);
      break;
      
    case 'flagged':
      console.log('🚨 MEV Attack detected:', message.data);
      // Update UI with new attack
      break;
      
    case 'transaction':
      console.log('📡 New transaction:', message.data);
      // Update live feed
      break;
  }
};

ws.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
};

ws.onclose = () => {
  console.log('🔌 Disconnected from WebSocket');
};
```

### **React Hook Example**

```typescript
import { useEffect, useState } from 'react';

interface MEVAlert {
  hash: string;
  attackType: string;
  riskScore: number;
  // ... other fields
}

export function useWebSocket(url: string) {
  const [alerts, setAlerts] = useState<MEVAlert[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setConnected(true);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'init') {
        setAlerts(message.data.flagged);
      } else if (message.type === 'flagged') {
        setAlerts(prev => [...prev, message.data]);
      }
    };
    
    ws.onclose = () => setConnected(false);
    
    return () => ws.close();
  }, [url]);

  return { alerts, connected };
}
```

---

## 📊 **Data Models**

### **Transaction**

```typescript
interface Transaction {
  hash: string;          // Transaction hash (0x...)
  from: string;          // Sender address
  to: string;            // Recipient address
  value: string;         // ETH value (in ETH, not Wei)
  gasPrice: string;      // Gas price (in Gwei)
  data?: string;         // Transaction data (hex)
  timestamp: number;     // Unix timestamp (ms)
}
```

### **Flagged Transaction**

```typescript
interface FlaggedTransaction extends Transaction {
  attackType: 'SANDWICH' | 'FRONTRUN' | 'BACKRUN' | 'ARBITRAGE' | 'LIQUIDATION' | 'GAS_MANIPULATION';
  riskScore: number;         // 0-100 risk score
  estimatedLoss: string;     // Estimated loss in ETH
  relatedTxs: string[];      // Related transaction hashes
  mitigation: string;        // Suggested mitigation strategy
}
```

### **Simulation Result**

```typescript
interface SimulationResult {
  success: boolean;
  gasUsed: string;
  gasPrice: string;
  totalCost: string;
  mevRisk: {
    score: number;          // 0-100
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: {
      gasPrice: number;
      txValue: number;
      slippage: number;
      timing: number;
    };
    explanation: string;
  };
  slippage: {
    estimated: number;      // Percentage
    safe: boolean;
  };
  recommendation: string;
  warnings: string[];
}
```

### **Risk Analysis**

```typescript
interface RiskAnalysis {
  overall: number;          // 0-100 overall risk score
  level: 'low' | 'medium' | 'high' | 'critical';
  categories: {
    mev: number;           // MEV risk (0-100)
    slippage: number;      // Slippage risk (0-100)
    gas: number;           // Gas price risk (0-100)
    timing: number;        // Timing risk (0-100)
    liquidity: number;     // Liquidity risk (0-100)
  };
  recommendations: string[];
  protectionStrategies: {
    name: string;
    effectiveness: number;  // 0-100
    description: string;
  }[];
}
```

### **Slippage Analysis**

```typescript
interface SlippageAnalysis {
  percentage: number;        // Slippage percentage
  ethLoss: string;          // ETH loss amount
  usdLoss: string;          // USD loss estimate
  isSafe: boolean;          // Is slippage within safe range?
  severity: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}
```

---

## ⚠️ **Error Handling**

### **Error Response Format**

All errors follow this structure:

```json
{
  "error": "Error title",
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": 1698451200000
}
```

### **HTTP Status Codes**

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `400` | Bad Request | Invalid request parameters |
| `404` | Not Found | Endpoint not found |
| `500` | Internal Server Error | Server-side error |
| `503` | Service Unavailable | Service not initialized |

### **Common Errors**

#### **400 Bad Request**

```json
{
  "error": "Invalid transaction",
  "message": "Transaction 'to' field is required"
}
```

**Causes**:
- Missing required fields
- Invalid parameter types
- Malformed data

#### **503 Service Unavailable**

```json
{
  "error": "Flashbots relay not initialized",
  "message": "Service is starting up. Please try again in a few seconds."
}
```

**Causes**:
- Services still initializing
- RPC connection failed
- WebSocket not connected

#### **500 Internal Server Error**

```json
{
  "error": "Failed to simulate transaction",
  "message": "Provider connection timeout"
}
```

**Causes**:
- RPC provider issues
- Network timeouts
- Unexpected server errors

---

## 🚦 **Rate Limits**

**Current Limits** (Development):
- No rate limits enforced

**Production Limits** (Future):
- `100 requests/minute` per IP
- `1000 requests/hour` per IP
- `10 WebSocket connections` per IP

**Rate Limit Headers** (Future):
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698451260
```

---

## 📝 **Examples**

### **Example 1: Detect MEV Attacks**

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8081');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'flagged') {
    const attack = message.data;
    
    console.log(`🚨 ${attack.attackType} attack detected!`);
    console.log(`Risk Score: ${attack.riskScore}/100`);
    console.log(`Estimated Loss: ${attack.estimatedLoss} ETH`);
    console.log(`Mitigation: ${attack.mitigation}`);
  }
};
```

---

### **Example 2: Analyze Transaction Before Sending**

```javascript
async function analyzeTransaction(tx) {
  const response = await fetch('http://localhost:8080/api/simulate-tx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction: {
        to: tx.to,
        value: tx.value,
        gasPrice: tx.gasPrice,
        data: tx.data
      },
      useFlashbots: false
    })
  });
  
  const result = await response.json();
  
  if (result.risk.level === 'high' || result.risk.level === 'critical') {
    console.warn('⚠️ HIGH RISK DETECTED');
    console.log('Recommendation:', result.recommendation);
    
    // Submit via Flashbots instead
    return submitViaFlashbots(tx);
  }
  
  return submitPublicly(tx);
}
```

---

### **Example 3: Submit via Flashbots**

```javascript
async function submitViaFlashbots(signedTx) {
  const response = await fetch('http://localhost:8080/api/sendPrivateTx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signedTransaction: signedTx,
      targetBlock: null,      // Use next block
      maxBlockNumber: null    // Try for 3 blocks
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Transaction submitted via Flashbots');
    console.log('Target Block:', result.targetBlock);
    console.log('Bundle Hash:', result.bundleHash);
  } else {
    console.error('❌ Flashbots submission failed');
  }
  
  return result;
}
```

---

### **Example 4: Monitor Mempool**

```javascript
async function monitorMempool() {
  const ws = new WebSocket('ws://localhost:8081');
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'transaction') {
      const tx = message.data;
      
      // Check if high gas price (potential MEV)
      if (parseFloat(tx.gasPrice) > 100) {
        console.log('🔥 High gas transaction detected:');
        console.log(`  Hash: ${tx.hash}`);
        console.log(`  Value: ${tx.value} ETH`);
        console.log(`  Gas: ${tx.gasPrice} Gwei`);
      }
    }
  };
}
```

---

### **Example 5: Generate Test Attack**

```bash
# Generate different attack types for testing
curl -X POST http://localhost:8080/api/demo/attack \
  -H "Content-Type: application/json" \
  -d '{"attackType": "SANDWICH"}'

curl -X POST http://localhost:8080/api/demo/attack \
  -H "Content-Type: application/json" \
  -d '{"attackType": "FRONTRUN"}'

curl -X POST http://localhost:8080/api/demo/attack \
  -H "Content-Type: application/json" \
  -d '{"attackType": "ARBITRAGE"}'
```

---

## 🔗 **Related Documentation**

- [Testing Guide](./TESTING-GUIDE.md) - Complete testing procedures
- [Compliance Audit](./COMPLIANCE-AUDIT.md) - Implementation status
- [Architecture](./ARCHITECTURE.md) - System architecture
- [Setup Guide](./SETUP.md) - Installation instructions

---

## 📞 **Support**

**Issues**: Report bugs on GitHub Issues  
**Questions**: Discord community  
**Updates**: Follow project changelog

---

**🏁 Built with ❤️ by the RaceSafe DeFi Team**
