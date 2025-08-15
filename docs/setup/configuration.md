# 🔐 QuickBill - Complete Configuration Backup

**Date Created:** August 14, 2025
**⚠️ SENSITIVE INFORMATION - KEEP SECURE ⚠️**

---

## 🔥 Firebase Configuration

### Project Details

- **Project ID:** quickbill-app
- **Hosting Site:** quickbill-app-b2467
- **Project URL:** https://quickbill-app-b2467.web.app
- **Console:** https://console.firebase.google.com/project/quickbill-app/overview

### Firebase Config (src/config/firebase.ts)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCVJckMyWDuxc0SfEd4haNjmsuXW_M8JWU",
  authDomain: "quickbill-app-b2467.firebaseapp.com",
  projectId: "quickbill-app",
  storageBucket: "quickbill-app.firebasestorage.app",
  messagingSenderId: "759607128560",
  appId: "1:759607128560:web:31e51a64090175ddc46d35",
};
```

---

## 💳 Stripe Configuration

### Live Keys (PRODUCTION)

- **Publishable Key:** `pk_live_51Rvk3IDfc44028kiBicN6ujkqQihwxJemVqPriQyW0UrIf5SCrtDsALluxUP4gaRGT2AqaUaflkjfW6l1MKdtO6N00HG3s9rZX`
- **Pro Price ID:** `price_1RwA92Dfc44028kidd3L70MD`
- **Dashboard:** https://dashboard.stripe.com/apikeys

### Environment Variables (.env)

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Rvk3IDfc44028kiBicN6ujkqQihwxJemVqPriQyW0UrIf5SCrtDsALluxUP4gaRGT2AqaUaflkjfW6l1MKdtO6N00HG3s9rZX
VITE_STRIPE_PRO_PRICE_ID=price_1RwA92Dfc44028kidd3L70MD
```

---

## 📧 EmailJS Configuration

### Service Details

- **Service ID:** `service_uew38lk`
- **Template ID:** `template_khnznxz`
- **Public Key:** `2-I9nawBM_XTK-_Lx`
- **Dashboard:** https://dashboard.emailjs.com/

### Environment Variables (.env)

```bash
VITE_EMAILJS_SERVICE_ID=service_uew38lk
VITE_EMAILJS_TEMPLATE_ID=template_khnznxz
VITE_EMAILJS_PUBLIC_KEY=2-I9nawBM_XTK-_Lx
```

---

## 🚀 Deployment Information

### Firebase Hosting

- **Live URL:** https://quickbill-app-b2467.web.app
- **Deploy Command:** `firebase deploy --only hosting`

### GitHub Repository

- **Repository:** QuickBill
- **Owner:** bitquan
- **Branch:** main

---

## 👤 Admin Account Details

### Admin Email

- **Admin Email:** admin@quickbill.com (or admin@quickbill.dev)
- **Pro Status:** Automatically detected for admin emails

---

## 🔧 Complete Environment File (.env)

```bash
# Stripe Configuration
# Get these from https://dashboard.stripe.com/apikeys

# FOR PRODUCTION - Use Stripe Live Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Rvk3IDfc44028kiBicN6ujkqQihwxJemVqPriQyW0UrIf5SCrtDsALluxUP4gaRGT2AqaUaflkjfW6l1MKdtO6N00HG3s9rZX
VITE_STRIPE_PRO_PRICE_ID=price_1RwA92Dfc44028kidd3L70MD

# Email Service Configuration (EmailJS)
# Get these from https://dashboard.emailjs.com/
VITE_EMAILJS_SERVICE_ID=service_uew38lk
VITE_EMAILJS_TEMPLATE_ID=template_khnznxz
VITE_EMAILJS_PUBLIC_KEY=2-I9nawBM_XTK-_Lx

# Firebase Configuration (already set up in firebase config)
# These are already configured in your Firebase config file
```

---

## 🔒 Security Notes

1. **Keep this file secure** - Contains production API keys
2. **Never commit to GitHub** - API keys should be in environment variables only
3. **Regenerate keys if compromised** - All services allow key regeneration
4. **Backup regularly** - Keep this configuration updated

---

## 📋 Quick Setup Instructions

### For New Environment:

1. Copy the `.env` file contents above
2. Set up Firebase project with the provided config
3. Configure Stripe webhook endpoints if needed
4. Test EmailJS integration with the template
5. Deploy to Firebase hosting

### Key Commands:

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Push to GitHub
git add .
git commit -m "Update configuration"
git push origin main
```

---

**🔐 End of Configuration Backup**