import { Button } from "../components/Button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        {/* Hero Section */}
        <div className="py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            <span className="block">Quick and Professional</span>
            <span className="block text-primary-600 mt-2">
              Invoice Generator
            </span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-500 max-w-md mx-auto md:max-w-3xl">
            Create, manage, and send professional invoices in minutes. Perfect
            for freelancers and small businesses.
          </p>

          {/* Enhanced feature highlights */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              📸 Portfolio Integration
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              📅 Seasonal Pricing
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              🎨 Customizable Templates
            </span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              💳 Payment Links
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/create" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                Create New Invoice
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mt-6 text-sm text-gray-500">
            Join 10,000+ businesses creating professional invoices • Free tier:
            3 invoices • Pro: $9.99/month
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 - Enhanced Templates */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="text-primary-600 mb-4">
              <div className="text-3xl">📋</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Industry-Specific Templates
            </h3>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              Choose from 15+ professional templates for electricians,
              contractors, cleaners, photographers, and more. Each with pricing
              variations and terms.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                ⚡ Electrician
              </span>
              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                🔨 Contractor
              </span>
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                📸 Photography
              </span>
            </div>
          </div>

          {/* Feature 2 - Smart Pricing */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="text-primary-600 mb-4">
              <div className="text-3xl">💰</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Smart Pricing Features
            </h3>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              Seasonal pricing, location-based rates, and travel fees. Maximize
              revenue with intelligent pricing suggestions.
            </p>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div>• Winter rates: +15% for high demand</div>
              <div>• Location zones with distance pricing</div>
              <div>• Automatic travel fee calculations</div>
            </div>
          </div>

          {/* Feature 3 - Portfolio Integration */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="text-primary-600 mb-4">
              <div className="text-3xl">📸</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Portfolio & Testimonials
            </h3>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              Showcase your work with before/after photos, client testimonials,
              and professional certifications.
            </p>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div>• Work galleries with project values</div>
              <div>• Client reviews and star ratings</div>
              <div>• Professional license displays</div>
            </div>
          </div>

          {/* Feature 4 - Payment Integration */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="text-primary-600 mb-4">
              <div className="text-3xl">💳</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Payment & Agreements
            </h3>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              Generate secure payment links and digital agreements. Get paid
              faster with integrated Stripe payments.
            </p>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div>• Secure Stripe payment links</div>
              <div>• Digital agreement signing</div>
              <div>• Email invoice delivery</div>
            </div>
          </div>

          {/* Feature 5 - Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="text-primary-600 mb-4">
              <div className="text-3xl">📊</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Business Analytics
            </h3>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              Track revenue, popular templates, and business insights. Make
              data-driven decisions for growth.
            </p>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div>• Revenue tracking and trends</div>
              <div>• Template performance analytics</div>
              <div>• Client activity insights</div>
            </div>
          </div>

          {/* Feature 6 - Customization */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="text-primary-600 mb-4">
              <div className="text-3xl">🎨</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Pro Customization
            </h3>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              Customize templates with your branding, pricing rules, and
              personalized service items.
            </p>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div>• Custom brand colors and logos</div>
              <div>• Personalized pricing rules</div>
              <div>• Template analytics and insights</div>
            </div>
          </div>
        </div>

        {/* Pro Features Highlight */}
        <div className="mt-16 sm:mt-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            🚀 QuickBill Pro Features
          </h2>
          <p className="text-lg mb-6 text-purple-100">
            Unlock the full potential of your invoicing with professional
            features that justify themselves with just one client.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎯 What's Included</h3>
              <ul className="text-sm space-y-1 text-purple-100">
                <li>• Unlimited invoices and storage</li>
                <li>• Industry-specific templates with portfolios</li>
                <li>• Seasonal and location-based pricing</li>
                <li>• Custom branding and logo upload</li>
                <li>• Payment links and digital agreements</li>
                <li>• Business analytics and insights</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">💰 Business Impact</h3>
              <ul className="text-sm space-y-1 text-purple-100">
                <li>• +40% higher conversion with portfolios</li>
                <li>• +25% revenue with seasonal pricing</li>
                <li>• -60% time savings with templates</li>
                <li>• Professional image with branded invoices</li>
                <li>• Faster payments with integrated links</li>
                <li>• Legal protection with digital agreements</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              Only $9.99/month • Cancel anytime • 3 free invoices to start
            </p>
            <Link to="/create" className="inline-block">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-50 px-8"
              >
                Start Creating Invoices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
