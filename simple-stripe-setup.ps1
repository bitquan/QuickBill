# Simple Stripe Product Creator
Write-Host "🔧 Stripe Product Creator for QuickBill" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To create a Stripe product via API, we need your SECRET key" -ForegroundColor Yellow
Write-Host "Go to: https://dashboard.stripe.com/apikeys" -ForegroundColor White
Write-Host "Click 'Reveal' next to 'Secret key' and copy it" -ForegroundColor White
Write-Host "(It starts with sk_test_ or sk_live_)" -ForegroundColor White
Write-Host ""

$secretKey = Read-Host "Paste your Stripe Secret Key here"

if (-not $secretKey.StartsWith("sk_")) {
    Write-Host "❌ Invalid key. Must start with 'sk_'" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Creating QuickBill Pro product..." -ForegroundColor Yellow

# Create product using curl (more reliable than PowerShell web requests)
$curlProduct = "curl -X POST https://api.stripe.com/v1/products -H `"Authorization: Bearer $secretKey`" -d `"name=QuickBill Pro`" -d `"description=Unlimited invoices, industry templates, email integration, and cloud storage`" -d `"type=service`""

Write-Host "Running: $curlProduct" -ForegroundColor Gray
$productResult = Invoke-Expression $curlProduct

if ($productResult -match '"id":"(prod_[^"]+)"') {
    $productId = $matches[1]
    Write-Host "✅ Product created: $productId" -ForegroundColor Green
    
    Write-Host "Creating $4.99/month price..." -ForegroundColor Yellow
    $curlPrice = "curl -X POST https://api.stripe.com/v1/prices -H `"Authorization: Bearer $secretKey`" -d `"product=$productId`" -d `"unit_amount=499`" -d `"currency=usd`" -d `"recurring[interval]=month`""
    
    $priceResult = Invoke-Expression $curlPrice
    
    if ($priceResult -match '"id":"(price_[^"]+)"') {
        $priceId = $matches[1]
        Write-Host "✅ Price created: $priceId" -ForegroundColor Green
        
        # Update .env
        if (Test-Path .env) {
            $env = Get-Content .env -Raw
            $env = $env -replace "VITE_STRIPE_PRO_PRICE_ID=.*", "VITE_STRIPE_PRO_PRICE_ID=$priceId"
            $env | Out-File -FilePath ".env" -Encoding UTF8
            Write-Host "✅ Updated .env file" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "🎉 SUCCESS! Stripe product ready!" -ForegroundColor Green
        Write-Host "Product ID: $productId" -ForegroundColor White
        Write-Host "Price ID: $priceId" -ForegroundColor White
        
    } else {
        Write-Host "❌ Failed to create price" -ForegroundColor Red
        Write-Host $priceResult
    }
} else {
    Write-Host "❌ Failed to create product" -ForegroundColor Red  
    Write-Host $productResult
}

Read-Host "`nPress Enter to continue"
