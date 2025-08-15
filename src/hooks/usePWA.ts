import { useState, useEffect } from 'react';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAUpdateInfo {
  isUpdateAvailable: boolean;
  updateSW: () => Promise<void>;
}

interface PWAInstallInfo {
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: (() => Promise<boolean>) | null;
}

interface PWAOfflineInfo {
  isOnline: boolean;
  hasOfflineSupport: boolean;
}

interface PWAHookReturn {
  // Installation
  install: PWAInstallInfo;
  
  // Updates
  update: PWAUpdateInfo;
  
  // Offline support
  offline: PWAOfflineInfo;
  
  // Service worker registration
  registration: ServiceWorkerRegistration | null;
  
  // Utility functions
  checkForUpdates: () => Promise<void>;
  showInstallPrompt: () => Promise<boolean>;
}

export function usePWA(): PWAHookReturn {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerSW();
    }
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if app is installed
  useEffect(() => {
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      setIsInstalled(isStandalone || isFullscreen || isMinimalUI);
    };

    checkInstallation();
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstallation);

    return () => {
      mediaQuery.removeEventListener('change', checkInstallation);
    };
  }, []);

  const registerSW = async () => {
    try {
      // Check if already registered
      const existingRegistration = await navigator.serviceWorker.getRegistration('/');
      if (existingRegistration) {
        console.log('PWA: Service worker already registered');
        setRegistration(existingRegistration);
        await checkForUpdates();
        return;
      }

      console.log('PWA: Registering service worker...');
      
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setRegistration(reg);
      console.log('PWA: Service worker registered successfully');

      // Check for updates
      reg.addEventListener('updatefound', () => {
        console.log('PWA: Update found');
        const newWorker = reg.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('PWA: Update available');
              setIsUpdateAvailable(true);
            }
          });
        }
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA: Controller changed - reloading page');
        window.location.reload();
      });

      // Check for updates on load
      await checkForUpdates();

    } catch (error) {
      console.error('PWA: Service worker registration failed:', error);
    }
  };

  const checkForUpdates = async (): Promise<void> => {
    if (!registration) return;

    try {
      console.log('PWA: Checking for updates...');
      await registration.update();
    } catch (error) {
      console.error('PWA: Update check failed:', error);
    }
  };

  const updateSW = async (): Promise<void> => {
    if (!registration || !registration.waiting) return;

    console.log('PWA: Applying update...');
    
    // Tell the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    setIsUpdateAvailable(false);
  };

  const showInstallPrompt = async (): Promise<boolean> => {
    if (!installPrompt) {
      console.log('PWA: Install prompt not available');
      return false;
    }

    try {
      console.log('PWA: Showing install prompt...');
      await installPrompt.prompt();
      
      const { outcome } = await installPrompt.userChoice;
      console.log('PWA: Install prompt result:', outcome);
      
      setInstallPrompt(null);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Install prompt failed:', error);
      return false;
    }
  };

  return {
    install: {
      isInstallable: !!installPrompt,
      isInstalled,
      installPrompt: installPrompt ? showInstallPrompt : null
    },
    update: {
      isUpdateAvailable,
      updateSW
    },
    offline: {
      isOnline,
      hasOfflineSupport: !!registration
    },
    registration,
    checkForUpdates,
    showInstallPrompt
  };
}

// PWA feature detection utilities
export const PWAFeatures = {
  isSupported: (): boolean => {
    return 'serviceWorker' in navigator && 'Cache' in window;
  },
  
  supportsInstall: (): boolean => {
    return 'onbeforeinstallprompt' in window;
  },
  
  supportsNotifications: (): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },
  
  supportsBackgroundSync: (): boolean => {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  },
  
  supportsPushMessaging: (): boolean => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },
  
  isStandalone: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
};

export default usePWA;
