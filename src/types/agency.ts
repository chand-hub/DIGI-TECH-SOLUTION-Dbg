export type Language = 'en' | 'hi';

export type RoutePath =
  | '/'
  | '/about'
  | '/services'
  | '/portfolio'
  | '/pricing'
  | '/contact'
  | '/faq'
  | '/privacy-policy'
  | '/terms-and-conditions'
  | '/refund-and-cancellation-policy'
  | '/payment-success'
  | '/payment-failure'
  | '/admin'
  | `/portfolio/${string}`;

export type PaymentState =
  | 'CREATED'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type VerificationState = 'UNVERIFIED' | 'VERIFIED' | 'FAILED';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  category: 'Websites' | 'Industry Solutions' | 'Web Apps & Systems' | 'Growth & Care';
  shortSummary: string;
  description: string;
  benefits: string[];
  features: string[];
  previewHighlights: string[];
  recommendedPackage: string;
}

export type PortfolioCategory =
  | 'All'
  | 'Business Websites'
  | 'Healthcare Websites'
  | 'Restaurant Websites'
  | 'E-commerce'
  | 'Dashboard Applications'
  | 'Custom Web Applications';

export interface PortfolioProject {
  slug: string;
  title: string;
  subtitle: string;
  category: Exclude<PortfolioCategory, 'All'>;
  projectStatusLabel: 'LIVE PREVIEW' | 'DEMO PROJECT';
  summary: string;
  overview: string;
  thumbnail: string;
  secondaryImage?: string;
  secondaryImageCaption?: string;
  livePreviewUrl?: string;
  technologies: string[];
  features: string[];
  architectureNotes: string[];
  deliverables: string[];
  recommendedService: string;
}

export interface PricingPackage {
  id: 'starter' | 'business' | 'premium';
  name: string;
  formOptionLabel: string;
  priceInr: number;
  priceFormatted: string;
  billingNote: string;
  summary: string;
  featured?: boolean;
  supportDays: number;
  features: string[];
}

export interface FaqItem {
  id: string;
  category: 'General' | 'Pricing & Billing' | 'Delivery & Tech' | 'Support & Security';
  question: string;
  answer: string;
}

export interface RuntimeConfig {
  whatsappNumber: string;
  whatsappConfigured: boolean;
  razorpayConfigured: boolean;
  razorpayKeyId: string | null;
  razorpayMode: 'test' | 'live';
  resendConfigured: boolean;
  d1Configured: boolean;
  supabaseConfigured?: boolean;
  adminConfigured: boolean;
}

export interface EnquiryPayload {
  fullName: string;
  businessName?: string;
  email: string;
  phone: string;
  category?: string;
  services: string[];
  selectedPackage?: string;
  budget?: string;
  description?: string;
  additionalRequirements?: string;
  contactPreference?: 'WhatsApp' | 'Phone Call' | 'Email';
  website_url?: string;
}

export interface EnquiryResponse {
  success: boolean;
  referenceNumber?: string;
  enquiryId?: number | null;
  emailNotification?: {
    configured: boolean;
    sent: boolean;
    error?: string;
  };
  error?: string;
  fieldErrors?: Record<string, string>;
}
