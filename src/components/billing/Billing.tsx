import { useState, useEffect } from "react";
import { Button } from "../Button";
import UpgradeModal from "../UpgradeModal";
import storageService from "../../services/storage";
import toast from "react-hot-toast";

interface BillingInfo {
  subscriptionStatus: "free" | "active" | "canceled" | "past_due";
  planName: string;
  price: string;
  billingPeriod: string;
  nextBillingDate?: string;
  invoicesUsed: number;
  invoicesLimit: number;
}

export default function Billing() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    subscriptionStatus: "free",
    planName: "Free Plan",
    price: "$0",
    billingPeriod: "forever",
    invoicesUsed: 0,
    invoicesLimit: 3,
  });

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBillingInfo();
  }, []);

  const loadBillingInfo = () => {
    const userData = storageService.getUserData();

    if (userData.isPro) {
      setBillingInfo({
        subscriptionStatus: "active",
        planName: "QuickBill Pro",
        price: "$9.99",
        billingPeriod: "monthly",
        nextBillingDate: getNextBillingDate(),
        invoicesUsed: userData.invoicesCreated,
        invoicesLimit: -1, // Unlimited
      });
    } else {
      setBillingInfo({
        subscriptionStatus: "free",
        planName: "Free Plan",
        price: "$0",
        billingPeriod: "forever",
        invoicesUsed: userData.invoicesCreated,
        invoicesLimit: userData.maxInvoices,
      });
    }
  };

  const getNextBillingDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleDateString();
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your Pro subscription? You will lose access to Pro features at the end of your current billing period."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call your backend to cancel the Stripe subscription
      toast.success(
        "Subscription cancellation request submitted. You will retain access until the end of your billing period."
      );

      // For now, just show the change
      setBillingInfo((prev) => ({
        ...prev,
        subscriptionStatus: "canceled",
      }));
    } catch (error) {
      toast.error("Failed to cancel subscription. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    const status = billingInfo.subscriptionStatus;
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "active":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "free":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "canceled":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "past_due":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = () => {
    switch (billingInfo.subscriptionStatus) {
      case "active":
        return "Active";
      case "free":
        return "Free";
      case "canceled":
        return "Canceled";
      case "past_due":
        return "Past Due";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Billing & Subscription
        </h2>

        {/* Current Plan */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {billingInfo.planName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">
                  {billingInfo.price}
                </span>
                <span className="text-gray-600">
                  / {billingInfo.billingPeriod}
                </span>
                <span className={getStatusBadge()}>{getStatusText()}</span>
              </div>
            </div>
            {billingInfo.subscriptionStatus === "free" && (
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              >
                Upgrade to Pro
              </Button>
            )}
          </div>

          {billingInfo.nextBillingDate && (
            <p className="text-sm text-gray-600">
              Next billing date: {billingInfo.nextBillingDate}
            </p>
          )}
        </div>

        {/* Usage */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Invoices Created
              </span>
              <span className="text-sm text-gray-900">
                {billingInfo.invoicesUsed} /{" "}
                {billingInfo.invoicesLimit === -1
                  ? "∞"
                  : billingInfo.invoicesLimit}
              </span>
            </div>
            {billingInfo.invoicesLimit > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (billingInfo.invoicesUsed / billingInfo.invoicesLimit) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}
            {billingInfo.subscriptionStatus === "free" &&
              billingInfo.invoicesUsed >= billingInfo.invoicesLimit && (
                <p className="text-sm text-red-600 mt-2">
                  You've reached your free invoice limit. Upgrade to Pro for
                  unlimited invoices.
                </p>
              )}
          </div>
        </div>

        {/* Plan Features */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Plan Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Plan</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {billingInfo.subscriptionStatus === "free" ? (
                  <>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Up to 3 invoices
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Basic templates
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      PDF generation (with watermark)
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Email integration
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Cloud storage
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Unlimited invoices
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      All industry templates
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Professional PDFs (no watermark)
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Email integration
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Cloud storage & sync
                    </li>
                  </>
                )}
              </ul>
            </div>

            {billingInfo.subscriptionStatus === "free" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  QuickBill Pro
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center">
                    <span className="text-blue-600 mr-2">✓</span>
                    Unlimited invoices
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-600 mr-2">✓</span>
                    All industry templates
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-600 mr-2">✓</span>
                    Professional PDFs
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-600 mr-2">✓</span>
                    Email integration
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-600 mr-2">✓</span>
                    Cloud storage & sync
                  </li>
                </ul>
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Upgrade Now - $9.99/month
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Billing Actions */}
        {billingInfo.subscriptionStatus === "active" && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Billing Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={handleCancelSubscription}
                disabled={loading}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {loading ? "Processing..." : "Cancel Subscription"}
              </Button>
              <p className="text-sm text-gray-600">
                Need to update your payment method? Please contact support.
              </p>
            </div>
          </div>
        )}
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            setShowUpgradeModal(false);
            loadBillingInfo(); // Refresh billing info after upgrade
          }}
          invoicesUsed={billingInfo.invoicesUsed}
          maxInvoices={billingInfo.invoicesLimit}
        />
      )}
    </div>
  );
}
