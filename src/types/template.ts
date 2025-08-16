export interface IndustryTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  isPro: boolean;
  tags: string[];
  complexity: "simple" | "standard" | "advanced";
  defaultItems: InvoiceItem[];
  variations?: TemplateVariation[];
  customFields?: CustomField[];
  automations?: Automation[];
  integrations?: Integration[];
  pricing?: PricingModel;
  deliverables?: Deliverable[];
  terms?: string[];
  notes?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: IndustryTemplate[];
}

export interface InvoiceItem {
  description: string;
  unitPrice: number;
  quantity: number;
  unit: string;
}

export interface TemplateVariation {
  id: string;
  name: string;
  description: string;
  useCase: string;
  estimatedValue: number;
  defaultItems: InvoiceItem[];
  timeline?: string;
  deliverables?: string[];
}

export interface CustomField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "date";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  condition?: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  type: "payment" | "accounting" | "crm" | "project";
  config?: Record<string, any>;
}

export interface PricingModel {
  type: "hourly" | "fixed" | "subscription" | "milestone";
  baseRate?: number;
  currency: string;
  discounts?: Discount[];
}

export interface Discount {
  type: "percentage" | "fixed";
  value: number;
  condition: string;
}

export interface Deliverable {
  name: string;
  description: string;
  timeline: string;
  dependencies?: string[];
}
