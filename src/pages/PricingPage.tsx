import { AlertCircle, Check, CreditCard, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { buildWhatsAppUrl } from '../config/agency';
import { PRICING_DISCLOSURES, PRICING_PACKAGES } from '../data/pricing';
import {
  buildRazorpayCheckoutOptions,
  createCustomRazorpayOrder,
  createRazorpayOrder,
  fetchPaymentStatus,
  loadRazorpayCheckoutScript,
} from '../services/api';
import { RoutePath, RuntimeConfig } from '../types/agency';

interface PricingPageProps {
  runtimeConfig: RuntimeConfig;
  onSelectPackageForQuote: (packageLabel: string) => void;
  onNavigate: (path: RoutePath, query?: string) => void;
}

export function PricingPage({
  runtimeConfig,
  onSelectPackageForQuote,
  onNavigate,
}: PricingPageProps) {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedPkgId, setSelectedPkgId] = useState<'starter' | 'business' | 'premium'>('starter');
  const [paying, setPaying] = useState(false);
  const [payNotice, setPayNotice] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [customReferenceNumber, setCustomReferenceNumber] = useState('');
  const [customAmountInput, setCustomAmountInput] = useState('');
  const [customPaying, setCustomPaying] = useState(false);
  const [customPayError, setCustomPayError] = useState<string | null>(null);
  const [customPayNotice, setCustomPayNotice] = useState<string | null>(null);
  const [customPendingOrderId, setCustomPendingOrderId] = useState<string | null>(null);
  const [customCheckingStatus, setCustomCheckingStatus] = useState(false);

  const handleCheckStatus = async () => {
    if (!pendingOrderId) return;
    setCheckingStatus(true);
    try {
      const res = await fetchPaymentStatus({ orderId: pendingOrderId });
      if (!res.success) {
        setPayNotice(res.error || 'Could not retrieve status right now.');
        return;
      }
      if (res.status === 'CAPTURED' && res.verificationStatus === 'VERIFIED') {
        onNavigate(
          '/payment-success',
          `?ref=${encodeURIComponent(res.referenceNumber || referenceNumber)}&order_id=${encodeURIComponent(res.orderId || '')}`
        );
      } else {
        setPayNotice(
          `Backend Status: ${res.status} (${res.verificationStatus}). Please do not make another payment until this transaction settles.`
        );
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleDirectPayment = async () => {
    setPayNotice(null);
    const trimmedRef = referenceNumber.trim().toUpperCase();
    if (!trimmedRef) {
      setPayNotice('Please enter your Enquiry Reference Number (e.g., DTS-20261117-XXXXXX) first.');
      return;
    }

    if (!runtimeConfig.razorpayConfigured) {
      setPayNotice(
        'Razorpay payment processing is disabled until RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are configured on the server.'
      );
      return;
    }

    setPaying(true);
    try {
      const loaded = await loadRazorpayCheckoutScript();
      if (!loaded) {
        setPayNotice('Unable to load Razorpay Checkout library. Check your network connection.');
        return;
      }

      const orderRes = await createRazorpayOrder(trimmedRef, selectedPkgId);
      if (!orderRes.success || !orderRes.orderId || !orderRes.keyId) {
        setPayNotice(orderRes.error || 'Failed to create payment order.');
        return;
      }

      setPendingOrderId(orderRes.orderId);

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
              `?ref=${encodeURIComponent(verified.referenceNumber || trimmedRef)}&order_id=${encodeURIComponent(verified.orderId || '')}`
            );
          },
          onPendingOrAuthorized: (_status, message) => {
            setPayNotice(message);
          },
          onFailure: (reason) => {
            onNavigate(
              '/payment-failure',
              `?ref=${encodeURIComponent(trimmedRef)}&order_id=${encodeURIComponent(orderRes.orderId || '')}&reason=${encodeURIComponent(reason)}`
            );
          },
          onDismiss: () => {
            setPayNotice(
              'Payment window was closed before completion. Check payment status before retrying.'
            );
          },
        })
      );

      rzp.on('payment.failed', (failRes) => {
        onNavigate(
          '/payment-failure',
          `?ref=${encodeURIComponent(trimmedRef)}&order_id=${encodeURIComponent(orderRes.orderId || '')}&reason=${encodeURIComponent(failRes?.error?.description || 'Payment failed')}`
        );
      });

      rzp.open();
    } catch {
      setPayNotice('Network interruption while initiating Razorpay Checkout.');
    } finally {
      setPaying(false);
    }
  };

  const handleCheckCustomStatus = async () => {
    if (!customPendingOrderId) return;
    setCustomCheckingStatus(true);
    setCustomPayError(null);
    try {
      const res = await fetchPaymentStatus({ orderId: customPendingOrderId });
      if (!res.success) {
        setCustomPayError(res.error || 'Could not retrieve payment status right now.');
        return;
      }
      if (res.status === 'CAPTURED' && res.verificationStatus === 'VERIFIED') {
        onNavigate(
          '/payment-success',
          `?ref=${encodeURIComponent(res.referenceNumber || customReferenceNumber.trim())}&order_id=${encodeURIComponent(res.orderId || '')}`
        );
      } else {
        setCustomPayNotice(
          `Backend Status: ${res.status} (${res.verificationStatus}). Please do not make another payment until this transaction settles.`
        );
      }
    } catch {
      setCustomPayError('Network interruption while checking payment status.');
    } finally {
      setCustomCheckingStatus(false);
    }
  };

  const handleCustomPayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (customPaying) return;

    setCustomPayError(null);
    setCustomPayNotice(null);

    const trimmedRef = customReferenceNumber.trim();
    if (!trimmedRef) {
      setCustomPayError('Please enter your enquiry reference number.');
      return;
    }

    const trimmedAmount = customAmountInput.trim();
    const isWholeDigits = /^\d+$/.test(trimmedAmount);
    const parsedAmount = Number(trimmedAmount);
    if (
      !trimmedAmount ||
      !isWholeDigits ||
      !Number.isSafeInteger(parsedAmount) ||
      parsedAmount < 100 ||
      parsedAmount > 500000
    ) {
      setCustomPayError('Amount must be a whole number between ₹100 and ₹5,00,000.');
      return;
    }

    setCustomPaying(true);
    try {
      const orderRes = await createCustomRazorpayOrder(trimmedRef, parsedAmount);
      if (orderRes.success !== true || !orderRes.orderId || !orderRes.keyId) {
        setCustomPayError(orderRes.error || 'Failed to create payment order.');
        return;
      }

      const loaded = await loadRazorpayCheckoutScript();
      if (!loaded) {
        setCustomPayError('Unable to load Razorpay Checkout library. Check your network connection.');
        return;
      }

      const RazorpayCtor = (
        window as unknown as {
          Razorpay?: new (opts: Record<string, unknown>) => {
            open: () => void;
            on: (event: string, cb: (res: { error?: { description?: string } }) => void) => void;
          };
        }
      ).Razorpay;

      if (!RazorpayCtor) {
        setCustomPayError('Razorpay Checkout is unavailable in this browser session.');
        return;
      }

      setCustomPendingOrderId(orderRes.orderId);

      const rzp = new RazorpayCtor(
        buildRazorpayCheckoutOptions({
          order: orderRes,
          onVerifiedSuccess: (verified) => {
            onNavigate(
              '/payment-success',
              `?ref=${encodeURIComponent(verified.referenceNumber || trimmedRef)}&order_id=${encodeURIComponent(verified.orderId || '')}`
            );
          },
          onPendingOrAuthorized: (_status, message) => {
            setCustomPayNotice(message);
          },
          onFailure: (reason) => {
            onNavigate(
              '/payment-failure',
              `?ref=${encodeURIComponent(trimmedRef)}&order_id=${encodeURIComponent(orderRes.orderId || '')}&reason=${encodeURIComponent(reason)}`
            );
          },
          onDismiss: () => {
            setCustomPayNotice(
              'Payment window was closed before completion. Check payment status before retrying.'
            );
          },
        })
      );

      rzp.on('payment.failed', (failRes) => {
        onNavigate(
          '/payment-failure',
          `?ref=${encodeURIComponent(trimmedRef)}&order_id=${encodeURIComponent(orderRes.orderId || '')}&reason=${encodeURIComponent(failRes?.error?.description || 'Payment failed')}`
        );
      });

      rzp.open();
    } catch {
      setCustomPayError('Network error while creating payment order. Please try again.');
    } finally {
      setCustomPaying(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC]">
      <section className="bg-[#0B1020] py-14 text-white sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-[#00D4FF]">Pricing &amp; Packages</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Transparent Packages &amp; Custom Quotations
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Select a package to prefill your consultation request, or pay for an approved enquiry reference via verified Razorpay Checkout.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                    {pkg.featured && <span className="font-semibold text-[#2563EB]">Recommended</span>}
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-bold text-[#0B1020]">{pkg.name}</h2>
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
                      onClick={() => onSelectPackageForQuote(pkg.formOptionLabel)}
                      className="flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0B1020] hover:bg-slate-50"
                    >
                      Free Consultation
                    </button>
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

          {/* Pay Custom Amount Section */}
          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <h2 className="font-display text-xl font-bold text-[#0B1020]">
                  Pay Custom Amount
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                  Pay an agreed custom quotation or booking confirmation amount between ₹100 and ₹5,00,000 using your Enquiry Reference Number via verified Razorpay Checkout.
                </p>
              </div>

              <form onSubmit={handleCustomPayment} noValidate className="lg:col-span-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="custom-pay-ref" className="block text-xs font-medium text-[#111827]">
                      Enquiry reference number
                    </label>
                    <input
                      id="custom-pay-ref"
                      type="text"
                      value={customReferenceNumber}
                      onChange={(e) => setCustomReferenceNumber(e.target.value)}
                      placeholder="DTS-20261117-A1B2C3"
                      disabled={customPaying}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none disabled:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-pay-amount" className="block text-xs font-medium text-[#111827]">
                      Amount in ₹
                    </label>
                    <input
                      id="custom-pay-amount"
                      type="number"
                      min={100}
                      max={500000}
                      step={1}
                      inputMode="numeric"
                      value={customAmountInput}
                      onChange={(e) => setCustomAmountInput(e.target.value)}
                      placeholder="5000"
                      disabled={customPaying}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] tabular-nums focus:border-[#2563EB] focus:outline-none disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {customPayError && (
                  <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                    {customPayError}
                  </p>
                )}

                {customPayNotice && (
                  <div className="mt-3 space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-slate-800">
                    <p>{customPayNotice}</p>
                    {customPendingOrderId && (
                      <button
                        type="button"
                        onClick={handleCheckCustomStatus}
                        disabled={customCheckingStatus}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#0B1020] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${customCheckingStatus ? 'animate-spin' : ''}`}
                          aria-hidden="true"
                        />
                        <span>Check Payment Status</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={customPaying}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                  >
                    {customPaying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" aria-hidden="true" />
                        <span>Pay now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Pay Approved Enquiry Section */}
          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <h2 className="font-display text-xl font-bold text-[#0B1020]">
                  Pay for an Approved Enquiry Reference
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                  Enter your Enquiry Reference Number (<span className="font-mono text-[#0B1020]">DTS-YYYYMMDD-XXXXXX</span>) and selected package to pay securely through Razorpay with server-side capture verification.
                </p>
                {!runtimeConfig.razorpayConfigured && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                    <span>
                      Razorpay checkout is currently disabled because server credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured.
                    </span>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pay-ref" className="block text-xs font-medium text-[#111827]">
                      Enquiry Reference Number
                    </label>
                    <input
                      id="pay-ref"
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="DTS-20261117-A1B2C3"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="pay-pkg" className="block text-xs font-medium text-[#111827]">
                      Package Amount (INR)
                    </label>
                    <select
                      id="pay-pkg"
                      value={selectedPkgId}
                      onChange={(e) =>
                        setSelectedPkgId(e.target.value as 'starter' | 'business' | 'premium')
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                    >
                      <option value="starter">Starter Package — ₹7,999</option>
                      <option value="business">Business Package — ₹16,999</option>
                      <option value="premium">Premium Package — ₹25,999</option>
                    </select>
                  </div>
                </div>

                {payNotice && (
                  <div className="mt-3 space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-slate-800">
                    <p>{payNotice}</p>
                    {pendingOrderId && (
                      <button
                        type="button"
                        onClick={handleCheckStatus}
                        disabled={checkingStatus}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#0B1020] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${checkingStatus ? 'animate-spin' : ''}`} aria-hidden="true" />
                        <span>Check Payment Status</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDirectPayment}
                    disabled={paying}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                  >
                    {paying ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>Pay Now via Razorpay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('/contact')}
                    className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
                  >
                    Need an Enquiry Reference First? →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Disclosures */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-sm font-bold text-[#0B1020]">
              Scope &amp; Additional Charges Policy
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
              {PRICING_DISCLOSURES.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
