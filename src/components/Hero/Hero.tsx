// Hero.tsx
import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useHeroes } from "../../hooks/useHeroes";
import Loader from "../ui/Loader";
import ErrorState from "../ui/Errorstate";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const SLIDE_DURATION = 6000;

const Hero: React.FC = () => {
  const { data, isLoading, isError, error } = useHeroes();
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const totalSlides = data?.data?.length ?? 0;

  // Smooth progress bar driven by rAF
  useEffect(() => {
    if (totalSlides <= 1) return;

    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      setProgress(Math.min(elapsed / SLIDE_DURATION, 1));
      if (elapsed < SLIDE_DURATION) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    startRef.current = null;
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIndex, totalSlides]);

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

  if (!data?.data || data.data.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-500 text-lg tracking-widest uppercase font-light">
          No heroes found
        </p>
      </section>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

        /* ─── Swiper overrides ─── */
        .hero-swiper .swiper-pagination {
          display: none !important; /* we use custom nav */
        }

        /* ─── Ken Burns ─── */
        .hero-swiper .swiper-slide-active .slide-img {
          animation: kenBurns 7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes kenBurns {
          from { transform: scale(1.14) translate(6px, -4px); }
          to   { transform: scale(1) translate(0, 0); }
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
          from { opacity:0; transform: translateY(52px) rotateX(18deg); filter: blur(8px); }
          to   { opacity:1; transform: translateY(0) rotateX(0deg); filter: blur(0); }
        }
        @keyframes riseUp {
          from { opacity:0; transform: translateY(24px); filter: blur(4px); }
          to   { opacity:1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes expandLine {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }

        /* ─── Vignette / atmosphere ─── */
        .hero-vignette {
          background: radial-gradient(ellipse 80% 60% at 20% 80%, rgba(0,0,0,0.75) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 80% at 80% 20%, rgba(0,0,0,0.3) 0%, transparent 60%);
        }

        /* ─── Grain ─── */
        .hero-grain::after {
          content:'';
          position:absolute;
          inset:0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E");
          pointer-events:none;
          z-index:15;
          mix-blend-mode:overlay;
        }

        /* ─── Scanline accent ─── */
        .hero-scanlines {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events:none;
        }

        /* ─── Number ticker ─── */
        .slide-num {
          font-family: 'Unbounded', sans-serif;
          font-feature-settings: 'tnum';
        }

        /* ─── CTA hover ─── */
        .hero-cta {
          position: relative;
          overflow: hidden;
        }
        .hero-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: white;
          transform: translateX(-101%);
          transition: transform 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        .hero-cta:hover::before { transform: translateX(0); }
        .hero-cta:hover .cta-label { color: #000; }
        .cta-label { position: relative; z-index: 1; transition: color 0.3s ease; }

        /* ─── Nav arrow hover ─── */
        .hero-nav-btn {
          transition: background 0.25s, transform 0.25s, opacity 0.25s;
        }
        .hero-nav-btn:hover {
          background: rgba(255,255,255,0.15);
          transform: scale(1.08);
        }
        .hero-nav-btn:active { transform: scale(0.96); }

        /* ─── Progress bar ─── */
        .progress-track {
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: white;
          border-radius: 2px;
          transition: width 0.05s linear;
        }

        /* ─── Decorative diagonal line ─── */
        .deco-line {
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent);
        }
      `}</style>

      <section className="w-full bg-zinc-950">
        <div className="w-full pt-14 sm:pt-16 lg:pt-20">
          <div className="relative">
            <Swiper
              effect={totalSlides > 1 ? "fade" : undefined}
              autoplay={{ delay: SLIDE_DURATION, disableOnInteraction: false }}
              loop={totalSlides > 1}
              speed={1200}
              modules={[Pagination, Autoplay, EffectFade]}
              className="hero-swiper w-full"
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => setActiveIndex(s.realIndex)}
            >
              {data.data.map((hero, idx) => (
                <SwiperSlide key={hero._id}>
                  <div
                    className="hero-grain relative w-full overflow-hidden"
                    style={{ height: "clamp(480px, 80vh, 780px)" }}
                  >
                    {/* Image */}
                    <img
                      src={hero.imageUrl}
                      alt={hero.title}
                      className="slide-img absolute inset-0 w-full h-full object-cover object-center"
                    />

                    {/* Gradient layers */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/5 z-[1]" />
                    <div className="absolute inset-0 hero-vignette z-[2]" />
                    <div className="absolute inset-0 hero-scanlines z-[3] opacity-40" />

                    {/* Top edge */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />

                    {/* ── Large ghost index number ── */}
                    <div
                      className="absolute right-6 sm:right-10 bottom-8 sm:bottom-12 z-10 pointer-events-none select-none"
                      style={{
                        fontFamily: "'Unbounded', sans-serif",
                        fontSize: "clamp(7rem, 18vw, 18rem)",
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "rgba(255,255,255,0.04)",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    {/* ── Content ── */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-end">
                      <div className="px-6 pb-12 sm:px-10 sm:pb-16 md:px-14 md:pb-18 lg:px-20 lg:pb-20 xl:px-24 xl:pb-24 max-w-5xl">
                        {/* Eyebrow */}
                        <div className="slide-eyebrow mb-4 flex items-center gap-3">
                          <span
                            className="text-white/40 text-[9px] sm:text-[11px] tracking-[0.3em] uppercase"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 400,
                            }}
                          >
                            Featured
                          </span>
                          <span className="block w-8 h-px bg-white/25" />
                          <span
                            className="text-white/40 text-[9px] sm:text-[11px] tracking-[0.3em] uppercase"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 400,
                            }}
                          >
                            {String(idx + 1).padStart(2, "0")} /{" "}
                            {String(totalSlides).padStart(2, "0")}
                          </span>
                        </div>

                        {/* Title */}
                        <h2
                          className="text-white font-black leading-[1.02] tracking-tight mb-0"
                          style={{
                            fontFamily: "'Unbounded', sans-serif",
                            fontSize: "clamp(1.8rem, 5vw, 5.5rem)",
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

                        {/* Subtitle (optional — uses hero.subtitle if exists) */}
                        {(hero as any).subtitle && (
                          <p
                            className="slide-sub mt-4 text-white/55 text-sm sm:text-base leading-relaxed max-w-md"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 300,
                            }}
                          >
                            {(hero as any).subtitle}
                          </p>
                        )}

                        {/* CTA */}
                        {(hero as any).ctaLabel && (
                          <div className="slide-cta mt-6 sm:mt-8">
                            <a
                              href={(hero as any).ctaHref ?? "#"}
                              className="hero-cta inline-flex items-center gap-3 border border-white/40 px-6 py-3 sm:px-8 sm:py-4"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              <span className="cta-label text-white text-xs sm:text-sm tracking-[0.2em] uppercase font-medium">
                                {(hero as any).ctaLabel}
                              </span>
                              <svg
                                className="cta-label w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                              </svg>
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
                {/* Side decorative line */}
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
                  {/* Slide counter */}
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="slide-num text-white text-2xl sm:text-3xl leading-none"
                      style={{ fontWeight: 700 }}
                    >
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-white/30 text-xs"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      /{String(totalSlides).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Progress track */}
                  <div
                    className="progress-track w-full h-0.5"
                    style={{ minWidth: "80px" }}
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>

                  {/* Dot indicators */}
                  <div className="flex items-center gap-2">
                    {data.data.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => swiperRef.current?.slideToLoop(i)}
                        className="transition-all duration-400"
                        style={{
                          width: i === activeIndex ? "24px" : "6px",
                          height: "3px",
                          borderRadius: "2px",
                          background:
                            i === activeIndex
                              ? "white"
                              : "rgba(255,255,255,0.3)",
                        }}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Prev / Next */}
                  <div className="flex items-center gap-2">
                    <button
                      className="hero-nav-btn w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-white/20 text-white/70"
                      onClick={() => swiperRef.current?.slidePrev()}
                      aria-label="Previous slide"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      className="hero-nav-btn w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-white/20 text-white/70"
                      onClick={() => swiperRef.current?.slideNext()}
                      aria-label="Next slide"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
