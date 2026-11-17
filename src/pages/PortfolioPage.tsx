import { ArrowRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { SafeImage } from '../components/SafeImage';
import { PORTFOLIO_PROJECTS } from '../data/portfolio';
import { PortfolioCategory, RoutePath } from '../types/agency';

interface PortfolioPageProps {
  onNavigate: (path: RoutePath) => void;
  onSelectServiceForQuote: (serviceTitle: string) => void;
}

const CATEGORIES: PortfolioCategory[] = [
  'All',
  'Business Websites',
  'Healthcare Websites',
  'Restaurant Websites',
  'E-commerce',
  'Dashboard Applications',
  'Custom Web Applications',
];

export function PortfolioPage({ onNavigate, onSelectServiceForQuote }: PortfolioPageProps) {
  const [filter, setFilter] = useState<PortfolioCategory>('All');

  const projects =
    filter === 'All'
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter((p) => p.category === filter);

  return (
    <div className="bg-[#F8FAFC]">
      <section className="bg-[#0B1020] py-14 text-white sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-[#00D4FF]">Portfolio &amp; Work Samples</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Live Showcases &amp; Sample Industry Projects
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            All sample projects are explicitly labeled DEMO PROJECT. Click View Project to inspect technologies, architecture notes, and mobile views.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  filter === cat
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {projects.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="font-display text-lg font-bold text-[#0B1020]">
                Custom Web Application Blueprints Available on Request
              </h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Request a custom scope walkthrough or view all categories above.
              </p>
              <button
                type="button"
                onClick={() => onSelectServiceForQuote('Custom Web Application')}
                className="mt-5 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Request Custom Consultation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.slug}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-2.5">
                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#0B1020]">
                        {project.projectStatusLabel}
                      </span>
                    </div>
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      <SafeImage
                        src={project.thumbnail}
                        alt={`${project.title} mockup`}
                        fallbackTitle={project.title}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                        <span>{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#2563EB]">{project.projectStatusLabel}</span>
                      </div>

                      <h2 className="mt-2 font-display text-2xl font-bold text-[#0B1020]">
                        {project.title}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-[#2563EB]">{project.subtitle}</p>
                      <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
                        {project.summary}
                      </p>

                      <p className="mt-3 text-xs text-[#64748B]">
                        Technologies: {project.technologies.join(' · ')}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/portfolio/${project.slug}`)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0B1020] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E293B]"
                      >
                        <span>View Project</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectServiceForQuote(project.recommendedService)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0B1020] hover:bg-slate-50"
                      >
                        <span>Discuss Similar Project</span>
                      </button>

                      {project.livePreviewUrl && (
                        <a
                          href={project.livePreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          <span>Live Preview</span>
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
