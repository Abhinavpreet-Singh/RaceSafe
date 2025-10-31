# RaceSafe DeFi - Quick Setup Script for Windows PowerShell
# Run this script to set up the project quickly

Write-Host "🏎️  RaceSafe DeFi - Quick Setup" -ForegroundColor Red
Write-Host "=" * 60 -ForegroundColor Red
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install root dependencies
Write-Host "1/3 Installing root dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host ""
Write-Host "2/3 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Install frontend dependencies
Write-Host ""
Write-Host "3/3 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Set up environment files
Write-Host "⚙️  Setting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env already exists, skipping" -ForegroundColor Yellow
}

if (-not (Test-Path backend\.env)) {
    Copy-Item backend\.env.example backend\.env
    Write-Host "✅ Created backend\.env" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend\.env already exists, skipping" -ForegroundColor Yellow
}

if (-not (Test-Path frontend\.env)) {
    Copy-Item frontend\.env.example frontend\.env
    Write-Host "✅ Created frontend\.env" -ForegroundColor Green
} else {
    Write-Host "⚠️  frontend\.env already exists, skipping" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Edit .env files with your API keys:" -ForegroundColor Cyan
Write-Host "   - .env (Alchemy, private key)" -ForegroundColor White
Write-Host "   - backend\.env (WebSocket RPC)" -ForegroundColor White
Write-Host "   - frontend\.env (API URLs)" -ForegroundColor White
Write-Host ""
Write-Host "2. Open 4 terminal windows and run:" -ForegroundColor Cyan
Write-Host "   Terminal 1: " -ForegroundColor White -NoNewline
Write-Host "npx hardhat node" -ForegroundColor Yellow
Write-Host "   Terminal 2: " -ForegroundColor White -NoNewline
Write-Host "npx hardhat run scripts\deploy.ts --network localhost" -ForegroundColor Yellow
Write-Host "   Terminal 3: " -ForegroundColor White -NoNewline
Write-Host "cd backend; npm run dev" -ForegroundColor Yellow
Write-Host "   Terminal 4: " -ForegroundColor White -NoNewline
Write-Host "cd frontend; npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Visit the dashboard:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - QUICKSTART.md" -ForegroundColor White
Write-Host "   - SETUP.md" -ForegroundColor White
Write-Host ""
Write-Host "🏎️  Happy Racing!" -ForegroundColor Red
Write-Host ""
