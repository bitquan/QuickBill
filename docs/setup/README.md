# 🚀 Setup & Configuration Documentation

This section contains all the setup and configuration documentation for QuickBill.

---

## 📋 **Setup Checklist**

### **Prerequisites**
- [ ] Node.js 18+ installed
- [ ] Git repository cloned
- [ ] Firebase account created
- [ ] Stripe account created
- [ ] EmailJS account created

### **Configuration Files**
- [ ] [Complete Configuration](./configuration.md) - All API keys and settings
- [ ] [Firebase Setup](./firebase-setup.md) - Database and hosting
- [ ] [Stripe Integration](./stripe-setup.md) - Payment processing
- [ ] [EmailJS Configuration](./emailjs-setup.md) - Email services

---

## 🔧 **Quick Setup Process**

### **1. Environment Setup**
```bash
# Clone repository
git clone https://github.com/bitquan/QuickBill.git
cd QuickBill

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### **2. Configure Services**
1. **Firebase**: Follow [Firebase Setup](./firebase-setup.md)
2. **Stripe**: Follow [Stripe Setup](./stripe-setup.md)
3. **EmailJS**: Follow [EmailJS Setup](./emailjs-setup.md)

### **3. Development**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

---

## 📁 **Configuration Files**

| File | Purpose | Status |
|------|---------|--------|
| [configuration.md](./configuration.md) | Master configuration backup | ✅ Complete |
| [stripe-setup.md](./stripe-setup.md) | Stripe payment integration | ✅ Complete |
| [stripe-quick-start.md](./stripe-quick-start.md) | Quick Stripe setup | ✅ Complete |
| [stripe-launch-setup.md](./stripe-launch-setup.md) | Production Stripe setup | ✅ Complete |
| [email-setup.md](./email-setup.md) | Email service configuration | ✅ Complete |
| [emailjs-setup.md](./emailjs-setup.md) | EmailJS specific setup | ✅ Complete |
| [environment-setup.md](./environment-setup.md) | Development environment | ✅ Complete |
| [detailed-setup.md](./detailed-setup.md) | Comprehensive setup guide | ✅ Complete |

---

## 🔐 **Security Considerations**

### **API Key Management**
- Never commit production API keys to version control
- Use environment variables for all sensitive data
- Rotate keys regularly for security
- Keep [configuration.md](./configuration.md) secure and backed up

### **Environment Variables**
```bash
# Required for production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PRO_PRICE_ID=price_...
VITE_EMAILJS_SERVICE_ID=service_...
VITE_EMAILJS_TEMPLATE_ID=template_...
VITE_EMAILJS_PUBLIC_KEY=...
```

---

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Environment variables not loading**: Check `.env.local` file exists and is properly formatted
2. **Firebase connection errors**: Verify Firebase config in `src/config/firebase.ts`
3. **Stripe payments failing**: Confirm live keys are configured correctly
4. **Email sending issues**: Test EmailJS template and service configuration

### **Support Resources**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [EmailJS Documentation](https://www.emailjs.com/docs)

---

**Last Updated**: August 14, 2025  
**Status**: ✅ Production Ready
