import { Code2, Layers, Pause, Play, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const HERO_VIDEO_SRC =
  '/assets/aistudio/WhatsApp_Video_2026-11-18_at_10.14.41_PM_421a192e.mp4';

export function HeroVideoShowcase() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => {
      const reduced = mediaQuery.matches;
      setPrefersReducedMotion(reduced);
      const video = videoRef.current;
      if (!video) return;

      if (reduced) {
        video.pause();
        setIsPaused(true);
      } else {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise
            .then(() => setIsPaused(false))
            .catch(() => {
              // Autoplay blocked by browser policy; keep first frame visible without errors
            });
        }
      }
    };

    syncMotionPreference();

    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      setIsLoaded(true);
    }

    mediaQuery.addEventListener('change', syncMotionPreference);
    return () => {
      mediaQuery.removeEventListener('change', syncMotionPreference);
    };
  }, []);

  const handleLoaded = () => {
    setIsLoaded(true);
    const video = videoRef.current;
    if (video && !prefersReducedMotion) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }
  };

  const handleTogglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = true;
      video
        .play()
        .then(() => setIsPaused(false))
        .catch(() => {});
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[260px] items-center justify-center sm:max-w-[285px] lg:max-w-[310px]">
      {/* Subtle ambient lighting behind the glassmorphism frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle_at_30%_25%,rgba(37,99,235,0.34),transparent_62%),radial-gradient(circle_at_75%_80%,rgba(0,212,255,0.22),transparent_58%)] blur-2xl"
      />

      {/* Premium Glassmorphism Frame */}
      <div className="relative w-full rounded-[28px] border border-white/15 bg-white/[0.04] p-2.5 shadow-[0_28px_80px_-16px_rgba(2,6,23,0.9),0_0_40px_-12px_rgba(37,99,235,0.3)] backdrop-blur-md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/55 to-transparent"
        />

        {/* 9:16 Vertical Media Viewport (r_inner = 28px - 10px = 18px) */}
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[18px] border border-white/10 bg-[#0B1020]">
          {/* Non-blocking subtle backdrop while video buffers */}
          {!isLoaded && !hasError && (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0F172A] via-[#0B1020] to-[#080C18] p-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#00D4FF]/30 bg-[#2563EB]/20 text-[#00D4FF]">
                <Code2 className="h-6 w-6" />
              </div>
              <p className="mt-4 font-display text-sm font-semibold tracking-wide text-white">
                DIGI TECH SOLUTION
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Web Design &amp; Digital Solutions
              </p>
            </div>
          )}

          {/* Visually Attractive Fallback UI if video fails to load */}
          {hasError ? (
            <div className="flex h-full w-full flex-col justify-between bg-gradient-to-b from-[#111827] via-[#0B1020] to-[#090E1C] p-5 text-white">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00D4FF]">
                  DIGI TECH SOLUTION
                </p>
                <h2 className="mt-2 font-display text-lg font-bold leading-snug text-white">
                  Modern &amp; Responsive Websites
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                  Engineered for speed, security, and commercial business growth.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <Code2 className="h-4 w-4 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-white">Custom Business Websites</p>
                    <p className="text-[11px] text-slate-400">React, TypeScript &amp; Edge APIs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <Smartphone className="h-4 w-4 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-white">Mobile Optimized UI</p>
                    <p className="text-[11px] text-slate-400">Built for Indian Android devices</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-white">SEO &amp; Fast Performance</p>
                    <p className="text-[11px] text-slate-400">Verified Razorpay &amp; D1 stack</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                  Full-Stack Agency
                </span>
                <span className="font-semibold text-[#00D4FF]">Darbhanga, India</span>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={HERO_VIDEO_SRC}
              autoPlay={!prefersReducedMotion}
              loop
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              onLoadedData={handleLoaded}
              onCanPlay={handleLoaded}
              onError={() => setHasError(true)}
              aria-label="DIGI TECH SOLUTION 3D animation showcasing responsive website design, custom business web applications, and SEO performance"
              className={`h-full w-full object-contain transition-opacity duration-700 ease-out ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Accessible Play/Pause control shown only when reduced-motion is preferred */}
          {!hasError && prefersReducedMotion && isLoaded && (
            <button
              type="button"
              onClick={handleTogglePlayback}
              aria-label={isPaused ? 'Play 3D showcase animation' : 'Pause 3D showcase animation'}
              className="absolute bottom-3 right-3 inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-white/20 bg-[#0B1020]/85 text-white backdrop-blur-sm transition-colors hover:bg-[#2563EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4FF]"
            >
              {isPaused ? (
                <Play className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Pause className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
