# QuickBill Launch Verification Script (PowerShell)
# Run this to verify all systems are go for launch

Write-Host "🚀 QUICKBILL LAUNCH VERIFICATION" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ 1. BUILD VERIFICATION" -ForegroundColor Green
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Build failed - CANNOT LAUNCH" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Build failed - CANNOT LAUNCH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ 2. DEPLOYMENT VERIFICATION" -ForegroundColor Green
try {
    firebase deploy --only hosting
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Deployment failed - CANNOT LAUNCH" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Deployment failed - CANNOT LAUNCH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ 3. ENVIRONMENT CHECK" -ForegroundColor Green
if (Test-Path .env) {
    Write-Host "✅ Environment file exists" -ForegroundColor Green
    $envContent = Get-Content .env -Raw
    if ($envContent -match "VITE_STRIPE_PUBLISHABLE_KEY") {
        Write-Host "✅ Stripe keys configured" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Stripe keys not configured" -ForegroundColor Yellow
    }
    if ($envContent -match "VITE_EMAILJS_SERVICE_ID") {
        Write-Host "✅ EmailJS keys configured" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  EmailJS keys not configured" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ No .env file - NEED TO CONFIGURE" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ 4. LIVE APP CHECK" -ForegroundColor Green
Write-Host "🌐 Live URL: https://quickbill-app-b2467.web.app" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 MANUAL TESTING REQUIRED:" -ForegroundColor Yellow
Write-Host "- Test user registration/login" -ForegroundColor White
Write-Host "- Create and preview an invoice" -ForegroundColor White
Write-Host "- Test payment flow (if Stripe keys are real)" -ForegroundColor White
Write-Host "- Test email sending (if EmailJS keys are real)" -ForegroundColor White
Write-Host ""
Write-Host "🎯 LAUNCH STATUS:" -ForegroundColor Cyan
if (Test-Path .env) {
    Write-Host "✅ READY FOR LAUNCH (pending real API keys)" -ForegroundColor Green
}
else {
    Write-Host "❌ NOT READY - Fix issues above" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Happy launching! 🎉" -ForegroundColor Magenta
