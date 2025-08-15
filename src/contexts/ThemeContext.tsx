import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentUser } = useAuth();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);

  // Load theme preference from localStorage or user settings
  useEffect(() => {
    const loadThemePreference = () => {
      // First try to load from user's cloud settings (if logged in)
      if (currentUser?.uid) {
        // This would eventually load from user's Firebase preferences
        const savedMode = localStorage.getItem(`theme-${currentUser.uid}`) as ThemeMode;
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setModeState(savedMode);
          return;
        }
      }

      // Fallback to general localStorage
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setModeState(savedMode);
      }
    };

    loadThemePreference();
  }, [currentUser]);

  // Update actual theme based on mode and system preference
  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false;

      if (mode === 'dark') {
        shouldBeDark = true;
      } else if (mode === 'light') {
        shouldBeDark = false;
      } else {
        // System mode - check system preference
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(shouldBeDark);

      // Update DOM
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }

      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', shouldBeDark ? '#1f2937' : '#ffffff');
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'theme-color';
        newMeta.content = shouldBeDark ? '#1f2937' : '#ffffff';
        document.head.appendChild(newMeta);
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (mode === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    
    // Save preference
    if (currentUser?.uid) {
      localStorage.setItem(`theme-${currentUser.uid}`, newMode);
      // TODO: Save to Firebase user preferences
    } else {
      localStorage.setItem('theme-mode', newMode);
    }

    // Haptic feedback for theme change
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const toggleMode = () => {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme Toggle Button Component
interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ size = 'md', className = '', showLabel = false }: ThemeToggleProps) {
  const { mode, isDark, toggleMode } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const getIcon = () => {
    if (mode === 'light') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.5c3.04 0 5.5-2.46 5.5-5.5s-2.46-5.5-5.5-5.5S6.5 8.96 6.5 12s2.46 5.5 5.5 5.5zm0-9c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5zM12 1l3.5 3.5-3.5 3.5L8.5 4.5 12 1zm0 22l-3.5-3.5L12 16l3.5 3.5L12 23zm11-11l-3.5-3.5L16 12l3.5 3.5L23 12zM1 12l3.5 3.5L8 12 4.5 8.5 1 12z"/>
        </svg>
      );
    } else if (mode === 'dark') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      );
    }
  };

  const getLabel = () => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
    }
  };

  return (
    <button
      onClick={toggleMode}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center gap-2
        rounded-lg border transition-all duration-200
        ${isDark 
          ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' 
          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
        }
        ${className}
      `}
      title={`Current: ${getLabel()}, Click to cycle`}
    >
      {getIcon()}
      {showLabel && (
        <span className="text-sm font-medium">
          {getLabel()}
        </span>
      )}
    </button>
  );
}

// Dark mode aware utility function
export function useDarkModeClass(lightClass: string, darkClass: string): string {
  const { isDark } = useTheme();
  return isDark ? darkClass : lightClass;
}

// Theme-aware color utility
export function useThemeColor(colorKey: keyof typeof themeColors): string {
  const { isDark } = useTheme();
  return themeColors[colorKey][isDark ? 'dark' : 'light'];
}

const themeColors = {
  background: {
    light: '#ffffff',
    dark: '#1f2937'
  },
  surface: {
    light: '#f9fafb',
    dark: '#374151'
  },
  text: {
    light: '#111827',
    dark: '#f9fafb'
  },
  textSecondary: {
    light: '#6b7280',
    dark: '#d1d5db'
  },
  border: {
    light: '#e5e7eb',
    dark: '#4b5563'
  },
  primary: {
    light: '#3b82f6',
    dark: '#60a5fa'
  },
  success: {
    light: '#10b981',
    dark: '#34d399'
  },
  warning: {
    light: '#f59e0b',
    dark: '#fbbf24'
  },
  error: {
    light: '#ef4444',
    dark: '#f87171'
  }
};

// Utility component for smooth theme transitions
export function ThemeTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="transition-colors duration-200 ease-in-out">
      {children}
    </div>
  );
}
