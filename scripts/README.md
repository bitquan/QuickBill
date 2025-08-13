# Firebase Scripts

This directory contains scripts for setting up and managing the QuickBill Firebase backend.

## Setup

1. **Get Service Account Key**:

   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `service-account-key.json` in this directory

2. **Install Firebase CLI**:

   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**:

   ```bash
   firebase login
   ```

4. **Initialize Firebase Project**:
   ```bash
   firebase use --add
   ```

## Scripts

### Database Initialization

```bash
npm run firebase:init
```

Sets up the initial database structure with:

- Subscription plans (Free, Pro, Business)
- Default business settings template
- App configuration

### Seed Test Data

```bash
npm run firebase:seed
```

Creates test data for development:

- Test user account
- Sample business information
- Example invoices
- Test subscription

### Clean Database

```bash
npm run firebase:clean
```

⚠️ **Warning**: This will delete all user data! Use only in development.

### Deploy Firebase Rules & Indexes

```bash
npm run firebase:deploy
```

Deploys:

- Firestore security rules
- Database indexes
- Hosting configuration

### Local Development

```bash
npm run firebase:emulator
```

Starts Firebase emulators for local development:

- Auth emulator (port 9099)
- Firestore emulator (port 8080)
- Hosting emulator (port 5000)

## Security Rules

The Firestore security rules ensure:

- Users can only access their own data
- Proper authentication is required
- Subscription plans are read-only for users
- Admin operations are protected

## Collections Structure

### users

```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  lastLoginAt: timestamp,
  subscription: {
    planId: string,
    status: string,
    invoicesThisMonth: number
  }
}
```

### invoices

```javascript
{
  invoiceNumber: string,
  userId: string,
  client: object,
  items: array,
  subtotal: number,
  tax: number,
  total: number,
  status: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### businessInfo

```javascript
{
  name: string,
  email: string,
  phone: string,
  address: string,
  currency: string,
  taxRate: number,
  theme: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### subscriptionPlans

```javascript
{
  id: string,
  name: string,
  price: number,
  currency: string,
  features: object,
  active: boolean
}
```
