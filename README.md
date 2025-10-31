# 🏎️ RaceSafe DeFi – F1 MEV Guard

**Full-Cycle DeFi Security & MEV Mitigation Dashboard with Formula-1 Theme**

---

## 🎯 Overview

RaceSafe DeFi is a comprehensive blockchain security system that combines:
1. **Hardened Smart Contracts** – Security-first DeFi router with reentrancy guards, slippage protection, and circuit breakers
2. **Real-time MEV Detection** – Mempool scanning for front-running, sandwich attacks, and gas manipulation
3. **Private Transaction Relay** – Flashbots integration to bypass public mempool
4. **F1-Themed Dashboard** – Race telemetry-style UI for monitoring and mitigation

---

## 🏗️ Project Structure

```
f1-mev-guard/
├── contracts/           # Hardened Solidity contracts
│   ├── SafeRouter.sol
│   └── mocks/
├── hardhat/            # Hardhat config & scripts
│   ├── hardhat.config.ts
│   ├── scripts/
│   └── test/
├── backend/            # Node.js MEV detection engine
│   ├── src/
│   │   ├── mempool-scanner.ts
│   │   ├── flashbots-relay.ts
│   │   └── api.ts
│   └── package.json
├── frontend/           # Next.js F1-themed dashboard
│   ├── pages/
│   ├── components/
│   └── styles/
└── docs/              # Audit reports & documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Alchemy/Infura API key
- Flashbots RPC endpoint

### Installation

```bash
# Clone and install dependencies
cd f1-mev-guard

# Install contract dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. **Copy environment files:**
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. **Configure API keys in `.env` files**

### Running the Project

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost

# Terminal 3: Start backend MEV scanner
cd backend
npm run dev

# Terminal 4: Start frontend dashboard
cd frontend
npm run dev
```

Visit `http://localhost:3000` for the F1 Dashboard 🏎️

---

## 🔒 Phase I: Smart Contract Security

### SafeRouter.sol Features
- ✅ Reentrancy Guard (OpenZeppelin)
- ✅ Slippage Protection (minAmountOut enforcement)
- ✅ Circuit Breaker (Pausable)
- ✅ Access Control (Ownable)
- ✅ Event Logging for auditing
- ✅ Input validation & safe math

### Testing
```bash
npx hardhat test
npx hardhat coverage
```

---

## ⚡ Phase II: MEV Detection & Mitigation

### Backend Components

**Mempool Scanner**
- Real-time WebSocket monitoring
- Pattern detection for sandwich/front-running attacks
- Risk scoring algorithm (0-100)
- Sub-second alert latency

**Flashbots Relay**
- Private transaction submission
- Bundle simulation
- MEV-protected execution

**Simulation Engine**
- Fork-based transaction replay
- Slippage estimation
- Loss prediction

### API Endpoints

```
GET  /api/health              # System status
GET  /api/mempool/live        # Live mempool feed
GET  /api/flagged             # Flagged transactions
POST /api/sendPrivateTx       # Submit via Flashbots
POST /api/simulate            # Simulate transaction
WS   /ws                      # WebSocket live updates
```

---

## 🖥️ Frontend Dashboard

### Pages

1. **Race Feed** (`/`) – Live mempool activity with F1 telemetry
2. **Pit Crew** (`/pit-crew`) – Flagged transactions & mitigations
3. **Garage** (`/garage`) – Smart contract security status
4. **Simulation** (`/simulation`) – Test transaction scenarios

### F1 Theme Elements

- 🏎️ Speedometer-style risk gauge
- 🚦 Traffic light status indicators
- 📊 Race telemetry charts
- ⚡ Pit stop alerts for mitigations
- 🎨 Red/Black/White color scheme with glow effects

---

## 🧪 Testing & Demo

### Simulate MEV Attack

```bash
# Run demo attack scenario
npx hardhat run scripts/simulate-attack.ts --network localhost
```

This will:
1. Deploy victim transaction
2. Execute sandwich attack
3. Trigger scanner detection
4. Display mitigation in dashboard

### Expected Results
- ✅ Scanner flags attack within <1s
- ✅ Dashboard shows real-time alert
- ✅ Flashbots mitigation available
- ✅ Risk score calculated

---

## 📊 Audit Reports

- `docs/audit-initial.png` – Pre-hardening scan
- `docs/audit-final.png` – Post-hardening verification
- Simulated SecureDApp Audit Express results

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| Contracts | Solidity 0.8.19, Hardhat, OpenZeppelin |
| Backend | Node.js, TypeScript, ethers.js, Flashbots SDK |
| Frontend | Next.js 14, React 18, TailwindCSS, Framer Motion |
| Blockchain | Alchemy/Infura WebSocket, Ethereum Mainnet/Sepolia |
| Charts | Recharts, ApexCharts |

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

