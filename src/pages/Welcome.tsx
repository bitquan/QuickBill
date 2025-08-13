import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import storageService from "../services/storage";

export default function Welcome() {
  const remainingInvoices = storageService.getRemainingInvoices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">QuickBill</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create professional invoices in minutes. Start free, upgrade when
            you need more.
          </p>

          {/* Free tier status */}
          <div className="bg-white rounded-lg p-6 shadow-md max-w-md mx-auto mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Free Account
            </h3>
            <p className="text-gray-600 mb-4">
              You have{" "}
              <span className="font-bold text-blue-600">
                {remainingInvoices}
              </span>{" "}
              free invoices remaining
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((3 - remainingInvoices) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Professional Templates
            </h3>
            <p className="text-gray-600">
              Choose from 10+ industry-specific templates designed for your
              business
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Integration
            </h3>
            <p className="text-gray-600">
              Send invoices directly to clients with professional email
              templates
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mobile Friendly
            </h3>
            <p className="text-gray-600">
              Create and manage invoices on any device, anywhere
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Link to="/create">
              <Button size="lg" className="px-8">
                Create Your First Invoice
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary" size="lg" className="px-8">
                I Have an Account
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            No account required to start • Upgrade to Pro for unlimited invoices
            at $4.99/month
          </p>
        </div>

        {/* Pro features teaser */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-md">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready for More? Upgrade to Pro
            </h3>
            <p className="text-gray-600">
              Unlock unlimited invoices and premium features for just
              $4.99/month
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">What you get:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Unlimited invoices
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Email integration
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cloud storage & sync
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No watermarks on PDFs
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Perfect for:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Freelancers & Consultants</li>
                <li>• Service Providers</li>
                <li>• Contractors & Tradespeople</li>
                <li>• Creative Professionals</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link to="/signup">
              <Button className="px-8">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
