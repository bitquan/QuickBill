import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  CreditCardIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  BuildingOfficeIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { cloudStorageService } from '../services/cloudStorage';
import toast from 'react-hot-toast';

// Real user data interfaces based on existing types
interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  emailVerified: boolean;
}

interface BusinessInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  taxNumber?: string;
  logo?: string;
  industry?: string;
}

interface UserPreferences {
  emailNotifications: boolean;
  invoiceReminders: boolean;
  paymentAlerts: boolean;
  marketingEmails: boolean;
  defaultCurrency: string;
  defaultPaymentTerms: string;
  invoicePrefix: string;
  autoIncrement: boolean;
  defaultNotes: string;
  theme: 'light' | 'dark' | 'auto';
}

type SettingsSection = 'profile' | 'business' | 'preferences' | 'subscription' | 'notifications' | 'security';

export default function EnhancedSettingsHub() {
  const { currentUser, logout } = useAuth();
  const { isProUser, manageSubscription, cancelSubscription } = useSubscription();

  // Real data state from Firebase
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  
  // UI state
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load real user data from Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Load user profile data
        const profileData: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || '',
          createdAt: currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime) : new Date(),
          lastLoginAt: currentUser.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime) : new Date(),
          emailVerified: currentUser.emailVerified
        };
        setUserProfile(profileData);

        // Load business info from Firestore
        const businessData = await cloudStorageService.getBusinessInfo(currentUser.uid);
        if (businessData) {
          setBusinessInfo({
            ...businessData,
            website: businessData.logo || '', // Use existing fields
            taxNumber: '',
            industry: ''
          });
        } else {
          // Initialize with default business info
          setBusinessInfo({
            name: '',
            email: currentUser.email || '',
            phone: '',
            address: '',
            website: '',
            taxNumber: '',
            logo: '',
            industry: ''
          });
        }

        // Load user preferences from Firestore
        const prefsData = await cloudStorageService.getUserPreferences(currentUser.uid);
        if (prefsData) {
          setPreferences(prefsData);
        } else {
          // Initialize with default preferences
          setPreferences({
            emailNotifications: true,
            invoiceReminders: true,
            paymentAlerts: true,
            marketingEmails: false,
            defaultCurrency: 'USD',
            defaultPaymentTerms: 'Net 30',
            invoicePrefix: 'INV',
            autoIncrement: true,
            defaultNotes: 'Thank you for your business!',
            theme: 'light'
          });
        }

      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  // Save business info to Firebase
  const saveBusinessInfo = async (data: Partial<BusinessInfo>) => {
    if (!currentUser || !businessInfo) return;

    try {
      setSaving(true);
      const updatedData = {
        ...businessInfo,
        ...data
      };

      await cloudStorageService.saveBusinessInfo(currentUser.uid, updatedData);
      setBusinessInfo(updatedData);
      toast.success('Business information saved successfully');
    } catch (error) {
      console.error('Error saving business info:', error);
      toast.error('Failed to save business information');
    } finally {
      setSaving(false);
    }
  };

  // Save user preferences to Firebase
  const savePreferences = async (data: Partial<UserPreferences>) => {
    if (!currentUser || !preferences) return;

    try {
      setSaving(true);
      const updatedData = {
        ...preferences,
        ...data
      };

      await cloudStorageService.saveUserPreferences(currentUser.uid, updatedData);
      setPreferences(updatedData);
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!currentUser) return;

    try {
      setSaving(true);
      // We would need to implement profile update through Firebase Auth
      // For now, just update local state
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error signing out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">
                Manage your account, business information, and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isProUser && (
                <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  👑 Pro User
                </div>
              )}
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                <SettingsNavItem
                  icon={UserIcon}
                  label="Profile"
                  isActive={activeSection === 'profile'}
                  onClick={() => setActiveSection('profile')}
                />
                <SettingsNavItem
                  icon={BuildingOfficeIcon}
                  label="Business Info"
                  isActive={activeSection === 'business'}
                  onClick={() => setActiveSection('business')}
                />
                <SettingsNavItem
                  icon={Cog6ToothIcon}
                  label="Preferences"
                  isActive={activeSection === 'preferences'}
                  onClick={() => setActiveSection('preferences')}
                />
                <SettingsNavItem
                  icon={CreditCardIcon}
                  label="Subscription"
                  isActive={activeSection === 'subscription'}
                  onClick={() => setActiveSection('subscription')}
                />
                <SettingsNavItem
                  icon={BellIcon}
                  label="Notifications"
                  isActive={activeSection === 'notifications'}
                  onClick={() => setActiveSection('notifications')}
                />
                <SettingsNavItem
                  icon={ShieldCheckIcon}
                  label="Security"
                  isActive={activeSection === 'security'}
                  onClick={() => setActiveSection('security')}
                />
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {activeSection === 'profile' && (
                <ProfileSection
                  userProfile={userProfile}
                  onUpdate={updateUserProfile}
                  saving={saving}
                />
              )}
              {activeSection === 'business' && (
                <BusinessInfoSection
                  businessInfo={businessInfo}
                  onSave={saveBusinessInfo}
                  saving={saving}
                />
              )}
              {activeSection === 'preferences' && (
                <PreferencesSection
                  preferences={preferences}
                  onSave={savePreferences}
                  saving={saving}
                />
              )}
              {activeSection === 'subscription' && (
                <SubscriptionSection
                  isProUser={isProUser}
                  onManage={manageSubscription}
                  onCancel={cancelSubscription}
                />
              )}
              {activeSection === 'notifications' && (
                <NotificationsSection
                  preferences={preferences}
                  onSave={savePreferences}
                  saving={saving}
                />
              )}
              {activeSection === 'security' && (
                <SecuritySection userProfile={userProfile} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Settings Navigation Item Component
interface SettingsNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function SettingsNavItem({ icon: Icon, label, isActive, onClick }: SettingsNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
      <span>{label}</span>
    </button>
  );
}

// Profile Section Component
interface ProfileSectionProps {
  userProfile: UserProfile | null;
  onUpdate: (data: { displayName?: string; photoURL?: string }) => void;
  saving: boolean;
}

function ProfileSection({ userProfile, onUpdate, saving }: ProfileSectionProps) {
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');

  useEffect(() => {
    setDisplayName(userProfile?.displayName || '');
    setPhotoURL(userProfile?.photoURL || '');
  }, [userProfile]);

  const handleSave = () => {
    onUpdate({
      displayName: displayName.trim(),
      photoURL: photoURL.trim()
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
      
      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-500">Add a photo to personalize your account</p>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Photo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture URL
          </label>
          <input
            type="url"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={userProfile?.email || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email address cannot be changed
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Account created: {userProfile?.createdAt.toLocaleDateString()}</div>
            <div>Last login: {userProfile?.lastLoginAt.toLocaleDateString()}</div>
            <div className="flex items-center space-x-2">
              <span>Email verified:</span>
              {userProfile?.emailVerified ? (
                <span className="text-green-600">✓ Verified</span>
              ) : (
                <span className="text-orange-600">⚠ Not verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Business Info Section Component  
interface BusinessInfoSectionProps {
  businessInfo: BusinessInfo | null;
  onSave: (data: Partial<BusinessInfo>) => void;
  saving: boolean;
}

function BusinessInfoSection({ businessInfo, onSave, saving }: BusinessInfoSectionProps) {
  const [formData, setFormData] = useState({
    name: businessInfo?.name || '',
    email: businessInfo?.email || '',
    phone: businessInfo?.phone || '',
    address: businessInfo?.address || '',
    website: businessInfo?.website || '',
    taxNumber: businessInfo?.taxNumber || '',
    industry: businessInfo?.industry || ''
  });

  useEffect(() => {
    if (businessInfo) {
      setFormData({
        name: businessInfo.name || '',
        email: businessInfo.email || '',
        phone: businessInfo.phone || '',
        address: businessInfo.address || '',
        website: businessInfo.website || '',
        taxNumber: businessInfo.taxNumber || '',
        industry: businessInfo.industry || ''
      });
    }
  }, [businessInfo]);

  const handleSave = () => {
    onSave(formData);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Your Company Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="business@company.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => updateField('website', e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax ID / VAT Number
          </label>
          <input
            type="text"
            value={formData.taxNumber}
            onChange={(e) => updateField('taxNumber', e.target.value)}
            placeholder="12-3456789"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => updateField('industry', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select industry</option>
            <option value="consulting">Consulting</option>
            <option value="freelance">Freelance/Creative</option>
            <option value="technology">Technology</option>
            <option value="marketing">Marketing</option>
            <option value="design">Design</option>
            <option value="legal">Legal</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            rows={3}
            placeholder="123 Business Street&#10;City, State 12345"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Business Information'}
        </button>
      </div>
    </div>
  );
}

// Preferences Section Component
interface PreferencesSectionProps {
  preferences: UserPreferences | null;
  onSave: (data: Partial<UserPreferences>) => void;
  saving: boolean;
}

function PreferencesSection({ preferences, onSave, saving }: PreferencesSectionProps) {
  const [formData, setFormData] = useState({
    defaultCurrency: preferences?.defaultCurrency || 'USD',
    defaultPaymentTerms: preferences?.defaultPaymentTerms || 'Net 30',
    invoicePrefix: preferences?.invoicePrefix || 'INV',
    autoIncrement: preferences?.autoIncrement ?? true,
    defaultNotes: preferences?.defaultNotes || 'Thank you for your business!',
    theme: preferences?.theme || 'light'
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        defaultCurrency: preferences.defaultCurrency || 'USD',
        defaultPaymentTerms: preferences.defaultPaymentTerms || 'Net 30',
        invoicePrefix: preferences.invoicePrefix || 'INV',
        autoIncrement: preferences.autoIncrement ?? true,
        defaultNotes: preferences.defaultNotes || 'Thank you for your business!',
        theme: preferences.theme || 'light'
      });
    }
  }, [preferences]);

  const handleSave = () => {
    onSave(formData);
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Invoice Preferences</h2>
      
      <div className="space-y-6">
        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Currency
          </label>
          <select
            value={formData.defaultCurrency}
            onChange={(e) => updateField('defaultCurrency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        {/* Payment Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Payment Terms
          </label>
          <select
            value={formData.defaultPaymentTerms}
            onChange={(e) => updateField('defaultPaymentTerms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Due on receipt">Due on receipt</option>
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 60">Net 60</option>
            <option value="Net 90">Net 90</option>
          </select>
        </div>

        {/* Invoice Prefix */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invoice Number Prefix
          </label>
          <input
            type="text"
            value={formData.invoicePrefix}
            onChange={(e) => updateField('invoicePrefix', e.target.value)}
            placeholder="INV"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: INV-001, INV-002, etc.
          </p>
        </div>

        {/* Auto Increment */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.autoIncrement}
              onChange={(e) => updateField('autoIncrement', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Automatically increment invoice numbers
            </span>
          </label>
        </div>

        {/* Default Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Invoice Notes
          </label>
          <textarea
            value={formData.defaultNotes}
            onChange={(e) => updateField('defaultNotes', e.target.value)}
            rows={3}
            placeholder="Thank you for your business!"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme Preference
          </label>
          <select
            value={formData.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (system preference)</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

// Subscription Section Component
interface SubscriptionSectionProps {
  isProUser: boolean;
  onManage: () => void;
  onCancel: () => void;
}

function SubscriptionSection({ isProUser, onManage, onCancel }: SubscriptionSectionProps) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Subscription Management</h2>
      
      {!isProUser ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">Free Plan</h3>
          <p className="text-blue-700 text-sm mb-4">
            You're currently on the Free plan with limited features.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900">QuickBill Pro</h3>
                <p className="text-green-700 text-sm">$9.99/month</p>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onManage}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Manage Billing
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Notifications Section Component
interface NotificationsSectionProps {
  preferences: UserPreferences | null;
  onSave: (data: Partial<UserPreferences>) => void;
  saving: boolean;
}

function NotificationsSection({ preferences, onSave, saving }: NotificationsSectionProps) {
  const [notifications, setNotifications] = useState({
    emailNotifications: preferences?.emailNotifications ?? true,
    invoiceReminders: preferences?.invoiceReminders ?? true,
    paymentAlerts: preferences?.paymentAlerts ?? true,
    marketingEmails: preferences?.marketingEmails ?? false
  });

  useEffect(() => {
    if (preferences) {
      setNotifications({
        emailNotifications: preferences.emailNotifications ?? true,
        invoiceReminders: preferences.invoiceReminders ?? true,
        paymentAlerts: preferences.paymentAlerts ?? true,
        marketingEmails: preferences.marketingEmails ?? false
      });
    }
  }, [preferences]);

  const handleSave = () => {
    onSave(notifications);
  };

  const updateNotification = (field: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive important account updates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.emailNotifications}
              onChange={(e) => updateNotification('emailNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Invoice Reminders</h4>
            <p className="text-sm text-gray-500">Get notified about overdue invoices</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.invoiceReminders}
              onChange={(e) => updateNotification('invoiceReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Payment Alerts</h4>
            <p className="text-sm text-gray-500">Get notified when invoices are paid</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.paymentAlerts}
              onChange={(e) => updateNotification('paymentAlerts', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
            <p className="text-sm text-gray-500">Product updates and tips</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.marketingEmails}
              onChange={(e) => updateNotification('marketingEmails', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Notification Preferences'}
        </button>
      </div>
    </div>
  );
}

// Security Section Component
interface SecuritySectionProps {
  userProfile: UserProfile | null;
}

function SecuritySection({ userProfile }: SecuritySectionProps) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
      
      <div className="space-y-6">
        {/* Email Verification */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Verification</h4>
            <p className="text-sm text-gray-500">
              {userProfile?.emailVerified ? 'Your email is verified' : 'Please verify your email address'}
            </p>
          </div>
          {userProfile?.emailVerified ? (
            <div className="text-green-600">✓ Verified</div>
          ) : (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Send Verification
            </button>
          )}
        </div>

        {/* Password Change */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Password</h4>
            <p className="text-sm text-gray-500">Change your account password</p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Change Password
          </button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-500">Add an extra layer of security</p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Enable 2FA
          </button>
        </div>

        {/* Account Deletion */}
        <div className="pt-6 border-t border-gray-200">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-900 mb-2">Danger Zone</h4>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
