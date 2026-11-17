import { Globe, Lock, Smartphone, Zap } from 'lucide-react';
import { useState } from 'react';

export function HeroMockup() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'mobile' | 'security'>('architecture');

  return (
    <div className="w-full rounded-xl border border-slate-700/80 bg-[#11182D] shadow-2xl overflow-hidden">
      {/* Browser Top Chrome */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0B1020] px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
        </div>
        <div className="rounded-md bg-slate-900 px-3 py-1 font-mono text-xs text-slate-400">
          digitechsolution.in/architecture
        </div>
        <div className="text-xs font-medium text-[#00D4FF]">HTTPS</div>
      </div>

      {/* Interactive Mode Switcher */}
      <div className="border-b border-slate-800 bg-[#0F162B] px-4 py-2.5">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Solution blueprint preview">
          {[
            { id: 'architecture' as const, label: 'Web Platform' },
            { id: 'mobile' as const, label: 'Mobile UX' },
            { id: 'security' as const, label: 'Cloud & Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#2563EB] text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Preview Stage */}
      <div className="p-5 sm:p-6">
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-slate-400">Frontend &amp; Edge Delivery</div>
                <div className="mt-0.5 font-display text-base font-semibold text-white">
                  Conversion-Focused Website Architecture
                </div>
              </div>
              <Globe className="h-5 w-5 text-[#00D4FF]" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-[#0B1020]/80 p-3.5">
                <div className="text-xs text-slate-400">UI Stack</div>
                <div className="mt-1 font-display text-sm font-semibold text-white">
                  React · TypeScript
                </div>
                <div className="mt-1 text-xs text-slate-400">Semantic &amp; accessible</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0B1020]/80 p-3.5">
                <div className="text-xs text-slate-400">Edge Database</div>
                <div className="mt-1 font-display text-sm font-semibold text-white">
                  Cloudflare D1
                </div>
                <div className="mt-1 text-xs text-slate-400">Prepared SQL bindings</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-[#0B1020]/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Lead Pipeline Workflow</span>
                <span className="font-mono text-[#00D4FF]">POST /api/enquiries</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded border border-slate-800 bg-slate-900/90 px-2 py-2 text-slate-200">
                  1. Validate Input
                </div>
                <div className="rounded border border-slate-800 bg-slate-900/90 px-2 py-2 text-slate-200">
                  2. Store in D1
                </div>
                <div className="rounded border border-slate-800 bg-slate-900/90 px-2 py-2 text-slate-200">
                  3. Notify Gmail
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mobile' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-slate-400">Responsive Viewport Engineering</div>
                <div className="mt-0.5 font-display text-base font-semibold text-white">
                  Built for Android Phones, Tablets &amp; Desktops
                </div>
              </div>
              <Smartphone className="h-5 w-5 text-[#00D4FF]" aria-hidden="true" />
            </div>

            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Touch Target Compliance', value: '≥ 44px' },
                { label: 'WhatsApp Click-to-Chat', value: '1-Tap Action' },
                { label: 'Navigation Drawer', value: 'Accessible Mobile Menu' },
                { label: 'Image Loading Strategy', value: 'Lazy + Responsive' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0B1020]/80 px-3.5 py-2.5"
                >
                  <span className="text-slate-300">{row.label}</span>
                  <span className="font-mono text-xs font-medium text-[#00D4FF] tabular-nums">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-slate-400">Server-Side Integrations</div>
                <div className="mt-0.5 font-display text-base font-semibold text-white">
                  Razorpay &amp; Resend Security Boundary
                </div>
              </div>
              <Lock className="h-5 w-5 text-[#00D4FF]" aria-hidden="true" />
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0B1020]/80 px-3.5 py-2.5">
                <span className="text-slate-300">Signature Verification</span>
                <span className="font-mono text-xs text-[#00D4FF]">Web Crypto HMAC-SHA256</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0B1020]/80 px-3.5 py-2.5">
                <span className="text-slate-300">Secret Storage</span>
                <span className="font-mono text-xs text-[#00D4FF]">Cloudflare Bindings Only</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0B1020]/80 px-3.5 py-2.5">
                <span className="text-slate-300">Webhook Idempotency</span>
                <span className="font-mono text-xs text-[#00D4FF]">Unique Event Guard</span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                <Zap className="h-3.5 w-3.5 text-[#00D4FF]" aria-hidden="true" />
                <span>No API secrets ever ship in client JavaScript bundles.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
