#!/usr/bin/env node

const admin = require("firebase-admin");
const serviceAccount = require("./service-account-key.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedTestData() {
  console.log("🌱 Seeding test data...");

  try {
    // Create test user
    const testUser = {
      uid: "test-user-123",
      email: "test@quickbill.com",
      displayName: "Test User",
      photoURL: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      subscription: {
        planId: "free",
        status: "active",
        invoicesThisMonth: 1,
        nextBillingDate: null,
      },
    };

    await db.collection("users").doc(testUser.uid).set(testUser);
    console.log("✅ Created test user");

    // Create test business info
    const testBusiness = {
      name: "Acme Consulting LLC",
      email: "billing@acmeconsulting.com",
      phone: "+1 (555) 123-4567",
      address: "123 Business Ave\nSuite 100\nNew York, NY 10001",
      website: "https://acmeconsulting.com",
      taxId: "12-3456789",
      currency: "USD",
      taxRate: 8.25,
      paymentTerms: "Net 30",
      invoicePrefix: "AC",
      nextInvoiceNumber: 1001,
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#EF4444",
        fontFamily: "Inter",
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("businessInfo").doc(testUser.uid).set(testBusiness);
    console.log("✅ Created test business info");

    // Create test invoices
    const testInvoices = [
      {
        invoiceNumber: "AC-1001",
        userId: testUser.uid,
        client: {
          name: "Tech Startup Inc.",
          email: "accounts@techstartup.com",
          phone: "+1 (555) 987-6543",
          address: "456 Innovation Dr\nSan Francisco, CA 94105",
        },
        items: [
          {
            description: "Website Development",
            quantity: 1,
            unitPrice: 5000,
          },
          {
            description: "SEO Optimization",
            quantity: 1,
            unitPrice: 1500,
          },
        ],
        subtotal: 6500,
        taxRate: 8.25,
        tax: 536.25,
        total: 7036.25,
        invoiceDate: "2025-08-01",
        dueDate: "2025-08-31",
        status: "sent",
        notes: "Thank you for your business!",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        invoiceNumber: "AC-1002",
        userId: testUser.uid,
        client: {
          name: "Local Restaurant",
          email: "manager@localrestaurant.com",
          phone: "+1 (555) 456-7890",
          address: "789 Food Street\nNew York, NY 10002",
        },
        items: [
          {
            description: "POS System Setup",
            quantity: 1,
            unitPrice: 2000,
          },
          {
            description: "Staff Training",
            quantity: 8,
            unitPrice: 150,
          },
        ],
        subtotal: 3200,
        taxRate: 8.25,
        tax: 264,
        total: 3464,
        invoiceDate: "2025-08-05",
        dueDate: "2025-09-04",
        status: "draft",
        notes: "Payment due within 30 days",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    for (const invoice of testInvoices) {
      const docRef = await db.collection("invoices").add(invoice);
      console.log(
        `✅ Created test invoice: ${invoice.invoiceNumber} (${docRef.id})`
      );
    }

    // Create test subscription
    const testSubscription = {
      userId: testUser.uid,
      planId: "free",
      status: "active",
      startDate: admin.firestore.FieldValue.serverTimestamp(),
      endDate: null,
      invoicesThisMonth: 2,
      lastResetDate: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };

    await db
      .collection("userSubscriptions")
      .doc(testUser.uid)
      .set(testSubscription);
    console.log("✅ Created test subscription");

    console.log("🎉 Test data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run seeding
seedTestData();
