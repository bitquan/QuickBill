# 📧 EMAILJS SETUP FOR QUICKBILL LAUNCH

## Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Sign up for free account (1000 emails/month free)
3. Verify your email address

## Step 2: Create Email Service

1. Go to Email Services tab
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. Follow connection steps
5. Copy the Service ID

## Step 3: Create Email Template

1. Go to Email Templates tab
2. Click "Create New Template"
3. Template Name: "QuickBill Invoice"
4. Use this template content:

**Subject:** Invoice {{invoice_number}} from {{business_name}}

**Content:**

```
Hello {{to_name}},

Please find attached your invoice {{invoice_number}} for {{total_amount}}.

Invoice Details:
- Invoice Number: {{invoice_number}}
- Date: {{invoice_date}}
- Amount: {{total_amount}}
- Due Date: {{due_date}}

{{message}}

Best regards,
{{business_name}}
{{business_email}}

---
This invoice was sent via QuickBill
```

5. Save and copy Template ID

## Step 4: Get Public Key

1. Go to Account > General
2. Copy your Public Key

## Step 5: Update Environment File

Replace these in your .env file:

```
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## Step 6: Test Email Sending

1. Create test invoice in QuickBill
2. Try sending email to yourself
3. Verify email arrives correctly

---

## Free Tier Limits

- 1000 emails/month free
- Upgrade to paid plan for more volume
- Perfect for launching and early customers
