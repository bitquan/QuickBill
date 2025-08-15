import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subDays, subMonths, format } from 'date-fns';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
  format: 'currency' | 'number' | 'percentage';
}

export interface RevenueData {
  date: string;
  revenue: number;
  invoiceCount: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

export interface ClientAnalytics {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
  lastInvoiceDate: string;
  paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
  daysToPayAverage: number;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  percentage: number;
  invoiceCount: number;
  color: string;
}

export interface TimeRangeFilter {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalInvoices: number;
    averageInvoiceValue: number;
    collectionRate: number;
    outstandingAmount: number;
    monthlyRecurring: number;
  };
  metrics: AnalyticsMetric[];
  revenueChart: RevenueData[];
  clientAnalytics: ClientAnalytics[];
  categoryBreakdown: CategoryBreakdown[];
  recentActivity: any[];
  predictions: {
    nextMonthRevenue: number;
    confidence: number;
    trend: 'growing' | 'stable' | 'declining';
  };
}

interface AnalyticsContextType {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  timeRange: TimeRangeFilter;
  availableTimeRanges: TimeRangeFilter[];
  setTimeRange: (range: TimeRangeFilter) => void;
  refreshData: () => Promise<void>;
  exportReport: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
  getMetricTrend: (metricId: string, days: number) => Promise<number[]>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { currentUser } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available time range filters
  const availableTimeRanges: TimeRangeFilter[] = [
    {
      label: 'Last 7 Days',
      value: '7d',
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
    },
    {
      label: 'Last 30 Days',
      value: '30d',
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
    },
    {
      label: 'Last 3 Months',
      value: '3m',
      startDate: subMonths(new Date(), 3),
      endDate: new Date(),
    },
    {
      label: 'Last 6 Months',
      value: '6m',
      startDate: subMonths(new Date(), 6),
      endDate: new Date(),
    },
    {
      label: 'Last Year',
      value: '1y',
      startDate: subMonths(new Date(), 12),
      endDate: new Date(),
    },
    {
      label: 'This Month',
      value: 'month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    },
    {
      label: 'This Year',
      value: 'year',
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
    },
  ];

  function getDefaultTimeRange(): TimeRangeFilter {
    return (
      availableTimeRanges.find((range) => range.value === '30d') ||
      availableTimeRanges[1]
    );
  }

  const [timeRange, setTimeRange] = useState<TimeRangeFilter>(
    getDefaultTimeRange()
  );

  // Load analytics data
  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser, timeRange]);

  const refreshData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);

      // This would fetch real data from Firebase/Firestore
      // For now, we'll generate realistic mock data
      const mockData = await generateMockAnalyticsData(timeRange);
      setData(mockData);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalyticsData = async (
    range: TimeRangeFilter
  ): Promise<AnalyticsData> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const daysDiff = Math.ceil(
      (range.endDate.getTime() - range.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Generate revenue chart data
    const revenueChart: RevenueData[] = [];
    for (let i = 0; i < Math.min(daysDiff, 30); i++) {
      const date = subDays(range.endDate, i);
      const baseRevenue = 1500 + Math.random() * 2000;
      const invoiceCount = Math.floor(Math.random() * 8) + 2;

      revenueChart.unshift({
        date: format(date, 'yyyy-MM-dd'),
        revenue: baseRevenue,
        invoiceCount,
        paidInvoices: Math.floor(invoiceCount * 0.7),
        pendingInvoices: Math.floor(invoiceCount * 0.2),
        overdueInvoices: Math.floor(invoiceCount * 0.1),
      });
    }

    const totalRevenue = revenueChart.reduce(
      (sum, day) => sum + day.revenue,
      0
    );
    const totalInvoices = revenueChart.reduce(
      (sum, day) => sum + day.invoiceCount,
      0
    );
    const previousPeriodRevenue = totalRevenue * (0.85 + Math.random() * 0.3);

    return {
      overview: {
        totalRevenue,
        totalInvoices,
        averageInvoiceValue: totalRevenue / totalInvoices,
        collectionRate: 87.5,
        outstandingAmount: totalRevenue * 0.15,
        monthlyRecurring: totalRevenue * 0.4,
      },
      metrics: [
        {
          id: 'revenue',
          name: 'Total Revenue',
          value: totalRevenue,
          previousValue: previousPeriodRevenue,
          change: totalRevenue - previousPeriodRevenue,
          changePercent:
            ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) *
            100,
          trend: totalRevenue > previousPeriodRevenue ? 'up' : 'down',
          format: 'currency',
        },
        {
          id: 'invoices',
          name: 'Total Invoices',
          value: totalInvoices,
          previousValue: Math.floor(totalInvoices * 0.9),
          change: totalInvoices - Math.floor(totalInvoices * 0.9),
          changePercent: 11.1,
          trend: 'up',
          format: 'number',
        },
        {
          id: 'average',
          name: 'Average Invoice',
          value: totalRevenue / totalInvoices,
          previousValue: (totalRevenue / totalInvoices) * 0.95,
          change: (totalRevenue / totalInvoices) * 0.05,
          changePercent: 5.3,
          trend: 'up',
          format: 'currency',
        },
        {
          id: 'collection',
          name: 'Collection Rate',
          value: 87.5,
          previousValue: 84.2,
          change: 3.3,
          changePercent: 3.9,
          trend: 'up',
          format: 'percentage',
        },
      ],
      revenueChart,
      clientAnalytics: [
        {
          clientId: '1',
          clientName: 'Acme Corporation',
          totalRevenue: totalRevenue * 0.25,
          invoiceCount: Math.floor(totalInvoices * 0.2),
          averageInvoiceValue: 4500,
          lastInvoiceDate: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
          paymentHistory: 'excellent',
          daysToPayAverage: 12,
        },
        {
          clientId: '2',
          clientName: 'Tech Startup Inc',
          totalRevenue: totalRevenue * 0.18,
          invoiceCount: Math.floor(totalInvoices * 0.15),
          averageInvoiceValue: 3200,
          lastInvoiceDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
          paymentHistory: 'good',
          daysToPayAverage: 18,
        },
        {
          clientId: '3',
          clientName: 'Global Solutions LLC',
          totalRevenue: totalRevenue * 0.15,
          invoiceCount: Math.floor(totalInvoices * 0.18),
          averageInvoiceValue: 2800,
          lastInvoiceDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
          paymentHistory: 'excellent',
          daysToPayAverage: 8,
        },
      ],
      categoryBreakdown: [
        {
          category: 'Consulting',
          revenue: totalRevenue * 0.4,
          percentage: 40,
          invoiceCount: Math.floor(totalInvoices * 0.3),
          color: '#3b82f6',
        },
        {
          category: 'Development',
          revenue: totalRevenue * 0.35,
          percentage: 35,
          invoiceCount: Math.floor(totalInvoices * 0.4),
          color: '#10b981',
        },
        {
          category: 'Design',
          revenue: totalRevenue * 0.15,
          percentage: 15,
          invoiceCount: Math.floor(totalInvoices * 0.2),
          color: '#f59e0b',
        },
        {
          category: 'Support',
          revenue: totalRevenue * 0.1,
          percentage: 10,
          invoiceCount: Math.floor(totalInvoices * 0.1),
          color: '#8b5cf6',
        },
      ],
      recentActivity: [],
      predictions: {
        nextMonthRevenue: totalRevenue * 1.15,
        confidence: 85,
        trend: 'growing',
      },
    };
  };

  const exportReport = async (format: 'csv' | 'pdf' | 'excel') => {
    if (!data || !currentUser) return;

    try {
      setIsLoading(true);

      // This would generate and download the report
      console.log(`Exporting ${format} report for ${timeRange.label}`);

      // Mock export functionality
      const filename = `analytics-report-${timeRange.value}-${format}`;
      console.log(`Report exported: ${filename}`);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(`Failed to export ${format} report`);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricTrend = async (
    _metricId: string,
    days: number
  ): Promise<number[]> => {
    // This would fetch historical data for the specific metric
    // For now, return mock trend data
    return Array.from({ length: days }, () => Math.random() * 100);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        data,
        isLoading,
        error,
        timeRange,
        availableTimeRanges,
        setTimeRange,
        refreshData,
        exportReport,
        getMetricTrend,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
