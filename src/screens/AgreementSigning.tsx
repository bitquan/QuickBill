import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/Button";
import FormField from "../components/FormField";
import type { Agreement } from "../components/AgreementGenerator";
import toast from "react-hot-toast";

export default function AgreementSigning() {
  const { agreementId } = useParams<{ agreementId: string }>();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signatureData, setSignatureData] = useState({
    clientName: "",
    clientEmail: "",
    clientSignature: "",
    acceptTerms: false,
  });

  useEffect(() => {
    const loadAgreement = async () => {
      if (!agreementId) {
        toast.error("Invalid agreement link");
        setLoading(false);
        return;
      }

      try {
        // Simulate API call to load agreement
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock agreement data (in real app, this would come from your backend)
        const mockAgreement: Agreement = {
          id: agreementId,
          title: "Service Agreement - Professional Services",
          content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString()} between QuickBill Pro Services ("Service Provider") and [CLIENT_NAME] ("Client").

SCOPE OF WORK:
Website design and development
Content management system setup
SEO optimization

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
          clientName: "John Smith",
          clientEmail: "john@example.com",
          businessName: "QuickBill Pro Services",
          createdAt: new Date().toISOString(),
          status: "sent",
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        setAgreement(mockAgreement);
        setSignatureData((prev) => ({
          ...prev,
          clientName: mockAgreement.clientName,
          clientEmail: mockAgreement.clientEmail,
        }));
      } catch (error) {
        console.error("Error loading agreement:", error);
        toast.error("Failed to load agreement");
      } finally {
        setLoading(false);
      }
    };

    loadAgreement();
  }, [agreementId]);

  const handleSignAgreement = async () => {
    if (!signatureData.acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!signatureData.clientSignature.trim()) {
      toast.error("Please enter your full name as your signature");
      return;
    }

    setSigning(true);

    try {
      // Simulate API call to sign agreement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update agreement status
      if (agreement) {
        const signedAgreement: Agreement = {
          ...agreement,
          status: "signed",
          signedAt: new Date().toISOString(),
          clientSignature: signatureData.clientSignature,
        };
        setAgreement(signedAgreement);
      }

      toast.success(
        "Agreement signed successfully! Both parties will receive a copy."
      );
    } catch (error) {
      console.error("Error signing agreement:", error);
      toast.error("Failed to sign agreement. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  const downloadPDF = () => {
    toast.success("PDF download would be implemented here");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agreement...</p>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Agreement Not Found
          </h1>
          <p className="text-gray-600">
            The agreement link may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(agreement.expiresAt);
  const isSigned = agreement.status === "signed";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">{agreement.title}</h1>
            <p className="text-blue-100 mt-1">
              From {agreement.businessName} to {agreement.clientName}
            </p>
          </div>

          {/* Status Banner */}
          {isSigned && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Agreement Signed</strong> - Signed on{" "}
                    {agreement.signedAt
                      ? new Date(agreement.signedAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isExpired && !isSigned && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Agreement Expired</strong> - This agreement expired
                    on {new Date(agreement.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Agreement Content */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Agreement Details
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
                  {agreement.content}
                </pre>
              </div>
            </div>

            {/* Signing Section */}
            {!isSigned && !isExpired && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Electronic Signature
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    label="Your Full Name"
                    value={signatureData.clientName}
                    onChange={(value) =>
                      setSignatureData((prev) => ({
                        ...prev,
                        clientName: value,
                      }))
                    }
                    placeholder="Enter your full legal name"
                  />
                  <FormField
                    label="Email Address"
                    type="email"
                    value={signatureData.clientEmail}
                    onChange={(value) =>
                      setSignatureData((prev) => ({
                        ...prev,
                        clientEmail: value,
                      }))
                    }
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="mb-6">
                  <FormField
                    label="Digital Signature"
                    value={signatureData.clientSignature}
                    onChange={(value) =>
                      setSignatureData((prev) => ({
                        ...prev,
                        clientSignature: value,
                      }))
                    }
                    placeholder="Type your full name as your digital signature"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    By typing your name, you agree this constitutes a legal
                    signature
                  </p>
                </div>

                <div className="mb-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={signatureData.acceptTerms}
                      onChange={(e) =>
                        setSignatureData((prev) => ({
                          ...prev,
                          acceptTerms: e.target.checked,
                        }))
                      }
                      disabled={signing}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I have read, understood, and agree to the terms and
                      conditions outlined in this agreement. I understand that
                      this electronic signature has the same legal effect as a
                      handwritten signature.
                    </span>
                  </label>
                </div>

                <Button
                  variant="primary"
                  onClick={handleSignAgreement}
                  disabled={
                    signing ||
                    !signatureData.acceptTerms ||
                    !signatureData.clientSignature.trim()
                  }
                  className="w-full"
                >
                  {signing ? (
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
                      Signing Agreement...
                    </>
                  ) : (
                    "Sign Agreement"
                  )}
                </Button>
              </div>
            )}

            {/* Signed Section */}
            {isSigned && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Signature Details
                </h2>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">
                        Signed by:
                      </span>
                      <p className="text-green-700">
                        {agreement.clientSignature}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">
                        Date signed:
                      </span>
                      <p className="text-green-700">
                        {agreement.signedAt
                          ? new Date(agreement.signedAt).toLocaleString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadPDF}
                    className="flex-1"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download PDF
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.print()}
                    className="flex-1"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Print
                  </Button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
              <p>
                This agreement was created using QuickBill Pro •{" "}
                <a href="/" className="text-blue-600 hover:text-blue-800">
                  Create your own professional agreements
                </a>
              </p>
              <p className="mt-1">
                Agreement expires on{" "}
                {new Date(agreement.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
