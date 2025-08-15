import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import SectionCard from "../components/SectionCard";
import type { InvoiceData } from "../types/invoice";
import storageService from "../services/storage";
import toast from "react-hot-toast";

export default function InvoiceHistory() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userData = storageService.getUserData();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const allInvoices = storageService.getAllInvoices();
    setInvoices(
      allInvoices.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      )
    );
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.business.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      storageService.deleteInvoice(id);
      loadInvoices();
      toast.success("Invoice deleted successfully");
    }
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    // Navigate to edit page with the invoice ID
    navigate(`/edit/${invoice.id}`);
  };

  const handleDuplicateInvoice = (invoice: InvoiceData) => {
    try {
      // Create a copy of the invoice without ID, created/updated dates
      const duplicatedInvoice: InvoiceData = {
        ...invoice,
        id: undefined, // Remove ID so it gets a new one
        invoiceNumber: storageService.generateInvoiceNumber(), // Generate new invoice number
        invoiceDate: new Date().toISOString().split("T")[0], // Set to today
        status: "draft", // Reset status to draft
        createdAt: undefined, // Will be set by saveInvoice
        updatedAt: undefined, // Will be set by saveInvoice
      };

      // Save the duplicated invoice
      const newInvoiceId = storageService.saveInvoice(duplicatedInvoice);

      // Refresh the list
      loadInvoices();

      toast.success("Invoice duplicated successfully!");

      // Navigate to edit the new invoice
      navigate(`/edit/${newInvoiceId}`);
    } catch (error) {
      console.error("Failed to duplicate invoice:", error);
      toast.error("Failed to duplicate invoice. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice History</h1>
          <p className="text-gray-600">
            {userData.isPro
              ? "Pro Account"
              : `${userData.invoicesCreated}/${userData.maxInvoices} invoices used`}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/create")}>
          Create New Invoice
        </Button>
      </div>

      {/* Search */}
      <SectionCard title="Search Invoices">
        <input
          type="text"
          placeholder="Search by invoice number, client name, or business name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </SectionCard>

      {/* Invoices List */}
      <SectionCard title={`Invoices (${filteredInvoices.length})`}>
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "No invoices found matching your search."
                : "No invoices created yet."}
            </p>
            {!searchTerm && (
              <Button variant="primary" onClick={() => navigate("/create")}>
                Create Your First Invoice
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status || "draft"
                        )}`}
                      >
                        {(invoice.status || "draft").charAt(0).toUpperCase() +
                          (invoice.status || "draft").slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Client:</p>
                        <p>{invoice.client.name}</p>
                      </div>
                      <div>
                        <p className="font-medium">Date:</p>
                        <p>{formatDate(invoice.invoiceDate)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Total:</p>
                        <p className="font-semibold text-gray-900">
                          ${invoice.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      View
                    </Button>
                    {userData.isPro && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateInvoice(invoice)}
                      >
                        Duplicate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteInvoice(invoice.id!)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Pro Features Notice */}
      {!userData.isPro && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Unlock Pro Features
              </h3>
              <p className="text-sm text-gray-600">
                Get unlimited invoices, templates, and cloud sync
              </p>
            </div>
            <Button variant="primary" size="sm">
              Upgrade for $9.99/month
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
