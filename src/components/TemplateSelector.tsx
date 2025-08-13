import { useState } from "react";
import { Button } from "./Button";
import UpgradeModal from "./UpgradeModal";
import type {
  IndustryTemplate,
  TemplateCategory,
  TemplateVariation,
} from "../types/template";
import { INDUSTRY_TEMPLATES } from "../data/industryTemplates";
import storageService from "../services/storage";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (
    template: IndustryTemplate,
    variation?: TemplateVariation
  ) => void;
}

export default function TemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<IndustryTemplate | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const userData = storageService.getUserData();

  if (!isOpen) return null;

  const handleTemplateSelect = (
    template: IndustryTemplate,
    variation?: TemplateVariation
  ) => {
    if (template.isPro && !userData.isPro) {
      // Show upgrade modal for Pro templates
      setShowUpgradeModal(true);
      return;
    }
    onSelectTemplate(template, variation);
    onClose();
  };

  const handleTemplateClick = (template: IndustryTemplate) => {
    if (template.variations && template.variations.length > 0) {
      setSelectedTemplate(template);
    } else {
      handleTemplateSelect(template);
    }
  };

  const goBack = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Choose a Template
              </h2>
              <p className="text-gray-600 mt-1">
                Start with a pre-built template for your industry
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Categories Sidebar */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCategory === null
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="font-medium">All Templates</div>
                <div className="text-sm text-gray-500">
                  Browse all available templates
                </div>
              </button>

              {INDUSTRY_TEMPLATES.map((category: TemplateCategory) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-gray-500">
                    {category.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedTemplate ? (
              /* Template Variations View */
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Button variant="outline" onClick={goBack} size="sm">
                    ← Back
                  </Button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedTemplate.icon} {selectedTemplate.name} - Choose
                      Package
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Select the package that best fits your project
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Default Template Option */}
                  <div
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200 hover:border-blue-300"
                    onClick={() => handleTemplateSelect(selectedTemplate)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Custom Hourly
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Build your own quote with hourly rates
                        </p>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        Starting at $
                        {selectedTemplate.defaultItems[0]?.unitPrice || 0}/hr
                      </span>
                    </div>
                    <div className="space-y-1">
                      {selectedTemplate.defaultItems
                        .slice(0, 3)
                        .map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {item.description} - ${item.unitPrice}/{item.unit}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Variations */}
                  {selectedTemplate.variations?.map((variation) => (
                    <div
                      key={variation.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200 hover:border-blue-300"
                      onClick={() =>
                        handleTemplateSelect(selectedTemplate, variation)
                      }
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {variation.name}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {variation.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {variation.useCase}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">
                            ${variation.estimatedValue.toLocaleString()}
                          </span>
                          <p className="text-xs text-gray-500">Total Value</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Package Includes:
                        </div>
                        {variation.items.slice(0, 4).map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {item.description}
                          </div>
                        ))}
                        {variation.items.length > 4 && (
                          <div className="text-sm text-gray-500">
                            + {variation.items.length - 4} more items
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Main Templates Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedCategory
                  ? INDUSTRY_TEMPLATES.find((c) => c.id === selectedCategory)
                      ?.templates || []
                  : INDUSTRY_TEMPLATES.flatMap((c) => c.templates)
                ).map((template: IndustryTemplate) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      template.isPro && !userData.isPro
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleTemplateClick(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {template.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {template.isPro && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {userData.isPro ? "Pro" : "Pro Only"}
                              </span>
                            )}
                            {template.complexity && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {template.complexity}
                              </span>
                            )}
                            {template.variations &&
                              template.variations.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                  {template.variations.length + 1} packages
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {template.description}
                    </p>

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {template.variations && template.variations.length > 0
                          ? "Starting with:"
                          : "Includes:"}
                      </div>
                      {template.defaultItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {item.description}
                        </div>
                      ))}
                      {template.defaultItems.length > 3 && (
                        <div className="text-sm text-gray-500">
                          + {template.defaultItems.length - 3} more items
                        </div>
                      )}
                    </div>

                    {template.isPro && !userData.isPro && (
                      <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-700">
                        Upgrade to Pro to use this template
                      </div>
                    )}

                    {template.timeline && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        ⏱️ {template.timeline.estimatedDuration}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {userData.isPro ? (
                "All templates available with your Pro subscription"
              ) : (
                <span>
                  Upgrade to Pro to access all industry templates
                  <Button variant="outline" size="sm" className="ml-2">
                    Upgrade Now
                  </Button>
                </span>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          // The UpgradeModal handles the actual upgrade process
        }}
        invoicesUsed={userData.invoicesCreated}
        maxInvoices={userData.maxInvoices}
      />
    </div>
  );
}
