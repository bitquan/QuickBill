import { useState } from "react";
import { Button } from "./Button";
import FormField from "./FormField";
import type { InvoiceData } from "../types/invoice";
import toast from "react-hot-toast";

interface PaymentLinkGeneratorProps {
  invoice: InvoiceData;
  onClose: () => void;
}

export default function PaymentLinkGenerator({
  invoice,
  onClose,
}: PaymentLinkGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    description: `Invoice ${invoice.invoiceNumber} - ${invoice.business.name}`,
    allowTips: false,
    successUrl: window.location.origin + "/payment-success",
    cancelUrl: window.location.origin + "/payment-cancelled",
  });
  const [generatedLink, setGeneratedLink] = useState<string>("");

  const generatePaymentLink = async () => {
    setIsGenerating(true);

    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate generated Stripe payment link
      const mockPaymentLink = `https://checkout.stripe.com/c/pay/cs_test_${Math.random()
        .toString(36)
        .substring(
          7
        )}#fidkdWxOYHwnPyd1blpxYHZxWjA0YkRHMm5DajxLUDB8YXVIRm5nMUMwXTV8YnwxVnBTRW1zYUJGQnR3SkdnR2dWaWByMkJQa0lGTGBqTGdhfGFGZ3xkcEdXYGNydE1SalVEQn1MVn1MRDVCU2tuaTB%2FYycpJ3VpbGtuQH11anZgYUxhJz8ncWB2cVpscWBoJyknaWR8YHdgfGgneCUl`;

      setGeneratedLink(mockPaymentLink);
      toast.success("Payment link generated successfully!");
    } catch (error) {
      console.error("Error generating payment link:", error);
      toast.error("Failed to generate payment link. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Payment link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link. Please copy manually.");
    }
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: `Payment for Invoice ${invoice.invoiceNumber}`,
        text: `Please complete payment for invoice ${invoice.invoiceNumber}`,
        url: generatedLink,
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Generate Payment Link
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Invoice Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                Invoice Details
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Invoice Number:</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Client:</span>
                  <span className="font-medium">{invoice.client.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">
                    ${invoice.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="space-y-4">
              <FormField
                label="Payment Description"
                value={paymentDetails.description}
                onChange={(value) =>
                  setPaymentDetails((prev) => ({
                    ...prev,
                    description: value,
                  }))
                }
                placeholder="Description that will appear on the payment page"
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowTips"
                  checked={paymentDetails.allowTips}
                  onChange={(e) =>
                    setPaymentDetails((prev) => ({
                      ...prev,
                      allowTips: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="allowTips"
                  className="ml-2 text-sm text-gray-700"
                >
                  Allow customers to add tips
                </label>
              </div>
            </div>

            {/* Generated Link */}
            {generatedLink && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    Copy
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={shareLink}
                    className="flex-1"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    Share Link
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => window.open(generatedLink, "_blank")}
                    className="flex-1"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Preview
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              {!generatedLink ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={generatePaymentLink}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate Payment Link"
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={generatePaymentLink}
                  className="flex-1"
                >
                  Regenerate Link
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900 mb-1">💡 How it works:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Send this link to your client via email or text</li>
                <li>• They can pay securely with card or bank transfer</li>
                <li>• You'll receive payment confirmation automatically</li>
                <li>• Funds are deposited to your connected Stripe account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
