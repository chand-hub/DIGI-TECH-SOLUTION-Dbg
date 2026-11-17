import { FaqItem } from '../types/agency';

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'timeline',
    category: 'Delivery & Tech',
    question: 'How long does it take to build a website?',
    answer:
      'A Starter business website (up to 5 pages) typically takes 7 to 10 working days once content and requirements are finalized. Business websites take 2 to 3 weeks, while custom web applications and admin dashboards are scheduled according to agreed project milestones.',
  },
  {
    id: 'domain-hosting',
    category: 'Pricing & Billing',
    question: 'Are domain name and hosting included in the package prices?',
    answer:
      'No. The listed prices (₹7,999, ₹16,999, and ₹25,999) cover one-time design and development only. Domain registration, third-party hosting, email subscriptions, and paid API usage are billed separately so you maintain direct ownership of your domain and accounts.',
  },
  {
    id: 'custom-apps',
    category: 'Pricing & Billing',
    question: 'Are complex web apps like full restaurant POS or e-commerce marketplaces included in ₹25,999?',
    answer:
      'The Premium Package covers custom website features and scoped admin dashboards. Full-scale multi-user management systems, large inventory/POS software, or complex custom integrations are evaluated during discovery and quoted separately based on exact scope.',
  },
  {
    id: 'payment-terms',
    category: 'Pricing & Billing',
    question: 'How do payments work?',
    answer:
      'Once you submit an enquiry and confirm your scope or package, you receive a unique Enquiry Reference Number. Approved advances or fixed package payments can be processed securely online via Razorpay (with server-side signature verification) or via an official invoice.',
  },
  {
    id: 'enquiry-delivery',
    category: 'Support & Security',
    question: 'How are enquiry forms and customer leads secured?',
    answer:
      'All enquiry forms validate inputs on both the browser and the server, protect against automated spam and duplicate submissions, store records using parameterized database queries in Cloudflare D1, and deliver structured notifications without exposing API keys in browser code.',
  },
  {
    id: 'mobile-first',
    category: 'Delivery & Tech',
    question: 'Will my website work smoothly on Android phones and tablets?',
    answer:
      'Yes. Every website we build is tested across Android smartphones, tablets, laptops, and desktop viewports with readable typography, properly sized touch targets, and fast-loading assets.',
  },
  {
    id: 'maintenance',
    category: 'Support & Security',
    question: 'What happens after the included 15 or 30 days of support?',
    answer:
      'After the complimentary post-launch support window ends, you can request ad-hoc updates or choose a separate ongoing maintenance plan covering content updates, security checks, and technical support.',
  },
  {
    id: 'location-remote',
    category: 'General',
    question: 'Do you work only in Darbhanga, Bihar or across India?',
    answer:
      'DIGI TECH SOLUTION is based in Darbhanga, Bihar, India and works seamlessly with businesses both locally and remotely across India via WhatsApp, phone, and email.',
  },
];
