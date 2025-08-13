#!/usr/bin/env node

const admin = require("firebase-admin");
const serviceAccount = require("./service-account-key.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function initializeDatabase() {
  console.log("🚀 Initializing QuickBill database...");

  try {
    // Create subscription plans collection
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
      {
        id: "business",
        name: "Business",
        price: 14.99,
        currency: "USD",
        interval: "month",
        features: {
          invoicesPerMonth: -1, // Unlimited
          pdfDownloads: true,
          emailSupport: true,
          customBranding: true,
          analytics: true,
          apiAccess: true,
        },
        description: "For teams and businesses with advanced needs",
        popular: false,
        active: true,
      },
    ];

    // Add subscription plans
    console.log("📋 Creating subscription plans...");
    for (const plan of subscriptionPlans) {
      await db.collection("subscriptionPlans").doc(plan.id).set(plan);
      console.log(`✅ Created plan: ${plan.name}`);
    }

    // Create default business settings template
    console.log("🏢 Creating default business settings template...");
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db
      .collection("templates")
      .doc("defaultBusiness")
      .set(defaultBusinessTemplate);
    console.log("✅ Created default business template");

    // Create app settings
    console.log("⚙️ Creating app settings...");
    const appSettings = {
      version: "1.0.0",
      maintenance: false,
      features: {
        emailInvoices: true,
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
        business: {
          invoicesPerMonth: -1,
          storageGB: 50,
        },
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("settings").doc("app").set(appSettings);
    console.log("✅ Created app settings");

    console.log("🎉 Database initialization completed successfully!");

    // Create indexes message
    console.log("\n📝 Next steps:");
    console.log(
      "1. Deploy Firestore rules: firebase deploy --only firestore:rules"
    );
    console.log(
      "2. Deploy Firestore indexes: firebase deploy --only firestore:indexes"
    );
    console.log("3. Set up authentication: firebase auth:import users.json");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run initialization
initializeDatabase();
