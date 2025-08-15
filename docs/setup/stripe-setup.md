# Stripe Integration Setup Guide

## 🎯 Overview

This guide will help you set up Stripe payments for QuickBill's Pro subscription ($9.99/month).

## 📋 Prerequisites

- Stripe account (free to create)
- QuickBill app deployed and running
- Access to Firebase console

## 🚀 Step-by-Step Setup

### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a new account
3. Verify your email and complete business details

### 2. Get API Keys

1. Go to Stripe Dashboard → Developers → API Keys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`) - for backend only

### 3. Create Product and Price

1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. Fill in:
   - **Name**: QuickBill Pro
   - **Description**: Unlimited invoices, no watermarks, cloud sync
   - **Pricing model**: Standard pricing
   - **Price**: $9.99
   - **Billing period**: Monthly
   - **Currency**: USD
4. Save and copy the **Price ID** (starts with `price_`)

### 4. Configure Environment Variables

1. Create `.env.local` file in your project root:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_STRIPE_PRO_PRICE_ID=price_your_price_id_here
```

### 5. Set Up Webhooks (For Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 6. Firebase Functions (Optional - Advanced)

For production, you'll want to handle webhooks with Firebase Functions:

```typescript
// functions/src/stripe.ts
import { onRequest } from "firebase-functions/v2/https";
import { stripe } from "./config/stripe";
import { admin } from "./config/firebase";

export const stripeWebhook = onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        // Update user subscription status in Firestore
        break;
      case "customer.subscription.deleted":
        // Downgrade user to free plan
        break;
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

## 🧪 Testing

### Test Cards

Use these test card numbers in Stripe's test mode:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Test Flow

1. Start the app: `npm run dev`
2. Create 3 invoices to trigger the upgrade modal
3. Click "Upgrade Now"
4. Use test card to complete payment
5. Verify Pro features are unlocked

## 🌍 Going Live

### 1. Switch to Live Mode

1. Toggle to "Live" mode in Stripe Dashboard
2. Get live API keys
3. Update environment variables
4. Update webhook endpoints

### 2. Update Configuration

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
VITE_STRIPE_PRO_PRICE_ID=price_your_live_price_id
```

### 3. Business Verification

- Complete Stripe account verification
- Provide business documents if required
- Set up bank account for payouts

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid API key"** - Check your publishable key
2. **"No such price"** - Verify Price ID is correct
3. **"Webhook failed"** - Check endpoint URL and events

### Debug Mode

Enable Stripe debug mode in development:

```typescript
// In stripe.ts config
if (process.env.NODE_ENV === "development") {
  stripe.setApiVersion("2023-10-16");
}
```

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Firebase Functions Guide](https://firebase.google.com/docs/functions)

---

Need help? Contact support or check the Stripe documentation for detailed guides.
