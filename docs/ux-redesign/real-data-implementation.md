# 🔄 Real Data Implementation Guide

## Overview

This document outlines how to implement the UX redesign components using **real Firebase/Firestore data** instead of mock data from the documentation examples.

## 🏗️ Data Architecture

### Firebase Collections Structure
```typescript
// users/{userId}
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  subscription: {
    planId: "free" | "pro";
    status: "active" | "inactive" | "cancelled" | "past_due";
    invoicesThisMonth: number;
    nextBillingDate?: Timestamp;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}

// invoices/{invoiceId}
interface CloudInvoice {
  id?: string;
  userId: string;
  invoiceNumber: string;
  client: ClientInfo;
  business: BusinessInfo;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  invoiceDate: string;
  dueDate: string;
  notes?: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// businessInfo/{userId}
interface BusinessInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  website?: string;
  taxId?: string;
}
```

## 📊 Dashboard Implementation with Real Data

### Enhanced Business Dashboard Component

```typescript
// src/screens/EnhancedBusinessDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { cloudStorageService } from "../services/cloudStorage";
import { adminService } from "../services/adminService";
import type { CloudInvoice, UserProfile } from "../services/cloudStorage";

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

export default function EnhancedBusinessDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<CloudInvoice[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser, timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get user's invoices from Firestore
      const allInvoices = await cloudStorageService.getUserInvoices(
        currentUser!.uid,
        100
      );

      // Filter by time range
      const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const filteredInvoices = allInvoices.filter(invoice => 
        new Date(invoice.invoiceDate) >= cutoffDate
      );

      // Calculate real metrics
      const totalRevenue = filteredInvoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total, 0);

      const pendingAmount = filteredInvoices
        .filter(inv => inv.status === "sent")
        .reduce((sum, inv) => sum + inv.total, 0);

      const overdueAmount = filteredInvoices
        .filter(inv => inv.status === "overdue")
        .reduce((sum, inv) => sum + inv.total, 0);

      const paidInvoices = filteredInvoices.filter(inv => inv.status === "paid").length;
      const unpaidInvoices = filteredInvoices.filter(inv => inv.status !== "paid").length;
      const overdueInvoices = filteredInvoices.filter(inv => inv.status === "overdue").length;

      const averageInvoiceValue = filteredInvoices.length > 0 
        ? (totalRevenue + pendingAmount + overdueAmount) / filteredInvoices.length 
        : 0;

      // Calculate month-over-month growth
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const currentMonthRevenue = filteredInvoices
        .filter(inv => new Date(inv.invoiceDate) >= lastMonth && inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total, 0);

      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 2);
      
      const previousMonthRevenue = allInvoices
        .filter(inv => 
          new Date(inv.invoiceDate) >= previousMonth && 
          new Date(inv.invoiceDate) < lastMonth && 
          inv.status === "paid"
        )
        .reduce((sum, inv) => sum + inv.total, 0);

      const monthlyGrowth = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;

      // Payment rate calculation
      const sentInvoices = filteredInvoices.filter(inv => 
        inv.status === "sent" || inv.status === "paid"
      ).length;
      const paymentRate = sentInvoices > 0 ? (paidInvoices / sentInvoices) * 100 : 0;

      setMetrics({
        totalRevenue,
        pendingAmount,
        overdueAmount,
        totalInvoices: filteredInvoices.length,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
        averageInvoiceValue,
        monthlyGrowth,
        paymentRate
      });

      // Get recent invoices (last 5)
      const recentInvoicesData = allInvoices
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 5);

      setRecentInvoices(recentInvoicesData);

      // Generate activity from real invoice data
      const activities = allInvoices
        .slice(0, 8)
        .map(invoice => ({
          id: invoice.id,
          type: invoice.status === "paid" ? "payment_received" : "invoice_created",
          title: `Invoice ${invoice.invoiceNumber}`,
          description: `${invoice.client.name} - $${invoice.total.toFixed(2)}`,
          amount: invoice.total,
          timestamp: invoice.createdAt.toDate(),
          status: invoice.status === "paid" ? "success" : "pending"
        }));

      setRecentActivity(activities);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Component renders real data...
}
```

### Settings Page with Real User Data

```typescript
// src/pages/EnhancedSettings.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { cloudStorageService } from "../services/cloudStorage";
import { useSubscription } from "../hooks/useSubscription";

export default function EnhancedSettings() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { subscription, isProUser, manageSubscription } = useSubscription();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    timezone: "",
    language: "en"
  });

  useEffect(() => {
    if (currentUser && userProfile) {
      loadUserData();
    }
  }, [currentUser, userProfile]);

  const loadUserData = async () => {
    try {
      // Load real business info from Firestore
      const businessData = await cloudStorageService.getBusinessInfo(currentUser!.uid);
      setBusinessInfo(businessData);

      // Set profile data from real user profile
      setProfileData({
        displayName: userProfile!.displayName,
        email: userProfile!.email,
        phone: businessData?.phone || "",
        timezone: "America/New_York", // Could be stored in user profile
        language: "en" // Could be stored in user profile
      });

    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update business info in Firestore
      if (businessInfo) {
        await cloudStorageService.saveBusinessInfo(currentUser!.uid, {
          ...businessInfo,
          phone: profileData.phone
        });
      }

      // Refresh user profile
      await refreshUserProfile();
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const getSubscriptionInfo = () => {
    if (!userProfile) return null;

    return {
      planName: userProfile.subscription.planId === "pro" ? "QuickBill Pro" : "Free Plan",
      status: userProfile.subscription.status,
      billingPeriod: userProfile.subscription.planId === "pro" ? "monthly" : "forever",
      nextBillingDate: userProfile.subscription.nextBillingDate?.toDate(),
      invoicesUsed: userProfile.subscription.invoicesThisMonth,
      invoicesLimit: userProfile.subscription.planId === "pro" ? -1 : 3
    };
  };

  // Component renders real subscription and profile data...
}
```

## 📱 Mobile Implementation with Real Data

### Mobile Dashboard with Live Metrics

```typescript
// src/components/mobile/MobileDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { cloudStorageService } from "../../services/cloudStorage";

export default function MobileDashboard() {
  const { currentUser } = useAuth();
  const [quickStats, setQuickStats] = useState({
    totalRevenue: 0,
    unpaidAmount: 0,
    totalInvoices: 0,
    recentPayment: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<CloudInvoice[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadMobileData();
    }
  }, [currentUser]);

  const loadMobileData = async () => {
    try {
      // Get recent invoices from Firestore
      const invoices = await cloudStorageService.getUserInvoices(currentUser!.uid, 20);
      
      // Calculate real quick stats
      const totalRevenue = invoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total, 0);

      const unpaidAmount = invoices
        .filter(inv => inv.status !== "paid")
        .reduce((sum, inv) => sum + inv.total, 0);

      const recentPayment = invoices
        .filter(inv => inv.status === "paid")
        .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())[0]?.total || 0;

      setQuickStats({
        totalRevenue,
        unpaidAmount,
        totalInvoices: invoices.length,
        recentPayment
      });

      // Set recent invoices (last 3)
      const recent = invoices
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 3);

      setRecentInvoices(recent);

    } catch (error) {
      console.error("Error loading mobile data:", error);
    }
  };

  // Component renders real mobile-optimized data...
}
```

## 🎯 Key Integration Points

### 1. Real-time Data Loading

```typescript
// Replace all mock data with Firestore queries
const loadRealData = async () => {
  // ❌ OLD: Mock data
  // const mockInvoices = generateMockInvoices();
  
  // ✅ NEW: Real Firestore data
  const realInvoices = await cloudStorageService.getUserInvoices(currentUser.uid);
  
  // ❌ OLD: Simulated metrics
  // const mockMetrics = { totalRevenue: 25000, ... };
  
  // ✅ NEW: Calculated from real data
  const realMetrics = calculateMetricsFromInvoices(realInvoices);
};
```

### 2. Subscription Status Integration

```typescript
// Use real subscription data throughout
const { isProUser, subscription } = useSubscription();

// ❌ OLD: localStorage check
// const isPro = storageService.getUserData().isPro;

// ✅ NEW: Real Firestore subscription
const showProFeatures = isProUser && userProfile?.subscription.status === "active";
```

### 3. Live Business Info

```typescript
// Load real business information
useEffect(() => {
  if (currentUser) {
    cloudStorageService.getBusinessInfo(currentUser.uid)
      .then(setBusinessInfo);
  }
}, [currentUser]);
```

### 4. Real Activity Feeds

```typescript
// Generate activity from actual invoice operations
const generateRealActivity = (invoices: CloudInvoice[]) => {
  return invoices.map(invoice => ({
    id: invoice.id,
    type: getActivityType(invoice.status),
    timestamp: invoice.updatedAt.toDate(),
    description: `${invoice.client.name} - $${invoice.total}`,
    status: invoice.status
  }));
};
```

## 🔄 Migration Strategy

### Phase 1: Core Components
1. ✅ Replace mock dashboard metrics with real calculations
2. ✅ Use real invoice data from Firestore
3. ✅ Integrate live subscription status

### Phase 2: Advanced Features  
1. ✅ Real-time activity feeds
2. ✅ Live business info management
3. ✅ Actual payment tracking

### Phase 3: Mobile Optimization
1. ✅ Mobile dashboard with real data
2. ✅ Quick actions using real services
3. ✅ Responsive real-time updates

## 📈 Performance Considerations

### Efficient Data Loading
```typescript
// Use pagination and limits
const invoices = await cloudStorageService.getUserInvoices(userId, 50);

// Cache frequently accessed data
const cachedBusinessInfo = useMemo(() => businessInfo, [businessInfo]);

// Lazy load non-critical data
const { data: analytics } = useSWR(
  `analytics-${userId}`, 
  () => calculateAnalytics(userId)
);
```

### Real-time Updates
```typescript
// Listen to Firestore changes
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, "invoices"), where("userId", "==", currentUser.uid)),
    (snapshot) => {
      const updatedInvoices = snapshot.docs.map(doc => doc.data());
      setInvoices(updatedInvoices);
    }
  );
  
  return unsubscribe;
}, [currentUser]);
```

## 🎯 Next Steps

1. **Implement Core Dashboard**: Replace BusinessDashboard.tsx with real data calculations
2. **Update Settings Pages**: Use real UserProfile and BusinessInfo from Firestore  
3. **Mobile Components**: Create mobile-optimized components with real data
4. **Analytics Integration**: Build real analytics from invoice data
5. **Real-time Features**: Add live updates using Firestore listeners

## 🔧 Tools & Services Used

- **Authentication**: Firebase Auth with AuthContext
- **Database**: Firestore with cloudStorageService  
- **Subscriptions**: Stripe integration with useSubscription hook
- **Real-time**: Firestore onSnapshot listeners
- **State Management**: React hooks with real data
- **Type Safety**: TypeScript interfaces for all data structures

This implementation ensures all UX redesign components use **real Firebase data** instead of mock data, providing a production-ready application with live user metrics, subscription status, and business analytics.
