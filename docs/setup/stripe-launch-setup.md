# 🔑 STRIPE SETUP FOR QUICKBILL LAUNCH

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now" and create account
3. Complete business verification (required for live payments)

## Step 2: Get Your Publishable Key

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your "Publishable key" (starts with pk*live* for production or pk*test* for testing)

## Step 3: Create QuickBill Pro Product

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Product name: "QuickBill Pro"
4. Description: "Unlimited invoices, templates, and email features"
5. Pricing model: "Recurring"
6. Price: $9.99
7. Billing period: Monthly
8. Save and copy the Price ID (starts with price\_)

## Step 4: Update Environment File

Replace these in your .env file:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_real_key_here
VITE_STRIPE_PRO_PRICE_ID=price_your_real_price_id_here
```

## Step 5: Test Payment Flow

1. Use test card: 4242 4242 4242 4242
2. Any future expiry date
3. Any 3-digit CVC
4. Verify payment completes successfully

---

## Quick Start (Test Mode)

If you want to launch in test mode first:

- Use pk*test* key instead of pk*live*
- Test payments won't charge real money
- Switch to live keys when ready for real customers

## Support

- Stripe Documentation: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing
