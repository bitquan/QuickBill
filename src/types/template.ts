export interface IndustryTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  isPro: boolean;
  defaultItems: TemplateItem[];
  defaultBusinessInfo?: Partial<BusinessInfo>;
  defaultNotes?: string;
  defaultTaxRate?: number;
  // Enhanced features
  tags?: string[];
  variations?: TemplateVariation[];
  defaultTerms?: TemplateTerms;
  complexity?: "simple" | "standard" | "advanced";
  timeline?: TemplateTimeline;
  // NEW: Enhanced Template Features
  portfolio?: TemplatePortfolio;
  seasonalPricing?: SeasonalPricing[];
  locationPricing?: LocationPricing;
  customizable?: boolean;
  popularity?: number; // For analytics and recommendations
}

export interface TemplateVariation {
  id: string;
  name: string;
  description: string;
  items: TemplateItem[];
  notes?: string;
  useCase: string;
  estimatedValue: number;
}

export interface TemplateTerms {
  paymentTerms: string;
  cancellationPolicy?: string;
  warrantyInfo?: string;
  additionalTerms?: string[];
}

export interface TemplateTimeline {
  estimatedDuration: string;
  milestones?: Milestone[];
}

export interface Milestone {
  name: string;
  percentage: number;
  description: string;
}

export interface TemplateItem {
  description: string;
  unitPrice: number;
  quantity: number;
  unit?: string; // e.g., "hour", "sq ft", "piece", etc.
}

export interface BusinessInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: IndustryTemplate[];
}

// NEW: Enhanced Template Feature Interfaces
export interface TemplatePortfolio {
  images: PortfolioImage[];
  testimonials?: Testimonial[];
  certifications?: Certification[];
  beforeAfter?: BeforeAfterImage[];
}

export interface PortfolioImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: string; // e.g., "kitchen", "bathroom", "commercial"
  isPrimary?: boolean;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientTitle?: string;
  rating: number; // 1-5 stars
  text: string;
  projectType?: string;
  date?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  expirationDate?: string;
  licenseNumber?: string;
  badgeUrl?: string;
}

export interface BeforeAfterImage {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  title: string;
  description?: string;
  projectValue?: number;
}

export interface SeasonalPricing {
  season: "spring" | "summer" | "fall" | "winter";
  modifier: number; // Multiplier (e.g., 1.2 for 20% increase, 0.8 for 20% discount)
  description: string;
  startDate: string; // MM-DD format
  endDate: string; // MM-DD format
  applicableItems?: string[]; // Item descriptions that get seasonal pricing
}

export interface LocationPricing {
  baseZone: string; // e.g., "local", "metro", "regional"
  zones: PricingZone[];
  travelFeeStructure?: TravelFee[];
}

export interface PricingZone {
  name: string;
  zipCodes?: string[];
  cities?: string[];
  radius?: number; // miles from base location
  priceModifier: number; // Multiplier for all items
  minimumCharge?: number;
}

export interface TravelFee {
  distance: number; // miles
  fee: number;
  description: string;
}

// Template Customization Features
export interface TemplateCustomization {
  userId: string;
  templateId: string;
  customName?: string;
  customItems?: TemplateItem[];
  customTerms?: TemplateTerms;
  customNotes?: string;
  customPricing?: {
    laborRate?: number;
    materialMarkup?: number;
    overhead?: number;
  };
  brandingCustomization?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoPosition?: "header" | "footer" | "watermark";
  };
  createdAt: string;
  updatedAt: string;
}
