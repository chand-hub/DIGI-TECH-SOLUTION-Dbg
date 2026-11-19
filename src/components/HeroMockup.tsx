import {
  CreditCard,
  Globe,
  LayoutDashboard,
  Lock,
  MessageCircle,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { MouseEvent, useState } from 'react';

export function HeroMockup() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'dashboard' | 'security'>('architecture');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: Number((-relY * 5.5).toFixed(2)),
      y: Number((relX * 7).toFixed(2)),
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
    >
      {/* Subtle Blue & Cyan Atmospheric Lighting behind the 3D Stage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 hidden rounded-3xl bg-[radial-gradient(circle_at_30%_25%,rgba(37,99,235,0.28),transparent_58%),radial-gradient(circle_at_80%_75%,rgba(0,212,255,0.18),transparent_55%)] blur-xl lg:block"
      />

      {/* Desktop 3D Perspective Container (static flat layout on mobile) */}
      <div
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
        className="relative transition-transform duration-200 ease-out will-change-transform"
      >
        {/* Main Interactive Browser Interface */}
        <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#111827]/95 shadow-2xl backdrop-blur-md">
          {/* Browser Top Chrome */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#0B1020] px-4 py-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            </div>
            <div className="truncate rounded-md border border-slate-800 bg-[#111827] px-3 py-1 font-mono text-[11px] text-slate-300">
              digitechsolution.in/platform
            </div>
            <span className="font-mono text-[11px] font-medium text-[#00D4FF]">HTTPS</span>
          </div>

          {/* Interactive Mode Switcher */}
          <div className="border-b border-slate-800 bg-[#0E1528] px-4 py-2.5">
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Interactive solution preview"
            >
              {[
                { id: 'architecture' as const, label: 'Web Platform' },
                { id: 'dashboard' as const, label: 'Dashboard UI' },
                { id: 'security' as const, label: 'Cloud & Payments' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[34px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-[#2563EB] text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Content */}
          <div className="p-5 sm:p-6">
            {activeTab === 'architecture' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-medium text-[#00D4FF]">
                      Website &amp; Application Stack
                    </div>
                    <div className="mt-1 font-display text-base font-semibold text-white">
                      Responsive Business Architecture
                    </div>
                  </div>
                  <Globe className="h-5 w-5 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                </div>

                {/* Mini Browser Wireframe Preview */}
                <div className="rounded-xl border border-slate-800 bg-[#0B1020]/90 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-28 rounded bg-[#2563EB]/80" />
                      <div className="h-2 w-44 rounded bg-slate-700" />
                      <div className="h-2 w-36 rounded bg-slate-800" />
                    </div>
                    <div className="hidden rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-right sm:block">
                      <div className="text-[11px] text-slate-400">Mobile Viewport</div>
                      <div className="font-mono text-xs font-medium text-[#00D4FF]">
                        Android Ready
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg border border-slate-800 bg-[#111827] px-2 py-2.5">
                      <div className="font-medium text-white">UI / UX</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">React + TS</div>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-[#111827] px-2 py-2.5">
                      <div className="font-medium text-white">Edge API</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">Pages Functions</div>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-[#111827] px-2 py-2.5">
                      <div className="font-medium text-white">Storage</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">Cloudflare D1</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-[#0B1020]/80 p-3.5">
                    <div className="text-slate-400">Lead Routing</div>
                    <div className="mt-1 font-medium text-white">D1 + Resend Email</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-[#0B1020]/80 p-3.5">
                    <div className="text-slate-400">Instant Contact</div>
                    <div className="mt-1 font-medium text-white">WhatsApp Business</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-medium text-[#00D4FF]">
                      Operational Control Panel
                    </div>
                    <div className="mt-1 font-display text-base font-semibold text-white">
                      Enquiries, Orders &amp; Booking Workflows
                    </div>
                  </div>
                  <LayoutDashboard className="h-5 w-5 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                </div>

                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Client Enquiry Pipeline', value: 'Validated + Reference ID' },
                    { label: 'Admin Access Control', value: 'Server Bearer Auth' },
                    { label: 'Hospital / Restaurant Modules', value: 'Custom Scope Ready' },
                    { label: 'Mobile Responsive Grids', value: 'Touch Target ≥ 44px' },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#0B1020]/85 px-3.5 py-2.5"
                    >
                      <span className="text-xs text-slate-300 sm:text-sm">{row.label}</span>
                      <span className="font-mono text-[11px] font-medium text-[#00D4FF] whitespace-nowrap shrink-0">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-medium text-[#00D4FF]">
                      Verified Production Architecture
                    </div>
                    <div className="mt-1 font-display text-base font-semibold text-white">
                      Razorpay &amp; Cloudflare Security Boundary
                    </div>
                  </div>
                  <Lock className="h-5 w-5 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#0B1020]/85 px-3.5 py-2.5">
                    <span className="text-xs text-slate-300 sm:text-sm">Order Creation</span>
                    <span className="font-mono text-[11px] text-[#00D4FF]">Server-Side API</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#0B1020]/85 px-3.5 py-2.5">
                    <span className="text-xs text-slate-300 sm:text-sm">Payment Verification</span>
                    <span className="font-mono text-[11px] text-[#00D4FF]">
                      HMAC SHA-256 + Webhook
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#0B1020]/85 px-3.5 py-2.5">
                    <span className="text-xs text-slate-300 sm:text-sm">Supported Checkout</span>
                    <span className="font-mono text-[11px] text-[#00D4FF]">
                      UPI · Cards · Netbanking
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                    <span>All API keys remain encrypted inside Cloudflare bindings.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Desktop Technology Accents (hidden on mobile for clean lightweight performance) */}
        <div
          aria-hidden="true"
          className="animate-float-slow pointer-events-none absolute -bottom-5 -left-6 z-20 hidden items-center gap-2.5 rounded-xl border border-slate-700/90 bg-[#0B1020]/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md lg:flex"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/20 text-[#00D4FF]">
            <CreditCard className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-semibold text-white">Razorpay Verified</div>
            <div className="text-[11px] text-slate-400">HMAC-SHA256 Server Check</div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="animate-float-delayed pointer-events-none absolute -right-4 -top-4 z-20 hidden items-center gap-2.5 rounded-xl border border-slate-700/90 bg-[#0B1020]/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md lg:flex"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-semibold text-white">Direct WhatsApp</div>
            <div className="text-[11px] text-slate-400">Instant Lead Routing</div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-4 right-8 z-20 hidden items-center gap-2 rounded-xl border border-slate-700/80 bg-[#111827]/95 px-3 py-2 shadow-lg backdrop-blur-md xl:flex"
        >
          <Smartphone className="h-3.5 w-3.5 text-[#00D4FF]" />
          <span className="font-mono text-[11px] text-slate-300">Mobile-First UI</span>
        </div>
      </div>
    </div>
  );
}
