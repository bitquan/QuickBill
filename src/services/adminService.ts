import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { UserProfile } from "./cloudStorage";

export interface AdminStats {
  totalUsers: number;
  totalInvoices: number;
  proUsers: number;
  freeUsers: number;
  revenueThisMonth: number;
  invoicesThisMonth: number;
  newUsersThisMonth: number;
  activeUsersThisWeek: number;
}

export interface AdminUser extends UserProfile {
  totalInvoices: number;
  lastActiveDate: Date;
  registrationDate: Date;
}

class AdminService {
  /**
   * Check if user has admin privileges
   */
  isAdmin(email: string): boolean {
    const adminEmails = [
      "admin@quickbill.com",
      "admin@quickbill.dev",
      // Add more admin emails as needed
    ];

    return adminEmails.includes(email) || email.endsWith("@quickbill.dev");
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Get all users
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Get all invoices
      const invoicesRef = collection(db, "invoices");
      const invoicesSnapshot = await getDocs(invoicesRef);
      const invoices = invoicesSnapshot.docs.map((doc) => doc.data());

      // Calculate stats
      const totalUsers = users.length;
      const proUsers = users.filter(
        (user: any) =>
          user.subscription?.planId === "pro" &&
          user.subscription?.status === "active"
      ).length;
      const freeUsers = totalUsers - proUsers;

      // Monthly calculations
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newUsersThisMonth = users.filter((user: any) => {
        const createdAt =
          user.createdAt?.toDate?.() || new Date(user.createdAt);
        return createdAt >= thisMonth;
      }).length;

      const activeUsersThisWeek = users.filter((user: any) => {
        const lastLogin =
          user.lastLoginAt?.toDate?.() || new Date(user.lastLoginAt);
        return lastLogin >= thisWeek;
      }).length;

      const invoicesThisMonth = invoices.filter((invoice) => {
        const createdAt =
          invoice.createdAt?.toDate?.() || new Date(invoice.createdAt);
        return createdAt >= thisMonth;
      }).length;

      return {
        totalUsers,
        totalInvoices: invoices.length,
        proUsers,
        freeUsers,
        revenueThisMonth: proUsers * 9.99, // $9.99 per Pro user
        invoicesThisMonth,
        newUsersThisMonth,
        activeUsersThisWeek,
      };
    } catch (error) {
      console.error("Error getting admin stats:", error);
      throw error;
    }
  }

  /**
   * Get all users for admin management
   */
  async getAllUsers(limitCount: number = 50): Promise<AdminUser[]> {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);

      const users: AdminUser[] = [];

      for (const userDoc of snapshot.docs) {
        const userData = { uid: userDoc.id, ...userDoc.data() } as UserProfile;

        // Get user's invoice count
        const invoicesRef = collection(db, "invoices");
        const userInvoicesQuery = query(
          invoicesRef,
          where("userId", "==", userDoc.id)
        );
        const invoicesSnapshot = await getDocs(userInvoicesQuery);

        users.push({
          ...userData,
          totalInvoices: invoicesSnapshot.size,
          lastActiveDate: userData.lastLoginAt?.toDate?.() || new Date(),
          registrationDate: userData.createdAt?.toDate?.() || new Date(),
        });
      }

      return users;
    } catch (error) {
      console.error("Error getting users:", error);
      throw error;
    }
  }

  /**
   * Update user subscription (admin only)
   */
  async updateUserSubscription(
    userId: string,
    planId: "free" | "pro",
    status: "active" | "inactive" | "cancelled"
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        "subscription.planId": planId,
        "subscription.status": status,
      });
    } catch (error) {
      console.error("Error updating user subscription:", error);
      throw error;
    }
  }

  /**
   * Delete user account (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user's invoices first
      const invoicesRef = collection(db, "invoices");
      const userInvoicesQuery = query(
        invoicesRef,
        where("userId", "==", userId)
      );
      const invoicesSnapshot = await getDocs(userInvoicesQuery);

      const deletePromises = invoicesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Delete user profile
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);

      // Delete business info if exists
      const businessRef = doc(db, "businessInfo", userId);
      await deleteDoc(businessRef);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Get recent activity for admin dashboard
   */
  async getRecentActivity(limitCount: number = 10): Promise<
    Array<{
      type: string;
      description: string;
      timestamp: Date;
      icon: string;
    }>
  > {
    try {
      // Get recent users
      const usersRef = collection(db, "users");
      const recentUsersQuery = query(
        usersRef,
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const usersSnapshot = await getDocs(recentUsersQuery);

      // Get recent invoices
      const invoicesRef = collection(db, "invoices");
      const recentInvoicesQuery = query(
        invoicesRef,
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const invoicesSnapshot = await getDocs(recentInvoicesQuery);

      const activities: Array<{
        type: string;
        description: string;
        timestamp: Date;
        icon: string;
      }> = [];

      // Add user registrations
      usersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        activities.push({
          type: "user_registration",
          description: `New user registered: ${data.email}`,
          timestamp: data.createdAt?.toDate?.() || new Date(),
          icon: "👤",
        });
      });

      // Add invoice creations
      invoicesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        activities.push({
          type: "invoice_created",
          description: `Invoice created: ${data.invoiceNumber}`,
          timestamp: data.createdAt?.toDate?.() || new Date(),
          icon: "📄",
        });
      });

      // Sort by timestamp and return limited results
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error getting recent activity:", error);
      return [];
    }
  }

  /**
   * Generate admin report
   */
  async generateReport(type: "users" | "revenue" | "invoices"): Promise<any> {
    try {
      switch (type) {
        case "users":
          return await this.generateUserReport();
        case "revenue":
          return await this.generateRevenueReport();
        case "invoices":
          return await this.generateInvoiceReport();
        default:
          throw new Error("Invalid report type");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  private async generateUserReport() {
    const users = await this.getAllUsers(1000); // Get more users for report

    return {
      totalUsers: users.length,
      proUsers: users.filter((u) => u.subscription.planId === "pro").length,
      userGrowth: this.calculateGrowthRate(users, "registrationDate"),
      topActiveUsers: users
        .sort((a, b) => b.totalInvoices - a.totalInvoices)
        .slice(0, 10),
    };
  }

  private async generateRevenueReport() {
    const stats = await this.getAdminStats();

    return {
      currentMonthRevenue: stats.revenueThisMonth,
      projectedAnnualRevenue: stats.revenueThisMonth * 12,
      averageRevenuePerUser:
        stats.revenueThisMonth / Math.max(stats.proUsers, 1),
      conversionRate: (stats.proUsers / stats.totalUsers) * 100,
    };
  }

  private async generateInvoiceReport() {
    const invoicesRef = collection(db, "invoices");
    const snapshot = await getDocs(invoicesRef);
    const invoices = snapshot.docs.map((doc) => doc.data());

    return {
      totalInvoices: invoices.length,
      averageInvoicesPerUser:
        invoices.length / (await this.getAdminStats()).totalUsers,
      invoiceGrowth: this.calculateGrowthRate(invoices, "createdAt"),
    };
  }

  private calculateGrowthRate(items: any[], dateField: string): number {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthCount = items.filter((item) => {
      const date = item[dateField]?.toDate?.() || new Date(item[dateField]);
      return date >= thisMonth;
    }).length;

    const lastMonthCount = items.filter((item) => {
      const date = item[dateField]?.toDate?.() || new Date(item[dateField]);
      return date >= lastMonth && date < thisMonth;
    }).length;

    if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;
    return ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
  }
}

export const adminService = new AdminService();
