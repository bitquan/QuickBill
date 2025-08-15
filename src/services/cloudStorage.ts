import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { storageService } from "./storage";
import type { InvoiceData, BusinessInfo } from "../types/invoice";

export interface UserProfile {
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

export interface CloudInvoice
  extends Omit<InvoiceData, "id" | "createdAt" | "updatedAt" | "status"> {
  id?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
}

class CloudStorageService {
  /**
   * User Profile Management
   */
  async createUserProfile(
    uid: string,
    email: string,
    displayName: string
  ): Promise<void> {
    const userRef = doc(db, "users", uid);
    const userProfile: Omit<UserProfile, "uid"> = {
      email,
      displayName,
      createdAt: serverTimestamp() as Timestamp,
      lastLoginAt: serverTimestamp() as Timestamp,
      subscription: {
        planId: "free",
        status: "active",
        invoicesThisMonth: 0,
      },
    };

    await updateDoc(userRef, userProfile);
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { uid, ...userSnap.data() } as UserProfile;
    }

    return null;
  }

  async updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  }

  /**
   * Check if user has Pro subscription
   */
  async isProUser(uid: string): Promise<boolean> {
    const userProfile = await this.getUserProfile(uid);
    if (!userProfile) return false;

    return (
      userProfile.subscription.planId === "pro" &&
      userProfile.subscription.status === "active"
    );
  }

  /**
   * Update user to Pro subscription
   */
  async upgradeUserToPro(
    uid: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string
  ): Promise<void> {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      subscription: {
        planId: "pro",
        status: "active",
        invoicesThisMonth: 0,
        stripeCustomerId,
        stripeSubscriptionId,
      },
    });
  }

  /**
   * Invoice Management
   */
  async saveInvoice(userId: string, invoiceData: InvoiceData): Promise<string> {
    const cloudInvoice: Omit<CloudInvoice, "id"> = {
      ...invoiceData,
      userId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      status: "draft",
    };

    const docRef = await addDoc(collection(db, "invoices"), cloudInvoice);
    return docRef.id;
  }

  async updateInvoice(
    invoiceId: string,
    updates: Partial<InvoiceData>
  ): Promise<void> {
    const invoiceRef = doc(db, "invoices", invoiceId);
    await updateDoc(invoiceRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    const invoiceRef = doc(db, "invoices", invoiceId);
    await deleteDoc(invoiceRef);
  }

  async getUserInvoices(
    userId: string,
    limitCount: number = 50
  ): Promise<CloudInvoice[]> {
    const invoicesRef = collection(db, "invoices");
    const q = query(
      invoicesRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CloudInvoice[];
  }

  async getInvoice(invoiceId: string): Promise<CloudInvoice | null> {
    const invoiceRef = doc(db, "invoices", invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);

    if (invoiceSnap.exists()) {
      return { id: invoiceSnap.id, ...invoiceSnap.data() } as CloudInvoice;
    }

    return null;
  }

  /**
   * Business Info Management
   */
  async saveBusinessInfo(
    userId: string,
    businessInfo: BusinessInfo
  ): Promise<void> {
    const businessRef = doc(db, "businessInfo", userId);
    await updateDoc(businessRef, {
      ...businessInfo,
      updatedAt: serverTimestamp(),
    });
  }

  async getBusinessInfo(userId: string): Promise<BusinessInfo | null> {
    const businessRef = doc(db, "businessInfo", userId);
    const businessSnap = await getDoc(businessRef);

    if (businessSnap.exists()) {
      return businessSnap.data() as BusinessInfo;
    }

    return null;
  }

  /**
   * Subscription Management
   */
  async updateSubscription(
    userId: string,
    subscription: UserProfile["subscription"]
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { subscription });
  }

  async incrementInvoiceCount(userId: string): Promise<number> {
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile) throw new Error("User not found");

    const newCount = userProfile.subscription.invoicesThisMonth + 1;

    await this.updateSubscription(userId, {
      ...userProfile.subscription,
      invoicesThisMonth: newCount,
    });

    return newCount;
  }

  async resetMonthlyInvoiceCount(userId: string): Promise<void> {
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile) return;

    await this.updateSubscription(userId, {
      ...userProfile.subscription,
      invoicesThisMonth: 0,
    });
  }

  /**
   * Data Migration from LocalStorage
   */
  async migrateFromLocalStorage(userId: string): Promise<{
    invoicesMigrated: number;
    businessInfoMigrated: boolean;
  }> {
    let invoicesMigrated = 0;
    let businessInfoMigrated = false;

    try {
      // Migrate invoices
      const localInvoices = storageService.getAllInvoices();
      for (const invoice of localInvoices) {
        await this.saveInvoice(userId, invoice);
        invoicesMigrated++;
      }

      // Migrate business info
      const localBusinessInfo = storageService.getLastBusinessInfo();
      if (localBusinessInfo && Object.keys(localBusinessInfo).length > 0) {
        await this.saveBusinessInfo(userId, localBusinessInfo);
        businessInfoMigrated = true;
      }

      // Clear local storage after successful migration
      if (invoicesMigrated > 0 || businessInfoMigrated) {
        localStorage.setItem("quickbill_migrated", "true");
      }

      return { invoicesMigrated, businessInfoMigrated };
    } catch (error) {
      console.error("Migration failed:", error);
      throw new Error("Failed to migrate data from local storage");
    }
  }

  /**
   * Check if user has already migrated
   */
  isMigrationCompleted(): boolean {
    return localStorage.getItem("quickbill_migrated") === "true";
  }

  /**
   * Sync data between local and cloud storage
   */
  async syncWithLocal(userId: string): Promise<void> {
    try {
      // Get cloud data
      const cloudInvoices = await this.getUserInvoices(userId);
      const cloudBusinessInfo = await this.getBusinessInfo(userId);

      // Convert cloud invoices to local format
      const localInvoices: InvoiceData[] = cloudInvoices.map((invoice) => ({
        id: invoice.id!,
        invoiceNumber: invoice.invoiceNumber,
        client: invoice.client,
        business: invoice.business,
        items: invoice.items,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        tax: invoice.tax,
        total: invoice.total,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        notes: invoice.notes,
      }));

      // Update local storage
      localStorage.setItem("quickbill_invoices", JSON.stringify(localInvoices));

      if (cloudBusinessInfo) {
        localStorage.setItem(
          "quickbill_business",
          JSON.stringify(cloudBusinessInfo)
        );
      }

      console.log("Data synced successfully");
    } catch (error) {
      console.error("Sync failed:", error);
      throw new Error("Failed to sync data");
    }
  }

  /**
   * Search invoices
   */
  async searchInvoices(
    userId: string,
    searchTerm: string,
    limitCount: number = 20
  ): Promise<CloudInvoice[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation. For production, consider using
    // Algolia or Cloud Functions for advanced search

    const invoicesRef = collection(db, "invoices");
    const q = query(
      invoicesRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const allInvoices = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CloudInvoice[];

    // Client-side filtering (not ideal for large datasets)
    return allInvoices.filter(
      (invoice) =>
        invoice.invoiceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * User Preferences Management
   */
  async saveUserPreferences(
    userId: string,
    preferences: any
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        preferences: {
          ...preferences,
          updatedAt: serverTimestamp(),
        },
      });
    } catch (error) {
      console.error("Error saving user preferences:", error);
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<any | null> {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.preferences || null;
      }
      return null;
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return null;
    }
  }
}

export const cloudStorageService = new CloudStorageService();
