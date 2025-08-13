import { useState } from "react";
import { Button } from "./Button";
import FormField from "./FormField";
import type { InvoiceData } from "../types/invoice";
import toast from "react-hot-toast";

export interface Agreement {
  id: string;
  title: string;
  content: string;
  clientName: string;
  clientEmail: string;
  businessName: string;
  createdAt: string;
  signedAt?: string;
  clientSignature?: string;
  status: "draft" | "sent" | "signed" | "expired";
  expiresAt: string;
  relatedInvoiceId?: string;
}

interface AgreementGeneratorProps {
  invoice?: InvoiceData;
  onClose: () => void;
  onAgreementCreated: (agreement: Agreement) => void;
}

const DEFAULT_AGREEMENT_TEMPLATES = {
  general: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on [DATE] between [BUSINESS_NAME] ("Service Provider") and [CLIENT_NAME] ("Client").

SCOPE OF WORK:
[WORK_DESCRIPTION]

TERMS AND CONDITIONS:
1. Payment terms as outlined in the accompanying invoice
2. Work will commence upon signing of this agreement
3. Client agrees to provide necessary access and materials
4. Service Provider will deliver work within agreed timeline
5. Any changes to scope require written approval

RESPONSIBILITIES:
Service Provider agrees to:
- Deliver services as described
- Maintain professional standards
- Complete work within timeline

Client agrees to:
- Provide timely feedback and approvals
- Make payments according to invoice terms
- Provide necessary materials and access

CANCELLATION:
Either party may cancel with 48-hour written notice. Client is responsible for payment of completed work.

By signing below, both parties agree to the terms outlined in this agreement.`,

  construction: `CONSTRUCTION SERVICE AGREEMENT

This Construction Service Agreement is entered into on [DATE] between [BUSINESS_NAME] ("Contractor") and [CLIENT_NAME] ("Property Owner").

PROJECT DESCRIPTION:
[WORK_DESCRIPTION]

TERMS:
1. Work will be performed according to industry standards
2. All materials and labor included unless specified
3. Property owner responsible for permits where required
4. Contractor carries appropriate insurance
5. Payment schedule as per accompanying invoice

WARRANTIES:
- 1-year warranty on workmanship
- Materials covered by manufacturer warranty
- Warranty void if unauthorized modifications made

SAFETY & LIABILITY:
- Contractor maintains liability insurance
- Property owner responsible for site access
- Work area to be cleared of personal items

CHANGE ORDERS:
Any changes to original scope require written approval and may affect timeline and cost.

By signing, parties agree to all terms and conditions.`,

  professional: `PROFESSIONAL SERVICES AGREEMENT

Agreement between [BUSINESS_NAME] ("Professional") and [CLIENT_NAME] ("Client") dated [DATE].

SERVICES:
[WORK_DESCRIPTION]

PROFESSIONAL STANDARDS:
- Services performed with professional care and skill
- Confidentiality maintained for all client information
- Professional licensing and insurance current

DELIVERABLES:
- Work product as specified in accompanying documentation
- Timeline as mutually agreed
- Quality standards as per industry norms

CLIENT RESPONSIBILITIES:
- Timely payment per invoice terms
- Provide accurate information and materials
- Reasonable availability for consultations

INTELLECTUAL PROPERTY:
- Client retains rights to final deliverables upon payment
- Professional retains rights to methodologies and general knowledge

LIMITATION OF LIABILITY:
Professional's liability limited to amount paid for services.

This agreement governs the professional relationship between the parties.`,
};

export default function AgreementGenerator({
  invoice,
  onClose,
  onAgreementCreated,
}: AgreementGeneratorProps) {
  const [agreementData, setAgreementData] = useState({
    title: `Service Agreement - ${invoice?.client.name || "New Client"}`,
    template: "general",
    content: "",
    workDescription:
      invoice?.items
        .map((item) => `${item.description} (${item.quantity} units)`)
        .join("\n") || "",
    expirationDays: 30,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [previewMode, setPreviewMode] = useState(false);

  const generateAgreementContent = () => {
    const template =
      DEFAULT_AGREEMENT_TEMPLATES[
        agreementData.template as keyof typeof DEFAULT_AGREEMENT_TEMPLATES
      ];
    const content = template
      .replace(/\[DATE\]/g, new Date().toLocaleDateString())
      .replace(
        /\[BUSINESS_NAME\]/g,
        invoice?.business.name || "[Business Name]"
      )
      .replace(/\[CLIENT_NAME\]/g, invoice?.client.name || "[Client Name]")
      .replace(
        /\[WORK_DESCRIPTION\]/g,
        agreementData.workDescription || "[Work Description]"
      );

    setAgreementData((prev) => ({ ...prev, content }));
  };

  const generateSigningLink = async () => {
    if (!agreementData.content.trim()) {
      toast.error("Please generate or enter agreement content first");
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate API call to create agreement
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const agreementId = Math.random().toString(36).substring(7);
      const agreement: Agreement = {
        id: agreementId,
        title: agreementData.title,
        content: agreementData.content,
        clientName: invoice?.client.name || "",
        clientEmail: invoice?.client.email || "",
        businessName: invoice?.business.name || "",
        createdAt: new Date().toISOString(),
        status: "sent",
        expiresAt: new Date(
          Date.now() + agreementData.expirationDays * 24 * 60 * 60 * 1000
        ).toISOString(),
        relatedInvoiceId: invoice?.id,
      };

      // Generate signing link (would be hosted on your domain)
      const signingLink = `${window.location.origin}/sign-agreement/${agreementId}`;
      setGeneratedLink(signingLink);

      onAgreementCreated(agreement);
      toast.success("Agreement created and signing link generated!");
    } catch (error) {
      console.error("Error creating agreement:", error);
      toast.error("Failed to create agreement. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Signing link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link. Please copy manually.");
    }
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: `Agreement Signature Required - ${agreementData.title}`,
        text: `Please review and sign the service agreement`,
        url: generatedLink,
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create Digital Agreement
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Settings */}
            <div className="space-y-4">
              <FormField
                label="Agreement Title"
                value={agreementData.title}
                onChange={(value) =>
                  setAgreementData((prev) => ({ ...prev, title: value }))
                }
                placeholder="e.g., Service Agreement - Project Name"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Template
                </label>
                <select
                  value={agreementData.template}
                  onChange={(e) =>
                    setAgreementData((prev) => ({
                      ...prev,
                      template: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General Service Agreement</option>
                  <option value="construction">Construction Services</option>
                  <option value="professional">Professional Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Description
                </label>
                <textarea
                  value={agreementData.workDescription}
                  onChange={(e) =>
                    setAgreementData((prev) => ({
                      ...prev,
                      workDescription: e.target.value,
                    }))
                  }
                  placeholder="Describe the work to be performed..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Expires In (Days)
                </label>
                <select
                  value={agreementData.expirationDays}
                  onChange={(e) =>
                    setAgreementData((prev) => ({
                      ...prev,
                      expirationDays: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={generateAgreementContent}
                  className="flex-1"
                >
                  Generate from Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex-1"
                >
                  {previewMode ? "Edit" : "Preview"}
                </Button>
              </div>

              {/* Generated Link */}
              {generatedLink && (
                <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900">
                    Agreement Created!
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-green-300 rounded-md bg-white text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={shareLink}
                      className="flex-1"
                    >
                      Share Link
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => window.open(generatedLink, "_blank")}
                      className="flex-1"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Agreement Content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Agreement Content
                </label>
                <span className="text-xs text-gray-500">
                  {agreementData.content.length} characters
                </span>
              </div>

              {previewMode ? (
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50 h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {agreementData.content ||
                        "Generate content from template or enter custom agreement text..."}
                    </pre>
                  </div>
                </div>
              ) : (
                <textarea
                  value={agreementData.content}
                  onChange={(e) =>
                    setAgreementData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Agreement content will appear here after generating from template, or enter custom content..."
                  rows={16}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={generateSigningLink}
              disabled={isGenerating || !agreementData.content.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
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
                  Creating Agreement...
                </>
              ) : generatedLink ? (
                "Create New Agreement"
              ) : (
                "Create Signing Link"
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900 mb-1">
              📝 How Digital Agreements Work:
            </p>
            <ul className="space-y-1 text-blue-800">
              <li>
                • Create a professional service agreement before starting work
              </li>
              <li>• Send the signing link to your client via email or text</li>
              <li>
                • Client can review and sign electronically from any device
              </li>
              <li>• Both parties receive a copy once signed</li>
              <li>
                • Signed agreements are legally binding in most jurisdictions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
