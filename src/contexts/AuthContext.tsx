import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  cloudStorageService,
  type UserProfile,
} from "../services/cloudStorage";
import toast from "react-hot-toast";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  canCreateInvoice: () => boolean;
  getInvoicesRemaining: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, displayName: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await updateProfile(result.user, { displayName });

      // Create user profile in Firestore
      await cloudStorageService.createUserProfile(
        result.user.uid,
        email,
        displayName
      );

      // Check if migration is needed
      if (!cloudStorageService.isMigrationCompleted()) {
        try {
          const migrationResult =
            await cloudStorageService.migrateFromLocalStorage(result.user.uid);
          if (
            migrationResult.invoicesMigrated > 0 ||
            migrationResult.businessInfoMigrated
          ) {
            toast.success(
              `Welcome! We've migrated ${migrationResult.invoicesMigrated} invoices to your account.`
            );
          }
        } catch (error) {
          console.error("Migration failed:", error);
          toast.error(
            "Account created but data migration failed. Your local data is still available."
          );
        }
      }

      await refreshUserProfile();
    }
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    if (result.user) {
      // Create profile if it doesn't exist
      const existingProfile = await cloudStorageService.getUserProfile(
        result.user.uid
      );
      if (!existingProfile) {
        await cloudStorageService.createUserProfile(
          result.user.uid,
          result.user.email || "",
          result.user.displayName || "Google User"
        );
      }

      // Update last login
      await cloudStorageService.updateLastLogin(result.user.uid);

      // Check if migration is needed
      if (!cloudStorageService.isMigrationCompleted()) {
        try {
          const migrationResult =
            await cloudStorageService.migrateFromLocalStorage(result.user.uid);
          if (
            migrationResult.invoicesMigrated > 0 ||
            migrationResult.businessInfoMigrated
          ) {
            toast.success(
              `Welcome back! We've migrated ${migrationResult.invoicesMigrated} invoices to your account.`
            );
          }
        } catch (error) {
          console.error("Migration failed:", error);
          toast.error(
            "Login successful but data migration failed. Your local data is still available."
          );
        }
      }

      await refreshUserProfile();
    }
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function refreshUserProfile() {
    if (!currentUser) return;

    try {
      const profile = await cloudStorageService.getUserProfile(currentUser.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }

  function canCreateInvoice(): boolean {
    if (!userProfile) return false;

    // Pro and Business plans have unlimited invoices
    if (userProfile.subscription.planId !== "free") {
      return true;
    }

    // Free plan has a limit of 3 invoices per month
    return userProfile.subscription.invoicesThisMonth < 3;
  }

  function getInvoicesRemaining(): number {
    if (!userProfile) return 0;

    // Pro and Business plans have unlimited invoices
    if (userProfile.subscription.planId !== "free") {
      return -1; // Unlimited
    }

    // Free plan calculation
    return Math.max(0, 3 - userProfile.subscription.invoicesThisMonth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Update last login and fetch profile
        try {
          await cloudStorageService.updateLastLogin(user.uid);
          await refreshUserProfile();
        } catch (error) {
          console.error("Failed to update user session:", error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUserProfile,
    canCreateInvoice,
    getInvoicesRemaining,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
