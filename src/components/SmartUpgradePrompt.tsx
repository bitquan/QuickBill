import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import EnhancedUpgradeModal from "../components/EnhancedUpgradeModal";

interface SmartUpgradePromptProps {
  context:
    | "invoice_limit"
    | "watermark_click"
    | "feature_hover"
    | "value_demonstration";
  children?: React.ReactNode;
}

export default function SmartUpgradePrompt({
  context,
  children,
}: SmartUpgradePromptProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  useEffect(() => {
    // Track when prompts have been shown to avoid spam
    const promptKey = `quickbill_prompt_${context}`;
    const hasShown = localStorage.getItem(promptKey);
    setHasShownPrompt(!!hasShown);
  }, [context]);

  const getPromptContent = () => {
    switch (context) {
      case "watermark_click":
        return {
          title: "Remove the Watermark",
          message: "Get professional, branded invoices that build client trust",
          cta: "Go Professional",
          color: "blue" as const,
          icon: "🎨",
        };
      case "feature_hover":
        return {
          title: "Unlock This Feature",
          message: "Access industry templates and advanced customization",
          cta: "Unlock Pro",
          color: "purple" as const,
          icon: "🔓",
        };
      case "value_demonstration":
        return {
          title: "See What Pro Can Do",
          message: "Get paid 40% faster with professional features",
          cta: "Try Pro Features",
          color: "green" as const,
          icon: "⚡",
        };
      default:
        return {
          title: "Upgrade to Pro",
          message: "Unlimited invoices and professional features",
          cta: "Upgrade Now",
          color: "blue" as const,
          icon: "🚀",
        };
    }
  };

  const handleUpgradeClick = () => {
    setShowModal(true);

    // Mark this prompt as shown
    const promptKey = `quickbill_prompt_${context}`;
    localStorage.setItem(promptKey, "true");
    setHasShownPrompt(true);
  };

  const handleModalUpgrade = async () => {
    // This would integrate with the actual upgrade flow
    console.log("Upgrade initiated from context:", context);
    setShowModal(false);
  };

  const prompt = getPromptContent();

  // Don't show if already shown recently
  if (hasShownPrompt && context !== "invoice_limit") {
    return <>{children}</>;
  }

  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-800",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-800",
    green: "from-green-50 to-green-100 border-green-200 text-green-800",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-800",
  };

  return (
    <>
      {children}

      {/* Inline upgrade prompt */}
      <div
        className={`bg-gradient-to-r ${
          colorClasses[prompt.color]
        } border rounded-lg p-4 my-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{prompt.icon}</span>
            <div>
              <h3 className="font-semibold">{prompt.title}</h3>
              <p className="text-sm opacity-80">{prompt.message}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleUpgradeClick}
            className="bg-white text-gray-800 hover:bg-gray-50 shadow-sm"
          >
            {prompt.cta}
          </Button>
        </div>

        {/* Additional context-specific content */}
        {context === "value_demonstration" && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-green-700">+40%</div>
                <div className="text-green-600">Faster payments</div>
              </div>
              <div>
                <div className="font-bold text-green-700">+25%</div>
                <div className="text-green-600">Higher rates</div>
              </div>
              <div>
                <div className="font-bold text-green-700">2hrs</div>
                <div className="text-green-600">Time saved</div>
              </div>
            </div>
          </div>
        )}

        {context === "feature_hover" && (
          <div className="mt-3 pt-3 border-t border-purple-200">
            <div className="text-sm">
              <div className="font-medium text-purple-700 mb-1">
                Pro features include:
              </div>
              <div className="text-purple-600">
                Industry templates • Cloud sync • Email integration • Analytics
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced upgrade modal */}
      <EnhancedUpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpgrade={handleModalUpgrade}
        invoicesUsed={3}
        maxInvoices={3}
        context={
          context === "watermark_click"
            ? "watermark"
            : context === "feature_hover"
            ? "feature_locked"
            : "limit_reached"
        }
      />
    </>
  );
}
