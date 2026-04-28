import { useEffect, useRef } from 'react';
import { SectionProps } from "./types";

export function HeroSection({ data, device, settings }: SectionProps) {
  const isMobile = device === "mobile";
  const hasBg = !!data.backgroundImage;
  const primaryColor = settings?.colors.primary || "#0EA5E9";
  const headingFont = settings?.typography.headingFont || "'Space Grotesk', sans-serif";

  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (bgRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        bgRef.current.style.transform = `translateY(${rate}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className="relative min-h-[85vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
      <div
        ref={bgRef}
        className="absolute inset-0"
        style={{
          backgroundImage: hasBg ? `url(${data.backgroundImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: hasBg ? undefined : primaryColor,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {data.label && (
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs md:text-sm font-medium tracking-wider uppercase">
            {data.label}
          </div>
        )}

        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 leading-[1.1] opacity-0 animate-fade-in"
          style={{ fontFamily: headingFont }}
        >
          {data.headline}
        </h1>

        {data.subheadline && (
          <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            {data.subheadline}
          </p>
        )}

        {data.body && (
          <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
            {data.body}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {data.buttonText && (
            <a
              href={data.buttonUrl || "#"}
              className="inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 text-base md:text-lg font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl"
            >
              {data.buttonText}
            </a>
          )}

          {data.buttonText2 && (
            <a
              href={data.buttonUrl2 || "#"}
              className="inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 text-base md:text-lg font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full transition-all duration-300 hover:bg-white/20 hover:border-white"
            >
              {data.buttonText2}
            </a>
          )}
        </div>
      </div>

      {/* Scroll Hint (optional) */}
      {data.showScrollHint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      )}
    </section>
  );
}
