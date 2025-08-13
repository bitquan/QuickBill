import type { InvoiceData } from "../types/invoice";

const STORAGE_KEYS = {
  INVOICES: "quickbill_invoices",
  USER_DATA: "quickbill_user_data",
  APP_SETTINGS: "quickbill_settings",
} as const;

interface UserData {
  invoicesCreated: number;
  maxInvoices: number;
  isPro: boolean;
  lastInvoiceNumber: number;
}

interface AppSettings {
  lastBusinessInfo?: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
}

class StorageService {
  // User data management
  getUserData(): UserData {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (stored) {
      return JSON.parse(stored);
    }

    // Default for new users
    const defaultData: UserData = {
      invoicesCreated: 0,
      maxInvoices: 3,
      isPro: false,
      lastInvoiceNumber: 0,
    };

    this.setUserData(defaultData);
    return defaultData;
  }

  setUserData(userData: UserData): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  getRemainingInvoices(): number {
    const userData = this.getUserData();
    if (userData.isPro) {
      return Infinity;
    }
    return Math.max(0, userData.maxInvoices - userData.invoicesCreated);
  }

  canCreateInvoice(): boolean {
    return this.getRemainingInvoices() > 0;
  }

  // Invoice management
  getAllInvoices(): InvoiceData[] {
    const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return stored ? JSON.parse(stored) : [];
  }

  saveInvoice(invoice: InvoiceData): string {
    const invoices = this.getAllInvoices();

    // Generate ID if not provided
    if (!invoice.id) {
      invoice.id = `inv_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    // Check if updating existing invoice
    const existingIndex = invoices.findIndex((inv) => inv.id === invoice.id);

    if (existingIndex >= 0) {
      // Update existing
      invoice.updatedAt = new Date().toISOString();
      invoices[existingIndex] = invoice;
    } else {
      // Create new
      invoice.createdAt = new Date().toISOString();
      invoice.updatedAt = new Date().toISOString();
      invoices.push(invoice);

      // Increment invoice counter
      const userData = this.getUserData();
      userData.invoicesCreated += 1;
      this.setUserData(userData);
    }

    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return invoice.id;
  }

  getInvoice(id: string): InvoiceData | null {
    const invoices = this.getAllInvoices();
    return invoices.find((inv) => inv.id === id) || null;
  }

  deleteInvoice(id: string): boolean {
    const invoices = this.getAllInvoices();
    const filteredInvoices = invoices.filter((inv) => inv.id !== id);

    if (filteredInvoices.length < invoices.length) {
      localStorage.setItem(
        STORAGE_KEYS.INVOICES,
        JSON.stringify(filteredInvoices)
      );
      return true;
    }

    return false;
  }

  // App settings
  getAppSettings(): AppSettings {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return stored ? JSON.parse(stored) : {};
  }

  setAppSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  }

  // Business info persistence
  saveLastBusinessInfo(business: {
    name: string;
    email: string;
    address: string;
    phone: string;
  }): void {
    const settings = this.getAppSettings();
    settings.lastBusinessInfo = business;
    this.setAppSettings(settings);
  }

  getLastBusinessInfo(): {
    name: string;
    email: string;
    address: string;
    phone: string;
  } | null {
    const settings = this.getAppSettings();
    return settings.lastBusinessInfo || null;
  }

  // Invoice numbering
  generateInvoiceNumber(): string {
    const userData = this.getUserData();
    const today = new Date();
    const dateStr =
      today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      today.getDate().toString().padStart(2, "0");

    userData.lastInvoiceNumber += 1;
    this.setUserData(userData);

    const numberStr = userData.lastInvoiceNumber.toString().padStart(3, "0");
    return `INV-${dateStr}-${numberStr}`;
  }

  // Pro upgrade
  upgradeToPro(): void {
    const userData = this.getUserData();
    userData.isPro = true;
    userData.maxInvoices = Infinity;
    this.setUserData(userData);
  }

  // Reset for testing
  resetUserData(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.APP_SETTINGS);
  }
}

export const storageService = new StorageService();
export default storageService;
