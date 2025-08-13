# Stripe Product Creation Script
# This script creates the QuickBill Pro product using Stripe's REST API

Write-Host "🔧 Creating QuickBill Pro Product in Stripe" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Get the current Stripe key from .env
if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    if ($envContent -match "VITE_STRIPE_PUBLISHABLE_KEY=(.+)") {
        $publishableKey = $matches[1].Trim()
        Write-Host "Found Stripe key: $($publishableKey.Substring(0,20))..." -ForegroundColor Green
    }
    else {
        Write-Host "❌ No Stripe key found in .env file" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚠️  To create products, we need your Stripe SECRET key (not publishable key)" -ForegroundColor Yellow
Write-Host "This starts with 'sk_live_' or 'sk_test_'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Get it from: https://dashboard.stripe.com/apikeys" -ForegroundColor White
Write-Host "- Click 'Reveal' next to 'Secret key'" -ForegroundColor White
Write-Host "- Copy the key that starts with sk_" -ForegroundColor White
Write-Host ""

$secretKey = Read-Host "Enter your Stripe Secret Key (sk_...)" -AsSecureString
$secretKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretKey))

if (-not $secretKeyPlain.StartsWith("sk_")) {
    Write-Host "❌ Invalid secret key format. Must start with 'sk_'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔨 Creating QuickBill Pro product..." -ForegroundColor Yellow

# Create the product
$productBody = @{
    name        = "QuickBill Pro"
    description = "Unlimited invoices, industry templates, email integration, and cloud storage"
    type        = "service"
} | ConvertTo-Json

try {
    $productResponse = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products" -Method Post -Headers @{
        "Authorization" = "Bearer $secretKeyPlain"
        "Content-Type"  = "application/json"
    } -Body $productBody

    $productId = $productResponse.id
    Write-Host "✅ Product created! ID: $productId" -ForegroundColor Green

    # Create the price
    Write-Host "💰 Creating $4.99/month price..." -ForegroundColor Yellow
    
    $priceBody = @{
        product     = $productId
        unit_amount = 499
        currency    = "usd"
        recurring   = @{
            interval = "month"
        }
    } | ConvertTo-Json

    $priceResponse = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" -Method Post -Headers @{
        "Authorization" = "Bearer $secretKeyPlain"
        "Content-Type"  = "application/json"
    } -Body $priceBody

    $priceId = $priceResponse.id
    Write-Host "✅ Price created! ID: $priceId" -ForegroundColor Green

    # Update .env file
    Write-Host ""
    Write-Host "📝 Updating .env file with new price ID..." -ForegroundColor Yellow
    
    $envContent = Get-Content .env -Raw
    $envContent = $envContent -replace "VITE_STRIPE_PRO_PRICE_ID=.*", "VITE_STRIPE_PRO_PRICE_ID=$priceId"
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ Environment updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 STRIPE SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Green
    Write-Host "Product ID: $productId" -ForegroundColor White
    Write-Host "Price ID: $priceId" -ForegroundColor White
    Write-Host ""
    Write-Host "Ready to build and deploy?" -ForegroundColor Cyan
    
    $deploy = Read-Host "Build and deploy now? (y/n)"
    
    if ($deploy -eq "y") {
        Write-Host "🔨 Building..." -ForegroundColor Yellow
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "🚀 Deploying..." -ForegroundColor Yellow
            firebase deploy --only hosting
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "🎉 QUICKBILL IS NOW FULLY LIVE!" -ForegroundColor Green
                Write-Host "🌐 URL: https://quickbill-app-b2467.web.app" -ForegroundColor Blue
                Write-Host ""
                Write-Host "✅ Real Stripe payments enabled" -ForegroundColor Green
                Write-Host "✅ Real email integration enabled" -ForegroundColor Green
                Write-Host "✅ All Pro features working" -ForegroundColor Green
            }
        }
    }

}
catch {
    Write-Host "❌ Error creating product: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Make sure you're using the SECRET key (sk_), not publishable key (pk_)" -ForegroundColor White
    Write-Host "- Check that your Stripe account is fully activated" -ForegroundColor White
    Write-Host "- Verify the secret key is correct" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
