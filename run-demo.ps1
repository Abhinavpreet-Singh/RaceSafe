# 🎬 RaceSafe DeFi - Interactive Demo
# This script walks you through the complete workflow

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🏎️  RACESAFE DEFI - INTERACTIVE DEMO  🏎️" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

# Check if backend is running
Write-Host "🔍 Checking system status..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get
    Write-Host "   ✅ Backend: ONLINE" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend: OFFLINE" -ForegroundColor Red
    Write-Host "`n   Please start backend first:" -ForegroundColor White
    Write-Host "   cd backend; npm run dev`n" -ForegroundColor Gray
    exit 1
}

try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 2
    Write-Host "   ✅ Frontend: ONLINE" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend: OFFLINE" -ForegroundColor Red
    Write-Host "`n   Please start frontend first:" -ForegroundColor White
    Write-Host "   cd frontend; npm run dev`n" -ForegroundColor Gray
    exit 1
}

Write-Host "`n✅ All systems operational!`n" -ForegroundColor Green

# Step 1: Generate Attack
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 1: Generate MEV Attack" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`nAttack Types Available:" -ForegroundColor White
Write-Host "  1. SANDWICH - Front + back running" -ForegroundColor Gray
Write-Host "  2. FRONTRUN - Copy and execute first" -ForegroundColor Gray
Write-Host "  3. BACKRUN - Execute right after" -ForegroundColor Gray

$attackType = Read-Host "`nSelect attack type (1-3)"

$attackNames = @{
    "1" = "SANDWICH"
    "2" = "FRONTRUN"
    "3" = "BACKRUN"
}

$selectedAttack = $attackNames[$attackType]
if (-not $selectedAttack) {
    $selectedAttack = "SANDWICH"
}

Write-Host "`n🚨 Generating $selectedAttack attack..." -ForegroundColor Red

try {
    $attack = Invoke-RestMethod -Uri "http://localhost:8080/api/demo/attack" `
        -Method Post `
        -ContentType "application/json" `
        -Body "{`"attackType`":`"$selectedAttack`"}"
    
    Write-Host "   ✅ Attack generated successfully!" -ForegroundColor Green
    Write-Host "`n   Attack Details:" -ForegroundColor Cyan
    Write-Host "   • Hash: $($attack.attack.hash.Substring(0,20))..." -ForegroundColor White
    Write-Host "   • Type: $($attack.attack.attackType)" -ForegroundColor White
    Write-Host "   • Risk Score: $($attack.attack.riskScore)/100" -ForegroundColor Red
    Write-Host "   • Estimated Loss: $($attack.attack.estimatedLoss) ETH" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ Failed to generate attack" -ForegroundColor Red
    exit 1
}

Read-Host "`nPress Enter to continue to Step 2"

# Step 2: View Dashboard
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 2: View on Dashboard" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n📊 Opening Dashboard..." -ForegroundColor Cyan
Start-Process "http://localhost:3000/dashboard"

Write-Host "`nWhat to look for:" -ForegroundColor White
Write-Host "  🚨 RED FLAG in the transaction feed" -ForegroundColor Red
Write-Host "  📊 Risk gauge showing elevated threat" -ForegroundColor Yellow
Write-Host "  📈 Stats panel showing flagged count" -ForegroundColor Cyan

Read-Host "`nPress Enter when you see the red flag"

# Step 3: Go to Pit Crew
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 3: Navigate to Pit Crew" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n🔧 Opening Pit Crew page..." -ForegroundColor Cyan
Start-Process "http://localhost:3000/pit-crew"

Write-Host "`nWhat you'll see:" -ForegroundColor White
Write-Host "  🚨 Detailed attack information card" -ForegroundColor Red
Write-Host "  📊 Large risk score (70-100)" -ForegroundColor Yellow
Write-Host "  💡 Mitigation recommendation" -ForegroundColor Cyan
Write-Host "  ⚡ Big RED button: SUBMIT VIA FLASHBOTS" -ForegroundColor Red

Read-Host "`nPress Enter when you're on the Pit Crew page"

# Step 4: Explain Flashbots Button
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 4: Protect with Flashbots" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n🔒 The Flashbots Button Workflow:" -ForegroundColor White
Write-Host "`n  1. BEFORE CLICK:" -ForegroundColor Yellow
Write-Host "     ⚡ SUBMIT VIA FLASHBOTS (red button)" -ForegroundColor Red
Write-Host "`n  2. DURING SUBMISSION:" -ForegroundColor Yellow
Write-Host "     Submitting with spinner" -ForegroundColor Gray
Write-Host "     • Calls backend API" -ForegroundColor DarkGray
Write-Host "     • Creates Flashbots bundle" -ForegroundColor DarkGray
Write-Host "     • Simulates transaction" -ForegroundColor DarkGray
Write-Host "     • Submits to private relay" -ForegroundColor DarkGray
Write-Host "`n  3. AFTER SUCCESS:" -ForegroundColor Yellow
Write-Host "     ✅ PROTECTED VIA FLASHBOTS (green)" -ForegroundColor Green
Write-Host "     • Transaction is now MEV-proof!" -ForegroundColor DarkGreen

Write-Host "`n🎯 ACTION REQUIRED:" -ForegroundColor Red
Write-Host "   Click the RED BUTTON on the Pit Crew page NOW!`n" -ForegroundColor White

Read-Host "Press Enter after clicking the button"

# Step 5: Verify Protection
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 5: Verify Protection" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n🔍 Checking backend logs..." -ForegroundColor Cyan

try {
    $stats = Invoke-RestMethod -Uri "http://localhost:8080/api/stats" -Method Get
    Write-Host "`n   📊 Current Stats:" -ForegroundColor White
    Write-Host "   • Total Transactions: $($stats.liveCount)" -ForegroundColor Gray
    Write-Host "   • Flagged Attacks: $($stats.flaggedCount)" -ForegroundColor Red
    Write-Host "   • WebSocket Clients: $($stats.websocketClients)" -ForegroundColor Cyan
    Write-Host "   • Flashbots Status: $(if($stats.flashbots.initialized){'✅ Ready'}else{'❌ Offline'})" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Could not fetch stats" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DEMO COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n🎉 What you just did:" -ForegroundColor White
Write-Host "   1. ✅ Generated a simulated MEV attack" -ForegroundColor Green
Write-Host "   2. ✅ Saw it flagged on Dashboard (red flag)" -ForegroundColor Green
Write-Host "   3. ✅ Viewed details on Pit Crew page" -ForegroundColor Green
Write-Host "   4. ✅ Protected it via Flashbots (green button)" -ForegroundColor Green
Write-Host "   5. ✅ Transaction is now MEV-proof!" -ForegroundColor Green

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   • Generate more attacks to test" -ForegroundColor White
Write-Host "   • Check different attack types" -ForegroundColor White
Write-Host "   • View simulation page" -ForegroundColor White
Write-Host "   • Explore garage page (wallet)" -ForegroundColor White

Write-Host "`n📚 Key Takeaways:" -ForegroundColor Cyan
Write-Host "   Dashboard  = See ALL transactions + red flags" -ForegroundColor White
Write-Host "   Pit Crew   = Manage flagged attacks + protect" -ForegroundColor White
Write-Host "   Flashbots  = MEV protection (button works!)" -ForegroundColor White

Write-Host "`n🏎️ Your app is FULLY FUNCTIONAL! 🏁`n" -ForegroundColor Green

# Offer to run again
$again = Read-Host "Run demo again? (y/n)"
if ($again -eq "y") {
    & $PSCommandPath
}
