import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import OptionalAuthRoute from "./components/OptionalAuthRoute";
import EnhancedWelcome from "./pages/EnhancedWelcome";
import Home from "./pages/Home";
import More from "./pages/More";
import AdminDashboard from "./pages/AdminDashboard";
import BusinessDashboard from "./screens/BusinessDashboard";
import InvoiceCreator from "./screens/InvoiceCreator";
import InvoiceHistory from "./screens/InvoiceHistory";
import AgreementSigning from "./screens/AgreementSigning";
import PaymentSuccess from "./screens/PaymentSuccess";
import PaymentCancelled from "./screens/PaymentCancelled";
import Login from "./screens/auth/Login";
import Signup from "./screens/auth/Signup";
import ForgotPassword from "./screens/auth/ForgotPassword";
import analytics from "./services/analytics";

export default function App() {
  // Initialize analytics on app start
  useEffect(() => {
    analytics.init();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/sign-agreement/:agreementId"
              element={<AgreementSigning />}
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />

            {/* Enhanced Welcome page for new users */}
            <Route path="/welcome" element={<EnhancedWelcome />} />

            {/* Free tier routes (no authentication required) */}
            <Route
              path="/create"
              element={
                <OptionalAuthRoute>
                  <Layout>
                    <InvoiceCreator />
                  </Layout>
                </OptionalAuthRoute>
              }
            />
            <Route
              path="/edit/:invoiceId"
              element={
                <OptionalAuthRoute>
                  <Layout>
                    <InvoiceCreator />
                  </Layout>
                </OptionalAuthRoute>
              }
            />

            {/* Protected routes (require authentication) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BusinessDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InvoiceHistory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/more"
              element={
                <ProtectedRoute>
                  <Layout>
                    <More />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default route - redirect to enhanced welcome */}
            <Route path="/" element={<EnhancedWelcome />} />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
