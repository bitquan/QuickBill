import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import InvoiceAnalytics from "../components/InvoiceAnalytics";
import UpgradeModal from "../components/UpgradeModal";
import storageService from "../services/storage";
import type { InvoiceData } from "../types/invoice";

interface DashboardStats {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
  averageInvoiceValue: number;
  agreementsSigned: number;
  agreementsPending: number;
}

interface RecentActivity {
  id: string;
  type:
    | "invoice_created"
    | "invoice_paid"
    | "agreement_signed"
    | "payment_received";
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status?: "success" | "pending" | "warning";
}

export default function BusinessDashboard() {
  const [allInvoices, setAllInvoices] = useState<InvoiceData[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    averageInvoiceValue: 0,
    agreementsSigned: 0,
    agreementsPending: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const userData = storageService.getUserData();

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = () => {
    // Load invoices
    const allInvoices = storageService.getAllInvoices();
    setAllInvoices(allInvoices);

    // Calculate stats
    const now = new Date();
    const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const filteredInvoices = allInvoices.filter(
      (invoice) => new Date(invoice.invoiceDate) >= cutoffDate
    );

    const paidInvoices = filteredInvoices.filter(
      (inv) => inv.status === "paid"
    );
    const unpaidInvoices = filteredInvoices.filter(
      (inv) => inv.status !== "paid" && inv.status !== undefined
    );

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingRevenue = unpaidInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );

    setStats({
      totalInvoices: filteredInvoices.length,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      totalRevenue,
      pendingRevenue,
      averageInvoiceValue:
        filteredInvoices.length > 0
          ? (totalRevenue + pendingRevenue) / filteredInvoices.length
          : 0,
      agreementsSigned: Math.floor(filteredInvoices.length * 0.6), // Mock data
      agreementsPending: Math.floor(filteredInvoices.length * 0.2), // Mock data
    });

    // Generate recent activity
    const activities: RecentActivity[] = filteredInvoices
      .slice(0, 10)
      .map((invoice, index) => ({
        id: invoice.id || `activity-${index}`,
        type: invoice.status === "paid" ? "invoice_paid" : "invoice_created",
        title: `Invoice ${invoice.invoiceNumber}`,
        description: `${invoice.client.name} - $${invoice.total.toFixed(2)}`,
        amount: invoice.total,
        timestamp: invoice.invoiceDate,
        status: invoice.status === "paid" ? "success" : "pending",
      }));

    setRecentActivity(activities);
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "invoice_created":
        return "📄";
      case "invoice_paid":
        return "💰";
      case "agreement_signed":
        return "✍️";
      case "payment_received":
        return "🏦";
      default:
        return "📋";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                {userData.isPro ? "Pro Account" : "Free Account"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!userData.isPro && (
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs px-3 py-1"
                >
                  ✨ Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Time Range Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              {range === "7d"
                ? "7 Days"
                : range === "30d"
                ? "30 Days"
                : "90 Days"}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.paidInvoices} paid invoices
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.pendingRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.unpaidInvoices} unpaid invoices
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Invoices</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalInvoices}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Avg: {formatCurrency(stats.averageInvoiceValue)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Agreements</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.agreementsSigned}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✍️</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.agreementsPending} pending
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/create"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📄</span>
              </div>
              <div>
                <p className="font-medium text-blue-900">New Invoice</p>
                <p className="text-xs text-blue-700">Create invoice</p>
              </div>
            </Link>

            <Link
              to="/history"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📋</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">View History</p>
                <p className="text-xs text-gray-700">All invoices</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Analytics */}
        {allInvoices.length > 0 && (
          <InvoiceAnalytics invoices={allInvoices} timeRange={timeRange} />
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {activity.amount && (
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(activity.amount)}
                            </span>
                          )}
                          <span
                            className={`w-2 h-2 rounded-full ${
                              activity.status === "success"
                                ? "bg-green-500"
                                : activity.status === "pending"
                                ? "bg-orange-500"
                                : "bg-gray-400"
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-600 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No activity yet
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Create your first invoice to start tracking your business
                  activity
                </p>
                <Link to="/create">
                  <Button variant="primary" size="sm">
                    Create Invoice
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods & Settings (Pro Only) */}
        {userData.isPro && (
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pro Features
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-lg">💳</span>
                  <div>
                    <p className="font-medium text-green-900">Payment Links</p>
                    <p className="text-xs text-green-700">
                      Stripe integration active
                    </p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <span className="text-purple-600 text-lg">📝</span>
                  <div>
                    <p className="font-medium text-purple-900">
                      Digital Agreements
                    </p>
                    <p className="text-xs text-purple-700">E-signature ready</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 text-lg">📧</span>
                  <div>
                    <p className="font-medium text-blue-900">
                      Email Integration
                    </p>
                    <p className="text-xs text-blue-700">EmailJS configured</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free Users */}
        {!userData.isPro && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">Unlock Pro Features</h3>
              <p className="text-blue-100 text-sm mb-4">
                Get payment links, digital agreements, email integration, and
                more!
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="flex items-center gap-1">
                  <span>✨</span>
                  <span>Unlimited invoices</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>💳</span>
                  <span>Payment links</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📝</span>
                  <span>Digital agreements</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🎨</span>
                  <span>Logo upload</span>
                </div>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => setShowUpgradeModal(true)}
              >
                Upgrade to Pro - $9.99/month
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => setShowUpgradeModal(false)}
        invoicesUsed={stats.totalInvoices}
        maxInvoices={3}
      />
    </div>
  );
}
