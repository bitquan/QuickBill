import { useState } from "react";
import { Button } from "./Button";
import { stripeService } from "../services/stripeService";
import toast from "react-hot-toast";

interface EnhancedUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  invoicesUsed: number;
  maxInvoices: number;
  context?: "limit_reached" | "feature_locked" | "watermark";
}

export default function EnhancedUpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  invoicesUsed,
  maxInvoices: _maxInvoices,
  context = "limit_reached",
}: EnhancedUpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const result = await stripeService.createCheckoutSession();

      if ("error" in result) {
        toast.error(result.error);
      } else {
        onUpgrade();
      }
    } catch (error) {
      toast.error("Failed to start checkout. Please try again.");
      console.error("Upgrade error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getContextContent = () => {
    switch (context) {
      case "watermark":
        return {
          title: "Remove Watermark & Go Professional",
          subtitle: "Create branded invoices that build trust with clients",
          icon: "🎨",
        };
      case "feature_locked":
        return {
          title: "Unlock Professional Features",
          subtitle: "Access industry templates and advanced customization",
          icon: "🔓",
        };
      default:
        return {
          title: "You're Ready to Go Pro!",
          subtitle: `You've created ${invoicesUsed} invoices - time to unlock unlimited potential`,
          icon: "🚀",
        };
    }
  };

  const contextContent = getContextContent();

  const proFeatures = [
    {
      icon: "∞",
      title: "Unlimited Invoices",
      description: "Create as many invoices as your business needs",
      value: "No limits",
    },
    {
      icon: "🎨",
      title: "Your Brand, Your Way",
      description: "Add your logo and customize colors",
      value: "Professional image",
    },
    {
      icon: "🌩️",
      title: "Cloud Sync & Backup",
      description: "Access your invoices from any device",
      value: "Never lose data",
    },
    {
      icon: "📧",
      title: "Email Integration",
      description: "Send invoices directly to clients",
      value: "Get paid faster",
    },
    {
      icon: "📊",
      title: "Business Analytics",
      description: "Track revenue and performance",
      value: "Grow smarter",
    },
    {
      icon: "⚡",
      title: "Priority Support",
      description: "Get help when you need it most",
      value: "24-48h response",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      business: "Graphic Designer",
      quote: "Branded invoices helped me raise my rates by 30%",
      rating: 5,
    },
    {
      name: "Mike R.",
      business: "Contractor",
      quote: "Cloud sync saved me when my laptop crashed",
      rating: 5,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="text-4xl mb-4">{contextContent.icon}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {contextContent.title}
          </h2>
          <p className="text-gray-600 text-lg">{contextContent.subtitle}</p>
        </div>

        <div className="p-8">
          {/* Value Proposition */}
          <div className="text-center mb-8">
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-green-800 mb-2">
                💰 ROI Calculator: Your Investment vs Returns
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">$4.99</div>
                  <div className="text-sm text-gray-600">Monthly cost</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">+25%</div>
                  <div className="text-sm text-gray-600">Revenue increase</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    $200+
                  </div>
                  <div className="text-sm text-gray-600">
                    Extra monthly revenue*
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                *Average based on 10,000+ users
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {proFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="text-2xl">{feature.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {feature.description}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {feature.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4 text-center">
              What Our Pro Users Say
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {testimonial.business}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className="flex text-yellow-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic">
                    "{testimonial.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
              <div className="text-4xl font-bold mb-2">
                $4.99<span className="text-lg">/month</span>
              </div>
              <div className="text-blue-100 mb-4">
                Cancel anytime • 30-day money-back guarantee
              </div>
              <div className="text-sm bg-white/20 rounded-lg p-3">
                <div className="font-medium">
                  Limited Time: First Month 50% Off!
                </div>
                <div className="text-xs">Start today for just $2.49</div>
              </div>
            </div>
          </div>

          {/* Urgency */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 text-center">
            <div className="text-orange-800">
              <div className="font-bold">⏰ 847 users upgraded this week</div>
              <div className="text-sm">
                Join the thousands already growing their business with QuickBill
                Pro
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Maybe Later
            </Button>
            <Button
              variant="primary"
              onClick={handleUpgrade}
              className="flex-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "🚀 Upgrade to Pro Now"
              )}
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="text-center mt-6">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="mr-1">🔒</span>
                Secure Payment
              </div>
              <div className="flex items-center">
                <span className="mr-1">💳</span>
                Stripe Protected
              </div>
              <div className="flex items-center">
                <span className="mr-1">📞</span>
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
