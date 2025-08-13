// Test Pro User Detection
// Run this in browser console to test different scenarios

// Test 1: Check current subscription status
console.log("=== TESTING PRO USER DETECTION ===");

// Get current user
const user = firebase.auth().currentUser;
if (user) {
  console.log("✅ User authenticated:", user.email);

  // Test subscription status
  const subscriptionData = localStorage.getItem(`subscription_${user.uid}`);
  console.log("📦 Local subscription data:", subscriptionData);

  // Test localStorage user data
  const userData = JSON.parse(
    localStorage.getItem("quickbill_user_data") || "{}"
  );
  console.log("💾 Local user data:", userData);
} else {
  console.log("❌ No user authenticated");
}

// Test 2: Simulate Pro subscription
function simulateProSubscription() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log("❌ Must be logged in to test");
    return;
  }

  const subscriptionData = {
    customerId: "cus_test_123",
    subscriptionId: "sub_test_123",
    status: "active",
    currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    priceId: "price_1RvkbDDfc44028ki94G00DCn",
  };

  localStorage.setItem(
    `subscription_${user.uid}`,
    JSON.stringify(subscriptionData)
  );
  console.log("✅ Simulated Pro subscription");
  console.log("🔄 Refresh page to see changes");
}

// Test 3: Clear subscription (back to free)
function clearSubscription() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log("❌ Must be logged in to test");
    return;
  }

  localStorage.removeItem(`subscription_${user.uid}`);
  console.log("✅ Cleared subscription (back to free)");
  console.log("🔄 Refresh page to see changes");
}

console.log("🧪 Available test functions:");
console.log("- simulateProSubscription() - Make current user Pro");
console.log("- clearSubscription() - Remove Pro subscription");
