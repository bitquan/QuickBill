import storageService from "../services/storage";

// Development utilities for testing the storage system
export const devUtils = {
  // Reset all data (useful for testing)
  resetAll: () => {
    storageService.resetUserData();
    console.log("All data reset");
    window.location.reload();
  },

  // Simulate using up free invoices
  useUpFreeInvoices: () => {
    const userData = storageService.getUserData();
    userData.invoicesCreated = userData.maxInvoices;
    storageService.setUserData(userData);
    console.log("Free invoices used up");
    window.location.reload();
  },

  // Simulate Pro upgrade
  upgradeToPro: () => {
    storageService.upgradeToPro();
    console.log("Upgraded to Pro");
    window.location.reload();
  },

  // Create sample invoices
  createSampleInvoices: () => {
    const sampleInvoices = [
      {
        invoiceNumber: "INV-20250813-001",
        invoiceDate: "2025-08-13",
        dueDate: "2025-09-12",
        business: {
          name: "Acme Design Studio",
          email: "hello@acmedesign.com",
          address: "123 Design St\nSan Francisco, CA 94102",
          phone: "(555) 123-4567",
        },
        client: {
          name: "Tech Startup Inc",
          email: "billing@techstartup.com",
          address: "456 Innovation Blvd\nPalo Alto, CA 94301",
          phone: "(555) 987-6543",
        },
        items: [
          { description: "Website Design", quantity: 1, unitPrice: 2500 },
          { description: "Logo Design", quantity: 1, unitPrice: 750 },
        ],
        subtotal: 3250,
        taxRate: 8.5,
        tax: 276.25,
        total: 3526.25,
        notes: "Thank you for your business!",
        status: "sent" as const,
      },
      {
        invoiceNumber: "INV-20250812-002",
        invoiceDate: "2025-08-12",
        dueDate: "2025-09-11",
        business: {
          name: "Acme Design Studio",
          email: "hello@acmedesign.com",
          address: "123 Design St\nSan Francisco, CA 94102",
          phone: "(555) 123-4567",
        },
        client: {
          name: "Local Restaurant",
          email: "manager@localrestaurant.com",
          address: "789 Food Ave\nSan Francisco, CA 94103",
          phone: "(555) 456-7890",
        },
        items: [
          { description: "Menu Design", quantity: 1, unitPrice: 800 },
          { description: "Business Cards", quantity: 500, unitPrice: 2 },
        ],
        subtotal: 1800,
        taxRate: 8.5,
        tax: 153,
        total: 1953,
        notes: "Payment due within 30 days.",
        status: "paid" as const,
      },
    ];

    sampleInvoices.forEach((invoice) => {
      storageService.saveInvoice(invoice);
    });

    console.log("Sample invoices created");
    window.location.reload();
  },

  // Log current storage state
  logStorageState: () => {
    console.log("User Data:", storageService.getUserData());
    console.log("All Invoices:", storageService.getAllInvoices());
    console.log("App Settings:", storageService.getAppSettings());
  },
};

// Make available globally for development
if (typeof window !== "undefined") {
  (window as any).devUtils = devUtils;
}
