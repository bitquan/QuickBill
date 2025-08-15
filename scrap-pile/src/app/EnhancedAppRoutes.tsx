import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load main components for better performance
const Dashboard = lazy(() => import('../screens/Dashboard'));
const InvoiceCreator = lazy(() => import('../screens/InvoiceCreator'));
const InvoiceHistory = lazy(() => import('../screens/InvoiceHistory'));
const InvoicePreview = lazy(() => import('../screens/InvoicePreview'));
const Settings = lazy(() => import('../screens/Settings'));
const Login = lazy(() => import('../screens/Login'));
const Register = lazy(() => import('../screens/Register'));
const PasswordReset = lazy(() => import('../screens/PasswordReset'));

// Lazy load premium features
const AdminDashboard = lazy(() => import('../components/AdminDashboard'));
const EnhancedBusinessDashboard = lazy(() => import('../components/EnhancedBusinessDashboard'));
const EnhancedSettingsHub = lazy(() => import('../components/EnhancedSettingsHub'));
const RecurringInvoiceManager = lazy(() => import('../components/RecurringInvoiceManager'));

// Enhanced loading component with skeleton screens
function PageLoadingFallback({ page }: { page?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {page ? `Loading ${page}...` : 'Loading...'}
        </p>
      </div>
    </div>
  );
}

// Component loading fallback for smaller components
function ComponentLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner />
    </div>
  );
}

// Route protection component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <PageLoadingFallback page="Authentication" />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public route component (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <PageLoadingFallback page="Authentication" />;
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Admin route protection
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <PageLoadingFallback page="Admin Authentication" />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin (this would be checked against user roles in Firebase)
  const isAdmin = currentUser.email === 'admin@quickbill.com' || 
                  currentUser.email?.endsWith('@quickbill.com');

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Suspense fallback={<PageLoadingFallback page="Login" />}>
              <Login />
            </Suspense>
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Suspense fallback={<PageLoadingFallback page="Registration" />}>
              <Register />
            </Suspense>
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/reset-password" 
        element={
          <PublicRoute>
            <Suspense fallback={<PageLoadingFallback page="Password Reset" />}>
              <PasswordReset />
            </Suspense>
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Dashboard" />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/enhanced-dashboard" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Enhanced Dashboard" />}>
              <EnhancedBusinessDashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/create-invoice" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Invoice Creator" />}>
              <InvoiceCreator />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/edit-invoice/:id" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Invoice Editor" />}>
              <InvoiceCreator />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/invoices" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Invoice History" />}>
              <InvoiceHistory />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/invoice/:id" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Invoice Preview" />}>
              <InvoicePreview />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Settings" />}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/enhanced-settings" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Enhanced Settings" />}>
              <EnhancedSettingsHub />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/recurring-invoices" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Recurring Invoices" />}>
              <RecurringInvoiceManager isOpen={true} onClose={() => {}} />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <Suspense fallback={<PageLoadingFallback page="Admin Dashboard" />}>
              <AdminDashboard />
            </Suspense>
          </AdminRoute>
        } 
      />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// Preload critical routes for better performance
export function preloadCriticalRoutes() {
  // Preload the most commonly used routes
  import('../screens/Dashboard');
  import('../screens/InvoiceCreator');
  import('../screens/InvoiceHistory');
  
  // Preload enhanced components for authenticated users
  setTimeout(() => {
    import('../components/EnhancedBusinessDashboard');
    import('../components/EnhancedSettingsHub');
  }, 1000);
}

// Preload route on hover (for navigation links)
export function preloadRoute(routeName: string) {
  switch (routeName) {
    case 'dashboard':
      import('../screens/Dashboard');
      break;
    case 'enhanced-dashboard':
      import('../components/EnhancedBusinessDashboard');
      break;
    case 'create-invoice':
      import('../screens/InvoiceCreator');
      break;
    case 'invoices':
      import('../screens/InvoiceHistory');
      break;
    case 'settings':
      import('../screens/Settings');
      break;
    case 'enhanced-settings':
      import('../components/EnhancedSettingsHub');
      break;
    case 'recurring-invoices':
      import('../components/RecurringInvoiceManager');
      break;
    case 'admin':
      import('../components/AdminDashboard');
      break;
    default:
      break;
  }
}

// Enhanced navigation component with preloading
interface SmartNavLinkProps {
  to: string;
  routeName: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SmartNavLink({ 
  to, 
  routeName, 
  children, 
  className = "", 
  onClick 
}: SmartNavLinkProps) {
  const handleMouseEnter = () => {
    preloadRoute(routeName);
  };

  return (
    <a
      href={to}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

// Route transition wrapper for smooth page transitions
export function RouteTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
}

// Error boundary for route-level error handling
import { Component, ErrorInfo, ReactNode } from 'react';

interface RouteErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class RouteErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  RouteErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route Error:', error, errorInfo);
    
    // Log to error reporting service
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're sorry, but this page encountered an error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
