import React, { useState } from "react";
import type { TemplatePortfolio, PortfolioImage } from "../types/template";

interface TemplatePortfolioProps {
  portfolio: TemplatePortfolio;
  templateName: string;
}

export const TemplatePortfolioComponent: React.FC<TemplatePortfolioProps> = ({
  portfolio,
  templateName,
}) => {
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "gallery" | "beforeafter" | "testimonials" | "certifications"
  >("gallery");

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex text-yellow-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          ⭐
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {templateName} Portfolio
        </h3>
        <p className="text-gray-600">
          See examples of professional work and client testimonials
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              id: "gallery",
              label: "Gallery",
              count: portfolio.images?.length || 0,
            },
            {
              id: "beforeafter",
              label: "Before/After",
              count: portfolio.beforeAfter?.length || 0,
            },
            {
              id: "testimonials",
              label: "Reviews",
              count: portfolio.testimonials?.length || 0,
            },
            {
              id: "certifications",
              label: "Credentials",
              count: portfolio.certifications?.length || 0,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Gallery Tab */}
      {activeTab === "gallery" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portfolio.images?.map((image) => (
            <div
              key={image.id}
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                  View Details
                </span>
              </div>
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Featured
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Before/After Tab */}
      {activeTab === "beforeafter" && (
        <div className="space-y-6">
          {portfolio.beforeAfter?.map((comparison) => (
            <div key={comparison.id} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {comparison.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Before</p>
                  <img
                    src={comparison.beforeUrl}
                    alt="Before"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">After</p>
                  <img
                    src={comparison.afterUrl}
                    alt="After"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              </div>
              {comparison.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {comparison.description}
                </p>
              )}
              {comparison.projectValue && (
                <p className="text-sm font-medium text-green-600">
                  Project Value: ${comparison.projectValue.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === "testimonials" && (
        <div className="space-y-4">
          {portfolio.testimonials?.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {testimonial.clientName}
                  </h4>
                  {testimonial.clientTitle && (
                    <p className="text-sm text-gray-600">
                      {testimonial.clientTitle}
                    </p>
                  )}
                </div>
                <StarRating rating={testimonial.rating} />
              </div>
              <p className="text-gray-700 mb-2">"{testimonial.text}"</p>
              <div className="flex justify-between text-sm text-gray-500">
                {testimonial.projectType && (
                  <span>{testimonial.projectType}</span>
                )}
                {testimonial.date && <span>{testimonial.date}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === "certifications" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.certifications?.map((cert) => (
            <div
              key={cert.id}
              className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4"
            >
              {cert.badgeUrl && (
                <img
                  src={cert.badgeUrl}
                  alt={cert.name}
                  className="w-12 h-12 object-contain"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{cert.name}</h4>
                <p className="text-sm text-gray-600">{cert.issuedBy}</p>
                {cert.licenseNumber && (
                  <p className="text-xs text-gray-500">
                    License: {cert.licenseNumber}
                  </p>
                )}
                {cert.expirationDate && (
                  <p className="text-xs text-gray-500">
                    Expires: {cert.expirationDate}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedImage.title}
                  </h3>
                  {selectedImage.description && (
                    <p className="text-gray-600">{selectedImage.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
