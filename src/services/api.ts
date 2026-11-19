import { EnquiryPayload, EnquiryResponse, PaymentState, RuntimeConfig, VerificationState } from '../types/agency';

export async function fetchRuntimeConfig(): Promise<RuntimeConfig> {
  const res = await fetch('/api/config', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error('Unable to load runtime configuration.');
  }
  return res.json();
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResponse> {
  const res = await fetch('/api/enquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as EnquiryResponse;
  if (!res.ok) {
    return {
      success: false,
      error: data.error || `Request failed (${res.status}).`,
      fieldErrors: data.fieldErrors,
      referenceNumber: data.referenceNumber,
    };
  }
  return data;
}

export async function submitQuickContact(payload: {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  contactPreference: 'WhatsApp' | 'Phone Call' | 'Email';
  website_url?: string;
}): Promise<EnquiryResponse> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      services: [payload.service],
      description: payload.message,
      contactPreference: payload.contactPreference,
      website_url: payload.website_url,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as EnquiryResponse;
  if (!res.ok) {
    return {
      success: false,
      error: data.error || `Contact request failed (${res.status}).`,
      fieldErrors: data.fieldErrors,
    };
  }
  return data;
}

export interface CreateOrderResponse {
  success: boolean;
  configured?: boolean;
  orderId?: string;
  amount?: number;
  amountInr?: number;
  currency?: string;
  keyId?: string;
  status?: PaymentState;
  packageName?: string;
  referenceNumber?: string;
  prefill?: {
    name: string;
    email: string;
    contact: string;
  };
  error?: string;
}

export async function createRazorpayOrder(
  referenceNumber: string,
  packageId: 'starter' | 'business' | 'premium' | 'custom',
  options?: { customAmountInr?: number; serviceName?: string }
): Promise<CreateOrderResponse> {
  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      referenceNumber,
      packageId,
      customAmountInr: options?.customAmountInr,
      serviceName: options?.serviceName,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as CreateOrderResponse;
  if (!res.ok) {
    return {
      success: false,
      configured: data.configured,
      error: data.error || `Unable to create payment order (${res.status}).`,
    };
  }
  return data;
}

export async function createCustomRazorpayOrder(
  referenceNumber: string,
  customAmountInr: number
): Promise<CreateOrderResponse> {
  const res = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      referenceNumber,
      packageId: 'custom',
      customAmountInr,
      serviceName: 'Booking Confirmation',
    }),
  });
  const data = (await res.json().catch(() => ({}))) as CreateOrderResponse;
  if (!res.ok || data.success !== true) {
    return {
      success: false,
      configured: data.configured,
      error: data.error || `Unable to create payment order (${res.status}).`,
    };
  }
  return data;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified?: boolean;
  status?: PaymentState;
  verificationStatus?: VerificationState;
  orderId?: string;
  paymentId?: string;
  referenceNumber?: string;
  message?: string;
  error?: string;
}

export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerifyPaymentResponse> {
  const res = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as VerifyPaymentResponse;
  if (!res.ok) {
    return {
      success: false,
      verified: false,
      status: data.status || 'FAILED',
      error: data.error || 'Payment verification failed.',
    };
  }
  return data;
}

export interface PaymentStatusResponse {
  success: boolean;
  orderId?: string;
  paymentId?: string | null;
  referenceNumber?: string;
  amount?: number;
  amountInr?: number;
  currency?: string;
  status?: PaymentState;
  verificationStatus?: VerificationState;
  transactionTimestamp?: string;
  error?: string;
}

export async function fetchPaymentStatus(params: {
  orderId?: string;
  referenceNumber?: string;
}): Promise<PaymentStatusResponse> {
  const query = new URLSearchParams();
  if (params.orderId) query.set('order_id', params.orderId);
  if (params.referenceNumber) query.set('ref', params.referenceNumber);

  const res = await fetch(`/api/payment/status?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  const data = (await res.json().catch(() => ({}))) as PaymentStatusResponse;
  if (!res.ok) {
    return {
      success: false,
      error: data.error || `Unable to fetch payment status (${res.status}).`,
    };
  }
  return data;
}

export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function buildRazorpayCheckoutOptions(params: {
  order: CreateOrderResponse;
  onVerifiedSuccess: (result: VerifyPaymentResponse) => void;
  onPendingOrAuthorized: (status: PaymentState, message: string) => void;
  onFailure: (reason: string) => void;
  onDismiss: () => void;
}): Record<string, unknown> {
  const { order, onVerifiedSuccess, onPendingOrAuthorized, onFailure, onDismiss } = params;

  return {
    key: order.keyId,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'DIGI TECH SOLUTION',
    description: `${order.packageName} — Ref ${order.referenceNumber}`,
    order_id: order.orderId,
    prefill: order.prefill,
    notes: {
      enquiry_reference: order.referenceNumber || '',
      package_name: order.packageName || '',
    },
    // Enable supported UPI flows (Intent on Android mobile browsers, QR on desktop browsers)
    // without deprecated UPI Collect / manual VPA entry, while keeping default blocks active.
    config: {
      display: {
        blocks: {
          upi_preferred: {
            name: 'Pay using UPI (QR / Apps)',
            instruments: [
              {
                method: 'upi',
                flows: ['intent', 'qr'],
              },
            ],
          },
        },
        sequence: ['block.upi_preferred'],
        preferences: {
          show_default_blocks: true,
        },
      },
    },
    retry: {
      enabled: true,
      max_count: 3,
    },
    theme: { color: '#2563EB' },
    modal: {
      ondismiss: onDismiss,
    },
    handler: async (rzpResponse: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      try {
        const verified = await verifyRazorpayPayment(rzpResponse);
        if (verified.status === 'CAPTURED' && verified.verified) {
          onVerifiedSuccess(verified);
        } else if (verified.status === 'PENDING' || verified.status === 'AUTHORIZED') {
          onPendingOrAuthorized(
            verified.status,
            verified.message ||
              'Payment status is being verified. Please do not make another payment until the transaction status is checked.'
          );
        } else {
          onFailure(verified.error || 'Payment could not be verified as captured.');
        }
      } catch {
        onPendingOrAuthorized(
          'PENDING',
          'Payment status is being verified. Please do not make another payment until the transaction status is checked.'
        );
      }
    },
  };
}
