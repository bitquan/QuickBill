import { useMemo } from 'react';
import type { CategoryBreakdown } from '../contexts/AnalyticsContext';

interface CategoryChartProps {
  data: CategoryBreakdown[];
  type?: 'donut' | 'bar';
  showPercentages?: boolean;
  showValues?: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280'  // gray
];

export function CategoryChart({
  data,
  type = 'donut',
  showPercentages = true,
  showValues = true,
  colors = DEFAULT_COLORS
}: CategoryChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const total = data.reduce((sum, item) => sum + item.revenue, 0);
    let cumulativeAngle = 0;
    
    return data.map((item, index) => {
      const percentage = (item.revenue / total) * 100;
      const angle = (item.revenue / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      
      cumulativeAngle += angle;
      
      return {
        ...item,
        percentage,
        angle,
        startAngle,
        endAngle,
        color: colors[index % colors.length]
      };
    });
  }, [data, colors]);

  const createArcPath = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number = 0) => {
    const start = polarToCartesian(50, 50, outerRadius, endAngle);
    const end = polarToCartesian(50, 50, outerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    if (innerRadius === 0) {
      // Pie chart
      return [
        "M", 50, 50,
        "L", start.x, start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "Z"
      ].join(" ");
    } else {
      // Donut chart
      const startInner = polarToCartesian(50, 50, innerRadius, endAngle);
      const endInner = polarToCartesian(50, 50, innerRadius, startAngle);
      
      return [
        "M", start.x, start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "L", endInner.x, endInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
        "Z"
      ].join(" ");
    }
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 dark:text-gray-400">No category data available</p>
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    const maxRevenue = Math.max(...data.map(item => item.revenue));
    
    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const width = (item.revenue / maxRevenue) * 100;
          const color = colors[index % colors.length];
          
          return (
            <div key={item.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.category}
                </span>
                <div className="text-right">
                  {showValues && (
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(item.revenue)}
                    </span>
                  )}
                  {showPercentages && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({((item.revenue / data.reduce((sum, d) => sum + d.revenue, 0)) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${width}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Donut chart
  return (
    <div className="flex items-center space-x-8">
      {/* Chart */}
      <div className="flex-shrink-0">
        <svg width="200" height="200" viewBox="0 0 100 100" className="transform -rotate-90">
          {chartData.map((item) => (
            <path
              key={item.category}
              d={createArcPath(item.startAngle, item.endAngle, 45, 20)}
              fill={item.color}
              className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            >
              <title>{item.category}: {formatCurrency(item.revenue)} ({item.percentage.toFixed(1)}%)</title>
            </path>
          ))}
          
          {/* Center text */}
          <text
            x="50"
            y="45"
            textAnchor="middle"
            className="fill-gray-600 dark:fill-gray-300 text-xs font-medium transform rotate-90"
            style={{ fontSize: '8px' }}
          >
            Total
          </text>
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className="fill-gray-900 dark:fill-white text-sm font-bold transform rotate-90"
            style={{ fontSize: '6px' }}
          >
            {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3">
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-900 dark:text-white">
                {item.category}
              </span>
            </div>
            <div className="text-right">
              {showValues && (
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(item.revenue)}
                </div>
              )}
              {showPercentages && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.percentage.toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
