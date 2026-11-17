import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { AGENCY_CONFIG } from './config/agency';
import { PORTFOLIO_PROJECTS } from './data/portfolio';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { HomePage } from './pages/HomePage';
import { fetchRuntimeConfig } from './services/api';
import { Language, RoutePath, RuntimeConfig } from './types/agency';

// Route-level code splitting for fast initial mobile loads on slow connections
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ServicesPage = lazy(() =>
  import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage }))
);
const PortfolioPage = lazy(() =>
  import('./pages/PortfolioPage').then((m) => ({ default: m.PortfolioPage }))
);
const CaseStudyPage = lazy(() =>
  import('./pages/CaseStudyPage').then((m) => ({ default: m.CaseStudyPage }))
);
const PricingPage = lazy(() =>
  import('./pages/PricingPage').then((m) => ({ default: m.PricingPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const FaqPage = lazy(() => import('./pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const PrivacyPolicyPage = lazy(() =>
  import('./pages/LegalPages').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsPage = lazy(() =>
  import('./pages/LegalPages').then((m) => ({ default: m.TermsPage }))
);
const RefundPolicyPage = lazy(() =>
  import('./pages/LegalPages').then((m) => ({ default: m.RefundPolicyPage }))
);
const PaymentSuccessPage = lazy(() =>
  import('./pages/PaymentStatusPages').then((m) => ({ default: m.PaymentSuccessPage }))
);
const PaymentFailurePage = lazy(() =>
  import('./pages/PaymentStatusPages').then((m) => ({ default: m.PaymentFailurePage }))
);
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  whatsappNumber: AGENCY_CONFIG.defaultWhatsappNumber,
  whatsappConfigured: true,
  razorpayConfigured: false,
  razorpayKeyId: null,
  razorpayMode: 'test',
  resendConfigured: false,
  d1Configured: false,
  adminConfigured: false,
};

function updateDocumentSeo(path: string) {
  const seoMap: Record<string, { title: string; description: string }> = {
    '/': {
      title: 'DIGI TECH SOLUTION – Website Development & Digital Solutions Agency',
      description:
        'Grow your business with smart digital solutions. Websites, custom web applications, WhatsApp, and payment integrations by DIGI TECH SOLUTION.',
    },
    '/about': {
      title: 'About Us – DIGI TECH SOLUTION | Darbhanga, Bihar',
      description:
        'Learn how DIGI TECH SOLUTION engineers reliable websites and full-stack web applications for growing businesses across India.',
    },
    '/services': {
      title: 'Services – DIGI TECH SOLUTION | Web Development & Applications',
      description:
        'Business websites, landing pages, e-commerce, admin dashboards, restaurant management systems, WhatsApp, and payment gateway integrations.',
    },
    '/portfolio': {
      title: 'Portfolio & Demo Projects – DIGI TECH SOLUTION',
      description:
        'Explore live showcases and demo blueprints across business, healthcare, restaurant, e-commerce, and dashboard applications.',
    },
    '/pricing': {
      title: 'Pricing & Packages – DIGI TECH SOLUTION (₹7,999 – ₹25,999)',
      description:
        'Compare website development packages and request a custom quotation from DIGI TECH SOLUTION.',
    },
    '/contact': {
      title: 'Contact & Free Consultation – DIGI TECH SOLUTION',
      description:
        'Submit your project enquiry or chat directly on WhatsApp (+91 73197 85754) with DIGI TECH SOLUTION.',
    },
    '/faq': {
      title: 'Frequently Asked Questions – DIGI TECH SOLUTION',
      description:
        'Answers on website timelines, pricing, domain/hosting separation, Razorpay payments, and support.',
    },
    '/privacy-policy': {
      title: 'Privacy Policy – DIGI TECH SOLUTION',
      description: 'How DIGI TECH SOLUTION handles enquiry data, emails, and payment privacy.',
    },
    '/terms-and-conditions': {
      title: 'Terms and Conditions – DIGI TECH SOLUTION',
      description: 'Service scope, billing terms, and intellectual property policies.',
    },
    '/refund-and-cancellation-policy': {
      title: 'Refund & Cancellation Policy – DIGI TECH SOLUTION',
      description: 'Clear policy on cancellations, milestone work, and non-refundable third-party costs.',
    },
    '/payment-success': {
      title: 'Payment Status – DIGI TECH SOLUTION',
      description: 'Verified Razorpay payment status confirmation.',
    },
    '/payment-failure': {
      title: 'Payment Not Captured – DIGI TECH SOLUTION',
      description: 'Payment was not captured. Check status safely or contact support.',
    },
    '/admin': {
      title: 'Admin Dashboard – DIGI TECH SOLUTION',
      description: 'Protected lead and payment verification console.',
    },
  };

  let meta = seoMap[path];
  if (!meta && path.startsWith('/portfolio/')) {
    const slug = path.replace('/portfolio/', '');
    const proj = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
    meta = {
      title: proj
        ? `${proj.title} Case Study – DIGI TECH SOLUTION`
        : 'Project Case Study – DIGI TECH SOLUTION',
      description: proj?.summary || 'Detailed project showcase by DIGI TECH SOLUTION.',
    };
  }

  const finalMeta = meta || seoMap['/'];
  document.title = finalMeta.title;

  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute('content', finalMeta.description);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', `${window.location.origin}${path}`);
  }
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname || '/';
  });
  const [language, setLanguage] = useState<Language>('en');
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig>(DEFAULT_RUNTIME_CONFIG);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);
  const [preselectedPackage, setPreselectedPackage] = useState<string | undefined>(undefined);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    fetchRuntimeConfig()
      .then((cfg) => setRuntimeConfig(cfg))
      .catch(() => {
        // Basic website remains fully accessible even if backend API is temporarily unreachable
      });
  }, []);

  useEffect(() => {
    updateDocumentSeo(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: RoutePath, queryString = '') => {
    const targetUrl = `${path}${queryString}`;
    if (window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectServiceForQuote = useCallback(
    (serviceTitle: string) => {
      setPreselectedService(serviceTitle);
      navigate('/contact');
    },
    [navigate]
  );

  const handleSelectPackageForQuote = useCallback(
    (packageLabel: string) => {
      setPreselectedPackage(packageLabel);
      navigate('/contact');
    },
    [navigate]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const renderPage = () => {
    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          language={language}
          onToggleLanguage={toggleLanguage}
          runtimeConfig={runtimeConfig}
          onNavigate={navigate}
          onSelectServiceForQuote={handleSelectServiceForQuote}
          onSelectPackageForQuote={handleSelectPackageForQuote}
        />
      );
    }
    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (currentPath === '/services') {
      return <ServicesPage onSelectServiceForQuote={handleSelectServiceForQuote} />;
    }
    if (currentPath === '/portfolio') {
      return (
        <PortfolioPage
          onNavigate={navigate}
          onSelectServiceForQuote={handleSelectServiceForQuote}
        />
      );
    }
    if (currentPath.startsWith('/portfolio/')) {
      const slug = currentPath.replace('/portfolio/', '');
      return (
        <CaseStudyPage
          slug={slug}
          onNavigate={navigate}
          onSelectServiceForQuote={handleSelectServiceForQuote}
        />
      );
    }
    if (currentPath === '/pricing') {
      return (
        <PricingPage
          runtimeConfig={runtimeConfig}
          onSelectPackageForQuote={handleSelectPackageForQuote}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath === '/contact') {
      return (
        <ContactPage
          initialService={preselectedService}
          initialPackage={preselectedPackage}
          language={language}
          runtimeConfig={runtimeConfig}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath === '/faq') {
      return <FaqPage onNavigate={navigate} />;
    }
    if (currentPath === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }
    if (currentPath === '/terms-and-conditions') {
      return <TermsPage />;
    }
    if (currentPath === '/refund-and-cancellation-policy') {
      return <RefundPolicyPage />;
    }
    if (currentPath === '/payment-success') {
      return <PaymentSuccessPage runtimeConfig={runtimeConfig} onNavigate={navigate} />;
    }
    if (currentPath === '/payment-failure') {
      return <PaymentFailurePage runtimeConfig={runtimeConfig} onNavigate={navigate} />;
    }
    if (currentPath === '/admin') {
      return <AdminPage runtimeConfig={runtimeConfig} />;
    }

    return (
      <HomePage
        language={language}
        onToggleLanguage={toggleLanguage}
        runtimeConfig={runtimeConfig}
        onNavigate={navigate}
        onSelectServiceForQuote={handleSelectServiceForQuote}
        onSelectPackageForQuote={handleSelectPackageForQuote}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#111827]">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenQuote={() => navigate('/contact')}
      />

      {!isOnline && (
        <div
          role="status"
          className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900"
        >
          You appear to be offline. Cached pages remain readable; enquiry submission and online payments require an active connection.
        </div>
      )}

      <main className="flex-1">
        <Suspense fallback={<PageSkeleton />}>{renderPage()}</Suspense>
      </main>

      <Footer
        runtimeConfig={runtimeConfig}
        language={language}
        onToggleLanguage={toggleLanguage}
        onNavigate={navigate}
        onSelectService={handleSelectServiceForQuote}
      />
      <WhatsAppFloat
        whatsappNumber={runtimeConfig.whatsappNumber}
        activeService={preselectedService}
        activePackage={preselectedPackage}
      />
    </div>
  );
}
