# 🔥 Firebase Setup Guide

**Complete Firebase configuration for QuickBill SaaS Invoice Generator**

---

## 🎯 **Overview**

This guide covers the complete Firebase setup for QuickBill, including Authentication, Firestore database, hosting, and security rules configuration.

---

## 📋 **Prerequisites**

- Google account with Firebase access
- QuickBill project repository cloned
- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)

---

## 🚀 **Firebase Project Setup**

### **1. Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Project name: `quickbill-app` (or your preference)
4. Enable Google Analytics (recommended)
5. Choose your analytics account

### **2. Enable Services**

Navigate to your Firebase project and enable:

- ✅ **Authentication** → Sign-in method → Email/Password
- ✅ **Firestore Database** → Create database → Start in test mode
- ✅ **Hosting** → Get started
- ✅ **Storage** (optional for file uploads)

---

## 🔐 **Authentication Setup**

### **Enable Email/Password Authentication**

1. Go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Enable both options:
   - Email/Password ✅
   - Email link (passwordless sign-in) ✅
4. Save configuration

### **Configure Authorized Domains**

Add your domains:

- `localhost` (for development)
- `quickbill-app-b2467.web.app` (your hosting domain)
- Your custom domain (if applicable)

---

## 📊 **Firestore Database Setup**

### **Database Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // User's invoices
      match /invoices/{invoiceId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // User's clients
      match /clients/{clientId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // User's templates
      match /templates/{templateId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Subscription data
    match /subscriptions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public invoice sharing (for client access)
    match /public_invoices/{invoiceId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### **Database Indexes**

Create these composite indexes in Firestore:

1. **Collection**: `users/{userId}/invoices`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
2. **Collection**: `users/{userId}/invoices`
   - Fields: `status` (Ascending), `dueDate` (Ascending)

---

## 🌐 **Hosting Setup**

### **Initialize Hosting**

```bash
# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Choose existing project: quickbill-app
# Public directory: dist
# Single-page app: Yes
# Overwrite index.html: No
```

### **Deploy to Hosting**

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

---

## 🔧 **Configuration Files**

### **Firebase Config (src/config/firebase.ts)**

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'quickbill-app.firebaseapp.com',
  projectId: 'quickbill-app',
  storageBucket: 'quickbill-app.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

### **Firebase Hosting Config (firebase.json)**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

## 🔒 **Security Configuration**

### **Environment Variables**

Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=quickbill-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quickbill-app
VITE_FIREBASE_STORAGE_BUCKET=quickbill-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### **Security Rules Testing**

```bash
# Install Firebase emulator
npm install -g firebase-tools

# Start emulator
firebase emulators:start --only firestore

# Test rules
firebase emulators:exec --only firestore "npm test"
```

---

## 📈 **Analytics & Monitoring**

### **Enable Performance Monitoring**

```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

### **Enable Analytics**

```typescript
import { getAnalytics } from 'firebase/analytics';

const analytics = getAnalytics(app);
```

---

## 🚀 **Deployment Commands**

### **Development**

```bash
npm run dev
```

### **Production Build**

```bash
npm run build
firebase deploy
```

### **Deploy with Custom Domain**

```bash
firebase hosting:channel:deploy live --only hosting
```

---

## 🔗 **Important Links**

- **Firebase Console**: https://console.firebase.google.com/project/quickbill-app
- **Live Application**: https://quickbill-app-b2467.web.app
- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Rules Reference**: https://firebase.google.com/docs/firestore/security/rules-conditions

---

## 📞 **Support**

For Firebase-specific issues:

1. Check [Firebase Status Page](https://status.firebase.google.com/)
2. Review [Firebase Documentation](https://firebase.google.com/docs)
3. Check project configuration in Firebase Console

---

**Last Updated**: August 15, 2025  
**Status**: ✅ Production Ready  
**Version**: 1.0.0
