import emailjs from "@emailjs/browser";
import type { InvoiceData } from "../types/invoice";

// EmailJS configuration
const EMAIL_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_quickbill",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_invoice",
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "your_public_key",
};

export interface EmailInvoiceParams {
  invoice: InvoiceData;
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  senderEmail: string;
  message?: string;
  pdfBlob?: Blob;
}

export interface EmailStatus {
  id: string;
  invoiceId: string;
  recipientEmail: string;
  sentAt: Date;
  status: "sending" | "sent" | "delivered" | "failed";
  errorMessage?: string;
}

class EmailService {
  private emailHistory: EmailStatus[] = [];
  private isInitialized = false;

  constructor() {
    this.loadEmailHistory();
    this.initializeEmailJS();
  }

  // Initialize EmailJS safely
  private async initializeEmailJS(): Promise<void> {
    try {
      // Only initialize if we have valid config
      if (
        EMAIL_CONFIG.publicKey &&
        EMAIL_CONFIG.publicKey !== "your_public_key"
      ) {
        emailjs.init(EMAIL_CONFIG.publicKey);
        this.isInitialized = true;
        console.log("EmailJS initialized successfully");
      } else {
        console.warn(
          "EmailJS not configured - email features will be disabled"
        );
      }
    } catch (error) {
      console.error("Failed to initialize EmailJS:", error);
      this.isInitialized = false;
    }
  }

  // Send invoice via email
  async sendInvoice(params: EmailInvoiceParams): Promise<EmailStatus> {
    const emailStatus: EmailStatus = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      invoiceId: params.invoice.id || `temp_${Date.now()}`,
      recipientEmail: params.recipientEmail,
      sentAt: new Date(),
      status: "sending",
    };

    try {
      // Check if EmailJS is properly configured
      if (!this.isInitialized) {
        throw new Error(
          "Email service not configured. Please set up EmailJS credentials."
        );
      }

      // Add to history immediately with sending status
      this.emailHistory.push(emailStatus);
      this.saveEmailHistory();

      // Prepare email template parameters
      const templateParams = {
        to_email: params.recipientEmail,
        to_name: params.recipientName || params.recipientEmail,
        from_name: params.senderName,
        from_email: params.senderEmail,
        invoice_number: params.invoice.invoiceNumber,
        invoice_date: params.invoice.invoiceDate,
        invoice_total: this.formatCurrency(params.invoice.total),
        business_name: params.invoice.business.name,
        customer_name: params.invoice.client.name,
        custom_message:
          params.message || this.getDefaultMessage(params.invoice),
        invoice_items: this.formatInvoiceItems(params.invoice),
      };

      // Send email via EmailJS
      await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        templateParams
      );

      // Update status to sent
      emailStatus.status = "sent";
      this.updateEmailHistory(emailStatus);

      return emailStatus;
    } catch (error) {
      console.error("Failed to send email:", error);

      // Update status to failed
      emailStatus.status = "failed";
      emailStatus.errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.updateEmailHistory(emailStatus);

      throw error;
    }
  }

  // Generate email preview
  generateEmailPreview(params: EmailInvoiceParams): string {
    return `Subject: Invoice ${params.invoice.invoiceNumber} from ${
      params.invoice.business.name
    }

Dear ${params.recipientName || "Valued Customer"},

${params.message || this.getDefaultMessage(params.invoice)}

Invoice Details:
• Invoice Number: ${params.invoice.invoiceNumber}
• Date: ${params.invoice.invoiceDate}
• Total Amount: ${this.formatCurrency(params.invoice.total)}

${this.formatInvoiceItems(params.invoice)}

Payment Information:
${params.invoice.business.name}
${params.invoice.business.email}
${params.invoice.business.phone}

Thank you for your business!

Best regards,
${params.senderName}
${params.invoice.business.name}`.trim();
  }

  // Get email history for an invoice
  getEmailHistory(invoiceId: string): EmailStatus[] {
    return this.emailHistory.filter((email) => email.invoiceId === invoiceId);
  }

  // Get all email history
  getAllEmailHistory(): EmailStatus[] {
    return [...this.emailHistory].sort(
      (a, b) => b.sentAt.getTime() - a.sentAt.getTime()
    );
  }

  // Check if email service is available
  isEmailServiceAvailable(): boolean {
    return this.isInitialized;
  }

  // Private helper methods
  private getDefaultMessage(invoice: InvoiceData): string {
    return `Please find your invoice ${
      invoice.invoiceNumber
    } for the amount of ${this.formatCurrency(
      invoice.total
    )}. Payment is due within 30 days.`;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  private formatInvoiceItems(invoice: InvoiceData): string {
    return invoice.items
      .map(
        (item) =>
          `• ${item.description}: ${item.quantity} @ ${this.formatCurrency(
            item.unitPrice
          )} = ${this.formatCurrency(item.quantity * item.unitPrice)}`
      )
      .join("\n");
  }

  private updateEmailHistory(updatedEmail: EmailStatus): void {
    const index = this.emailHistory.findIndex(
      (email) => email.id === updatedEmail.id
    );
    if (index !== -1) {
      this.emailHistory[index] = updatedEmail;
      this.saveEmailHistory();
    }
  }

  private saveEmailHistory(): void {
    try {
      localStorage.setItem(
        "quickbill_email_history",
        JSON.stringify(this.emailHistory)
      );
    } catch (error) {
      console.error("Failed to save email history:", error);
    }
  }

  private loadEmailHistory(): void {
    try {
      const stored = localStorage.getItem("quickbill_email_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.emailHistory = parsed.map((email: any) => ({
          ...email,
          sentAt: new Date(email.sentAt),
        }));
      }
    } catch (error) {
      console.error("Failed to load email history:", error);
      this.emailHistory = [];
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
