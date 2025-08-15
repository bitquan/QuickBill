import { useState } from 'react';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  loading?: boolean;
}

interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  dateRange: 'last7days' | 'last30days' | 'last90days' | 'lastYear' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeCharts: boolean;
  includeRawData: boolean;
  includeClientDetails: boolean;
  sections: {
    overview: boolean;
    revenue: boolean;
    clients: boolean;
    trends: boolean;
    predictions: boolean;
  };
}

const DEFAULT_OPTIONS: ExportOptions = {
  format: 'pdf',
  dateRange: 'last30days',
  includeCharts: true,
  includeRawData: false,
  includeClientDetails: true,
  sections: {
    overview: true,
    revenue: true,
    clients: true,
    trends: true,
    predictions: false
  }
};

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  loading = false
}: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_OPTIONS);
  const [showCustomDates, setShowCustomDates] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(options);
  };

  const updateOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateSection = (section: keyof ExportOptions['sections'], value: boolean) => {
    setOptions(prev => ({
      ...prev,
      sections: { ...prev.sections, [section]: value }
    }));
  };

  const handleDateRangeChange = (range: ExportOptions['dateRange']) => {
    updateOption('dateRange', range);
    setShowCustomDates(range === 'custom');
  };

  const getEstimatedSize = () => {
    let size = 'Small';
    const includesCount = Object.values(options.sections).filter(Boolean).length;
    
    if (options.format === 'pdf' && options.includeCharts && includesCount > 3) {
      size = 'Large (2-5 MB)';
    } else if (options.format === 'excel' || options.includeRawData) {
      size = 'Medium (500KB - 2MB)';
    } else {
      size = 'Small (<500KB)';
    }
    
    return size;
  };

  const formatLabels = {
    csv: 'CSV (Comma Separated)',
    pdf: 'PDF (Visual Report)',
    excel: 'Excel (Spreadsheet)'
  };

  const dateRangeLabels = {
    last7days: 'Last 7 days',
    last30days: 'Last 30 days',
    last90days: 'Last 90 days',
    lastYear: 'Last year',
    custom: 'Custom range'
  };

  if (!isOpen) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Export Analytics Report"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(formatLabels) as Array<keyof typeof formatLabels>).map((format) => (
              <label
                key={format}
                className={`
                  relative flex cursor-pointer rounded-lg border p-4 transition-colors
                  ${options.format === format
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <input
                  type="radio"
                  name="format"
                  value={format}
                  checked={options.format === format}
                  onChange={(e) => updateOption('format', e.target.value as ExportOptions['format'])}
                  className="sr-only"
                />
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {format.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatLabels[format]}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Date Range
          </label>
          <select
            value={options.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value as ExportOptions['dateRange'])}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {(Object.entries(dateRangeLabels) as Array<[keyof typeof dateRangeLabels, string]>).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {showCustomDates && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={options.customStartDate || ''}
                  onChange={(e) => updateOption('customStartDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={options.customEndDate || ''}
                  onChange={(e) => updateOption('customEndDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sections to Include */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Report Sections
          </label>
          <div className="space-y-2">
            {Object.entries(options.sections).map(([section, enabled]) => (
              <label key={section} className="flex items-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => updateSection(section as keyof ExportOptions['sections'], e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                  {section} {section === 'overview' && '(recommended)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Additional Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeCharts}
                onChange={(e) => updateOption('includeCharts', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                disabled={options.format === 'csv'}
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-white">
                Include charts and visualizations
                {options.format === 'csv' && (
                  <span className="text-gray-500 dark:text-gray-400 ml-1">(not available for CSV)</span>
                )}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeRawData}
                onChange={(e) => updateOption('includeRawData', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-white">
                Include raw data tables
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeClientDetails}
                onChange={(e) => updateOption('includeClientDetails', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-white">
                Include detailed client information
              </span>
            </label>
          </div>
        </div>

        {/* File Size Estimate */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Estimated file size:
              </span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {getEstimatedSize()}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {Object.values(options.sections).filter(Boolean).length} sections selected
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || Object.values(options.sections).every(v => !v)}
            loading={loading}
          >
            {loading ? 'Generating...' : 'Export Report'}
          </Button>
        </div>

        {Object.values(options.sections).every(v => !v) && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            Please select at least one section to export.
          </p>
        )}
      </form>
    </ConfirmDialog>
  );
}
