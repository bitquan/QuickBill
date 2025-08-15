# QuickBill Stripe Setup - No CLI Required

## 🎯 Quick Start (5 Minutes)

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now" and sign up
3. Verify email

### Step 2: Get Your Keys

1. Go to Stripe Dashboard
2. Click "Developers" → "API Keys"
3. Copy "Publishable key" (starts with `pk_test_`)

### Step 3: Create Your Product

1. Go to "Products" in dashboard
2. Click "Add product"
3. Name: "QuickBill Pro"
4. Price: $9.99 monthly
5. Copy the "Price ID" (starts with `price_`)

### Step 4: Add to QuickBill

Create `.env.local` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_STRIPE_PRO_PRICE_ID=price_your_price_id_here
```

### Step 5: Test

```bash
npm run dev
# Create 3 invoices to see upgrade modal
# Use test card: 4242 4242 4242 4242
```

## ✅ You're Live!

No CLI needed for basic subscription payments.

---

## 🔧 Advanced: When to Add CLI

Install CLI later when you want:

- Real-time webhook testing
- Subscription event handling
- Advanced payment flows

### CLI Installation (Optional)

```bash
# Windows (via Scoop)
scoop install stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
```

### CLI Usage Examples

```bash
# Listen to webhooks locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created

# View logs
stripe logs tail
```

---

**Recommendation**: Start without CLI, add it later when you need webhooks!
