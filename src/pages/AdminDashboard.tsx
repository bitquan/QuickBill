import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  UserIcon,
  CreditCardIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface AdminStats {
  totalUsers: number;
  totalInvoices: number;
  proUsers: number;
  freeUsers: number;
  revenueThisMonth: number;
  invoicesThisMonth: number;
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  subscription: {
    planId: string;
    status: string;
    invoicesThisMonth: number;
  };
  createdAt: any;
  lastLoginAt: any;
}

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInvoices: 0,
    proUsers: 0,
    freeUsers: 0,
    revenueThisMonth: 0,
    invoicesThisMonth: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "users" | "subscriptions" | "analytics"
  >("overview");

  // Check if current user is admin
  const isAdmin =
    currentUser?.email === "admin@quickbill.com" ||
    currentUser?.email?.endsWith("@quickbill.dev");

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // In a real app, these would be proper admin API calls
      // For now, we'll simulate the data

      setStats({
        totalUsers: 1247,
        totalInvoices: 8934,
        proUsers: 234,
        freeUsers: 1013,
        revenueThisMonth: 1169.66, // 234 * $4.99
        invoicesThisMonth: 2456,
      });

      // Simulate user data
      setUsers([
        {
          uid: "user1",
          email: "john@example.com",
          displayName: "John Doe",
          subscription: {
            planId: "pro",
            status: "active",
            invoicesThisMonth: 12,
          },
          createdAt: new Date("2024-11-15"),
          lastLoginAt: new Date("2025-01-10"),
        },
        {
          uid: "user2",
          email: "jane@startup.com",
          displayName: "Jane Smith",
          subscription: {
            planId: "free",
            status: "active",
            invoicesThisMonth: 2,
          },
          createdAt: new Date("2025-01-05"),
          lastLoginAt: new Date("2025-01-12"),
        },
      ]);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage QuickBill users, subscriptions, and analytics
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: ChartBarIcon },
              { id: "users", name: "Users", icon: UserIcon },
              {
                id: "subscriptions",
                name: "Subscriptions",
                icon: CreditCardIcon,
              },
              { id: "analytics", name: "Analytics", icon: ChartBarIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Pro Users"
                value={stats.proUsers.toLocaleString()}
                icon="⭐"
                color="green"
              />
              <StatCard
                title="Monthly Revenue"
                value={`$${stats.revenueThisMonth.toLocaleString()}`}
                icon="💰"
                color="purple"
              />
              <StatCard
                title="Invoices This Month"
                value={stats.invoicesThisMonth.toLocaleString()}
                icon="📄"
                color="orange"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">New user registered</p>
                    <p className="text-sm text-gray-600">jane@startup.com</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Pro subscription activated</p>
                    <p className="text-sm text-gray-600">john@example.com</p>
                  </div>
                  <span className="text-sm text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Invoice generated</p>
                    <p className="text-sm text-gray-600">INV-2025-001</p>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === "users" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">All Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoices This Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.uid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.subscription.planId === "pro"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.subscription.planId.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.subscription.invoicesThisMonth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {selectedTab === "subscriptions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Subscription Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Free Users</span>
                    <span className="font-semibold">{stats.freeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pro Users</span>
                    <span className="font-semibold">{stats.proUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate</span>
                    <span className="font-semibold">
                      {((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-semibold">
                      ${stats.revenueThisMonth.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average per Pro User</span>
                    <span className="font-semibold">$4.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected Annual</span>
                    <span className="font-semibold">
                      ${(stats.revenueThisMonth * 12).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === "analytics" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics</h3>
            <p className="text-gray-600">
              Detailed analytics and reporting features would go here. This
              could include:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• User growth over time</li>
              <li>• Invoice generation trends</li>
              <li>• Subscription conversion funnel</li>
              <li>• Revenue analytics and forecasting</li>
              <li>• Geographic user distribution</li>
              <li>• Feature usage statistics</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: "blue" | "green" | "purple" | "orange";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
