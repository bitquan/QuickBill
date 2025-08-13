import { forwardRef } from "react";
import type { InvoiceData } from "../types/invoice";

interface PDFInvoiceTemplateProps {
  invoiceData: InvoiceData;
  isFreeTier?: boolean;
  paperSize?: "A4" | "Letter";
  className?: string;
}

const PDFInvoiceTemplate = forwardRef<HTMLDivElement, PDFInvoiceTemplateProps>(
  (
    { invoiceData, isFreeTier = false, paperSize = "A4", className = "" },
    ref
  ) => {
    const paperClasses =
      paperSize === "A4" ? "w-[210mm] min-h-[297mm]" : "w-[8.5in] min-h-[11in]";

    return (
      <div
        ref={ref}
        className={`bg-white relative ${paperClasses} ${className}`}
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          lineHeight: "1.4",
          color: "#000000",
        }}
      >
        {/* Free Tier Watermark */}
        {isFreeTier && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div
              className="text-gray-200 font-bold opacity-20 select-none"
              style={{
                fontSize: "60px",
                transform: "rotate(45deg)",
                fontFamily: "Arial, sans-serif",
              }}
            >
              QuickBill Free
            </div>
          </div>
        )}

        <div className="p-8 relative z-20" style={{ padding: "30px" }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-black mb-4">INVOICE</h1>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Invoice #:</strong> {invoiceData.invoiceNumber}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(invoiceData.invoiceDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Due:</strong>{" "}
                  {new Date(invoiceData.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-black mb-2">
                {invoiceData.business.name}
              </h2>
              <div className="text-sm space-y-1">
                <p>{invoiceData.business.email}</p>
                {invoiceData.business.phone && (
                  <p>{invoiceData.business.phone}</p>
                )}
                {invoiceData.business.address && (
                  <div className="whitespace-pre-line">
                    {invoiceData.business.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-black mb-3">Bill To:</h3>
            <div className="text-sm">
              <p className="font-semibold text-black">
                {invoiceData.client.name}
              </p>
              {invoiceData.client.email && <p>{invoiceData.client.email}</p>}
              {invoiceData.client.phone && <p>{invoiceData.client.phone}</p>}
              {invoiceData.client.address && (
                <div className="whitespace-pre-line mt-2">
                  {invoiceData.client.address}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th className="border border-gray-400 px-3 py-2 text-left font-bold">
                    Description
                  </th>
                  <th className="border border-gray-400 px-3 py-2 text-center font-bold w-20">
                    Qty
                  </th>
                  <th className="border border-gray-400 px-3 py-2 text-right font-bold w-24">
                    Unit Price
                  </th>
                  <th className="border border-gray-400 px-3 py-2 text-right font-bold w-24">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 px-3 py-2">
                      {item.description}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-right">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-right">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-300">
                <span>Subtotal:</span>
                <span>${invoiceData.subtotal.toFixed(2)}</span>
              </div>
              {invoiceData.taxRate > 0 && (
                <div className="flex justify-between py-1 border-b border-gray-300">
                  <span>Tax ({invoiceData.taxRate}%):</span>
                  <span>${invoiceData.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-black">
                <span>Total:</span>
                <span>${invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-black mb-3">Notes:</h3>
              <div className="text-sm whitespace-pre-line">
                {invoiceData.notes}
              </div>
            </div>
          )}

          {/* Free Tier Footer */}
          {isFreeTier && (
            <div className="text-center pt-8 border-t border-gray-300">
              <p className="text-xs text-gray-500">
                Generated with QuickBill Free
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

PDFInvoiceTemplate.displayName = "PDFInvoiceTemplate";

export default PDFInvoiceTemplate;
