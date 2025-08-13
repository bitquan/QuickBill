#!/usr/bin/env node

const admin = require("firebase-admin");
const serviceAccount = require("./service-account-key.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function cleanDatabase() {
  console.log("🧹 Cleaning database...");

  try {
    const collections = [
      "users",
      "invoices",
      "businessInfo",
      "userSubscriptions",
      "analytics",
    ];

    for (const collectionName of collections) {
      console.log(`🗑️ Cleaning ${collectionName} collection...`);

      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(
        `✅ Cleaned ${snapshot.docs.length} documents from ${collectionName}`
      );
    }

    console.log("🎉 Database cleaned successfully!");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run cleaning
cleanDatabase();
