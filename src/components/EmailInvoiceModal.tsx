import { useState } from "react";
import { Button } from "./Button";
import FormField from "./FormField";
import emailService, {
  type EmailInvoiceParams,
} from "../services/emailService";
import type { InvoiceData } from "../types/invoice";
import toast from "react-hot-toast";

interface EmailInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
  onEmailSent?: () => void;
}

export default function EmailInvoiceModal({
  isOpen,
  onClose,
  invoice,
  onEmailSent,
}: EmailInvoiceModalProps) {
  const [recipientEmail, setRecipientEmail] = useState(
    invoice.client.email || ""
  );
  const [recipientName, setRecipientName] = useState(invoice.client.name || "");
  const [senderName, setSenderName] = useState(invoice.business.name || "");
  const [senderEmail, setSenderEmail] = useState(invoice.business.email || "");
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const emailParams: EmailInvoiceParams = {
    invoice,
    recipientEmail,
    recipientName,
    senderName,
    senderEmail,
    message,
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !senderName || !senderEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail) || !emailRegex.test(senderEmail)) {
      toast.error("Please enter valid email addresses");
      return;
    }

    setIsLoading(true);
    try {
      await emailService.sendInvoice(emailParams);
      toast.success(`Invoice sent to ${recipientEmail}`);
      onEmailSent?.();
      onClose();
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
      console.error("Email sending failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Send Invoice via Email
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showPreview ? (
            <div className="space-y-6">
              {/* Invoice Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Invoice Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Invoice:</span>{" "}
                    <span className="font-medium">{invoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>{" "}
                    <span className="font-medium">{invoice.invoiceDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>{" "}
                    <span className="font-medium">
                      ${invoice.total.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Client:</span>{" "}
                    <span className="font-medium">{invoice.client.name}</span>
                  </div>
                </div>
              </div>

              {/* Email Form */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Email Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Recipient Email *"
                    type="email"
                    value={recipientEmail}
                    onChange={setRecipientEmail}
                    placeholder="client@example.com"
                  />
                  <FormField
                    label="Recipient Name"
                    value={recipientName}
                    onChange={setRecipientName}
                    placeholder="Client Name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Your Email *"
                    type="email"
                    value={senderEmail}
                    onChange={setSenderEmail}
                    placeholder="your@business.com"
                  />
                  <FormField
                    label="Your Name *"
                    value={senderName}
                    onChange={setSenderName}
                    placeholder="Your Business Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message to your client..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If left empty, a default professional message will be used.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Email Preview</h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {emailService.generateEmailPreview(emailParams)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!showPreview && (
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={!recipientEmail || !senderName || !senderEmail}
              >
                Preview Email
              </Button>
            )}
            {showPreview && (
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                ← Back to Edit
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={
                isLoading || !recipientEmail || !senderName || !senderEmail
              }
              className={isLoading ? "opacity-50" : ""}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                "📧 Send Invoice"
              )}
            </Button>
          </div>
        </div>

        {/* Pro Feature Notice */}
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">✨ Pro Feature:</span> Email invoices
            directly to clients with delivery tracking and professional
            templates.
          </p>
        </div>
      </div>
    </div>
  );
}
