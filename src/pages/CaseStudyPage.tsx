import { ArrowLeft, ArrowRight, Check, ExternalLink, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { SafeImage } from '../components/SafeImage';
import { PORTFOLIO_PROJECTS } from '../data/portfolio';
import { RoutePath } from '../types/agency';

interface CaseStudyPageProps {
  slug: string;
  onNavigate: (path: RoutePath) => void;
  onSelectServiceForQuote: (serviceTitle: string) => void;
}

export function CaseStudyPage({
  slug,
  onNavigate,
  onSelectServiceForQuote,
}: CaseStudyPageProps) {
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-[#0B1020]">Project Not Found</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          The requested portfolio case study could not be located.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/portfolio')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Portfolio</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC]">
      {/* Dark Header */}
      <section className="bg-[#0B1020] py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onNavigate('/portfolio')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Portfolio</span>
          </button>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#00D4FF]">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.projectStatusLabel}</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-2 text-lg text-slate-300">{project.subtitle}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectServiceForQuote(project.recommendedService)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <span>Request a Similar Solution</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            {project.livePreviewUrl && (
              <a
                href={project.livePreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
              >
                <span>Open Live Preview</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Visual Showcase & Case Study Body */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Device Preview Switcher when secondary mobile screenshot exists */}
          {project.secondaryImage && (
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#0B1020]">
                {viewMode === 'desktop'
                  ? 'Desktop Showcase Preview'
                  : project.secondaryImageCaption || 'Mobile Navigation Preview'}
              </span>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('desktop')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                    viewMode === 'desktop'
                      ? 'bg-[#0B1020] text-white'
                      : 'text-[#64748B] hover:text-[#0B1020]'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('mobile')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                    viewMode === 'mobile'
                      ? 'bg-[#0B1020] text-white'
                      : 'text-[#64748B] hover:text-[#0B1020]'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mobile Drawer</span>
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              </div>
              <span className="font-mono text-xs text-[#64748B]">
                {project.projectStatusLabel}
              </span>
            </div>

            {viewMode === 'mobile' && project.secondaryImage ? (
              <div className="flex justify-center bg-slate-900 p-6 sm:p-10">
                <div className="w-full max-w-[340px] overflow-hidden rounded-2xl border-4 border-slate-700 bg-black shadow-2xl">
                  <SafeImage
                    src={project.secondaryImage}
                    alt={`${project.title} mobile view`}
                    fallbackTitle={project.title}
                    className="w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="max-h-[580px] overflow-hidden bg-slate-100">
                <SafeImage
                  src={project.thumbnail}
                  alt={`${project.title} desktop showcase`}
                  fallbackTitle={project.title}
                  className="w-full object-cover object-top"
                />
              </div>
            )}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7">
                <h2 className="font-display text-xl font-bold text-[#0B1020]">Project Overview</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-base">
                  {project.overview}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7">
                <h2 className="font-display text-xl font-bold text-[#0B1020]">
                  Demonstrated Features
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm text-[#111827]">
                  {project.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7">
                <h2 className="font-display text-lg font-bold text-[#0B1020]">
                  Architecture &amp; UX Decisions
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm text-[#64748B]">
                  {project.architectureNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2">
                      <span className="text-[#2563EB]" aria-hidden="true">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7">
                <h2 className="font-display text-lg font-bold text-[#0B1020]">Key Deliverables</h2>
                <ul className="mt-4 space-y-2 text-sm text-[#111827]">
                  {project.deliverables.map((del) => (
                    <li key={del} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onSelectServiceForQuote(project.recommendedService)}
                  className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  <span>Build a Similar Project</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
