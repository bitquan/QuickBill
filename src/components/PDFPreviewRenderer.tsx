import React from "react";
import type { PDFInvoiceData, PDFOptions } from "../services/pdfService";

interface PDFPreviewRendererProps {
  data: PDFInvoiceData;
  options: PDFOptions;
  zoom: number;
}

export const PDFPreviewRenderer: React.FC<PDFPreviewRendererProps> = ({
  data,
  options,
  zoom,
}) => {
  const getCurrencySymbol = (options: PDFOptions): string => {
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "C$",
      AUD: "A$",
    };
    return currencySymbols[options.currency || "USD"];
  };

  const currencySymbol = getCurrencySymbol(options);

  return (
    <div
      className="bg-white shadow-2xl mx-auto relative overflow-hidden"
      style={{
        width: "595px", // A4 width in pixels at 72 DPI
        minHeight: "842px", // A4 height in pixels at 72 DPI
        transform: `scale(${zoom / 100})`,
        transformOrigin: "top center",
        fontFamily: "Arial, sans-serif", // Match PDF font
        position: "relative",
      }}
    >
      {/* Professional border around entire invoice */}
      <div
        className="absolute inset-2 border-2 border-gray-700"
        style={{ zIndex: 5 }}
      >
        <div className="absolute inset-1 border border-gray-300"></div>
      </div>

      {/* Watermarks for free users - very subtle like first image */}
      {!options.isProUser && options.includeWatermark && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            return (
              <div
                key={i}
                className="absolute text-gray-100/10 font-bold text-xl transform rotate-45 select-none"
                style={{
                  left: `${col * 180 + 50}px`,
                  top: `${row * 200 + 120}px`,
                  zIndex: 1,
                }}
              >
                QuickBill
              </div>
            );
          })}
        </div>
      )}

      <div className="p-5 relative" style={{ zIndex: 10 }}>
        {/* Template-specific styling */}
        {data.template === "classic" && (
          <>
            <div className="absolute inset-2 border border-gray-800"></div>
            <div className="absolute inset-3 border border-gray-400"></div>
          </>
        )}

        {data.template === "corporate" && (
          <>
            <div className="absolute top-0 left-0 right-0 h-6 bg-blue-800"></div>
            <div className="absolute top-6 left-0 right-0 h-1 bg-blue-200"></div>
          </>
        )}

        {data.template === "elegant" && (
          <>
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-purple-600 to-pink-600"></div>
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
          </>
        )}

        {data.template === "tech" && (
          <>
            <div className="absolute inset-2 border-2 border-gray-800 bg-gray-900"></div>
            <div className="absolute left-5 right-5 top-20 h-1 bg-green-400"></div>
          </>
        )}

        {data.template === "financial" && (
          <>
            <div className="absolute top-0 left-0 right-0 h-6 bg-green-700"></div>
            <div className="absolute top-6 left-0 right-0 h-1 bg-yellow-400"></div>
          </>
        )}

        {data.template === "creative" && (
          <>
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <div className="absolute left-5 right-5 top-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          </>
        )}

        {data.template === "medical" && (
          <>
            <div className="absolute left-5 right-5 top-20 h-1 bg-blue-400"></div>
            <div className="absolute inset-2 border border-blue-200"></div>
          </>
        )}

        {data.template === "law" && (
          <>
            <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-500"></div>
            <div className="absolute inset-2 border-2 border-gray-800"></div>
          </>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          {/* Business Info - Left Side */}
          <div
            className={
              data.template === "corporate" ||
              data.template === "elegant" ||
              data.template === "tech" ||
              data.template === "financial" ||
              data.template === "creative" ||
              data.template === "law"
                ? "mt-8 text-white"
                : data.template === "medical"
                ? "text-blue-900"
                : ""
            }
          >
            <h1
              className={`font-bold mb-2 ${
                data.template === "minimal" ? "text-xl" : "text-2xl"
              }`}
            >
              {data.businessName}
            </h1>
            <div
              className={`text-sm ${
                data.template === "corporate"
                  ? "text-blue-100"
                  : data.template === "elegant"
                  ? "text-purple-100"
                  : data.template === "tech"
                  ? "text-gray-300"
                  : data.template === "financial"
                  ? "text-green-100"
                  : data.template === "creative"
                  ? "text-orange-100"
                  : data.template === "medical"
                  ? "text-blue-700"
                  : data.template === "law"
                  ? "text-gray-200"
                  : "text-gray-600"
              }`}
            >
              <div>{data.businessEmail}</div>
              <div className="whitespace-pre-line">{data.businessAddress}</div>
              {data.businessPhone && <div>{data.businessPhone}</div>}
            </div>
          </div>

          {/* Invoice Details - Right Side */}
          <div
            className={`text-right ${
              data.template === "corporate" ||
              data.template === "elegant" ||
              data.template === "tech" ||
              data.template === "financial" ||
              data.template === "creative" ||
              data.template === "law"
                ? "mt-8 text-white"
                : data.template === "medical"
                ? "text-blue-900"
                : ""
            }`}
          >
            <h2 className="text-xl font-bold mb-3">INVOICE</h2>
            <div
              className={`text-sm space-y-1 ${
                data.template === "corporate"
                  ? "text-blue-100"
                  : data.template === "elegant"
                  ? "text-purple-100"
                  : data.template === "tech"
                  ? "text-gray-300"
                  : data.template === "financial"
                  ? "text-green-100"
                  : data.template === "creative"
                  ? "text-orange-100"
                  : data.template === "medical"
                  ? "text-blue-700"
                  : data.template === "law"
                  ? "text-gray-200"
                  : "text-gray-600"
              }`}
            >
              <div>
                <span className="font-semibold">Invoice #:</span>{" "}
                {data.invoiceNumber}
              </div>
              <div>
                <span className="font-semibold">Date:</span> {data.date}
              </div>
              <div>
                <span className="font-semibold">Due Date:</span> {data.dueDate}
              </div>
            </div>
          </div>
        </div>

        {/* Black line for modern template - positioned after header */}
        {data.template === "modern" && (
          <div className="w-full h-1 bg-black mb-4"></div>
        )}

        {/* Client Information */}
        <div className="mb-8 mt-8">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Bill To:</h3>
          <div className="text-sm text-gray-900">
            <div className="font-medium">{data.clientName}</div>
            <div className="text-gray-600">{data.clientEmail}</div>
            <div className="text-gray-600 whitespace-pre-line">
              {data.clientAddress}
            </div>
            {data.clientPhone && (
              <div className="text-gray-600">{data.clientPhone}</div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          {/* Table Header */}
          <div className="bg-gray-700 text-white grid grid-cols-12 py-2 px-2 text-sm font-bold">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Unit Price</div>
            <div className="col-span-2 text-center">Total</div>
          </div>

          {/* Table Rows */}
          {data.items.map((item, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 py-2 px-2 text-sm border-b border-gray-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <div className="col-span-6 text-gray-900">
                <div className="font-medium">{item.description}</div>
              </div>
              <div className="col-span-2 text-center text-gray-900">
                {item.quantity} {item.unit}
              </div>
              <div className="col-span-2 text-center text-gray-900">
                {currencySymbol}
                {item.unitPrice.toFixed(2)}
              </div>
              <div className="col-span-2 text-center text-gray-900">
                {currencySymbol}
                {(item.quantity * item.unitPrice).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-72">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-900">
                <span>Subtotal:</span>
                <span>
                  {currencySymbol}
                  {data.subtotal.toFixed(2)}
                </span>
              </div>
              {data.tax && (
                <div className="flex justify-between text-gray-900">
                  <span>Tax ({(data.tax.rate * 100).toFixed(0)}%):</span>
                  <span>
                    {currencySymbol}
                    {data.tax.amount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between bg-gray-100 px-3 py-2 font-bold text-lg border">
                <span>Total:</span>
                <span>
                  {currencySymbol}
                  {data.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Notes:</h4>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {data.notes}
            </div>
          </div>
        )}

        {/* Payment Instructions for Pro users */}
        {options.isProUser && options.paymentInstructions && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-2">
              Payment Instructions:
            </h4>
            <div className="text-xs text-gray-600">
              {options.paymentInstructions}
            </div>
          </div>
        )}

        {/* Spacer to push footer down */}
        <div className="h-16"></div>
      </div>

      {/* Footer - positioned absolutely at bottom */}
      <div className="absolute bottom-8 left-0 right-0 text-center px-5">
        <div className="text-xs text-gray-400">
          {options.isProUser
            ? `Generated by ${data.businessName}`
            : "Generated by QuickBill - quickbill.app"}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Generated on {new Date().toLocaleDateString()} at{" "}
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
