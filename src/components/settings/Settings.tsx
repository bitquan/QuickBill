import { useState, useEffect } from "react";
import { Button } from "../Button";
import storageService from "../../services/storage";
import toast from "react-hot-toast";

interface UserSettings {
  businessInfo: {
    name: string;
    email: string;
    address: string;
    phone: string;
    website?: string;
    taxNumber?: string;
  };
  invoiceSettings: {
    defaultPaymentTerms: string;
    defaultNotes: string;
    autoIncrement: boolean;
    invoicePrefix: string;
  };
  notifications: {
    emailReminders: boolean;
    paymentAlerts: boolean;
    marketingEmails: boolean;
  };
}

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>({
    businessInfo: {
      name: "",
      email: "",
      address: "",
      phone: "",
      website: "",
      taxNumber: "",
    },
    invoiceSettings: {
      defaultPaymentTerms: "Net 30",
      defaultNotes: "Thank you for your business!",
      autoIncrement: true,
      invoicePrefix: "INV",
    },
    notifications: {
      emailReminders: true,
      paymentAlerts: true,
      marketingEmails: false,
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing settings
    const savedSettings = localStorage.getItem("quickbill_user_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      // Try to load from old business info
      const appSettings = storageService.getAppSettings();
      if (appSettings.lastBusinessInfo) {
        setSettings((prev) => ({
          ...prev,
          businessInfo: {
            ...prev.businessInfo,
            ...appSettings.lastBusinessInfo,
          },
        }));
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem("quickbill_user_settings", JSON.stringify(settings));

      // Also update the old business info format for compatibility
      storageService.setAppSettings({
        lastBusinessInfo: {
          name: settings.businessInfo.name,
          email: settings.businessInfo.email,
          address: settings.businessInfo.address,
          phone: settings.businessInfo.phone,
        },
      });

      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessInfo = (
    field: keyof UserSettings["businessInfo"],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value,
      },
    }));
  };

  const updateInvoiceSettings = (
    field: keyof UserSettings["invoiceSettings"],
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        [field]: value,
      },
    }));
  };

  const updateNotifications = (
    field: keyof UserSettings["notifications"],
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

        {/* Business Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={settings.businessInfo.name}
                onChange={(e) => updateBusinessInfo("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={settings.businessInfo.email}
                onChange={(e) => updateBusinessInfo("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@business.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.businessInfo.phone}
                onChange={(e) => updateBusinessInfo("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={settings.businessInfo.website || ""}
                onChange={(e) => updateBusinessInfo("website", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <textarea
                value={settings.businessInfo.address}
                onChange={(e) => updateBusinessInfo("address", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Business St&#10;City, State 12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID / VAT Number
              </label>
              <input
                type="text"
                value={settings.businessInfo.taxNumber || ""}
                onChange={(e) =>
                  updateBusinessInfo("taxNumber", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12-3456789"
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Invoice Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Prefix
              </label>
              <input
                type="text"
                value={settings.invoiceSettings.invoicePrefix}
                onChange={(e) =>
                  updateInvoiceSettings("invoicePrefix", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="INV"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Payment Terms
              </label>
              <select
                value={settings.invoiceSettings.defaultPaymentTerms}
                onChange={(e) =>
                  updateInvoiceSettings("defaultPaymentTerms", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Due on receipt">Due on receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Net 90">Net 90</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Invoice Notes
              </label>
              <textarea
                value={settings.invoiceSettings.defaultNotes}
                onChange={(e) =>
                  updateInvoiceSettings("defaultNotes", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Thank you for your business!"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.invoiceSettings.autoIncrement}
                  onChange={(e) =>
                    updateInvoiceSettings("autoIncrement", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Automatically increment invoice numbers
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.emailReminders}
                onChange={(e) =>
                  updateNotifications("emailReminders", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Email reminders for overdue invoices
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.paymentAlerts}
                onChange={(e) =>
                  updateNotifications("paymentAlerts", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Alerts when invoices are paid
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.marketingEmails}
                onChange={(e) =>
                  updateNotifications("marketingEmails", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Product updates and tips
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
