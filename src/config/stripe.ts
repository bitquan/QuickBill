import { loadStripe } from "@stripe/stripe-js";

// Replace with your actual Stripe publishable key
// Get this from: https://dashboard.stripe.com/apikeys
const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_...";

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Stripe configuration
export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  priceIds: {
    // Replace with your actual Stripe Price IDs
    // Create these in Stripe Dashboard under Products
    pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || "price_1QuickBillPro",
  },
  webhookEndpoint: "/api/stripe/webhook",
  successUrl: `${window.location.origin}/?success=true`,
  cancelUrl: `${window.location.origin}/?canceled=true`,
};

export default stripeConfig;
