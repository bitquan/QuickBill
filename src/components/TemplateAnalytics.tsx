import React from "react";

interface TemplateAnalyticsData {
  templateId: string;
  templateName: string;
  category: string;
  usageCount: number;
  revenue: number;
  popularityScore: number;
  lastUsed: string;
  averageInvoiceValue: number;
  conversionRate: number; // percentage of users who select this template after viewing
}

interface TemplateAnalyticsProps {
  analyticsData: TemplateAnalyticsData[];
  dateRange: string; // e.g., "Last 30 days"
}

export const TemplateAnalytics: React.FC<TemplateAnalyticsProps> = ({
  analyticsData,
  dateRange,
}) => {
  const topPerformingTemplates = analyticsData
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const mostUsedTemplates = analyticsData
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  const totalRevenue = analyticsData.reduce(
    (sum, data) => sum + data.revenue,
    0
  );
  const totalUsage = analyticsData.reduce(
    (sum, data) => sum + data.usageCount,
    0
  );

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    trend?: string;
    color?: string;
  }> = ({ title, value, icon, trend, color = "blue" }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {trend && <p className="text-sm text-green-600 mt-1">↗️ {trend}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  const TemplateRankingCard: React.FC<{
    title: string;
    templates: TemplateAnalyticsData[];
    valueFormatter: (data: TemplateAnalyticsData) => string;
    icon: string;
  }> = ({ title, templates, valueFormatter, icon }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {templates.map((template, index) => (
            <div
              key={template.templateId}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : index === 1
                      ? "bg-gray-100 text-gray-700"
                      : index === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    {template.templateName}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {template.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {valueFormatter(template)}
                </p>
                <p className="text-xs text-gray-500">
                  {template.usageCount} uses
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Template Analytics
          </h2>
          <p className="text-gray-600">{dateRange}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>📊</span>
          <span>Pro Analytics Dashboard</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon="💰"
          trend="+12% vs last period"
          color="green"
        />
        <MetricCard
          title="Total Template Uses"
          value={totalUsage.toLocaleString()}
          icon="📝"
          trend="+8% vs last period"
          color="blue"
        />
        <MetricCard
          title="Avg Invoice Value"
          value={`$${(totalRevenue / totalUsage || 0).toFixed(0)}`}
          icon="📈"
          trend="+5% vs last period"
          color="purple"
        />
        <MetricCard
          title="Active Templates"
          value={analyticsData.filter((d) => d.usageCount > 0).length}
          icon="⚡"
          color="orange"
        />
      </div>

      {/* Template Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemplateRankingCard
          title="Top Revenue Generators"
          templates={topPerformingTemplates}
          valueFormatter={(data) => `$${data.revenue.toLocaleString()}`}
          icon="🏆"
        />

        <TemplateRankingCard
          title="Most Popular Templates"
          templates={mostUsedTemplates}
          valueFormatter={(data) =>
            `${data.conversionRate.toFixed(1)}% conversion`
          }
          icon="🔥"
        />
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Templates Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData
                .sort((a, b) => b.revenue - a.revenue)
                .map((data) => (
                  <tr key={data.templateId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {data.templateName}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${
                                  i < Math.floor(data.popularityScore / 20)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                        {data.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.usageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.averageInvoiceValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${
                          data.conversionRate > 75
                            ? "text-green-600"
                            : data.conversionRate > 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {data.conversionRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.lastUsed}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          Smart Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-2">
              🎯 Optimization Opportunities
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Consider seasonal pricing for{" "}
                {
                  analyticsData.filter(
                    (d) => !d.templateName.includes("seasonal")
                  ).length
                }{" "}
                templates
              </li>
              <li>• Add portfolio images to boost conversion rates</li>
              <li>
                • Templates with &lt;50% conversion need price optimization
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-2">
              🚀 Growth Opportunities
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Create variations for top-performing templates</li>
              <li>• Expand location-based pricing to capture more markets</li>
              <li>• Add customization options to high-revenue templates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
