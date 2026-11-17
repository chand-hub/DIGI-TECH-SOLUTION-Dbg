import { Language } from '../types/agency';

export const AGENCY_CONFIG = {
  brandName: 'DIGI TECH SOLUTION',
  tagline: 'Your Digital Growth Partner.',
  taglineHi: 'आपका डिजिटल विकास भागीदार।',
  email: 'educationrevolution90@gmail.com',
  location: 'Darbhanga, Bihar, India',
  whatsappDisplay: '+91 73197 85754',
  defaultWhatsappNumber: '917319785754',
  heroStudioImage: '/src/assets/images/agency_hero_studio_1794894916229.jpg',
};

export const CORE_ENQUIRY_SERVICES = [
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
  'Other / Not Sure',
] as const;

export const UI_COPY: Record<
  Language,
  {
    heroHeading: string;
    heroSubheading: string;
    ctaConsultation: string;
    ctaServices: string;
    ctaWhatsapp: string;
    aboutTitle: string;
    servicesTitle: string;
    portfolioTitle: string;
    whyTitle: string;
    processTitle: string;
    pricingTitle: string;
    faqTitle: string;
    enquiryTitle: string;
    contactTitle: string;
  }
> = {
  en: {
    heroHeading: 'Grow Your Business with Smart Digital Solutions.',
    heroSubheading:
      'We help businesses establish their online presence through professional websites, digital experiences, and technology solutions.',
    ctaConsultation: 'Get a Free Consultation',
    ctaServices: 'Explore Our Services',
    ctaWhatsapp: 'WhatsApp Us',
    aboutTitle: 'About DIGI TECH SOLUTION',
    servicesTitle: 'Our Services',
    portfolioTitle: 'Portfolio & Demo Projects',
    whyTitle: 'Why Choose Us',
    processTitle: 'Our Working Process',
    pricingTitle: 'Pricing & Request a Quote',
    faqTitle: 'Frequently Asked Questions',
    enquiryTitle: 'Start Your Project Enquiry',
    contactTitle: 'Contact Information',
  },
  hi: {
    heroHeading: 'स्मार्ट डिजिटल समाधानों के साथ अपने व्यवसाय को आगे बढ़ाएं।',
    heroSubheading:
      'हम पेशेवर वेबसाइट, डिजिटल अनुभव और आधुनिक तकनीकी समाधानों के माध्यम से व्यवसायों को ऑनलाइन पहचान बनाने में मदद करते हैं।',
    ctaConsultation: 'मुफ्त परामर्श प्राप्त करें',
    ctaServices: 'हमारी सेवाएं देखें',
    ctaWhatsapp: 'व्हाट्सएप करें',
    aboutTitle: 'DIGI TECH SOLUTION के बारे में',
    servicesTitle: 'हमारी प्रमुख सेवाएं',
    portfolioTitle: 'पोर्टफोलियो और डेमो प्रोजेक्ट्स',
    whyTitle: 'हमें क्यों चुनें',
    processTitle: 'हमारी कार्य प्रक्रिया',
    pricingTitle: 'पैकेज और कोटेशन अनुरोध',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    enquiryTitle: 'प्रोजेक्ट पूछताछ फॉर्म',
    contactTitle: 'संपर्क जानकारी',
  },
};

export function buildWhatsAppUrl(
  phoneNumber: string,
  options?: {
    service?: string;
    packageName?: string;
    referenceNumber?: string;
    customMessage?: string;
  }
): string {
  const cleanNumber = (phoneNumber || AGENCY_CONFIG.defaultWhatsappNumber).replace(/[^\d]/g, '');

  let message = 'Hello DIGI TECH SOLUTION, I am interested in your digital services. Please contact me.';

  if (options?.customMessage) {
    message = `Hello DIGI TECH SOLUTION, ${options.customMessage}`;
  } else if (options?.referenceNumber) {
    message = `Hello DIGI TECH SOLUTION, I just submitted an enquiry (Reference: ${options.referenceNumber}). Please contact me to discuss next steps.`;
  } else if (options?.packageName && options?.service) {
    message = `Hello DIGI TECH SOLUTION, I am interested in the ${options.packageName} for ${options.service}. Please contact me.`;
  } else if (options?.packageName) {
    message = `Hello DIGI TECH SOLUTION, I am interested in the ${options.packageName}. Please share details.`;
  } else if (options?.service) {
    message = `Hello DIGI TECH SOLUTION, I am interested in ${options.service}. Please contact me.`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function formatInr(amountInr: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountInr);
}
