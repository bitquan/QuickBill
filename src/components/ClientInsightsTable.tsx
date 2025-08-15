import { useState, useMemo } from 'react';
import type { ClientAnalytics } from '../contexts/AnalyticsContext';

interface ClientInsightsTableProps {
  data: ClientAnalytics[];
  showTrends?: boolean;
  maxRows?: number;
}

type SortKey = keyof ClientAnalytics | 'trend';
type SortDirection = 'asc' | 'desc';

export function ClientInsightsTable({
  data,
  showTrends = true,
  maxRows = 10
}: ClientInsightsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = maxRows;

  // Add trend calculation
  const dataWithTrends = useMemo(() => {
    return data.map(client => ({
      ...client,
      trend: Math.random() * 40 - 20 // Mock trend data (-20% to +20%)
    }));
  }, [data]);

  const sortedData = useMemo(() => {
    if (!dataWithTrends || dataWithTrends.length === 0) return [];

    return [...dataWithTrends].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      if (sortKey === 'trend') {
        aValue = a.trend;
        bValue = b.trend;
      } else {
        aValue = a[sortKey as keyof ClientAnalytics];
        bValue = b[sortKey as keyof ClientAnalytics];
      }
      
      let comparison = 0;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [dataWithTrends, sortKey, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <span className="text-gray-400">⇅</span>;
    }
    return (
      <span className="text-blue-600 dark:text-blue-400">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600 dark:text-green-400';
    if (trend < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '📈';
    if (trend < 0) return '📉';
    return '➖';
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-gray-500 dark:text-gray-400">No client data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th 
                className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Client</span>
                  <SortIcon column="clientName" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                onClick={() => handleSort('totalRevenue')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Revenue</span>
                  <SortIcon column="totalRevenue" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                onClick={() => handleSort('invoiceCount')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Invoices</span>
                  <SortIcon column="invoiceCount" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                onClick={() => handleSort('averageInvoiceValue')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Avg Value</span>
                  <SortIcon column="averageInvoiceValue" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                onClick={() => handleSort('lastInvoiceDate')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Last Invoice</span>
                  <SortIcon column="lastInvoiceDate" />
                </div>
              </th>
              {showTrends && (
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  onClick={() => handleSort('trend')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Trend</span>
                    <SortIcon column="trend" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((client, index) => (
              <tr 
                key={client.clientName}
                className={`
                  border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                  ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                `}
              >
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {client.clientName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Customer since {new Date(client.lastInvoiceDate).getFullYear()}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(client.totalRevenue)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="text-gray-900 dark:text-white">
                    {client.invoiceCount}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="text-gray-900 dark:text-white">
                    {formatCurrency(client.averageInvoiceValue)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {new Date(client.lastInvoiceDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {Math.floor((Date.now() - new Date(client.lastInvoiceDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </div>
                </td>
                {showTrends && (
                  <td className="py-4 px-4 text-right">
                    <div className={`flex items-center justify-end space-x-1 ${getTrendColor(client.trend)}`}>
                      <span>{getTrendIcon(client.trend)}</span>
                      <span className="font-medium">
                        {formatPercentage(client.trend)}
                      </span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} clients
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      px-3 py-1 text-sm rounded transition-colors
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Clients</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data.reduce((sum, client) => sum + client.totalRevenue, 0))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data.reduce((sum, client) => sum + client.totalRevenue, 0) / data.length)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg per Client</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.reduce((sum, client) => sum + client.invoiceCount, 0)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</div>
        </div>
      </div>
    </div>
  );
}
