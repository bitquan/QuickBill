import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const status = searchParams.get("redirect_status");

  useEffect(() => {
    // In a real app, you'd verify the payment with your backend here
    console.log("Payment completed:", { paymentIntent, status });
  }, [paymentIntent, status]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your payment has been processed successfully. You will receive a
            confirmation email shortly.
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

        <div className="mt-6 text-xs text-gray-500">
          <p>Payment ID: {paymentIntent || "N/A"}</p>
          <p>Status: {status || "completed"}</p>
        </div>
      </div>
    </div>
  );
}
