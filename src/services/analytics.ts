// Google Analytics service for conversion tracking

class AnalyticsService {
  private isInitialized = false;
  private measurementId: string;

  constructor() {
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || "";
  }

  // Initialize Google Analytics
  init() {
    if (this.isInitialized || !this.measurementId) return;

    // Load gtag script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", this.measurementId, {
      page_title: "QuickBill",
      page_location: window.location.href,
    });

    this.isInitialized = true;
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.isInitialized) return;

    window.gtag("config", this.measurementId, {
      page_path: path,
      page_title: title || "QuickBill",
    });
  }

  // Track conversion events
  trackConversion(eventName: string, value?: number, currency = "USD") {
    if (!this.isInitialized) return;

    window.gtag("event", eventName, {
      event_category: "conversion",
      value: value,
      currency: currency,
    });
  }

  // Track user signup
  trackSignup(method: "email" | "google") {
    this.trackConversion("sign_up", undefined);
    window.gtag("event", "sign_up", {
      method: method,
    });
  }

  // Track Pro upgrade
  trackUpgrade(value: number = 4.99) {
    this.trackConversion("purchase", value);
    window.gtag("event", "purchase", {
      transaction_id: `upgrade_${Date.now()}`,
      value: value,
      currency: "USD",
      items: [
        {
          item_id: "quickbill_pro",
          item_name: "QuickBill Pro",
          category: "subscription",
          quantity: 1,
          price: value,
        },
      ],
    });
  }

  // Track invoice creation
  trackInvoiceCreated(isFreeTier: boolean) {
    window.gtag("event", "invoice_created", {
      event_category: "engagement",
      custom_parameter_1: isFreeTier ? "free" : "pro",
    });
  }

  // Track upgrade prompt interactions
  trackUpgradePrompt(
    action: "shown" | "clicked" | "dismissed",
    context: string
  ) {
    window.gtag("event", `upgrade_prompt_${action}`, {
      event_category: "conversion_funnel",
      custom_parameter_1: context,
    });
  }

  // Track feature usage
  trackFeatureUsage(feature: string, tier: "free" | "pro") {
    window.gtag("event", "feature_used", {
      event_category: "engagement",
      custom_parameter_1: feature,
      custom_parameter_2: tier,
    });
  }
}

// Global analytics instance
export const analytics = new AnalyticsService();

// Type declarations for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default analytics;
