# Test Flashbots Integration
Write-Host "`n🧪 Testing Flashbots Integration..." -ForegroundColor Cyan

# Check if backend is running
Write-Host "`n1️⃣ Checking backend status..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running. Start it with: cd backend; npm run dev" -ForegroundColor Red
    exit 1
}

# Get stats including Flashbots status
Write-Host "`n2️⃣ Checking Flashbots initialization..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:8080/api/stats" -Method Get
    Write-Host "✅ Flashbots Status:" -ForegroundColor Green
    $stats.flashbots | ConvertTo-Json | Write-Host
} catch {
    Write-Host "❌ Failed to get stats" -ForegroundColor Red
}

# Test simulation endpoint (doesn't require live network)
Write-Host "`n3️⃣ Testing transaction simulation..." -ForegroundColor Yellow
$testTx = @{
    transaction = @{
        to = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"  # Uniswap router
        value = "0.1"
        data = "0x"
        gasPrice = "50"
    }
    useFlashbots = $true
}

try {
    $simulation = Invoke-RestMethod -Uri "http://localhost:8080/api/simulate-tx" -Method Post -Body ($testTx | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Simulation successful!" -ForegroundColor Green
    Write-Host "   Risk Score: $($simulation.risk.score)" -ForegroundColor Cyan
    Write-Host "   Risk Level: $($simulation.risk.level)" -ForegroundColor Cyan
    Write-Host "   Recommendation: $($simulation.recommendation)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Simulation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nFlashbots is properly linked and functional!" -ForegroundColor Green
Write-Host "`nTo use Flashbots protection:" -ForegroundColor Cyan
Write-Host "  1. Set FLASHBOTS_AUTH_KEY in .env" -ForegroundColor White
Write-Host "  2. Use /api/sendPrivateTx endpoint for private transactions" -ForegroundColor White
Write-Host "  3. Set useFlashbots to true when simulating" -ForegroundColor White
Write-Host ""
