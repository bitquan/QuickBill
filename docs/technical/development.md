# 🛠️ Development Setup & Guidelines

This document provides comprehensive setup instructions and development guidelines for QuickBill contributors and maintainers.

---

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **VS Code**: Recommended IDE

### **Initial Setup**
```bash
# Clone the repository
git clone https://github.com/bitquan/QuickBill.git
cd QuickBill

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

---

## 🔧 **Environment Configuration**

### **Required Environment Variables**
Create `.env.local` file with the following variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe Configuration (Use test keys for development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
VITE_STRIPE_PRO_PRICE_ID=price_your_test_price_id

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Development Environment
VITE_ENVIRONMENT=development
```

### **Firebase Setup for Development**
1. Create a new Firebase project for development
2. Enable Authentication with Email/Password and Google
3. Create Firestore database in test mode
4. Copy configuration keys to `.env.local`

---

## 📁 **Project Structure**

### **Directory Overview**
```
QuickBill/
├── docs/                    # Documentation (this folder)
├── public/                  # Static assets
├── src/                     # Source code
│   ├── app/                 # App-level configuration
│   ├── assets/              # Images, icons, etc.
│   ├── components/          # Reusable UI components
│   │   ├── Auth/            # Authentication components
│   │   ├── billing/         # Subscription management
│   │   ├── forms/           # Form components
│   │   └── ui/              # Base UI components
│   ├── config/              # Configuration files
│   ├── contexts/            # React context providers
│   ├── data/                # Static data and constants
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Top-level route components
│   ├── screens/             # Main application screens
│   ├── services/            # Business logic and API calls
│   ├── types/               # TypeScript type definitions
│   ├── ui/                  # UI component library
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component
│   └── main.tsx             # App entry point
├── scripts/                 # Build and utility scripts
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── firebase.json            # Firebase configuration
```

### **Import Path Conventions**
```typescript
// Absolute imports from src/
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { InvoiceData } from '@/types/invoice';

// Relative imports for local files
import './Component.css';
import { helper } from '../utils/helpers';
```

---

## 🎨 **Code Style & Standards**

### **TypeScript Guidelines**
```typescript
// ✅ Good: Explicit interfaces
interface InvoiceFormProps {
  invoice: InvoiceData;
  onSubmit: (data: InvoiceData) => Promise<void>;
  loading?: boolean;
}

// ✅ Good: Functional components with proper typing
const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  invoice, 
  onSubmit, 
  loading = false 
}) => {
  // Component implementation
};

// ✅ Good: Custom hooks with proper types
const useInvoiceForm = (initialData: InvoiceData) => {
  const [data, setData] = useState<InvoiceData>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  return { data, errors, setData, setErrors };
};
```

### **Component Structure**
```typescript
// Standard component structure
import React, { useState, useEffect } from 'react';
import { SomeExternalLib } from 'external-lib';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ComponentData } from '@/types/component';

// Types and interfaces
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// Main component
const Component: React.FC<ComponentProps> = ({ prop1, prop2 = 0 }) => {
  // Hooks
  const { currentUser } = useAuth();
  const [state, setState] = useState<ComponentData | null>(null);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = useCallback((data: ComponentData) => {
    // Handler logic
  }, [dependencies]);
  
  // Early returns
  if (!currentUser) {
    return <div>Please log in</div>;
  }
  
  // Main render
  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

### **Naming Conventions**
```typescript
// Components: PascalCase
const InvoiceCreator = () => {};
const UserProfile = () => {};

// Files: PascalCase for components, camelCase for utilities
InvoiceCreator.tsx
userHelpers.ts
authService.ts

// Variables and functions: camelCase
const userName = 'john';
const calculateTotal = () => {};

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_INVOICES_FREE = 3;

// Types and interfaces: PascalCase
interface UserData {}
type InvoiceStatus = 'draft' | 'sent' | 'paid';
```

---

## 🧪 **Testing Guidelines**

### **Testing Strategy**
```typescript
// Unit tests for utilities and hooks
// utils/__tests__/helpers.test.ts
describe('calculateInvoiceTotal', () => {
  it('should calculate total with tax', () => {
    const items = [{ quantity: 2, unitPrice: 100 }];
    const taxRate = 10;
    const result = calculateInvoiceTotal(items, taxRate);
    expect(result).toBe(220);
  });
});

// Component tests with React Testing Library
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// Integration tests for features
// features/__tests__/invoiceCreation.test.tsx
describe('Invoice Creation Flow', () => {
  it('should create invoice successfully', async () => {
    // Test complete user flow
  });
});
```

### **Test Commands**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (future)
npm run test:e2e
```

---

## 🔍 **Debugging & Development Tools**

### **Browser Development**
```typescript
// React Developer Tools
// - Install React DevTools browser extension
// - Use to inspect component state and props

// Redux DevTools (if using Redux)
// - Monitor state changes and actions

// Firebase DevTools
// - Monitor Firestore real-time updates
// - Debug authentication flows
```

### **VS Code Configuration**
Recommended VS Code extensions:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

VS Code settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## 🔨 **Available Scripts**

### **Development Scripts**
```bash
# Start development server
npm run dev                 # Vite dev server on http://localhost:5173

# Build for production
npm run build              # Create optimized production build

# Preview production build
npm run preview            # Preview built app locally

# Type checking
npm run type-check         # TypeScript compilation check
```

### **Code Quality Scripts**
```bash
# Linting
npm run lint               # Run ESLint
npm run lint:fix           # Fix auto-fixable ESLint issues

# Formatting
npm run format             # Run Prettier
npm run format:check       # Check if files are formatted

# Combined quality check
npm run quality            # Run all quality checks
```

### **Firebase Scripts**
```bash
# Firebase deployment
npm run deploy             # Build and deploy to Firebase hosting

# Firebase emulators
npm run firebase:emulator  # Start Firebase emulator suite
npm run firebase:seed      # Seed test data in emulators
```

---

## 🌐 **API Integration Guidelines**

### **Service Layer Pattern**
```typescript
// services/apiService.ts
class ApiService {
  private baseURL = import.meta.env.VITE_API_BASE_URL;
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }
    
    return response.json();
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
```

### **Error Handling**
```typescript
// utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError('UNKNOWN_ERROR', error.message);
  }
  
  return new AppError('UNKNOWN_ERROR', 'An unexpected error occurred');
};
```

---

## 🎯 **Performance Guidelines**

### **React Performance**
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Use useCallback for event handlers
const Component = () => {
  const handleClick = useCallback((id: string) => {
    // Handler logic
  }, [dependency]);
  
  return <Button onClick={handleClick} />;
};

// Use useMemo for expensive calculations
const Component = ({ items }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  return <div>{expensiveValue}</div>;
};
```

### **Bundle Optimization**
```typescript
// Lazy load components
const LazyComponent = React.lazy(() => import('./ExpensiveComponent'));

// Code splitting by routes
const routes = [
  {
    path: '/dashboard',
    component: React.lazy(() => import('./pages/Dashboard')),
  },
  {
    path: '/invoices',
    component: React.lazy(() => import('./pages/Invoices')),
  },
];

// Dynamic imports for features
const loadFeature = async () => {
  const { AdvancedFeature } = await import('./features/AdvancedFeature');
  return AdvancedFeature;
};
```

---

## 🔐 **Security Guidelines**

### **Environment Variables**
```typescript
// ✅ Good: Use environment variables for secrets
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ Bad: Never hardcode secrets
const apiKey = 'sk_live_abc123...'; // DON'T DO THIS

// ✅ Good: Validate environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
] as const;

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### **Input Validation**
```typescript
// Validate user inputs
import { z } from 'zod';

const invoiceSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  clientName: z.string().min(1, 'Client name is required'),
  amount: z.number().positive('Amount must be positive'),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })).min(1, 'At least one item is required'),
});

const validateInvoice = (data: unknown) => {
  return invoiceSchema.parse(data);
};
```

---

## 📚 **Learning Resources**

### **Technology Documentation**
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Vite**: https://vitejs.dev/guide/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Firebase**: https://firebase.google.com/docs

### **Internal Documentation**
- [Architecture Overview](./architecture.md)
- [Setup Instructions](../setup/README.md)
- [Deployment Guide](../deployment/README.md)

---

## 🤝 **Contributing Guidelines**

### **Pull Request Process**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes following the style guide
4. **Test** your changes thoroughly
5. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
6. **Push** to your branch (`git push origin feature/amazing-feature`)
7. **Create** a Pull Request

### **Commit Message Format**
```
type(scope): description

feat(auth): add Google OAuth integration
fix(invoice): resolve PDF generation issue
docs(readme): update setup instructions
style(components): fix ESLint warnings
refactor(services): improve error handling
test(utils): add unit tests for helpers
```

### **Code Review Checklist**
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance impact is considered

---

**Last Updated**: August 14, 2025  
**Development Version**: 1.0.0  
**Contributors**: Open to community contributions
