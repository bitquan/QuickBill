import React from "react";
import { TemplateManagement } from "./TemplateManagement";
import { INDUSTRY_TEMPLATES } from "../data/industryTemplates";
import type { TemplateCustomization } from "../types/template";

// Demo component to showcase Enhanced Template Features
export const EnhancedTemplateFeaturesDemo: React.FC = () => {
  // Mock user customizations for demo
  const mockCustomizations: TemplateCustomization[] = [
    {
      userId: "demo-user",
      templateId: "electrician",
      customName: "Johnson Electric Services",
      customItems: [
        {
          description: "Electrical Installation (Premium Rate)",
          unitPrice: 110,
          quantity: 8,
          unit: "hour",
        },
        {
          description: "Emergency Service Call",
          unitPrice: 150,
          quantity: 1,
          unit: "call",
        },
      ],
      customNotes:
        "Johnson Electric Services - Licensed, bonded, and insured. 24/7 emergency service available. All work comes with a 2-year warranty.",
      customPricing: {
        laborRate: 110,
        materialMarkup: 25,
        overhead: 18,
      },
      brandingCustomization: {
        primaryColor: "#1e40af",
        secondaryColor: "#64748b",
        logoPosition: "header",
      },
      createdAt: "2024-08-10T10:00:00.000Z",
      updatedAt: "2024-08-13T14:30:00.000Z",
    },
  ];

  const handleSelectTemplate = (template: any) => {
    console.log("Selected template:", template.name);
    alert(
      `Selected template: ${template.name}\n\nIn the full app, this would navigate to the invoice creator with the template pre-loaded.`
    );
  };

  const handleSaveCustomization = (
    customization: Partial<TemplateCustomization>
  ) => {
    console.log("Saving customization:", customization);
    alert(
      "Template customization saved! In the full app, this would be saved to the database."
    );
  };

  const handleDeleteCustomization = (customizationId: string) => {
    console.log("Deleting customization:", customizationId);
    alert(
      "Template deleted! In the full app, this would remove the custom template."
    );
  };

  // Get all templates and flatten them
  const allTemplates = INDUSTRY_TEMPLATES.flatMap(
    (category) => category.templates
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        {/* Demo Header */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              🚀 Enhanced Template Features Demo
            </h1>
            <p className="text-blue-100 mb-4">
              Experience the powerful new template features that make QuickBill
              Pro irresistible for professionals
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-lg mb-1">📸</div>
                <div className="font-medium">Portfolio Galleries</div>
                <div className="text-xs text-blue-100">
                  Showcase your work with images and testimonials
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-lg mb-1">📅</div>
                <div className="font-medium">Seasonal Pricing</div>
                <div className="text-xs text-blue-100">
                  Automatic rate adjustments by season
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-lg mb-1">📍</div>
                <div className="font-medium">Location Pricing</div>
                <div className="text-xs text-blue-100">
                  Distance-based pricing zones
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-lg mb-1">🎨</div>
                <div className="font-medium">Customization</div>
                <div className="text-xs text-blue-100">
                  Brand colors, pricing rules, and more
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What's New in Enhanced Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <span className="text-blue-500">📸</span>
                  Portfolio Integration
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Work galleries with before/after images</li>
                  <li>• Client testimonials and ratings</li>
                  <li>• Professional certifications display</li>
                  <li>• Project showcase with values</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <span className="text-green-500">💰</span>
                  Smart Pricing
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Seasonal demand-based rates</li>
                  <li>• Location/distance pricing zones</li>
                  <li>• Travel fee structures</li>
                  <li>• Automatic price adjustments</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <span className="text-purple-500">🎨</span>
                  Pro Customization
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Custom pricing rules and markup</li>
                  <li>• Brand colors and logo positioning</li>
                  <li>• Personalized service items</li>
                  <li>• Template analytics and insights</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Template Management Demo */}
        <TemplateManagement
          templates={allTemplates}
          userCustomizations={mockCustomizations}
          isProUser={true}
          onSelectTemplate={handleSelectTemplate}
          onSaveCustomization={handleSaveCustomization}
          onDeleteCustomization={handleDeleteCustomization}
        />

        {/* Business Value Section */}
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-green-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              💼 Business Impact & Value Proposition
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">📈</div>
                <div className="text-xl font-bold text-green-600 mb-2">
                  +40%
                </div>
                <div className="text-sm text-gray-700">
                  Higher conversion rates with portfolio galleries
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">💰</div>
                <div className="text-xl font-bold text-green-600 mb-2">
                  +25%
                </div>
                <div className="text-sm text-gray-700">
                  Revenue increase with seasonal pricing
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">⏱️</div>
                <div className="text-xl font-bold text-green-600 mb-2">
                  -60%
                </div>
                <div className="text-sm text-gray-700">
                  Time savings with template customization
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <div className="text-xl font-bold text-green-600 mb-2">Pro</div>
                <div className="text-sm text-gray-700">
                  Justifies $9.99/month subscription value
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🚀 Perfect for QuickBill Pro Marketing
              </h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                These enhanced template features provide compelling value that
                justifies the Pro subscription. Professional portfolios, smart
                pricing, and customization options set QuickBill apart from
                simple invoice generators, positioning it as a complete business
                solution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
