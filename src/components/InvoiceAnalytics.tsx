import { useMemo } from "react";

interface InvoiceAnalyticsProps {
  invoices: Array<{
    invoiceDate: string;
    total: number;
    status?: "draft" | "sent" | "paid" | "overdue";
  }>;
  timeRange: "7d" | "30d" | "90d";
}

export default function InvoiceAnalytics({
  invoices,
  timeRange,
}: InvoiceAnalyticsProps) {
  const analytics = useMemo(() => {
    const now = new Date();
    const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const filteredInvoices = invoices.filter(
      (invoice) => new Date(invoice.invoiceDate) >= cutoffDate
    );

    // Group invoices by week
    const weeklyData: { [key: string]: number } = {};
    const weeklyCount: { [key: string]: number } = {};

    filteredInvoices.forEach((invoice) => {
      const date = new Date(invoice.invoiceDate);
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const weekKey = startOfWeek.toISOString().split("T")[0];

      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + invoice.total;
      weeklyCount[weekKey] = (weeklyCount[weekKey] || 0) + 1;
    });

    // Calculate trends
    const weeks = Object.keys(weeklyData).sort();
    const currentWeek = weeks[weeks.length - 1];
    const previousWeek = weeks[weeks.length - 2];

    const currentWeekRevenue = weeklyData[currentWeek] || 0;
    const previousWeekRevenue = weeklyData[previousWeek] || 0;
    const revenueGrowth =
      previousWeekRevenue > 0
        ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) *
          100
        : 0;

    const currentWeekCount = weeklyCount[currentWeek] || 0;
    const previousWeekCount = weeklyCount[previousWeek] || 0;
    const countGrowth =
      previousWeekCount > 0
        ? ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100
        : 0;

    // Payment success rate
    const paidInvoices = filteredInvoices.filter(
      (inv) => inv.status === "paid"
    ).length;
    const sentInvoices = filteredInvoices.filter(
      (inv) => inv.status === "sent" || inv.status === "paid"
    ).length;
    const paymentRate =
      sentInvoices > 0 ? (paidInvoices / sentInvoices) * 100 : 0;

    return {
      revenueGrowth,
      countGrowth,
      paymentRate,
      weeklyData: weeks.slice(-6).map((week) => ({
        week: new Date(week).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: weeklyData[week] || 0,
        count: weeklyCount[week] || 0,
      })),
    };
  }, [invoices, timeRange]);

  const formatGrowth = (growth: number) => {
    if (Math.abs(growth) < 0.1) return "0%";
    return `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                analytics.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatGrowth(analytics.revenueGrowth)}
            </div>
            <div className="text-xs text-gray-600">Revenue Growth</div>
            <div className="text-xs text-gray-500">vs last week</div>
          </div>

          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                analytics.countGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatGrowth(analytics.countGrowth)}
            </div>
            <div className="text-xs text-gray-600">Invoice Growth</div>
            <div className="text-xs text-gray-500">vs last week</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {analytics.paymentRate.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Payment Rate</div>
            <div className="text-xs text-gray-500">invoices paid</div>
          </div>
        </div>

        {/* Simple Chart */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">
            Revenue Trend
          </div>
          <div className="flex items-end gap-2 h-20">
            {analytics.weeklyData.map((week, index) => {
              const maxRevenue = Math.max(
                ...analytics.weeklyData.map((w) => w.revenue)
              );
              const height =
                maxRevenue > 0 ? (week.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end h-16">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {week.week}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice Count Trend */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">
            Invoice Count
          </div>
          <div className="flex items-end gap-2 h-16">
            {analytics.weeklyData.map((week, index) => {
              const maxCount = Math.max(
                ...analytics.weeklyData.map((w) => w.count)
              );
              const height = maxCount > 0 ? (week.count / maxCount) * 100 : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end h-12">
                    <div
                      className="w-full bg-purple-500 rounded-t transition-all duration-300"
                      style={{ height: `${Math.max(height, 8)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1 text-center font-medium">
                    {week.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-900 mb-2">
            💡 Insights
          </div>
          <div className="space-y-1 text-xs text-blue-800">
            {analytics.revenueGrowth > 10 && (
              <div>
                🚀 Revenue is growing strongly (+
                {analytics.revenueGrowth.toFixed(1)}%)
              </div>
            )}
            {analytics.paymentRate > 80 && (
              <div>
                ✅ Excellent payment rate ({analytics.paymentRate.toFixed(0)}%)
              </div>
            )}
            {analytics.paymentRate < 50 && (
              <div>
                ⚠️ Consider payment reminders to improve collection rate
              </div>
            )}
            {analytics.countGrowth < -20 && (
              <div>📈 Focus on creating more invoices to maintain growth</div>
            )}
            {analytics.weeklyData.length === 0 && (
              <div>📊 Create more invoices to see detailed analytics</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
