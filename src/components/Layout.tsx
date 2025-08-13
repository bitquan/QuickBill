import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import MobileBottomNav from "./MobileBottomNav";
import storageService from "../services/storage";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();
  const remainingInvoices = storageService.getRemainingInvoices();

  const isActivePath = (path: string) => {
    if (path === "/" && location.pathname === "/dashboard") return true;
    return location.pathname === path;
  };

  // Different navigation for authenticated vs anonymous users
  const getNavItems = () => {
    if (currentUser) {
      // Authenticated user - full pro navigation
      return [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/create", label: "Create" },
        { path: "/history", label: "History" },
        { path: "/more", label: "More" },
      ];
    } else {
      // Anonymous user - freemium navigation focused on conversion
      return [
        { path: "/home", label: "Home" },
        { path: "/create", label: "Try Free" },
        { path: "/login", label: "Sign In" },
        { path: "/signup", label: "Get Pro" },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-xl sm:text-2xl font-bold text-primary-600"
              >
                QuickBill
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActivePath(path)
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {label}
                </Link>
              ))}

              {/* Free tier indicator for anonymous users */}
              {!currentUser && (
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                  {remainingInvoices} free invoices left
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActivePath(path)
                    ? "bg-primary-50 border-primary-500 text-primary-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content with padding for fixed header and bottom nav */}
      <main className="pt-16 pb-16 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
