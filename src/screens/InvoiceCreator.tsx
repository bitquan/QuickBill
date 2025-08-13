import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FormField from "../components/FormField";
import MoneyField from "../components/MoneyField";
import NumberField from "../components/NumberField";
import { Button } from "../components/Button";
import SectionCard from "../components/SectionCard";
import LogoUpload from "../components/LogoUpload";
import InvoicePreview from "./InvoicePreview";
import UpgradeModal from "../components/UpgradeModal";
import TemplateSelector from "../components/TemplateSelector";
import type { InvoiceItem, InvoiceData } from "../types/invoice";
import type { IndustryTemplate, TemplateVariation } from "../types/template";
import storageService from "../services/storage";
import toast from "react-hot-toast";

export default function InvoiceCreator() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [userData, setUserData] = useState(() => storageService.getUserData());
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState(() =>
    storageService.generateInvoiceNumber()
  );
  const [invoiceDate, setInvoiceDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    return date.toISOString().split("T")[0];
  });
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [business, setBusiness] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    logo: "",
  });
  const [client, setClient] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);

  // Load saved business info on mount
  useEffect(() => {
    const savedBusinessInfo = storageService.getLastBusinessInfo();
    if (savedBusinessInfo) {
      setBusiness({
        ...savedBusinessInfo,
        logo: (savedBusinessInfo as any).logo || "",
      });
    }
  }, []);

  // Load existing invoice for editing
  useEffect(() => {
    if (invoiceId) {
      const existingInvoice = storageService.getInvoice(invoiceId);
      if (existingInvoice) {
        setIsEditMode(true);
        setInvoiceNumber(existingInvoice.invoiceNumber);
        setInvoiceDate(existingInvoice.invoiceDate);
        setDueDate(existingInvoice.dueDate);
        setTaxRate(existingInvoice.taxRate);
        setNotes(existingInvoice.notes || "");
        setBusiness({
          ...existingInvoice.business,
          logo: existingInvoice.business.logo || "",
        });
        setClient(existingInvoice.client);
        setItems(existingInvoice.items);
        toast.success("Invoice loaded for editing");
      } else {
        toast.error("Invoice not found");
        navigate("/history");
      }
    }
  }, [invoiceId, navigate]);

  // Handle Stripe success/cancel redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const canceled = urlParams.get("canceled");

    if (success === "true") {
      // Payment successful - upgrade user and show success message
      storageService.upgradeToPro();
      setUserData(storageService.getUserData());
      toast.success(
        "🎉 Welcome to QuickBill Pro! You now have unlimited invoices!",
        {
          duration: 5000,
        }
      );
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === "true") {
      // Payment canceled
      toast.error("Payment was canceled. You can upgrade to Pro anytime!", {
        duration: 4000,
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!business.name.trim())
      newErrors.businessName = "Business name is required";
    if (!business.email.trim())
      newErrors.businessEmail = "Business email is required";
    if (!client.name.trim()) newErrors.clientName = "Client name is required";
    if (items.length === 0) newErrors.items = "At least one item is required";

    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = "Item description is required";
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = "Quantity must be greater than 0";
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] =
          "Unit price must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createInvoiceData = (): InvoiceData => {
    const data: InvoiceData = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      business,
      client,
      items,
      subtotal: calculateSubtotal(),
      taxRate,
      tax: calculateTax(),
      total: calculateTotal(),
      notes,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    // Include ID when editing existing invoice
    if (isEditMode && invoiceId) {
      data.id = invoiceId;
    }

    return data;
  };

  const handlePreviewInvoice = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleCreateInvoice = () => {
    if (validateForm()) {
      if (storageService.canCreateInvoice()) {
        setShowPreview(true);
      } else {
        setShowUpgradeModal(true);
      }
    }
  };

  const handleSaveInvoice = (invoiceData: InvoiceData) => {
    try {
      const savedInvoiceId = storageService.saveInvoice(invoiceData);

      // Update userData state to reflect new invoice count
      setUserData(storageService.getUserData());

      // Save business info for next time
      storageService.saveLastBusinessInfo(invoiceData.business);

      console.log("Invoice saved with ID:", savedInvoiceId);
      setShowPreview(false);

      // Show appropriate success message
      if (isEditMode) {
        toast.success("Invoice updated successfully!");
        navigate("/history");
      } else {
        toast.success("Invoice created successfully!");
      }
    } catch (error) {
      console.error("Failed to save invoice:", error);
      toast.error("Failed to save invoice. Please try again.");
    }
  };

  const handleSaveDraft = () => {
    try {
      // Create invoice data with minimal validation
      const draftInvoiceData = createInvoiceData();

      // Ensure status is set to draft
      draftInvoiceData.status = "draft";

      const savedInvoiceId = storageService.saveInvoice(draftInvoiceData);

      // Update userData state to reflect new invoice count
      setUserData(storageService.getUserData());

      // Save business info for next time
      storageService.saveLastBusinessInfo(draftInvoiceData.business);

      console.log("Draft saved with ID:", savedInvoiceId);

      // Show success message but stay on current page
      if (isEditMode) {
        toast.success("Draft updated successfully!");
      } else {
        toast.success("Draft saved successfully!");
        // Update edit mode since we now have an invoice ID
        if (savedInvoiceId) {
          setIsEditMode(true);
          // Update URL to reflect edit mode
          navigate(`/edit/${savedInvoiceId}`, { replace: true });
        }
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft. Please try again.");
    }
  };

  const handleUpgrade = () => {
    // Upgrade is handled by UpgradeModal component with real Stripe integration
    console.log("Redirecting to payment...");

    // For demo purposes, simulate upgrade
    storageService.upgradeToPro();
    setUserData(storageService.getUserData());
    setShowUpgradeModal(false);
  };

  const handleTemplateSelect = (
    template: IndustryTemplate,
    variation?: TemplateVariation
  ) => {
    // Use variation items if provided, otherwise use default template items
    const itemsToUse = variation ? variation.items : template.defaultItems;
    const notesToUse = variation ? variation.notes : template.defaultNotes;
    const templateName = variation
      ? `${template.name} - ${variation.name}`
      : template.name;

    // Apply template to current invoice
    setItems(
      itemsToUse.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );

    if (template.defaultTaxRate !== undefined) {
      setTaxRate(template.defaultTaxRate);
    }

    if (notesToUse) {
      setNotes(notesToUse);
    }

    // Apply enhanced terms if available
    if (template.defaultTerms) {
      const termsText = [
        `Payment Terms: ${template.defaultTerms.paymentTerms}`,
        template.defaultTerms.cancellationPolicy
          ? `Cancellation: ${template.defaultTerms.cancellationPolicy}`
          : "",
        template.defaultTerms.warrantyInfo
          ? `Warranty: ${template.defaultTerms.warrantyInfo}`
          : "",
        ...(template.defaultTerms.additionalTerms || []),
      ]
        .filter(Boolean)
        .join("\n\n");

      setNotes((prevNotes) =>
        prevNotes ? `${prevNotes}\n\n--- TERMS ---\n${termsText}` : termsText
      );
    }

    // If template has default business info and current business is empty
    if (template.defaultBusinessInfo && !business.name) {
      setBusiness((prev) => ({
        ...prev,
        ...template.defaultBusinessInfo,
      }));
    }

    toast.success(`Applied ${templateName} template!`);
  };

  if (showPreview) {
    return (
      <InvoicePreview
        invoiceData={createInvoiceData()}
        isFreeTier={!userData.isPro}
        onEdit={() => setShowPreview(false)}
        onSave={() => handleSaveInvoice(createInvoiceData())}
        onDownload={() => {
          // PDF download is handled by InvoicePreview component
          console.log("Downloading PDF...");
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Page Title */}
      {isEditMode && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Edit Invoice
          </h1>
          <p className="text-gray-600">Make changes to your invoice</p>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        invoicesUsed={userData.invoicesCreated}
        maxInvoices={userData.maxInvoices}
      />

      {/* Template Selector */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* Invoice Counter */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        {currentUser && storageService.getUserData().isPro ? (
          <p className="text-blue-800 font-medium">
            ✨ Pro Active - Unlimited invoices
          </p>
        ) : (
          <>
            <p className="text-blue-800 font-medium">
              {currentUser ? storageService.getRemainingInvoices() : 3} free{" "}
              {(currentUser ? storageService.getRemainingInvoices() : 3) === 1
                ? "invoice"
                : "invoices"}{" "}
              remaining
            </p>
            {(currentUser ? storageService.getRemainingInvoices() : 3) <= 1 && (
              <p className="text-sm text-blue-600 mt-1">
                Upgrade to Pro for unlimited invoices - just $4.99/month
              </p>
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      {!isEditMode && (
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
          <div>
            <h3 className="font-medium text-gray-900">Get Started Quickly</h3>
            <p className="text-sm text-gray-600">
              Use a pre-built template for your industry
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowTemplateSelector(true)}
            className="whitespace-nowrap"
          >
            📋 Choose Template
          </Button>
        </div>
      )}

      {/* Business Details */}
      <SectionCard title="Your Business Details">
        <div className="space-y-4">
          <LogoUpload
            currentLogo={business.logo}
            onLogoChange={(logoDataUrl) =>
              setBusiness({ ...business, logo: logoDataUrl || "" })
            }
            disabled={!userData.isPro}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Business Name"
              value={business.name}
              onChange={(value) => setBusiness({ ...business, name: value })}
              placeholder="Your Company Name"
              error={errors.businessName}
            />
            <FormField
              label="Email"
              type="email"
              value={business.email}
              onChange={(value) => setBusiness({ ...business, email: value })}
              placeholder="your@email.com"
              error={errors.businessEmail}
            />
            <FormField
              label="Address"
              value={business.address}
              onChange={(value) => setBusiness({ ...business, address: value })}
              placeholder="Business Address"
            />
            <FormField
              label="Phone"
              value={business.phone}
              onChange={(value) => setBusiness({ ...business, phone: value })}
              placeholder="Phone Number"
            />
          </div>
        </div>
      </SectionCard>

      {/* Client Details */}
      <SectionCard title="Client Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Client Name"
            value={client.name}
            onChange={(value) => setClient({ ...client, name: value })}
            placeholder="Client's Name"
            error={errors.clientName}
          />
          <FormField
            label="Email"
            type="email"
            value={client.email}
            onChange={(value) => setClient({ ...client, email: value })}
            placeholder="client@email.com"
          />
          <FormField
            label="Address"
            value={client.address}
            onChange={(value) => setClient({ ...client, address: value })}
            placeholder="Client's Address"
          />
          <FormField
            label="Phone"
            value={client.phone}
            onChange={(value) => setClient({ ...client, phone: value })}
            placeholder="Client's Phone"
          />
        </div>
      </SectionCard>

      {/* Invoice Information */}
      <SectionCard title="Invoice Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Invoice Number"
            value={invoiceNumber}
            onChange={setInvoiceNumber}
            placeholder="INV-001"
          />
          <FormField
            label="Invoice Date"
            type="date"
            value={invoiceDate}
            onChange={setInvoiceDate}
          />
          <FormField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={setDueDate}
          />
        </div>
      </SectionCard>

      {/* Invoice Items */}
      <SectionCard title="Invoice Items">
        {errors.items && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {errors.items}
          </div>
        )}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-grow">
                <FormField
                  label="Description"
                  value={item.description}
                  onChange={(value) => updateItem(index, "description", value)}
                  placeholder="Item description"
                  error={errors[`item_${index}_description`]}
                />
              </div>
              <div className="w-24">
                <NumberField
                  label="Quantity"
                  value={item.quantity}
                  onChange={(value) => updateItem(index, "quantity", value)}
                  min={1}
                />
              </div>
              <div className="w-32">
                <MoneyField
                  label="Unit Price"
                  value={item.unitPrice}
                  onChange={(value) => updateItem(index, "unitPrice", value)}
                />
              </div>
              <div className="w-32 pt-8">
                <p className="text-gray-700 font-medium">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="mt-8 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <Button variant="secondary" onClick={addItem} className="mt-4">
            Add Item
          </Button>

          <div className="flex justify-end mt-6">
            <div className="w-80 space-y-2">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Tax Rate (%):</span>
                    <div className="w-20">
                      <NumberField
                        label=""
                        value={taxRate}
                        onChange={setTaxRate}
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Notes */}
      <SectionCard title="Notes & Terms">
        <div className="space-y-4">
          <div>
            <FormField
              label="Additional Notes"
              value={notes}
              onChange={setNotes}
              placeholder="Payment terms, thank you message, or other notes..."
            />
          </div>
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="secondary" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        <Button variant="outline" onClick={handlePreviewInvoice}>
          Preview Invoice
        </Button>
        <Button variant="primary" onClick={handleCreateInvoice}>
          {isEditMode
            ? "Update Invoice"
            : storageService.canCreateInvoice()
            ? "Create Invoice"
            : "Upgrade to Pro"}
        </Button>
      </div>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
