import React, { useState } from "react";
import type {
  IndustryTemplate,
  TemplateCustomization,
} from "../types/template";
import { EnhancedTemplateSelector } from "./EnhancedTemplateSelector";
import { TemplateCustomizer } from "./TemplateCustomizer";
import { TemplateAnalytics } from "./TemplateAnalytics";
import { Button } from "./Button";

interface TemplateManagementProps {
  templates: IndustryTemplate[];
  userCustomizations: TemplateCustomization[];
  isProUser: boolean;
  onSelectTemplate: (template: IndustryTemplate) => void;
  onSaveCustomization: (customization: Partial<TemplateCustomization>) => void;
  onDeleteCustomization: (customizationId: string) => void;
}

export const TemplateManagement: React.FC<TemplateManagementProps> = ({
  templates,
  userCustomizations,
  isProUser,
  onSelectTemplate,
  onSaveCustomization,
  onDeleteCustomization,
}) => {
  const [activeView, setActiveView] = useState<
    "browse" | "customize" | "analytics" | "my-templates"
  >("browse");
  const [customizingTemplate, setCustomizingTemplate] =
    useState<IndustryTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock analytics data - in production this would come from backend
  const mockAnalyticsData = templates.map((template) => ({
    templateId: template.id,
    templateName: template.name,
    category: template.category,
    usageCount: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 10000) + 2000,
    popularityScore: template.popularity || Math.floor(Math.random() * 100),
    lastUsed: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
    averageInvoiceValue: Math.floor(Math.random() * 3000) + 500,
    conversionRate: Math.random() * 40 + 40, // 40-80%
  }));

  const categories = [...new Set(templates.map((t) => t.category))];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCustomizeTemplate = (template: IndustryTemplate) => {
    setCustomizingTemplate(template);
    setActiveView("customize");
  };

  const handleSaveCustomization = (
    customization: Partial<TemplateCustomization>
  ) => {
    if (customizingTemplate) {
      onSaveCustomization({
        ...customization,
        userId: "current-user", // In production, get from auth context
        templateId: customizingTemplate.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setCustomizingTemplate(null);
      setActiveView("my-templates");
    }
  };

  const ViewSelector: React.FC<{
    id: typeof activeView;
    label: string;
    icon: string;
    badge?: number;
  }> = ({ id, label, icon, badge }) => (
    <button
      onClick={() => setActiveView(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
        activeView === id
          ? "bg-blue-100 text-blue-700 border border-blue-200"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Template Management
        </h1>
        <p className="text-gray-600 mt-2">
          Discover, customize, and analyze your invoice templates
        </p>
      </div>

      {/* View Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-4">
          <ViewSelector id="browse" label="Browse Templates" icon="🔍" />
          {isProUser && (
            <>
              <ViewSelector
                id="my-templates"
                label="My Templates"
                icon="⭐"
                badge={userCustomizations.length}
              />
              <ViewSelector id="analytics" label="Analytics" icon="📊" />
            </>
          )}
        </div>
      </div>

      {/* Template Customizer View */}
      {activeView === "customize" && customizingTemplate && (
        <TemplateCustomizer
          template={customizingTemplate}
          onSaveCustomization={handleSaveCustomization}
          onCancel={() => {
            setCustomizingTemplate(null);
            setActiveView("browse");
          }}
        />
      )}

      {/* Analytics View */}
      {activeView === "analytics" && isProUser && (
        <TemplateAnalytics
          analyticsData={mockAnalyticsData}
          dateRange="Last 30 days"
        />
      )}

      {/* My Templates View */}
      {activeView === "my-templates" && isProUser && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              My Custom Templates
            </h2>
            <Button variant="primary" onClick={() => setActiveView("browse")}>
              + Create New Template
            </Button>
          </div>

          {userCustomizations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Custom Templates Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by browsing templates and customizing one to fit your
                business needs
              </p>
              <Button variant="primary" onClick={() => setActiveView("browse")}>
                Browse Templates
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCustomizations.map((customization) => {
                const baseTemplate = templates.find(
                  (t) => t.id === customization.templateId
                );
                return (
                  <div
                    key={customization.templateId}
                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {customization.customName || baseTemplate?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Based on {baseTemplate?.name}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onDeleteCustomization(customization.templateId)
                        }
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Items:</span>
                        <span className="ml-2 font-medium">
                          {customization.customItems?.length ||
                            baseTemplate?.defaultItems.length ||
                            0}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Last Updated:</span>
                        <span className="ml-2 font-medium">
                          {new Date(
                            customization.updatedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() =>
                          baseTemplate && onSelectTemplate(baseTemplate)
                        }
                        className="flex-1"
                      >
                        Use Template
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          baseTemplate && handleCustomizeTemplate(baseTemplate)
                        }
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Browse Templates View */}
      {activeView === "browse" && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search templates by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📝 {filteredTemplates.length} templates</span>
              <span>
                ⭐ {filteredTemplates.filter((t) => t.isPro).length} Pro
                templates
              </span>
              <span>
                🎨 {filteredTemplates.filter((t) => t.customizable).length}{" "}
                customizable
              </span>
              <span>
                📸 {filteredTemplates.filter((t) => t.portfolio).length} with
                portfolio
              </span>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredTemplates.map((template) => (
              <EnhancedTemplateSelector
                key={template.id}
                template={template}
                onSelectTemplate={onSelectTemplate}
                onCustomizeTemplate={
                  isProUser ? handleCustomizeTemplate : undefined
                }
                isProUser={isProUser}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Templates Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
