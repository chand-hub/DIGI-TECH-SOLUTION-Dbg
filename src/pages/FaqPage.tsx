import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { FAQ_ITEMS } from '../data/faq';
import { FaqItem, RoutePath } from '../types/agency';

interface FaqPageProps {
  onNavigate: (path: RoutePath) => void;
}

const CATEGORIES: Array<'All' | FaqItem['category']> = [
  'All',
  'General',
  'Pricing & Billing',
  'Delivery & Tech',
  'Support & Security',
];

export function FaqPage({ onNavigate }: FaqPageProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | FaqItem['category']>('All');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const items =
    activeCategory === 'All'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="bg-[#F8FAFC]">
      <section className="bg-[#0B1020] py-14 text-white sm:py-18">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-[#00D4FF]">FAQ</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-base text-slate-300">
            Transparent answers on pricing, project timelines, hosting, security, and ongoing support.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#2563EB] text-white'
                    : 'border border-slate-200 bg-white text-[#64748B] hover:text-[#0B1020]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
            {items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50"
                  >
                    <div>
                      <div className="text-xs font-medium text-[#2563EB]">{item.category}</div>
                      <div className="mt-0.5 font-display text-base font-semibold text-[#0B1020]">
                        {item.question}
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm leading-relaxed text-[#64748B]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0B1020]">
                Have a Specific Question About Your Project?
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Share your requirements and our team will respond directly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <span>Contact Us</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
