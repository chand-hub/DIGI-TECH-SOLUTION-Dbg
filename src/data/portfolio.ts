import { PortfolioProject } from '../types/agency';

// Central portfolio data file — edit entries here to update portfolio cards and case studies.
// All sample/demo builds are explicitly marked DEMO PROJECT; no fabricated clients or metrics.
export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    slug: 'hotel-darbhanga-palace-madhuras',
    title: 'Hotel Darbhanga Palace — Madhuras',
    subtitle: 'Hospitality & Pure-Veg Dining Showcase Website',
    category: 'Restaurant Websites',
    projectStatusLabel: 'LIVE PREVIEW',
    summary:
      'Bilingual hospitality and dining web experience for Hotel Darbhanga Palace (मधुरस), highlighting Indian sweets, snacks, North & South Indian cuisine, gallery, and instant Call / WhatsApp enquiry flows.',
    overview:
      'Designed with a warm royal maroon and heritage gold visual system suited for hospitality in Darbhanga, this showcase presents Hotel Darbhanga Palace and its in-house Madhuras dining experience. Visitors can browse food menus, view the property gallery, submit enquiries, and connect immediately via a one-tap Call or WhatsApp button on desktop and mobile.',
    thumbnail: '/assets/aistudio/image_fedf0405.png',
    secondaryImage: '/assets/aistudio/image_74ec73d2.png',
    secondaryImageCaption: 'Responsive mobile navigation drawer with direct phone call action',
    livePreviewUrl:
      'https://lovable.dev/projects/04e2d949-3155-4fc4-a9a8-a0051d2c99de?preview-path=%2F%23about',
    technologies: ['React', 'Tailwind CSS', 'Mobile Drawer UX', 'WhatsApp Integration'],
    features: [
      'Heritage hospitality hero with Hindi (मधुरस) and English bilingual branding',
      'Responsive top navigation and slide-over mobile drawer with direct Call CTA',
      'Dedicated About, Food Menu, Gallery, Enquiry, and Contact sections',
      'Multi-action hero CTA group: Explore Our Menu, Call Now, and WhatsApp Enquiry',
    ],
    architectureNotes: [
      'Mobile-first navigation drawer designed for effortless thumb access',
      'Zero-friction direct calling and pre-filled WhatsApp enquiry routing',
      'Structured sections ready for menu updates and seasonal festive banners',
    ],
    deliverables: [
      'Responsive Hotel & Restaurant Showcase UI',
      'Mobile Drawer Navigation & Call Action',
      'Food Menu & Gallery Layout',
      'WhatsApp Enquiry Integration',
    ],
    recommendedService: 'Restaurant Website Development',
  },
  {
    slug: 'anmol-rista-matrimonial-platform',
    title: 'Anmol Rista',
    subtitle: 'Bilingual Marriage Bureau & Business Website Demo',
    category: 'Business Websites',
    projectStatusLabel: 'DEMO PROJECT',
    summary:
      'A dignified matrimonial business platform demonstration built to present marriage bureau services, introduce matchmaking workflows, and capture structured enquiries with Hindi and English content support.',
    overview:
      'Anmol Rista demonstrates how regional businesses and marriage bureaus can establish credibility online. The interface pairs respectful editorial typography with bilingual Hindi & English labels, service transparency, and a validated enquiry form connected to WhatsApp.',
    thumbnail: '/src/assets/images/portfolio_anmol_rista_1794894916403.jpg',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Bilingual EN/HI'],
    features: [
      'Clean homepage with clear bureau introduction and service structure',
      'Bilingual Hindi and English content support for regional accessibility',
      'Validated enquiry form with optional project/preference notes',
      'Direct WhatsApp consultation link and responsive mobile layout',
    ],
    architectureNotes: [
      'Marked DEMO PROJECT — designed as a customizable blueprint for service businesses',
      'Privacy-focused enquiry capture without exposing private user data',
      'Fast static asset delivery suited for mobile networks',
    ],
    deliverables: [
      'Bilingual UI Architecture (English / Hindi)',
      'Services & Bureau Trust Sections',
      'Validated Enquiry Flow',
      'Mobile-First Responsive Layout',
    ],
    recommendedService: 'Business Website Development',
  },
  {
    slug: 'hospital-website-demo',
    title: 'Multi-Specialty Hospital & Clinic Demo',
    subtitle: 'Healthcare Portal with Departments, Doctors & Appointment Enquiries',
    category: 'Healthcare Websites',
    projectStatusLabel: 'DEMO PROJECT',
    summary:
      'A clinical, high-trust healthcare website demonstration featuring department directories, specialist doctor profiles, appointment enquiry forms, emergency contacts, and Google Maps integration.',
    overview:
      'Built to demonstrate our Healthcare Website capabilities, this sample project prioritizes clarity under urgency. Patients can locate specialty departments, view doctor profiles, submit appointment requests, or tap WhatsApp/emergency contact links from any mobile device.',
    thumbnail: '/src/assets/images/portfolio_hospital_demo_1794894916244.jpg',
    technologies: ['React', 'TypeScript', 'Cloudflare Pages', 'WhatsApp & Maps'],
    features: [
      'Hospital homepage with clear emergency contact and OPD timings',
      'Departments and medical services directory',
      'Specialist doctor profile cards with qualifications',
      'Appointment enquiry form and Google Maps integration',
    ],
    architectureNotes: [
      'Marked DEMO PROJECT — blueprint adaptable for clinics, nursing homes, and diagnostics',
      'High-contrast typography engineered for readability across age groups',
      'Ready to connect with D1 or Supabase for appointment request logging',
    ],
    deliverables: [
      'Hospital Homepage & Department Directory',
      'Doctor Profiles Grid',
      'Appointment Request Workflow',
      'Emergency Contact & Map Integration',
    ],
    recommendedService: 'Hospital and Clinic Website Development',
  },
  {
    slug: 'restaurant-website-demo',
    title: 'Contemporary Restaurant Website Demo',
    subtitle: 'Digital Menu, Food Categories, Gallery & Table Reservation Enquiry',
    category: 'Restaurant Websites',
    projectStatusLabel: 'DEMO PROJECT',
    summary:
      'An editorial restaurant website demonstration featuring a browsable digital menu, food categories, dining gallery, table enquiry workflow, and WhatsApp takeaway ordering.',
    overview:
      'Created to showcase our Restaurant Website solution, this demo replaces clunky PDF menus with a structured, fast-loading digital menu organized by food categories. Diners can browse dishes, inspect the gallery, request a table reservation, or send a direct WhatsApp order.',
    thumbnail: '/src/assets/images/portfolio_restaurant_demo_1794894917116.jpg',
    technologies: ['React', 'Tailwind CSS', 'Lazy Media', 'WhatsApp Ordering'],
    features: [
      'Restaurant hero and story section highlighting signature dishes',
      'Categorized digital menu with fast mobile browsing',
      'Food and interior gallery with lazy-loaded imagery',
      'Table enquiry form and WhatsApp takeaway order button',
    ],
    architectureNotes: [
      'Marked DEMO PROJECT — customizable for restaurants, cafes, and sweet shops',
      'Optimized image loading so rich food visuals stay fast on slow mobile networks',
      'Cleanly structured menu data for effortless updates',
    ],
    deliverables: [
      'Digital Menu & Category Filters',
      'Dining Gallery Showcase',
      'Table Enquiry & WhatsApp Ordering',
      'Location & Hours Module',
    ],
    recommendedService: 'Restaurant Website Development',
  },
  {
    slug: 'restaurant-management-dashboard-demo',
    title: 'Restaurant Management Dashboard Demo',
    subtitle: 'Web Application for Orders, Tables, Staff, Inventory & Billing',
    category: 'Dashboard Applications',
    projectStatusLabel: 'DEMO PROJECT',
    summary:
      'A restaurant operations dashboard demonstration showcasing daily sales overview, active kitchen order management, live table grid, staff directory, inventory tracking, and invoice previews.',
    overview:
      'This demonstration illustrates how DIGI TECH SOLUTION builds operational dashboards and custom web applications. Designed for restaurant managers and cashiers, the workspace unifies daily sales summaries, kitchen order stages, floor table status, inventory alerts, and invoice previews.',
    thumbnail: '/src/assets/images/portfolio_pos_dashboard_1794894917369.jpg',
    technologies: ['React', 'TypeScript', 'Cloudflare D1', 'REST APIs'],
    features: [
      'Sales overview and daily order volume breakdown',
      'Active kitchen order queue tracking Preparing, Pending, and Ready items',
      'Visual table occupancy grid (Occupied, Available, Reserved)',
      'Inventory tracking, staff overview, and printable invoice preview',
    ],
    architectureNotes: [
      'Marked DEMO PROJECT — custom application blueprint',
      'Backed by parameterized SQL architecture for data integrity',
      'Role-protected admin access separate from public storefront',
    ],
    deliverables: [
      'Sales & Revenue Overview UI',
      'Kitchen Order & Table Grid Views',
      'Inventory & Staff Modules',
      'Invoice Preview Layout',
    ],
    recommendedService: 'Restaurant Management System',
  },
  {
    slug: 'custom-ecommerce-portal-demo',
    title: 'B2C E-commerce & Verified Checkout Demo',
    subtitle: 'Product Catalog, Cart & Server-Verified Razorpay Integration',
    category: 'E-commerce',
    projectStatusLabel: 'DEMO PROJECT',
    summary:
      'A lightweight e-commerce and custom web application demonstration featuring category filtering, responsive cart workflow, Razorpay Checkout integration, and server-side signature verification.',
    overview:
      'Built for retail brands and local businesses selling online across India, this sample architecture combines fast edge static pages with server-side order creation, Razorpay Checkout, HMAC SHA-256 verification, and webhook reconciliation.',
    thumbnail: '/src/assets/images/agency_hero_studio_1794894916229.jpg',
    technologies: ['React', 'Cloudflare Functions', 'Razorpay API', 'Resend Email'],
    features: [
      'Mobile-first catalog designed for slow 3G/4G connections',
      'Server-authoritative order creation and INR pricing checks',
      'HMAC SHA-256 payment verification and webhook status sync',
      'Automated order confirmation via Resend email API',
    ],
    architectureNotes: [
      'Marked DEMO PROJECT — demonstrates secure e-commerce and custom web application stack',
      'Separates public Razorpay Key ID from server-side secrets',
      'Handles pending/authorized/captured states transparently',
    ],
    deliverables: [
      'Responsive Storefront Architecture',
      'Server-Verified Razorpay Checkout',
      'Order Status Recovery Page',
      'Email Notification Workflow',
    ],
    recommendedService: 'E-commerce Website',
  },
];
