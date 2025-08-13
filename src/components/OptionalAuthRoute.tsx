import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import storageService from "../services/storage";

interface OptionalAuthRouteProps {
  children: React.ReactNode;
}

// This component allows access for both authenticated and anonymous users
// Used for freemium features where users can try before signing up
export default function OptionalAuthRoute({
  children,
}: OptionalAuthRouteProps) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user has exceeded free limit and needs to authenticate
  const userData = storageService.getUserData();
  const invoiceCount = storageService.getAllInvoices().length;

  // If user has 3+ invoices and is not authenticated, force signup
  if (invoiceCount >= 3 && !currentUser && !userData.isPro) {
    return <Navigate to="/signup" replace />;
  }

  return <>{children}</>;
}
