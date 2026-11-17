import { ArrowRight, Check, Layers } from 'lucide-react';
import { useState } from 'react';
import { SERVICES_LIST } from '../data/services';
import { ServiceItem } from '../types/agency';

interface ServicesPageProps {
  onSelectServiceForQuote: (serviceTitle: string) => void;
}

const SERVICE_CATEGORIES: Array<'All' | ServiceItem['category']> = [
  'All',
  'Websites',
  'Industry Solutions',
  'Web Apps & Systems',
  'Growth & Care',
];

export function ServicesPage({ onSelectServiceForQuote }: ServicesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ServiceItem['category']>('All');

  const filtered =
    selectedCategory === 'All'
      ? SERVICES_LIST
      : SERVICES_LIST.filter((s) => s.category === selectedCategory);

  return (
    <div className="bg-[#F8FAFC]">
      <section className="bg-[#0B1020] py-14 text-white sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-[#00D4FF]">Our Services (14 Specialized Solutions)</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Digital Solutions Engineered for Credibility and Conversion
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Select any service below to review included capabilities, business benefits, and request a prefilled project quotation.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          {filtered.map((srv) => (
            <article
              key={srv.id}
              id={srv.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Main Description & Benefits */}
                <div className="lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                    <span className="font-mono font-medium text-[#2563EB]">{srv.number}</span>
                    <span aria-hidden="true">·</span>
                    <span>{srv.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Recommended: {srv.recommendedPackage}</span>
                  </div>

                  <h2 className="mt-2 font-display text-2xl font-bold text-[#0B1020]">
                    {srv.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-base">
                    {srv.description}
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="font-display text-sm font-bold text-[#0B1020]">Key Benefits</h3>
                      <ul className="mt-2.5 space-y-2 text-sm text-[#111827]">
                        {srv.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-display text-sm font-bold text-[#0B1020]">Included Features</h3>
                      <ul className="mt-2.5 space-y-2 text-sm text-[#111827]">
                        {srv.features.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Visual Preview Panel + CTA */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 lg:col-span-5">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs font-semibold text-[#0B1020]">
                        Solution Blueprint Preview
                      </span>
                      <Layers className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {srv.previewHighlights.map((hl, i) => (
                        <div
                          key={hl}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                        >
                          <span className="font-medium text-[#111827]">{hl}</span>
                          <span className="font-mono text-xs text-[#64748B]">0{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => onSelectServiceForQuote(srv.title)}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                    >
                      <span>Enquire for {srv.title.split(' ')[0]} Solution</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
