import React, { useState } from "react";
import type { IndustryTemplate } from "../types/template";
import { TemplatePortfolioComponent } from "./TemplatePortfolio";
import {
  SeasonalPricingDisplay,
  SeasonalPricingBadge,
} from "./SeasonalPricing";
import {
  LocationPricingDisplay,
  LocationPricingBadge,
} from "./LocationPricing";
import { Button } from "./Button";

interface EnhancedTemplateSelectorProps {
  template: IndustryTemplate;
  onSelectTemplate: (template: IndustryTemplate) => void;
  onCustomizeTemplate?: (template: IndustryTemplate) => void;
  isProUser: boolean;
}

export const EnhancedTemplateSelector: React.FC<
  EnhancedTemplateSelectorProps
> = ({ template, onSelectTemplate, onCustomizeTemplate, isProUser }) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "portfolio" | "pricing" | "customize"
  >("overview");

  const basePrice = template.defaultItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const TabButton: React.FC<{
    id: typeof activeTab;
    label: string;
    icon: string;
    badge?: number;
  }> = ({ id, label, icon, badge }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
        activeTab === id
          ? "bg-blue-100 text-blue-700 border border-blue-200"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{template.icon}</div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                {template.name}
                {template.isPro && (
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    PRO
                  </span>
                )}
                {template.popularity && template.popularity > 80 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                    🔥 Popular
                  </span>
                )}
              </h2>
              <p className="text-gray-600 mt-1">{template.description}</p>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {template.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {template.customizable && isProUser && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    ✨ Customizable
                  </span>
                )}
                {template.seasonalPricing && (
                  <SeasonalPricingBadge
                    seasonalPricing={template.seasonalPricing}
                    basePrice={basePrice}
                  />
                )}
                {template.locationPricing && (
                  <LocationPricingBadge
                    locationPricing={template.locationPricing}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {template.customizable && isProUser && onCustomizeTemplate && (
              <Button
                variant="secondary"
                onClick={() => onCustomizeTemplate(template)}
              >
                🎨 Customize
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => onSelectTemplate(template)}
            >
              Use Template
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton id="overview" label="Overview" icon="📋" />
          {template.portfolio && (
            <TabButton
              id="portfolio"
              label="Portfolio"
              icon="📸"
              badge={template.portfolio.images?.length || 0}
            />
          )}
          {(template.seasonalPricing || template.locationPricing) && (
            <TabButton id="pricing" label="Pricing" icon="💰" />
          )}
          {template.customizable && isProUser && (
            <TabButton id="customize" label="Customize" icon="🎨" />
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Template Variations */}
            {template.variations && template.variations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service Packages ({template.variations.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {template.variations.map((variation) => (
                    <div
                      key={variation.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">
                        {variation.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {variation.description}
                      </p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">
                          Estimated Value:
                        </span>
                        <span className="text-lg font-semibold text-green-600">
                          ${variation.estimatedValue.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        {variation.useCase}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Default Services Included
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {template.defaultItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <span className="text-gray-700">{item.description}</span>
                    <div className="text-right">
                      <span className="text-gray-900 font-medium">
                        ${item.unitPrice} × {item.quantity} {item.unit}
                      </span>
                      <div className="text-sm text-gray-500">
                        = ${(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      Starting From:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ${basePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Timeline */}
            {(template.defaultTerms || template.timeline) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {template.defaultTerms && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Terms & Conditions
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Payment:</strong>{" "}
                        {template.defaultTerms.paymentTerms}
                      </p>
                      {template.defaultTerms.warrantyInfo && (
                        <p>
                          <strong>Warranty:</strong>{" "}
                          {template.defaultTerms.warrantyInfo}
                        </p>
                      )}
                      {template.defaultTerms.cancellationPolicy && (
                        <p>
                          <strong>Cancellation:</strong>{" "}
                          {template.defaultTerms.cancellationPolicy}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {template.timeline && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Project Timeline
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.timeline.estimatedDuration}
                    </p>
                    {template.timeline.milestones && (
                      <div className="space-y-2">
                        {template.timeline.milestones.map(
                          (milestone, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                                {milestone.percentage}%
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {milestone.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {milestone.description}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && template.portfolio && (
          <TemplatePortfolioComponent
            portfolio={template.portfolio}
            templateName={template.name}
          />
        )}

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            {template.seasonalPricing && (
              <SeasonalPricingDisplay
                seasonalPricing={template.seasonalPricing}
                basePrice={basePrice}
                itemDescription="Base service rate"
              />
            )}

            {template.locationPricing && (
              <LocationPricingDisplay
                locationPricing={template.locationPricing}
                basePrice={basePrice}
                itemDescription="Service rate"
              />
            )}
          </div>
        )}

        {/* Customize Tab */}
        {activeTab === "customize" && template.customizable && isProUser && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Customize This Template
            </h3>
            <p className="text-gray-600 mb-6">
              Make this template your own with custom pricing, branding, and
              services
            </p>
            <Button
              variant="primary"
              onClick={() => onCustomizeTemplate?.(template)}
            >
              Start Customizing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
