export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<{ success: boolean; meta: { last_row_id?: number; changes?: number } }>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
}

export interface Env {
  DB?: D1Database;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  SENDER_EMAIL?: string;
  EMAIL_FROM?: string;
  BUSINESS_EMAIL?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  WHATSAPP_NUMBER?: string;
  APP_BASE_URL?: string;
  ADMIN_ACCESS_TOKEN?: string;
}

export interface EventContext<E = Env> {
  request: Request;
  env: E;
  params: Record<string, string | string[]>;
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
}

export type PagesFunction<E = Env> = (context: EventContext<E>) => Response | Promise<Response>;

export type PaymentState =
  | 'CREATED'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type VerificationState = 'UNVERIFIED' | 'VERIFIED' | 'FAILED';

export interface PackageDefinition {
  id: 'starter' | 'business' | 'premium';
  name: string;
  amountInr: number;
  amountPaise: number;
  supportDays: number;
}

export const PACKAGE_CATALOG: Record<string, PackageDefinition> = {
  starter: {
    id: 'starter',
    name: 'Starter Package',
    amountInr: 7999,
    amountPaise: 799900,
    supportDays: 15,
  },
  business: {
    id: 'business',
    name: 'Business Package',
    amountInr: 16999,
    amountPaise: 1699900,
    supportDays: 30,
  },
  premium: {
    id: 'premium',
    name: 'Premium Package',
    amountInr: 25999,
    amountPaise: 2599900,
    supportDays: 30,
  },
};

export const ALLOWED_SERVICES = [
  'Business Website Development',
  'Landing Page Development',
  'E-commerce Website',
  'Dashboard / Admin Panel Development',
  'Restaurant Management System',
  'WhatsApp Integration',
  'Payment Gateway Integration',
  'Custom Web Application',
  'Hospital and Clinic Website Development',
  'Restaurant Website Development',
  'Hotel Website Development',
  'Educational Institute Websites',
  'Booking and Appointment Systems',
  'Website Redesign',
  'Website Maintenance',
  'Search Engine Optimization',
  'Social Media and Digital Marketing',
  'Other / Not Sure',
  'General Contact',
  'Custom Consultation',
] as const;

export const ALLOWED_PACKAGES = [
  'Starter Package (₹7,999)',
  'Business Package (₹16,999)',
  'Premium Package (₹25,999)',
  'Custom Quote',
] as const;
