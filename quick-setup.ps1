# QuickBill EmailJS Setup
Write-Host "📧 EmailJS Setup for QuickBill" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "I can see you're already in EmailJS! Perfect!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick setup steps:" -ForegroundColor Yellow
Write-Host "1. Click 'Add New Service' button" -ForegroundColor White
Write-Host "2. Choose Gmail (or your preferred email)" -ForegroundColor White  
Write-Host "3. Follow the connection steps" -ForegroundColor White
Write-Host "4. Copy the Service ID" -ForegroundColor White
Write-Host ""

$serviceId = Read-Host "Enter your EmailJS Service ID"

Write-Host ""
Write-Host "Now create email template:" -ForegroundColor Yellow
Write-Host "1. Go to 'Email Templates' tab" -ForegroundColor White
Write-Host "2. Click 'Create New Template'" -ForegroundColor White
Write-Host "3. Template Name: QuickBill Invoice" -ForegroundColor White
Write-Host "4. Subject: Invoice {{invoice_number}} from {{business_name}}" -ForegroundColor White
Write-Host "5. Message: Hello {{to_name}}, Please find your invoice {{invoice_number}} for {{total_amount}}. {{message}} Best regards, {{business_name}}" -ForegroundColor White
Write-Host "6. Save and copy Template ID" -ForegroundColor White
Write-Host ""

$templateId = Read-Host "Enter your EmailJS Template ID"

Write-Host ""
Write-Host "Get public key:" -ForegroundColor Yellow
Write-Host "1. Click on 'Account' in sidebar" -ForegroundColor White
Write-Host "2. Go to 'General' tab" -ForegroundColor White
Write-Host "3. Copy 'Public Key'" -ForegroundColor White
Write-Host ""

$publicKey = Read-Host "Enter your EmailJS Public Key"

Write-Host ""
Write-Host "Updating .env file..." -ForegroundColor Yellow

if (Test-Path .env) {
    $content = Get-Content .env -Raw
    $content = $content -replace "VITE_EMAILJS_SERVICE_ID=.*", "VITE_EMAILJS_SERVICE_ID=$serviceId"
    $content = $content -replace "VITE_EMAILJS_TEMPLATE_ID=.*", "VITE_EMAILJS_TEMPLATE_ID=$templateId"
    $content = $content -replace "VITE_EMAILJS_PUBLIC_KEY=.*", "VITE_EMAILJS_PUBLIC_KEY=$publicKey"
    $content | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Environment updated!" -ForegroundColor Green
}
else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Ready to build and deploy?" -ForegroundColor Cyan
$deploy = Read-Host "Build and deploy? (y/n)"

if ($deploy -eq "y") {
    Write-Host "Building..." -ForegroundColor Yellow
    npm run build
    Write-Host "Deploying..." -ForegroundColor Yellow  
    firebase deploy --only hosting
    Write-Host ""
    Write-Host "🎉 DONE! Check: https://quickbill-app-b2467.web.app" -ForegroundColor Green
}
