import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Layers,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useState } from 'react';
import { EnquiryForm } from '../components/EnquiryForm';
import { HeroMockup } from '../components/HeroMockup';
import { SafeImage } from '../components/SafeImage';
import { AGENCY_CONFIG, buildWhatsAppUrl, UI_COPY } from '../config/agency';
import { FAQ_ITEMS } from '../data/faq';
import { PORTFOLIO_PROJECTS } from '../data/portfolio';
import { PRICING_DISCLOSURES, PRICING_PACKAGES } from '../data/pricing';
import { SERVICES_LIST } from '../data/services';
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

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Discovery and Consultation',
    detail: 'Understand your business goals, audience, required pages, and functional scope.',
  },
  {
    step: '02',
    title: 'Planning and Design',
    detail: 'Design clean, mobile-first layouts and clear navigation structures for approval.',
  },
  {
    step: '03',
    title: 'Development',
    detail: 'Engineer fast React/TypeScript interfaces, database schemas, and secure APIs.',
  },
  {
    step: '04',
    title: 'Testing and Quality Assurance',
    detail: 'Verify Android mobile usability, form validation, payment security, and SEO.',
  },
  {
    step: '05',
    title: 'Deployment',
    detail: 'Launch on Cloudflare Pages with HTTPS, environment secrets, and custom domain.',
  },
  {
    step: '06',
    title: 'Support and Maintenance',
    detail: 'Post-launch support window followed by optional ongoing technical maintenance.',
  },
];

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

  const copy = UI_COPY[language];

  const filteredPortfolio =
    activePortfolioFilter === 'All'
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter((p) => p.category === activePortfolioFilter);

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0B1020] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_48%),radial-gradient(circle_at_85%_75%,rgba(0,212,255,0.12),transparent_42%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-medium text-[#00D4FF]">
              DIGI TECH SOLUTION · {language === 'hi' ? AGENCY_CONFIG.taglineHi : AGENCY_CONFIG.tagline}
            </p>
            <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/70 p-1 text-xs">
              <button
                type="button"
                onClick={() => language !== 'en' && onToggleLanguage()}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  language === 'en' ? 'bg-[#2563EB] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => language !== 'hi' && onToggleLanguage()}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  language === 'hi' ? 'bg-[#2563EB] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Copy & 3 Required Buttons */}
            <div className="lg:col-span-6">
              <h1 className="font-display text-[clamp(2.15rem,4vw,3.4rem)] font-bold leading-[1.12] tracking-tight text-white">
                {copy.heroHeading}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {copy.heroSubheading}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#home-enquiry"
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
                >
                  <span>{copy.ctaConsultation}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => onNavigate('/services')}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-lg border border-slate-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-slate-400 hover:bg-white/5 whitespace-nowrap shrink-0"
                >
                  {copy.ctaServices}
                </button>

                <a
                  href={buildWhatsAppUrl(runtimeConfig.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15803D] whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.ctaWhatsapp}</span>
                </a>
              </div>
            </div>

            {/* Right Interactive Engineering Preview */}
            <div className="lg:col-span-6">
              <HeroMockup />
            </div>
          </div>

          {/* Trust Pillars Row */}
          <div className="mt-12 grid grid-cols-1 gap-4 border-t border-slate-800/90 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Layers,
                title: 'Professional Website Development',
                desc: 'Clean business websites tailored to your industry and goals.',
              },
              {
                icon: Smartphone,
                title: 'Low-Network & Mobile Ready',
                desc: 'Lightweight assets engineered for Indian mobile connections.',
              },
              {
                icon: Lock,
                title: 'Verified Security & Payments',
                desc: 'Server-side validation, Resend alerts, and HMAC Razorpay checks.',
              },
              {
                icon: ShieldCheck,
                title: 'Transparent Collaboration',
                desc: 'Clear milestones, editable pricing, and direct WhatsApp support.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                <div>
                  <div className="font-display text-sm font-semibold text-white">{item.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. ABOUT DIGI TECH SOLUTION */}
      <section className="border-b border-slate-200 bg-white py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-sm font-semibold text-[#2563EB]">{copy.aboutTitle}</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020]">
                Practical Web Engineering for Businesses Across India
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#64748B] sm:text-base">
                Based in Darbhanga, Bihar, DIGI TECH SOLUTION builds fast, dependable websites, management dashboards, and custom web applications. We focus on real commercial reliability—clear navigation on mobile devices, protected enquiry forms, WhatsApp integration, and server-verified online payments.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/about')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  <span>Read More About Us</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <SafeImage
                  src={AGENCY_CONFIG.heroStudioImage}
                  alt="DIGI TECH SOLUTION digital agency workspace"
                  fallbackTitle="DIGI TECH SOLUTION Workspace"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR SERVICES */}
      <section className="bg-[#F8FAFC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">{copy.servicesTitle}</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020] sm:text-4xl">
                End-to-End Digital Solutions Tailored to Your Business
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/services')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap shrink-0"
            >
              <span>Explore All Services</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES_LIST.slice(0, 6).map((srv, idx) => (
              <div
                key={srv.id}
                className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md ${
                  idx === 0 ? 'lg:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>{srv.number}. {srv.category}</span>
                    <span>{srv.recommendedPackage.split(' (')[0]}</span>
                  </div>
                  <h3 className="mt-2.5 font-display text-xl font-bold text-[#0B1020]">
                    {srv.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{srv.shortSummary}</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-[#111827]">
                    {srv.features.slice(0, 2).map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => onSelectServiceForQuote(srv.title)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                  >
                    <span>Request Quote</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/services')}
                    className="text-xs font-medium text-[#64748B] hover:text-[#0B1020]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PORTFOLIO / RECENT PROJECTS */}
      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">{copy.portfolioTitle}</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020] sm:text-4xl">
                Sample Blueprints &amp; Showcase Previews
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
                Sample implementations are clearly labeled as DEMO PROJECT. We never display fabricated client metrics or fake reviews.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 rounded-lg bg-slate-100 p-1">
              {PORTFOLIO_FILTERS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActivePortfolioFilter(cat)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
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
                className={`flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#F8FAFC] ${
                  index === 0 && activePortfolioFilter === 'All' ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div className="border-b border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2">
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
                      alt={`${project.title} preview`}
                      fallbackTitle={project.title}
                      className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                      <span>{project.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-[#2563EB]">{project.projectStatusLabel}</span>
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
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1020] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E293B]"
                    >
                      <span>View Project</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>

                    {project.livePreviewUrl && (
                      <a
                        href={project.livePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
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
        </div>
      </section>

      {/* 5. WHY CHOOSE US + 6. OUR WORKING PROCESS */}
      <section className="bg-[#0B1020] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold text-[#00D4FF]">{copy.whyTitle}</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
                Built for Speed, Security, and Real Business Conversion
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Every website and application is built cleanly for mobile networks, backed by real server-side validation and transparent documentation.
              </p>

              <div className="mt-8 space-y-5 border-t border-slate-800 pt-6">
                {[
                  {
                    title: 'Honest Scope & Editable Pricing',
                    desc: 'No hidden charges or forced bundle lock-ins. Custom work is quoted clearly after discovery.',
                  },
                  {
                    title: 'Payment & Data Security',
                    desc: 'Server-only secrets, parameterized database queries, and HMAC-verified Razorpay transactions.',
                  },
                  {
                    title: 'Direct WhatsApp & Email Support',
                    desc: 'Communicate directly on +91 73197 85754 or educationrevolution90@gmail.com.',
                  },
                ].map((point) => (
                  <div key={point.title}>
                    <h3 className="font-display text-base font-semibold text-white">{point.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{point.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="text-sm font-semibold text-[#00D4FF]">{copy.processTitle}</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">
                Six Structured Stages from Consultation to Launch
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {PROCESS_STEPS.map((item) => (
                  <div key={item.step} className="rounded-xl border border-slate-800 bg-[#11182D] p-5">
                    <div className="font-mono text-xs font-medium text-[#00D4FF] tabular-nums">
                      Step {item.step}
                    </div>
                    <h4 className="mt-1.5 font-display text-base font-semibold text-white">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING / REQUEST A QUOTE */}
      <section className="bg-[#F8FAFC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#2563EB]">{copy.pricingTitle}</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020] sm:text-4xl">
              Clear Packages &amp; Custom Quotations
            </h2>
            <p className="mt-2 text-sm text-[#64748B]">
              Starting development packages in INR (₹). Complex web applications and custom integrations receive a tailored quotation.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PRICING_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`flex flex-col justify-between rounded-xl border bg-white p-7 ${
                  pkg.featured
                    ? 'border-[#2563EB] shadow-lg ring-1 ring-[#2563EB]/20'
                    : 'border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                    <span>{pkg.billingNote}</span>
                    {pkg.featured && <span className="font-semibold text-[#2563EB]">Popular</span>}
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
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectPackageForQuote(pkg.formOptionLabel)}
                    className={`flex min-h-[42px] w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                      pkg.featured
                        ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                        : 'bg-[#0B1020] text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    Request a Quote
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="#home-enquiry"
                      onClick={() => onSelectPackageForQuote(pkg.formOptionLabel)}
                      className="flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0B1020] hover:bg-slate-50"
                    >
                      Free Consultation
                    </a>
                    <a
                      href={buildWhatsAppUrl(runtimeConfig.whatsappNumber, {
                        packageName: pkg.name,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0B1020] hover:bg-slate-50"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
                      <span>Discuss Project</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-sm font-bold text-[#0B1020]">
              Transparent Billing &amp; Quotation Policy
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
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">{copy.faqTitle}</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1020]">
                Clear Answers Before You Start
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/faq')}
              className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap shrink-0"
            >
              View All FAQs →
            </button>
          </div>

          <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-[#F8FAFC]">
            {FAQ_ITEMS.slice(0, 5).map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-display text-base font-semibold text-[#0B1020] hover:bg-slate-100/70"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm leading-relaxed text-[#64748B]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. CLIENT ENQUIRY SECTION & 10. CONTACT INFORMATION */}
      <section id="home-enquiry" className="border-t border-slate-200 bg-[#F8FAFC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <EnquiryForm
                language={language}
                runtimeConfig={runtimeConfig}
                onNavigate={onNavigate}
              />
            </div>

            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold text-[#2563EB]">{copy.contactTitle}</p>
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
                    <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" aria-hidden="true" />
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
