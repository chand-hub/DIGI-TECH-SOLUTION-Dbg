import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { buildWhatsAppUrl } from '../config/agency';
import { fetchPaymentStatus, PaymentStatusResponse } from '../services/api';
import { RoutePath, RuntimeConfig } from '../types/agency';

interface PaymentPageProps {
  runtimeConfig: RuntimeConfig;
  onNavigate: (path: RoutePath) => void;
}

export function PaymentSuccessPage({ runtimeConfig, onNavigate }: PaymentPageProps) {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const orderIdParam = params.get('order_id') || '';
  const refParam = params.get('ref') || '';

  const [checking, setChecking] = useState(true);
  const [statusData, setStatusData] = useState<PaymentStatusResponse | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!orderIdParam && !refParam) {
      setCheckError('No payment order ID was provided.');
      setChecking(false);
      return;
    }
    setChecking(true);
    setCheckError(null);
    try {
      const res = await fetchPaymentStatus({
        orderId: orderIdParam || undefined,
        referenceNumber: refParam || undefined,
      });
      if (!res.success) {
        setCheckError(
          res.error ||
            'Payment status is being verified. Please do not make another payment until the transaction status is checked.'
        );
      } else {
        setStatusData(res);
      }
    } catch {
      setCheckError(
        'Payment status is being verified. Please do not make another payment until the transaction status is checked.'
      );
    } finally {
      setChecking(false);
    }
  }, [orderIdParam, refParam]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const isCapturedAndVerified =
    statusData?.status === 'CAPTURED' && statusData?.verificationStatus === 'VERIFIED';

  return (
    <div className="bg-[#F8FAFC] py-16 sm:py-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {checking ? (
            <div className="flex items-center gap-3 text-[#0B1020]">
              <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" aria-hidden="true" />
              <div>
                <h1 className="font-display text-xl font-bold">Checking Verified Payment Status</h1>
                <p className="text-xs text-[#64748B]">Querying backend transaction records...</p>
              </div>
            </div>
          ) : isCapturedAndVerified ? (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#0B1020]">
                    PAYMENT SUCCESSFUL
                  </h1>
                  <p className="text-xs text-[#64748B]">
                    Server confirmed status: CAPTURED &amp; VERIFIED
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Enquiry Reference</span>
                  <span className="font-mono font-semibold text-[#0B1020]">
                    {statusData?.referenceNumber || refParam || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Order ID</span>
                  <span className="font-mono text-xs text-[#0B1020]">{statusData?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Payment ID</span>
                  <span className="font-mono text-xs text-[#0B1020]">
                    {statusData?.paymentId || 'Confirmed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Amount</span>
                  <span className="font-mono font-semibold text-[#0B1020] tabular-nums">
                    ₹{statusData?.amountInr} {statusData?.currency}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-7 w-7 shrink-0 text-amber-600" aria-hidden="true" />
                <div>
                  <h1 className="font-display text-xl font-bold text-[#0B1020]">
                    {statusData?.status === 'FAILED' || statusData?.status === 'CANCELLED'
                      ? `Payment Status: ${statusData.status}`
                      : 'PENDING / VERIFICATION IN PROGRESS'}
                  </h1>
                  <p className="mt-1 text-sm text-[#64748B]">
                    {checkError ||
                      'Payment status is being verified. Please do not make another payment until the transaction status is checked.'}
                  </p>
                </div>
              </div>

              {statusData && (
                <div className="mt-5 space-y-2 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Order ID</span>
                    <span className="font-mono text-[#0B1020]">{statusData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Backend State</span>
                    <span className="font-mono font-semibold text-[#0B1020]">{statusData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Verification</span>
                    <span className="font-mono text-[#0B1020]">{statusData.verificationStatus}</span>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <button
                  type="button"
                  onClick={checkStatus}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>Check Payment Status</span>
                </button>
              </div>
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1020] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E293B]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Return Home</span>
            </button>
            <a
              href={buildWhatsAppUrl(runtimeConfig.whatsappNumber, {
                referenceNumber: statusData?.referenceNumber || refParam || undefined,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-[#0B1020] hover:bg-slate-50"
            >
              <MessageCircle className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaymentFailurePage({ runtimeConfig, onNavigate }: PaymentPageProps) {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const ref = params.get('ref') || 'N/A';
  const orderId = params.get('order_id') || '';
  const reason = params.get('reason') || 'The payment was not captured or could not be verified.';

  const [checking, setChecking] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!orderId) return;
    setChecking(true);
    try {
      const res = await fetchPaymentStatus({ orderId });
      if (res.success && res.status) {
        setLiveStatus(`Server record status: ${res.status} (${res.verificationStatus})`);
        if (res.status === 'CAPTURED' && res.verificationStatus === 'VERIFIED') {
          onNavigate('/payment-success');
        }
      } else {
        setLiveStatus(res.error || 'Unable to confirm status right now.');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] py-16 sm:py-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0B1020]">
                Payment Not Captured
              </h1>
              <p className="text-xs text-[#64748B]">
                No verified captured transaction was confirmed.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-900">
            <div><strong>Details:</strong> {reason}</div>
            <div className="mt-1 font-mono text-xs">Enquiry Reference: {ref}</div>
            {orderId && <div className="mt-0.5 font-mono text-xs">Order ID: {orderId}</div>}
          </div>

          {liveStatus && (
            <p className="mt-3 font-mono text-xs text-[#0B1020]">{liveStatus}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {orderId && (
              <button
                type="button"
                onClick={handleCheck}
                disabled={checking}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1020] hover:bg-slate-50"
              >
                <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>Check Payment Status</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('/pricing')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <span>Return to Pricing</span>
            </button>
            <a
              href={buildWhatsAppUrl(runtimeConfig.whatsappNumber, {
                customMessage: `I need help verifying a payment for enquiry reference ${ref}.`,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-[#0B1020] hover:bg-slate-50"
            >
              <MessageCircle className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
