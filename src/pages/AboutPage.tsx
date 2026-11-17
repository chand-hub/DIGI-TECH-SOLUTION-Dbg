import { ArrowRight, Code2, Lock, MapPin, ShieldCheck } from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { AGENCY_CONFIG } from '../config/agency';
import { RoutePath } from '../types/agency';

interface AboutPageProps {
  onNavigate: (path: RoutePath) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="bg-[#F8FAFC]">
      {/* Header */}
      <section className="bg-[#0B1020] py-14 text-white sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-[#00D4FF]">About DIGI TECH SOLUTION</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Your Digital Growth Partner from Darbhanga, Bihar
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            We design and engineer reliable websites, industry portals, and custom web applications that help local and national businesses compete online with confidence.
          </p>
        </div>
      </section>

      {/* Studio Visual + Mission */}
      <section className="py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <SafeImage
                  src={AGENCY_CONFIG.heroStudioImage}
                  alt="DIGI TECH SOLUTION software engineering workspace"
                  fallbackTitle="DIGI TECH SOLUTION Engineering Studio"
                  className="h-full min-h-[280px] w-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-6">
              <h2 className="font-display text-2xl font-bold text-[#0B1020] sm:text-3xl">
                Practical Software Engineering for Growing Businesses
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#64748B] sm:text-base">
                Many businesses struggle with slow, outdated websites or fragile templates that fail to generate real enquiries. At DIGI TECH SOLUTION, we combine clean UI/UX design with dependable full-stack architecture so your website works reliably on every Android phone, tablet, and desktop.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#64748B] sm:text-base">
                From hospitality and healthcare websites to custom admin dashboards and restaurant management systems, we prioritize clear scope, honest pricing, and long-term maintainability.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" aria-hidden="true" />
                  <div>
                    <div className="font-display text-sm font-semibold text-[#0B1020]">Location</div>
                    <div className="text-xs text-[#64748B]">{AGENCY_CONFIG.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" aria-hidden="true" />
                  <div>
                    <div className="font-display text-sm font-semibold text-[#0B1020]">Direct Email</div>
                    <div className="text-xs text-[#64748B] break-all">{AGENCY_CONFIG.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Engineering Pillars */}
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Code2,
                title: 'Modern Edge Architecture',
                text: 'Built with React, TypeScript, Tailwind CSS, Cloudflare Pages Functions, and Cloudflare D1 databases for speed and reliability.',
              },
              {
                icon: Lock,
                title: 'Security-First Integrations',
                text: 'Server-side validation, prepared SQL queries, protected API keys, and HMAC SHA-256 verified Razorpay transactions.',
              },
              {
                icon: ShieldCheck,
                title: 'Honest Commercial Practices',
                text: 'Zero hidden fees, clear separation between development costs and third-party hosting, and transparent project demonstrations.',
              },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <card.icon className="h-6 w-6 text-[#2563EB]" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-bold text-[#0B1020]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{card.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#0B1020] p-7 text-white">
            <div>
              <h3 className="font-display text-xl font-bold">Planning a Website or Web Application?</h3>
              <p className="mt-1 text-sm text-slate-300">
                Discuss your requirements directly with our team and receive a tailored project plan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <span>Get a Free Quote</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
