import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ExternalLink,
  Globe,
  Layers,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { EnquiryForm } from '../components/EnquiryForm';
import { HeroVideoShowcase } from '../components/HeroVideoShowcase';
import { RevealSection } from '../components/RevealSection';
import { SafeImage } from '../components/SafeImage';
import { AGENCY_CONFIG, buildWhatsAppUrl } from '../config/agency';
import { FAQ_ITEMS } from '../data/faq';
import { PORTFOLIO_PROJECTS } from '../data/portfolio';
import { PRICING_DISCLOSURES, PRICING_PACKAGES } from '../data/pricing';
import { Language, PortfolioCategory, RoutePath, RuntimeConfig } from '../types/agency';

interface HomePageProps {
  language: Language;
  onToggleLanguage: () => void;
  runtimeConfig: RuntimeConfig;
  onNavigate: (path: RoutePath, query?: string) => void;
  onSelectServiceForQuote: (serviceTitle: string) => void;
  onSelectPackageForQuote: (packageLabel: string) => void;
}

const PORTFOLIO_FILTERS: PortfolioCategory[] = [
  'All',
  'Business Websites',
  'Healthcare Websites',
  'Restaurant Websites',
  'E-commerce',
  'Dashboard Applications',
  'Custom Web Applications',
];

const HOME_SERVICES = [
  {
    id: 'professional-website',
    number: '01',
    icon: Globe,
    title: 'Professional Website Development',
    quoteService: 'Business Website Development',
    category: 'Corporate & Local Business',
    summary:
      'High-credibility, responsive websites engineered for businesses, startups, and institutions to convert visitors into direct enquiries.',
    highlights: ['Mobile-first layouts', 'SEO & Google Maps ready'],
    spanClass: 'lg:col-span-6',
  },
  {
    id: 'ecommerce-website',
    number: '02',
    icon: ShoppingBag,
    title: 'E-commerce Website Development',
    quoteService: 'E-commerce Website',
    category: 'Online Retail & Storefronts',
    summary:
      'Custom product catalogs, cart workflows, and server-verified Razorpay checkout supporting UPI, cards, and netbanking.',
    highlights: ['Verified INR checkout', 'Order email confirmations'],
    spanClass: 'lg:col-span-6',
  },
  {
    id: 'business-management-systems',
    number: '03',
    icon: LayoutDashboard,
    title: 'Business Management Systems',
    quoteService: 'Dashboard / Admin Panel Development',
    category: 'Custom Web Apps & Dashboards',
    summary:
      'Role-protected internal dashboards and custom web software for managing leads, staff operations, bookings, and records.',
    highlights: ['Cloudflare D1 persistence', 'Role-protected admin access'],
    spanClass: 'lg:col-span-4',
  },
  {
    id: 'restaurant-hotel-solutions',
    number: '04',
    icon: UtensilsCrossed,
    title: 'Restaurant and Hotel Digital Solutions',
    quoteService: 'Restaurant Management System',
    category: 'Hospitality & Dining',
    summary:
      'Interactive digital menus, banquet/room showcase sites, table booking funnels, and browser-based POS management workflows.',
    highlights: ['Digital menu & gallery', 'Direct WhatsApp table/room enquiry'],
    spanClass: 'lg:col-span-4',
  },
  {
    id: 'hospital-clinic-websites',
    number: '05',
    icon: Stethoscope,
    title: 'Hospital and Clinic Websites',
    quoteService: 'Hospital and Clinic Website Development',
    category: 'Healthcare Portals',
    summary:
      'Clear department directories, doctor profiles, emergency contact access, and appointment request forms designed for patient clarity.',
    highlights: ['Doctor & department directory', 'Instant appointment request flow'],
    spanClass: 'lg:col-span-4',
  },
  {
    id: 'ai-workflow-automation',
    number: '06',
    icon: Bot,
    title: 'AI and Business Workflow Automation',
    quoteService: 'Custom Web Application',
    category: 'Smart Integrations & APIs',
    summary:
      'Automated lead capture routing, WhatsApp enquiry triggers, Resend transactional email workflows, and webhook-driven operations.',
    highlights: ['Automated email & WhatsApp routing', 'Webhook & API orchestration'],
    spanClass: 'lg:col-span-6',
  },
  {
    id: 'website-maintenance-support',
    number: '07',
    icon: Wrench,
    title: 'Website Maintenance and Support',
    quoteService: 'Other / Not Sure',
    category: 'Ongoing Care & Security',
    summary:
      'Scheduled content updates, dependency security hygiene, form delivery monitoring, and priority technical assistance billed separately.',
    highlights: ['Security & SSL monitoring', 'Dedicated WhatsApp & email care'],
    spanClass: 'lg:col-span-6',
  },
] as const;

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Discovery and Consultation',
    detail: 'Clarify your business goals, target audience, required pages, and functional scope.',
  },
  {
    step: '02',
    title: 'Planning and Strategy',
    detail: 'Define information architecture, user journeys, database structure, and timelines.',
  },
  {
    step: '03',
    title: 'UI/UX Design',
    detail: 'Craft clean, mobile-first layouts and accessible interaction patterns for review.',
  },
  {
    step: '04',
    title: 'Development',
    detail: 'Build responsive React interfaces, edge APIs, Resend alerts, and verified payments.',
  },
  {
    step: '05',
    title: 'Testing and Quality Assurance',
    detail: 'Verify Android mobile responsiveness, form security, payment checks, and SEO tags.',
  },
  {
    step: '06',
    title: 'Launch and Support',
    detail: 'Deploy on Cloudflare Pages with HTTPS, custom domain, and post-launch care.',
  },
] as const;

const WHY_CHOOSE_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Genuine Full-Stack Engineering',
    desc: 'Every website combines clean frontend typography with real server-side validation, Cloudflare D1 persistence, and protected API endpoints.',
  },
  {
    icon: Smartphone,
    title: 'Engineered for Indian Mobile Networks',
    desc: 'Code-split routes, lazy-loaded imagery, and ≥ 44px touch targets keep navigation snappy on Android phones over 3G/4G connections.',
  },
  {
    icon: Lock,
    title: 'Verified Payment & Data Security',
    desc: 'Razorpay orders and HMAC SHA-256 signature verification run exclusively on the server—never trusting client-only callbacks or exposing secrets.',
  },
  {
    icon: Layers,
    title: 'Honest Scope & Direct Communication',
    desc: 'Transparent INR package pricing, clear maintenance separation, and direct access to our Darbhanga team via WhatsApp (+91 73197 85754) and email.',
  },
] as const;

const HERO_COPY = {
  en: {
    eyebrow: 'Your Digital Growth Partner',
    headline: 'We Build Digital Experiences That Grow Businesses.',
    subheading:
      'From professional websites to intelligent business solutions, we help businesses establish their digital presence, streamline operations and grow with technology.',
    ctaPrimary: 'Start Your Project',
    ctaSecondary: 'Explore Our Work',
    ctaWhatsapp: 'WhatsApp Us',
  },
  hi: {
    eyebrow: 'आपका डिजिटल विकास भागीदार',
    headline: 'हम ऐसे डिजिटल अनुभव बनाते हैं जो व्यवसाय को आगे बढ़ाते हैं।',
    subheading:
      'पेशेवर वेबसाइट से लेकर स्मार्ट बिजनेस सॉल्यूशंस तक, हम व्यवसायों को मजबूत ऑनलाइन पहचान बनाने, संचालन को सरल करने और तकनीक के साथ बढ़ने में मदद करते हैं।',
    ctaPrimary: 'अपना प्रोजेक्ट शुरू करें',
    ctaSecondary: 'हमारा काम देखें',
    ctaWhatsapp: 'व्हाट्सएप करें',
  },
} as const;

export function HomePage({
  language,
  onToggleLanguage,
  runtimeConfig,
  onNavigate,
  onSelectServiceForQuote,
  onSelectPackageForQuote,
}: HomePageProps) {
  const [activePortfolioFilter, setActivePortfolioFilter] = useState<PortfolioCategory>('All');
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_ITEMS[0].id);

  const heroText = HERO_COPY[language];

  const filteredPortfolio =
    activePortfolioFilter === 'All'
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter((p) => p.category === activePortfolioFilter);

  return (
    <div className="overflow-x-hidden">
      {/* SECTION 2: HERO SECTION */}
      <section className="hero-grid-surface relative overflow-hidden bg-[#0B1020] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(37,99,235,0.24),transparent_46%),radial-gradient(circle_at_88%_78%,rgba(0,212,255,0.14),transparent_44%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-24">
          {/* Top Hero Utility Row: Eyebrow + Language Switcher */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#00D4FF]">
              {heroText.eyebrow}
            </p>

            <div
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-[#111827]/90 p-1 text-xs"
              role="group"
              aria-label="Language switcher"
            >
              <button
                type="button"
                onClick={() => language !== 'en' && onToggleLanguage()}
                className={`min-h-[30px] rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap shrink-0 ${
                  language === 'en' ? 'bg-[#2563EB] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => language !== 'hi' && onToggleLanguage()}
                className={`min-h-[30px] rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap shrink-0 ${
                  language === 'hi' ? 'bg-[#2563EB] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Two-Column Hero Grid */}
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Headline, Copy & CTAs */}
            <div className="lg:col-span-7">
              <h1 className="font-display text-[clamp(2.25rem,4.1vw,3.55rem)] font-bold leading-[1.1] tracking-tight text-white">
                {heroText.headline}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {heroText.subheading}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#home-enquiry"
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#1D4ED8] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4FF]"
                >
                  <span>{heroText.ctaPrimary}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => onNavigate('/portfolio')}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-lg border border-slate-600/90 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white/10 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4FF]"
                >
                  {heroText.ctaSecondary}
                </button>

                <a
                  href={buildWhatsAppUrl(runtimeConfig.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#15803D] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4FF]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>{heroText.ctaWhatsapp}</span>
                </a>
              </div>

              <div className="mt-8 border-t border-slate-800/90 pt-6">
                <p className="text-xs font-medium text-slate-400">
                  Built for Hospitals &amp; Clinics · Restaurants &amp; Hotels · Educational Institutes · SMEs &amp; Startups
                </p>
              </div>
            </div>

            {/* Right Column: Vertical 9:16 3D Animated Showcase */}
            <div className="flex justify-center lg:col-span-5 lg:justify-end">
              <HeroVideoShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRUST AND CREDIBILITY */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-6">
                <p className="text-sm font-semibold text-[#2563EB]">
                  About DIGI TECH SOLUTION
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020] sm:text-4xl">
                  Technology That Moves Your Business Forward.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#64748B]">
                  Operating from Darbhanga, Bihar, India, DIGI TECH SOLUTION designs and develops fast websites, e-commerce platforms, and custom management applications for growing organizations across India. Every build emphasizes practical commercial usability—clear mobile navigation, structured lead capture, WhatsApp connectivity, and server-verified online payments.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                  <div>
                    <div className="font-display text-sm font-bold text-[#0B1020]">
                      Edge Cloud Architecture
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                      React &amp; TypeScript interfaces paired with Cloudflare Pages Functions and D1 SQL storage.
                    </p>
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-[#0B1020]">
                      Verified Lead &amp; Payment Flows
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                      Resend transactional email alerts and HMAC-SHA256 verified Razorpay checkout.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-5">
                  <button
                    type="button"
                    onClick={() => onNavigate('/about')}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#0B1020] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E293B]"
                  >
                    <span>About Our Agency</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="text-xs font-medium text-[#64748B]">
                    Darbhanga, Bihar · Serving Businesses Across India
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                  <SafeImage
                    src={AGENCY_CONFIG.heroStudioImage}
                    alt="DIGI TECH SOLUTION software and web engineering studio"
                    fallbackTitle="DIGI TECH SOLUTION Engineering Studio"
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* SECTION 4: SERVICES (7 CORE CARDS) */}
      <section className="bg-[#F8FAFC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-[#2563EB]">Our Capabilities</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020] sm:text-4xl">
                  Digital Solutions Built for Real Operations
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/services')}
                className="inline-flex min-h-[42px] items-center gap-1.5 text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8] whitespace-nowrap shrink-0"
              >
                <span>Explore Full Service Catalog</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
              {HOME_SERVICES.map((srv) => {
                const Icon = srv.icon;
                return (
                  <article
                    key={srv.id}
                    className={`group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-md ${srv.spanClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-[#F8FAFC] text-[#2563EB] transition-colors group-hover:border-[#2563EB]/30 group-hover:bg-[#2563EB] group-hover:text-white">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="text-xs font-medium text-[#64748B]">
                          {srv.number} · {srv.category}
                        </span>
                      </div>

                      <h3 className="mt-5 font-display text-xl font-bold text-[#0B1020]">
                        {srv.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{srv.summary}</p>

                      <ul className="mt-4 space-y-1.5 text-sm text-[#111827]">
                        {srv.highlights.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <Check className="h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => onNavigate('/services')}
                        className="inline-flex min-h-[36px] items-center gap-1.5 text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectServiceForQuote(srv.quoteService)}
                        className="min-h-[36px] text-xs font-semibold text-[#64748B] transition-colors hover:text-[#0B1020]"
                      >
                        Request Quote
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* SECTION 5: FEATURED PORTFOLIO */}
      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="flex flex-col justify-between gap-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold text-[#2563EB]">Featured Portfolio</p>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020] sm:text-4xl">
                    Live Showcases &amp; Sample Blueprints
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
                    Sample architecture projects are transparently labeled as DEMO PROJECT alongside our live showcase preview.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/portfolio')}
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap shrink-0"
                >
                  <span>All Portfolio Projects</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div
                className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5"
                role="group"
                aria-label="Filter portfolio projects"
              >
                {PORTFOLIO_FILTERS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActivePortfolioFilter(cat)}
                    className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      activePortfolioFilter === cat
                        ? 'bg-white text-[#0B1020] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0B1020]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filteredPortfolio.map((project, index) => (
                <article
                  key={project.slug}
                  className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
                    index === 0 && activePortfolioFilter === 'All' ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                >
                  {/* Browser / Device Mockup Frame */}
                  <div className="border-b border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-[#0B1020]">
                        {project.projectStatusLabel}
                      </span>
                    </div>
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <SafeImage
                        src={project.thumbnail}
                        alt={`${project.title} showcase interface`}
                        fallbackTitle={project.title}
                        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                        <span>{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#2563EB]">
                          {project.projectStatusLabel}
                        </span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold text-[#0B1020]">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                        {project.summary}
                      </p>
                      <p className="mt-3 text-xs text-[#64748B]">
                        Stack: {project.technologies.join(' · ')}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-200/80 pt-4">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/portfolio/${project.slug}`)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#0B1020] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E293B]"
                      >
                        <span>View Project</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      {project.livePreviewUrl && (
                        <a
                          href={project.livePreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          <span>Open Preview</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* SECTION 6: PRICING */}
      <section className="bg-[#F8FAFC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-[#2563EB]">Transparent INR Packages</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020] sm:text-4xl">
                  Website Development Packages
                </h2>
                <p className="mt-2 text-sm text-[#64748B]">
                  One-time project pricing in INR (₹). Domain, hosting, and ongoing maintenance are billed separately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/pricing')}
                className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap shrink-0"
              >
                <span>Open Pricing &amp; Razorpay Checkout</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {PRICING_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`flex flex-col justify-between rounded-2xl border bg-white p-7 transition-all duration-200 hover:-translate-y-0.5 ${
                    pkg.featured
                      ? 'border-[#2563EB] shadow-lg ring-1 ring-[#2563EB]/20'
                      : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                      <span>{pkg.billingNote}</span>
                      {pkg.featured && (
                        <span className="font-semibold text-[#2563EB]">Recommended</span>
                      )}
                    </div>

                    <h3 className="mt-2 font-display text-xl font-bold text-[#0B1020]">{pkg.name}</h3>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="font-display text-4xl font-bold text-[#0B1020] tabular-nums">
                        {pkg.priceFormatted}
                      </span>
                      <span className="text-xs text-[#64748B]">INR</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{pkg.summary}</p>

                    <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-sm text-[#111827]">
                      {pkg.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]"
                            aria-hidden="true"
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectPackageForQuote(pkg.formOptionLabel)}
                      className={`flex min-h-[44px] w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                        pkg.featured
                          ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                          : 'bg-[#0B1020] text-white hover:bg-[#1E293B]'
                      }`}
                    >
                      Request a Quote
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('/pricing')}
                        className="flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0B1020] transition-colors hover:bg-slate-50"
                      >
                        Payment Portal
                      </button>
                      <a
                        href={buildWhatsAppUrl(runtimeConfig.whatsappNumber, {
                          packageName: pkg.name,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0B1020] transition-colors hover:bg-slate-50"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-display text-sm font-bold text-[#0B1020]">
                Transparent Scope &amp; Separate Charges Policy
              </h3>
              <ul className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#64748B] md:grid-cols-2">
                {PRICING_DISCLOSURES.map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* SECTION 7: HOW WE WORK (HORIZONTAL DESKTOP / VERTICAL MOBILE TIMELINE) */}
      <section className="bg-[#0B1020] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-[#00D4FF]">How We Work</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Six Clear Stages From Discovery to Launch
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                A predictable, documented engineering workflow designed for business clarity at every milestone.
              </p>
            </div>

            {/* Responsive Timeline: Horizontal 6-col track on Desktop, Vertical track on Mobile */}
            <div className="relative mt-12">
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-[#2563EB]/40 via-[#00D4FF]/50 to-[#2563EB]/40 lg:block"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-6 left-5 top-5 w-px bg-slate-800 lg:hidden"
              />

              <ol className="grid grid-cols-1 gap-6 lg:grid-cols-6 lg:gap-4">
                {PROCESS_STEPS.map((item) => (
                  <li key={item.step} className="relative flex gap-4 lg:block">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#00D4FF]/50 bg-[#111827] font-mono text-xs font-bold text-[#00D4FF] tabular-nums shadow-sm">
                      {item.step}
                    </div>
                    <div className="rounded-xl border border-slate-800/90 bg-[#111827]/90 p-4 lg:mt-5">
                      <h3 className="font-display text-sm font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </RevealSection>

          {/* SECTION 8: WHY BUSINESSES CHOOSE DIGI TECH SOLUTION (NO FAKE TESTIMONIALS) */}
          <RevealSection delayMs={100} className="mt-16 border-t border-slate-800/90 pt-14">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-[#00D4FF]">Agency Standards</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Why Businesses Choose DIGI TECH SOLUTION
                </h2>
              </div>
              <p className="max-w-md text-xs text-slate-400">
                Real engineering standards and transparent communication—no inflated numbers or fabricated reviews.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {WHY_CHOOSE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 transition-colors hover:border-slate-700"
                  >
                    <Icon className="h-5 w-5 text-[#00D4FF]" aria-hidden="true" />
                    <h3 className="mt-4 font-display text-base font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* SECTION 9: ACCESSIBLE FAQ ACCORDION */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-[#2563EB]">Frequently Asked Questions</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020]">
                  Clear Answers Before You Start
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/faq')}
                className="min-h-[36px] text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap shrink-0"
              >
                View All FAQs →
              </button>
            </div>

            <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-[#F8FAFC]">
              {FAQ_ITEMS.map((item) => {
                const isOpen = openFaqId === item.id;
                const buttonId = `faq-btn-${item.id}`;
                const panelId = `faq-panel-${item.id}`;
                return (
                  <div key={item.id}>
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                        className="flex min-h-[54px] w-full items-center justify-between gap-4 px-6 py-4 text-left font-display text-base font-semibold text-[#0B1020] transition-colors hover:bg-slate-100/80 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2563EB]"
                      >
                        <span>{item.question}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#2563EB]' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="px-6 pb-5 text-sm leading-relaxed text-[#64748B]"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* SECTION 10: FINAL CONVERSION CTA + CLIENT ENQUIRY & CONTACT */}
      <section className="bg-[#F8FAFC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Conversion Banner */}
          <RevealSection>
            <div className="mb-12 rounded-2xl border border-slate-800 bg-[#0B1020] p-8 text-white shadow-lg sm:p-10">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#00D4FF]">
                    Start Today
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Ready to Take Your Business Digital?
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                    Share your project goals using the enquiry form below or message us directly on WhatsApp for a fast consultation.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <a
                    href="#home-enquiry"
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
                  >
                    <span>Get a Free Quote</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a
                    href={buildWhatsAppUrl(runtimeConfig.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15803D] whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Contact on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Integrated Enquiry Form + Direct Contact Sidebar */}
          <div id="home-enquiry" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <EnquiryForm
                language={language}
                runtimeConfig={runtimeConfig}
                onNavigate={onNavigate}
              />
            </div>

            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold text-[#2563EB]">Contact Information</p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#0B1020]">
                  Connect with DIGI TECH SOLUTION
                </h3>
                <p className="mt-2 text-sm text-[#64748B]">
                  Prefer discussing directly before filling out a form? Reach us anytime on WhatsApp or email.
                </p>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" aria-hidden="true" />
                    <div>
                      <div className="font-medium text-[#0B1020]">Location</div>
                      <div className="text-[#64748B]">{AGENCY_CONFIG.location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" aria-hidden="true" />
                    <div>
                      <div className="font-medium text-[#0B1020]">Business Email</div>
                      <a
                        href={`mailto:${AGENCY_CONFIG.email}`}
                        className="break-all text-[#2563EB] hover:underline"
                      >
                        {AGENCY_CONFIG.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-medium text-[#0B1020]">WhatsApp Enquiry</div>
                      <div className="font-mono text-xs text-[#64748B]">
                        {AGENCY_CONFIG.whatsappDisplay}
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href={buildWhatsAppUrl(runtimeConfig.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#15803D]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Chat on WhatsApp Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
