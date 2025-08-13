# QuickBill Stripe Setup
Write-Host "💳 QuickBill Stripe Product Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "We need your Stripe SECRET key to create the product" -ForegroundColor Yellow
Write-Host "Get it from: https://dashboard.stripe.com/apikeys" -ForegroundColor White
Write-Host "(Look for 'Secret key' and click 'Reveal')" -ForegroundColor White
Write-Host ""

$secretKey = Read-Host "Enter Secret Key (starts with sk_)"

if (-not $secretKey.StartsWith("sk_")) {
    Write-Host "❌ Must start with sk_" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Creating product..." -ForegroundColor Yellow

try {
    # Create product
    $headers = @{"Authorization" = "Bearer $secretKey"}
    $productData = "name=QuickBill Pro&description=Unlimited invoices, templates, email integration&type=service"
    
    $product = Invoke-WebRequest -Uri "https://api.stripe.com/v1/products" -Method POST -Headers $headers -ContentType "application/x-www-form-urlencoded" -Body $productData
    
    $productJson = $product.Content | ConvertFrom-Json
    $productId = $productJson.id
    
    Write-Host "✅ Product: $productId" -ForegroundColor Green
    
    # Create price
    Write-Host "Creating price..." -ForegroundColor Yellow
    $priceData = "product=$productId&unit_amount=499&currency=usd&recurring[interval]=month"
    
    $price = Invoke-WebRequest -Uri "https://api.stripe.com/v1/prices" -Method POST -Headers $headers -ContentType "application/x-www-form-urlencoded" -Body $priceData
    
    $priceJson = $price.Content | ConvertFrom-Json
    $priceId = $priceJson.id
    
    Write-Host "✅ Price: $priceId" -ForegroundColor Green
    
    # Update .env
    if (Test-Path .env) {
        $envContent = Get-Content .env -Raw
        $envContent = $envContent -replace "VITE_STRIPE_PRO_PRICE_ID=.*", "VITE_STRIPE_PRO_PRICE_ID=$priceId"
        $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
        Write-Host "✅ Updated .env" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🎉 SUCCESS!" -ForegroundColor Green
    Write-Host "Product ID: $productId" -ForegroundColor White
    Write-Host "Price ID: $priceId" -ForegroundColor White
    
    $build = Read-Host "`nBuild and deploy? (y/n)"
    if ($build -eq "y") {
        npm run build
        firebase deploy --only hosting
        Write-Host "🚀 LIVE: https://quickbill-app-b2467.web.app" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "Press Enter to exit"
