import { PricingPackage } from '../types/agency';

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: 'starter',
    name: 'Starter Package',
    formOptionLabel: 'Starter Package (₹7,999)',
    priceInr: 7999,
    priceFormatted: '₹7,999',
    billingNote: 'One-time development price',
    summary:
      'Ideal for local businesses, clinics, and service providers establishing a credible, mobile-ready online presence.',
    supportDays: 15,
    features: [
      'Professional business website',
      'Up to 5 pages',
      'Responsive design',
      'Contact enquiry form',
      'WhatsApp integration',
      'Basic on-page SEO',
      'Google Maps integration',
      'Basic speed optimization',
      '15 days post-launch support',
    ],
  },
  {
    id: 'business',
    name: 'Business Package',
    formOptionLabel: 'Business Package (₹16,999)',
    priceInr: 16999,
    priceFormatted: '₹16,999',
    billingNote: 'One-time development price',
    summary:
      'Designed for growing businesses needing deeper service architecture, email notifications, analytics, and stronger SEO.',
    featured: true,
    supportDays: 30,
    features: [
      'Everything in Starter Package',
      'Up to 10 pages',
      'Premium UI/UX design',
      'Advanced enquiry forms',
      'Email notification integration',
      'Google Business Profile assistance',
      'Social media integration',
      'Advanced SEO setup',
      'Analytics integration',
      '30 days post-launch support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Package',
    formOptionLabel: 'Premium Package (₹25,999)',
    priceInr: 25999,
    priceFormatted: '₹25,999',
    billingNote: 'One-time development price',
    summary:
      'Built for businesses requiring custom workflows, admin dashboards, or third-party API integrations tailored to scope.',
    supportDays: 30,
    features: [
      'Everything in Business Package',
      'Advanced custom website features',
      'Admin dashboard where applicable',
      'Advanced form workflows',
      'Third-party API integration',
      'Advanced performance optimization',
      'Custom functionality according to scope',
      '30 days priority support',
    ],
  },
];

export const PRICING_DISCLOSURES: string[] = [
  'All package prices listed above are one-time website development fees in INR.',
  'Domain registration and hosting/cloud infrastructure charges apply separately where applicable.',
  'Ongoing website maintenance, content updates, and feature additions after the support window are billed separately.',
  'Third-party subscriptions and paid API charges (e.g., transactional email plans, SMS gateways, paid plugins) are billed separately by the respective providers.',
  'Complex custom web applications, multi-vendor marketplaces, or extensive ERP/POS modules receive a separate tailored quotation after discovery.',
];
