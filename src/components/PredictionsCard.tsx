import { useMemo } from 'react';

interface PredictionData {
  title: string;
  value: string;
  change: number;
  confidence: 'high' | 'medium' | 'low';
  timeframe: string;
  description: string;
  icon: string;
}

interface PredictionsCardProps {
  predictions?: PredictionData[];
  showConfidence?: boolean;
}

const DEFAULT_PREDICTIONS: PredictionData[] = [
  {
    title: 'Monthly Revenue',
    value: '$12,500',
    change: 15.3,
    confidence: 'high',
    timeframe: 'Next 30 days',
    description: 'Based on current trends and recurring invoices',
    icon: '💰'
  },
  {
    title: 'Client Growth',
    value: '8 new clients',
    change: 12.5,
    confidence: 'medium',
    timeframe: 'Next quarter',
    description: 'Projected from lead conversion rates',
    icon: '👥'
  },
  {
    title: 'Collection Rate',
    value: '94%',
    change: 2.1,
    confidence: 'high',
    timeframe: 'Next month',
    description: 'Expected payment completion rate',
    icon: '✅'
  },
  {
    title: 'Invoice Volume',
    value: '145 invoices',
    change: 8.7,
    confidence: 'medium',
    timeframe: 'Next 30 days',
    description: 'Predicted invoice generation',
    icon: '📄'
  }
];

export function PredictionsCard({
  predictions = DEFAULT_PREDICTIONS,
  showConfidence = true
}: PredictionsCardProps) {
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '➡️';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const overallTrend = useMemo(() => {
    const avgChange = predictions.reduce((sum, p) => sum + p.change, 0) / predictions.length;
    const positiveCount = predictions.filter(p => p.change > 0).length;
    const confidenceScore = predictions.filter(p => p.confidence === 'high').length / predictions.length;
    
    return {
      avgChange,
      positiveCount,
      confidenceScore,
      sentiment: avgChange > 5 ? 'positive' : avgChange < -5 ? 'negative' : 'neutral'
    };
  }, [predictions]);

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '📊';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall trend summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getSentimentEmoji(overallTrend.sentiment)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Business Outlook
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered predictions for your business
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${getSentimentColor(overallTrend.sentiment)}`}>
              {formatChange(overallTrend.avgChange)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Average growth
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {overallTrend.positiveCount}/{predictions.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Positive trends
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(overallTrend.confidenceScore * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              High confidence
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              30 days
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Forecast period
            </div>
          </div>
        </div>
      </div>

      {/* Individual predictions */}
      <div className="grid gap-4">
        {predictions.map((prediction, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{prediction.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {prediction.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {prediction.timeframe}
                  </p>
                </div>
              </div>

              {showConfidence && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.confidence} confidence
                </span>
              )}
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {prediction.value}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {prediction.description}
                </p>
              </div>

              <div className="text-right">
                <div className={`flex items-center space-x-1 text-sm font-medium ${getChangeColor(prediction.change)}`}>
                  <span>{getChangeIcon(prediction.change)}</span>
                  <span>{formatChange(prediction.change)}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  vs current
                </div>
              </div>
            </div>

            {/* Progress bar for confidence */}
            {showConfidence && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Prediction accuracy</span>
                  <span>
                    {prediction.confidence === 'high' ? '85-95%' : 
                     prediction.confidence === 'medium' ? '70-85%' : '50-70%'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      prediction.confidence === 'high' ? 'bg-green-500' :
                      prediction.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: prediction.confidence === 'high' ? '90%' :
                             prediction.confidence === 'medium' ? '75%' : '60%'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-500">⚠️</span>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Disclaimer:</strong> These predictions are based on historical data and current trends. 
              Actual results may vary due to market conditions, seasonal factors, and other variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
