import { useState, useEffect } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { ChartCard } from '../components/ChartCard';
import { MetricCard } from '../components/MetricCard';
import { ClientInsightsTable } from '../components/ClientInsightsTable';
import { CategoryChart } from '../components/CategoryChart';
import { RevenueChart } from '../components/RevenueChart';
import { PredictionsCard } from '../components/PredictionsCard';
import { ExportModal } from '../components/ExportModal';
import toast from 'react-hot-toast';

export default function AdvancedAnalyticsDashboard() {
  const { 
    data, 
    isLoading, 
    error, 
    timeRange, 
    availableTimeRanges, 
    setTimeRange, 
    refreshData,
    exportReport 
  } = useAnalytics();
  
  const { formatCurrency } = useCurrency();
  const { isDark } = useTheme();
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'clients' | 'trends' | 'predictions'>('overview');

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        refreshData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoading, refreshData]);

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      await exportReport(format);
      toast.success(`Report exported as ${format.toUpperCase()}`);
      setShowExportModal(false);
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  const getMetricIcon = (metricId: string) => {
    const icons = {
      revenue: '💰',
      invoices: '📄',
      average: '📊',
      collection: '✅'
    };
    return icons[metricId as keyof typeof icons] || '📈';
  };

  const getViewIcon = (view: string) => {
    const icons = {
      overview: '📊',
      clients: '👥',
      trends: '📈',
      predictions: '🔮'
    };
    return icons[view as keyof typeof icons] || '📊';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analytics Unavailable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={refreshData} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                📊 Analytics Dashboard
              </h1>
              {isLoading && (
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange.value}
                onChange={(e) => {
                  const range = availableTimeRanges.find(r => r.value === e.target.value);
                  if (range) setTimeRange(range);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableTimeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              {/* Export Button */}
              <Button
                variant="outline"
                onClick={() => setShowExportModal(true)}
                className="text-sm"
                disabled={isLoading || !data}
              >
                📤 Export
              </Button>

              {/* Refresh Button */}
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={isLoading}
                className="text-sm"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'clients', label: 'Client Insights' },
              { key: 'trends', label: 'Trends' },
              { key: 'predictions', label: 'Predictions' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedView(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === tab.key
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {getViewIcon(tab.key)} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading && !data ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Overview View */}
            {selectedView === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {data.metrics.map((metric) => (
                    <MetricCard
                      key={metric.id}
                      title={metric.name}
                      value={metric.format === 'currency' 
                        ? formatCurrency(metric.value)
                        : metric.format === 'percentage'
                        ? `${metric.value.toFixed(1)}%`
                        : metric.value.toLocaleString()
                      }
                      change={metric.change}
                      changePercent={metric.changePercent}
                      trend={metric.trend}
                      icon={getMetricIcon(metric.id)}
                      format={metric.format}
                    />
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard
                    title="Revenue Trend"
                    subtitle={`${timeRange.label} • ${data.revenueChart.length} data points`}
                  >
                    <RevenueChart data={data.revenueChart} />
                  </ChartCard>

                  <ChartCard
                    title="Revenue by Category"
                    subtitle="Service breakdown"
                  >
                    <CategoryChart data={data.categoryBreakdown} />
                  </ChartCard>
                </div>

                {/* Quick Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ChartCard
                      title="Top Clients"
                      subtitle="By revenue contribution"
                    >
                      <ClientInsightsTable 
                        clients={data.clientAnalytics.slice(0, 5)} 
                        compact={true}
                      />
                    </ChartCard>
                  </div>
                  
                  <PredictionsCard predictions={data.predictions} />
                </div>
              </div>
            )}

            {/* Client Insights View */}
            {selectedView === 'clients' && (
              <div className="space-y-6">
                <ChartCard
                  title="Client Performance Analysis"
                  subtitle={`Detailed insights for ${timeRange.label.toLowerCase()}`}
                >
                  <ClientInsightsTable clients={data.clientAnalytics} />
                </ChartCard>
              </div>
            )}

            {/* Trends View */}
            {selectedView === 'trends' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard
                    title="Revenue Trend Analysis"
                    subtitle="Daily revenue over time"
                  >
                    <RevenueChart data={data.revenueChart} showTrend={true} />
                  </ChartCard>

                  <ChartCard
                    title="Invoice Volume Trends"
                    subtitle="Invoice count patterns"
                  >
                    <RevenueChart 
                      data={data.revenueChart} 
                      metric="invoiceCount"
                      color="#10b981"
                    />
                  </ChartCard>
                </div>

                <ChartCard
                  title="Category Performance Trends"
                  subtitle="Revenue distribution changes"
                >
                  <CategoryChart data={data.categoryBreakdown} showTrends={true} />
                </ChartCard>
              </div>
            )}

            {/* Predictions View */}
            {selectedView === 'predictions' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PredictionsCard predictions={data.predictions} detailed={true} />
                  
                  <ChartCard
                    title="Growth Projection"
                    subtitle="AI-powered revenue forecast"
                  >
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔮</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Advanced forecasting coming soon
                      </p>
                    </div>
                  </ChartCard>
                </div>

                <ChartCard
                  title="Business Insights & Recommendations"
                  subtitle="AI-powered suggestions"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-green-500 text-xl">💡</div>
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">
                          Optimize Collection Process
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your collection rate could improve by 12% with automated payment reminders.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-blue-500 text-xl">📈</div>
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          Expand Consulting Services
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Consulting generates 40% of revenue with highest margins. Consider expanding this service.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="text-amber-500 text-xl">⚡</div>
                      <div>
                        <h4 className="font-medium text-amber-900 dark:text-amber-100">
                          Faster Payment Terms
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Offering 2% early payment discount could improve cash flow by 25%.
                        </p>
                      </div>
                    </div>
                  </div>
                </ChartCard>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Analytics Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create some invoices to see your business analytics
            </p>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          timeRange={timeRange.label}
        />
      )}
    </div>
  );
}
