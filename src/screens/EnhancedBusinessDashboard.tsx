import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { cloudStorageService } from "../services/cloudStorage";
import { useSubscription } from "../hooks/useSubscription";
import type { CloudInvoice } from "../services/cloudStorage";
import { Button } from "../components/Button";
import { db } from "../config/firebase";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface DashboardMetrics {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  monthlyGrowth: number;
  paymentRate: number;
}

interface ActivityItem {
  id: string;
  type: "invoice_created" | "invoice_paid" | "payment_received" | "invoice_sent";
  title: string;
  description: string;
  amount?: number;
  timestamp: Date;
  status: "success" | "pending" | "warning";
  clientName: string;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: string;
  isPositive?: boolean;
  color: "green" | "blue" | "orange" | "purple" | "red";
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  isPositive, 
  color,
  loading = false 
}) => {
  const colorClasses = {
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    red: "bg-red-50 text-red-700 border-red-200"
  };

  const iconColorClasses = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600"
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`text-sm flex items-center ${
            isPositive === true ? "text-green-600" : 
            isPositive === false ? "text-red-600" : "text-gray-600"
          }`}>
            {isPositive === true && "↗ "}
            {isPositive === false && "↘ "}
            {trend}
          </p>
        )}
      </div>
    </div>
  );
};

const ActivitySkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="flex items-center space-x-4 p-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function EnhancedBusinessDashboard() {
  const { currentUser, userProfile } = useAuth();
  const { isProUser } = useSubscription();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<CloudInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Memoized date calculations
  const dateRanges = useMemo(() => {
    const now = new Date();
    const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 2);

    return { cutoffDate, lastMonth, previousMonth };
  }, [timeRange]);

  // Calculate metrics from invoice data
  const calculateMetrics = useMemo(() => (invoices: CloudInvoice[]): DashboardMetrics => {
    const { cutoffDate, lastMonth, previousMonth } = dateRanges;

    // Filter invoices by time range
    const filteredInvoices = invoices.filter(invoice => 
      new Date(invoice.invoiceDate) >= cutoffDate
    );

    // Calculate basic counts and amounts
    const paidInvoices = filteredInvoices.filter(inv => inv.status === "paid");
    const unpaidInvoices = filteredInvoices.filter(inv => inv.status !== "paid");
    const overdueInvoices = filteredInvoices.filter(inv => inv.status === "overdue");

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = filteredInvoices
      .filter(inv => inv.status === "sent")
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Calculate average invoice value
    const totalValue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const averageInvoiceValue = filteredInvoices.length > 0 ? totalValue / filteredInvoices.length : 0;

    // Calculate monthly growth
    const currentMonthRevenue = invoices
      .filter(inv => new Date(inv.invoiceDate) >= lastMonth && inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0);

    const previousMonthRevenue = invoices
      .filter(inv => 
        new Date(inv.invoiceDate) >= previousMonth && 
        new Date(inv.invoiceDate) < lastMonth && 
        inv.status === "paid"
      )
      .reduce((sum, inv) => sum + inv.total, 0);

    const monthlyGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    // Calculate payment rate
    const sentInvoices = filteredInvoices.filter(inv => 
      inv.status === "sent" || inv.status === "paid"
    ).length;
    const paymentRate = sentInvoices > 0 ? (paidInvoices.length / sentInvoices) * 100 : 0;

    return {
      totalRevenue,
      pendingAmount,
      overdueAmount,
      totalInvoices: filteredInvoices.length,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      averageInvoiceValue,
      monthlyGrowth,
      paymentRate
    };
  }, [dateRanges]);

  // Generate activity from invoice data
  const generateActivity = useMemo(() => (invoices: CloudInvoice[]): ActivityItem[] => {
    return invoices
      .slice(0, 8)
      .map(invoice => ({
        id: invoice.id!,
        type: invoice.status === "paid" ? "payment_received" : 
              invoice.status === "sent" ? "invoice_sent" : "invoice_created",
        title: `Invoice ${invoice.invoiceNumber}`,
        description: `${invoice.client.name} - $${invoice.total.toFixed(2)}`,
        amount: invoice.total,
        timestamp: invoice.updatedAt.toDate(),
        status: invoice.status === "paid" ? "success" : 
                invoice.status === "overdue" ? "warning" : "pending",
        clientName: invoice.client.name
      }));
  }, []);

  // Load initial dashboard data
  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser, timeRange]);

  // Real-time invoice updates
  useEffect(() => {
    if (!currentUser) return;

    const invoicesQuery = query(
      collection(db, "invoices"),
      where("userId", "==", currentUser.uid),
      orderBy("updatedAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(invoicesQuery, (snapshot) => {
      const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CloudInvoice[];

      // Calculate metrics from real-time data
      const newMetrics = calculateMetrics(invoices);
      setMetrics(newMetrics);

      // Generate activity from real-time data
      const activities = generateActivity(invoices);
      setRecentActivity(activities);

      // Set recent invoices (last 5)
      const recent = invoices.slice(0, 5);
      setRecentInvoices(recent);

      setLoading(false);
    }, (error) => {
      console.error("Error listening to invoices:", error);
      toast.error("Error loading dashboard data");
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, calculateMetrics, generateActivity]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get user invoices from Firestore
      const invoices = await cloudStorageService.getUserInvoices(currentUser!.uid, 100);

      // Calculate metrics
      const newMetrics = calculateMetrics(invoices);
      setMetrics(newMetrics);

      // Generate activity
      const activities = generateActivity(invoices);
      setRecentActivity(activities);

      // Set recent invoices
      const recent = invoices
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 5);
      setRecentInvoices(recent);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "payment_received": return "💰";
      case "invoice_sent": return "📧";
      case "invoice_created": return "📄";
      default: return "📋";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {userProfile?.displayName || "User"}
              {isProUser && <span className="ml-2 text-green-600 font-medium">✨ Pro</span>}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border">
              {(["7d", "30d", "90d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                </button>
              ))}
            </div>
            
            <Link to="/create">
              <Button variant="primary" className="whitespace-nowrap">
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={metrics ? formatCurrency(metrics.totalRevenue) : "$0"}
            icon="💰"
            trend={metrics ? `${metrics.paidInvoices} paid invoices` : undefined}
            color="green"
            loading={loading}
          />
          
          <MetricCard
            title="Pending Amount"
            value={metrics ? formatCurrency(metrics.pendingAmount) : "$0"}
            icon="⏰"
            trend={metrics ? `${metrics.unpaidInvoices} pending` : undefined}
            color="orange"
            loading={loading}
          />
          
          <MetricCard
            title="Average Invoice"
            value={metrics ? formatCurrency(metrics.averageInvoiceValue) : "$0"}
            icon="📊"
            trend={metrics ? `${metrics.totalInvoices} total invoices` : undefined}
            color="blue"
            loading={loading}
          />
          
          <MetricCard
            title="Payment Rate"
            value={metrics ? `${metrics.paymentRate.toFixed(0)}%` : "0%"}
            icon="✅"
            trend={metrics && metrics.monthlyGrowth !== 0 ? 
              `${metrics.monthlyGrowth > 0 ? "+" : ""}${metrics.monthlyGrowth.toFixed(1)}% growth` : 
              undefined}
            isPositive={metrics ? metrics.paymentRate > 75 : undefined}
            color={metrics && metrics.paymentRate > 75 ? "green" : "purple"}
            loading={loading}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-6">
                    <ActivitySkeleton />
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.status === "success" ? "bg-green-100" :
                          activity.status === "warning" ? "bg-orange-100" : "bg-blue-100"
                        }`}>
                          <span className="text-lg">{getActivityIcon(activity.type)}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">
                              {activity.title}
                            </h3>
                            {activity.amount && (
                              <span className="font-semibold text-gray-900 ml-4">
                                {formatCurrency(activity.amount)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No activity yet
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Create your first invoice to start tracking your business activity
                    </p>
                    <Link to="/create">
                      <Button variant="primary" size="sm">
                        Create Your First Invoice
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Invoices */}
          <div className="space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/create"
                  className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-lg">📄</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Create Invoice</p>
                    <p className="text-sm text-blue-700">Generate new invoice</p>
                  </div>
                </Link>

                <Link
                  to="/history"
                  className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 text-lg">📋</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View History</p>
                    <p className="text-sm text-gray-600">All invoices</p>
                  </div>
                </Link>

                {!isProUser && (
                  <Link
                    to="/more"
                    className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-blue-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-lg">⭐</span>
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">Upgrade to Pro</p>
                      <p className="text-sm text-purple-700">Unlimited features</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
                <Link to="/history" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between items-center p-3">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentInvoices.length > 0 ? (
                <div className="space-y-2">
                  {recentInvoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      to={`/edit/${invoice.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs text-gray-600">
                            {invoice.client.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(invoice.total)}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            invoice.status === "paid" ? "bg-green-100 text-green-800" :
                            invoice.status === "sent" ? "bg-blue-100 text-blue-800" :
                            invoice.status === "overdue" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">📄</span>
                  </div>
                  <p className="text-gray-600 text-sm">No invoices yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
