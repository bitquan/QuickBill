import React from "react";
import type { SeasonalPricing } from "../types/template";

interface SeasonalPricingDisplayProps {
  seasonalPricing: SeasonalPricing[];
  basePrice: number;
  itemDescription?: string;
}

export const SeasonalPricingDisplay: React.FC<SeasonalPricingDisplayProps> = ({
  seasonalPricing,
  basePrice,
  itemDescription,
}) => {
  const getCurrentSeason = (): string => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const currentDate = `${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

    for (const pricing of seasonalPricing) {
      if (currentDate >= pricing.startDate && currentDate <= pricing.endDate) {
        return pricing.season;
      }
    }
    return "standard";
  };

  const getCurrentPricing = () => {
    const currentSeason = getCurrentSeason();
    const activePricing = seasonalPricing.find(
      (p) => p.season === currentSeason
    );
    return activePricing || null;
  };

  const getSeasonIcon = (season: string) => {
    const icons = {
      spring: "🌸",
      summer: "☀️",
      fall: "🍂",
      winter: "❄️",
    };
    return icons[season as keyof typeof icons] || "📅";
  };

  const activePricing = getCurrentPricing();
  const adjustedPrice = activePricing
    ? basePrice * activePricing.modifier
    : basePrice;
  const isDiscounted = activePricing && activePricing.modifier < 1;
  const isPremium = activePricing && activePricing.modifier > 1;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <span className="text-lg">📅</span>
          Seasonal Pricing
        </h4>
        {activePricing && (
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getSeasonIcon(activePricing.season)}
            </span>
            <span className="text-sm font-medium text-blue-700 capitalize">
              {activePricing.season} Rate
            </span>
          </div>
        )}
      </div>

      {/* Current Pricing Display */}
      {activePricing ? (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {itemDescription || "Service"} - {activePricing.season} pricing
              </p>
              <div className="flex items-center gap-3">
                {activePricing.modifier !== 1 && (
                  <span className="text-lg text-gray-400 line-through">
                    ${basePrice.toFixed(2)}
                  </span>
                )}
                <span
                  className={`text-xl font-semibold ${
                    isDiscounted
                      ? "text-green-600"
                      : isPremium
                      ? "text-orange-600"
                      : "text-gray-900"
                  }`}
                >
                  ${adjustedPrice.toFixed(2)}
                </span>
                {activePricing.modifier !== 1 && (
                  <span
                    className={`text-sm px-2 py-1 rounded-full font-medium ${
                      isDiscounted
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {isDiscounted ? "DISCOUNT" : "PEAK PRICING"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {activePricing.description}
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Standard Rate</p>
          <span className="text-xl font-semibold text-gray-900">
            ${basePrice.toFixed(2)}
          </span>
        </div>
      )}

      {/* Seasonal Pricing Calendar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {seasonalPricing.map((pricing) => {
          const seasonPrice = basePrice * pricing.modifier;
          const savings = basePrice - seasonPrice;
          const isActive = activePricing?.season === pricing.season;

          return (
            <div
              key={pricing.season}
              className={`p-3 rounded-lg border-2 transition-all ${
                isActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">
                  {getSeasonIcon(pricing.season)}
                </div>
                <div className="text-xs font-medium text-gray-700 capitalize mb-1">
                  {pricing.season}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  ${seasonPrice.toFixed(2)}
                </div>
                {pricing.modifier !== 1 && (
                  <div
                    className={`text-xs mt-1 ${
                      pricing.modifier < 1
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {pricing.modifier < 1
                      ? `Save $${Math.abs(savings).toFixed(0)}`
                      : `+$${savings.toFixed(0)}`}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {pricing.startDate} - {pricing.endDate}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        💡 Seasonal pricing helps you plan your project for the best value. Peak
        seasons may have higher rates due to demand.
      </div>
    </div>
  );
};

// Utility component for showing seasonal pricing in template selector
export const SeasonalPricingBadge: React.FC<{
  seasonalPricing: SeasonalPricing[];
  basePrice: number;
}> = ({ seasonalPricing }) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const currentDate = `${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;

  const activePricing = seasonalPricing.find(
    (pricing) =>
      currentDate >= pricing.startDate && currentDate <= pricing.endDate
  );

  if (!activePricing || activePricing.modifier === 1) return null;

  const isDiscount = activePricing.modifier < 1;
  const percentChange = Math.abs((activePricing.modifier - 1) * 100);

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isDiscount
          ? "bg-green-100 text-green-800"
          : "bg-orange-100 text-orange-800"
      }`}
    >
      <span className="mr-1">{isDiscount ? "🌱" : "🔥"}</span>
      {isDiscount
        ? `${percentChange.toFixed(0)}% Off - ${activePricing.season}`
        : `Peak ${activePricing.season} +${percentChange.toFixed(0)}%`}
    </div>
  );
};
