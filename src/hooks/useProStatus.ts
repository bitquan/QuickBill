import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "./useSubscription";
import storageService from "../services/storage";

/**
 * Hook that syncs localStorage Pro status with real subscription status
 * This ensures compatibility with components that still check localStorage
 */
export function useProStatus() {
  const { currentUser } = useAuth();
  const { isProUser, isLoading } = useSubscription();

  useEffect(() => {
    if (!isLoading && currentUser) {
      // Sync localStorage with real subscription status
      const userData = storageService.getUserData();
      if (userData.isPro !== isProUser) {
        storageService.setUserData({
          ...userData,
          isPro: isProUser,
          maxInvoices: isProUser ? Infinity : 3,
        });
      }
    }
  }, [isProUser, isLoading, currentUser]);

  return {
    isProUser,
    isLoading,
  };
}
