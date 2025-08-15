# 🔄 Component Implementation Examples

## Overview

Concrete examples showing how to replace mock data with real Firebase data in each redesigned component.

## 📊 Enhanced Business Dashboard

### Before: Mock Data Version
```typescript
// ❌ OLD: Using mock data
const [stats, setStats] = useState({
  totalRevenue: 25000,
  paidInvoices: 45,
  unpaidInvoices: 8,
  // ... mock values
});

const mockRecentActivity = [
  { id: 1, type: "invoice_paid", amount: 1500, client: "Mock Client" },
  // ... more mock data
];
```

### After: Real Firebase Data
```typescript
// ✅ NEW: Using real Firebase data
import { cloudStorageService } from "../services/cloudStorage";
import { useAuth } from "../contexts/AuthContext";

export default function EnhancedBusinessDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [invoices, setInvoices] = useState<CloudInvoice[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadRealDashboardData();
    }
  }, [currentUser]);

  const loadRealDashboardData = async () => {
    try {
      // Get real invoices from Firestore
      const userInvoices = await cloudStorageService.getUserInvoices(
        currentUser!.uid, 
        100
      );
      setInvoices(userInvoices);

      // Calculate real statistics
      const totalRevenue = userInvoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total, 0);

      const paidInvoices = userInvoices.filter(inv => inv.status === "paid").length;
      const unpaidInvoices = userInvoices.filter(inv => inv.status !== "paid").length;
      
      const pendingRevenue = userInvoices
        .filter(inv => inv.status === "sent")
        .reduce((sum, inv) => sum + inv.total, 0);

      const overdueRevenue = userInvoices
        .filter(inv => inv.status === "overdue")
        .reduce((sum, inv) => sum + inv.total, 0);

      const averageInvoiceValue = userInvoices.length > 0 
        ? (totalRevenue + pendingRevenue + overdueRevenue) / userInvoices.length 
        : 0;

      setStats({
        totalRevenue,
        paidInvoices,
        unpaidInvoices,
        pendingRevenue,
        overdueRevenue,
        averageInvoiceValue,
        totalInvoices: userInvoices.length
      });

      // Generate real activity from invoice data
      const activities = userInvoices
        .slice(0, 10)
        .map(invoice => ({
          id: invoice.id!,
          type: invoice.status === "paid" ? "payment_received" : "invoice_created",
          title: `Invoice ${invoice.invoiceNumber}`,
          description: `${invoice.client.name} - $${invoice.total.toFixed(2)}`,
          amount: invoice.total,
          timestamp: invoice.updatedAt.toDate().toISOString(),
          status: invoice.status === "paid" ? "success" : "pending"
        }));

      setRecentActivity(activities);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  // Real-time updates when invoices change
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = onSnapshot(
        query(
          collection(db, "invoices"), 
          where("userId", "==", currentUser.uid),
          orderBy("updatedAt", "desc"),
          limit(50)
        ),
        (snapshot) => {
          const updatedInvoices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CloudInvoice[];
          
          setInvoices(updatedInvoices);
          // Recalculate stats with new data
          calculateStats(updatedInvoices);
        }
      );

      return unsubscribe;
    }
  }, [currentUser]);

  if (!stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Real metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="💰"
          trend={`${stats.paidInvoices} paid invoices`}
          color="green"
        />
        <MetricCard
          title="Pending"
          value={`$${stats.pendingRevenue.toLocaleString()}`}
          icon="⏰"
          trend={`${stats.unpaidInvoices} unpaid`}
          color="orange"
        />
        {/* ... more real metric cards */}
      </div>

      {/* Real recent activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map(activity => (
            <div key={activity.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${activity.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## ⚙️ Enhanced Settings Page

### Before: Mock User Data
```typescript
// ❌ OLD: Mock user settings
const [userSettings, setUserSettings] = useState({
  name: "John Doe",
  email: "john@example.com",
  plan: "Free Plan",
  invoicesUsed: 2,
  maxInvoices: 3
});
```

### After: Real Firebase User Data
```typescript
// ✅ NEW: Real user data from Firebase
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import { cloudStorageService } from "../services/cloudStorage";

export default function EnhancedSettings() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { subscription, isProUser } = useSubscription();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && userProfile) {
      loadUserSettings();
    }
  }, [currentUser, userProfile]);

  const loadUserSettings = async () => {
    try {
      // Load real business info from Firestore
      const businessData = await cloudStorageService.getBusinessInfo(currentUser!.uid);
      setBusinessInfo(businessData);
      
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<BusinessInfo>) => {
    try {
      if (businessInfo) {
        await cloudStorageService.saveBusinessInfo(currentUser!.uid, {
          ...businessInfo,
          ...updates
        });
        
        setBusinessInfo({ ...businessInfo, ...updates });
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Real profile section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              value={userProfile?.displayName || ""}
              onChange={(e) => handleUpdateProfile({ displayName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={userProfile?.email || ""}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input
              type="text"
              value={businessInfo?.name || ""}
              onChange={(e) => handleUpdateProfile({ name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={businessInfo?.phone || ""}
              onChange={(e) => handleUpdateProfile({ phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Real subscription section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">
              {userProfile?.subscription.planId === "pro" ? "QuickBill Pro" : "Free Plan"}
            </h3>
            <p className="text-sm text-gray-600">
              Status: {userProfile?.subscription.status}
            </p>
            <p className="text-sm text-gray-600">
              Invoices this month: {userProfile?.subscription.invoicesThisMonth || 0}
              {userProfile?.subscription.planId === "free" && " / 3"}
            </p>
            {userProfile?.subscription.nextBillingDate && (
              <p className="text-sm text-gray-600">
                Next billing: {userProfile.subscription.nextBillingDate.toDate().toLocaleDateString()}
              </p>
            )}
          </div>
          
          {isProUser ? (
            <div className="space-y-2">
              <button
                onClick={() => window.open("#", "_blank")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Manage Subscription
              </button>
              <div className="flex items-center text-green-600">
                <span className="text-sm">✓ Pro Active</span>
              </div>
            </div>
          ) : (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## 📱 Mobile Dashboard

### Before: Mock Mobile Data
```typescript
// ❌ OLD: Mock mobile stats
const quickStats = {
  revenue: "$12,500",
  pending: "$3,200", 
  invoices: "24",
  clients: "12"
};
```

### After: Real Mobile Data
```typescript
// ✅ NEW: Real mobile data
export default function MobileDashboard() {
  const { currentUser } = useAuth();
  const [quickStats, setQuickStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState<CloudInvoice[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadMobileData();
    }
  }, [currentUser]);

  const loadMobileData = async () => {
    try {
      // Get real data optimized for mobile
      const invoices = await cloudStorageService.getUserInvoices(currentUser!.uid, 20);
      
      // Calculate mobile-specific metrics
      const revenue = invoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total, 0);

      const pending = invoices
        .filter(inv => inv.status === "sent")
        .reduce((sum, inv) => sum + inv.total, 0);

      const uniqueClients = new Set(invoices.map(inv => inv.client.email)).size;

      setQuickStats({
        revenue: `$${revenue.toLocaleString()}`,
        pending: `$${pending.toLocaleString()}`,
        invoices: invoices.length.toString(),
        clients: uniqueClients.toString()
      });

      // Get recent invoices for mobile list
      const recent = invoices
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 5);
      
      setRecentInvoices(recent);

    } catch (error) {
      console.error("Error loading mobile data:", error);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Real quick stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-600">
            {quickStats?.revenue || "Loading..."}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-orange-600">
            {quickStats?.pending || "Loading..."}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">
            {quickStats?.invoices || "Loading..."}
          </div>
          <div className="text-sm text-gray-600">Invoices</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-purple-600">
            {quickStats?.clients || "Loading..."}
          </div>
          <div className="text-sm text-gray-600">Clients</div>
        </div>
      </div>

      {/* Real recent invoices for mobile */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Invoices</h3>
        </div>
        <div className="divide-y">
          {recentInvoices.map(invoice => (
            <div key={invoice.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{invoice.invoiceNumber}</div>
                <div className="text-sm text-gray-600">{invoice.client.name}</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(invoice.createdAt.toDate(), { addSuffix: true })}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${invoice.total.toFixed(2)}</div>
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 📊 Analytics Components

### Before: Mock Analytics
```typescript
// ❌ OLD: Mock analytics data
const analyticsData = {
  revenue: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
  invoices: [12, 19, 30, 50, 20, 30, 45],
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
};
```

### After: Real Analytics from Invoice Data
```typescript
// ✅ NEW: Real analytics calculated from invoices
export default function RealAnalytics() {
  const { currentUser } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (currentUser) {
      calculateRealAnalytics();
    }
  }, [currentUser]);

  const calculateRealAnalytics = async () => {
    try {
      // Get all user invoices
      const invoices = await cloudStorageService.getUserInvoices(currentUser!.uid, 500);
      
      // Group by month for last 12 months
      const monthlyData = new Map();
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = monthDate.toISOString().slice(0, 7); // YYYY-MM
        monthlyData.set(monthKey, {
          revenue: 0,
          invoiceCount: 0,
          paidInvoices: 0,
          label: monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        });
      }

      // Calculate real metrics from invoices
      invoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        const monthKey = invoiceDate.toISOString().slice(0, 7);
        
        if (monthlyData.has(monthKey)) {
          const monthData = monthlyData.get(monthKey);
          monthData.invoiceCount++;
          
          if (invoice.status === "paid") {
            monthData.revenue += invoice.total;
            monthData.paidInvoices++;
          }
        }
      });

      // Convert to chart format
      const chartData = Array.from(monthlyData.values());
      
      setAnalyticsData({
        revenue: chartData.map(d => d.revenue),
        invoices: chartData.map(d => d.invoiceCount),
        paidInvoices: chartData.map(d => d.paidInvoices),
        labels: chartData.map(d => d.label),
        
        // Additional real metrics
        totalRevenue: chartData.reduce((sum, d) => sum + d.revenue, 0),
        totalInvoices: chartData.reduce((sum, d) => sum + d.invoiceCount, 0),
        averageInvoiceValue: chartData.reduce((sum, d) => sum + d.revenue, 0) / 
                            Math.max(chartData.reduce((sum, d) => sum + d.paidInvoices, 0), 1),
        
        // Growth calculations
        currentMonthRevenue: chartData[chartData.length - 1]?.revenue || 0,
        previousMonthRevenue: chartData[chartData.length - 2]?.revenue || 0,
        
        // Payment rate
        paymentRate: chartData.reduce((sum, d) => sum + d.paidInvoices, 0) / 
                    Math.max(chartData.reduce((sum, d) => sum + d.invoiceCount, 0), 1) * 100
      });

    } catch (error) {
      console.error("Error calculating analytics:", error);
    }
  };

  if (!analyticsData) {
    return <AnalyticsSkeleton />;
  }

  const monthlyGrowth = analyticsData.previousMonthRevenue > 0 
    ? ((analyticsData.currentMonthRevenue - analyticsData.previousMonthRevenue) / 
       analyticsData.previousMonthRevenue) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Real KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          trend={`${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`}
          isPositive={monthlyGrowth >= 0}
        />
        <MetricCard
          title="Total Invoices"
          value={analyticsData.totalInvoices.toString()}
          trend={`${analyticsData.paymentRate.toFixed(1)}% paid`}
        />
        <MetricCard
          title="Avg Invoice"
          value={`$${analyticsData.averageInvoiceValue.toFixed(0)}`}
        />
        <MetricCard
          title="Payment Rate"
          value={`${analyticsData.paymentRate.toFixed(1)}%`}
          isPositive={analyticsData.paymentRate > 75}
        />
      </div>

      {/* Real revenue chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.labels.map((label, index) => ({
            month: label,
            revenue: analyticsData.revenue[index],
            invoices: analyticsData.invoices[index]
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value, name) => 
              name === 'revenue' ? `$${value.toLocaleString()}` : value
            } />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

## 🎯 Integration Summary

### Key Changes Made:

1. **Data Sources**: 
   - ❌ Mock/hardcoded data → ✅ Firebase Firestore queries
   - ❌ Static values → ✅ Real-time calculations

2. **Authentication Integration**:
   - ✅ Use `useAuth()` hook for current user
   - ✅ Check `userProfile` for subscription status
   - ✅ Load user-specific data with `currentUser.uid`

3. **Real-time Updates**:
   - ✅ Firestore listeners with `onSnapshot`
   - ✅ Automatic recalculation when data changes
   - ✅ Loading states for better UX

4. **Performance Optimization**:
   - ✅ Pagination with `limit()` queries
   - ✅ Efficient data fetching
   - ✅ Cached calculations

5. **Error Handling**:
   - ✅ Try-catch blocks for all async operations
   - ✅ Fallback UI states
   - ✅ User-friendly error messages

This implementation ensures all UX redesign components use **real Firebase data** instead of mock data, providing a production-ready application with live metrics and real-time updates.
