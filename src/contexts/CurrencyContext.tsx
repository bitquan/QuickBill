import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandsSeparator: string;
  decimalPlaces: number;
  exchangeRate?: number; // Rate relative to USD
}

export const supportedCurrencies: Currency[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'after',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimalPlaces: 2
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 0
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2
  },
  {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    symbolPosition: 'before',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimalPlaces: 2
  },
  {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2
  },
  {
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 0
  }
];

interface CurrencyContextType {
  baseCurrency: Currency;
  displayCurrency: Currency;
  exchangeRates: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  setBaseCurrency: (currency: Currency) => void;
  setDisplayCurrency: (currency: Currency) => void;
  convertAmount: (amount: number, from: string, to: string) => number;
  formatCurrency: (amount: number, currencyCode?: string, options?: CurrencyFormatOptions) => string;
  refreshExchangeRates: () => Promise<void>;
}

interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showCode?: boolean;
  compact?: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { currentUser } = useAuth();
  const [baseCurrency, setBaseCurrencyState] = useState<Currency>(supportedCurrencies[0]); // USD default
  const [displayCurrency, setDisplayCurrencyState] = useState<Currency>(supportedCurrencies[0]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load currency preferences
  useEffect(() => {
    const loadCurrencyPreferences = () => {
      try {
        // Load from user's cloud settings if logged in
        if (currentUser?.uid) {
          const savedBaseCurrency = localStorage.getItem(`baseCurrency-${currentUser.uid}`);
          const savedDisplayCurrency = localStorage.getItem(`displayCurrency-${currentUser.uid}`);
          
          if (savedBaseCurrency) {
            const currency = supportedCurrencies.find(c => c.code === savedBaseCurrency);
            if (currency) setBaseCurrencyState(currency);
          }
          
          if (savedDisplayCurrency) {
            const currency = supportedCurrencies.find(c => c.code === savedDisplayCurrency);
            if (currency) setDisplayCurrencyState(currency);
          }
        } else {
          // Fallback to general localStorage
          const savedBaseCurrency = localStorage.getItem('baseCurrency');
          const savedDisplayCurrency = localStorage.getItem('displayCurrency');
          
          if (savedBaseCurrency) {
            const currency = supportedCurrencies.find(c => c.code === savedBaseCurrency);
            if (currency) setBaseCurrencyState(currency);
          }
          
          if (savedDisplayCurrency) {
            const currency = supportedCurrencies.find(c => c.code === savedDisplayCurrency);
            if (currency) setDisplayCurrencyState(currency);
          }
        }

        // Try to detect user's currency from locale
        if (!currentUser?.uid && !localStorage.getItem('baseCurrency')) {
          const userLocale = navigator.language || 'en-US';
          const detectedCurrency = detectCurrencyFromLocale(userLocale);
          if (detectedCurrency) {
            setBaseCurrencyState(detectedCurrency);
            setDisplayCurrencyState(detectedCurrency);
          }
        }
      } catch (error) {
        console.error('Error loading currency preferences:', error);
      }
    };

    loadCurrencyPreferences();
  }, [currentUser]);

  // Load exchange rates
  useEffect(() => {
    refreshExchangeRates();
    
    // Refresh rates every hour
    const interval = setInterval(refreshExchangeRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const detectCurrencyFromLocale = (locale: string): Currency | null => {
    const localeToCurrency: Record<string, string> = {
      'en-US': 'USD',
      'en-CA': 'CAD',
      'en-GB': 'GBP',
      'en-AU': 'AUD',
      'fr-FR': 'EUR',
      'de-DE': 'EUR',
      'es-ES': 'EUR',
      'it-IT': 'EUR',
      'ja-JP': 'JPY',
      'ko-KR': 'KRW',
      'zh-CN': 'CNY',
      'hi-IN': 'INR',
      'pt-BR': 'BRL',
      'es-MX': 'MXN'
    };

    const currencyCode = localeToCurrency[locale] || localeToCurrency[locale.split('-')[0]];
    return supportedCurrencies.find(c => c.code === currencyCode) || null;
  };

  const refreshExchangeRates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Using a free API service for exchange rates
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      setExchangeRates(data.rates);

      // Cache the rates with timestamp
      localStorage.setItem('exchangeRates', JSON.stringify({
        rates: data.rates,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setError('Failed to update exchange rates');

      // Try to load cached rates
      try {
        const cached = localStorage.getItem('exchangeRates');
        if (cached) {
          const { rates, timestamp } = JSON.parse(cached);
          // Use cached rates if they're less than 24 hours old
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setExchangeRates(rates);
            setError('Using cached exchange rates');
          }
        }
      } catch (cacheError) {
        console.error('Error loading cached rates:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setBaseCurrency = (currency: Currency) => {
    setBaseCurrencyState(currency);
    
    // Save preference
    if (currentUser?.uid) {
      localStorage.setItem(`baseCurrency-${currentUser.uid}`, currency.code);
      // TODO: Save to Firebase user preferences
    } else {
      localStorage.setItem('baseCurrency', currency.code);
    }
  };

  const setDisplayCurrency = (currency: Currency) => {
    setDisplayCurrencyState(currency);
    
    // Save preference
    if (currentUser?.uid) {
      localStorage.setItem(`displayCurrency-${currentUser.uid}`, currency.code);
      // TODO: Save to Firebase user preferences
    } else {
      localStorage.setItem('displayCurrency', currency.code);
    }
  };

  const convertAmount = (amount: number, from: string, to: string): number => {
    if (from === to) return amount;

    const fromRate = from === 'USD' ? 1 : exchangeRates[from];
    const toRate = to === 'USD' ? 1 : exchangeRates[to];

    if (!fromRate || !toRate) {
      console.warn(`Exchange rate not available for ${from} to ${to}`);
      return amount; // Return original amount if conversion not possible
    }

    // Convert from source currency to USD, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  };

  const formatCurrency = (
    amount: number, 
    currencyCode?: string, 
    options: CurrencyFormatOptions = {}
  ): string => {
    const currency = currencyCode 
      ? supportedCurrencies.find(c => c.code === currencyCode) || displayCurrency
      : displayCurrency;

    const {
      showSymbol = true,
      showCode = false,
      compact = false
    } = options;

    // Format the number
    const absAmount = Math.abs(amount);
    let formattedNumber = '';

    if (compact && absAmount >= 1000000) {
      formattedNumber = (absAmount / 1000000).toFixed(1) + 'M';
    } else if (compact && absAmount >= 1000) {
      formattedNumber = (absAmount / 1000).toFixed(1) + 'K';
    } else {
      // Format with proper decimal places and separators
      const parts = absAmount.toFixed(currency.decimalPlaces).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
      formattedNumber = parts.join(currency.decimalSeparator);
    }

    // Add negative sign if needed
    if (amount < 0) {
      formattedNumber = '-' + formattedNumber;
    }

    // Construct final string
    let result = formattedNumber;

    if (showSymbol) {
      if (currency.symbolPosition === 'before') {
        result = currency.symbol + result;
      } else {
        result = result + ' ' + currency.symbol;
      }
    }

    if (showCode) {
      result = result + (showSymbol ? ` ${currency.code}` : ` ${currency.code}`);
    }

    return result;
  };

  return (
    <CurrencyContext.Provider value={{
      baseCurrency,
      displayCurrency,
      exchangeRates,
      isLoading,
      error,
      setBaseCurrency,
      setDisplayCurrency,
      convertAmount,
      formatCurrency,
      refreshExchangeRates
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Currency Selector Component
interface CurrencySelectorProps {
  value: string;
  onChange: (currencyCode: string) => void;
  label?: string;
  className?: string;
  showFlag?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  label = "Currency",
  className = "",
  showFlag = true
}: CurrencySelectorProps) {
  const flagEmojis: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    CHF: '🇨🇭',
    CNY: '🇨🇳',
    INR: '🇮🇳',
    BRL: '🇧🇷',
    MXN: '🇲🇽',
    KRW: '🇰🇷'
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {supportedCurrencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {showFlag && flagEmojis[currency.code] ? `${flagEmojis[currency.code]} ` : ''}
            {currency.code} - {currency.name} ({currency.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}

// Currency Display Component
interface CurrencyDisplayProps {
  amount: number;
  currencyCode?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCode?: boolean;
  compact?: boolean;
}

export function CurrencyDisplay({
  amount,
  currencyCode,
  className = "",
  size = 'md',
  showCode = false,
  compact = false
}: CurrencyDisplayProps) {
  const { formatCurrency } = useCurrency();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {formatCurrency(amount, currencyCode, { showCode, compact })}
    </span>
  );
}
