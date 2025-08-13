import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Return to QuickBill
          </Button>
          <Button
            variant="outline"
            onClick={() => window.close()}
            className="w-full"
          >
            Close Window
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            You can retry the payment anytime by clicking the payment link
            again.
          </p>
        </div>
      </div>
    </div>
  );
}
