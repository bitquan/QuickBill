import { useState, useEffect } from "react";
import emailService, { type EmailStatus } from "../services/emailService";

interface EmailHistoryProps {
  invoiceId?: string;
  className?: string;
}

export default function EmailHistory({
  invoiceId,
  className = "",
}: EmailHistoryProps) {
  const [emailHistory, setEmailHistory] = useState<EmailStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmailHistory();
  }, [invoiceId]);

  const loadEmailHistory = () => {
    setIsLoading(true);
    try {
      const history = invoiceId
        ? emailService.getEmailHistory(invoiceId)
        : emailService.getAllEmailHistory();
      setEmailHistory(history);
    } catch (error) {
      console.error("Failed to load email history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: EmailStatus["status"]) => {
    switch (status) {
      case "sending":
        return <span className="text-yellow-500">⏳</span>;
      case "sent":
        return <span className="text-green-500">✅</span>;
      case "delivered":
        return <span className="text-green-600">📬</span>;
      case "failed":
        return <span className="text-red-500">❌</span>;
      default:
        return <span className="text-gray-400">●</span>;
    }
  };

  const getStatusText = (status: EmailStatus["status"]) => {
    switch (status) {
      case "sending":
        return "Sending...";
      case "sent":
        return "Sent";
      case "delivered":
        return "Delivered";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (emailHistory.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        {invoiceId ? "No emails sent for this invoice" : "No emails sent yet"}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Email History {invoiceId && `(${emailHistory.length})`}
      </h4>
      <div className="space-y-2">
        {emailHistory.map((email) => (
          <div
            key={email.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(email.status)}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {email.recipientEmail}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(email.sentAt)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-700">
                {getStatusText(email.status)}
              </div>
              {email.errorMessage && (
                <div
                  className="text-xs text-red-600 max-w-40 truncate"
                  title={email.errorMessage}
                >
                  {email.errorMessage}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
