// Hero.tsx — Optimized: no re-render lag, lightweight, fast load
import { useRef, useState, useCallback, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules"; // removed unused Pagination import
import type { Swiper as SwiperType } from "swiper";
import { useHeroes } from "../../hooks/useHeroes";
import Loader from "../ui/Loader";
import ErrorState from "../ui/Errorstate";
import "swiper/css";
import "swiper/css/effect-fade";

// ─── Moved OUTSIDE component so it's injected only ONCE ───────────────────────
// Uses a module-level flag to avoid double injection in StrictMode
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;

  // Preconnect for Google Fonts (faster font load)
  const preconnect1 = document.createElement("link");
  preconnect1.rel = "preconnect";
  preconnect1.href = "https://fonts.googleapis.com";
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement("link");
  preconnect2.rel = "preconnect";
  preconnect2.href = "https://fonts.gstatic.com";
  preconnect2.crossOrigin = "anonymous";
  document.head.appendChild(preconnect2);

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  // display=swap prevents FOIT; only load weights actually used
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Unbounded:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap";
  document.head.appendChild(fontLink);

  const style = document.createElement("style");
  style.textContent = `
    /* ─── Swiper overrides ─── */
    .hero-swiper .swiper-pagination { display: none !important; }

    /* ─── Ken Burns ─── */
    .hero-swiper .swiper-slide-active .slide-img {
      animation: kenBurns 7s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
    }
    @keyframes kenBurns {
      from { transform: scale(1.14) translate(6px,-4px); }
      to   { transform: scale(1)    translate(0,0); }
    }

    /* ─── Slide content entrance ─── */
    .hero-swiper .swiper-slide-active .slide-eyebrow {
      animation: riseUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s both;
    }
    .hero-swiper .swiper-slide-active .slide-word {
      animation: wordReveal 1s cubic-bezier(0.22,1,0.36,1) both;
    }
    .hero-swiper .swiper-slide-active .slide-word:nth-child(1) { animation-delay: 0.25s; }
    .hero-swiper .swiper-slide-active .slide-word:nth-child(2) { animation-delay: 0.38s; }
    .hero-swiper .swiper-slide-active .slide-word:nth-child(3) { animation-delay: 0.51s; }
    .hero-swiper .swiper-slide-active .slide-word:nth-child(4) { animation-delay: 0.64s; }
    .hero-swiper .swiper-slide-active .slide-word:nth-child(5) { animation-delay: 0.77s; }
    .hero-swiper .swiper-slide-active .slide-word:nth-child(n+6) { animation-delay: 0.88s; }
    .hero-swiper .swiper-slide-active .slide-sub {
      animation: riseUp 1s cubic-bezier(0.22,1,0.36,1) 0.55s both;
    }
    .hero-swiper .swiper-slide-active .slide-cta {
      animation: riseUp 1s cubic-bezier(0.22,1,0.36,1) 0.75s both;
    }
    .hero-swiper .swiper-slide-active .slide-divider {
      animation: expandLine 1s cubic-bezier(0.22,1,0.36,1) 0.5s both;
    }

    @keyframes wordReveal {
      from { opacity:0; transform:translateY(52px) rotateX(18deg); filter:blur(8px); }
      to   { opacity:1; transform:translateY(0) rotateX(0deg); filter:blur(0); }
    }
    @keyframes riseUp {
      from { opacity:0; transform:translateY(24px); filter:blur(4px); }
      to   { opacity:1; transform:translateY(0); filter:blur(0); }
    }
    @keyframes expandLine {
      from { transform:scaleX(0); transform-origin:left; }
      to   { transform:scaleX(1); transform-origin:left; }
    }

    /* ─── Vignette ─── */
    .hero-vignette {
      background:
        radial-gradient(ellipse 80% 60% at 20% 80%, rgba(0,0,0,0.75) 0%, transparent 70%),
        radial-gradient(ellipse 60% 80% at 80% 20%, rgba(0,0,0,0.3) 0%, transparent 60%);
    }

    /* ─── Grain (pseudo-element so no extra DOM node) ─── */
    .hero-grain::after {
      content:'';
      position:absolute;
      inset:0;
      /* Inline SVG grain — no network request */
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E");
      pointer-events:none;
      z-index:15;
      mix-blend-mode:overlay;
    }

    /* ─── Scanlines ─── */
    .hero-scanlines {
      background:repeating-linear-gradient(
        0deg,transparent,transparent 2px,
        rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px
      );
      pointer-events:none;
    }

    /* ─── Slide number font ─── */
    .slide-num { font-family:'Unbounded',sans-serif; font-feature-settings:'tnum'; }

    /* ─── CTA hover (CSS-only, no JS) ─── */
    .hero-cta { position:relative; overflow:hidden; }
    .hero-cta::before {
      content:'';
      position:absolute;
      inset:0;
      background:white;
      transform:translateX(-101%);
      transition:transform 0.45s cubic-bezier(0.22,1,0.36,1);
    }
    .hero-cta:hover::before { transform:translateX(0); }
    .hero-cta:hover .cta-label { color:#000; }
    .cta-label { position:relative; z-index:1; transition:color 0.3s ease; }

    /* ─── Nav arrow ─── */
    .hero-nav-btn { transition:background 0.25s,transform 0.25s,opacity 0.25s; }
    .hero-nav-btn:hover { background:rgba(255,255,255,0.15); transform:scale(1.08); }
    .hero-nav-btn:active { transform:scale(0.96); }

    /* ─── Progress bar — driven by CSS animation, zero JS re-renders ─── */
    .progress-track { background:rgba(255,255,255,0.15); border-radius:2px; overflow:hidden; }
    .progress-fill  { height:100%; background:white; border-radius:2px; }
    /* key class added/removed to restart animation */
    .progress-fill.running {
      width:100%;
      animation:progressGrow var(--slide-duration,6000ms) linear forwards;
    }
    @keyframes progressGrow { from { width:0%; } to { width:100%; } }

    /* ─── Decorative line ─── */
    .deco-line { width:1px; background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.4),transparent); }

    /* ─── Ghost index number ─── */
    .ghost-num {
      font-family:'Unbounded',sans-serif;
      font-size:clamp(7rem,18vw,18rem);
      font-weight:900;
      line-height:1;
      color:rgba(255,255,255,0.04);
      letter-spacing:-0.04em;
      position:absolute;
      right:1.5rem;
      bottom:2rem;
      z-index:10;
      pointer-events:none;
      user-select:none;
    }
    @media(min-width:640px) { .ghost-num { right:2.5rem; bottom:3rem; } }

    /* ─── Slide height ─── */
    .hero-slide-inner { height:clamp(480px,80vh,780px); }

    /* ─── Dot indicator ─── */
    .dot-indicator {
      height:3px;
      border-radius:2px;
      transition:width 0.4s ease, background 0.4s ease;
    }
    .dot-indicator.active  { width:24px; background:white; }
    .dot-indicator.inactive{ width:6px;  background:rgba(255,255,255,0.3); }
  `;
  document.head.appendChild(style);
}

// Inject once at module evaluation time (before first render)
injectStyles();

// ─── Slide Duration constant (also used as CSS var) ──────────────────────────
const SLIDE_DURATION = 6000;

// ─── Typed hero shape so we stop using `(hero as any)` ───────────────────────
interface HeroItem {
  _id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

// ─── Static arrow SVGs (avoid re-creating JSX each render) ───────────────────
const PrevIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const NextIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const CtaArrow = (
  <svg
    className="cta-label w-4 h-4 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
const Hero: React.FC = () => {
  const { data, isLoading, isError, error } = useHeroes();
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // progressKey forces CSS animation restart — no rAF, no per-frame setState
  const [progressKey, setProgressKey] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const heroes = (data?.data ?? []) as HeroItem[];
  const totalSlides = heroes.length;

  const handleSlideChange = useCallback((s: SwiperType) => {
    setActiveIndex(s.realIndex);
    setProgressKey((k) => k + 1); // restarts CSS progress animation
  }, []);

  const slidePrev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const slideNext = useCallback(() => swiperRef.current?.slideNext(), []);

  // Preload images for faster perceived load (first 2 slides)
  useEffect(() => {
    if (!heroes.length) return;
    heroes.slice(0, 2).forEach((hero) => {
      const img = new Image();
      img.src = hero.imageUrl;
    });
  }, [heroes]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <ErrorState
        message={
          (error as Error)?.message ||
          "Failed to load heroes. Please try again."
        }
        title="Failed to Load Heroes"
        fullScreen
      />
    );
  }

  if (!heroes.length) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-500 text-lg tracking-widest uppercase font-light">
          No heroes found
        </p>
      </section>
    );
  }

  const padded = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="w-full bg-zinc-950">
      <div className="w-full pt-14 sm:pt-16 lg:pt-20">
        <div className="relative">
          <Swiper
            effect={totalSlides > 1 ? "fade" : undefined}
            autoplay={{ delay: SLIDE_DURATION, disableOnInteraction: false }}
            loop={totalSlides > 1}
            speed={1200}
            // Only load modules actually used
            modules={totalSlides > 1 ? [Autoplay, EffectFade] : []}
            className="hero-swiper w-full"
            onSwiper={(s) => {
              swiperRef.current = s;
            }}
            onSlideChange={handleSlideChange}
            // Lazy load swiper images
            lazy={{ loadPrevNext: true }}
            // Tell browser to use GPU layer for transitions
            cssMode={false}
          >
            {heroes.map((hero, idx) => (
              <SwiperSlide key={hero._id}>
                <div className="hero-grain hero-slide-inner relative w-full overflow-hidden">
                  {/* Image — loading="eager" for first, "lazy" for rest */}
                  <img
                    src={hero.imageUrl}
                    alt={hero.title}
                    className="slide-img absolute inset-0 w-full h-full object-cover object-center"
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={idx === 0 ? "high" : "low"}
                  />

                  {/* Gradient layers */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/5 z-[1]" />
                  <div className="absolute inset-0 hero-vignette z-[2]" />
                  <div className="absolute inset-0 hero-scanlines z-[3] opacity-40" />

                  {/* Top edge shimmer */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />

                  {/* Ghost index number */}
                  <div className="ghost-num" aria-hidden="true">
                    {padded(idx + 1)}
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 z-20 flex flex-col justify-end">
                    <div className="px-6 pb-12 sm:px-10 sm:pb-16 md:px-14 md:pb-18 lg:px-20 lg:pb-20 xl:px-24 xl:pb-24 max-w-5xl">
                      {/* Eyebrow */}
                      <div className="slide-eyebrow mb-4 flex items-center gap-3">
                        <span
                          className="text-white/40 text-[9px] sm:text-[11px] tracking-[0.3em] uppercase"
                          style={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontWeight: 400,
                          }}
                        >
                          Featured
                        </span>
                        <span className="block w-8 h-px bg-white/25" />
                        <span
                          className="text-white/40 text-[9px] sm:text-[11px] tracking-[0.3em] uppercase"
                          style={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontWeight: 400,
                          }}
                        >
                          {padded(idx + 1)} / {padded(totalSlides)}
                        </span>
                      </div>

                      {/* Title — word-by-word reveal */}
                      <h2
                        className="text-white font-black leading-[1.02] tracking-tight mb-0"
                        style={{
                          fontFamily: "'Unbounded',sans-serif",
                          fontSize: "clamp(1.8rem,5vw,5.5rem)",
                          textShadow: "0 8px 60px rgba(0,0,0,0.8)",
                        }}
                      >
                        {hero.title.split(" ").map((word, i) => (
                          <span
                            key={i}
                            className="slide-word inline-block mr-[0.22em]"
                            style={{
                              transformOrigin: "bottom center",
                              perspective: "400px",
                            }}
                          >
                            {word}
                          </span>
                        ))}
                      </h2>

                      {/* Divider */}
                      <div className="slide-divider mt-5 sm:mt-6 h-px w-16 sm:w-20 bg-gradient-to-r from-white/70 to-transparent" />

                      {/* Subtitle */}
                      {hero.subtitle && (
                        <p
                          className="slide-sub mt-4 text-white/55 text-sm sm:text-base leading-relaxed max-w-md"
                          style={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontWeight: 300,
                          }}
                        >
                          {hero.subtitle}
                        </p>
                      )}

                      {/* CTA */}
                      {hero.ctaLabel && (
                        <div className="slide-cta mt-6 sm:mt-8">
                          <a
                            href={hero.ctaHref ?? "#"}
                            className="hero-cta inline-flex items-center gap-3 border border-white/40 px-6 py-3 sm:px-8 sm:py-4"
                            style={{ fontFamily: "'DM Sans',sans-serif" }}
                          >
                            <span className="cta-label text-white text-xs sm:text-sm tracking-[0.2em] uppercase font-medium">
                              {hero.ctaLabel}
                            </span>
                            {CtaArrow}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20 w-9 h-9 border-t border-r border-white/20" />
                  <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 z-20 w-9 h-9 border-b border-l border-white/20" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ── Custom bottom controls ── */}
          {totalSlides > 1 && (
            <div className="absolute bottom-0 right-0 z-30 flex items-end">
              {/* Decorative vertical line */}
              <div className="hidden lg:block deco-line h-20 mr-6 mb-6" />

              {/* Control panel */}
              <div
                className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(14px)",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  borderLeft: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* Counter */}
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="slide-num text-white text-2xl sm:text-3xl leading-none"
                    style={{ fontWeight: 700 }}
                  >
                    {padded(activeIndex + 1)}
                  </span>
                  <span
                    className="text-white/30 text-xs"
                    style={{ fontFamily: "'DM Sans',sans-serif" }}
                  >
                    /{padded(totalSlides)}
                  </span>
                </div>

                {/* Progress — pure CSS animation, no per-frame JS */}
                <div
                  className="progress-track w-full h-0.5"
                  style={{ minWidth: "80px" }}
                >
                  <div
                    key={progressKey}
                    className="progress-fill running"
                    style={
                      {
                        "--slide-duration": `${SLIDE_DURATION}ms`,
                      } as React.CSSProperties
                    }
                  />
                </div>

                {/* Dot indicators */}
                <div className="flex items-center gap-2">
                  {heroes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => swiperRef.current?.slideToLoop(i)}
                      className={`dot-indicator ${i === activeIndex ? "active" : "inactive"}`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Prev / Next */}
                <div className="flex items-center gap-2">
                  <button
                    className="hero-nav-btn w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-white/20 text-white/70"
                    onClick={slidePrev}
                    aria-label="Previous slide"
                  >
                    {PrevIcon}
                  </button>
                  <button
                    className="hero-nav-btn w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-white/20 text-white/70"
                    onClick={slideNext}
                    aria-label="Next slide"
                  >
                    {NextIcon}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
