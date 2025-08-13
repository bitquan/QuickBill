#!/bin/bash
# QuickBill Launch Verification Script
# Run this to verify all systems are go for launch

echo "🚀 QUICKBILL LAUNCH VERIFICATION"
echo "================================="

echo ""
echo "✅ 1. BUILD VERIFICATION"
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - CANNOT LAUNCH"
    exit 1
fi

echo ""
echo "✅ 2. DEPLOYMENT VERIFICATION"
firebase deploy --only hosting
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful"
else
    echo "❌ Deployment failed - CANNOT LAUNCH"
    exit 1
fi

echo ""
echo "✅ 3. ENVIRONMENT CHECK"
if [ -f .env ]; then
    echo "✅ Environment file exists"
    if grep -q "VITE_STRIPE_PUBLISHABLE_KEY" .env; then
        echo "✅ Stripe keys configured"
    else
        echo "⚠️  Stripe keys not configured"
    fi
    if grep -q "VITE_EMAILJS_SERVICE_ID" .env; then
        echo "✅ EmailJS keys configured"
    else
        echo "⚠️  EmailJS keys not configured"
    fi
else
    echo "❌ No .env file - NEED TO CONFIGURE"
fi

echo ""
echo "✅ 4. LIVE APP CHECK"
echo "🌐 Live URL: https://quickbill-app-b2467.web.app"
echo ""
echo "📋 MANUAL TESTING REQUIRED:"
echo "- Test user registration/login"
echo "- Create and preview an invoice"
echo "- Test payment flow (if Stripe keys are real)"
echo "- Test email sending (if EmailJS keys are real)"
echo ""
echo "🎯 LAUNCH STATUS:"
if [ -f .env ] && npm run build > /dev/null 2>&1; then
    echo "✅ READY FOR LAUNCH (pending real API keys)"
else
    echo "❌ NOT READY - Fix issues above"
fi

echo ""
echo "🚀 Happy launching! 🎉"
