import { useState, useEffect } from 'react';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';
import { cloudStorageService } from '../services/cloudStorage';
import type { InvoiceData } from '../types/invoice';
import { formatCurrency } from '../utils/formatters';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import toast from 'react-hot-toast';

export interface RecurringInvoice {
  id: string;
  baseInvoice: InvoiceData;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  maxInvoices?: number;
  isActive: boolean;
  nextInvoiceDate: string;
  generatedInvoices: string[];
  createdAt: string;
  updatedAt: string;
}

interface RecurringInvoiceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  baseInvoice?: InvoiceData;
}

export default function RecurringInvoiceManager({
  isOpen,
  onClose,
  baseInvoice
}: RecurringInvoiceManagerProps) {
  const { currentUser } = useAuth();
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for creating new recurring invoice
  const [formData, setFormData] = useState({
    frequency: 'monthly' as RecurringInvoice['frequency'],
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    maxInvoices: '',
    autoSend: false
  });

  useEffect(() => {
    if (isOpen && currentUser) {
      loadRecurringInvoices();
    }
  }, [isOpen, currentUser]);

  const loadRecurringInvoices = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      // This would be implemented in cloudStorageService
      // const invoices = await cloudStorageService.getRecurringInvoices(currentUser.uid);
      // setRecurringInvoices(invoices);
      
      // Mock data for now
      setRecurringInvoices([
        {
          id: '1',
          baseInvoice: baseInvoice || {} as InvoiceData,
          frequency: 'monthly',
          startDate: '2025-01-01',
          isActive: true,
          nextInvoiceDate: '2025-02-01',
          generatedInvoices: ['inv-001', 'inv-002'],
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ]);
    } catch (error) {
      console.error('Error loading recurring invoices:', error);
      toast.error('Failed to load recurring invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextInvoiceDate = (startDate: string, frequency: RecurringInvoice['frequency']): string => {
    const start = new Date(startDate);
    const now = new Date();
    
    let nextDate = start;
    
    while (nextDate <= now) {
      switch (frequency) {
        case 'weekly':
          nextDate = addWeeks(nextDate, 1);
          break;
        case 'bi-weekly':
          nextDate = addWeeks(nextDate, 2);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'quarterly':
          nextDate = addMonths(nextDate, 3);
          break;
        case 'yearly':
          nextDate = addYears(nextDate, 1);
          break;
      }
    }
    
    return format(nextDate, 'yyyy-MM-dd');
  };

  const handleCreateRecurring = async () => {
    if (!currentUser || !baseInvoice) return;

    try {
      setIsLoading(true);
      
      const recurringInvoice: Omit<RecurringInvoice, 'id' | 'createdAt' | 'updatedAt'> = {
        baseInvoice,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        maxInvoices: formData.maxInvoices ? parseInt(formData.maxInvoices) : undefined,
        isActive: true,
        nextInvoiceDate: calculateNextInvoiceDate(formData.startDate, formData.frequency),
        generatedInvoices: []
      };

      // This would be implemented in cloudStorageService
      // await cloudStorageService.createRecurringInvoice(currentUser.uid, recurringInvoice);
      
      toast.success('Recurring invoice created successfully!');
      setShowCreateForm(false);
      loadRecurringInvoices();
    } catch (error) {
      console.error('Error creating recurring invoice:', error);
      toast.error('Failed to create recurring invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (recurringId: string, isActive: boolean) => {
    try {
      // Update in database
      // await cloudStorageService.updateRecurringInvoice(recurringId, { isActive });
      
      // Update local state
      setRecurringInvoices(prev => 
        prev.map(invoice => 
          invoice.id === recurringId ? { ...invoice, isActive } : invoice
        )
      );
      
      toast.success(`Recurring invoice ${isActive ? 'activated' : 'paused'}`);
    } catch (error) {
      console.error('Error updating recurring invoice:', error);
      toast.error('Failed to update recurring invoice');
    }
  };

  const getFrequencyLabel = (frequency: RecurringInvoice['frequency']) => {
    const labels = {
      weekly: 'Weekly',
      'bi-weekly': 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return labels[frequency];
  };

  const getFrequencyIcon = (frequency: RecurringInvoice['frequency']) => {
    const icons = {
      weekly: '📅',
      'bi-weekly': '📆',
      monthly: '🗓️',
      quarterly: '📋',
      yearly: '🎯'
    };
    return icons[frequency];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Recurring Invoices
              </h2>
              <p className="text-sm text-gray-600">
                Automate your billing with recurring invoices
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Create New Button */}
          {baseInvoice && !showCreateForm && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">
                    Create Recurring Invoice
                  </h3>
                  <p className="text-sm text-blue-700">
                    Turn this invoice into a recurring billing schedule
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateForm(true)}
                  disabled={isLoading}
                >
                  Set Up Recurring
                </Button>
              </div>
            </div>
          )}

          {/* Create Form */}
          {showCreateForm && baseInvoice && (
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Set Up Recurring Invoice
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Invoices (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.maxInvoices}
                    onChange={(e) => setFormData({ ...formData, maxInvoices: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoSend"
                    checked={formData.autoSend}
                    onChange={(e) => setFormData({ ...formData, autoSend: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoSend" className="text-sm text-gray-700">
                    Automatically send invoices to client
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreateRecurring}
                    disabled={isLoading}
                  >
                    Create Recurring Invoice
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Recurring Invoices List */}
          <div className="space-y-4">
            {recurringInvoices.map((recurring) => (
              <div
                key={recurring.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">
                        {getFrequencyIcon(recurring.frequency)}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getFrequencyLabel(recurring.frequency)} Invoice
                        </h3>
                        <p className="text-sm text-gray-600">
                          To: {recurring.baseInvoice.client?.name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium">
                          {formatCurrency(recurring.baseInvoice.total)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Invoice:</span>
                        <div className="font-medium">
                          {format(new Date(recurring.nextInvoiceDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Generated:</span>
                        <div className="font-medium">
                          {recurring.generatedInvoices.length} invoices
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <div className={`font-medium ${recurring.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                          {recurring.isActive ? 'Active' : 'Paused'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(recurring.id, !recurring.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        recurring.isActive
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {recurring.isActive ? 'Pause' : 'Resume'}
                    </button>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {recurringInvoices.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🔄</div>
                <p className="text-lg font-medium">No recurring invoices yet</p>
                <p className="text-sm">Create your first recurring invoice to automate billing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
