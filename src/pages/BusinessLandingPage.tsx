import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
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

// Compute template-specific visual modifiers
function getTemplateModifiers(template: string, colors: SiteColors, typography: SiteTypography) {
  const base = {
    heroOverlay: "from-black/40 via-black/25 to-black/75",
    badgeBg: "bg-white/10 backdrop-blur-sm",
    badgeBorder: "border border-white/20",
    headingLetterSpacing: "-0.02em",
    subTextOpacity: "0.9",
    cardRadius: "rounded-3xl",
    cardBorder: "border-slate-100",
    cardShadow: "shadow-lg hover:shadow-2xl",
    buttonRadius: "rounded-full",
    sectionSpacing: "py-16 md:py-24",
    galleryRadius: "rounded-[1.5rem]",
    accentGlow: false,
    hasMesh: false,
    hasNoise: false,
  };

  switch (template) {
    case "luxury":
      return {
        ...base,
        heroOverlay: "from-black/60 via-black/40 to-black/85",
        badgeBg: "bg-gradient-to-r from-amber-500/90 to-amber-600/90 backdrop-blur-md",
        badgeBorder: "border border-amber-400/30",
        headingLetterSpacing: "0.02em",
        subTextOpacity: "0.85",
        cardRadius: "rounded-2xl",
        cardBorder: "border-amber-100",
        cardShadow: "shadow-xl hover:shadow-[0_20px_60px_-12px_rgba(217,119,6,0.25)]",
        buttonRadius: "rounded-full",
        sectionSpacing: "py-20 md:py-28",
        galleryRadius: "rounded-2xl",
        accentGlow: true,
        hasMesh: false,
        hasNoise: false,
      };
    case "bold":
      return {
        ...base,
        heroOverlay: "from-black/35 via-black/20 to-black/60",
        badgeBg: "bg-white/95 backdrop-blur-md",
        badgeBorder: "border-0 shadow-lg",
        headingLetterSpacing: "-0.03em",
        subTextOpacity: "0.9",
        cardRadius: "rounded-2xl",
        cardBorder: "border-slate-200",
        cardShadow: "shadow-xl hover:shadow-[0_25px_50px_-12px_rgba(14,165,233,0.35)]",
        buttonRadius: "rounded-xl",
        sectionSpacing: "py-18 md:py-26",
        galleryRadius: "rounded-2xl",
        accentGlow: false,
        hasMesh: false,
        hasNoise: false,
      };
    case "tropical":
      return {
        ...base,
        heroOverlay: "from-cyan-950/60 via-cyan-900/40 to-cyan-950/85",
        badgeBg: "bg-white/90 backdrop-blur-sm border border-cyan-200",
        badgeBorder: "border border-cyan-200/50",
        headingLetterSpacing: "0.01em",
        subTextOpacity: "0.85",
        cardRadius: "rounded-2xl",
        cardBorder: "border-cyan-100",
        cardShadow: "shadow-lg hover:shadow-[0_20px_50px_-12px_rgba(6,182,212,0.30)]",
        buttonRadius: "rounded-full",
        sectionSpacing: "py-16 md:py-24",
        galleryRadius: "rounded-xl",
        accentGlow: false,
        hasMesh: true,
        hasNoise: false,
      };
    case "minimal":
    default:
      return {
        ...base,
        heroOverlay: "from-black/20 via-black/10 to-black/30",
        badgeBg: "bg-black/5 backdrop-blur-sm border border-black/5",
        badgeBorder: "border border-black/5",
        headingLetterSpacing: "-0.02em",
        subTextOpacity: "0.7",
        cardRadius: "rounded-xl",
        cardShadow: "shadow-sm hover:shadow-md",
        buttonRadius: "rounded-lg",
        sectionSpacing: "py-14 md:py-20",
        galleryRadius: "rounded-xl",
        accentGlow: false,
        hasMesh: false,
        hasNoise: true,  // subtle grain texture
      };
  }
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
        <Icons.Loader2 className="h-10 w-10 animate-spin text-blue-500" />
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
    template = "minimal",  // default if not set
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

  // Compute template-specific visual modifiers
  const templateModifiers = getTemplateModifiers(template, colors, typography);

  const businessName = identity.resortName || identity.businessName || identity.name || "Business Name";
  const aboutDescription = (brandStory.fullDescription || brandStory.shortDescription || '').split('\n\n').slice(0, 2).join('\n\n');
  const normalizeQuestion = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes('are you in port barton')) return 'Are you located in Port Barton?';
    if (lower.includes('you serve food')) return 'Do you serve food?';
    return q;
  };
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

  // Build default navigation from available sections; respect custom headerSettings if provided
  const defaultNavLinks = [
    { label: "About", href: "#about" },
    ...(roomTypes?.length ? [{ label: "Stay", href: "#stay" }] : []),
    ...(services?.length ? [{ label: "Experiences", href: "#experiences" }] : []),
    ...(galleryImages.length ? [{ label: "Gallery", href: "#gallery" }] : []),
    { label: "Contact", href: "#contact" },
  ];
  const navLinks: { label: string; href: string }[] = headerSettings.navigationLinks || defaultNavLinks;

  const ctaLabel = identity.ctaLabel || (roomTypes?.length ? "Book Now" : "Get in Touch");
  const bookingUrl = booking?.url || booking?.embedUrl || null;
  const bookingSystem = booking?.system || null;
  const hasBookingWidget = booking?.embedCode && booking.embedCode.trim().length > 10;
  const hasBooking = hasBookingWidget || !!bookingUrl;
  const ctaHref = hasBooking ? "#book" : "#contact";
  const whatsappNumber = socialMedia.whatsapp || location.whatsapp;

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
          <Icons.ArrowLeft className="h-3.5 w-3.5" /> Dashboard
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
            {navOpen ? <Icons.X className="h-5 w-5" /> : <Icons.Menu className="h-5 w-5" />}
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
        className="hero-bg relative min-h-[100svh] flex items-end pb-10 sm:pb-16 px-5 sm:px-8 pt-16"
        style={{
          background: heroImage
            ? `url(${heroImage}) center/cover no-repeat`
            : colors.gradient || `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        }}
      >
        {heroImage && (
          <div className={`absolute inset-0 bg-gradient-to-t ${templateModifiers.heroOverlay} pointer-events-none`} />
        )}

        <div className="relative max-w-7xl mx-auto w-full">
          {brandStory.tagline && (
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${templateModifiers.badgeBg} ${templateModifiers.badgeBorder} mb-6 fade-up`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
              <span className="text-white/90 text-xs font-semibold tracking-[0.18em] uppercase">
                {brandStory.tagline}
              </span>
            </div>
          )}

          <h1
            className="text-[clamp(3.2rem,10vw,7rem)] font-bold text-white leading-[0.95] tracking-tight mb-4 max-w-4xl fade-up-1"
            style={{ fontFamily: typography.headingFont, letterSpacing: templateModifiers.headingLetterSpacing }}
          >
            {businessName}
          </h1>

          {brandStory.shortDescription && (
            <p className="text-white/80 text-base sm:text-xl mb-6 leading-relaxed max-w-lg fade-up-2">
              {brandStory.shortDescription}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 fade-up-3">
            <a
              href={ctaHref}
              className={`inline-flex items-center justify-center gap-2.5 px-8 py-4 ${templateModifiers.buttonRadius} font-bold text-white text-sm sm:text-base ${templateModifiers.cardShadow} transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]`}
              style={{ backgroundColor: colors.accent || colors.primary }}
            >
              {ctaLabel}
              <Icons.ArrowUpRight className="h-4 w-4" />
            </a>
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-8 py-4 ${templateModifiers.buttonRadius} font-bold text-white text-sm sm:text-base bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all`}
              >
                <Icons.MessageCircle className="h-4 w-4" />
                WhatsApp
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
                  {ctaLabel} <Icons.ArrowUpRight className="h-5 w-5" />
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
        <section id="about" className="py-16 sm:py-24 px-5 sm:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_1.15fr] gap-16 lg:gap-28 items-center">
              {/* Image column */}
              <div className="relative order-2 lg:order-1">
                <div className="aspect-[3/4] rounded-[2.5rem] bg-slate-100 img-zoom">
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
                  <div className="absolute -bottom-4 sm:-bottom-5 left-4 right-4 sm:-right-5 bg-white rounded-xl shadow-xl p-3 sm:p-4 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">
                      Top Amenities
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {amenities.slice(0, 4).map((a: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    {amenities.length > 4 && (
                      <a
                        href="#amenities"
                        className="mt-2 block text-[10px] font-semibold"
                        style={{ color: colors.primary }}
                      >
                        View all
                      </a>
                    )}
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
                <p className="text-base sm:text-lg text-slate-500 leading-loose max-w-md mb-9">
                  {aboutDescription}
                </p>
                {features.length > 0 && (
                  <ul className="space-y-4">
                    {features.map((f: any, i: number) => {
                      const isObj = typeof f === "object" && f !== null;
                      const label = isObj ? f.title : f;
                      const desc = isObj ? f.description : null;
                      return (
                        <li key={i} className="flex items-start gap-3">
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
        <section className="py-16 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: `${colors.primary}05` }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: colors.primary }}>Amenities</p>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: typography.headingFont }}
              >Amenities</h2>
            </div>

            {(() => {

              const getAmenityData = (amenity: string) => {
                const lower = amenity.toLowerCase();
                if (lower.includes('wifi')) return { icon: Icons.Wifi, desc: 'High-speed internet access throughout the property.' };
                if (lower.includes('pool') || lower.includes('swimming')) return { icon: Icons.Waves, desc: 'Crystal-clear swimming pool with stunning views.' };
                if (lower.includes('restaurant') || lower.includes('dining')) return { icon: Icons.Utensils, desc: 'Fine dining with local and international cuisine.' };
                if (lower.includes('bar')) return { icon: Icons.Wine, desc: 'Relax with cocktails at our beachfront bar.' };
                if (lower.includes('spa')) return { icon: Icons.Sparkles, desc: 'Rejuvenate with our full-service spa treatments.' };
                if (lower.includes('gym')) return { icon: Icons.Dumbbell, desc: 'State-of-the-art fitness center for your workout needs.' };
                if (lower.includes('beach')) return { icon: Icons.Waves, desc: 'Direct access to pristine white-sand beaches.' };
                if (lower.includes('garden')) return { icon: Icons.Leaf, desc: 'Lush tropical gardens for peaceful strolls.' };
                if (lower.includes('jacuzzi')) return { icon: Icons.Droplets, desc: 'Soak in our luxurious jacuzzi tubs.' };
                if (lower.includes('kayak') || lower.includes('water') || lower.includes('boat') || lower.includes('island')) return { icon: Icons.Anchor, desc: 'Explore the waters with island hopping and water sports.' };
                if (lower.includes('snorkel') || lower.includes('dive')) return { icon: Icons.Fish, desc: 'Discover underwater wonders with snorkeling and diving gear.' };
                if (lower.includes('scooter') || lower.includes('bike') || lower.includes('rental')) return { icon: Icons.Bike, desc: 'Explore the island at your own pace.' };
                if (lower.includes('tennis')) return { icon: Icons.Trophy, desc: 'Challenge yourself on our tennis courts.' };
                if (lower.includes('golf')) return { icon: Icons.Flag, desc: 'Play a round on our championship golf course.' };
                if (lower.includes('massage')) return { icon: Icons.Hand, desc: 'Indulge in therapeutic massages.' };
                if (lower.includes('yoga')) return { icon: Icons.Sparkles, desc: 'Find balance with our yoga sessions.' };
                if (lower.includes('air')) return { icon: Icons.Snowflake, desc: 'Climate-controlled comfort in every room.' };
                if (lower.includes('parking')) return { icon: Icons.Car, desc: 'Secure parking facilities available.' };
                if (lower.includes('service')) return { icon: Icons.Bell, desc: '24/7 room service for your convenience.' };
                if (lower.includes('laundry')) return { icon: Icons.Shirt, desc: 'On-site laundry services.' };
                if (lower.includes('safe')) return { icon: Icons.Shield, desc: 'In-room safes for your valuables.' };
                if (lower.includes('tv')) return { icon: Icons.Tv, desc: 'Entertainment with cable TV.' };
                if (lower.includes('coffee')) return { icon: Icons.Coffee, desc: 'Fresh coffee in your room.' };
                if (lower.includes('mini bar')) return { icon: Icons.Wine, desc: 'Stocked mini bar with refreshments.' };
                if (lower.includes('balcony')) return { icon: Icons.Mountain, desc: 'Private balconies with scenic views.' };
                return { icon: null, desc: '' };
              };

              const categoryKeywords: Record<string, string[]> = {
                'Beach & Nature': ['beach', 'pool', 'garden', 'jacuzzi', 'kayak', 'snorkel', 'dive', 'nature', 'ocean', 'waves', 'leaf', 'boat', 'island', 'anch'],
                'Comfort & Tech': ['wifi', 'air', 'spa', 'gym', 'service', 'laundry', 'safe', 'tv', 'coffee', 'mini', 'balcony', 'comfort', 'sparkles', 'dumbbell', 'snowflake', 'bell', 'shirt', 'shield', 'tv', 'coffee', 'mountain', 'scooter', 'bike', 'rental'],
                'Dining & Entertainment': ['restaurant', 'bar', 'tennis', 'golf', 'massage', 'yoga', 'dining', 'entertainment', 'utensils', 'wine', 'trophy', 'flag', 'hand']
              };

              const groupedAmenities: Record<string, string[]> = {};
              amenities.forEach((a: string) => {
                const lower = a.toLowerCase();
                let assigned = false;
                for (const [cat, keywords] of Object.entries(categoryKeywords)) {
                  if (keywords.some(k => lower.includes(k))) {
                    if (!groupedAmenities[cat]) groupedAmenities[cat] = [];
                    groupedAmenities[cat].push(a);
                    assigned = true;
                    break;
                  }
                }
                if (!assigned) {
                  if (!groupedAmenities['Other']) groupedAmenities['Other'] = [];
                  groupedAmenities['Other'].push(a);
                }
              });

              return Object.entries(groupedAmenities).map(([category, amens]) => (
                amens.length > 0 && (
                  <div key={category} className="mb-8 last:mb-0">
                    <h3 className="text-sm font-bold tracking-[0.15em] uppercase mb-3 text-center" style={{ color: colors.primary }}>
                      {category}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {amens.map((amenity, i) => {
                        const { icon: Icon, desc } = getAmenityData(amenity);
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm transition-all hover:bg-primary/5 active:scale-95"
                            style={{
                              border: `1px solid ${colors.primary}20`,
                              color: colors.text,
                              backgroundColor: 'transparent',
                            }}
                          >
                            {Icon && <Icon className="h-3.5 w-3.5" style={{ color: colors.primary }} />}
                            {amenity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )
              ));
            })()}
          </div>
        </section>
      )}

      {/* ── STAY ─────────────────────────────────────────────── */}
      {roomTypes?.length > 0 && (
        <section id="stay" className="py-16 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: colors.background }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: colors.primary }}>Stay</p>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
                  style={{ fontFamily: typography.headingFont }}
                >
                  Find Your Perfect Retreat
                </h2>
              </div>
              {hasBooking && (
                <a
                  href={ctaHref}
                  className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2.5"
                  style={{ color: colors.primary }}
                >
                  View All <Icons.ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {roomTypes.map((room: any, i: number) => (
                <div
                  key={i}
                  className={`group bg-white ${templateModifiers.cardRadius} overflow-hidden ${templateModifiers.cardBorder} ${templateModifiers.cardShadow} transition-all duration-300`}
                >
                  {room.imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={room.imageUrl}
                        alt={room.name || room.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3
                        className="font-bold text-xl text-slate-900 leading-tight"
                        style={{ fontFamily: typography.headingFont }}
                      >
                        {room.name || room.title}
                      </h3>
                      {room.price && (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap" style={{ backgroundColor: `${colors.primary}12`, color: colors.primary }}>
                          ₱{Number(room.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {room.description && (
                      <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {room.description}
                      </p>
                    )}
                    <a
                      href={ctaHref}
                      className="inline-flex items-center gap-2 text-sm font-semibold"
                      style={{ color: colors.primary }}
                    >
                      Book Now <Icons.ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EXPERIENCES ───────────────────────────────────────── */}
      {services?.length > 0 && (
        <section id="experiences" className="py-16 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: `${colors.primary}05` }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: colors.primary }}>Experiences</p>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
                  style={{ fontFamily: typography.headingFont }}
                >
                  Curated Experiences
                </h2>
              </div>
              {hasBooking && (
                <a
                  href={ctaHref}
                  className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2.5"
                  style={{ color: colors.primary }}
                >
                  View All <Icons.ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service: any, i: number) => (
                <div
                  key={i}
                  className={`group bg-white ${templateModifiers.cardRadius} overflow-hidden ${templateModifiers.cardBorder} ${templateModifiers.cardShadow} transition-all duration-300`}
                >
                  {service.imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={service.imageUrl}
                        alt={service.name || service.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3
                        className="font-bold text-xl text-slate-900 leading-tight"
                        style={{ fontFamily: typography.headingFont }}
                      >
                        {service.name || service.title}
                      </h3>
                      {service.price && (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap" style={{ backgroundColor: `${colors.primary}12`, color: colors.primary }}>
                          ₱{Number(service.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <a
                      href={ctaHref}
                      className="inline-flex items-center gap-2 text-sm font-semibold"
                      style={{ color: colors.primary }}
                    >
                      Inquire <Icons.ArrowUpRight className="h-3.5 w-3.5" />
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
        <section id="gallery" className="py-16 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: `${colors.primary}07` }}>
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
        <section className="py-16 sm:py-24 px-5 sm:px-8">
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
        <section className="py-16 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: `${colors.primary}07` }}>
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
                      <Icons.Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
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
        <section className="py-16 sm:py-24 px-5 sm:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
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
                    <Icons.ChevronRight
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
          className="py-16 sm:py-24 px-5 sm:px-8 text-white text-center"
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
              className={`inline-flex items-center gap-2.5 px-9 py-4 bg-white ${templateModifiers.buttonRadius} font-bold text-sm sm:text-base shadow-xl hover:opacity-95 hover:scale-[1.02] transition-all`}
              style={{ color: colors.primary }}
            >
              {ctaLabel} <Icons.ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      )}

      {/* ── LOCATION ───────────────────────────────────────────── */}
      {(location.fullAddress || location.phone || location.contactEmail || location.googleMapsPlaceId) && (
        <section id="location" className="py-16 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: `${colors.primary}05` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: colors.primary }}>Location</p>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: typography.headingFont }}
              >Find Us</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* Map / Image */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-200">
                {location.googleMapsPlaceId ? (
                  <iframe
                    title="Map"
                    src={`https://www.google.com/maps/embed/v1/place?key=${(location as any).googleMapsApiKey || 'YOUR_API_KEY'}&q=${encodeURIComponent(location.googleMapsPlaceId)}`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <img
                    src={media.logoUrl || galleryImages[0] || undefined}
                    alt="Location view"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Details */}
              <div>
                <div className="space-y-6">
                  {location.fullAddress && (
                    <div className="flex items-start gap-3">
                      <Icons.MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: colors.primary }} />
                      <p className="text-slate-600 leading-relaxed">{location.fullAddress}</p>
                    </div>
                  )}
                  {(location.phone || identity.phone) && (
                    <div className="flex items-center gap-3">
                      <Icons.Phone className="h-4 w-4 shrink-0" style={{ color: colors.primary }} />
                      <p className="text-slate-600">{location.phone || identity.phone}</p>
                    </div>
                  )}
                  {(location.contactEmail || identity.contactEmail) && (
                    <div className="flex items-center gap-3">
                      <Icons.Mail className="h-4 w-4 shrink-0" style={{ color: colors.primary }} />
                      <p className="text-slate-600">{location.contactEmail || identity.contactEmail}</p>
                    </div>
                  )}
                </div>
                {(location.phone || location.contactEmail) && (
                  <a
                    href={whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}` : `tel:${location.phone || identity.phone}`}
                    className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Icons.MessageCircle className="h-4 w-4" />
                    Get in Touch
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section id="contact" className="py-16 sm:py-24 px-5 sm:px-8">
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

              <div className="space-y-2">
                {(identity.phone || location.phone) && (
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Icons.Phone className="h-4 w-4" />
                    {identity.phone || location.phone}
                  </p>
                )}
                {(identity.contactEmail || location.contactEmail || location.email) && (
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Icons.Mail className="h-4 w-4" />
                    {identity.contactEmail || location.contactEmail || location.email}
                  </p>
                )}
                {(location.fullAddress || identity.location) && (
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Icons.MapPin className="h-4 w-4" />
                    {location.fullAddress || identity.location}
                  </p>
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
                    type="email"
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                    placeholder="Email Address"
                  />
                </div>
                <textarea
                  className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm h-32 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none"
                  placeholder="Message"
                />
                <button
                  type="submit"
                  className={`w-full py-4 ${templateModifiers.buttonRadius} text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]`}
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
      <footer className="relative py-10 sm:py-12 border-t border-slate-100" style={{ backgroundColor: colors.background }}>
  <div className="max-w-7xl mx-auto px-5 sm:px-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          {media.logoUrl && <img src={media.logoUrl} alt={businessName} className="h-7 w-auto object-contain" />}
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: typography.headingFont, color: colors.text }}>{businessName}</span>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">
          {brandStory.shortDescription || "A modern boutique resort in Palawan offering luxury comfort and unforgettable experiences."}
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Explore</h4>
        <ul className="space-y-2 text-sm">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-slate-500 hover:text-slate-900 transition-colors">{link.label}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact + WhatsApp */}
      <div>
        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Contact</h4>
        <div className="space-y-3 text-sm">
          {(identity.phone || location.phone) && (
            <a href={`tel:${identity.phone || location.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <Icons.Phone className="h-4 w-4" /> {identity.phone || location.phone}
            </a>
          )}
          {(identity.contactEmail || location.contactEmail) && (
            <a href={`mailto:${identity.contactEmail || location.contactEmail}`} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <Icons.Mail className="h-4 w-4" /> {identity.contactEmail || location.contactEmail}
            </a>
          )}
        </div>
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            <Icons.MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        )}
      </div>
    </div>

    {/* Bottom: Copyright + Social */}
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
      <p className="text-slate-400 text-xs">© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
      <div className="flex gap-3">
        {socialMedia.facebook && (
          <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: `${colors.primary}12`, color: colors.primary }}>
            <Icons.Facebook className="h-4 w-4" />
          </a>
        )}
        {socialMedia.instagram && (
          <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center transition-all hover:scale-110">
            <Icons.Instagram className="h-4 w-4" />
          </a>
        )}
        {socialMedia.youtube && (
          <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center transition-all hover:scale-110">
            <Icons.Youtube className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  </div>

  {/* Back-to-Top Button */}
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className={`fixed bottom-6 left-6 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
      scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}
    aria-label="Back to top"
  >
    <Icons.ArrowUpRight className="h-4 w-4" style={{ color: colors.primary, transform: 'rotate(-90deg)' }} />
  </button>
</footer>

      {/* Floating WhatsApp */}
      {(socialMedia.whatsapp || location.whatsapp) && (
        <a
          href={`https://wa.me/${(socialMedia.whatsapp || location.whatsapp).replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <Icons.MessageCircle className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}
