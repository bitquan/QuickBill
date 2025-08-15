# ⚙️ Settings Hub Redesign - Deep Dive

**Comprehensive redesign strategy for the QuickBill settings experience**

---

## 🎯 **Current Settings Analysis**

### **Existing Issues**

#### **Scattered Settings Problem**
- **AccountManagement.tsx**: User profile and business info mixed together
- **EnhancedUpgradeModal.tsx**: Upgrade settings buried in modal
- **AppHeader.tsx**: Some settings in dropdown menu
- **Multiple components**: Settings spread across 8+ different files
- **No central hub**: Users can't find all settings in one place

#### **Poor Information Architecture**
```
Current Scattered Structure:
├── Account (in AccountManagement)
├── Business (mixed with account)
├── Billing (in UpgradeModal)
├── Email (in various components)
├── Template (in template components)
├── Export (in export modals)
└── App Preferences (nowhere!)
```

#### **User Experience Problems**
- **Search difficulty**: Users can't find specific settings
- **Inconsistent UI**: Each settings area looks different
- **Mobile unfriendly**: Settings don't work well on mobile
- **No help context**: Users don't understand what settings do
- **No bulk actions**: Can't change multiple related settings at once

---

## 🚀 **New Unified Settings Hub**

### **Design Philosophy**
- **Centralized control**: All settings accessible from one hub
- **Logical grouping**: Related settings organized together
- **Progressive disclosure**: Advanced settings hidden until needed
- **Contextual help**: Every setting explains its purpose and impact
- **Responsive design**: Works perfectly on mobile and desktop

### **Settings Architecture**

```
🏠 Settings Hub
├── 👤 Profile & Account
│   ├── Personal Information
│   ├── Business Details
│   ├── Contact Preferences
│   └── Account Security
├── 💳 Billing & Subscription
│   ├── Current Plan
│   ├── Payment Methods
│   ├── Billing History
│   └── Usage & Limits
├── 📧 Email & Notifications
│   ├── Email Templates
│   ├── Notification Preferences
│   ├── Email Signatures
│   └── Delivery Settings
├── 🎨 Branding & Templates
│   ├── Company Branding
│   ├── Invoice Templates
│   ├── Color Schemes
│   └── Logo Management
├── 📊 Data & Export
│   ├── Data Export
│   ├── Backup Settings
│   ├── Integration Settings
│   └── API Keys
├── 🔧 App Preferences
│   ├── Language & Region
│   ├── Currency Settings
│   ├── Date & Time Format
│   └── Theme Preferences
└── 🛡️ Privacy & Security
    ├── Two-Factor Auth
    ├── Login Sessions
    ├── Data Privacy
    └── Account Deletion
```

---

## 🎨 **Detailed Component Specifications**

### **1. Settings Hub Layout**

#### **Main Settings Container**
```typescript
interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  settings: SettingItem[];
  proOnly?: boolean;
  adminOnly?: boolean;
}

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'textarea' | 'color' | 'file' | 'custom';
  value: any;
  options?: { label: string; value: any }[];
  validation?: (value: any) => string | null;
  onChange: (value: any) => void;
  disabled?: boolean;
  proOnly?: boolean;
  helpText?: string;
  warningText?: string;
}

const SettingsHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  
  return (
    <div className="settings-hub">
      <SettingsHeader />
      <div className="settings-layout">
        <SettingsSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <SettingsContent 
          section={activeSection}
          searchQuery={searchQuery}
        />
      </div>
      {isChanged && <UnsavedChangesBar />}
    </div>
  );
};
```

#### **Responsive Sidebar Navigation**
```typescript
const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeSection,
  onSectionChange,
  searchQuery,
  onSearchChange
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const filteredSections = useFilteredSections(searchQuery);
  
  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden settings-mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Bars3Icon className="h-6 w-6" />
        Settings
      </button>
      
      {/* Sidebar */}
      <div className={`settings-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Search */}
        <div className="settings-search">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        {/* Navigation */}
        <nav className="settings-nav">
          {filteredSections.map((section) => (
            <SettingsNavItem
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              onClick={() => {
                onSectionChange(section.id);
                setIsMobileOpen(false);
              }}
            />
          ))}
        </nav>
        
        {/* Quick Actions */}
        <div className="settings-quick-actions">
          <QuickExportButton />
          <ContactSupportButton />
        </div>
      </div>
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="settings-mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
```

### **2. Profile & Account Section**

#### **Personal Information Component**
```typescript
const PersonalInformation: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar || null
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SettingsCard
      title="Personal Information"
      description="Manage your personal details and contact information"
    >
      <div className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          <Avatar src={formData.avatar} size="lg" />
          <div>
            <label className="btn btn-outline">
              Change Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>
        
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            value={formData.firstName}
            onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
            error={errors.firstName}
            required
          />
          <FormField
            label="Last Name"
            value={formData.lastName}
            onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
            error={errors.lastName}
            required
          />
        </div>
        
        {/* Contact Fields */}
        <FormField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
          error={errors.email}
          required
          helpText="This email is used for login and important notifications"
        />
        
        <FormField
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
          error={errors.phone}
          helpText="Optional. Used for SMS notifications if enabled"
        />
        
        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            loading={isLoading}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
};
```

#### **Business Details Component**
```typescript
const BusinessDetails: React.FC = () => {
  const { business, updateBusiness } = useBusiness();
  const [formData, setFormData] = useState({
    companyName: business.companyName || '',
    industry: business.industry || '',
    website: business.website || '',
    address: {
      street: business.address?.street || '',
      city: business.address?.city || '',
      state: business.address?.state || '',
      zipCode: business.address?.zipCode || '',
      country: business.address?.country || 'US'
    },
    taxId: business.taxId || '',
    logo: business.logo || null
  });
  
  return (
    <SettingsCard
      title="Business Details"
      description="Information about your business for invoices and legal purposes"
    >
      <div className="space-y-6">
        {/* Company Logo */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            {formData.logo ? (
              <img src={formData.logo} alt="Company Logo" className="w-full h-full object-contain" />
            ) : (
              <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <label className="btn btn-outline">
              Upload Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Square format recommended. Used on invoices.
            </p>
          </div>
        </div>
        
        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Company Name"
            value={formData.companyName}
            onChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
            required
            helpText="Appears on all invoices and communications"
          />
          
          <FormField
            label="Industry"
            type="select"
            value={formData.industry}
            onChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
            options={INDUSTRY_OPTIONS}
            helpText="Helps us provide relevant features and insights"
          />
        </div>
        
        <FormField
          label="Website"
          type="url"
          value={formData.website}
          onChange={(value) => setFormData(prev => ({ ...prev, website: value }))}
          placeholder="https://your-company.com"
          helpText="Optional. Added to invoice footer"
        />
        
        {/* Address */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Business Address</h4>
          
          <FormField
            label="Street Address"
            value={formData.address.street}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              address: { ...prev.address, street: value }
            }))}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="City"
              value={formData.address.city}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                address: { ...prev.address, city: value }
              }))}
            />
            
            <FormField
              label="State/Province"
              value={formData.address.state}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                address: { ...prev.address, state: value }
              }))}
            />
            
            <FormField
              label="ZIP/Postal Code"
              value={formData.address.zipCode}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                address: { ...prev.address, zipCode: value }
              }))}
            />
          </div>
          
          <FormField
            label="Country"
            type="select"
            value={formData.address.country}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              address: { ...prev.address, country: value }
            }))}
            options={COUNTRY_OPTIONS}
          />
        </div>
        
        {/* Tax Information */}
        <FormField
          label="Tax ID / EIN"
          value={formData.taxId}
          onChange={(value) => setFormData(prev => ({ ...prev, taxId: value }))}
          helpText="Your business tax identification number (optional)"
        />
      </div>
    </SettingsCard>
  );
};
```

### **3. Billing & Subscription Section**

#### **Current Plan Display**
```typescript
const CurrentPlan: React.FC = () => {
  const { subscription, usage } = useSubscription();
  const { user } = useAuth();
  
  const planFeatures = {
    free: [
      'Up to 3 invoices per month',
      'Basic email templates',
      'PDF export',
      'Email support'
    ],
    pro: [
      'Unlimited invoices',
      'Advanced templates',
      'Custom branding',
      'Analytics & reports',
      'Priority support',
      'API access'
    ]
  };
  
  return (
    <SettingsCard
      title="Current Plan"
      description="Manage your subscription and view usage"
    >
      <div className="space-y-6">
        {/* Plan Status */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              subscription.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <div>
              <h3 className="font-semibold text-gray-900">
                {subscription.plan === 'pro' ? 'QuickBill Pro' : 'QuickBill Free'}
              </h3>
              <p className="text-sm text-gray-600">
                {subscription.status === 'active' ? 'Active' : 'Inactive'} • 
                {subscription.plan === 'pro' 
                  ? ` Next billing: ${formatDate(subscription.nextBillingDate)}`
                  : ' Limited features'
                }
              </p>
            </div>
          </div>
          
          {subscription.plan === 'free' && (
            <Button
              variant="primary"
              onClick={() => openUpgradeModal()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Upgrade to Pro
            </Button>
          )}
        </div>
        
        {/* Usage Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UsageCard
            title="Invoices This Month"
            used={usage.invoicesThisMonth}
            limit={subscription.limits.invoicesPerMonth}
            isPro={subscription.plan === 'pro'}
          />
          
          <UsageCard
            title="Storage Used"
            used={formatBytes(usage.storageUsed)}
            limit={formatBytes(subscription.limits.storageLimit)}
            isPro={subscription.plan === 'pro'}
          />
          
          <UsageCard
            title="Email Sends"
            used={usage.emailsThisMonth}
            limit={subscription.limits.emailsPerMonth}
            isPro={subscription.plan === 'pro'}
          />
        </div>
        
        {/* Plan Features */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {planFeatures[subscription.plan].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Plan Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {subscription.plan === 'pro' ? (
            <>
              <Button variant="outline" onClick={() => openBillingPortal()}>
                Manage Billing
              </Button>
              <Button variant="outline" onClick={() => openCancelModal()}>
                Cancel Subscription
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => openUpgradeModal()}
              className="w-full md:w-auto"
            >
              Upgrade to Pro
            </Button>
          )}
        </div>
      </div>
    </SettingsCard>
  );
};

const UsageCard: React.FC<UsageCardProps> = ({ title, used, limit, isPro }) => {
  const percentage = isPro ? 0 : (used / limit) * 100;
  const isNearLimit = percentage > 80;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <div className="mt-2">
        <div className="text-lg font-semibold text-gray-900">
          {isPro ? used : `${used} / ${limit}`}
        </div>
        {!isPro && (
          <>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  isNearLimit ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            {isNearLimit && (
              <p className="text-xs text-red-600 mt-1">
                Approaching limit - consider upgrading
              </p>
            )}
          </>
        )}
        {isPro && (
          <p className="text-xs text-gray-500">Unlimited</p>
        )}
      </div>
    </div>
  );
};
```

### **4. Email & Notifications Section**

#### **Email Templates Manager**
```typescript
const EmailTemplatesManager: React.FC = () => {
  const { templates, updateTemplate, createTemplate } = useEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const templateTypes = [
    { id: 'invoice', name: 'Invoice Email', description: 'Sent when invoices are created' },
    { id: 'reminder', name: 'Payment Reminder', description: 'Sent for overdue invoices' },
    { id: 'receipt', name: 'Payment Receipt', description: 'Sent when payments are received' },
    { id: 'welcome', name: 'Welcome Email', description: 'Sent to new clients' }
  ];
  
  return (
    <SettingsCard
      title="Email Templates"
      description="Customize the emails sent to your clients"
    >
      <div className="space-y-6">
        {/* Template List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templateTypes.map((type) => {
            const template = templates.find(t => t.type === type.id);
            return (
              <TemplateCard
                key={type.id}
                type={type}
                template={template}
                onEdit={() => {
                  setSelectedTemplate(type.id);
                  setIsEditing(true);
                }}
                onPreview={() => openPreviewModal(template)}
              />
            );
          })}
        </div>
        
        {/* Template Editor Modal */}
        {isEditing && selectedTemplate && (
          <TemplateEditor
            templateType={selectedTemplate}
            template={templates.find(t => t.type === selectedTemplate)}
            onSave={handleTemplateSave}
            onClose={() => {
              setIsEditing(false);
              setSelectedTemplate(null);
            }}
          />
        )}
        
        {/* Global Email Settings */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Email Signature</h4>
          <EmailSignatureEditor />
        </div>
      </div>
    </SettingsCard>
  );
};

const TemplateCard: React.FC<TemplateCardProps> = ({ type, template, onEdit, onPreview }) => {
  const isCustomized = template && template.isCustomized;
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{type.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
          
          <div className="flex items-center gap-2 mt-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isCustomized 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isCustomized ? 'Customized' : 'Default'}
            </span>
            
            {template?.lastModified && (
              <span className="text-xs text-gray-500">
                Modified {formatDistanceToNow(template.lastModified)} ago
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPreview}>
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### **5. Mobile Settings Optimization**

#### **Mobile-First Settings Layout**
```typescript
const MobileSettingsLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showSidebar, setShowSidebar] = useState(false);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return (
      <div className="mobile-settings">
        {/* Mobile Header */}
        <div className="mobile-settings-header">
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-2 p-2"
          >
            <Bars3Icon className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          
          <div className="text-sm text-gray-600">
            {getSectionTitle(activeSection)}
          </div>
        </div>
        
        {/* Mobile Content */}
        <div className="mobile-settings-content">
          <SettingsContent section={activeSection} />
        </div>
        
        {/* Mobile Sidebar Sheet */}
        <BottomSheet
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          title="Settings"
        >
          <SettingsNavigation
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              setShowSidebar(false);
            }}
          />
        </BottomSheet>
      </div>
    );
  }
  
  // Desktop layout
  return <DesktopSettingsLayout />;
};
```

#### **Touch-Optimized Form Controls**
```typescript
const TouchFormField: React.FC<FormFieldProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error,
  helpText,
  ...props 
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const baseClasses = `
    w-full px-3 py-3 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
    ${isMobile ? 'text-16px' : 'text-sm'} // Prevent zoom on iOS
  `;
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {type === 'select' ? (
        <select
          className={baseClasses}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        >
          {props.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          className={`${baseClasses} resize-none`}
          rows={isMobile ? 3 : 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      ) : (
        <input
          type={type}
          className={baseClasses}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
```

---

## 🔍 **Advanced Settings Features**

### **1. Settings Search & Filtering**
```typescript
const useSettingsSearch = (sections: SettingsSection[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    
    const query = searchQuery.toLowerCase();
    
    return sections.map(section => ({
      ...section,
      settings: section.settings.filter(setting =>
        setting.label.toLowerCase().includes(query) ||
        setting.description.toLowerCase().includes(query) ||
        setting.helpText?.toLowerCase().includes(query)
      )
    })).filter(section => section.settings.length > 0);
  }, [sections, searchQuery]);
  
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };
  
  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    highlightText
  };
};
```

### **2. Settings Import/Export**
```typescript
const SettingsImportExport: React.FC = () => {
  const { exportSettings, importSettings } = useSettings();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const settings = await exportSettings();
      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quickbill-settings-${formatDate(new Date())}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Settings exported successfully');
    } catch (error) {
      toast.error('Failed to export settings');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const settings = JSON.parse(text);
      
      await importSettings(settings);
      toast.success('Settings imported successfully');
    } catch (error) {
      toast.error('Failed to import settings');
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <SettingsCard
      title="Import & Export"
      description="Backup and restore your settings"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            loading={isExporting}
            className="flex-1"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          
          <label className="btn btn-outline flex-1 cursor-pointer">
            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
            Import Settings
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
              }}
            />
          </label>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Important Notes:</p>
              <ul className="mt-1 text-yellow-700 space-y-1">
                <li>• Importing will overwrite your current settings</li>
                <li>• Only import settings from trusted sources</li>
                <li>• Create a backup before importing new settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
};
```

### **3. Settings Sync & Backup**
```typescript
const useSettingsSync = () => {
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  
  const syncSettings = async () => {
    setIsSyncing(true);
    try {
      await syncSettingsToCloud();
      setLastSyncTime(new Date());
      toast.success('Settings synced successfully');
    } catch (error) {
      toast.error('Failed to sync settings');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Auto-sync when settings change
  useEffect(() => {
    if (!autoSyncEnabled) return;
    
    const debounced = debounce(syncSettings, 5000);
    
    const unsubscribe = subscribeToSettingsChanges(debounced);
    return unsubscribe;
  }, [autoSyncEnabled]);
  
  return {
    lastSyncTime,
    isSyncing,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncSettings
  };
};
```

---

## 📋 **Implementation Roadmap**

### **Phase 1: Foundation (Week 1)**
- [ ] Create unified settings hub layout
- [ ] Implement responsive sidebar navigation
- [ ] Build core settings components (Profile, Business)
- [ ] Add settings search functionality
- [ ] Create mobile-optimized form controls

### **Phase 2: Core Sections (Week 2)**
- [ ] Implement billing & subscription section
- [ ] Build email templates manager
- [ ] Create notification preferences
- [ ] Add branding & template customization
- [ ] Implement data export features

### **Phase 3: Advanced Features (Week 3)**
- [ ] Add settings import/export
- [ ] Implement settings sync & backup
- [ ] Create contextual help system
- [ ] Add keyboard shortcuts
- [ ] Build settings validation system

### **Phase 4: Polish & Integration (Week 4)**
- [ ] Integrate with existing components
- [ ] Add comprehensive error handling
- [ ] Implement A/B testing for layouts
- [ ] Optimize for accessibility
- [ ] Add analytics tracking

---

## 🎯 **Success Metrics**

### **User Experience Goals**
- **Reduced search time**: 60% faster to find specific settings
- **Improved completion rates**: 40% more users complete settings setup
- **Better mobile experience**: 90+ mobile usability score
- **Reduced support tickets**: 30% fewer settings-related questions

### **Business Impact Goals**
- **Increased Pro conversion**: Better billing section improves upgrade rate by 15%
- **Improved onboarding**: Complete settings setup increases retention by 25%
- **Better user satisfaction**: Settings experience rating improves to 4.5+/5
- **Reduced churn**: Easier account management reduces cancellations by 20%

---

*This settings hub redesign will transform QuickBill's scattered settings into a cohesive, intuitive control center that empowers users to customize their experience and manage their business efficiently.*
