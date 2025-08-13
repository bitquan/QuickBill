# QuickBill API Keys Setup (PowerShell)
Write-Host "🚀 QuickBill API Keys Setup" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check current status
Write-Host "📋 Current Status:" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow

if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    Write-Host "✅ Environment file found" -ForegroundColor Green
    
    if ($envContent -match "pk_live_|pk_test_") {
        Write-Host "✅ Stripe: Configured" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Stripe: Needs setup" -ForegroundColor Yellow
    }
    
    if ($envContent -notmatch "quickbill_emailjs_key_123") {
        Write-Host "✅ EmailJS: Configured" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  EmailJS: Needs setup" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ Environment file missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "📧 EmailJS Setup Instructions:" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "You're already in EmailJS dashboard. Follow these steps:" -ForegroundColor White
Write-Host ""
Write-Host "1. Click 'Add New Service' (connect Gmail or preferred email)" -ForegroundColor White
Write-Host "2. Copy the Service ID that appears" -ForegroundColor White
Write-Host "3. Go to 'Email Templates' tab" -ForegroundColor White
Write-Host "4. Click 'Create New Template'" -ForegroundColor White
Write-Host "5. Name: 'QuickBill Invoice'" -ForegroundColor White
Write-Host "6. Subject: Invoice {{invoice_number}} from {{business_name}}" -ForegroundColor White
Write-Host "7. Save and copy Template ID" -ForegroundColor White
Write-Host "8. Go to Account > General and copy Public Key" -ForegroundColor White
Write-Host ""

# Get EmailJS credentials
$serviceId = Read-Host "Enter your EmailJS Service ID"
$templateId = Read-Host "Enter your EmailJS Template ID"  
$publicKey = Read-Host "Enter your EmailJS Public Key"

Write-Host ""
Write-Host "💳 Stripe Status Check:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    if ($envContent -match "VITE_STRIPE_PUBLISHABLE_KEY=(.+)") {
        $currentKey = $matches[1]
        Write-Host "Current Stripe Key: $currentKey" -ForegroundColor White
    }
    if ($envContent -match "VITE_STRIPE_PRO_PRICE_ID=(.+)") {
        $currentPrice = $matches[1]  
        Write-Host "Current Price ID: $currentPrice" -ForegroundColor White
    }
}

$updateStripe = Read-Host "`nUpdate Stripe keys? (y/n)"
$newStripeKey = ""
$newPriceId = ""

if ($updateStripe -eq "y") {
    Write-Host "`nStripe Setup:" -ForegroundColor Yellow
    Write-Host "1. Go to https://dashboard.stripe.com/apikeys" -ForegroundColor White
    Write-Host "2. Copy Publishable key (pk_test_ or pk_live_)" -ForegroundColor White
    Write-Host "3. Go to Products, create 'QuickBill Pro' at $4.99/month" -ForegroundColor White
    Write-Host "4. Copy Price ID" -ForegroundColor White
    Write-Host ""
    
    $newStripeKey = Read-Host "Enter Stripe Publishable Key"
    $newPriceId = Read-Host "Enter Stripe Price ID"
}

# Update .env file
Write-Host "`n🔧 Updating environment file..." -ForegroundColor Yellow

if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    
    # Update EmailJS
    $envContent = $envContent -replace "VITE_EMAILJS_SERVICE_ID=.*", "VITE_EMAILJS_SERVICE_ID=$serviceId"
    $envContent = $envContent -replace "VITE_EMAILJS_TEMPLATE_ID=.*", "VITE_EMAILJS_TEMPLATE_ID=$templateId"  
    $envContent = $envContent -replace "VITE_EMAILJS_PUBLIC_KEY=.*", "VITE_EMAILJS_PUBLIC_KEY=$publicKey"
    
    # Update Stripe if requested
    if ($newStripeKey -ne "") {
        $envContent = $envContent -replace "VITE_STRIPE_PUBLISHABLE_KEY=.*", "VITE_STRIPE_PUBLISHABLE_KEY=$newStripeKey"
    }
    if ($newPriceId -ne "") {
        $envContent = $envContent -replace "VITE_STRIPE_PRO_PRICE_ID=.*", "VITE_STRIPE_PRO_PRICE_ID=$newPriceId"  
    }
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Environment file updated!" -ForegroundColor Green
}
else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Build and deploy
Write-Host ""
$deploy = Read-Host "Build and deploy now? (y/n)"

if ($deploy -eq "y") {
    Write-Host "`n🔨 Building..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
        
        Write-Host "`n🚀 Deploying..." -ForegroundColor Yellow
        firebase deploy --only hosting
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n🎉 LAUNCH SUCCESSFUL!" -ForegroundColor Green
            Write-Host "🌐 Live URL: https://quickbill-app-b2467.web.app" -ForegroundColor Blue
            Write-Host "`n✅ Your QuickBill app is now LIVE with:" -ForegroundColor Green
            Write-Host "  - Working email integration" -ForegroundColor White
            Write-Host "  - Stripe payment processing" -ForegroundColor White  
            Write-Host "  - All Pro features enabled" -ForegroundColor White
        }
        else {
            Write-Host "❌ Deployment failed!" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
    }
}
else {
    Write-Host "`n⚠️  Remember to run:" -ForegroundColor Yellow
    Write-Host "npm run build" -ForegroundColor White
    Write-Host "firebase deploy --only hosting" -ForegroundColor White
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
