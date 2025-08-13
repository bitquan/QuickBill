#!/usr/bin/env node

const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🚀 QuickBill API Keys Setup CLI");
console.log("================================\n");

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEmailJS() {
  console.log("📧 EmailJS Configuration");
  console.log("------------------------");
  console.log("From your EmailJS dashboard (you're already logged in):");
  console.log("");

  console.log('1. FIRST: Click "Add New Service" and connect your Gmail/email');
  console.log("   Then copy the Service ID from the list\n");

  const serviceId = await question("Enter your EmailJS Service ID: ");

  console.log('\n2. NEXT: Go to "Email Templates" tab');
  console.log('   Click "Create New Template" and use these settings:');
  console.log("   Template Name: QuickBill Invoice");
  console.log("   Subject: Invoice {{invoice_number}} from {{business_name}}");
  console.log("   Content: Use the template from EMAILJS_LAUNCH_SETUP.md\n");

  const templateId = await question("Enter your EmailJS Template ID: ");

  console.log("\n3. FINALLY: Go to Account > General");
  console.log("   Copy your Public Key\n");

  const publicKey = await question("Enter your EmailJS Public Key: ");

  return { serviceId, templateId, publicKey };
}

async function setupStripe() {
  console.log("\n💳 Stripe Configuration");
  console.log("------------------------");

  const currentKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || "Not set";
  const currentPrice = process.env.VITE_STRIPE_PRO_PRICE_ID || "Not set";

  console.log(`Current Publishable Key: ${currentKey}`);
  console.log(`Current Price ID: ${currentPrice}\n`);

  const useExisting = await question("Keep existing Stripe keys? (y/n): ");

  if (useExisting.toLowerCase() === "y") {
    return null;
  }

  console.log("\nFrom https://dashboard.stripe.com:");
  console.log("1. Go to Developers > API Keys");
  console.log("2. Copy your Publishable key (pk_test_ or pk_live_)");
  console.log('3. Go to Products and create "QuickBill Pro" at $4.99/month');
  console.log("4. Copy the Price ID\n");

  const publishableKey = await question("Enter Stripe Publishable Key: ");
  const priceId = await question("Enter Stripe Price ID: ");

  return { publishableKey, priceId };
}

async function updateEnvFile(emailConfig, stripeConfig) {
  const envPath = path.join(process.cwd(), ".env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Update EmailJS config
  if (emailConfig) {
    envContent = envContent.replace(
      /VITE_EMAILJS_SERVICE_ID=.*/,
      `VITE_EMAILJS_SERVICE_ID=${emailConfig.serviceId}`
    );
    envContent = envContent.replace(
      /VITE_EMAILJS_TEMPLATE_ID=.*/,
      `VITE_EMAILJS_TEMPLATE_ID=${emailConfig.templateId}`
    );
    envContent = envContent.replace(
      /VITE_EMAILJS_PUBLIC_KEY=.*/,
      `VITE_EMAILJS_PUBLIC_KEY=${emailConfig.publicKey}`
    );
  }

  // Update Stripe config
  if (stripeConfig) {
    envContent = envContent.replace(
      /VITE_STRIPE_PUBLISHABLE_KEY=.*/,
      `VITE_STRIPE_PUBLISHABLE_KEY=${stripeConfig.publishableKey}`
    );
    envContent = envContent.replace(
      /VITE_STRIPE_PRO_PRICE_ID=.*/,
      `VITE_STRIPE_PRO_PRICE_ID=${stripeConfig.priceId}`
    );
  }

  fs.writeFileSync(envPath, envContent);
  console.log("\n✅ Environment file updated!");
}

async function buildAndDeploy() {
  console.log("\n🔨 Building and deploying...");

  const { spawn } = require("child_process");

  return new Promise((resolve, reject) => {
    const build = spawn("npm", ["run", "build"], {
      stdio: "inherit",
      shell: true,
    });

    build.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Build successful!");

        const deploy = spawn("firebase", ["deploy", "--only", "hosting"], {
          stdio: "inherit",
          shell: true,
        });

        deploy.on("close", (deployCode) => {
          if (deployCode === 0) {
            console.log("✅ Deployment successful!");
            resolve();
          } else {
            reject(new Error("Deployment failed"));
          }
        });
      } else {
        reject(new Error("Build failed"));
      }
    });
  });
}

async function main() {
  try {
    // Check if Stripe is already configured
    console.log("Current Status:");
    console.log("===============");

    const envExists = fs.existsSync(".env");
    console.log(`✅ Environment file: ${envExists ? "Found" : "Missing"}`);

    if (envExists) {
      const envContent = fs.readFileSync(".env", "utf8");
      const hasStripe =
        envContent.includes("pk_live_") || envContent.includes("pk_test_");
      const hasEmailJS = !envContent.includes("quickbill_emailjs_key_123");

      console.log(
        `${hasStripe ? "✅" : "⚠️ "} Stripe: ${
          hasStripe ? "Configured" : "Needs setup"
        }`
      );
      console.log(
        `${hasEmailJS ? "✅" : "⚠️ "} EmailJS: ${
          hasEmailJS ? "Configured" : "Needs setup"
        }`
      );
    }

    console.log("");

    // Setup EmailJS
    const emailConfig = await setupEmailJS();

    // Setup Stripe (optional if already configured)
    const stripeConfig = await setupStripe();

    // Update .env file
    await updateEnvFile(emailConfig, stripeConfig);

    // Build and deploy
    const shouldDeploy = await question("\nBuild and deploy now? (y/n): ");

    if (shouldDeploy.toLowerCase() === "y") {
      await buildAndDeploy();
      console.log("\n🎉 LAUNCH READY!");
      console.log("Live URL: https://quickbill-app-b2467.web.app");
    } else {
      console.log("\n⚠️  Remember to run:");
      console.log("npm run build");
      console.log("firebase deploy --only hosting");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

main();
