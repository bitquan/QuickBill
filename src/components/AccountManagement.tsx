import { useState } from "react";
import { Button } from "../components/Button";
import { useSubscription } from "../hooks/useSubscription";
import toast from "react-hot-toast";

interface ConfirmCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function ConfirmCancelModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: ConfirmCancelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Cancel Subscription
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to cancel your Pro subscription? You'll lose
          access to Pro features at the end of your current billing period.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Keep Subscription
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? "Canceling..." : "Cancel Subscription"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AccountManagement() {
  const {
    subscription,
    isProUser,
    currentPeriodEnd,
    manageSubscription,
    cancelSubscription,
  } = useSubscription();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleManageSubscription = async () => {
    try {
      await manageSubscription();
    } catch (error) {
      toast.error("Unable to open billing portal. Please contact support.");
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      await cancelSubscription();
      toast.success("Subscription canceled successfully");
      setShowCancelModal(false);
    } catch (error) {
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };

  if (!subscription && !isProUser) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Subscription
        </h2>
        <p className="text-gray-600 mb-4">You're currently on the Free plan.</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Upgrade to Pro</h3>
          <p className="text-blue-700 text-sm mb-3">
            Get unlimited invoices, remove watermarks, and access Pro features
            for just $9.99/month.
          </p>
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
            Upgrade to Pro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>

      <div className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div>
            <h3 className="font-medium text-green-900">QuickBill Pro</h3>
            <p className="text-sm text-green-700">$9.99/month</p>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {subscription?.status === "active"
              ? "Active"
              : subscription?.status === "canceled"
              ? "Canceling"
              : subscription?.status}
          </div>
        </div>

        {/* Billing Info */}
        {currentPeriodEnd && (
          <div className="text-sm text-gray-600">
            {subscription?.status === "canceled"
              ? `Access until ${currentPeriodEnd.toLocaleDateString()}`
              : `Next billing date: ${currentPeriodEnd.toLocaleDateString()}`}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleManageSubscription}
            className="flex-1"
          >
            Manage Billing
          </Button>

          {subscription?.status === "active" && (
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(true)}
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              Cancel Plan
            </Button>
          )}
        </div>
      </div>

      <ConfirmCancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        isLoading={isCanceling}
      />
    </div>
  );
}
