import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import type { RevenueData } from '../contexts/AnalyticsContext';

interface RevenueChartProps {
  data: RevenueData[];
  metric?: 'revenue' | 'invoiceCount';
  color?: string;
  showTrend?: boolean;
  height?: number;
}

export function RevenueChart({
  data,
  metric = 'revenue',
  color = '#3b82f6',
  showTrend = false,
  height = 300
}: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const maxValue = Math.max(...data.map(d => d[metric]));
    const minValue = Math.min(...data.map(d => d[metric]));
    const range = maxValue - minValue || 1;
    
    return data.map((item, index) => ({
      ...item,
      x: (index / (data.length - 1)) * 100,
      y: ((maxValue - item[metric]) / range) * 80 + 10
    }));
  }, [data, metric]);

  const createPath = () => {
    if (chartData.length === 0) return '';
    
    const pathData = chartData
      .map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${point.x} ${point.y}`;
      })
      .join(' ');
    
    return pathData;
  };

  const createAreaPath = () => {
    if (chartData.length === 0) return '';
    
    const pathData = createPath();
    const firstPoint = chartData[0];
    const lastPoint = chartData[chartData.length - 1];
    
    return `${pathData} L ${lastPoint.x} 90 L ${firstPoint.x} 90 Z`;
  };

  const formatValue = (value: number) => {
    if (metric === 'revenue') {
      return `$${value.toLocaleString()}`;
    }
    return value.toString();
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd');
    } catch {
      return dateStr;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        className="overflow-visible"
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.1"
              className="text-gray-300 dark:text-gray-600"
              opacity="0.3"
            />
          </pattern>
          
          {/* Gradient for area fill */}
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Background grid */}
        <rect width="100" height="100" fill="url(#grid)" opacity="0.5" />

        {/* Area fill */}
        <path
          d={createAreaPath()}
          fill="url(#areaGradient)"
          className="transition-all duration-300"
        />

        {/* Main line */}
        <path
          d={createPath()}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Data points */}
        {chartData.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="0.8"
              fill={color}
              className="hover:r-1.2 transition-all duration-200 cursor-pointer"
            />
            
            {/* Tooltip on hover */}
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="transparent"
              className="cursor-pointer"
            >
              <title>
                {formatDate(point.date)}: {formatValue(point[metric])}
              </title>
            </circle>
          </g>
        ))}

        {/* Trend line (if enabled) */}
        {showTrend && chartData.length > 1 && (
          <line
            x1={chartData[0].x}
            y1={chartData[0].y}
            x2={chartData[chartData.length - 1].x}
            y2={chartData[chartData.length - 1].y}
            stroke="#ef4444"
            strokeWidth="0.3"
            strokeDasharray="2,2"
            opacity="0.7"
          />
        )}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4 px-2">
        {data.filter((_, index) => index % Math.ceil(data.length / 5) === 0).map((item) => (
          <span
            key={item.date}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {formatDate(item.date)}
          </span>
        ))}
      </div>

      {/* Chart statistics */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">
            {metric === 'revenue' ? 'Total Revenue' : 'Total Invoices'}:
          </span>{' '}
          {formatValue(data.reduce((sum, item) => sum + item[metric], 0))}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Average:</span>{' '}
          {formatValue(
            data.reduce((sum, item) => sum + item[metric], 0) / data.length
          )}
        </div>
      </div>
    </div>
  );
}
