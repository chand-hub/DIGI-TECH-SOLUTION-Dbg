import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { buildWhatsAppUrl, CORE_ENQUIRY_SERVICES } from '../config/agency';
import { PRICING_PACKAGES } from '../data/pricing';
import {
  buildRazorpayCheckoutOptions,
  createRazorpayOrder,
  fetchPaymentStatus,
  loadRazorpayCheckoutScript,
  submitEnquiry,
} from '../services/api';
import { EnquiryResponse, Language, PaymentState, RoutePath, RuntimeConfig } from '../types/agency';

interface EnquiryFormProps {
  initialService?: string;
  initialPackage?: string;
  language?: Language;
  runtimeConfig: RuntimeConfig;
  onNavigate: (path: RoutePath, query?: string) => void;
}

const BUDGET_OPTIONS = [
  'Prefer not to specify now',
  'Under ₹10,000',
  '₹10,000 – ₹17,000',
  '₹17,000 – ₹30,000',
  '₹30,000+',
];

export function EnquiryForm({
  initialService,
  initialPackage,
  language = 'en',
  runtimeConfig,
  onNavigate,
}: EnquiryFormProps) {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(() =>
    initialService ? [initialService] : ['Business Website Development']
  );
  const [selectedPackage, setSelectedPackage] = useState(initialPackage || 'Custom Quote');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedResult, setSubmittedResult] = useState<EnquiryResponse | null>(null);

  const [paying, setPaying] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pendingOrderStatus, setPendingOrderStatus] = useState<PaymentState | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (initialService) {
      setSelectedServices((prev) =>
        prev.includes(initialService) ? prev : [...prev, initialService]
      );
    }
  }, [initialService]);

  useEffect(() => {
    if (initialPackage) {
      setSelectedPackage(initialPackage);
    }
  }, [initialPackage]);

  const toggleService = (serviceTitle: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceTitle)
        ? prev.filter((item) => item !== serviceTitle)
        : [...prev, serviceTitle]
    );
  };

  const validateClient = (): boolean => {
    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name.';
    }
    const digits = phone.replace(/[\s\-()+]/g, '');
    const core =
      digits.startsWith('91') && digits.length === 12
        ? digits.slice(2)
        : digits.startsWith('0') && digits.length === 11
          ? digits.slice(1)
          : digits;
    if (!/^[6-9]\d{9}$/.test(core)) {
      errors.phone = 'Please enter a valid 10-digit Indian WhatsApp / mobile number.';
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (selectedServices.length === 0) {
      errors.services = 'Please select at least one service.';
    }
    // Zero artificial minimum-character requirement on description / additionalRequirements!
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg(null);
    setPaymentNotice(null);

    if (!validateClient()) {
      setErrorMsg('Please fix the highlighted required fields before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitEnquiry({
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        services: selectedServices,
        selectedPackage,
        budget,
        description: description.trim(),
        additionalRequirements: additionalRequirements.trim(),
        contactPreference: 'WhatsApp',
        website_url: honeypot,
      });

      if (!response.success) {
        setErrorMsg(response.error || 'Submission failed. Please try again.');
        if (response.fieldErrors) setFieldErrors(response.fieldErrors);
        return;
      }

      setSubmittedResult(response);
      setFieldErrors({});
    } catch {
      setErrorMsg('Network error while submitting your enquiry. Please try again or reach us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const matchedPackage = PRICING_PACKAGES.find(
    (p) => p.formOptionLabel === selectedPackage
  );

  const handleCheckPendingStatus = async () => {
    if (!pendingOrderId) return;
    setCheckingStatus(true);
    try {
      const statusRes = await fetchPaymentStatus({ orderId: pendingOrderId });
      if (!statusRes.success) {
        setPaymentNotice(statusRes.error || 'Unable to retrieve status right now.');
        return;
      }
      setPendingOrderStatus(statusRes.status || 'PENDING');
      if (statusRes.status === 'CAPTURED' && statusRes.verificationStatus === 'VERIFIED') {
        onNavigate(
          '/payment-success',
          `?ref=${encodeURIComponent(statusRes.referenceNumber || '')}&order_id=${encodeURIComponent(statusRes.orderId || '')}`
        );
      } else if (statusRes.status === 'FAILED' || statusRes.status === 'CANCELLED') {
        onNavigate(
          '/payment-failure',
          `?ref=${encodeURIComponent(statusRes.referenceNumber || '')}&order_id=${encodeURIComponent(statusRes.orderId || '')}&reason=${encodeURIComponent(`Transaction state: ${statusRes.status}`)}`
        );
      } else {
        setPaymentNotice(
          `Current verified server state: ${statusRes.status || 'PENDING'}. Payment status is being verified. Please do not make another payment until the transaction status is checked.`
        );
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  const handlePayNow = async () => {
    if (!submittedResult?.referenceNumber || !matchedPackage) return;
    setPaymentNotice(null);

    if (!runtimeConfig.razorpayConfigured) {
      setPaymentNotice(
        'Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured on the server yet.'
      );
      return;
    }

    setPaying(true);
    try {
      const loaded = await loadRazorpayCheckoutScript();
      if (!loaded) {
        setPaymentNotice('Could not load Razorpay Checkout script. Please check your internet connection.');
        return;
      }

      const orderRes = await createRazorpayOrder(
        submittedResult.referenceNumber,
        matchedPackage.id
      );
      if (!orderRes.success || !orderRes.orderId || !orderRes.keyId) {
        setPaymentNotice(orderRes.error || 'Unable to initiate payment order.');
        return;
      }

      setPendingOrderId(orderRes.orderId);
      setPendingOrderStatus('CREATED');

      const RazorpayCtor = (
        window as unknown as {
          Razorpay: new (opts: Record<string, unknown>) => {
            open: () => void;
            on: (event: string, cb: (res: { error?: { description?: string } }) => void) => void;
          };
        }
      ).Razorpay;

      const rzp = new RazorpayCtor(
        buildRazorpayCheckoutOptions({
          order: orderRes,
          onVerifiedSuccess: (verified) => {
            onNavigate(
              '/payment-success',
              `?ref=${encodeURIComponent(verified.referenceNumber || orderRes.referenceNumber || '')}&order_id=${encodeURIComponent(verified.orderId || '')}`
            );
          },
          onPendingOrAuthorized: (status, message) => {
            setPendingOrderStatus(status);
            setPaymentNotice(message);
          },
          onFailure: (reason) => {
            onNavigate(
              '/payment-failure',
              `?ref=${encodeURIComponent(orderRes.referenceNumber || '')}&order_id=${encodeURIComponent(orderRes.orderId || '')}&reason=${encodeURIComponent(reason)}`
            );
          },
          onDismiss: () => {
            setPendingOrderStatus('CANCELLED');
            setPaymentNotice(
              'Checkout window was closed before completion. You can check payment status anytime below before retrying.'
            );
          },
        })
      );

      rzp.on('payment.failed', (failRes) => {
        const reason = failRes?.error?.description || 'Payment failed.';
        onNavigate(
          '/payment-failure',
          `?ref=${encodeURIComponent(orderRes.referenceNumber || '')}&order_id=${encodeURIComponent(orderRes.orderId || '')}&reason=${encodeURIComponent(reason)}`
        );
      });

      rzp.open();
    } catch {
      setPaymentNotice('Network error while connecting to Razorpay. Please check connectivity and try again.');
    } finally {
      setPaying(false);
    }
  };

  if (submittedResult?.success && submittedResult.referenceNumber) {
    const emailNotice = submittedResult.emailNotification;
    const whatsappLink = buildWhatsAppUrl(runtimeConfig.whatsappNumber, {
      referenceNumber: submittedResult.referenceNumber,
    });

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
          <div>
            <h3 className="font-display text-xl font-bold text-[#0B1020]">
              {language === 'hi' ? 'आपकी पूछताछ सफलतापूर्वक दर्ज हो गई है' : 'Enquiry Received Successfully'}
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              Saved securely on our server. Use your reference ID below for follow-ups.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
          <div className="text-xs font-medium text-[#64748B]">Enquiry Reference Number</div>
          <div className="mt-1 font-mono text-lg font-semibold text-[#0B1020] tabular-nums">
            {submittedResult.referenceNumber}
          </div>
          <div className="mt-2 text-xs text-[#64748B]">
            Services: <span className="font-medium text-[#111827]">{selectedServices.join(', ')}</span>
          </div>
        </div>

        {emailNotice && !emailNotice.sent && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <div>
              <strong>Enquiry Stored · Notification Delivery Pending:</strong>{' '}
              {emailNotice.error || 'Email delivery is currently pending server configuration.'}
            </div>
          </div>
        )}

        {emailNotice?.sent && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              Confirmation email sent to <strong>{email}</strong> and notification sent to DIGI TECH SOLUTION.
            </div>
          </div>
        )}

        {paymentNotice && (
          <div className="mt-4 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-xs text-slate-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
              <span>{paymentNotice}</span>
            </div>
            {pendingOrderId && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheckPendingStatus}
                  disabled={checkingStatus}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#0B1020] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E293B]"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${checkingStatus ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span>Check Payment Status</span>
                </button>
                {pendingOrderStatus && (
                  <span className="font-mono text-xs text-[#64748B]">
                    Order: {pendingOrderId} · Status: {pendingOrderStatus}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#15803D]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>Continue on WhatsApp</span>
          </a>

          {matchedPackage && (
            <button
              type="button"
              onClick={handlePayNow}
              disabled={paying}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {paying ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              )}
              <span>Pay {matchedPackage.priceFormatted} via Razorpay</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSubmittedResult(null);
              setDescription('');
              setAdditionalRequirements('');
              setPendingOrderId(null);
              setPendingOrderStatus(null);
            }}
            className="px-2 py-2 text-sm font-medium text-[#64748B] hover:text-[#0B1020]"
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6">
        <h3 className="font-display text-xl font-bold text-[#0B1020]">
          {language === 'hi' ? 'प्रोजेक्ट पूछताछ और कोटेशन अनुरोध' : 'Project Enquiry & Free Consultation'}
        </h3>
        <p className="mt-1 text-sm text-[#64748B]">
          {language === 'hi'
            ? 'आवश्यक सेवाएं चुनें। विवरण और बजट पूरी तरह वैकल्पिक हैं।'
            : 'Select one or more services below. Project description, budget, and additional notes are completely optional.'}
        </p>
      </div>

      {/* Honeypot anti-spam trap */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url">Leave blank</label>
        <input
          id="website_url"
          name="website_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="enq-fullName" className="block text-sm font-medium text-[#111827]">
            Full Name *
          </label>
          <input
            id="enq-fullName"
            type="text"
            required
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="enq-businessName" className="block text-sm font-medium text-[#111827]">
            Business Name <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
          </label>
          <input
            id="enq-businessName"
            type="text"
            maxLength={150}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Shop, clinic, hotel, or company name"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <div>
          <label htmlFor="enq-phone" className="block text-sm font-medium text-[#111827]">
            WhatsApp / Mobile Number *
          </label>
          <input
            id="enq-phone"
            type="tel"
            required
            maxLength={20}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 73197 85754"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="enq-email" className="block text-sm font-medium text-[#111827]">
            Email Address *
          </label>
          <input
            id="enq-email"
            type="email"
            required
            maxLength={160}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      {/* Multi-Select Services Required */}
      <div className="mt-5">
        <span className="block text-sm font-medium text-[#111827]">
          Services Required * <span className="text-xs font-normal text-[#64748B]">(Select one or more)</span>
        </span>
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_ENQUIRY_SERVICES.map((srv) => {
            const checked = selectedServices.includes(srv);
            return (
              <button
                key={srv}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggleService(srv)}
                className={`flex min-h-[42px] items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                  checked
                    ? 'border-[#2563EB] bg-blue-50/80 text-[#0B1020]'
                    : 'border-slate-200 bg-white text-[#475569] hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? 'border-[#2563EB] bg-[#2563EB] text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {checked && <Check className="h-3 w-3" aria-hidden="true" />}
                </span>
                <span className="leading-snug">{srv}</span>
              </button>
            );
          })}
        </div>
        {fieldErrors.services && (
          <p className="mt-1.5 text-xs text-red-600">{fieldErrors.services}</p>
        )}
      </div>

      {/* Optional Package & Budget */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="enq-package" className="block text-sm font-medium text-[#111827]">
            Package Preference <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
          </label>
          <select
            id="enq-package"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          >
            <option value="Custom Quote">Custom Quote (Scope-based)</option>
            {PRICING_PACKAGES.map((pkg) => (
              <option key={pkg.id} value={pkg.formOptionLabel}>
                {pkg.formOptionLabel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="enq-budget" className="block text-sm font-medium text-[#111827]">
            Estimated Budget <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
          </label>
          <select
            id="enq-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          >
            <option value="">Select budget (optional)</option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional Description — zero minimum character restriction */}
      <div className="mt-4">
        <label htmlFor="enq-description" className="block text-sm font-medium text-[#111827]">
          Project Description <span className="text-xs font-normal text-[#64748B]">(Optional — write as little or as much as you like)</span>
        </label>
        <textarea
          id="enq-description"
          rows={3}
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Need a clinic website with WhatsApp booking (or leave blank)"
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>

      {/* Optional Additional Requirements */}
      <div className="mt-4">
        <label htmlFor="enq-additional" className="block text-sm font-medium text-[#111827]">
          Additional Requirements <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
        </label>
        <textarea
          id="enq-additional"
          rows={2}
          maxLength={3000}
          value={additionalRequirements}
          onChange={(e) => setAdditionalRequirements(e.target.value)}
          placeholder="Language preference (English/Hindi), timeline, or reference link (optional)"
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <ShieldCheck className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
          <span>Server-validated · Duplicate-protected · Direct WhatsApp fallback</span>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <a
            href={buildWhatsAppUrl(runtimeConfig.whatsappNumber, {
              service: selectedServices[0],
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1020] hover:bg-slate-50 sm:flex-none"
          >
            <MessageCircle className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60 sm:flex-none"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            <span>{submitting ? 'Submitting...' : 'Submit Enquiry'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
