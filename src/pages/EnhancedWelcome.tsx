import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";

export default function EnhancedWelcome() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");

  const industries = [
    {
      id: "freelancer",
      name: "Freelancer",
      icon: "💻",
      description: "Web design, writing, consulting",
    },
    {
      id: "contractor",
      name: "Contractor",
      icon: "🔨",
      description: "Construction, repairs, renovation",
    },
    {
      id: "service",
      name: "Service Business",
      icon: "🧹",
      description: "Cleaning, landscaping, maintenance",
    },
    {
      id: "consultant",
      name: "Consultant",
      icon: "📊",
      description: "Business, marketing, strategy",
    },
    {
      id: "creative",
      name: "Creative",
      icon: "🎨",
      description: "Photography, design, videography",
    },
  ];

  const successStories = [
    {
      name: "Sarah M.",
      business: "Freelance Designer",
      quote: "Got paid 40% faster with professional invoices",
      revenue: "$2,400 first month",
    },
    {
      name: "Mike R.",
      business: "Electrician",
      quote: "Branded invoices helped me charge premium rates",
      revenue: "+$500 per project",
    },
    {
      name: "Lisa K.",
      business: "Marketing Consultant",
      quote: "Template saved me 2 hours per invoice",
      revenue: "15 clients in 3 months",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Get Paid <span className="text-blue-600">Faster</span> with
            Professional Invoices
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join 10,000+ freelancers and small businesses who increased their
            revenue by 25% with QuickBill's industry-specific invoice templates.
          </p>

          {/* Free Account Status */}
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md mx-auto mb-8 border border-green-100">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">🚀</span>
              <h3 className="text-lg font-semibold text-gray-900">
                Your Free Trial
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Create{" "}
              <span className="font-bold text-green-600">
                unlimited basic invoices
              </span>{" "}
              free
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: "100%" }}
              />
            </div>
            <p className="text-sm text-gray-500">No credit card required</p>
          </div>

          {/* Primary CTA */}
          <Link to="/create">
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold shadow-lg"
            >
              Create Your First Invoice Now →
            </Button>
          </Link>
        </div>

        {/* Industry Selection */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            What's Your Business?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Get a template designed specifically for your industry
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {industries.map((industry) => (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedIndustry === industry.id
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="text-3xl mb-2">{industry.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {industry.name}
                </h3>
                <p className="text-xs text-gray-600">{industry.description}</p>
              </button>
            ))}
          </div>
          {selectedIndustry && (
            <div className="text-center mt-6">
              <Link to={`/create?template=${selectedIndustry}`}>
                <Button variant="outline" size="lg">
                  Use {industries.find((i) => i.id === selectedIndustry)?.name}{" "}
                  Template →
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Value Propositions */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Get Paid 40% Faster
            </h3>
            <p className="text-gray-600">
              Professional invoices with payment links get paid faster than
              basic bills
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Increase Revenue 25%
            </h3>
            <p className="text-gray-600">
              Industry-specific templates help you charge premium rates with
              confidence
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Save 2+ Hours
            </h3>
            <p className="text-gray-600">
              Pre-filled templates and smart calculations eliminate manual work
            </p>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Real Results from Real Users
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {story.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">
                      {story.name}
                    </h4>
                    <p className="text-sm text-gray-600">{story.business}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-3 italic">"{story.quote}"</p>
                <div className="text-green-600 font-semibold">
                  {story.revenue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Preview */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            See What You Can Create
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Professional Templates
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Industry-specific layouts for 15+ business types
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Automatic tax calculations and totals
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Professional terms and payment instructions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Mobile-friendly design for any device
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/create">
                  <Button size="lg" className="w-full">
                    Try It Free Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-600">
                Interactive invoice preview would appear here
              </p>
              <div className="mt-4 text-sm text-gray-500">
                See your invoice come to life as you type
              </div>
            </div>
          </div>
        </div>

        {/* Urgency & Social Proof */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔥 Join 847 Users Who Started This Week
            </h2>
            <p className="text-gray-700 mb-6">
              Don't let another client wait for their invoice. Start now and
              send your first professional invoice in under 5 minutes.
            </p>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10,000+</div>
                <div className="text-sm text-gray-600">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$2.4M+</div>
                <div className="text-sm text-gray-600">Invoiced This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">4.9★</div>
                <div className="text-sm text-gray-600">User Rating</div>
              </div>
            </div>
            <Link to="/create">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                Get Started Free - No Signup Required
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is it really free?
              </h3>
              <p className="text-gray-600">
                Yes! Create and download up to 3 professional invoices
                completely free. No credit card required, no hidden fees.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens after 3 invoices?
              </h3>
              <p className="text-gray-600">
                You can upgrade to Pro for just $9.99/month to get unlimited
                invoices, cloud sync, and advanced features. Or continue using
                the free version by creating a new account.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I customize the invoices?
              </h3>
              <p className="text-gray-600">
                Absolutely! Add your business details, logo, customize line
                items, and choose from industry-specific templates designed for
                your business type.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
