import React, { useState } from "react";
import type {
  IndustryTemplate,
  TemplateCustomization,
  TemplateItem,
} from "../types/template";
import { Button } from "./Button";
import FormField from "./FormField";
import MoneyField from "./MoneyField";
import NumberField from "./NumberField";

interface TemplateCustomizerProps {
  template: IndustryTemplate;
  onSaveCustomization: (customization: Partial<TemplateCustomization>) => void;
  onCancel: () => void;
  existingCustomization?: TemplateCustomization;
}

export const TemplateCustomizer: React.FC<TemplateCustomizerProps> = ({
  template,
  onSaveCustomization,
  onCancel,
  existingCustomization,
}) => {
  const [customName, setCustomName] = useState(
    existingCustomization?.customName || `My ${template.name} Template`
  );
  const [customItems, setCustomItems] = useState<TemplateItem[]>(
    existingCustomization?.customItems || [...template.defaultItems]
  );
  const [customNotes, setCustomNotes] = useState(
    existingCustomization?.customNotes || template.defaultNotes || ""
  );
  const [activeTab, setActiveTab] = useState<
    "items" | "pricing" | "branding" | "terms"
  >("items");

  // Pricing customization
  const [laborRate, setLaborRate] = useState(
    existingCustomization?.customPricing?.laborRate || 75
  );
  const [materialMarkup, setMaterialMarkup] = useState(
    existingCustomization?.customPricing?.materialMarkup || 20
  );
  const [overhead, setOverhead] = useState(
    existingCustomization?.customPricing?.overhead || 15
  );

  // Branding customization
  const [primaryColor, setPrimaryColor] = useState(
    existingCustomization?.brandingCustomization?.primaryColor || "#3b82f6"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    existingCustomization?.brandingCustomization?.secondaryColor || "#6b7280"
  );
  const [logoPosition, setLogoPosition] = useState<
    "header" | "footer" | "watermark"
  >(existingCustomization?.brandingCustomization?.logoPosition || "header");

  const addCustomItem = () => {
    setCustomItems([
      ...customItems,
      {
        description: "New Item",
        unitPrice: 0,
        quantity: 1,
        unit: "hour",
      },
    ]);
  };

  const updateCustomItem = (
    index: number,
    field: keyof TemplateItem,
    value: string | number
  ) => {
    const updated = [...customItems];
    updated[index] = { ...updated[index], [field]: value };
    setCustomItems(updated);
  };

  const removeCustomItem = (index: number) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const customization: Partial<TemplateCustomization> = {
      customName,
      customItems,
      customNotes,
      customPricing: {
        laborRate,
        materialMarkup,
        overhead,
      },
      brandingCustomization: {
        primaryColor,
        secondaryColor,
        logoPosition,
      },
    };
    onSaveCustomization(customization);
  };

  const TabButton: React.FC<{
    id: typeof activeTab;
    label: string;
    icon: string;
  }> = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === id
          ? "bg-blue-100 text-blue-700 border border-blue-200"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Customize Template
            </h2>
            <p className="text-gray-600 mt-1">
              Based on: {template.name} {template.icon}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Template
            </Button>
          </div>
        </div>
      </div>

      {/* Template Name */}
      <div className="p-6 border-b border-gray-200">
        <FormField
          label="Template Name"
          value={customName}
          onChange={setCustomName}
          placeholder="Enter a custom name for your template"
        />
      </div>

      {/* Tab Navigation */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton id="items" label="Items & Services" icon="📝" />
          <TabButton id="pricing" label="Pricing Rules" icon="💰" />
          <TabButton id="branding" label="Branding" icon="🎨" />
          <TabButton id="terms" label="Terms & Notes" icon="📋" />
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Items Tab */}
        {activeTab === "items" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Service Items</h3>
              <Button variant="secondary" onClick={addCustomItem}>
                + Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {customItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateCustomItem(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <NumberField
                      label=""
                      value={item.quantity}
                      onChange={(value) =>
                        updateCustomItem(index, "quantity", value)
                      }
                      min={0}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.unit || ""}
                      onChange={(e) =>
                        updateCustomItem(index, "unit", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="unit"
                    />
                  </div>
                  <div className="col-span-2">
                    <MoneyField
                      label=""
                      value={item.unitPrice}
                      onChange={(value) =>
                        updateCustomItem(index, "unitPrice", value)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => removeCustomItem(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <h3 className="font-medium text-gray-900">Pricing Rules</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <MoneyField
                  label="Labor Rate ($/hour)"
                  value={laborRate}
                  onChange={setLaborRate}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default hourly rate for labor items
                </p>
              </div>

              <div>
                <NumberField
                  label="Material Markup (%)"
                  value={materialMarkup}
                  onChange={setMaterialMarkup}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Markup percentage on materials
                </p>
              </div>

              <div>
                <NumberField
                  label="Overhead (%)"
                  value={overhead}
                  onChange={setOverhead}
                  min={0}
                  max={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  General overhead percentage
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                💡 Pricing Tips
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Labor rate should include your desired profit margin</li>
                <li>
                  • Material markup covers handling, transportation, and profit
                </li>
                <li>
                  • Overhead covers business expenses like insurance, tools, and
                  office costs
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <h3 className="font-medium text-gray-900">Brand Customization</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Logo Position
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "header", label: "Header", icon: "⬆️" },
                  { value: "footer", label: "Footer", icon: "⬇️" },
                  { value: "watermark", label: "Watermark", icon: "🔍" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLogoPosition(option.value as any)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      logoPosition === option.value
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
              <div
                className="h-20 rounded border-2 border-dashed border-gray-300 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                  borderColor: primaryColor,
                }}
              >
                <span style={{ color: primaryColor }} className="font-medium">
                  Invoice Preview with Your Colors
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Terms Tab */}
        {activeTab === "terms" && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Custom Notes & Terms</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Invoice Notes
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom notes that will appear on invoices using this template..."
              />
              <p className="text-xs text-gray-500 mt-1">
                These notes will be included by default when using this template
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">
                📝 Note Ideas
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Payment terms and accepted methods</li>
                <li>• Warranty information and guarantees</li>
                <li>• Cancellation and rescheduling policies</li>
                <li>• Contact information for questions</li>
                <li>• Thank you message and next steps</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
