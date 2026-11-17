import { Download, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { AGENCY_CONFIG, buildWhatsAppUrl } from '../config/agency';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language, RoutePath, RuntimeConfig } from '../types/agency';

interface FooterProps {
  runtimeConfig: RuntimeConfig;
  language: Language;
  onToggleLanguage: () => void;
  onNavigate: (path: RoutePath) => void;
  onSelectService: (serviceTitle: string) => void;
}

export function Footer({
  runtimeConfig,
  language,
  onToggleLanguage,
  onNavigate,
  onSelectService,
}: FooterProps) {
  const year = new Date().getFullYear();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <footer className="border-t border-slate-800 bg-[#0B1020] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Direct Contact */}
          <div>
            <div className="font-display text-lg font-bold tracking-tight text-white">
              {AGENCY_CONFIG.brandName}
            </div>
            <p className="mt-2 text-sm font-medium text-[#00D4FF]">
              {language === 'hi' ? AGENCY_CONFIG.taglineHi : AGENCY_CONFIG.tagline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Website development, custom web applications, and digital growth systems engineered for businesses across India.
            </p>
            <div className="mt-5 space-y-2.5 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                <span>{AGENCY_CONFIG.location}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                <a
                  href={`mailto:${AGENCY_CONFIG.email}`}
                  className="break-all hover:text-white transition-colors"
                >
                  {AGENCY_CONFIG.email}
                </a>
              </div>
            </div>

            <a
              href={buildWhatsAppUrl(runtimeConfig.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#15803D]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>WhatsApp {AGENCY_CONFIG.whatsappDisplay}</span>
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white">Navigation</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: 'Home', path: '/' as RoutePath },
                { label: 'About Us', path: '/about' as RoutePath },
                { label: 'Services', path: '/services' as RoutePath },
                { label: 'Portfolio / Our Work', path: '/portfolio' as RoutePath },
                { label: 'Pricing / Packages', path: '/pricing' as RoutePath },
                { label: 'FAQ', path: '/faq' as RoutePath },
                { label: 'Contact Us', path: '/contact' as RoutePath },
              ].map((link) => (
                <li key={link.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.path)}
                    className="text-left text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Services */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white">Core Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                'Business Website Development',
                'Landing Page Development',
                'E-commerce Website',
                'Dashboard / Admin Panel Development',
                'Restaurant Management System',
                'WhatsApp Integration',
                'Payment Gateway Integration',
                'Custom Web Application',
              ].map((serviceTitle) => (
                <li key={serviceTitle}>
                  <button
                    type="button"
                    onClick={() => onSelectService(serviceTitle)}
                    className="text-left text-slate-400 transition-colors hover:text-white"
                  >
                    {serviceTitle}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies, Language & App Access */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white">Policies &amp; Access</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/privacy-policy')}
                  className="text-left text-slate-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/terms-and-conditions')}
                  className="text-left text-slate-400 transition-colors hover:text-white"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/refund-and-cancellation-policy')}
                  className="text-left text-slate-400 transition-colors hover:text-white"
                >
                  Refund and Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="inline-flex items-center gap-1.5 text-left text-slate-400 transition-colors hover:text-white"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Admin Dashboard</span>
                </button>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-5">
              <button
                type="button"
                onClick={onToggleLanguage}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-white"
              >
                {language === 'en' ? 'हिन्दी भाषा में देखें' : 'Switch to English'}
              </button>

              {isInstallable && !isInstalled && (
                <button
                  type="button"
                  onClick={install}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-[#00D4FF] hover:border-[#00D4FF]"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>© {year} {AGENCY_CONFIG.brandName}. All rights reserved.</p>
          <p>Darbhanga, Bihar, India · INR (₹) · Cloudflare Pages &amp; Workers Architecture</p>
        </div>
      </div>
    </footer>
  );
}
