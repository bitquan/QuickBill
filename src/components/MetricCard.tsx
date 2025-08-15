interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  format: 'currency' | 'number' | 'percentage';
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changePercent,
  trend,
  icon,
  format,
  className = ""
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '➡️';
    }
  };

  const formatChange = (value: number) => {
    if (format === 'currency') {
      return `${value >= 0 ? '+' : ''}$${Math.abs(value).toLocaleString()}`;
    } else if (format === 'percentage') {
      return `${value >= 0 ? '+' : ''}${Math.abs(value).toFixed(1)}%`;
    } else {
      return `${value >= 0 ? '+' : ''}${Math.abs(value).toLocaleString()}`;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
          <span>{getTrendIcon()}</span>
          <span>{Math.abs(changePercent).toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className={`text-sm ${getTrendColor()}`}>
          {formatChange(change)} from previous period
        </div>
      </div>
    </div>
  );
}
