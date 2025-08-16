import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  Send,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crown,
  Plus,
  X,
  Palette,
} from "lucide-react";
import { pdfService } from "../services/pdfService";
import type { PDFInvoiceData, PDFOptions } from "../services/pdfService";
import { PDFPreviewRenderer } from "../components/PDFPreviewRenderer";

interface InvoiceData {
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: Array<{
    description: string;
    unitPrice: number;
    quantity: number;
    unit: string;
  }>;
  notes: string;
  selectedTemplate?: any;
}

const PDFPreviewPage: React.FC = () => {
  const location = useLocation();
  const invoiceData = location.state?.invoiceData as InvoiceData;
  const [zoom, setZoom] = useState(100);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isProUser] = useState(false); // TODO: Connect to actual Pro user detection
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    | "modern"
    | "classic"
    | "minimal"
    | "corporate"
    | "elegant"
    | "tech"
    | "financial"
    | "creative"
    | "medical"
    | "law"
  >("modern");
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Calculate total
  const calculateTotal = () => {
    if (!invoiceData?.items) return 0;
    return invoiceData.items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0
    );
  };

  // Convert invoice data to PDF format
  const convertToPDFData = (): PDFInvoiceData => {
    const subtotal = calculateTotal();
    const taxRate = 0.1; // 10% tax for demo
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      businessName: invoiceData.businessName || "Your Business",
      businessEmail: invoiceData.businessEmail || "business@example.com",
      businessAddress:
        invoiceData.businessAddress || "123 Business St, City, State 12345",
      clientName: invoiceData.clientName || "Client Name",
      clientEmail: invoiceData.clientEmail || "client@example.com",
      clientAddress:
        invoiceData.clientAddress || "456 Client Ave, City, State 67890",
      invoiceNumber: invoiceData.invoiceNumber || "INV-001",
      date: invoiceData.date || new Date().toLocaleDateString(),
      dueDate:
        invoiceData.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      items: invoiceData.items || [],
      notes: invoiceData.notes || "",
      subtotal,
      tax: {
        rate: taxRate,
        amount: taxAmount,
      },
      total,
      paymentTerms: "Payment due within 30 days",
      template: selectedTemplate,
    };
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const resetZoom = () => setZoom(100);

  // FAB Actions
  const fabActions = [
    {
      icon: Download,
      label: "Download PDF",
      action: () => handleDownload(),
      isPro: false,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: Send,
      label: "Send via Email",
      action: () => handleSendEmail(),
      isPro: false,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      icon: Share2,
      label: "Share Link",
      action: () => handleShare(),
      isPro: true,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      icon: Printer,
      label: "Print",
      action: () => handlePrint(),
      isPro: true,
      color: "bg-gray-600 hover:bg-gray-700",
    },
    {
      icon: Palette,
      label: "Change Template",
      action: () => setShowTemplateSelector(true),
      isPro: false,
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
  ];

  // Enhanced PDF download with real generation
  const handleDownload = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const pdfData = convertToPDFData();
      const options: PDFOptions = {
        isProUser,
        includeWatermark: !isProUser,
        layout: "portrait",
      };

      const pdfBlob = await pdfService.generateInvoicePDF(pdfData, options);
      const filename = pdfService.generateFilename(pdfData);

      pdfService.downloadPDF(pdfBlob, filename);

      if (!isProUser) {
        // Show upgrade prompt for free users
        setTimeout(() => {
          alert(
            "PDF downloaded with QuickBill watermark. Upgrade to Pro for watermark-free downloads!"
          );
        }, 500);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!isProUser) {
      alert(
        "Email sending is available in Pro version. Upgrade to send invoices directly to clients!"
      );
      return;
    }

    // In a real implementation, this would integrate with an email service
    console.log("Send email functionality - Pro feature");
    alert("Email sending functionality would be implemented here");
  };

  const handleShare = () => {
    if (!isProUser) {
      alert("Upgrade to Pro to share invoices via link");
      return;
    }
    console.log("Generate shareable link");
    alert(
      "Share functionality would generate a secure link to view the invoice online"
    );
  };

  const handlePrint = async () => {
    if (!isProUser) {
      alert("Upgrade to Pro to print invoices without watermarks");
      return;
    }

    try {
      const pdfData = convertToPDFData();
      const options: PDFOptions = {
        isProUser: true,
        includeWatermark: false,
        layout: "portrait",
      };

      const pdfBlob = await pdfService.generateInvoicePDF(pdfData, options);
      const url = URL.createObjectURL(pdfBlob);

      // Open PDF in new window for printing
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Error generating PDF for print:", error);
      alert("Error preparing PDF for print. Please try again.");
    }
  };

  // Template definitions
  const templates = [
    {
      id: "modern" as const,
      name: "Modern",
      description: "Clean design with black accent line",
      isPro: false,
      preview: "bg-white border-l-4 border-black",
    },
    {
      id: "classic" as const,
      name: "Classic",
      description: "Traditional business format with borders",
      isPro: false,
      preview: "bg-white border-2 border-gray-400",
    },
    {
      id: "minimal" as const,
      name: "Minimal",
      description: "Ultra-clean and simple design",
      isPro: true,
      preview: "bg-gray-50 border border-gray-200",
    },
    {
      id: "corporate" as const,
      name: "Corporate",
      description: "Professional with blue header",
      isPro: true,
      preview: "bg-blue-600 text-white border-b-4 border-blue-800",
    },
    {
      id: "elegant" as const,
      name: "Elegant",
      description: "Sophisticated with purple accents",
      isPro: true,
      preview: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    },
    {
      id: "tech" as const,
      name: "Tech",
      description: "Modern tech-inspired design",
      isPro: true,
      preview: "bg-gray-900 text-green-400 border-l-4 border-green-400",
    },
    {
      id: "financial" as const,
      name: "Financial",
      description: "Professional banking style",
      isPro: true,
      preview: "bg-green-700 text-white border-b-2 border-yellow-400",
    },
    {
      id: "creative" as const,
      name: "Creative",
      description: "Colorful design for creative industries",
      isPro: true,
      preview: "bg-gradient-to-br from-orange-400 to-red-500 text-white",
    },
    {
      id: "medical" as const,
      name: "Medical",
      description: "Clean medical/healthcare design",
      isPro: true,
      preview: "bg-white border-l-4 border-blue-400 text-blue-900",
    },
    {
      id: "law" as const,
      name: "Legal",
      description: "Professional legal services design",
      isPro: true,
      preview: "bg-gray-800 text-white border-t-4 border-gold-400",
    },
  ];

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Invoice Data
          </h2>
          <p className="text-gray-600 mb-6">Please create an invoice first</p>
          <Link
            to="/invoice/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Create Invoice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/invoice/create"
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Invoice Preview
                </h1>
                <p className="text-sm text-gray-600">
                  {invoiceData.invoiceNumber} • {invoiceData.clientName}
                </p>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2 bg-white/50 rounded-xl p-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/70 rounded-lg transition-colors"
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium px-3 py-1 bg-white/70 rounded-lg">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/70 rounded-lg transition-colors"
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={resetZoom}
                className="p-2 hover:bg-white/70 rounded-lg transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <PDFPreviewRenderer
            data={convertToPDFData()}
            options={{
              isProUser,
              includeWatermark: !isProUser,
              currency: "USD",
              layout: "portrait",
            }}
            zoom={zoom}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {/* Expanded Actions */}
        {isFabExpanded && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {fabActions.map((action, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 animate-in slide-in-from-bottom duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                  {action.label}
                  {action.isPro && !isProUser && (
                    <Crown className="w-3 h-3 inline ml-1" />
                  )}
                </span>
                <button
                  onClick={action.action}
                  className={`w-12 h-12 ${
                    action.color
                  } text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
                    action.isPro && !isProUser ? "opacity-50" : ""
                  }`}
                >
                  <action.icon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsFabExpanded(!isFabExpanded)}
          className={`w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center ${
            isFabExpanded ? "rotate-45" : ""
          }`}
        >
          {isFabExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Choose Template
              </h3>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${
                    template.isPro && !isProUser
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    if (!template.isPro || isProUser) {
                      setSelectedTemplate(template.id);
                      setShowTemplateSelector(false);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded ${template.preview}`}
                      ></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          {template.name}
                          {template.isPro && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {template.isPro && !isProUser && (
                    <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      Pro feature - Upgrade to unlock
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Template changes are applied instantly to your preview
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFPreviewPage;
