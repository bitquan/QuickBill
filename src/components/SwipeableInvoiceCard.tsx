import { useState } from 'react';
import { useSwipeGesture, useHapticFeedback } from '../hooks/useSwipeGesture';
import { Button } from './Button';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';
import type { InvoiceData } from '../types/invoice';

interface SwipeableInvoiceCardProps {
  invoice: InvoiceData & { 
    number: string;
    customerName: string; 
    date: string;
  };
  onEdit: (invoice: any) => void;
  onDelete: (invoice: any) => void;
  onDuplicate: (invoice: any) => void;
  onSendEmail: (invoice: any) => void;
  onDownloadPDF: (invoice: any) => void;
}

export default function SwipeableInvoiceCard({
  invoice,
  onEdit,
  onDelete,
  onDuplicate,
  onSendEmail,
  onDownloadPDF
}: SwipeableInvoiceCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [actionType, setActionType] = useState<'primary' | 'danger' | null>(null);
  const { triggerHaptic, triggerSuccess } = useHapticFeedback();

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      triggerHaptic('light');
      setActionType('danger');
      setShowActions(true);
    },
    onSwipeRight: () => {
      triggerHaptic('light');
      setActionType('primary');
      setShowActions(true);
    }
  }, {
    threshold: 80,
    velocity: 0.3
  });

  const handleEdit = () => {
    triggerSuccess();
    onEdit(invoice);
    setShowActions(false);
  };

  const handleDelete = () => {
    triggerHaptic('heavy');
    onDelete(invoice);
    setShowActions(false);
  };

  const handleDuplicate = () => {
    triggerSuccess();
    onDuplicate(invoice);
    setShowActions(false);
  };

  const handleSendEmail = () => {
    triggerSuccess();
    onSendEmail(invoice);
    setShowActions(false);
  };

  const handleDownloadPDF = () => {
    triggerHaptic('light');
    onDownloadPDF(invoice);
    setShowActions(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800';
      case 'draft':
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✅';
      case 'pending':
        return '⏳';
      case 'overdue':
        return '⚠️';
      case 'draft':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe Action Background */}
      {showActions && (
        <div className={`absolute inset-0 flex items-center justify-between px-4 z-0 transition-all duration-300 ${
          actionType === 'primary' 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
            : 'bg-gradient-to-r from-rose-500 to-red-600'
        }`}>
          {actionType === 'primary' ? (
            <>
              <div className="flex items-center gap-2 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                <span className="font-medium">Edit</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="font-medium">Duplicate</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                <span className="font-medium">Delete</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="font-medium">Archive</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                </svg>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Card Content */}
      <div 
        className={`relative z-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 p-4 transition-all duration-300 ${
          showActions ? 'transform translate-x-0' : ''
        } ${swipeHandlers.isSwiping ? 'shadow-lg' : 'shadow-sm hover:shadow-md dark:shadow-slate-900/20'}`}
        {...swipeHandlers}
        onClick={() => setShowActions(false)}
      >
        {/* Invoice Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Invoice #{invoice.number || invoice.invoiceNumber}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status || 'draft')}`}>
                <span>{getStatusIcon(invoice.status || 'draft')}</span>
                {(invoice.status || 'draft').charAt(0).toUpperCase() + (invoice.status || 'draft').slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{invoice.customerName || invoice.client.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(invoice.date || invoice.invoiceDate), 'MMM dd, yyyy')}</p>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(invoice.total)}
            </p>
            {(invoice.status || 'draft') === 'overdue' && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Due {format(new Date(invoice.dueDate), 'MMM dd')}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="text-xs px-2 py-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Edit
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={handleSendEmail}
              className="text-xs px-2 py-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              📧 Send
            </Button>
            <Button
              variant="outline"
              size="sm" 
              onClick={handleDownloadPDF}
              className="text-xs px-2 py-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              📄 PDF
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleDuplicate}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Duplicate invoice"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Delete invoice"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Swipe Hint */}
        {!showActions && (
          <div className="absolute top-2 right-2 text-xs text-slate-400 dark:text-slate-500 opacity-70">
            ← Swipe →
          </div>
        )}
      </div>
    </div>
  );
}
