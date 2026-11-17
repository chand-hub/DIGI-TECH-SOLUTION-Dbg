import { Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { EnquiryForm } from '../components/EnquiryForm';
import { AGENCY_CONFIG, buildWhatsAppUrl } from '../config/agency';
import { submitQuickContact } from '../services/api';
import { Language, RoutePath, RuntimeConfig } from '../types/agency';

interface ContactPageProps {
  initialService?: string;
  initialPackage?: string;
  language?: Language;
  runtimeConfig: RuntimeConfig;
  onNavigate: (path: RoutePath, query?: string) => void;
}

export function ContactPage({
  initialService,
  initialPackage,
  language = 'en',
  runtimeConfig,
  onNavigate,
}: ContactPageProps) {
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickMsg, setQuickMsg] = useState('');
  const [quickSending, setQuickSending] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (quickSending) return;
    setQuickFeedback(null);
    setQuickSending(true);
    try {
      const res = await submitQuickContact({
        fullName: quickName,
        email: quickEmail,
        phone: quickPhone,
        service: 'General Contact',
        message: quickMsg,
        contactPreference: 'WhatsApp',
      });
      if (!res.success) {
        setQuickFeedback({ ok: false, text: res.error || 'Could not send message.' });
      } else {
        setQuickFeedback({
          ok: true,
          text: `Message logged (${res.referenceNumber}). ${
            res.emailNotification?.sent
              ? 'Email confirmation sent.'
              : 'Notification email delivery is pending.'
          }`,
        });
        setQuickName('');
        setQuickEmail('');
        setQuickPhone('');
        setQuickMsg('');
      }
    } catch {
      setQuickFeedback({ ok: false, text: 'Network error sending message.' });
    } finally {
      setQuickSending(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC]">
      <section className="bg-[#0B1020] py-14 text-white sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-[#00D4FF]">Contact DIGI TECH SOLUTION</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Let&apos;s Discuss Your Website or Web Application
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Submit your enquiry below—project description, budget, and additional notes are optional—or connect immediately on WhatsApp.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <EnquiryForm
                initialService={initialService}
                initialPackage={initialPackage}
                language={language}
                runtimeConfig={runtimeConfig}
                onNavigate={onNavigate}
              />
            </div>

            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-bold text-[#0B1020]">Direct Contact</h2>
                <div className="mt-4 space-y-4 text-sm">
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
                      <div className="font-medium text-[#0B1020]">WhatsApp Business</div>
                      <div className="font-mono text-xs text-[#64748B]">
                        {AGENCY_CONFIG.whatsappDisplay}
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href={buildWhatsAppUrl(runtimeConfig.whatsappNumber, {
                    service: initialService,
                    packageName: initialPackage,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Chat Directly on WhatsApp</span>
                </a>
              </div>

              {/* Quick Contact Form */}
              <form
                onSubmit={handleQuickSubmit}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="font-display text-lg font-bold text-[#0B1020]">Quick Message</h2>
                <p className="mt-1 text-xs text-[#64748B]">
                  Send a short note—no minimum message length required.
                </p>

                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    required
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="10-digit WhatsApp / mobile"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    value={quickMsg}
                    onChange={(e) => setQuickMsg(e.target.value)}
                    placeholder="Optional short message"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                {quickFeedback && (
                  <p
                    className={`mt-3 text-xs ${
                      quickFeedback.ok ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {quickFeedback.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={quickSending}
                  className="mt-4 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg bg-[#0B1020] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E293B] disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{quickSending ? 'Sending...' : 'Send Quick Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
