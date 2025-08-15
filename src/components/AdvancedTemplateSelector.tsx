import { useState } from 'react';

export interface AdvancedInvoiceTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  isPremium: boolean;
  previewImage: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: 'modern' | 'classic' | 'minimal' | 'creative';
  features: string[];
}

export const advancedTemplates: AdvancedInvoiceTemplate[] = [
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Clean, tech-focused design perfect for software companies',
    industry: 'Technology',
    isPremium: true,
    previewImage: '/templates/modern-tech.png',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e293b',
      accent: '#06b6d4'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    layout: 'modern',
    features: ['Logo placement', 'QR codes', 'Digital signature area', 'Payment links']
  },
  {
    id: 'creative-agency',
    name: 'Creative Agency',
    description: 'Bold, colorful design for creative professionals',
    industry: 'Creative',
    isPremium: true,
    previewImage: '/templates/creative-agency.png',
    colors: {
      primary: '#8b5cf6',
      secondary: '#1f2937',
      accent: '#f59e0b'
    },
    fonts: {
      heading: 'Poppins',
      body: 'Open Sans'
    },
    layout: 'creative',
    features: ['Custom branding', 'Portfolio showcase', 'Social links', 'Creative layouts']
  },
  {
    id: 'consulting-pro',
    name: 'Professional Consulting',
    description: 'Executive-level design for consulting services',
    industry: 'Consulting',
    isPremium: true,
    previewImage: '/templates/consulting-pro.png',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#dc2626'
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Source Sans Pro'
    },
    layout: 'classic',
    features: ['Professional headers', 'Terms & conditions', 'Executive branding', 'Formal styling']
  },
  {
    id: 'freelancer-minimal',
    name: 'Freelancer Minimal',
    description: 'Simple, professional design for freelancers',
    industry: 'Freelance',
    isPremium: false,
    previewImage: '/templates/freelancer-minimal.png',
    colors: {
      primary: '#6b7280',
      secondary: '#374151',
      accent: '#10b981'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    layout: 'minimal',
    features: ['Time tracking', 'Project descriptions', 'Simple layouts', 'Mobile optimized']
  }
];

interface AdvancedTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  isPro: boolean;
  onUpgrade: () => void;
}

export default function AdvancedTemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  isPro,
  onUpgrade
}: AdvancedTemplateSelectorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const industries = ['all', 'Technology', 'Creative', 'Consulting', 'Freelance'];

  const filteredTemplates = selectedIndustry === 'all' 
    ? advancedTemplates 
    : advancedTemplates.filter(template => template.industry === selectedIndustry);

  const handleTemplateSelect = (templateId: string, isPremium: boolean) => {
    if (isPremium && !isPro) {
      onUpgrade();
      return;
    }
    onTemplateSelect(templateId);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Professional Invoice Templates
        </h3>
        <p className="text-sm text-gray-600">
          Industry-specific templates designed for maximum impact
        </p>
      </div>

      {/* Industry Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedIndustry === industry
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {industry === 'all' ? 'All Industries' : industry}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-600 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => handleTemplateSelect(template.id, template.isPremium)}
          >
            {/* Premium Badge */}
            {template.isPremium && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  👑 Pro
                </span>
              </div>
            )}

            {/* Template Preview */}
            <div 
              className="h-32 flex items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.secondary}15)`
              }}
            >
              <div className="text-center">
                <div 
                  className="w-20 h-24 mx-auto rounded-lg shadow-md flex flex-col items-center justify-center text-white text-xs font-medium relative overflow-hidden"
                  style={{ 
                    backgroundColor: template.colors.primary,
                    fontFamily: template.fonts.heading
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-6 flex items-center justify-between px-2" style={{ backgroundColor: template.colors.secondary }}>
                    <div className="w-3 h-1 bg-white/60 rounded"></div>
                    <div className="w-6 h-1 bg-white/60 rounded"></div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-[10px] mb-1">INVOICE</div>
                    <div className="w-12 h-0.5 bg-white/60 mx-auto mb-2"></div>
                    <div className="space-y-1">
                      <div className="w-8 h-0.5 bg-white/40 mx-auto"></div>
                      <div className="w-10 h-0.5 bg-white/40 mx-auto"></div>
                      <div className="w-6 h-0.5 bg-white/40 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {template.name}
                </h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {template.industry}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 mb-3">
                {template.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {template.features.slice(0, 2).map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
                {template.features.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{template.features.length - 2} more
                  </span>
                )}
              </div>
            </div>

            {/* Lock Overlay for Premium Templates */}
            {template.isPremium && !isPro && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                <div className="bg-white rounded-lg p-3 text-center shadow-lg">
                  <div className="text-xl mb-1">🔒</div>
                  <div className="text-xs font-medium text-gray-900 mb-1">Pro Template</div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpgrade();
                    }}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}

            {/* Selection Indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-3 left-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
