import { ServiceItem } from '../types/agency';

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'business-website',
    number: '01',
    title: 'Business Website Development',
    category: 'Websites',
    shortSummary:
      'Clean, fast-loading corporate websites built to establish credibility and turn visitors into enquiries.',
    description:
      'Your website is often the first place prospective customers evaluate your business. We design and engineer responsive, structured company websites tailored to your services, regional market, and lead goals.',
    benefits: [
      'Builds instant credibility with prospective customers and partners',
      'Mobile-first layouts engineered for fast loading on Indian mobile networks',
      'Direct WhatsApp and validated enquiry forms to capture leads reliably',
    ],
    features: [
      'Custom responsive UI/UX across mobile, tablet, and desktop',
      'Service pages, company profile, and structured enquiry workflows',
      'Technical on-page SEO, clean semantic markup, and Google Maps embed',
    ],
    previewHighlights: ['Hero value clarity', 'Validated lead capture', 'Search-ready markup'],
    recommendedPackage: 'Starter Package (₹7,999)',
  },
  {
    id: 'hospital-clinic-website',
    number: '02',
    title: 'Hospital and Clinic Website Development',
    category: 'Industry Solutions',
    shortSummary:
      'Trustworthy healthcare websites featuring departments, specialist profiles, emergency contacts, and appointment requests.',
    description:
      'Patients and families need clear information quickly—especially during urgent situations. We structure hospital and clinic websites so departments, doctor schedules, directions, and appointment forms are effortless to use.',
    benefits: [
      'Helps patients locate departments, timings, and specialist doctors fast',
      'Reduces reception phone load through structured online appointment enquiries',
      'Clear emergency helpline and clinic directions on mobile screens',
    ],
    features: [
      'Department directory and doctor profile cards with qualifications',
      'Appointment request form with preferred doctor and slot selection',
      'WhatsApp helpline, emergency bar, and Google Maps location integration',
    ],
    previewHighlights: ['Doctor & department directory', 'Appointment request workflow', 'Emergency & map quick-access'],
    recommendedPackage: 'Business Package (₹16,999)',
  },
  {
    id: 'restaurant-website',
    number: '03',
    title: 'Restaurant Website Development',
    category: 'Industry Solutions',
    shortSummary:
      'Appetizing digital menus, food categories, photo galleries, table enquiries, and WhatsApp ordering links.',
    description:
      'Give diners an inviting digital storefront that showcases your dishes, specialties, and ambiance while making table enquiries and direct food orders straightforward from any smartphone.',
    benefits: [
      'Showcases signature dishes, sweets, and dining ambiance cleanly',
      'Eliminates PDF menu friction with browsable mobile food categories',
      'Drives direct table bookings and WhatsApp takeaway enquiries',
    ],
    features: [
      'Categorized digital menu (Starters, Main Course, Sweets, Beverages)',
      'Table reservation & catering enquiry form',
      'Gallery showcase, opening hours, and WhatsApp ordering integration',
    ],
    previewHighlights: ['Filterable food menu', 'Table & banquet enquiry', 'Direct WhatsApp order CTA'],
    recommendedPackage: 'Starter Package (₹7,999)',
  },
  {
    id: 'hotel-website',
    number: '04',
    title: 'Hotel Website Development',
    category: 'Industry Solutions',
    shortSummary:
      'Hospitality websites showcasing rooms, banquet halls, dining menus, photo galleries, and direct booking enquiries.',
    description:
      'Designed for hotels, guest houses, and banquet venues—combining refined visual presentation with room details, in-house dining highlights, and direct enquiry channels that reduce third-party commission dependency.',
    benefits: [
      'Encourages direct room and banquet hall enquiries without aggregator fees',
      'Highlights amenities, location landmarks, and in-house restaurant menus',
      'Bilingual or cultural branding support when needed for local markets',
    ],
    features: [
      'Room & suite showcase with amenities and tariff overview',
      'Banquet / event enquiry and room availability request forms',
      'Integrated dining menu showcase, gallery, and call/WhatsApp actions',
    ],
    previewHighlights: ['Room & banquet showcase', 'Direct enquiry funnel', 'Mobile navigation drawer'],
    recommendedPackage: 'Business Package (₹16,999)',
  },
  {
    id: 'educational-institute',
    number: '05',
    title: 'Educational Institute Websites',
    category: 'Industry Solutions',
    shortSummary:
      'Structured websites for schools, coaching institutes, and colleges with courses, notices, faculty, and admission forms.',
    description:
      'Parents and students expect clarity and transparency when researching an educational institute. We build organized portals for courses, admission enquiries, academic calendars, and official notices.',
    benefits: [
      'Centralizes admission guidelines, fee enquiry forms, and course details',
      'Easy-to-update notice board and downloadable brochure structure',
      'Builds parent confidence through clear faculty and campus presentation',
    ],
    features: [
      'Courses, batches, and curriculum overview pages',
      'Online admission enquiry form with email notification',
      'Notice & announcement board, faculty directory, and campus gallery',
    ],
    previewHighlights: ['Courses & batches grid', 'Admission enquiry form', 'Notice & announcement panel'],
    recommendedPackage: 'Business Package (₹16,999)',
  },
  {
    id: 'ecommerce-website',
    number: '06',
    title: 'E-commerce Website Development',
    category: 'Industry Solutions',
    shortSummary:
      'Secure online stores with product catalogs, cart workflows, order management, and verified payment gateways.',
    description:
      'Launch a custom online storefront tailored to your catalog and fulfillment process—complete with structured product filtering, mobile checkout, and server-verified Razorpay payment workflows.',
    benefits: [
      'Full ownership of customer relationships and brand presentation',
      'Server-verified payment processing and order confirmation records',
      'Optimized product pages built for search visibility and mobile checkout',
    ],
    features: [
      'Category filters, product variants, and search-friendly product pages',
      'Shopping cart, checkout flow, and Razorpay payment verification',
      'Order confirmation emails and admin order tracking foundation',
    ],
    previewHighlights: ['Product catalog & filters', 'Razorpay checkout flow', 'Order status tracking'],
    recommendedPackage: 'Premium Package (₹25,999)',
  },
  {
    id: 'custom-web-applications',
    number: '07',
    title: 'Custom Web Applications',
    category: 'Web Apps & Systems',
    shortSummary:
      'Tailored full-stack software built on React, TypeScript, and edge databases to solve specific operational workflows.',
    description:
      'When off-the-shelf templates fall short, we engineer custom web applications with structured databases, role-based access, third-party APIs, and clean administrative interfaces.',
    benefits: [
      'Automates repetitive manual spreadsheets and paper workflows',
      'Built on modern edge infrastructure for speed, reliability, and security',
      'Scoped transparently with clear milestones and documented APIs',
    ],
    features: [
      'React + TypeScript frontend paired with Cloudflare Pages Functions & D1',
      'Role-based authentication, validation, and secure API integrations',
      'Custom reporting, exports, and automated email/webhook notifications',
    ],
    previewHighlights: ['Custom business logic', 'Cloudflare D1 persistence', 'API & webhook security'],
    recommendedPackage: 'Premium Package (₹25,999)',
  },
  {
    id: 'admin-dashboard-development',
    number: '08',
    title: 'Admin Dashboard Development',
    category: 'Web Apps & Systems',
    shortSummary:
      'Role-protected internal consoles to manage leads, bookings, orders, staff permissions, and operational records.',
    description:
      'Give your team a dedicated control panel to search records, update statuses, review payment confirmations, and keep daily operations organized in one secure interface.',
    benefits: [
      'Replaces scattered WhatsApp chats and spreadsheets with structured records',
      'Role-protected access with server-side authentication checks',
      'Clear tabular views designed for rapid daily operational review',
    ],
    features: [
      'Searchable, filterable lead, booking, or order tables',
      'Status workflow updates with audit-friendly timestamps',
      'Token or session-verified backend endpoints with strict access control',
    ],
    previewHighlights: ['Protected lead & order table', 'Status update workflow', 'Payment reconciliation view'],
    recommendedPackage: 'Premium Package (₹25,999)',
  },
  {
    id: 'restaurant-management-systems',
    number: '09',
    title: 'Restaurant Management Systems',
    category: 'Web Apps & Systems',
    shortSummary:
      'Web-based billing, table management, kitchen order queues, staff tracking, and inventory overview systems.',
    description:
      'Purpose-built web software for restaurants and cafes to track live table occupancy, kitchen order stages, GST-ready invoice previews, staff shifts, and stock levels from any browser.',
    benefits: [
      'Coordinates front-of-house table status with kitchen preparation queues',
      'Standardizes billing, invoice generation, and daily sales summaries',
      'Accessible across tablets, counter desktops, and manager devices',
    ],
    features: [
      'Live table occupancy grid and dine-in/takeaway order management',
      'Daily sales overview, invoice preview, and menu item controls',
      'Staff role tracking and low-stock inventory alerts',
    ],
    previewHighlights: ['Table & KOT workflow', 'Sales & invoice overview', 'Inventory & staff panel'],
    recommendedPackage: 'Premium Package (₹25,999)',
  },
  {
    id: 'booking-appointment-systems',
    number: '10',
    title: 'Booking and Appointment Systems',
    category: 'Web Apps & Systems',
    shortSummary:
      'Automated scheduling workflows for clinics, salons, consultants, and service providers with email confirmations.',
    description:
      'Let customers pick a service, submit preferred date and time slots, receive automated confirmation emails with reference numbers, and optionally pay an advance booking fee.',
    benefits: [
      'Captures structured booking details 24/7 without manual back-and-forth',
      'Generates unique reference IDs and automated confirmation emails',
      'Optional server-verified advance payment integration via Razorpay',
    ],
    features: [
      'Service & slot selection form with Indian phone and email validation',
      'Database persistence with duplicate-booking protection',
      'Email alerts to business owner and confirmation receipt to customer',
    ],
    previewHighlights: ['Slot & service selector', 'Reference ID generation', 'Automated email alerts'],
    recommendedPackage: 'Business Package (₹16,999)',
  },
  {
    id: 'website-redesign',
    number: '11',
    title: 'Website Redesign',
    category: 'Growth & Care',
    shortSummary:
      'Modernize outdated, slow, or non-responsive websites into clean, mobile-ready platforms without losing SEO equity.',
    description:
      'If your existing website looks dated on mobile phones, loads slowly, or fails to generate enquiries, we rebuild its architecture, typography, and conversion pathways from the ground up.',
    benefits: [
      'Dramatically improves mobile usability, visual trust, and page speed',
      'Preserves key URLs and improves technical SEO structure',
      'Replaces broken contact forms with reliable database & email workflows',
    ],
    features: [
      'UI/UX audit and complete responsive layout modernization',
      'Semantic HTML, accessibility improvements, and Core Web Vitals tuning',
      'Updated enquiry, WhatsApp, and analytics integrations',
    ],
    previewHighlights: ['Mobile-first layout upgrade', 'Speed & CWV optimization', 'Modern lead forms'],
    recommendedPackage: 'Business Package (₹16,999)',
  },
  {
    id: 'website-maintenance',
    number: '12',
    title: 'Website Maintenance',
    category: 'Growth & Care',
    shortSummary:
      'Ongoing updates, security checks, content edits, uptime reviews, and technical support billed transparently.',
    description:
      'Keep your live website healthy, accurate, and secure after launch. Our separate maintenance plans cover routine content updates, dependency hygiene, form monitoring, and priority technical assistance.',
    benefits: [
      'Keeps prices, menus, notices, and banners current without technical hassle',
      'Proactive security headers, dependency updates, and backup checks',
      'Predictable monthly or quarterly retainer separate from build costs',
    ],
    features: [
      'Content, image, and page updates on scheduled turnaround',
      'Form delivery checks, SSL/DNS monitoring, and error audits',
      'Priority support channel via email and WhatsApp',
    ],
    previewHighlights: ['Content & menu updates', 'Security & form audits', 'Dedicated support SLA'],
    recommendedPackage: 'Custom Quote',
  },
  {
    id: 'seo',
    number: '13',
    title: 'Search Engine Optimization',
    category: 'Growth & Care',
    shortSummary:
      'Technical SEO, structured Schema.org markup, local search readiness, and keyword-aligned content architecture.',
    description:
      'Help customers searching for your services in Darbhanga, Bihar, and across India find your business organically through clean technical foundations, metadata discipline, and local search signals.',
    benefits: [
      'Improves visibility for local and regional commercial search terms',
      'Ensures search engines index your pages cleanly with Schema.org data',
      'Pairs Google Business Profile setup with on-page structure',
    ],
    features: [
      'Title, meta description, OpenGraph, and canonical URL optimization',
      'XML sitemap, robots.txt, and Schema.org structured JSON-LD',
      'Google Business Profile setup guidance and local landing structure',
    ],
    previewHighlights: ['Schema.org JSON-LD', 'Local search alignment', 'Technical crawl hygiene'],
    recommendedPackage: 'Business Package (₹16,999)',
  },
  {
    id: 'social-media-digital-marketing',
    number: '14',
    title: 'Social Media and Digital Marketing',
    category: 'Growth & Care',
    shortSummary:
      'Coordinated campaign landing pages, tracking setup, and conversion funnels aligned with your social presence.',
    description:
      'Connect your Instagram, Facebook, and Google presence to high-clarity landing pages so every campaign click lands on a focused page ready to convert into a WhatsApp conversation or enquiry.',
    benefits: [
      'Aligns social media traffic with dedicated, fast-loading landing pages',
      'Integrates analytics tracking to measure real enquiry conversions',
      'Consistent brand presentation across website and social channels',
    ],
    features: [
      'Campaign landing pages with prefilled WhatsApp & enquiry CTAs',
      'OpenGraph social share cards and analytics event integration',
      'Local brand visibility strategy tailored to your business category',
    ],
    previewHighlights: ['Campaign landing funnels', 'Social share cards', 'Conversion analytics'],
    recommendedPackage: 'Business Package (₹16,999)',
  },
];
