# 🚀 Complete Setup Guide - RaceSafe DeFi

This guide will help you set up and run the entire F1 MEV Guard project from scratch.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed
- **Git** installed
- **MetaMask** browser extension
- **Code editor** (VS Code recommended)
- **Terminal** access

### Get API Keys:

1. **Alchemy Account** (for blockchain access)
   - Go to https://www.alchemy.com/
   - Sign up for free
   - Create a new app (Ethereum Mainnet & Sepolia)
   - Copy your API keys

2. **Etherscan Account** (for contract verification)
   - Go to https://etherscan.io/
   - Sign up and generate API key

3. **Flashbots** (optional for private txs)
   - Generate a signing key: `openssl rand -hex 32`

---

## 🔧 Installation

### Step 1: Clone & Install Root Dependencies

```bash
cd "d:\Projects\F1 Hacks\f1-mev-guard"
npm install
```

### Step 2: Configure Environment Variables

```bash
# Copy example env files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `.env` with your credentials:

```env
ALCHEMY_API_KEY=your_alchemy_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

⚠️ **NEVER commit your private keys!**

### Step 3: Install Backend Dependencies

```powershell
cd backend
npm install
cd ..
```

### Step 4: Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

---

## 🏗️ Smart Contract Deployment

### Step 1: Compile Contracts

```powershell
npx hardhat compile
```

Expected output:
```
Compiled 5 Solidity files successfully
```

### Step 2: Run Tests

```powershell
npx hardhat test
```

You should see all tests passing ✅

### Step 3: Start Local Hardhat Node

Open **Terminal 1**:

```powershell
npx hardhat node
```

This starts a local blockchain at `http://127.0.0.1:8545/`

### Step 4: Deploy Contracts

Open **Terminal 2**:

```powershell
npx hardhat run scripts/deploy.ts --network localhost
```

**Important:** Copy the deployed contract addresses!

Example output:
```
SafeRouter deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Update `backend/.env`:
```env
SAFE_ROUTER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_SAFE_ROUTER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## 🚀 Running the Application

You need **4 terminal windows**:

### Terminal 1: Hardhat Node (Already Running)

```powershell
# Keep this running
npx hardhat node
```

### Terminal 2: Backend Server

```powershell
cd backend
npm run dev
```

Expected output:
```
🏎️  RaceSafe DeFi Backend - ONLINE
📡 REST API:    http://localhost:8080
🔌 WebSocket:   ws://localhost:8081
🔍 Scanner:     Running
⚡ Flashbots:   Ready
```

### Terminal 3: Frontend Dashboard

```powershell
cd frontend
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3000
```

### Terminal 4: Testing & Simulation

Keep this terminal free for running tests and simulations.

---

## 🎯 Access the Dashboard

Open your browser and visit:

**http://localhost:3000**

You should see the F1-themed RaceSafe DeFi dashboard! 🏎️

---

## 🧪 Testing the System

### Test 1: Simulate an Attack

In Terminal 4:

```powershell
npx hardhat run scripts/simulate-attack.ts --network localhost
```

This will:
1. Execute a sandwich attack simulation
2. Trigger the MEV scanner
3. Show alerts in the dashboard

### Test 2: Check Backend API

```powershell
# In PowerShell or browser
Invoke-WebRequest http://localhost:8080/api/health | Select-Object -Expand Content

# Or visit in browser:
http://localhost:8080/api/health
```

### Test 3: Generate Demo Attack

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/demo/attack" -Method Post -ContentType "application/json" -Body '{"attackType":"SANDWICH"}'
```

Watch the dashboard for a new flagged transaction! 🚨

---

## 🔍 Verify Everything Works

Checklist:

- [ ] ✅ Hardhat node running
- [ ] ✅ Contracts deployed successfully
- [ ] ✅ Backend server online at :8080
- [ ] ✅ WebSocket server at :8081
- [ ] ✅ Frontend accessible at :3000
- [ ] ✅ Dashboard shows "Connected" status
- [ ] ✅ Can see live transactions
- [ ] ✅ Simulation creates flagged attack
- [ ] ✅ Risk gauge updates

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"

**Solution:**
```powershell
# Clean install
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

### Issue: "Port already in use"

**Solution:**
```powershell
# Kill process on port (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process

# Or use different port in .env
PORT=8090
```

### Issue: "WebSocket connection failed"

**Solution:**
- Check backend is running
- Verify `NEXT_PUBLIC_WS_URL` in frontend/.env
- Check firewall settings

### Issue: "Transaction reverted"

**Solution:**
- Ensure you have test ETH (Hardhat provides by default)
- Check contract is deployed
- Verify contract address in .env files

---

## 📊 Project Structure Overview

```
f1-mev-guard/
├── contracts/          ← Solidity smart contracts
├── scripts/            ← Deployment & test scripts
├── test/               ← Contract unit tests
├── backend/            ← Node.js MEV scanner
│   └── src/
│       ├── index.ts           ← API server
│       ├── mempool-scanner.ts ← MEV detection
│       └── flashbots-relay.ts ← Private tx relay
├── frontend/           ← Next.js dashboard
│   ├── pages/          ← Route pages
│   ├── components/     ← React components
│   └── hooks/          ← Custom hooks
└── docs/               ← Documentation
```

---

## 🚀 Deployment to Production

### Deploy Contracts to Sepolia Testnet

```powershell
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "FEE_RECIPIENT_ADDRESS"
```

### Deploy Backend (Railway/Render)

1. Push code to GitHub
2. Connect Railway/Render to repo
3. Set environment variables
4. Deploy

### Deploy Frontend (Vercel)

```powershell
cd frontend
npx vercel
```

Or connect GitHub repo to Vercel dashboard.

---

## 📝 Next Steps

1. ✅ Customize F1 theme colors
2. ✅ Add more attack pattern detection
3. ✅ Implement wallet connection
4. ✅ Add transaction simulation
5. ✅ Deploy to testnet
6. ✅ Share with team! 🏎️

---

## 🆘 Need Help?

- Check console logs in browser (F12)
- Check terminal output for errors
- Review Hardhat docs: https://hardhat.org/
- Review Next.js docs: https://nextjs.org/

---

**Built for F1 Hacks** 🏎️💨  
**Happy Racing!** 🏁
