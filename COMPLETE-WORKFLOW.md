# 🏎️ RaceSafe DeFi - Complete Workflow

## 📋 What You'll See & What Works

---

## 🎯 **The Full User Journey**

```
┌─────────────────────────────────────────────────────────────┐
│  1. DASHBOARD PAGE (Real-time Monitoring)                   │
├─────────────────────────────────────────────────────────────┤
│  URL: http://localhost:3000/dashboard                       │
│                                                              │
│  What You See:                                               │
│  ✅ Live transaction feed scrolling                         │
│  ✅ Risk gauge showing average threat level                 │
│  ✅ Stats panel with metrics                                │
│  ✅ Connection status (green = connected)                   │
│                                                              │
│  What Happens:                                               │
│  • WebSocket connects to backend (ws://localhost:8081)      │
│  • Backend scans mempool for suspicious activity            │
│  • Transactions appear in real-time                         │
│  • MEV attacks get FLAGGED (red alerts)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. PIT CREW PAGE (Flagged Transactions)                    │
├─────────────────────────────────────────────────────────────┤
│  URL: http://localhost:3000/pit-crew                        │
│                                                              │
│  What You See:                                               │
│  ✅ All flagged MEV attacks listed                          │
│  🚨 Attack type (SANDWICH, FRONTRUN, etc.)                  │
│  📊 Risk score (0-100)                                       │
│  💰 Estimated loss in ETH                                   │
│  💡 Mitigation recommendation                               │
│  ⚡ "SUBMIT VIA FLASHBOTS" button                           │
│                                                              │
│  What Happens When You Click Button:                        │
│  1. Button shows "SUBMITTING..." with spinner               │
│  2. Calls backend API: POST /api/sendPrivateTx              │
│  3. Backend routes transaction via Flashbots                │
│  4. Button turns green: "✅ PROTECTED VIA FLASHBOTS"        │
│  5. Transaction is now MEV-proof!                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 **Step-by-Step Demo Flow**

### **Step 1: Start Everything**

```powershell
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev

# Terminal 3 - Generate Demo Attacks (Optional)
# This simulates MEV attacks for testing
```

### **Step 2: Open Dashboard**

1. Navigate to: `http://localhost:3000/dashboard`
2. You should see:
   - ✅ **Green "Connected" status** in top-right
   - 🏎️ **"RACE FEED"** header with spinning car emoji
   - 📊 **Stats panel** on left side
   - 📜 **Transaction feed** on right side (may be empty initially)

### **Step 3: Generate a Test Attack**

```powershell
# Call the demo attack API
Invoke-RestMethod -Uri "http://localhost:8080/api/demo/attack" -Method Post -ContentType "application/json" -Body '{"attackType":"SANDWICH"}'
```

**What Happens:**

1. 🔴 Red alert appears on Dashboard
2. 🚨 Flagged transaction shows up
3. Transaction automatically appears on Pit Crew page

### **Step 4: Go to Pit Crew**

1. Navigate to: `http://localhost:3000/pit-crew`
2. You should see:
   - 🚨 **Red flagged transaction card**
   - 📊 **Risk Score**: 70-100
   - 💰 **Estimated Loss**: X.XX ETH
   - 💡 **Mitigation**: "Submit via Flashbots..."
   - ⚡ **Big red button**: "SUBMIT VIA FLASHBOTS"

### **Step 5: Protect the Transaction**

1. Click the **"SUBMIT VIA FLASHBOTS"** button
2. Watch the button:
   - Changes to "SUBMITTING..." with spinning ⚡
   - Shows loading state
3. After ~2 seconds:
   - Button turns **GREEN**
   - Text changes to "✅ PROTECTED VIA FLASHBOTS"
   - Alert popup shows success message

**Behind the Scenes:**

```javascript
// Frontend sends request
POST /api/sendPrivateTx
{
  "signedTransaction": "0x...",
  "targetBlock": null,
  "maxBlockNumber": null
}

// Backend processes
1. Creates Flashbots bundle
2. Simulates transaction
3. Submits to Flashbots relay
4. Monitors inclusion across 3 blocks
5. Returns success message

// Frontend updates
✅ Button state changes
✅ Transaction marked as protected
```

---

## 🎨 **What Each Page Shows**

### **Dashboard (`/dashboard`)**

**Purpose:** Real-time monitoring of ALL mempool activity

| Component             | What You See                   | Updates                 |
| --------------------- | ------------------------------ | ----------------------- |
| **Race Feed**         | Scrolling list of transactions | Real-time via WebSocket |
| **Risk Gauge**        | Circular gauge (0-100)         | Avg of flagged txs      |
| **Stats Panel**       | Total txs, flagged count       | Live counter            |
| **Connection Status** | Green/Red indicator            | WebSocket state         |

**Red Flags Appear Here:**

- ✅ Yes! When backend detects MEV attack
- 🚨 Shows attack type badge
- 📊 Displays risk score
- ⚡ Transaction gets added to Pit Crew

---

### **Pit Crew (`/pit-crew`)**

**Purpose:** Manage flagged transactions & take action

| Component            | What You See              | Action          |
| -------------------- | ------------------------- | --------------- |
| **Flagged Cards**    | Detailed attack info      | View details    |
| **Risk Score**       | Large red number (70-100) | Assess severity |
| **Mitigation**       | Recommended action        | Follow advice   |
| **Flashbots Button** | Submit protection         | **CLICK THIS!** |

**States of Submit Button:**

1. **Default State:**

   ```
   ⚡ SUBMIT VIA FLASHBOTS
   (Red gradient, hoverable)
   ```

2. **Submitting State:**

   ```
   ⚡ SUBMITTING...
   (Gray, spinner animation)
   ```

3. **Protected State:**
   ```
   ✅ PROTECTED VIA FLASHBOTS
   (Green, disabled)
   ```

---

## 🔄 **The Complete Data Flow**

```
┌──────────────┐
│  Blockchain  │ (Mempool activity)
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Backend (Port 8080)                 │
│  ─────────────────────                │
│  • mempool-scanner.ts                │
│  • mev-detection.service.ts          │
│  • risk-calculator.ts                │
└──────┬───────────────────────────────┘
       │
       ↓ (Detects MEV attack)
       │
       ├──→ WebSocket (Port 8081) ──→ Frontend Dashboard
       │                                   ↓
       │                            🚨 Shows red flag
       │                                   ↓
       │                            User goes to Pit Crew
       │                                   ↓
       │                            User clicks "SUBMIT VIA FLASHBOTS"
       │                                   ↓
       ↓                                   ↓
┌──────────────────────────────────────┐  │
│  Flashbots Relay                     │ ←┘
│  ─────────────────                   │
│  • flashbots-relay.ts                │
│  • Create bundle                     │
│  • Simulate transaction              │
│  • Submit to Flashbots network       │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Flashbots Network                   │
│  ─────────────────                   │
│  • Private mempool                   │
│  • Direct to miners                  │
│  • MEV-protected inclusion           │
└──────┬───────────────────────────────┘
       │
       ↓
    ✅ Transaction mined safely!
```

---

## 🎯 **What Works RIGHT NOW**

### ✅ **Fully Functional:**

1. **Backend WebSocket** - Live transaction streaming
2. **MEV Detection** - Flags sandwich/frontrun attacks
3. **Dashboard Display** - Real-time feed with red flags
4. **Pit Crew Page** - Shows all flagged transactions
5. **Flashbots Button** - NOW CONNECTED! Submits via API
6. **Risk Calculation** - Scores 0-100 based on threat
7. **Stats Tracking** - Live counters and metrics

### 🚧 **Simulated (For Demo):**

1. **Actual Mempool Scanning** - Uses demo mode if no RPC
2. **Flashbots Inclusion** - Simulates waiting for block
3. **Real Blockchain** - Works on localhost Hardhat network

### 🔜 **Production Ready (With Setup):**

To make it work on **real mainnet**:

1. Add Alchemy/Infura RPC in `.env`
2. Set `FLASHBOTS_AUTH_KEY` (your wallet private key)
3. Deploy SafeRouter contract to mainnet
4. Update `SAFE_ROUTER_ADDRESS` in `.env`

---

## 🧪 **Quick Test Commands**

### Generate Demo Attack:

```powershell
# Create a sandwich attack
Invoke-RestMethod -Uri "http://localhost:8080/api/demo/attack" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"attackType":"SANDWICH"}'

# Create a frontrun attack
Invoke-RestMethod -Uri "http://localhost:8080/api/demo/attack" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"attackType":"FRONTRUN"}'
```

### Check Backend Status:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health"
```

### Get Flagged Transactions:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/flagged"
```

### Test Flashbots Integration:

```powershell
.\test-flashbots.ps1
```

---

## 🎮 **Interactive Demo Script**

Run this for a full demo:

```powershell
# Start the demo
Write-Host "🏎️ Starting RaceSafe Demo..." -ForegroundColor Cyan

# 1. Generate attack
Write-Host "`n1️⃣ Generating MEV attack..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:8080/api/demo/attack" -Method Post -ContentType "application/json" -Body '{"attackType":"SANDWICH"}'

Write-Host "   ✅ Attack generated! Check Dashboard for red flag" -ForegroundColor Green

# 2. Wait for user
Write-Host "`n2️⃣ Open Dashboard: http://localhost:3000/dashboard" -ForegroundColor Yellow
Write-Host "   Look for 🚨 RED FLAG in the feed" -ForegroundColor Red

Read-Host "Press Enter when you see the red flag"

# 3. Navigate to Pit Crew
Write-Host "`n3️⃣ Open Pit Crew: http://localhost:3000/pit-crew" -ForegroundColor Yellow
Write-Host "   You'll see the flagged transaction with details" -ForegroundColor White

Read-Host "Press Enter when you're on Pit Crew page"

# 4. Explain button
Write-Host "`n4️⃣ Click the red button: ⚡ SUBMIT VIA FLASHBOTS" -ForegroundColor Yellow
Write-Host "   Watch it:" -ForegroundColor White
Write-Host "   • Turn gray (SUBMITTING...)" -ForegroundColor Gray
Write-Host "   • Then green (✅ PROTECTED)" -ForegroundColor Green

Write-Host "`n✅ Demo complete! Your transaction is now MEV-protected!" -ForegroundColor Green
```

---

## 📊 **Expected Results**

### Dashboard:

- See 1-10 transactions per second (simulated)
- Red flags appear when attack detected
- Risk gauge rises with more attacks
- Stats update in real-time

### Pit Crew:

- Empty state: "🏁 All Clear! No MEV attacks detected"
- With attacks: List of flagged transactions
- Click button: Transaction gets protected
- Button state changes: Default → Submitting → Protected

---

## 🎯 **Next Steps in Workflow**

After protecting a transaction via Flashbots:

1. **Monitor Inclusion** (automatic)

   - Backend watches for block inclusion
   - Tries up to 3 blocks
   - Reports success/failure

2. **View Results** (future feature)

   - See transaction hash
   - View block number
   - Check bundle stats

3. **Generate Report** (future feature)
   - Download protection summary
   - Export flagged transactions
   - Analytics dashboard

---

## 🚀 **Production Deployment**

To use this with **real MEV protection**:

1. **Configure Environment:**

```bash
# .env file
ETHEREUM_RPC_WSS=wss://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_RPC_HTTP=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
FLASHBOTS_AUTH_KEY=0xYOUR_PRIVATE_KEY
FLASHBOTS_RELAY_URL=https://relay.flashbots.net
SAFE_ROUTER_ADDRESS=0xYOUR_DEPLOYED_CONTRACT
```

2. **Deploy SafeRouter:**

```bash
npx hardhat run scripts/deploy.ts --network mainnet
```

3. **Start Services:**

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build && npm start
```

4. **Users can now:**

- View real mainnet mempool
- See actual MEV attacks
- Protect transactions via Flashbots
- Save gas and avoid losses

---

## ✅ **Summary**

| Feature                  | Status             | Where to See It       |
| ------------------------ | ------------------ | --------------------- |
| Live Mempool Feed        | ✅ Working         | Dashboard             |
| MEV Detection            | ✅ Working         | Dashboard (red flags) |
| Flagged Transaction List | ✅ Working         | Pit Crew              |
| Risk Scoring             | ✅ Working         | Both pages            |
| **Flashbots Button**     | ✅ **NOW WORKING** | **Pit Crew**          |
| Protection Status        | ✅ Working         | Button state change   |
| Real-time Updates        | ✅ Working         | WebSocket             |
| Stats & Metrics          | ✅ Working         | Dashboard left panel  |

**The workflow is COMPLETE!** 🏁

You can now:

1. See attacks on Dashboard ✅
2. View details on Pit Crew ✅
3. **Click button to protect via Flashbots** ✅
4. See success confirmation ✅
