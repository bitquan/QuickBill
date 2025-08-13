export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface BusinessInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
  logo?: string;
}

export interface ClientInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  business: BusinessInfo;
  client: ClientInfo;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "draft" | "sent" | "paid" | "overdue";
}
