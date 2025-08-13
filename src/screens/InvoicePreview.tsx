import { useState, useRef } from "react";
import { Button } from "../components/Button";
import PDFInvoiceTemplate from "../components/PDFInvoiceTemplate";
import EmailInvoiceModal from "../components/EmailInvoiceModal";
import PaymentLinkGenerator from "../components/PaymentLinkGenerator";
import AgreementGenerator from "../components/AgreementGenerator";
import pdfService from "../services/pdfService";
import storageService from "../services/storage";
import type { InvoiceData } from "../types/invoice";
import type { Agreement } from "../components/AgreementGenerator";
import toast from "react-hot-toast";

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  isFreeTier?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDownload: () => void;
}

export default function InvoicePreview({
  invoiceData,
  isFreeTier = true,
  onEdit,
  onSave,
  onDownload,
}: InvoicePreviewProps) {
  const [paperSize, setPaperSize] = useState<"A4" | "Letter">("A4");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  const userData = storageService.getUserData();

  const handleDownloadPDF = async () => {
    if (!templateRef.current) return;

    setIsGeneratingPDF(true);
    try {
      const pdfBlob = await pdfService.generateFromElement(
        templateRef.current,
        {
          paperSize,
          includeWatermark: isFreeTier,
          template: "professional",
        }
      );

      const filename = pdfService.generateFilename(invoiceData);
      pdfService.downloadPDF(pdfBlob, filename);

      // Call the original onDownload for any additional logic
      onDownload();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Preview</h1>
        <div className="flex items-center gap-4">
          <select
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value as "A4" | "Letter")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
          </select>
          <Button variant="secondary" onClick={onEdit}>
            Edit Invoice
          </Button>
        </div>
      </div>

      {/* Free Tier Watermark Warning */}
      {isFreeTier && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-orange-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-orange-800 font-medium">
              Free Version - Invoice will include "Generated with QuickBill
              Free" watermark
            </span>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            Upgrade to Pro for watermark-free invoices and unlimited features
          </p>
        </div>
      )}

      {/* Invoice Preview */}
      <div
        className={`bg-white shadow-lg ${
          paperSize === "A4" ? "max-w-[210mm]" : "max-w-[8.5in]"
        } mx-auto relative`}
      >
        {/* Free Tier Watermark */}
        {isFreeTier && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="transform rotate-45 text-gray-200 text-6xl font-bold opacity-20">
              QuickBill Free
            </div>
          </div>
        )}

        <PDFInvoiceTemplate
          ref={templateRef}
          invoiceData={invoiceData}
          isFreeTier={isFreeTier}
          paperSize={paperSize}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="secondary" onClick={onEdit}>
          ← Back to Edit
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onSave}>
            Save Invoice
          </Button>
          {userData.isPro && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowAgreementModal(true)}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                📝 Create Agreement
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(true)}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                💳 Payment Link
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEmailModal(true)}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                📧 Send Email
              </Button>
            </>
          )}
          <Button
            variant="primary"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Email Invoice Modal */}
      <EmailInvoiceModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        invoice={invoiceData}
        onEmailSent={() => {
          // Optionally update invoice status or track email
          console.log("Email sent successfully");
        }}
      />

      {/* Payment Link Generator Modal */}
      {showPaymentModal && (
        <PaymentLinkGenerator
          invoice={invoiceData}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Agreement Generator Modal */}
      {showAgreementModal && (
        <AgreementGenerator
          invoice={invoiceData}
          onClose={() => setShowAgreementModal(false)}
          onAgreementCreated={(agreement: Agreement) => {
            toast.success(
              `Agreement "${agreement.title}" created successfully!`
            );
            console.log("Agreement created:", agreement);
          }}
        />
      )}
    </div>
  );
}
