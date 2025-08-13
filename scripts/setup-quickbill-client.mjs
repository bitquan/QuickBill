#!/usr/bin/env node

// QuickBill Firebase Setup Script (Client SDK version)
// This script uses the Firebase client SDK to set up the database

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVJckMyWDuxc0SfEd4haNjmsuXW_M8JWU",
  authDomain: "quickbill-app-b2467.firebaseapp.com",
  projectId: "quickbill-app",
  storageBucket: "quickbill-app.firebasestorage.app",
  messagingSenderId: "759607128560",
  appId: "1:759607128560:web:31e51a64090175ddc46d35",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupQuickBill() {
  console.log("🚀 Setting up QuickBill database...");

  try {
    // Create subscription plans
    const subscriptionPlans = [
      {
        id: "free",
        name: "Free",
        price: 0,
        currency: "USD",
        interval: "month",
        features: {
          invoicesPerMonth: 3,
          pdfDownloads: true,
          emailSupport: false,
          customBranding: false,
          analytics: false,
          apiAccess: false,
        },
        description: "Perfect for getting started with basic invoicing",
        popular: false,
        active: true,
      },
      {
        id: "pro",
        name: "Pro",
        price: 4.99,
        currency: "USD",
        interval: "month",
        features: {
          invoicesPerMonth: -1, // Unlimited
          pdfDownloads: true,
          emailSupport: true,
          customBranding: true,
          analytics: true,
          apiAccess: false,
        },
        description: "For growing businesses that need unlimited invoicing",
        popular: true,
        active: true,
      },
    ];

    // Add subscription plans
    console.log("📋 Creating subscription plans...");
    for (const plan of subscriptionPlans) {
      await setDoc(doc(db, "subscriptionPlans", plan.id), plan);
      console.log(`✅ Created plan: ${plan.name}`);
    }

    // Create app settings
    console.log("⚙️ Creating app settings...");
    const appSettings = {
      version: "1.0.0",
      maintenance: false,
      features: {
        emailInvoices: false,
        recurringInvoices: false,
        multiCurrency: false,
        teamAccounts: false,
      },
      limits: {
        free: {
          invoicesPerMonth: 3,
          storageGB: 0.1,
        },
        pro: {
          invoicesPerMonth: -1,
          storageGB: 5,
        },
      },
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "settings", "app"), appSettings);
    console.log("✅ Created app settings");

    // Create default business template
    console.log("🏢 Creating default business template...");
    const defaultBusinessTemplate = {
      name: "",
      email: "",
      phone: "",
      address: "",
      logo: null,
      website: "",
      taxId: "",
      currency: "USD",
      taxRate: 0,
      paymentTerms: "Net 30",
      invoicePrefix: "INV",
      nextInvoiceNumber: 1,
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#EF4444",
        fontFamily: "Inter",
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(
      doc(db, "templates", "defaultBusiness"),
      defaultBusinessTemplate
    );
    console.log("✅ Created default business template");

    console.log("🎉 QuickBill setup completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Enable Authentication in Firebase Console");
    console.log("2. Enable Google Sign-in provider");
    console.log("3. Start creating invoices!");
    console.log(
      "\n🌐 Firebase Console: https://console.firebase.google.com/project/truepaper-9df78"
    );
  } catch (error) {
    console.error("❌ Error setting up QuickBill:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run setup
setupQuickBill();
