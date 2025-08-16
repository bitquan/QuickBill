import jsPDF from "jspdf";

export interface PDFInvoiceData {
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  businessPhone?: string;
  businessLogo?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: Array<{
    description: string;
    unitPrice: number;
    quantity: number;
    unit: string;
  }>;
  notes?: string;
  subtotal: number;
  tax?: {
    rate: number;
    amount: number;
  };
  total: number;
  paymentTerms?: string;
  template?:
    | "modern"
    | "classic"
    | "minimal"
    | "corporate"
    | "elegant"
    | "tech"
    | "financial"
    | "creative"
    | "medical"
    | "law";
}

export interface PDFOptions {
  isProUser: boolean;
  includeWatermark: boolean;
  currency?: "USD" | "EUR" | "GBP" | "CAD" | "AUD";
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    businessLogo?: string;
  };
  layout?: "portrait" | "landscape";
  fontSize?: "small" | "medium" | "large";
  paymentInstructions?: string;
  termsAndConditions?: string;
}

export class PDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  /**
   * Generate invoice PDF with professional styling
   */
  async generateInvoicePDF(
    data: PDFInvoiceData,
    options: PDFOptions = { isProUser: false, includeWatermark: true }
  ): Promise<Blob> {
    this.doc = new jsPDF(options.layout || "portrait");
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();

    // Apply template styling (except modern line which comes after headers)
    await this.applyTemplate(data.template || "modern", options);

    // Add header with business info
    await this.addBusinessHeader(data, options);

    // Add invoice details
    this.addInvoiceDetails(data);

    // Add template-specific lines after headers
    const template = data.template || "modern";
    if (template === "modern") {
      this.addModernLine();
    } else if (template === "medical") {
      this.addMedicalLine();
    } else if (template === "creative") {
      this.addCreativeLine();
    }

    // Add client information
    this.addClientInformation(data);

    // Add items table and get position after it
    const afterTableY = this.addItemsTable(data, options);

    // Add totals section and get position after it
    const afterTotalsY = this.addTotalsSection(data, afterTableY, options);

    // Add footer with notes and payment terms
    this.addFooter(data, options, afterTotalsY);

    // Add professional border around the entire invoice
    this.addInvoiceBorder();

    // Add payment instructions for Pro users
    if (options.isProUser && options.paymentInstructions) {
      this.addPaymentInstructions(options.paymentInstructions);
    }

    // Add watermark for free users
    if (!options.isProUser && options.includeWatermark) {
      this.addWatermark();
    }

    // Add Pro branding if available
    if (options.isProUser && options.customBranding) {
      await this.addCustomBranding(options.customBranding);
    }

    return this.doc.output("blob");
  }

  /**
   * Apply template-specific styling
   */
  private async applyTemplate(
    template: string,
    options: PDFOptions
  ): Promise<void> {
    const primaryColor =
      options.customBranding?.primaryColor ||
      this.getTemplateColors(template).primary;

    // Set default font
    this.doc.setFont("helvetica");

    switch (template) {
      case "modern":
        // Modern template styling will be applied after headers
        break;
      case "classic":
        this.addClassicBorder();
        break;
      case "minimal":
        // Minimal template has no background decorations
        break;
      case "corporate":
        this.addCorporateHeader(primaryColor);
        break;
      case "elegant":
        this.addElegantHeader();
        break;
      case "tech":
        this.addTechHeader();
        break;
      case "financial":
        this.addFinancialHeader();
        break;
      case "creative":
        this.addCreativeHeader();
        break;
      case "medical":
        this.addMedicalHeader();
        break;
      case "law":
        this.addLegalHeader();
        break;
    }
  }

  /**
   * Add business header with logo and contact info
   */
  private async addBusinessHeader(
    data: PDFInvoiceData,
    options: PDFOptions
  ): Promise<void> {
    let yPosition = this.margin + 10;

    // Adjust for corporate template
    if (data.template === "corporate") {
      yPosition = this.margin + 35; // Move down from corporate header
    }

    // Add logo if available (Pro feature)
    if (options.isProUser && data.businessLogo) {
      try {
        // In a real implementation, you'd load and add the logo image
        // this.doc.addImage(logoData, 'PNG', this.margin, yPosition, 40, 20);
        yPosition += 25;
      } catch (error) {
        console.warn("Could not load business logo:", error);
      }
    }

    // Business name - adapt colors for corporate template
    this.doc.setFontSize(data.template === "minimal" ? 20 : 24);
    this.doc.setFont("helvetica", "bold");

    if (data.template === "corporate") {
      this.doc.setTextColor(255, 255, 255); // White text on corporate header
    } else {
      this.doc.setTextColor(33, 37, 41);
    }

    this.doc.text(data.businessName, this.margin, yPosition);
    yPosition += 10;

    // Business contact info
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    if (data.template === "corporate") {
      this.doc.setTextColor(220, 230, 255); // Light text on corporate header
    } else {
      this.doc.setTextColor(108, 117, 125);
    }

    this.doc.text(data.businessEmail, this.margin, yPosition);
    yPosition += 5;

    // Split address into lines
    const addressLines = this.splitText(data.businessAddress, 40);
    addressLines.forEach((line) => {
      this.doc.text(line, this.margin, yPosition);
      yPosition += 5;
    });

    if (data.businessPhone) {
      this.doc.text(data.businessPhone, this.margin, yPosition);
    }
  }

  /**
   * Add invoice details (number, date, due date) - anchored to top-right
   */
  private addInvoiceDetails(data: PDFInvoiceData): void {
    const rightX = this.pageWidth - this.margin;
    let yPosition = this.margin + 10;

    // Adjust for corporate template
    if (data.template === "corporate") {
      yPosition = this.margin + 35;
    }

    // Invoice title
    this.doc.setFontSize(data.template === "minimal" ? 16 : 20);
    this.doc.setFont("helvetica", "bold");

    if (data.template === "corporate") {
      this.doc.setTextColor(255, 255, 255);
    } else {
      this.doc.setTextColor(33, 37, 41);
    }

    this.doc.text("INVOICE", rightX, yPosition, { align: "right" });
    yPosition += 15;

    // Invoice details
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    if (data.template === "corporate") {
      this.doc.setTextColor(220, 230, 255);
    } else {
      this.doc.setTextColor(108, 117, 125);
    }

    const details = [
      ["Invoice #:", data.invoiceNumber],
      ["Date:", data.date],
      ["Due Date:", data.dueDate],
    ];

    details.forEach(([label, value]) => {
      this.doc.setFont("helvetica", "bold");
      this.doc.text(label, rightX - 40, yPosition, { align: "right" });
      this.doc.setFont("helvetica", "normal");
      this.doc.text(value, rightX, yPosition, { align: "right" });
      yPosition += 6;
    });
  }

  /**
   * Add client information section
   */
  private addClientInformation(data: PDFInvoiceData): void {
    const yPosition = this.margin + 80;

    // Bill To label
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(33, 37, 41);
    this.doc.text("Bill To:", this.margin, yPosition);

    // Client details
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(33, 37, 41);

    let clientY = yPosition + 8;
    this.doc.text(data.clientName, this.margin, clientY);
    clientY += 6;

    this.doc.setTextColor(108, 117, 125);
    this.doc.text(data.clientEmail, this.margin, clientY);
    clientY += 6;

    // Split client address
    const addressLines = this.splitText(data.clientAddress, 40);
    addressLines.forEach((line) => {
      this.doc.text(line, this.margin, clientY);
      clientY += 5;
    });

    if (data.clientPhone) {
      clientY += 2;
      this.doc.text(data.clientPhone, this.margin, clientY);
    }
  }

  /**
   * Add items table with professional styling and borders
   */
  private addItemsTable(data: PDFInvoiceData, options: PDFOptions): number {
    const startY = this.margin + 130;
    const tableWidth = this.pageWidth - this.margin * 2;
    const colWidths = [50, 15, 20, 15]; // Description, Qty, Unit Price, Total (percentages)
    let currentY = startY;

    // Table header with better contrast
    this.doc.setFillColor(52, 58, 64); // Dark header
    this.doc.rect(this.margin, currentY, tableWidth, 14, "F");

    // Header borders
    this.doc.setDrawColor(52, 58, 64);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, currentY, tableWidth, 14);

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(255, 255, 255); // White text on dark header

    const headers = ["Description", "Qty", "Unit Price", "Total"];
    let headerX = this.margin + 5;

    headers.forEach((header, index) => {
      this.doc.text(header, headerX, currentY + 9);
      headerX += (colWidths[index] / 100) * tableWidth;
    });

    currentY += 14;

    // Table rows with borders
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(33, 37, 41);
    this.doc.setFontSize(10);

    data.items.forEach((item, index) => {
      const rowHeight = 14; // Increased for better readability

      // Better alternating row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(255, 255, 255);
      } else {
        this.doc.setFillColor(248, 250, 252);
      }
      this.doc.rect(this.margin, currentY, tableWidth, rowHeight, "F");

      // Add row borders
      this.doc.setDrawColor(220, 220, 220);
      this.doc.setLineWidth(0.3);
      this.doc.rect(this.margin, currentY, tableWidth, rowHeight);

      let cellX = this.margin + 5;
      const currencySymbol = this.getCurrencySymbol(options);
      const rowData = [
        item.description,
        `${item.quantity} ${item.unit}`,
        `${currencySymbol}${item.unitPrice.toFixed(2)}`,
        `${currencySymbol}${(item.quantity * item.unitPrice).toFixed(2)}`,
      ];

      rowData.forEach((text, colIndex) => {
        const cellWidth = (colWidths[colIndex] / 100) * tableWidth - 10;

        // Truncate text if too long instead of wrapping
        let displayText = text;
        if (this.doc.getTextWidth(text) > cellWidth) {
          while (
            this.doc.getTextWidth(displayText + "...") > cellWidth &&
            displayText.length > 0
          ) {
            displayText = displayText.slice(0, -1);
          }
          displayText += "...";
        }

        // Center text vertically in the cell
        this.doc.text(displayText, cellX, currentY + 8);
        cellX += (colWidths[colIndex] / 100) * tableWidth;
      });

      currentY += rowHeight;
    });

    // Table border
    this.doc.setDrawColor(220, 220, 220);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, startY, tableWidth, currentY - startY);

    // Return the Y position after the table for proper spacing
    return currentY + 10;
  }

  /**
   * Get currency symbol based on options
   */
  private getCurrencySymbol(options: PDFOptions): string {
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "C$",
      AUD: "A$",
    };
    return currencySymbols[options.currency || "USD"];
  }

  /**
   * Add totals section with tax calculations - anchored to bottom-right
   */
  private addTotalsSection(
    data: PDFInvoiceData,
    startY: number,
    options: PDFOptions
  ): number {
    const rightX = this.pageWidth - this.margin;
    const currencySymbol = this.getCurrencySymbol(options);

    // Calculate how much space we need for totals
    const totalLines = data.tax ? 3 : 2; // Subtotal, Tax (optional), Total
    const totalHeight = totalLines * 8 + 15; // 8 points per line + 15 for total emphasis

    // Position totals closer to bottom but leave space for footer
    const maxY = this.pageHeight - 80; // Leave 80 points for footer
    let yPosition = Math.max(startY + 30, maxY - totalHeight);

    this.doc.setFontSize(11);
    const totalsData = [
      ["Subtotal:", `${currencySymbol}${data.subtotal.toFixed(2)}`],
    ];

    if (data.tax) {
      totalsData.push([
        `Tax (${(data.tax.rate * 100).toFixed(0)}%):`,
        `${currencySymbol}${data.tax.amount.toFixed(2)}`,
      ]);
    }

    totalsData.push(["Total:", `${currencySymbol}${data.total.toFixed(2)}`]);

    // Draw totals with better visual hierarchy
    totalsData.forEach(([label, amount], index) => {
      const isTotal = index === totalsData.length - 1;

      if (isTotal) {
        // Add extra space before the total line
        yPosition += 5;

        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(16);
        // Add light gray background for total
        this.doc.setFillColor(248, 249, 250); // Light gray background
        this.doc.rect(rightX - 90, yPosition - 6, 90, 16, "F");
        this.doc.setTextColor(33, 37, 41); // Dark text
      } else {
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(11);
        this.doc.setTextColor(33, 37, 41);
      }

      this.doc.text(label, rightX - 85, yPosition + 5);
      this.doc.text(amount, rightX - 8, yPosition + 5, { align: "right" });

      yPosition += isTotal ? 25 : 12; // Increased spacing
    });

    return yPosition; // Return the Y position after totals for footer positioning
  }

  /**
   * Add footer with notes, payment terms, and metadata
   */
  private addFooter(
    data: PDFInvoiceData,
    options: PDFOptions,
    startY: number
  ): void {
    let footerY = startY + 30; // Start 30 points below totals

    // Notes section
    if (data.notes) {
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(33, 37, 41);
      this.doc.text("Notes:", this.margin, footerY);
      footerY += 8;

      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(108, 117, 125);
      const noteLines = this.splitText(data.notes, 80);
      noteLines.forEach((line, index) => {
        this.doc.text(line, this.margin, footerY + index * 4);
      });
      footerY += noteLines.length * 4 + 10;
    }

    // Terms and Conditions for Pro users
    if (options.isProUser && options.termsAndConditions) {
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(33, 37, 41);
      this.doc.text("Terms and Conditions:", this.margin, footerY);
      footerY += 6;

      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(108, 117, 125);
      const termsLines = this.splitText(options.termsAndConditions, 80);
      termsLines.forEach((line, index) => {
        this.doc.text(line, this.margin, footerY + index * 3);
      });
      footerY += termsLines.length * 3 + 8;
    }

    // Payment terms (Pro feature)
    if (options.isProUser && data.paymentTerms) {
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "italic");
      this.doc.setTextColor(108, 117, 125);
      this.doc.text(
        `Payment Terms: ${data.paymentTerms}`,
        this.margin,
        footerY
      );
      footerY += 10;
    }

    // Invoice generation timestamp
    const timestamp = new Date().toLocaleString();
    this.doc.setFontSize(7);
    this.doc.setTextColor(169, 169, 169);
    this.doc.text(`Generated: ${timestamp}`, this.margin, this.pageHeight - 15);

    // Footer branding
    const finalFooterY = Math.max(footerY, this.pageHeight - 30);
    this.doc.setFontSize(8);
    this.doc.setTextColor(169, 169, 169);
    const footerText = options.isProUser
      ? `Generated by ${data.businessName}`
      : "Generated by QuickBill - quickbill.app";
    this.doc.text(footerText, this.pageWidth / 2, finalFooterY, {
      align: "center",
    });
  }

  /**
   * Add watermark for free users - repeating pattern across the page
   */
  private addWatermark(): void {
    this.doc.setFontSize(24); // Smaller font
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(248, 249, 250); // Even lighter gray - barely visible

    // Create a very subtle repeating watermark pattern
    const watermarkText = "QuickBill";
    const spacing = 150; // More space between watermarks

    // Calculate fewer watermarks for cleaner look
    const horizontalCount = Math.ceil(this.pageWidth / spacing);
    const verticalCount = Math.ceil(this.pageHeight / spacing);

    // Add watermarks in a grid pattern, each rotated 45 degrees
    for (let row = 0; row < verticalCount; row++) {
      for (let col = 0; col < horizontalCount; col++) {
        const x = col * spacing + 40; // Better offset
        const y = row * spacing + 80; // Better offset

        // Skip if position is outside page bounds
        if (x > this.pageWidth - 40 || y > this.pageHeight - 40) continue;

        this.doc.text(watermarkText, x, y, {
          align: "center",
          angle: 45,
        });
      }
    }
  }

  /**
   * Add professional border around the entire invoice
   */
  private addInvoiceBorder(): void {
    this.doc.setDrawColor(52, 58, 64);
    this.doc.setLineWidth(1);
    this.doc.rect(10, 10, this.pageWidth - 20, this.pageHeight - 20);

    // Add inner subtle border
    this.doc.setDrawColor(220, 220, 220);
    this.doc.setLineWidth(0.5);
    this.doc.rect(12, 12, this.pageWidth - 24, this.pageHeight - 24);
  }

  /**
   * Add payment instructions section for Pro users
   */
  private addPaymentInstructions(instructions: string): void {
    const instructionsY = this.pageHeight - 60;

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(33, 37, 41);
    this.doc.text("Payment Instructions:", this.margin, instructionsY);

    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(108, 117, 125);
    this.doc.setFontSize(9);

    const instructionLines = this.splitText(instructions, 80);
    instructionLines.forEach((line, index) => {
      this.doc.text(line, this.margin, instructionsY + 8 + index * 4);
    });
  }

  /**
   * Add custom branding for Pro users
   */
  private async addCustomBranding(
    branding: NonNullable<PDFOptions["customBranding"]>
  ): Promise<void> {
    // Add custom logo if provided
    if (branding.businessLogo) {
      try {
        // In a real implementation, load and add the logo
        // this.doc.addImage(branding.businessLogo, 'PNG', this.margin, 15, 40, 20);
      } catch (error) {
        console.warn("Could not load custom logo:", error);
      }
    }

    // Apply custom colors to elements if provided
    if (branding.primaryColor) {
      // This would customize the color scheme throughout the document
      // For now, we'll apply it to the table header
      // Implementation would depend on specific branding requirements
    }
  }

  /**
   * Get template-specific colors
   */
  private getTemplateColors(template: string): {
    primary: string;
    secondary: string;
  } {
    const colorSchemes = {
      modern: { primary: "#3B82F6", secondary: "#EFF6FF" },
      classic: { primary: "#1F2937", secondary: "#F3F4F6" },
      minimal: { primary: "#000000", secondary: "#FFFFFF" },
      corporate: { primary: "#1E40AF", secondary: "#DBEAFE" },
      elegant: { primary: "#7C3AED", secondary: "#F3E8FF" },
      tech: { primary: "#22C55E", secondary: "#111827" },
      financial: { primary: "#15803D", secondary: "#DCFCE7" },
      creative: { primary: "#F97316", secondary: "#FFF7ED" },
      medical: { primary: "#3B82F6", secondary: "#EBF8FF" },
      law: { primary: "#FBD38D", secondary: "#1F2937" },
    };

    return (
      colorSchemes[template as keyof typeof colorSchemes] || colorSchemes.modern
    );
  }

  /**
   * Add modern template line after headers
   */
  private addModernLine(): void {
    // Modern template - clean black accent line positioned after header content
    this.doc.setDrawColor(0, 0, 0); // Black line
    this.doc.setLineWidth(2);
    this.doc.line(
      this.margin,
      this.margin + 75, // Position line after header content but before client info
      this.pageWidth - this.margin,
      this.margin + 75
    );
  }

  /**
   * Add medical template line after headers
   */
  private addMedicalLine(): void {
    // Medical template - blue accent line
    this.doc.setDrawColor(59, 130, 246); // Blue line
    this.doc.setLineWidth(2);
    this.doc.line(
      this.margin,
      this.margin + 75,
      this.pageWidth - this.margin,
      this.margin + 75
    );
  }

  /**
   * Add creative template line after headers
   */
  private addCreativeLine(): void {
    // Creative template - gradient-style orange line
    this.doc.setDrawColor(251, 146, 60); // Orange line
    this.doc.setLineWidth(3);
    this.doc.line(
      this.margin,
      this.margin + 90, // Slightly lower for creative template
      this.pageWidth - this.margin,
      this.margin + 90
    );
  }

  /**
   * Add classic template border
   */
  private addClassicBorder(): void {
    // Classic template - traditional with double borders
    this.doc.setDrawColor(31, 41, 55);
    this.doc.setLineWidth(2);
    this.doc.rect(10, 10, this.pageWidth - 20, this.pageHeight - 20);

    // Inner border
    this.doc.setLineWidth(0.5);
    this.doc.rect(15, 15, this.pageWidth - 30, this.pageHeight - 30);
  }

  /**
   * Add corporate template header
   */
  private addCorporateHeader(_primaryColor: string): void {
    // Corporate template - professional header bar
    this.doc.setFillColor(30, 64, 175);
    this.doc.rect(0, 0, this.pageWidth, 25, "F");

    // Add company stripe
    this.doc.setFillColor(219, 234, 254);
    this.doc.rect(0, 25, this.pageWidth, 5, "F");
  }

  /**
   * Add elegant template header
   */
  private addElegantHeader(): void {
    // Elegant template - purple gradient header
    this.doc.setFillColor(147, 51, 234); // Purple
    this.doc.rect(0, 0, this.pageWidth, 30, "F");

    // Add gradient effect with lighter purple
    this.doc.setFillColor(168, 85, 247);
    this.doc.rect(0, 30, this.pageWidth, 2, "F");
  }

  /**
   * Add tech template styling
   */
  private addTechHeader(): void {
    // Tech template - dark theme with green accents
    this.doc.setFillColor(17, 24, 39); // Dark gray
    this.doc.rect(10, 10, this.pageWidth - 20, this.pageHeight - 20, "F");

    // Green accent line
    this.doc.setDrawColor(34, 197, 94);
    this.doc.setLineWidth(2);
    this.doc.line(
      this.margin,
      this.margin + 75,
      this.pageWidth - this.margin,
      this.margin + 75
    );
  }

  /**
   * Add financial template header
   */
  private addFinancialHeader(): void {
    // Financial template - green header with gold accent
    this.doc.setFillColor(21, 128, 61); // Green
    this.doc.rect(0, 0, this.pageWidth, 25, "F");

    // Gold accent line
    this.doc.setFillColor(251, 191, 36);
    this.doc.rect(0, 25, this.pageWidth, 3, "F");
  }

  /**
   * Add creative template header
   */
  private addCreativeHeader(): void {
    // Creative template - orange to red gradient
    this.doc.setFillColor(249, 115, 22); // Orange
    this.doc.rect(0, 0, this.pageWidth, 30, "F");

    // Add creative accent
    this.doc.setDrawColor(251, 146, 60);
    this.doc.setLineWidth(3);
    this.doc.line(
      this.margin,
      this.margin + 90,
      this.pageWidth - this.margin,
      this.margin + 90
    );
  }

  /**
   * Add medical template styling
   */
  private addMedicalHeader(): void {
    // Medical template - clean with blue accent
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setLineWidth(3);
    this.doc.line(
      this.margin,
      this.margin + 75,
      this.pageWidth - this.margin,
      this.margin + 75
    );

    // Add border for clean medical look
    this.doc.setDrawColor(147, 197, 253);
    this.doc.setLineWidth(1);
    this.doc.rect(15, 15, this.pageWidth - 30, this.pageHeight - 30);
  }

  /**
   * Add legal template header
   */
  private addLegalHeader(): void {
    // Legal template - gold header bar with dark borders
    this.doc.setFillColor(251, 191, 36); // Gold
    this.doc.rect(0, 0, this.pageWidth, 8, "F");

    // Dark professional borders
    this.doc.setDrawColor(31, 41, 55);
    this.doc.setLineWidth(2);
    this.doc.rect(15, 15, this.pageWidth - 30, this.pageHeight - 30);
  }

  /**
   * Utility function to split text into lines
   */
  private splitText(text: string, maxWidth: number): string[] {
    if (!text) return [""];

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = this.doc.getTextWidth(testLine);

      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is too long, force break
          lines.push(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [""];
  }

  /**
   * Download PDF file
   */
  downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate filename based on invoice data
   */
  generateFilename(data: PDFInvoiceData): string {
    const date = new Date().toISOString().split("T")[0];
    const invoiceNum = data.invoiceNumber.replace(/[^a-zA-Z0-9]/g, "");
    const clientName = data.clientName.replace(/[^a-zA-Z0-9]/g, "");
    return `Invoice_${invoiceNum}_${clientName}_${date}.pdf`;
  }
}

// Export singleton instance
export const pdfService = new PDFService();
