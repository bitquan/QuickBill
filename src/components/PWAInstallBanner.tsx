import { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { Button } from './Button';

export default function PWAInstallBanner() {
  const { install } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if already installed, not installable, or user dismissed
  if (install.isInstalled || !install.isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    if (install.installPrompt) {
      const accepted = await install.installPrompt();
      if (!accepted) {
        setIsDismissed(true);
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18h14v2H5z"/>
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1">
              Install QuickBill App
            </h3>
            <p className="text-xs text-blue-100 mb-3">
              Get app-like experience with offline support and faster loading
            </p>
            
            {/* Features preview */}
            <div className="flex items-center gap-4 text-xs text-blue-100 mb-3">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Offline access</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
                <span>Faster loading</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleInstall}
                className="bg-white text-blue-600 hover:bg-blue-50 text-xs px-3 py-1.5"
              >
                Install App
              </Button>
              <button
                onClick={handleDismiss}
                className="text-blue-100 hover:text-white text-xs px-2 py-1.5 rounded transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-100 hover:text-white p-1 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// PWA Status Indicator Component
export function PWAStatusIndicator() {
  const { install, offline, update } = usePWA();
  
  if (!offline.hasOfflineSupport) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-40">
      <div className="flex items-center gap-2">
        {/* Online/Offline indicator */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          offline.isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-orange-100 text-orange-800 border border-orange-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            offline.isOnline ? 'bg-green-500' : 'bg-orange-500'
          }`} />
          {offline.isOnline ? 'Online' : 'Offline'}
        </div>

        {/* App installed indicator */}
        {install.isInstalled && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            App Mode
          </div>
        )}

        {/* Update available indicator */}
        {update.isUpdateAvailable && (
          <button
            onClick={update.updateSW}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200 transition-colors"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
            Update
          </button>
        )}
      </div>
    </div>
  );
}
