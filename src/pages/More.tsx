import { useState } from "react";
import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import UpgradeModal from "../components/UpgradeModal";
import { useSubscription } from "../hooks/useSubscription";
import toast from "react-hot-toast";

export default function More() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isProUser, isLoading } = useSubscription();

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false); // Close modal
      toast.success("Signed out successfully");
      navigate("/"); // Redirect to welcome page after logout
    } catch (error) {
      console.error("Error logging out:", error);
      setShowLogoutConfirm(false); // Close modal even on error
      toast.error("Error signing out");
      navigate("/"); // Still redirect to welcome page
    }
  };

  // Show loading state while checking subscription (but timeout after 3 seconds)
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  React.useEffect(() => {
    console.log('More component - isLoading:', isLoading, 'isProUser:', isProUser);
    
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('More component - Loading timeout reached, defaulting to free user');
        setLoadingTimeout(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, isProUser]);

  if (isLoading && !loadingTimeout) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Default to free user if subscription check fails or times out
  const isPro = isProUser && !loadingTimeout;

  if (isPro) {
    return (
      <ProMorePage
        user={currentUser}
        onLogout={() => setShowLogoutConfirm(true)}
        showLogoutConfirm={showLogoutConfirm}
        setShowLogoutConfirm={setShowLogoutConfirm}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <FreeMorePage
      user={currentUser}
      onLogout={() => setShowLogoutConfirm(true)}
      showLogoutConfirm={showLogoutConfirm}
      setShowLogoutConfirm={setShowLogoutConfirm}
      handleLogout={handleLogout}
    />
  );
}

// Pro User More Page
function ProMorePage({
  user,
  onLogout,
  showLogoutConfirm,
  setShowLogoutConfirm,
  handleLogout,
}: any) {
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin =
    user?.email === "admin@quickbill.com" ||
    user?.email?.endsWith("@quickbill.dev");

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Pro User Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">👑 QuickBill Pro</h1>
            <p className="text-purple-100 mt-1">Welcome back, {user?.email}</p>
            {isAdmin && (
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-400 text-yellow-900">
                🔑 Admin Access
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              Pro Member
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel Access */}
      {isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Admin Dashboard
              </h3>
              <p className="text-xs text-yellow-700">
                Access admin controls and analytics
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/admin")}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Open Admin Panel
            </Button>
          </div>
        </div>
      )}

      {/* Account Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Management
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/settings')}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-lg mb-1">⚙️</div>
            <div className="text-sm font-medium text-gray-900">Settings</div>
            <div className="text-xs text-gray-500">Preferences</div>
          </button>

          <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-lg mb-1">💳</div>
            <div className="text-sm font-medium text-gray-900">Billing</div>
            <div className="text-xs text-gray-500">$9.99/month</div>
          </button>

          <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-lg mb-1">📊</div>
            <div className="text-sm font-medium text-gray-900">Analytics</div>
            <div className="text-xs text-gray-500">Business insights</div>
          </button>

          <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-lg mb-1">🎨</div>
            <div className="text-sm font-medium text-gray-900">Branding</div>
            <div className="text-xs text-gray-500">Customize templates</div>
          </button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Account</h4>
            <p className="text-xs text-gray-500">Signed in as {user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign Out
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Free User More Page
function FreeMorePage({
  user,
  onLogout,
  showLogoutConfirm,
  setShowLogoutConfirm,
  handleLogout,
}: any) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // This will be called when payment is successful
    setShowUpgradeModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Free User Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">QuickBill Free</h1>
            <p className="text-blue-100 mt-1">Welcome, {user?.email}</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              Free Tier
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Promotion */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-4">🚀 Unlock QuickBill Pro</h2>
        <p className="text-lg mb-6 text-purple-100">
          Professional features that pay for themselves with just one client
        </p>

        <div className="text-center">
          <p className="text-lg font-medium mb-4">
            Only $9.99/month • Cancel anytime • ROI typically 10x+
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-50 px-8"
            onClick={() => setShowUpgradeModal(true)}
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>

      {/* Current Usage */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Usage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">2</div>
            <div className="text-sm text-gray-500">Invoices Created</div>
            <div className="text-xs text-orange-600 mt-1">1 remaining</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-sm text-gray-500">Template Used</div>
            <div className="text-xs text-gray-500 mt-1">
              Basic template only
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">Local</div>
            <div className="text-sm text-gray-500">Storage</div>
            <div className="text-xs text-gray-500 mt-1">Device only</div>
          </div>
        </div>
      </div>

      {/* Account Management - Added for Free Users */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Management
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/settings')}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-lg mb-1">⚙️</div>
            <div className="text-sm font-medium text-gray-900">Settings</div>
            <div className="text-xs text-gray-500">Preferences</div>
          </button>

          <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed">
            <div className="text-lg mb-1">💳</div>
            <div className="text-sm font-medium text-gray-900">Billing</div>
            <div className="text-xs text-gray-500">Pro feature</div>
          </button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Account</h4>
            <p className="text-xs text-gray-500">Signed in as {user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign Out
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        invoicesUsed={2}
        maxInvoices={3}
      />
    </div>
  );
}
