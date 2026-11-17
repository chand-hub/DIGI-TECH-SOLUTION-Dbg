import { AlertCircle, CheckCircle2, Lock, MailCheck, RefreshCw, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { CORE_ENQUIRY_SERVICES } from '../config/agency';
import { fetchPaymentStatus } from '../services/api';
import { RuntimeConfig } from '../types/agency';

interface AdminEnquiry {
  id: number;
  reference_number: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  service: string;
  package: string;
  description: string;
  additional_requirements: string;
  status: string;
  payment_status: string | null;
  created_at: string;
}

interface AdminPayment {
  id: number;
  enquiry_reference: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  verification_status: string;
  transaction_timestamp: string;
}

interface AdminPageProps {
  runtimeConfig: RuntimeConfig;
}

export function AdminPage({ runtimeConfig }: AdminPageProps) {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'enquiries' | 'payments'>('enquiries');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [emailTestStatus, setEmailTestStatus] = useState<string | null>(null);

  const loadData = async (authToken: string, q = searchQuery, srv = serviceFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (srv !== 'All') params.set('service', srv);

      const [enqRes, payRes] = await Promise.all([
        fetch(`/api/admin/enquiries?${params.toString()}`, {
          headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
        }),
        fetch('/api/admin/payments', {
          headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
        }),
      ]);

      const enqData = (await enqRes.json().catch(() => ({}))) as {
        success?: boolean;
        enquiries?: AdminEnquiry[];
        error?: string;
      };
      const payData = (await payRes.json().catch(() => ({}))) as {
        success?: boolean;
        payments?: AdminPayment[];
      };

      if (!enqRes.ok || !enqData.success) {
        setError(enqData.error || 'Authentication failed.');
        setAuthenticated(false);
        return;
      }
      setAuthenticated(true);
      setEnquiries(enqData.enquiries || []);
      setPayments(payData.payments || []);
    } catch {
      setError('Unable to reach protected admin endpoints.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    await loadData(token);
  };

  const handleStatusChange = async (id: number, status: string) => {
    const res = await fetch('/api/admin/enquiries', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setEnquiries((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    }
  };

  const handleRefreshPayment = async (orderId: string) => {
    const res = await fetchPaymentStatus({ orderId });
    if (res.success) {
      setPayments((prev) =>
        prev.map((p) =>
          p.razorpay_order_id === orderId
            ? {
                ...p,
                status: res.status || p.status,
                verification_status: res.verificationStatus || p.verification_status,
                razorpay_payment_id: res.paymentId ?? p.razorpay_payment_id,
              }
            : p
        )
      );
    }
  };

  const handleTestEmail = async () => {
    setEmailTestStatus('Testing Resend email delivery...');
    const res = await fetch('/api/email/test', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      error?: string;
      recipient?: string;
    };
    if (res.ok && data.success) {
      setEmailTestStatus(`Test email delivered to ${data.recipient}.`);
    } else {
      setEmailTestStatus(`Error: ${data.error || 'Email delivery failed.'}`);
    }
  };

  return (
    <div className="bg-[#F8FAFC] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold text-[#2563EB]">Protected Admin Console</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#0B1020]">
            Enquiries &amp; Payment Verification Records
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Server-side Bearer token authentication required.
          </p>
        </div>

        {!authenticated ? (
          <form
            onSubmit={handleSignIn}
            className="max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2.5 text-[#0B1020]">
              <Lock className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold">Server Access Token Required</h2>
            </div>

            {!runtimeConfig.adminConfigured && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  ADMIN_ACCESS_TOKEN is not configured in Cloudflare environment secrets yet. Configure it on the server to unlock the admin console.
                </span>
              </div>
            )}

            <div className="mt-4">
              <label htmlFor="admin-token" className="block text-sm font-medium text-[#111827]">
                Admin Access Token
              </label>
              <input
                id="admin-token"
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter ADMIN_ACCESS_TOKEN"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 min-h-[42px] w-full rounded-lg bg-[#0B1020] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E293B]"
            >
              {loading ? 'Verifying...' : 'Unlock Admin Console'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Tabs & Diagnostics */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('enquiries')}
                  className={`rounded-md px-4 py-1.5 text-xs font-semibold ${
                    activeTab === 'enquiries'
                      ? 'bg-white text-[#0B1020] shadow-sm'
                      : 'text-[#64748B]'
                  }`}
                >
                  Enquiries ({enquiries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className={`rounded-md px-4 py-1.5 text-xs font-semibold ${
                    activeTab === 'payments'
                      ? 'bg-white text-[#0B1020] shadow-sm'
                      : 'text-[#64748B]'
                  }`}
                >
                  Payment Records ({payments.length})
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {activeTab === 'enquiries' && (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, email, ref..."
                        className="rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>
                    <select
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="All">All Services</option>
                      {CORE_ENQUIRY_SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => loadData(token)}
                      className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                    >
                      Filter
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleTestEmail}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-[#0B1020] hover:bg-slate-50"
                >
                  <MailCheck className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <span>Test Resend Email</span>
                </button>
              </div>
            </div>

            {emailTestStatus && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-[#0B1020]">
                <CheckCircle2 className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                <span>{emailTestStatus}</span>
              </div>
            )}

            {activeTab === 'enquiries' ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-[#64748B]">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Client Details</th>
                      <th className="px-4 py-3">Requested Services</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3">Enquiry Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#64748B]">
                          No enquiries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      enquiries.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0B1020] tabular-nums">
                            {row.reference_number}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-[#0B1020]">{row.full_name}</div>
                            {row.business_name && (
                              <div className="text-xs text-[#64748B]">{row.business_name}</div>
                            )}
                            <div className="text-xs text-[#64748B]">
                              {row.email} · {row.phone}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[#111827]">{row.service}</div>
                            <div className="text-xs text-[#64748B]">{row.package}</div>
                          </td>
                          <td className="max-w-xs px-4 py-3 text-xs text-[#64748B]">
                            {row.description || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={row.status}
                              onChange={(e) => handleStatusChange(row.id, e.target.value)}
                              className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium"
                            >
                              {['New', 'Contacted', 'In Progress', 'Completed', 'Quoted', 'Paid', 'Archived'].map(
                                (st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                )
                              )}
                            </select>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#64748B] tabular-nums">
                            {row.created_at.slice(0, 10)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-[#64748B]">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Payment ID</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Payment Status</th>
                      <th className="px-4 py-3">Verification</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#64748B]">
                          No payment records found.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-mono text-xs text-[#0B1020]">
                            {p.razorpay_order_id}
                            <div className="text-[11px] text-[#64748B]">{p.enquiry_reference}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#64748B]">
                            {p.razorpay_payment_id || '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0B1020] tabular-nums">
                            ₹{Math.round(p.amount / 100)} {p.currency}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0B1020]">
                            {p.status}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#64748B]">
                            {p.verification_status}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#64748B] tabular-nums">
                            {p.transaction_timestamp.slice(0, 19).replace('T', ' ')}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleRefreshPayment(p.razorpay_order_id)}
                              className="inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 text-xs font-medium text-[#0B1020] hover:bg-slate-50"
                            >
                              <RefreshCw className="h-3 w-3" aria-hidden="true" />
                              <span>Check</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
