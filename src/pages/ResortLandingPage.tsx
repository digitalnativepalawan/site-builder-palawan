import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ExternalLink, Facebook, Instagram, Youtube, Wifi, Phone, Mail, MapPin, Star, CheckCircle2, Clock, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResortLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      setError("No site ID provided");
      setLoading(false);
      return;
    }

    const fetchSite = async () => {
      try {
        const { data: submission, error: submissionError } = await supabase
          .from("resort_submissions")
          .select("*")
          .eq("id", id)
          .single();

        if (submissionError) throw new Error(submissionError.message);
        if (!submission || !submission.data) throw new Error("Resort not found");

        setSiteData(submission.data);
      } catch (err: any) {
        console.error("Error loading resort:", err);
        setError(err.message || "Failed to load resort");
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: "#0EA5E9" }} />
        <p className="text-muted-foreground">Loading your website...</p>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Website</h1>
        <p className="text-muted-foreground max-w-md text-center">{error || "Website not found"}</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Extract data with defaults
  const identity = siteData.identity || {};
  const brandStory = siteData.brandStory || {};
  const socialMedia = siteData.socialMedia || {};
  const header = siteData.header || {};
  const footer = siteData.footer || {};
  const hero = siteData.hero || {};
  const media = siteData.media || {};
  
  // Color palette with defaults
  const colors = siteData.colorPalette || {
    primary: "#0EA5E9",
    background: "#FFFFFF",
    text: "#1E293B",
    accent: "#F59E0B",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
  };

  // Typography with defaults
  const typography = siteData.typography || {
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Inter', sans-serif",
    scale: "comfortable",
  };

  const resortName = identity.resortName || "Resort";
  const headerLogoUrl = header.showLogo ? header.logoUrl : null;
  const headerLogoSize = header.logoSize || 120;
  const heroLogoUrl = hero.showLogo ? (hero.useSameAsHeader ? header.logoUrl : hero.heroLogoUrl) : null;
  const heroLogoSize = hero.heroLogoSize || 180;

  // Social media links
  const socialLinks = [
    { platform: "facebook", url: socialMedia.facebook, icon: Facebook },
    { platform: "instagram", url: socialMedia.instagram, icon: Instagram },
    { platform: "youtube", url: socialMedia.youtube, icon: Youtube },
  ].filter(s => s.url);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: typography.bodyFont,
      }}
    >
      {/* ========== INJECT FONTS ========== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@300;400;600&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      {/* ========== HEADER ========== */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          header.transparent ? "absolute w-full bg-transparent" : "bg-white/95 backdrop-blur-md shadow-sm"
        } ${header.sticky ? "" : "relative"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            {headerLogoUrl ? (
              <img
                src={headerLogoUrl}
                alt={resortName}
                style={{ height: headerLogoSize }}
                className="object-contain transition-transform hover:scale-105"
              />
            ) : (
              <h1
                className="text-xl sm:text-2xl font-bold transition-opacity hover:opacity-80"
                style={{ fontFamily: typography.headingFont, color: header.transparent ? "#ffffff" : colors.text }}
              >
                {resortName}
              </h1>
            )}

            {/* Navigation */}
            {header.showNavigation && (
              <nav className="hidden md:flex items-center gap-8">
                {header.navigationLinks?.map((link: any, i: number) => (
                  <a
                    key={i}
                    href={link.url}
                    className="text-sm font-medium transition-colors hover:opacity-70"
                    style={{
                      fontFamily: typography.bodyFont,
                      color: header.transparent ? "#ffffff" : colors.text,
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            {/* Social Icons */}
            {socialMedia.showInHeader && socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-transform hover:scale-110"
                      style={{ color: header.transparent ? "#ffffff" : colors.primary }}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}

            {/* Mobile Menu */}
            <button className="md:hidden p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={header.transparent ? "#ffffff" : colors.text}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section
        id="home"
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          background: media.heroImages?.[0]
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${media.heroImages[0]})`
            : colors.gradient || colors.primary,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        
        <div className="relative z-10 text-center px-4 py-20 max-w-5xl mx-auto">
          {/* Hero Logo */}
          {heroLogoUrl && (
            <div className="mb-8 animate-fade-in-down">
              <img
                src={heroLogoUrl}
                alt={resortName}
                style={{ height: heroLogoSize, maxWidth: "100%" }}
                className="mx-auto object-contain drop-shadow-2xl"
              />
            </div>
          )}

          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in-up"
            style={{
              fontFamily: typography.headingFont,
              color: "#ffffff",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}
          >
            {resortName}
          </h1>

          {brandStory.tagline && (
            <p
              className="text-xl sm:text-2xl md:text-3xl mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200"
              style={{ color: "rgba(255,255,255,0.95)", fontFamily: typography.headingFont }}
            >
              {brandStory.tagline}
            </p>
          )}

          {brandStory.shortDescription && (
            <p
              className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-12 animate-fade-in-up animation-delay-400"
              style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}
            >
              {brandStory.shortDescription}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
            <Button
              size="lg"
              className="px-10 py-7 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              style={{ backgroundColor: colors.accent, color: "#ffffff" }}
              onClick={() => window.location.href = `mailto:${identity.contactEmail || ""}`}
            >
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-10 py-7 text-lg font-semibold rounded-full border-2 hover:bg-white/10 transition-all hover:scale-105"
              style={{ borderColor: "#ffffff", color: "#ffffff" }}
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ========== ABOUT SECTION ========== */}
      {brandStory.fullDescription && (
        <section id="about" className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-4xl sm:text-5xl font-bold mb-8"
              style={{ fontFamily: typography.headingFont, color: colors.text }}
            >
              About Us
            </h2>
            <div className="w-24 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: colors.primary }} />
            <p
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: colors.text, lineHeight: 2, fontFamily: typography.bodyFont }}
            >
              {brandStory.fullDescription}
            </p>
          </div>
        </section>
      )}

      {/* ========== AMENITIES SECTION ========== */}
      {siteData.amenities?.length > 0 && (
        <section id="amenities" className="py-24 px-4" style={{ backgroundColor: colors.background }}>
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-4xl sm:text-5xl font-bold text-center mb-4"
              style={{ fontFamily: typography.headingFont, color: colors.text }}
            >
              Amenities
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Everything you need for a perfect stay
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {siteData.amenities.map((amenity: string, i: number) => (
                <div
                  key={i}
                  className="group p-6 rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <span className="font-medium" style={{ color: colors.text }}>
                      {amenity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== ROOMS SECTION ========== */}
      {siteData.roomTypes?.length > 0 && (
        <section id="rooms" className="py-24 px-4" style={{ backgroundColor: colors.background }}>
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-4xl sm:text-5xl font-bold text-center mb-4"
              style={{ fontFamily: typography.headingFont, color: colors.text }}
            >
              Our Rooms
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Choose your perfect accommodation
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {siteData.roomTypes.map((room: any, i: number) => (
                <div
                  key={i}
                  className="group rounded-3xl border bg-white shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
                >
                  <div
                    className="h-56 flex items-center justify-center"
                    style={{ background: `${colors.primary}15` }}
                  >
                    <span className="text-6xl">🏨</span>
                  </div>
                  <div className="p-8">
                    <h3
                      className="text-2xl font-bold mb-3"
                      style={{ fontFamily: typography.headingFont, color: colors.text }}
                    >
                      {room.name || "Room"}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold" style={{ color: colors.primary }}>
                        ₱{room.price || "0"}
                      </span>
                      <span className="text-muted-foreground">/night</span>
                    </div>
                    <p className="text-sm mb-6" style={{ color: colors.text, lineHeight: 1.8 }}>
                      {room.description || ""}
                    </p>
                    <Button
                      className="w-full py-6 text-lg font-semibold rounded-full transition-all hover:scale-105"
                      style={{ backgroundColor: colors.primary, color: "#ffffff" }}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== FAQ SECTION ========== */}
      {siteData.faq?.length > 0 && (
        <section id="faq" className="py-24 px-4" style={{ backgroundColor: `${colors.primary}08` }}>
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-4xl sm:text-5xl font-bold text-center mb-4"
              style={{ fontFamily: typography.headingFont, color: colors.text }}
            >
              FAQ
            </h2>
            <p className="text-center text-muted-foreground mb-12">Common questions answered</p>
            <div className="space-y-4">
              {siteData.faq.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3
                    className="text-xl font-semibold mb-3 flex items-start gap-3"
                    style={{ fontFamily: typography.headingFont, color: colors.text }}
                  >
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} />
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground ml-9" style={{ lineHeight: 1.8 }}>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== CONTACT SECTION ========== */}
      <section id="contact" className="py-24 px-4" style={{ backgroundColor: colors.background }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-4"
            style={{ fontFamily: typography.headingFont, color: colors.text }}
          >
            Contact Us
          </h2>
          <p className="text-center text-muted-foreground mb-12">We'd love to hear from you</p>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              {identity.contactEmail && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
                    <Mail className="h-6 w-6" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: colors.text }}>Email</p>
                    <a href={`mailto:${identity.contactEmail}`} className="hover:underline" style={{ color: colors.text }}>
                      {identity.contactEmail}
                    </a>
                  </div>
                </div>
              )}
              {identity.phone && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
                    <Phone className="h-6 w-6" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: colors.text }}>Phone</p>
                    <a href={`tel:${identity.phone}`} className="hover:underline" style={{ color: colors.text }}>
                      {identity.phone}
                    </a>
                  </div>
                </div>
              )}
              {identity.fullAddress && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
                    <MapPinned className="h-6 w-6" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: colors.text }}>Address</p>
                    <p style={{ color: colors.text }}>{identity.fullAddress}</p>
                  </div>
                </div>
              )}
              {identity.googleMapsLink && (
                <a
                  href={identity.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium hover:underline"
                  style={{ color: colors.primary }}
                >
                  View on Google Maps →
                </a>
              )}
            </div>

            {/* Contact Form */}
            <div className="p-8 rounded-3xl border bg-white shadow-lg">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: `${colors.primary}30`, "--tw-ring-color": colors.primary } as any}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: `${colors.primary}30`, "--tw-ring-color": colors.primary } as any}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ borderColor: `${colors.primary}30`, "--tw-ring-color": colors.primary } as any}
                    placeholder="Your message..."
                  />
                </div>
                <Button
                  className="w-full py-6 text-lg font-semibold rounded-full transition-all hover:scale-105"
                  style={{ backgroundColor: colors.primary, color: "#ffffff" }}
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer
        className="py-16 px-4"
        style={{ backgroundColor: colors.text, color: "#ffffff" }}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
            style={{
              gridTemplateColumns: footer.columns === 2 ? "repeat(2, 1fr)" : footer.columns === 3 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
            }}
          >
            {/* Column 1: Brand */}
            <div>
              {headerLogoUrl && (
                <img
                  src={headerLogoUrl}
                  alt={resortName}
                  style={{ height: Math.min(headerLogoSize, 60), filter: "brightness(0) invert(1)" }}
                  className="mb-6 object-contain"
                />
              )}
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: typography.headingFont }}>
                {resortName}
              </h3>
              <p className="text-sm opacity-70">{brandStory.tagline || ""}</p>
            </div>

            {/* Column 2: Contact */}
            {footer.showContactInfo && (
              <div>
                <h4 className="font-semibold mb-6">Contact</h4>
                <div className="space-y-3 text-sm opacity-70">
                  {identity.contactEmail && <p>{identity.contactEmail}</p>}
                  {identity.phone && <p>{identity.phone}</p>}
                  {identity.fullAddress && <p>{identity.fullAddress}</p>}
                </div>
              </div>
            )}

            {/* Column 3: Navigation */}
            {footer.showNavigation && (
              <div>
                <h4 className="font-semibold mb-6">Quick Links</h4>
                <div className="space-y-3 text-sm opacity-70">
                  {header.navigationLinks?.map((link: any, i: number) => (
                    <a key={i} href={link.url} className="block hover:opacity-100 transition-opacity">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Column 4: Social */}
            {footer.showSocialIcons && socialLinks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-6">Follow Us</h4>
                <div className="flex gap-4">
                  {socialLinks.map((social, i) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={i}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-white/10 text-center text-sm opacity-50">
            <p>{footer.copyrightText || `© ${new Date().getFullYear()} ${resortName}. All rights reserved.`}</p>
          </div>
        </div>
      </footer>

      {/* ========== EDIT BUTTON (Floating) ========== */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/wizard?edit=${id}`)}
          className="shadow-lg rounded-full px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      {/* ========== CUSTOM ANIMATIONS ========== */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
}
