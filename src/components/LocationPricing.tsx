import React, { useState } from "react";
import type { LocationPricing, PricingZone } from "../types/template";

interface LocationPricingDisplayProps {
  locationPricing: LocationPricing;
  basePrice: number;
  itemDescription?: string;
}

export const LocationPricingDisplay: React.FC<LocationPricingDisplayProps> = ({
  locationPricing,
  basePrice,
  itemDescription,
}) => {
  const [selectedZone, setSelectedZone] = useState<PricingZone | null>(null);
  const [userZipCode, setUserZipCode] = useState("");

  const findZoneByZipCode = (zipCode: string): PricingZone | null => {
    return (
      locationPricing.zones.find((zone) => zone.zipCodes?.includes(zipCode)) ||
      null
    );
  };

  const handleZipCodeCheck = () => {
    if (userZipCode.length >= 5) {
      const zone = findZoneByZipCode(userZipCode.slice(0, 5));
      setSelectedZone(zone);
    }
  };

  const getZoneIcon = (zoneName: string) => {
    if (zoneName.toLowerCase().includes("local")) return "🏠";
    if (zoneName.toLowerCase().includes("metro")) return "🏙️";
    if (zoneName.toLowerCase().includes("regional")) return "🌎";
    if (zoneName.toLowerCase().includes("premium")) return "💎";
    return "📍";
  };

  const calculateZonePrice = (zone: PricingZone) => {
    const adjustedPrice = basePrice * zone.priceModifier;
    return Math.max(adjustedPrice, zone.minimumCharge || 0);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <span className="text-lg">📍</span>
          Location-Based Pricing
        </h4>
        <div className="text-sm text-gray-600">
          Base Zone: {locationPricing.baseZone}
        </div>
      </div>

      {/* Zip Code Checker */}
      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Check Your Service Area Rate
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter ZIP code"
            value={userZipCode}
            onChange={(e) =>
              setUserZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleZipCodeCheck}
            disabled={userZipCode.length < 5}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Check
          </button>
        </div>

        {selectedZone && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {getZoneIcon(selectedZone.name)} {selectedZone.name}
                </p>
                <p className="text-sm text-blue-700">
                  {itemDescription || "Service"} Rate
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-900">
                  ${calculateZonePrice(selectedZone).toFixed(2)}
                </div>
                {selectedZone.priceModifier !== 1 && (
                  <div className="text-xs text-blue-600">
                    {selectedZone.priceModifier > 1 ? "+" : ""}
                    {((selectedZone.priceModifier - 1) * 100).toFixed(0)}% vs
                    base
                  </div>
                )}
              </div>
            </div>
            {selectedZone.minimumCharge && (
              <p className="text-xs text-blue-600 mt-1">
                Minimum charge: ${selectedZone.minimumCharge}
              </p>
            )}
          </div>
        )}

        {userZipCode.length >= 5 && !selectedZone && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ ZIP code {userZipCode} is outside our standard service area.
              Contact us for a custom quote.
            </p>
          </div>
        )}
      </div>

      {/* Service Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {locationPricing.zones.map((zone, index) => {
          const zonePrice = calculateZonePrice(zone);
          const isSelected = selectedZone?.name === zone.name;
          const priceDiff = zonePrice - basePrice;

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onClick={() => setSelectedZone(zone)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getZoneIcon(zone.name)}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {zone.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    ${zonePrice.toFixed(2)}
                  </div>
                  {priceDiff !== 0 && (
                    <div
                      className={`text-xs ${
                        priceDiff > 0 ? "text-orange-600" : "text-green-600"
                      }`}
                    >
                      {priceDiff > 0 ? "+" : ""}${priceDiff.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Zone Details */}
              <div className="text-xs text-gray-600 space-y-1">
                {zone.radius && <div>📏 Within {zone.radius} miles</div>}
                {zone.cities && zone.cities.length > 0 && (
                  <div>
                    🏙️ {zone.cities.slice(0, 2).join(", ")}
                    {zone.cities.length > 2 ? "..." : ""}
                  </div>
                )}
                {zone.minimumCharge && <div>💰 Min: ${zone.minimumCharge}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Travel Fees */}
      {locationPricing.travelFeeStructure &&
        locationPricing.travelFeeStructure.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <span>🚗</span>
              Travel Fees
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {locationPricing.travelFeeStructure.map((travelFee, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-700">
                    {travelFee.description}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ${travelFee.fee}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="mt-3 text-xs text-gray-500">
        💡 Pricing varies by location to account for travel time and local
        market rates. Enter your ZIP code for exact pricing.
      </div>
    </div>
  );
};

// Simple badge component for template cards
export const LocationPricingBadge: React.FC<{
  locationPricing: LocationPricing;
}> = ({ locationPricing }) => {
  const hasVariablePricing = locationPricing.zones.some(
    (zone) => zone.priceModifier !== 1
  );

  if (!hasVariablePricing) return null;

  const minModifier = Math.min(
    ...locationPricing.zones.map((z) => z.priceModifier)
  );
  const maxModifier = Math.max(
    ...locationPricing.zones.map((z) => z.priceModifier)
  );

  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      <span className="mr-1">📍</span>
      Location-based pricing
      {minModifier !== maxModifier && (
        <span className="ml-1 text-blue-600">
          ({((minModifier - 1) * 100).toFixed(0)}% to +
          {((maxModifier - 1) * 100).toFixed(0)}%)
        </span>
      )}
    </div>
  );
};
