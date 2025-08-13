import { useState, useEffect } from "react";
import { stripeService } from "../services/stripeService";
import type { SubscriptionData } from "../services/stripeService";
import { useAuth } from "../contexts/AuthContext";

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      checkSubscriptionStatus();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [currentUser]);

  const checkSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const status = await stripeService.getSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isProUser = () => {
    return subscription?.status === "active";
  };

  const isPastDue = () => {
    return subscription?.status === "past_due";
  };

  const isCanceled = () => {
    return subscription?.status === "canceled";
  };

  const getCurrentPeriodEnd = () => {
    if (!subscription?.currentPeriodEnd) return null;
    return new Date(subscription.currentPeriodEnd);
  };

  const manageSubscription = async () => {
    try {
      const result = await stripeService.createPortalSession();
      if ("url" in result) {
        window.open(result.url, "_blank");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      const result = await stripeService.cancelSubscription();
      if (result.success) {
        await checkSubscriptionStatus(); // Refresh status
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  };

  return {
    subscription,
    isLoading,
    isProUser: isProUser(),
    isPastDue: isPastDue(),
    isCanceled: isCanceled(),
    currentPeriodEnd: getCurrentPeriodEnd(),
    checkSubscriptionStatus,
    manageSubscription,
    cancelSubscription,
  };
}
