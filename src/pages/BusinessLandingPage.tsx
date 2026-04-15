import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Phone, Mail, MapPin, ExternalLink, Instagram, Facebook, Youtube as YoutubeIcon, MessageCircle, Star, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Utility ───────────────────────────────────────────
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Type helpers ──────────────────────────────────────
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

  // ── Destructure with safe defaults ──
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
    footerSettings = {},
    location = {},
    menuItems = [],
    services = [],
    videoTour,
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

  // ── Resolve content labels based on business type ──
  const businessName = identity.resortName || identity.businessName || identity.name || "Business Name";
  const heroImage = media.heroImage || media.heroImages?.[0];
  const galleryImages: string[] = media.galleryImages || media.photos || [];

  // Services / offerings — unify multiple possible field names
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

  // Nav links
  const navLinks: { label: string; href: string }[] = headerSettings.navigationLinks || [
    { label: "About", href: "#about" },
    ...(offerings.length ? [{ label: offeringsLabel, href: "#offerings" }] : []),
    ...(galleryImages.length ? [{ label: "Gallery", href: "#gallery" }] : []),
    { label: "Contact", href: "#contact" },
  ];

  const ctaLabel = identity.ctaLabel || (roomTypes?.length ? "Book Now" : "Get in Touch");

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-x-hidden scroll-smooth"
      style={{ backgroundColor: colors.background, color: colors.text, fontFamily: typography.bodyFont }}
    >
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        .hero-parallax { background-attachment: fixed; }
        @media (max-width: 768px) { .hero-parallax { background-attachment: scroll; } }
      `}</style>

      {/* Dashboard shortcut */}
      <div className="fixed top-4 left-4 z-[200]">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="bg-white/90 backdrop-blur shadow-lg border-0 text-xs font-semibold hover:bg-white"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Dashboard
        </Button>
      </div>

      {/* ── HEADER ── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
          scrolled || navOpen
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : heroImage
            ? "bg-transparent"
            : "bg-white border-b"
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo / Name */}
          <div className="flex items-center gap-3 min-w-0">
            {media.logoUrl && (
              <img src={media.logoUrl} alt={businessName} className="h-9 w-auto object-contain shrink-0" />
            )}
            <span
              className={cn(
                "font-bold text-lg truncate transition-colors",
                scrolled || !heroImage ? "" : "text-white"
              )}
              style={{ fontFamily: typography.headingFont }}
            >
              {businessName}
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold tracking-wide hover:opacity-70 transition-opacity",
                  scrolled || !heroImage ? "text-current" : "text-white"
                )}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="px-5 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              {ctaLabel}
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            className={cn("md:hidden p-2 rounded-lg transition-colors", scrolled || !heroImage ? "" : "text-white")}
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle menu"
          >
            {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav drawer */}
        {navOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setNavOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setNavOpen(false)}
                className="mt-2 px-4 py-3 rounded-xl text-base font-bold text-white text-center"
                style={{ backgroundColor: colors.primary }}
              >
                {ctaLabel}
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section
        className="hero-parallax relative min-h-[90vh] flex items-end justify-start px-4 sm:px-8 pb-16 pt-24"
        style={{
          background: heroImage
            ? `linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%), url(${heroImage}) center/cover no-repeat`
            : colors.gradient || `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="max-w-2xl">
            {brandStory.tagline && (
              <p className="text-white/70 text-sm font-semibold tracking-widest uppercase mb-4">
                {brandStory.tagline}
              </p>
            )}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.05] mb-6"
              style={{ fontFamily: typography.headingFont }}
            >
              {brandStory.shortDescription || businessName}
            </h1>
            {brandStory.shortDescription && brandStory.tagline && (
              <p className="text-white/80 text-lg sm:text-xl mb-8 leading-relaxed max-w-lg">
                {brandStory.tagline}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-white text-base transition-transform hover:scale-105 shadow-xl"
                style={{ backgroundColor: colors.accent || colors.primary }}
              >
                {ctaLabel} <ChevronRight className="h-4 w-4" />
              </a>
              {offerings.length > 0 && (
                <a
                  href="#offerings"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-white text-base bg-white/20 backdrop-blur hover:bg-white/30 transition-colors"
                >
                  {offeringsLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT / STORY ── */}
      {(brandStory.fullDescription || brandStory.shortDescription || identity.ownerName) && (
        <section id="about" className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ color: colors.primary }}
                >
                  Our Story
                </p>
                <h2
                  className="text-4xl sm:text-5xl font-bold leading-tight mb-6"
                  style={{ fontFamily: typography.headingFont }}
                >
                  {identity.ownerName
                    ? `Meet ${identity.ownerName}`
                    : "About Us"}
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {brandStory.fullDescription || brandStory.shortDescription}
                </p>
                {features.length > 0 && (
                  <ul className="space-y-3">
                    {features.map((f: any, i: number) => {
                      const isObj = typeof f === "object" && f !== null;
                      const label = isObj ? f.title : f;
                      const icon = isObj ? f.icon : null;
                      const desc = isObj ? f.description : null;
                      return (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shrink-0 mt-0.5" style={{ backgroundColor: colors.primary }}>
                            {icon || "✓"}
                          </span>
                          <div>
                            <span className="font-semibold">{label}</span>
                            {desc && <p className="text-slate-500 text-xs mt-0.5">{desc}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              {/* Owner photo or hero fallback */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100">
                  {(media.ownerPhoto || media.aboutImage || galleryImages[0]) ? (
                    <img
                      src={media.ownerPhoto || media.aboutImage || galleryImages[0]}
                      alt="About"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: colors.gradient || colors.primary }}
                    />
                  )}
                </div>
                {/* Amenities badges */}
                {amenities.length > 0 && (
                  <div className="absolute -bottom-5 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 flex flex-wrap gap-2">
                    {amenities.slice(0, 4).map((a: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
                      >
                        {a}
                      </span>
                    ))}
                    {amenities.length > 4 && (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
                        +{amenities.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── OFFERINGS (Rooms / Services / Menu) ── */}
      {offerings.length > 0 && (
        <section
          id="offerings"
          className="py-20 sm:py-28 px-4 sm:px-6"
          style={{ backgroundColor: `${colors.primary}08` }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: colors.primary }}
              >
                {offeringsLabel}
              </p>
              <h2
                className="text-4xl sm:text-5xl font-bold"
                style={{ fontFamily: typography.headingFont }}
              >
                {roomTypes?.length ? "Find Your Perfect Stay" : services?.length ? "How We Can Help" : "What We Offer"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offerings.map((item: any, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  {item.imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name || item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3
                        className="font-bold text-xl text-slate-900 leading-tight"
                        style={{ fontFamily: typography.headingFont }}
                      >
                        {item.name || item.title}
                      </h3>
                      {item.price && (
                        <span
                          className="text-sm font-black shrink-0 px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}
                        >
                          ₱{Number(item.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-4">{item.description}</p>
                    )}
                    <a
                      href="#contact"
                      className="mt-auto w-full py-3 rounded-2xl text-sm font-bold text-center text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {roomTypes?.length ? "Book Now" : "Inquire"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY ── */}
      {galleryImages.length > 1 && (
        <section id="gallery" className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: colors.primary }}>Gallery</p>
              <h2 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: typography.headingFont }}>
                See It For Yourself
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryImages.slice(0, 6).map((img: string, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "overflow-hidden rounded-2xl bg-slate-100",
                    i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"
                  )}
                >
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── VIDEO TOUR ── */}
      {videoTour && (
        <section className="py-20 px-4 sm:px-6 bg-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: typography.headingFont }}>
              Take a Tour
            </h2>
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
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

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="py-20 sm:py-28 px-4 sm:px-6" style={{ backgroundColor: `${colors.primary}08` }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: colors.primary }}>Reviews</p>
              <h2 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: typography.headingFont }}>
                What Our Guests Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t: any, i: number) => (
                <div key={i} className="bg-white rounded-3xl p-7 shadow-sm flex flex-col gap-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed flex-1">"{t.text || t.review}"</p>
                  <p className="text-sm font-bold text-slate-900">{t.name || t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {faq.length > 0 && (
        <section className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: colors.primary }}>FAQ</p>
              <h2 className="text-4xl font-bold" style={{ fontFamily: typography.headingFont }}>Common Questions</h2>
            </div>
            <div className="space-y-4">
              {faq.map((item: any, i: number) => (
                <details key={i} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-slate-900 list-none">
                    {item.question}
                    <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-6 pb-5 text-slate-600 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left — info */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: colors.primary }}>Get In Touch</p>
              <h2
                className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
                style={{ fontFamily: typography.headingFont }}
              >
                We'd love to hear from you
              </h2>
              <div className="space-y-4 mb-8">
                {(identity.phone || location.phone) && (
                  <a
                    href={`tel:${identity.phone || location.phone}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: colors.primary }}>
                      <Phone className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-slate-800 group-hover:underline">{identity.phone || location.phone}</span>
                  </a>
                )}
                {(identity.contactEmail || location.email) && (
                  <a
                    href={`mailto:${identity.contactEmail || location.email}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: colors.primary }}>
                      <Mail className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-slate-800 group-hover:underline break-all">{identity.contactEmail || location.email}</span>
                  </a>
                )}
                {(location.fullAddress || identity.location) && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5" style={{ backgroundColor: colors.primary }}>
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-slate-800 leading-relaxed">{location.fullAddress || identity.location}</span>
                  </div>
                )}
                {socialMedia.whatsapp && (
                  <a
                    href={`https://wa.me/${socialMedia.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500 text-white shrink-0">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-green-800">Chat on WhatsApp</span>
                  </a>
                )}
              </div>
              {/* Social links */}
              <div className="flex gap-3 flex-wrap">
                {socialMedia.facebook && (
                  <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-blue-100 flex items-center justify-center transition-colors"
                    style={{ color: colors.primary }}>
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialMedia.instagram && (
                  <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-pink-100 flex items-center justify-center transition-colors text-pink-600">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialMedia.youtube && (
                  <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors text-red-600">
                    <YoutubeIcon className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Right — contact form */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-5" style={{ fontFamily: typography.headingFont }}>Send a Message</h3>
              <div className="space-y-4">
                <input
                  className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base focus:outline-none focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": colors.primary } as any}
                  placeholder="Your Name"
                />
                <input
                  className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base focus:outline-none focus:ring-2 transition-all"
                  placeholder="Phone or Email"
                />
                <textarea
                  className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-base h-32 focus:outline-none focus:ring-2 transition-all resize-none"
                  placeholder="How can we help you?"
                />
                <button
                  className="w-full py-4 rounded-2xl text-base font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: colors.primary }}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t" style={{ backgroundColor: colors.background }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg" style={{ fontFamily: typography.headingFont }}>{businessName}</p>
              {location.fullAddress && (
                <p className="text-sm text-slate-500 mt-1">{location.fullAddress}</p>
              )}
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      {socialMedia.whatsapp && (
        <a
          href={`https://wa.me/${socialMedia.whatsapp.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}
    </div>
  );
}
