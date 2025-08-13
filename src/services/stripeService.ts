import { stripePromise, stripeConfig } from "../config/stripe";
import { auth } from "../config/firebase";
import { cloudStorageService } from "./cloudStorage";

export interface SubscriptionData {
  customerId?: string;
  subscriptionId?: string;
  status?: "active" | "canceled" | "past_due" | "incomplete";
  currentPeriodEnd?: number;
  priceId?: string;
}

class StripeService {
  private stripe: any = null;

  async initialize() {
    if (!this.stripe) {
      this.stripe = await stripePromise;
    }
    return this.stripe;
  }

  /**
   * Create a checkout session for Pro subscription
   */
  async createCheckoutSession(): Promise<
    { sessionId: string } | { error: string }
  > {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // In a real app, this would be an API call to your backend
      // For now, we'll use Stripe's client-only mode
      const stripe = await this.initialize();

      const { error } = await stripe.redirectToCheckout({
        lineItems: [
          {
            price: stripeConfig.priceIds.pro,
            quantity: 1,
          },
        ],
        mode: "subscription",
        successUrl: stripeConfig.successUrl,
        cancelUrl: stripeConfig.cancelUrl,
        customerEmail: user.email,
        clientReferenceId: user.uid,
      });

      if (error) {
        return { error: error.message };
      }

      return { sessionId: "redirecting" };
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a customer portal session for managing subscription
   */
  async createPortalSession(): Promise<{ url: string } | { error: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // This would typically be an API call to your backend
      // For demo purposes, redirect to Stripe dashboard
      const portalUrl = `https://billing.stripe.com/p/login/test_...`;

      return { url: portalUrl };
    } catch (error) {
      console.error("Error creating portal session:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionData | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return null;
      }

      // First check Firestore for real subscription status
      const userProfile = await cloudStorageService.getUserProfile(user.uid);
      if (userProfile?.subscription.stripeSubscriptionId) {
        // User has a real subscription, convert to SubscriptionData format
        return {
          customerId: userProfile.subscription.stripeCustomerId,
          subscriptionId: userProfile.subscription.stripeSubscriptionId,
          status:
            userProfile.subscription.status === "active"
              ? "active"
              : "canceled",
          currentPeriodEnd:
            userProfile.subscription.nextBillingDate?.toMillis(),
          priceId: stripeConfig.priceIds.pro,
        };
      }

      // Fallback to localStorage for demo/testing purposes
      const storedSubscription = localStorage.getItem(
        `subscription_${user.uid}`
      );
      if (storedSubscription) {
        return JSON.parse(storedSubscription);
      }

      return null;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return null;
    }
  }

  /**
   * Update subscription status (demo implementation)
   */
  async updateSubscriptionStatus(data: SubscriptionData): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Store in localStorage for demo
      localStorage.setItem(`subscription_${user.uid}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error updating subscription status:", error);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // In a real app, this would be an API call to cancel the subscription
      // For demo, we'll update the local status
      await this.updateSubscriptionStatus({
        status: "canceled",
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      });

      return { success: true };
    } catch (error) {
      console.error("Error canceling subscription:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const stripeService = new StripeService();
