import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import storageService from "../services/storage";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  benefit: string;
  icon: string;
}

export default function FreeUserOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const remainingInvoices = storageService.getRemainingInvoices();

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to QuickBill! 🎉",
      description: "You have 3 free invoices to try our professional templates",
      action: "Get Started",
      benefit: "Start earning faster",
      icon: "🚀",
    },
    {
      id: "value",
      title: "See the Difference",
      description: "Professional invoices get paid 40% faster than basic bills",
      action: "Create First Invoice",
      benefit: "Get paid sooner",
      icon: "⚡",
    },
    {
      id: "templates",
      title: "Choose Your Template",
      description: "Industry-specific templates help you charge premium rates",
      action: "Browse Templates",
      benefit: "Increase your rates",
      icon: "💰",
    },
  ];

  useEffect(() => {
    // Show onboarding if user is new (has 3 invoices remaining)
    if (remainingInvoices === 3) {
      const hasSeenOnboarding = localStorage.getItem(
        "quickbill_onboarding_seen"
      );
      if (!hasSeenOnboarding) {
        setIsVisible(true);
      }
    }
  }, [remainingInvoices]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("quickbill_onboarding_seen", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Progress Bar */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Skip
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">{step.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step.title}
            </h2>
            <p className="text-gray-600">{step.description}</p>
          </div>

          {/* Step-specific content */}
          {currentStep === 0 && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {remainingInvoices} Free Invoices
                </div>
                <div className="text-sm text-green-700">
                  No credit card required
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Basic invoice</span>
                <span className="text-gray-500">30 days to pay</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-900 font-medium">
                  QuickBill invoice
                </span>
                <span className="text-blue-600 font-bold">18 days to pay</span>
              </div>
              <div className="text-center text-sm text-gray-600">
                ⬆️ 40% faster payment with professional design
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">💻</div>
                <div className="text-sm font-medium">Freelancer</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">🔨</div>
                <div className="text-sm font-medium">Contractor</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">🧹</div>
                <div className="text-sm font-medium">Service</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm font-medium">Consultant</div>
              </div>
            </div>
          )}

          {/* Benefit callout */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-blue-600 font-medium">
                Expected Result:
              </div>
              <div className="text-blue-900 font-bold">{step.benefit}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {currentStep === steps.length - 1 ? (
              <Link to="/create" onClick={handleComplete}>
                <Button size="lg" className="w-full">
                  {step.action} →
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={handleNext} className="w-full">
                {step.action}
              </Button>
            )}

            <button
              onClick={handleSkip}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              I'll explore on my own
            </button>
          </div>

          {/* Social proof */}
          <div className="text-center mt-4 text-xs text-gray-500">
            Join 10,000+ users who increased revenue by 25%
          </div>
        </div>
      </div>
    </div>
  );
}
