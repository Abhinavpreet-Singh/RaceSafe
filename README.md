# 🏎️ RaceSafe – Real-Time MEV Protection Dashboard

**Team: Dive Into Infinity**

A comprehensive blockchain security platform featuring hardened smart contracts,
live MEV attack detection, and Flashbots protection with Formula-1 themed racing
UI.

---

## 🎯 Overview

RaceSafe DeFi provides full-cycle DeFi security and MEV mitigation:

1. **Hardened Smart Contracts** – SafeRouter with reentrancy guards, slippage
   protection, and circuit breakers

   - **SecureDApp Audit Scores**: 92.15 → 93.1 → 95.0 (Final)
   - Tested on SecureDApp Audit Express

2. **Real-time MEV Detection** – Live mempool scanning with auto-attack
   simulation at 50% probability

   - Front-running, sandwich attacks, and backrun detection
   - Sub-second detection (<1s)
   - Risk scoring algorithm (5 = SAFE, 95 = CRITICAL)

3. **Flashbots Protection** – SafeRouter transactions bypass public mempool with
   $0.00 loss

   - VulnerableRouter shows real attack scenarios with $$$ losses
   - Auto-attack mode demonstrates protection effectiveness

4. **F1-Themed Dashboard** – Race telemetry UI with live WebSocket feed
   - Real Sepolia testnet transactions
   - Etherscan verification buttons
   - Color-coded risk indicators (Green = Protected, Red = Exploited)

---

## 🏗️ Project Structure

```
formula_hacks_p/
├── contracts/                    # Smart Contracts
│   ├── SafeRouter.sol           # Protected router (Score: 95.0)
│   └── VulnerableRouter.sol     # Vulnerable for demo
├── backend/                     # MEV Detection Engine
│   └── src/
│       ├── index.ts             # API + WebSocket server
│       ├── mempool-scanner.ts   # Real-time Sepolia monitoring
│       └── mev-attack-bot.ts    # Auto-attack simulator (50%)
├── frontend/                    # Next.js Dashboard
│   ├── pages/
│   │   ├── dashboard.tsx        # Main monitoring page
│   │   ├── audit-report.tsx     # SecureDApp-style audit page
│   │   └── simulation.tsx       # Attack simulation
│   └── components/
│       ├── RaceFeed.tsx         # Live transaction feed
│       ├── FlashbotsProtection.tsx
│       └── RiskGauge.tsx
├── scripts/
│   ├── deploy-both.ts           # Deploy both routers
│   └── test-real-swap.ts        # Generate test transactions
└── docs/
    ├── audit-initial.md         # Score: 92.15
    ├── audit-final.md           # Score: 95.0
    └── COMPLETE-WORKFLOW.md     # Full demo guide
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Alchemy API key (for Sepolia testnet)
- Private key with Sepolia ETH

### Installation

```powershell
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Configuration

Create `.env` files with your keys:

**Root `.env`**

```env
ALCHEMY_API_KEY=your_alchemy_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
PRIVATE_KEY=your_private_key
```

**`backend/.env`**

```env
ETHEREUM_RPC_WSS=wss://eth-sepolia.g.alchemy.com/v2/your_key
SAFE_ROUTER_ADDRESS=0x90F45f3aebAe48328bE84c9d724152b46f234840
VULNERABLE_ROUTER_ADDRESS=0x3E75c835D47B93dd59C4Dd1B05717c8e43B7C401
AUTO_ATTACK_ENABLED=true
```

### Running the System (4 Terminals)

```powershell
# Terminal 1: Start Hardhat Node
npx hardhat node

# Terminal 2: Deploy Contracts
npx hardhat run scripts/deploy-both.ts --network sepolia

# Terminal 3: Start Backend (MEV Scanner)
cd backend
npm run dev

# Terminal 4: Start Frontend Dashboard
cd frontend
npm run dev
```

Visit **http://localhost:3000** 🏎️

### Generate Test Transactions

```powershell
# Sends 3 transactions to SafeRouter (always protected)
npx hardhat run scripts/test-real-swap.ts --network sepolia
```

---

## 🔒 Smart Contract Security

### SafeRouter.sol – SecureDApp Audit Scores

**Progressive Hardening:**

- Initial Score: **92.15/100** (9 total vulnerabilities: 6 Low, 3 Info)
- Intermediate: **93.1/100** (reduced to 6 vulnerabilities)
- **Final Score: 95.0/100** (optimized, production-ready)

Tested on **SecureDApp Audit Express** with full vulnerability analysis.

### Security Features Implemented

- ✅ ReentrancyGuard (OpenZeppelin) – Prevents reentrant calls
- ✅ Slippage Protection – Enforces minAmountOut
- ✅ Pausable Circuit Breaker – Emergency stop mechanism
- ✅ Ownable Access Control – Admin-only functions
- ✅ SafeERC20 Transfers – Safe token handling
- ✅ Router Whitelist – Only approved DEX routers
- ✅ Fee Limits – Maximum 1% protocol fee
- ✅ Comprehensive Event Logging


---

## ⚡ Real-Time MEV Detection & Auto-Attack

### How It Works

1. **Mempool Scanner** monitors Sepolia testnet via Alchemy WebSocket
2. **Auto-Attack Mode** – Randomly attacks detected transactions
3. **Smart Contract Detection**:
   - **SafeRouter** → riskScore=5, $0.00 loss, ✅ BLOCKED (Always Green)
   - **VulnerableRouter** → riskScore=95, $$$ loss, ❌ SUCCESSFUL (Always Red)

### Detection Performance

- ⚡ Detection Time: **<1 second**
- 📊 Risk Scoring: **5 (Protected) to 95 (Critical)**
- 🎯 Attack Types: Front-running, Sandwich, Backrun
- 🔄 Real Transactions: Live Sepolia testnet monitoring

### Backend Components

**Mempool Scanner** (`backend/src/mempool-scanner.ts`)

- WebSocket connection to Sepolia
- Real-time transaction monitoring
- Pattern detection algorithms

**MEV Attack Bot** (`backend/src/mev-attack-bot.ts`)

- Simulates front-running attacks
- Simulates sandwich attacks
- Simulates backrun attacks
- probability execution

**API Server** (`backend/src/index.ts`)

- Express.js REST API
- WebSocket server for live updates
- Transaction flagging system

### API Endpoints

```
GET  /api/health              # System status
GET  /api/live-transactions   # Live mempool feed
GET  /api/flagged-transactions # Flagged attacks
WS   ws://localhost:8081      # WebSocket live feed
```

---

## 🖥️ F1-Themed Dashboard

### Pages

1. **Dashboard** (`/dashboard`) – Live mempool feed with auto-attack monitoring

   - Real-time WebSocket updates
   - Color-coded risk indicators (Green = Safe, Red = Exploited)
   - Etherscan verification buttons
   - Latest transactions on top
   - Toggle filters: Demo Mode, ETH > 0, View All

2. **Audit Report** (`/audit-report`) – SecureDApp-style vulnerability analysis

   - Smart contract auditing interface
   - Vulnerability scoring (92.15 → 93.1 → 95.0)
   - Detailed vulnerability breakdown (Critical, High, Medium, Low, Info, Gas)
   - SecureDApp methodology:
     `score = 5 - ((critical + high + medium) / 30) * 5 * 20`

3. **Simulation** (`/simulation`) – Attack scenario testing

   - Front-run attack simulation
   - Sandwich attack simulation
   - Risk assessment visualization

4. **Garage** (`/garage`) – Contract status monitoring
   - SafeRouter deployment info
   - Security features overview

### F1 Racing Theme Elements

- 🏎️ **Speedometer Risk Gauge** – 0-100 risk scoring with dynamic colors
- 🚦 **Traffic Light Indicators** – Green (Protected), Red (Exploited)
- � **Live Telemetry Feed** – Real-time transaction monitoring
- ⚡ **Pit Stop Alerts** – MEV attack notifications
- 🎨 **F1 Color Scheme** – Red (#E10600), Black, White with neon glow effects
- 🏁 **Racing Stripes** – Animated backgrounds for flagged transactions

---

## 🧪 Testing & Demo

### Generate Live Transactions

```powershell
# Send 3 test transactions to SafeRouter (always protected)
npx hardhat run scripts/test-real-swap.ts --network sepolia
```

**Expected Behavior:**

1. ✅ Backend detects transactions in <1 second
2. ✅ Auto-attack executes or skips
3. ✅ SafeRouter transactions show:
   - 🟢 Risk Score: 5/100
   - 🟢 Status: ✅ BLOCKED
   - 🟢 Loss: $0.00
   - 🟢 Protection: Flashbots private relay
4. ✅ Dashboard updates via WebSocket
5. ✅ Etherscan verification available

### Testing SafeRouter vs VulnerableRouter

**SafeRouter (Protected):**

- Risk Score: 5-49
- Attack Status: ✅ BLOCKED
- Estimated Loss: $0.00
- Color: 🟢 Green (Always)

**VulnerableRouter (Vulnerable):**

- Risk Score: 95
- Attack Status: ❌ SUCCESSFUL
- Estimated Loss: $1.50 - $4.50
- Color: 🔴 Red (Always)

### Run Local Demo

```powershell
# Terminal 1: Local Hardhat node
npx hardhat node

# Terminal 2: Deploy to localhost
npx hardhat run scripts/deploy-both.ts --network localhost

# Terminal 3: Start backend
cd backend && npm run dev

# Terminal 4: Start frontend
cd frontend && npm run dev

# Terminal 5: Simulate attacks
npx hardhat run scripts/simulate-mev-attack.ts --network localhost
```

---

## 📊 Security Audit Progression

**Tested on SecureDApp Audit Express**

### Audit Timeline

1. **Initial Audit** – Score: **92.15/100**

   - 9 vulnerabilities found (6 Low, 3 Informational)
   - File: `docs/audit-initial.md`

2. **Intermediate Hardening** – Score: **93.1/100**

   - 6 vulnerabilities remaining
   - Applied security best practices

3. **Final Production** – Score: **95.0/100** ✅
   - Fully optimized and production-ready
   - File: `docs/audit-final.md`

### Vulnerability Analysis

- **Critical:** 0
- **High:** 0
- **Medium:** 0
- **Low:** 6 → 3 → 0 (eliminated)
- **Informational:** 3 (code quality improvements)
- **Gas Optimization:** Multiple improvements applied

### SecureDApp Scoring Formula

```
score = 5 - ((critical + high + medium) / 30) * 5
scaledScore = score * 20  // Convert to 0-100 scale
```

Result: **95.0/100** indicates EXCELLENT security posture

---

## 🛠️ Tech Stack

| Layer      | Technologies                                       |
| ---------- | -------------------------------------------------- |
| Contracts  | Solidity 0.8.19, Hardhat, OpenZeppelin             |
| Backend    | Node.js, TypeScript, ethers.js, Flashbots SDK      |
| Frontend   | Next.js 14, React 18, TailwindCSS, Framer Motion   |
| Blockchain | Alchemy/Infura WebSocket, Ethereum Mainnet/Sepolia |
| Charts     | Recharts, ApexCharts                               |

---

## 🏁 Deployment

### Testnet (Sepolia)

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### Production

- Frontend: Vercel
- Backend: Railway/Render
- Contracts: Ethereum Mainnet

---

## 📝 License

MIT License

---

## 🤝 Contributing

Built for F1 Hacks – Secure DeFi Racing Edition 🏎️💨
