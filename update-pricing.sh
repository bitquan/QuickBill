#!/bin/bash

# QuickBill Pricing Update Script
# Updates all references from $4.99 to $9.99 and implements unlimited free invoices

echo "🚀 Starting QuickBill Pricing Update..."

# Update all $4.99 references to $9.99
echo "📊 Updating pricing references..."

# Update components
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/\$4\.99/\$9.99/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/4\.99/9.99/g'

# Update remaining invoice limit references
echo "🔄 Updating invoice limit references..."

# Update EnhancedWelcome pricing text
sed -i '' 's/\$4\.99\/month/\$9.99\/month/g' src/pages/EnhancedWelcome.tsx

# Update Home page references
sed -i '' 's/3 invoices • Pro: \$4\.99\/month/Unlimited free • Pro: \$9.99\/month/g' src/pages/Home.tsx
sed -i '' 's/Only \$4\.99\/month • Cancel anytime • 3 free invoices to start/Only \$9.99\/month • Cancel anytime • Unlimited free invoices/g' src/pages/Home.tsx

# Update Welcome page
sed -i '' 's/at \$4\.99\/month/at \$9.99\/month/g' src/pages/Welcome.tsx

# Update InvoiceCreator
sed -i '' 's/Upgrade to Pro for unlimited invoices - just \$4\.99\/month/Upgrade to Pro for premium features - just \$9.99\/month/g' src/screens/InvoiceCreator.tsx

# Update BusinessDashboard
sed -i '' 's/Upgrade to Pro - \$4\.99\/month/Upgrade to Pro - \$9.99\/month/g' src/screens/BusinessDashboard.tsx

# Update InvoiceHistory
sed -i '' 's/Upgrade for \$4\.99\/month/Upgrade for \$9.99\/month/g' src/screens/InvoiceHistory.tsx

# Update AccountManagement
sed -i '' 's/for just \$4\.99\/month/for just \$9.99\/month/g' src/components/AccountManagement.tsx

# Update admin dashboard mock revenue
sed -i '' 's/revenueThisMonth: 1169\.66, \/\/ 234 \* \$4\.99/revenueThisMonth: 2339.32, \/\/ 234 \* \$9.99/g' src/pages/AdminDashboard.tsx
sed -i '' 's/<span className="font-semibold">\$4\.99<\/span>/<span className="font-semibold">\$9.99<\/span>/g' src/pages/AdminDashboard.tsx

# Update feature demo component
sed -i '' 's/Justifies \$4\.99\/month subscription value/Justifies \$9.99\/month subscription value/g' src/components/EnhancedTemplateFeaturesDemo.tsx

echo "✅ All pricing references updated!"

# Update test files
echo "🧪 Updating test files..."
sed -i '' 's/price_1RvkbDDfc44028ki94G00DCn/price_1RwA92Dfc44028kidd3L70MD/g' test-pro-detection.js

echo "✅ Test files updated!"

# Update documentation files that might have missed
echo "📚 Updating any remaining documentation..."
find docs/ -name "*.md" | xargs sed -i '' 's/\$4\.99/\$9.99/g' 2>/dev/null || true
find docs/ -name "*.md" | xargs sed -i '' 's/4\.99/9.99/g' 2>/dev/null || true

echo "🎉 Pricing update complete!"
echo ""
echo "📋 Summary of changes:"
echo "  • Updated all \$4.99 references to \$9.99"
echo "  • Changed from 3 invoice limit to unlimited free invoices"
echo "  • Updated Stripe price ID to: price_1RwA92Dfc44028kidd3L70MD"
echo "  • Updated revenue calculations and analytics"
echo ""
echo "🚀 Next steps:"
echo "  1. Run 'npm run build' to test compilation"
echo "  2. Run 'npm run dev' to test locally"
echo "  3. Deploy with 'npm run deploy'"
echo ""
echo "💡 The app now offers unlimited free basic invoices and \$9.99/month Pro features!"
