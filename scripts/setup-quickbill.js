#!/usr/bin/env node

// QuickBill Firebase Setup Script
// This script initializes your Firebase project with the necessary collections and data

const admin = require("firebase-admin");
const path = require("path");

// Check if service account key exists
const serviceAccountPath = path.join(__dirname, "service-account-key.json");

try {
  const serviceAccount = require(serviceAccountPath);

  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "truepaper-9df78",
  });

  const db = admin.firestore();

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
        await db.collection("subscriptionPlans").doc(plan.id).set(plan);
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
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("settings").doc("app").set(appSettings);
      console.log("✅ Created app settings");

      console.log("🎉 QuickBill setup completed successfully!");
      console.log("\n📝 Next steps:");
      console.log("1. Enable Authentication in Firebase Console");
      console.log("2. Enable Google Sign-in provider");
      console.log("3. Start creating invoices!");
    } catch (error) {
      console.error("❌ Error setting up QuickBill:", error);
      process.exit(1);
    }

    process.exit(0);
  }

  // Run setup
  setupQuickBill();
} catch (error) {
  console.error("❌ Service account key not found!");
  console.log("\n📝 To set up QuickBill database:");
  console.log(
    "1. Go to Firebase Console → Project Settings → Service Accounts"
  );
  console.log('2. Click "Generate new private key"');
  console.log(
    '3. Save the JSON file as "service-account-key.json" in the scripts folder'
  );
  console.log("4. Run this script again: npm run firebase:init");
  console.log(
    "\n🌐 Firebase Console: https://console.firebase.google.com/project/truepaper-9df78"
  );
  process.exit(1);
}
