import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ExternalLink, Facebook, Instagram, Youtube, Wifi, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverSection, TextSection, BulletListSection, PricingSection, FaqSection, ImageGallerySection, ContactFormSection, YoutubeSection } from "@/components/preview/SectionRenderers";

export default function ResortLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    console.log("=== PREVIEW PAGE DEBUG ===");
    console.log("Site ID:", id);
    
    if (!id) {
      setError("No site ID provided");
      setLoading(false);
      return;
    }

    const fetchSite = async () => {
      try {
        // Fetch from resort_submissions table
        const { data: submission, error: submissionError } = await supabase
          .from("resort_submissions")
          .select("*")
          .eq("id", id)
          .single();

        if (submissionError) {
          console.error("Submission fetch error:", submissionError);
          throw new Error(submissionError.message);
        }

        if (!submission || !submission.data) {
          throw new Error("Resort not found");
        }

        console.log("Resort data loaded:", submission.data);
        setSiteData(submission.data);
      } catch (err: any) {
        console.error("=== CATCH ERROR ===");
        console.error(err);
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading resort preview...</p>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Resort</h1>
        <p className="text-muted-foreground max-w-md text-center">{error || "Resort not found"}</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Extract data from the new structure
  const identity = siteData.identity || {};
  const brandStory = siteData.brandStory || {};
  const socialMedia = siteData.socialMedia || {};
  const header = siteData.header || {};
  const footer = siteData.footer || {};
  const hero = siteData.hero || {};
  const media = siteData.media || {};
  const colorPalette = siteData.colorPalette || {
    primary: "#0EA5E9",
    background: "#ffffff",
    text: "#1e293b",
    accent: "#f59e0b",
  };

  const resortName = identity.resortName || "Resort";
  
  // Determine which logo to use in header
  const headerLogoUrl = header.showLogo ? header.logoUrl : null;
  const headerLogoSize = header.logoSize || 120;
  
  // Determine which logo to use in hero
  const heroLogoUrl = hero.showLogo 
    ? (hero.useSameAsHeader ? header.logoUrl : hero.heroLogoUrl)
    : null;
  const heroLogoSize = hero.heroLogoSize || 200;

  const style = {
    bg: colorPalette.background || "#ffffff",
    text: colorPalette.text || "#1e293b",
    primary: colorPalette.primary || "#0EA5E9",
    accent: colorPalette.accent || "#f59e0b",
  };

  // Social media links array
  const socialLinks = [
    { platform: "facebook", url: socialMedia.facebook, icon: Facebook },
    { platform: "instagram", url: socialMedia.instagram, icon: Instagram },
    { platform: "tiktok", url: socialMedia.tiktok, icon: null }, // No icon in lucide
    { platform: "youtube", url: socialMedia.youtube, icon: Youtube },
    { platform: "whatsapp", url: socialMedia.whatsapp, icon: Phone },
  ].filter(s => s.url);

  return (
    <div className="min-h-screen" style={{ backgroundColor: style.bg, color: style.text }}>
      
      {/* ========== HEADER ========== */}
      <header
        className={`sticky top-0 z-50 border-b transition-all ${
          header.transparent ? "bg-transparent absolute w-full" : "bg-white/95 backdrop-blur-md"
        } ${header.sticky ? "" : "relative"}`}
        style={{
          backgroundColor: header.transparent ? "transparent" : style.bg,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            {headerLogoUrl ? (
              <img
                src={headerLogoUrl}
                alt={resortName}
                style={{ height: headerLogoSize }}
                className="object-contain"
              />
            ) : (
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: style.text }}>
                {resortName}
              </h1>
            )}

            {/* Navigation */}
            {header.showNavigation && (
              <nav className="hidden md:flex items-center gap-6">
                {header.navigationLinks?.map((link: any, i: number) => (
                  <a
                    key={i}
                    href={link.url}
                    className="text-sm font-medium hover:opacity-70 transition-opacity"
                    style={{ color: style.text }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            {/* Social Icons in Header */}
            {socialMedia.showInHeader && socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: style.text }}
                    >
                      {Icon ? <Icon className="h-5 w-5" /> : social.platform}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section
        id="home"
        className="relative min-h-[80vh] flex items-center justify-center"
        style={{
          background: media.heroImages?.[0]
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${media.heroImages[0]})`
            : `linear-gradient(135deg, ${style.primary} 0%, ${style.accent} 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center px-4 py-20">
          
          {/* Hero Logo */}
          {heroLogoUrl && (
            <div className="mb-8">
              <img
                src={heroLogoUrl}
                alt={resortName}
                style={{ height: heroLogoSize, maxWidth: "100%" }}
                className="mx-auto object-contain"
              />
            </div>
          )}

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6"
            style={{ color: "#ffffff" }}
          >
            {resortName}
          </h1>
          
          {brandStory.tagline && (
            <p
              className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-2xl mx-auto"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              {brandStory.tagline}
            </p>
          )}

          {brandStory.shortDescription && (
            <p
              className="text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {brandStory.shortDescription}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="px-8 py-6 text-lg"
              style={{ backgroundColor: style.accent, color: "#ffffff" }}
              onClick={() => window.location.href = `mailto:${identity.contactEmail || ""}`}
            >
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg"
              style={{ borderColor: "#ffffff", color: "#ffffff" }}
              onClick={() => {
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* ========== ABOUT SECTION ========== */}
      {brandStory.fullDescription && (
        <section id="about" className="py-16 sm:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-6"
              style={{ color: style.text }}
            >
              About Us
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: style.text }}
            >
              {brandStory.fullDescription}
            </p>
          </div>
        </section>
      )}

      {/* ========== AMENITIES SECTION ========== */}
      {siteData.amenities?.length > 0 && (
        <section id="amenities" className="py-16 sm:py-24 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-12"
              style={{ color: style.text }}
            >
              Amenities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {siteData.amenities.map((amenity: string, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: style.primary }}
                    />
                    <span className="font-medium" style={{ color: style.text }}>
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
        <section id="rooms" className="py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-12"
              style={{ color: style.text }}
            >
              Our Rooms
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {siteData.roomTypes.map((room: any, i: number) => (
                <div
                  key={i}
                  className="rounded-lg border bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div
                    className="h-48 bg-muted/30 flex items-center justify-center"
                    style={{ backgroundColor: style.primary + "20" }}
                  >
                    <span className="text-4xl">🏨</span>
                  </div>
                  <div className="p-6">
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ color: style.text }}
                    >
                      {room.name || "Room"}
                    </h3>
                    <p
                      className="text-2xl font-bold mb-4"
                      style={{ color: style.primary }}
                    >
                      ₱{room.price || "0"}
                      <span className="text-sm font-normal text-muted-foreground">/night</span>
                    </p>
                    <p
                      className="text-sm mb-4"
                      style={{ color: style.text }}
                    >
                      {room.description || ""}
                    </p>
                    <Button
                      className="w-full"
                      style={{ backgroundColor: style.primary, color: "#ffffff" }}
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
        <section id="faq" className="py-16 sm:py-24 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-12"
              style={{ color: style.text }}
            >
              FAQ
            </h2>
            <div className="space-y-4">
              {siteData.faq.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-lg border bg-white"
                >
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: style.text }}
                  >
                    {item.question}
                  </h3>
                  <p
                    className="text-muted-foreground"
                    style={{ color: style.text }}
                  >
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== CONTACT SECTION ========== */}
      <section id="contact" className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
            style={{ color: style.text }}
          >
            Contact Us
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              {identity.contactEmail && (
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6" style={{ color: style.primary }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: style.text }}>Email</p>
                    <a
                      href={`mailto:${identity.contactEmail}`}
                      className="hover:underline"
                      style={{ color: style.text }}
                    >
                      {identity.contactEmail}
                    </a>
                  </div>
                </div>
              )}
              {identity.phone && (
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6" style={{ color: style.primary }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: style.text }}>Phone</p>
                    <a
                      href={`tel:${identity.phone}`}
                      className="hover:underline"
                      style={{ color: style.text }}
                    >
                      {identity.phone}
                    </a>
                  </div>
                </div>
              )}
              {identity.fullAddress && (
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6" style={{ color: style.primary }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: style.text }}>Address</p>
                    <p style={{ color: style.text }}>{identity.fullAddress}</p>
                  </div>
                </div>
              )}
              {identity.googleMapsLink && (
                <a
                  href={identity.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:underline"
                  style={{ color: style.primary }}
                >
                  View on Google Maps →
                </a>
              )}
            </div>

            {/* Contact Form */}
            <div className="p-6 rounded-lg border bg-white shadow-sm">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: style.text }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: style.primary, "--tw-ring-color": style.primary } as any}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: style.text }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: style.primary, "--tw-ring-color": style.primary } as any}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: style.text }}>
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                    style={{ borderColor: style.primary, "--tw-ring-color": style.primary } as any}
                    placeholder="Your message..."
                  />
                </div>
                <Button
                  className="w-full py-6"
                  style={{ backgroundColor: style.primary, color: "#ffffff" }}
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
        className="py-12 px-4 border-t"
        style={{ backgroundColor: style.text, color: "#ffffff" }}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8"
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
                  className="mb-4 object-contain"
                />
              )}
              <h3 className="text-lg font-bold mb-2">{resortName}</h3>
              <p className="text-sm opacity-80">{brandStory.tagline || ""}</p>
            </div>

            {/* Column 2: Contact */}
            {footer.showContactInfo && (
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <div className="space-y-2 text-sm opacity-80">
                  {identity.contactEmail && (
                    <p>{identity.contactEmail}</p>
                  )}
                  {identity.phone && (
                    <p>{identity.phone}</p>
                  )}
                  {identity.fullAddress && (
                    <p>{identity.fullAddress}</p>
                  )}
                </div>
              </div>
            )}

            {/* Column 3: Navigation */}
            {footer.showNavigation && (
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="space-y-2 text-sm opacity-80">
                  {header.navigationLinks?.map((link: any, i: number) => (
                    <a
                      key={i}
                      href={link.url}
                      className="block hover:underline"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Column 4: Social */}
            {footer.showSocialIcons && socialLinks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {socialLinks.map((social, i) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={i}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-70 transition-opacity"
                      >
                        {Icon ? <Icon className="h-5 w-5" /> : social.platform}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t text-center text-sm opacity-60">
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
          className="shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>
    </div>
  );
}
