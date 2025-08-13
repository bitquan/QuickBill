import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { InvoiceData } from "../types/invoice";

export interface PDFOptions {
  paperSize: "A4" | "Letter";
  includeWatermark: boolean;
  template?: "minimal" | "compact" | "professional";
}

class PDFService {
  private defaultOptions: PDFOptions = {
    paperSize: "A4",
    includeWatermark: false,
    template: "professional",
  };

  // Generate PDF from HTML element (preview method)
  async generateFromElement(
    element: HTMLElement,
    options?: Partial<PDFOptions>
  ): Promise<Blob> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Configure canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        removeContainer: true,
        imageTimeout: 0,
        height: element.scrollHeight,
        width: element.scrollWidth,
      });

      // Create PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: opts.paperSize.toLowerCase() as "a4" | "letter",
      });

      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.height / canvas.width;
      const pdfWidth = pageWidth - 20; // 10mm margin on each side
      const pdfHeight = pdfWidth * canvasAspectRatio;

      // Add the canvas as image to PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(
        imgData,
        "PNG",
        10,
        10,
        pdfWidth,
        Math.min(pdfHeight, pageHeight - 20)
      );

      // Add watermark if needed
      if (opts.includeWatermark) {
        this.addWatermark(pdf, pageWidth, pageHeight);
      }

      return pdf.output("blob");
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }

  // Generate PDF directly from invoice data (programmatic method)
  async generateFromData(
    invoiceData: InvoiceData,
    options?: Partial<PDFOptions>
  ): Promise<Blob> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: opts.paperSize.toLowerCase() as "a4" | "letter",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Build PDF programmatically
      this.buildInvoicePDF(pdf, invoiceData, pageWidth);

      // Add watermark if needed
      if (opts.includeWatermark) {
        this.addWatermark(pdf, pageWidth, pageHeight);
      }

      return pdf.output("blob");
    } catch (error) {
      console.error("Error generating PDF from data:", error);
      throw new Error("Failed to generate PDF from data");
    }
  }

  private buildInvoicePDF(pdf: jsPDF, data: InvoiceData, pageWidth: number) {
    let yPos = 20;
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;

    // Title
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("INVOICE", leftMargin, yPos);
    yPos += 15;

    // Invoice details
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Invoice #: ${data.invoiceNumber}`, leftMargin, yPos);
    yPos += 5;
    pdf.text(
      `Date: ${new Date(data.invoiceDate).toLocaleDateString()}`,
      leftMargin,
      yPos
    );
    yPos += 5;
    pdf.text(
      `Due: ${new Date(data.dueDate).toLocaleDateString()}`,
      leftMargin,
      yPos
    );
    yPos += 15;

    // Business info (right aligned)
    pdf.setFont("helvetica", "bold");
    const businessLines = [
      data.business.name,
      data.business.email,
      data.business.phone,
      ...data.business.address.split("\n"),
    ].filter(Boolean);

    businessLines.forEach((line, index) => {
      const textWidth = pdf.getTextWidth(line);
      pdf.text(line, rightMargin - textWidth, 20 + index * 5);
    });

    // Bill To
    pdf.setFont("helvetica", "bold");
    pdf.text("Bill To:", leftMargin, yPos);
    yPos += 7;

    pdf.setFont("helvetica", "normal");
    const clientLines = [
      data.client.name,
      data.client.email,
      data.client.phone,
      ...data.client.address.split("\n"),
    ].filter(Boolean);

    clientLines.forEach((line) => {
      pdf.text(line, leftMargin, yPos);
      yPos += 5;
    });
    yPos += 10;

    // Items table
    this.addItemsTable(pdf, data.items, leftMargin, yPos, pageWidth - 40);
    yPos += (data.items.length + 2) * 8 + 10;

    // Totals
    const totalsX = rightMargin - 60;
    pdf.setFont("helvetica", "normal");
    pdf.text("Subtotal:", totalsX, yPos);
    pdf.text(
      `$${data.subtotal.toFixed(2)}`,
      rightMargin - pdf.getTextWidth(`$${data.subtotal.toFixed(2)}`),
      yPos
    );
    yPos += 7;

    if (data.taxRate > 0) {
      pdf.text(`Tax (${data.taxRate}%):`, totalsX, yPos);
      pdf.text(
        `$${data.tax.toFixed(2)}`,
        rightMargin - pdf.getTextWidth(`$${data.tax.toFixed(2)}`),
        yPos
      );
      yPos += 7;
    }

    // Total
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Total:", totalsX, yPos);
    pdf.text(
      `$${data.total.toFixed(2)}`,
      rightMargin - pdf.getTextWidth(`$${data.total.toFixed(2)}`),
      yPos
    );

    // Notes
    if (data.notes) {
      yPos += 20;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Notes:", leftMargin, yPos);
      yPos += 7;
      pdf.setFont("helvetica", "normal");

      const noteLines = pdf.splitTextToSize(data.notes, pageWidth - 40);
      noteLines.forEach((line: string) => {
        pdf.text(line, leftMargin, yPos);
        yPos += 5;
      });
    }
  }

  private addItemsTable(
    pdf: jsPDF,
    items: any[],
    x: number,
    y: number,
    width: number
  ) {
    const colWidths = [width * 0.5, width * 0.15, width * 0.175, width * 0.175];
    const headers = ["Description", "Qty", "Unit Price", "Total"];

    // Table header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    let currentX = x;
    headers.forEach((header, i) => {
      pdf.text(header, currentX, y);
      currentX += colWidths[i];
    });

    // Header line
    pdf.line(x, y + 2, x + width, y + 2);
    y += 8;

    // Table rows
    pdf.setFont("helvetica", "normal");
    items.forEach((item) => {
      currentX = x;
      const total = item.quantity * item.unitPrice;

      pdf.text(item.description, currentX, y);
      currentX += colWidths[0];

      pdf.text(item.quantity.toString(), currentX, y);
      currentX += colWidths[1];

      pdf.text(`$${item.unitPrice.toFixed(2)}`, currentX, y);
      currentX += colWidths[2];

      pdf.text(`$${total.toFixed(2)}`, currentX, y);

      y += 8;
    });
  }

  private addWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number) {
    // Set transparency and add watermark text
    pdf.setFontSize(50);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(200, 200, 200); // Light gray

    // Calculate center position
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;

    // Add rotated text (45 degrees)
    const text = "QuickBill Free";
    pdf.text(text, centerX, centerY, {
      angle: 45,
      align: "center",
    });
  }

  // Download PDF with proper filename
  downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate filename from invoice data
  generateFilename(invoiceData: InvoiceData): string {
    const sanitizedInvoiceNumber = invoiceData.invoiceNumber.replace(
      /[^a-zA-Z0-9-_]/g,
      "_"
    );
    const sanitizedClientName = invoiceData.client.name
      .replace(/[^a-zA-Z0-9-_\s]/g, "")
      .replace(/\s+/g, "_");
    return `${sanitizedInvoiceNumber}_${sanitizedClientName}`;
  }
}

export const pdfService = new PDFService();
export default pdfService;
