import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, ArrowLeft, Phone, Mail, MapPin,
  Instagram, Facebook, Youtube as YoutubeIcon,
  MessageCircle, Star, ChevronRight, Menu, X, ArrowUpRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SiteColors {
  primary: string;
  background: string;
  text: string;
  accent: string;
  gradient?: string;
}

interface SiteTypography {
  headingFont: string;
  bodyFont: string;
}

export default function BusinessLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState<any>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchSite = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("resort_submissions")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        if (data) setSiteData(data.data);
      } catch (err) {
        console.error("Error fetching site:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [id]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400 font-medium text-sm">Loading your site…</p>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4 bg-white">
        <p className="text-slate-500">Site not found.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>← Back to Dashboard</Button>
      </div>
    );
  }

  const {
    identity = {},
    brandStory = {},
    media = {},
    colorPalette: rawColors,
    typography: rawTypo,
    testimonials = [],
    features = [],
    amenities = [],
    roomTypes = [],
    faq = [],
    socialMedia = {},
    headerSettings = {},
    location = {},
    menuItems = [],
    services = [],
    videoTour,
    booking = {},
  } = siteData;

  const colors: SiteColors = rawColors || {
    primary: "#2563EB",
    background: "#FFFFFF",
    text: "#1E293B",
    accent: "#F59E0B",
    gradient: "linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)",
  };

  const typography: SiteTypography = rawTypo || {
    headingFont: "'DM Serif Display', serif",
    bodyFont: "'DM Sans', sans-serif",
  };

  const businessName = identity.resortName || identity.businessName || identity.name || "Business Name";
  const heroImage = media.heroImage || media.heroImages?.[0];
  const galleryImages: string[] = media.galleryImages || media.photos || [];

  const offerings = services?.length
    ? services
    : roomTypes?.length
    ? roomTypes
    : menuItems?.length
    ? menuItems
    : [];

  const offeringsLabel = roomTypes?.length
    ? "Accommodations"
    : menuItems?.length
    ? "Menu"
    : services?.length
    ? "Our Services"
    : "What We Offer";

  const navLinks: { label: string; href: string }[] = headerSettings.navigationLinks || [
    { label: "About", href: "#about" },
    ...(offerings.length ? [{ label: offeringsLabel, href: "#offerings" }] : []),
    ...(galleryImages.length ? [{ label: "Gallery", href: "#gallery" }] : []),
    { label: "Contact", href: "#contact" },
  ];

  const ctaLabel = identity.ctaLabel || (roomTypes?.length ? "Book Now" : "Get in Touch");
  const bookingUrl = booking?.url || booking?.embedUrl || null;
  const bookingSystem = booking?.system || null;
  const hasBookingWidget = booking?.embedCode && booking.embedCode.trim().length > 10;
  const hasBooking = hasBookingWidget || !!bookingUrl;
  const ctaHref = hasBooking ? "#book" : "#contact";

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-x-hidden scroll-smooth antialiased"
      style={{ backgroundColor: colors.background, color: colors.text, fontFamily: typography.bodyFont }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        html { scroll-behavior: smooth; }
        .hero-bg { background-attachment: fixed; }
        @media (max-width: 768px) { .hero-bg { background-attachment: scroll; } }
        .img-zoom { overflow: hidden; }
        .img-zoom img { transition: transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94); }
        .img-zoom:hover img { transform: scale(1.07); }
        .card-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-lift:hover { transform: translateY(-6px); box-shadow: 0 24px 64px rgba(0,0,0,0.10); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp 0.75s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.75s ease 0.12s forwards; opacity:0; }
        .fade-up-2 { animation: fadeUp 0.75s ease 0.26s forwards; opacity:0; }
        .fade-up-3 { animation: fadeUp 0.75s ease 0.40s forwards; opacity:0; }
        details[open] summary ~ * { animation: fadeUp 0.3s ease; }
        :focus-visible { outline: 2px solid ${colors.primary}; outline-offset: 3px; }
      `}</style>

      {/* Dashboard shortcut */}
      <div className="fixed top-4 left-4 z-[200]">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="bg-white/92 backdrop-blur shadow-lg border-0 text-xs font-semibold hover:bg-white gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Button>
      </div>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full",
          scrolled || navOpen
            ? "bg-white/96 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            : heroImage
            ? "bg-transparent"
            : "bg-white border-b border-slate-100"
        )}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-4">
          {/* Logo + name */}
          <div className="flex items-center gap-3 min-w-0">
            {media.logoUrl && (
              <img src={media.logoUrl} alt={businessName} className="h-8 w-auto object-contain shrink-0" />
            )}
            <span
              className={cn(
                "font-bold text-base sm:text-lg tracking-tight truncate transition-colors duration-300",
                scrolled || !heroImage ? "text-slate-900" : "text-white"
              )}
              style={{ fontFamily: typography.headingFont }}
            >
              {businessName}
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  scrolled || !heroImage
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-white/80 hover:text-white hover:bg-white/15"
                )}
              >
                {link.label}
              </a>
            ))}
            <a
              href={ctaHref}
              className="ml-3 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: colors.primary }}
            >
              {ctaLabel}
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            className={cn(
              "md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              scrolled || navOpen
                ? "bg-slate-100 text-slate-700"
                : heroImage
                ? "text-white bg-white/15"
                : "bg-slate-100 text-slate-700"
            )}
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle menu"
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            navOpen ? "max-h-[26rem] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setNavOpen(false)}
                className="px-4 py-3.5 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href={ctaHref}
              onClick={() => setNavOpen(false)}
              className="mt-1 px-4 py-3.5 rounded-2xl text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        className="hero-bg relative min-h-[100svh] flex items-end pb-16 sm:pb-24 px-5 sm:px-8 pt-24"
        style={{
          background: heroImage
            ? `url(${heroImage}) center/cover no-repeat`
            : colors.gradient || `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        }}
      >
        {heroImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />
        )}

        <div className="relative max-w-7xl mx-auto w-full">
          {brandStory.tagline && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6 fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
              <span className="text-white/90 text-xs font-semibold tracking-[0.18em] uppercase">
                {brandStory.tagline}
              </span>
            </div>
          )}

          <h1
            className="text-[clamp(2.6rem,8vw,5.5rem)] font-bold text-white leading-[1.0] tracking-tight mb-5 max-w-4xl fade-up-1"
            style={{ fontFamily: typography.headingFont }}
          >
            {businessName}
          </h1>

          {brandStory.shortDescription && (
            <p className="text-white/70 text-base sm:text-xl mb-9 leading-relaxed max-w-lg fade-up-2">
              {brandStory.shortDescription}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 fade-up-3">
            <a
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-sm sm:text-base shadow-2xl transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: colors.accent || colors.primary }}
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            {offerings.length > 0 && (
              <a
                href="#offerings"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-sm sm:text-base bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-all"
              >
                {offeringsLabel}
              </a>
            )}
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 pointer-events-none">
          <div className="w-px h-10 bg-white animate-pulse" />
        </div>
      </section>

      {/* ── BOOKING ─────────────────────────────────────────── */}
      {(hasBookingWidget || bookingUrl) && (
        <section id="book" className="px-5 sm:px-8 py-16 sm:py-24" style={{ backgroundColor: colors.background }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: colors.primary }}>
                Reservations
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: typography.headingFont }}
              >
                {booking.sectionTitle || "Book Your Stay"}
              </h2>
              {booking.sectionSubtitle && (
                <p className="text-slate-500 mt-3 text-base">{booking.sectionSubtitle}</p>
              )}
              {bookingSystem && (
                <p className="text-xs text-slate-400 mt-1">Powered by {bookingSystem}</p>
              )}
            </div>

            {hasBookingWidget ? (
              <div
                className="w-full rounded-3xl overflow-hidden bg-white shadow-xl border border-slate-100"
                dangerouslySetInnerHTML={{ __html: booking.embedCode }}
              />
            ) : (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 sm:p-14 flex flex-col items-center gap-6 text-center">
                <p className="text-slate-500 max-w-md leading-relaxed">
                  Check availability and reserve your stay directly — best rates guaranteed when you book with us.
                </p>
                <a
                  href={bookingUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-base shadow-xl hover:opacity-90 hover:scale-[1.02] transition-all"
                  style={{ backgroundColor: colors.primary }}
                >
                  {ctaLabel} <ArrowUpRight className="h-5 w-5" />
                </a>
                <div className="flex flex-wrap justify-center gap-5 text-xs text-slate-400 font-medium">
                  {["Instant confirmation", "No hidden fees", "Best rate guaranteed"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── ABOUT ───────────────────────────────────────────── */}
      {(brandStory.fullDescription || brandStory.shortDescription || identity.ownerName) && (
        <section id="about" className="py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_1.15fr] gap-16 lg:gap-28 items-center">
              {/* Image column */}
              <div className="relative order-2 lg:order-1">
                <div className="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] rounded-[2.5rem] bg-slate-100 img-zoom">
                  {(media.ownerPhoto || media.aboutImage || galleryImages[0]) ? (
                    <img
                      src={media.ownerPhoto || media.aboutImage || galleryImages[0]}
                      alt="About"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-[2.5rem]"
                      style={{ background: colors.gradient || colors.primary }}
                    />
                  )}
                </div>
                {/* Floating amenities pill */}
                {amenities.length > 0 && (
                  <div className="absolute -bottom-5 sm:-bottom-6 left-4 right-4 sm:-right-6 bg-white rounded-2xl shadow-2xl p-4 sm:p-5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Top Amenities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {amenities.slice(0, 4).map((a: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ backgroundColor: `${colors.primary}12`, color: colors.primary }}
                        >
                          {a}
                        </span>
                      ))}
                      {amenities.length > 4 && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
                          +{amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Text column */}
              <div className="order-1 lg:order-2">
                <p
                  className="text-xs font-bold tracking-[0.2em] uppercase mb-5"
                  style={{ color: colors.primary }}
                >
                  Our Story
                </p>
                <h2
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-7"
                  style={{ fontFamily: typography.headingFont }}
                >
                  {identity.ownerName ? `Meet ${identity.ownerName}` : "About Us"}
                </h2>
                <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-9">
                  {brandStory.fullDescription || brandStory.shortDescription}
                </p>
                {features.length > 0 && (
                  <ul className="space-y-4">
                    {features.map((f: any, i: number) => {
                      const isObj = typeof f === "object" && f !== null;
                      const label = isObj ? f.title : f;
                      const desc = isObj ? f.description : null;
                      return (
                        <li key={i} className="flex items-start gap-4">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800 text-sm">{label}</span>
                            {desc && (
                              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── AMENITIES ───────────────────────────────────────── */}
      {amenities.length > 0 && (
        <section className="py-16 sm:py-20 px-5 sm:px-8" style={{ backgroundColor: `${colors.primary}07` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: colors.primary }}>
                Amenities
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: typography.headingFont }}
              >
                Everything Included
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {amenities.map((a: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 cursor-default"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: colors.primary }}
                  />
                  {a}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── OFFERINGS ───────────────────────────────────────── */}
      {offerings.length > 0 && (
        <section id="offerings" className="py-24 sm:py-32 px-5 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
              <div>
                <p
                  className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
                  style={{ color: colors.primary }}
                >
                  {offeringsLabel}
                </p>
                <h2
                  className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
                  style={{ fontFamily: typography.headingFont }}
                >
                  {roomTypes?.length
                    ? "Find Your Perfect Stay"
                    : services?.length
                    ? "How We Help"
                    : "What We Offer"}
                </h2>
              </div>
              {hasBooking && (
                <a
                  href={ctaHref}
                  className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2.5"
                  style={{ color: colors.primary }}
                >
                  View All <ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {offerings.map((item: any, i: number) => (
                <div
                  key={i}
                  className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm card-lift flex flex-col"
                >
                  {item.imageUrl && (
                    <div className="aspect-[4/3] img-zoom">
                      <img
                        src={item.imageUrl}
                        alt={item.name || item.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className="font-bold text-lg text-slate-900 leading-snug"
                        style={{ fontFamily: typography.headingFont }}
                      >
                        {item.name || item.title}
                      </h3>
                      {item.price && (
                        <span
                          className="text-xs font-black shrink-0 px-3 py-1.5 rounded-xl"
                          style={{ backgroundColor: `${colors.accent}18`, color: colors.accent }}
                        >
                          ₱{Number(item.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p
                        className="text-sm text-slate-500 leading-relaxed flex-1"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        } as React.CSSProperties}
                      >
                        {item.description}
                      </p>
                    )}
                    <a
                      href={ctaHref}
                      className="mt-auto inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {roomTypes?.length ? "Book Now" : "Inquire"}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY ─────────────────────────────────────────── */}
      {galleryImages.length > 1 && (
        <section id="gallery" className="py-24 sm:py-32 px-5 sm:px-8" style={{ backgroundColor: `${colors.primary}07` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: colors.primary }}>
                Gallery
              </p>
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                style={{ fontFamily: typography.headingFont }}
              >
                See It For Yourself
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryImages.map((img: string, i: number) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-[1.5rem] bg-slate-200 img-zoom"
                >
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── VIDEO TOUR ──────────────────────────────────────── */}
      {videoTour && (
        <section className="py-20 sm:py-24 px-5 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                style={{ fontFamily: typography.headingFont }}
              >
                Take a Virtual Tour
              </h2>
            </div>
            <div className="aspect-video rounded-[2rem] overflow-hidden shadow-2xl">
              <iframe
                src={videoTour.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allowFullScreen
                title="Video tour"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ backgroundColor: `${colors.primary}07` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: colors.primary }}>
                Reviews
              </p>
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                style={{ fontFamily: typography.headingFont }}
              >
                What Our Guests Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t: any, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-[2rem] p-7 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-5 card-lift"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base flex-1">
                    "{t.text || t.review}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {(t.name || t.author || "G").charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{t.name || t.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────── */}
      {faq.length > 0 && (
        <section className="py-24 sm:py-32 px-5 sm:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: colors.primary }}>
                FAQ
              </p>
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                style={{ fontFamily: typography.headingFont }}
              >
                Common Questions
              </h2>
            </div>
            <div className="space-y-3">
              {faq.map((item: any, i: number) => (
                <details
                  key={i}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 transition-colors"
                >
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-slate-900 text-sm sm:text-base list-none gap-3">
                    {item.question}
                    <ChevronRight
                      className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-90"
                      style={{ color: colors.primary }}
                    />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-slate-500 leading-relaxed text-sm sm:text-base">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      {hasBooking && (
        <section
          className="py-20 sm:py-24 px-5 sm:px-8 text-white text-center"
          style={{
            background:
              colors.gradient ||
              `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
          }}
        >
          <div className="max-w-2xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight"
              style={{ fontFamily: typography.headingFont }}
            >
              Ready to Experience {businessName}?
            </h2>
            <p className="text-white/70 text-base sm:text-lg mb-9">
              {brandStory.tagline || "Book your stay today and create memories that last a lifetime."}
            </p>
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2.5 px-9 py-4 bg-white rounded-2xl font-bold text-sm sm:text-base shadow-xl hover:opacity-95 hover:scale-[1.02] transition-all"
              style={{ color: colors.primary }}
            >
              {ctaLabel} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      )}

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section id="contact" className="py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
            {/* Info */}
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-5" style={{ color: colors.primary }}>
                Get In Touch
              </p>
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight mb-10 leading-tight"
                style={{ fontFamily: typography.headingFont }}
              >
                We'd love to<br className="hidden sm:block" /> hear from you
              </h2>

              <div className="space-y-3 mb-10">
                {(identity.phone || location.phone) && (
                  <a
                    href={`tel:${identity.phone || location.phone}`}
                    className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all group"
                  >
                    <span
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Phone className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">Phone</p>
                      <span className="font-semibold text-slate-800 text-sm group-hover:underline">
                        {identity.phone || location.phone}
                      </span>
                    </div>
                  </a>
                )}
                {(identity.contactEmail || location.contactEmail || location.email) && (
                  <a
                    href={`mailto:${identity.contactEmail || location.contactEmail || location.email}`}
                    className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all group"
                  >
                    <span
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">Email</p>
                      <span className="font-semibold text-slate-800 text-sm group-hover:underline break-all">
                        {identity.contactEmail || location.contactEmail || location.email}
                      </span>
                    </div>
                  </a>
                )}
                {(location.fullAddress || identity.location) && (
                  <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50">
                    <span
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">Address</p>
                      <span className="font-semibold text-slate-800 text-sm leading-relaxed">
                        {location.fullAddress || identity.location}
                      </span>
                    </div>
                  </div>
                )}
                {(socialMedia.whatsapp || location.whatsapp) && (
                  <a
                    href={`https://wa.me/${(socialMedia.whatsapp || location.whatsapp).replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-all"
                  >
                    <span className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium mb-0.5">WhatsApp</p>
                      <span className="font-semibold text-emerald-800 text-sm">Chat with us</span>
                    </div>
                  </a>
                )}
              </div>

              {/* Social icons */}
              <div className="flex gap-2.5">
                {socialMedia.facebook && (
                  <a
                    href={socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: `${colors.primary}12`, color: colors.primary }}
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialMedia.instagram && (
                  <a
                    href={socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialMedia.youtube && (
                  <a
                    href={socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center transition-all hover:scale-110"
                  >
                    <YoutubeIcon className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7 sm:p-10">
              <h3 className="text-xl font-bold mb-1.5" style={{ fontFamily: typography.headingFont }}>
                Send a Message
              </h3>
              <p className="text-sm text-slate-400 mb-7">We'll get back to you within 24 hours.</p>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": colors.primary } as React.CSSProperties}
                    placeholder="Your Name"
                  />
                  <input
                    type="tel"
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                    placeholder="Phone Number"
                  />
                </div>
                <input
                  type="email"
                  className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                  placeholder="Email Address"
                />
                <textarea
                  className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm h-32 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none"
                  placeholder="How can we help you?"
                />
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                  style={{ backgroundColor: colors.primary }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="relative py-16 sm:py-20 backdrop-blur-sm" style={{ backgroundColor: `${colors.background}F0` }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Logo + About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {media.logoUrl && (
                  <img src={media.logoUrl} alt={businessName} className="h-8 w-auto object-contain" />
                )}
                <span
                  className="font-bold text-lg tracking-tight"
                  style={{ fontFamily: typography.headingFont, color: colors.text }}
                >
                  {businessName}
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                {brandStory.shortDescription || "Experience the best in luxury and comfort."}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-slate-500 hover:text-slate-900 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Contact Info</h3>
              <div className="space-y-3">
                {(identity.phone || location.phone) && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 text-sm">{identity.phone || location.phone}</span>
                  </div>
                )}
                {(identity.contactEmail || location.contactEmail || location.email) && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 text-sm break-all">
                      {identity.contactEmail || location.contactEmail || location.email}
                    </span>
                  </div>
                )}
                {(location.fullAddress || identity.location) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 text-sm leading-relaxed">
                      {location.fullAddress || identity.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Newsletter</h3>
              <p className="text-slate-500 text-sm mb-4">Subscribe for updates and exclusive offers.</p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": colors.primary } as React.CSSProperties}
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: colors.primary }}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-200">
            {/* Social Icons */}
            <div className="flex gap-3">
              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: `${colors.primary}12`, color: colors.primary }}
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialMedia.youtube && (
                <a
                  href={socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center transition-all hover:scale-110"
                >
                  <YoutubeIcon className="h-5 w-5" />
                </a>
              )}
            </div>

            {/* Copyright */}
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </p>
          </div>
        </div>

        {/* Back-to-Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-6 left-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="Back to top"
        >
          <ArrowUpRight className="h-5 w-5" style={{ color: colors.primary, transform: 'rotate(-90deg)' }} />
        </button>
      </footer>

      {/* Floating WhatsApp */}
      {(socialMedia.whatsapp || location.whatsapp) && (
        <a
          href={`https://wa.me/${(socialMedia.whatsapp || location.whatsapp).replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}
    </div>
  );
}
