import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ExternalLink, Facebook, Instagram, Youtube, Phone, Mail, MapPinned, Star, Quote, Zap, CheckCircle2, Play, Smartphone, Tablet, Monitor, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ResortLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any>(null);
  
  const [deviceView, setDeviceView] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [mobileRotation, setMobileRotation] = useState<"portrait" | "landscape">("portrait");

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

  const identity = siteData.identity || {};
  const brandStory = siteData.brandStory || {};
  const socialMedia = siteData.socialMedia || {};
  const header = siteData.header || {};
  const footer = siteData.footer || {};
  const hero = siteData.hero || {};
  const media = siteData.media || {};
  const testimonials = siteData.testimonials || [];
  const features = siteData.features || [];
  
  const colors = siteData.colorPalette || {
    primary: "#0EA5E9",
    background: "#FFFFFF",
    text: "#1E293B",
    accent: "#F59E0B",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
  };

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
  const heroImage = media.heroImage || media.heroImages?.[0];

  const socialLinks = [
    { platform: "facebook", url: socialMedia.facebook, icon: Facebook },
    { platform: "instagram", url: socialMedia.instagram, icon: Instagram },
    { platform: "youtube", url: socialMedia.youtube, icon: Youtube },
  ].filter(s => s.url);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };
  const videoId = media.videoUrl ? getYouTubeId(media.videoUrl) : null;

  const deviceWidths = {
    mobile: mobileRotation === "portrait" ? 375 : 667,
    tablet: 768,
    desktop: 1920,
  };

  const currentWidth = deviceWidths[deviceView];

  const WebsiteContent = () => {
    const isMobilePreview = deviceView === "mobile";
    const isTabletPreview = deviceView === "tablet";
    const isSmallPreview = isMobilePreview || isTabletPreview;

    return (
      <div
        className="min-h-screen w-full"
        style={{
          backgroundColor: colors.background,
          color: colors.text,
          fontFamily: typography.bodyFont,
          overflowX: "hidden",
          width: "100%",
          maxWidth: "100vw"
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@300;400;600&family=DM+Sans:wght@400;500;700&display=swap');
          
          * { box-sizing: border-box; }
          img { max-width: 100%; height: auto; display: block; }
          input, textarea, button { max-width: 100%; }
          h1, h2, h3, p, span, a, div { overflow-wrap: break-word; word-wrap: break-word; }
        `}</style>

        {/* HEADER */}
        <header
          className={`sticky top-0 z-50 transition-all duration-300 w-full ${
            header.transparent ? "absolute w-full bg-transparent" : "bg-white/95 backdrop-blur-md shadow-sm"
          } ${header.sticky ? "" : "relative"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex justify-between items-center h-16 sm:h-20">
              {headerLogoUrl ? (
                <img src={headerLogoUrl} alt={resortName} style={{ height: Math.min(headerLogoSize, 60) }} className="object-contain" />
              ) : (
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ fontFamily: typography.headingFont, color: header.transparent ? "#ffffff" : colors.text }}>
                  {resortName}
                </h1>
              )}
              
              <nav className={`${isSmallPreview ? "hidden" : "hidden md:flex"} items-center gap-6 lg:gap-8`}>
                {header.navigationLinks?.map((link: any, i: number) => (
                  <a
                    key={i}
                    href={link.url}
                    className="text-sm font-medium transition-colors hover:opacity-70"
                    style={{ fontFamily: typography.bodyFont, color: header.transparent ? "#ffffff" : colors.text }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {socialMedia.showInHeader && socialLinks.length > 0 && (
                <div className={`${isSmallPreview ? "hidden" : "hidden md:flex"} items-center gap-3`}>
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
                        <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                      </a>
                    );
                  })}
                </div>
              )}

              <button className="md:hidden p-2">
                <svg className="w-6 h-6" fill="none" stroke={header.transparent ? "#ffffff" : colors.text} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section
          id="home"
          className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden w-full"
          style={{
            background: heroImage
              ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${heroImage})`
              : colors.gradient || colors.primary,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          
          <div className="relative z-10 text-center px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-5xl mx-auto w-full">
            {heroLogoUrl && (
              <div className="mb-4 sm:mb-6 md:mb-8">
                <img
                  src={heroLogoUrl}
                  alt={resortName}
                  style={{ height: Math.min(heroLogoSize, 100), maxWidth: "100%" }}
                  className="mx-auto object-contain"
                />
              </div>
            )}

            <h1
              className={`${isMobilePreview ? "text-3xl leading-tight" : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"} font-bold mb-3 sm:mb-4 md:mb-6`}
              style={{
                fontFamily: typography.headingFont,
                color: "#ffffff",
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              {resortName}
            </h1>

            {brandStory.tagline && (
              <p
                className={`${isMobilePreview ? "text-sm font-medium tracking-wide uppercase opacity-90" : "text-base sm:text-lg md:text-xl lg:text-2xl"} mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto px-2`}
                style={{ color: "rgba(255,255,255,0.9)", fontFamily: typography.headingFont }}
              >
                {brandStory.tagline}
              </p>
            )}

            {brandStory.shortDescription && (
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10 px-2 text-white/90"
                style={{ lineHeight: 1.6 }}
              >
                {brandStory.shortDescription}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ backgroundColor: colors.accent, color: "#ffffff" }}
                onClick={() => window.location.href = `mailto:${identity.contactEmail || ""}`}
              >
                Book Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-full border-2 bg-transparent hover:bg-white/10 transition-all duration-200"
                style={{ borderColor: "#ffffff", color: "#ffffff" }}
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        {brandStory.fullDescription && (
          <section id="about" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 w-full">
            <div className="max-w-4xl mx-auto text-center w-full">
              <h2
                className={`${isMobilePreview ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"} font-bold mb-4 sm:mb-6 md:mb-8`}
                style={{ fontFamily: typography.headingFont, color: colors.text }}
              >
                About Us
              </h2>
              <div className="w-16 sm:w-20 md:w-24 h-1 mx-auto mb-6 sm:mb-8 rounded-full" style={{ backgroundColor: colors.primary }} />
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed px-2 sm:px-0"
                style={{ color: colors.text, lineHeight: 1.8, fontFamily: typography.bodyFont }}
              >
                {brandStory.fullDescription}
              </p>
            </div>
          </section>
        )}

        {/* FEATURES */}
        {features.length > 0 && (
          <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 w-full" style={{ backgroundColor: `${colors.primary}08` }}>
            <div className="max-w-6xl mx-auto w-full">
              <h2
                className={`${isMobilePreview ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"} font-bold text-center mb-3 sm:mb-4`}
                style={{ fontFamily: typography.headingFont, color: colors.text }}
              >
                Why Choose Us
              </h2>
              <p className="text-center text-muted-foreground mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base">What makes our resort special</p>
              
              <div className={isMobilePreview ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full"}>
                {features.map((feature: any, i: number) => (
                  <div
                    key={i}
                    className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border shadow-sm hover:shadow-xl transition-all duration-300 w-full"
                  >
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6">{feature.icon || "✨"}</div>
                    <h3
                      className={`${isMobilePreview ? "text-xl" : "text-xl sm:text-2xl"} font-bold mb-2 sm:mb-3`}
                      style={{ fontFamily: typography.headingFont, color: colors.text }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground" style={{ lineHeight: 1.6 }}>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* AMENITIES */}
        {siteData.amenities?.length > 0 && (
          <section id="amenities" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 w-full" style={{ backgroundColor: colors.background }}>
            <div className="max-w-6xl mx-auto w-full">
              <h2
                className={`${isMobilePreview ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"} font-bold text-center mb-3 sm:mb-4`}
                style={{ fontFamily: typography.headingFont, color: colors.text }}
              >
                Amenities
              </h2>
              <p className="text-center text-muted-foreground mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base">Everything you need for a perfect stay</p>
              
              <div className={isMobilePreview ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full"}>
                {siteData.amenities.map((amenity: string, i: number) => (
                  <div
                    key={i}
                    className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 w-full"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-transform group-hover:scale-125"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <span className="text-xs sm:text-sm font-medium break-words" style={{ color: colors.text }}>
                        {amenity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ROOMS */}
        {siteData.roomTypes?.length > 0 && (
          <section id="rooms" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 w-full" style={{ backgroundColor: colors.background }}>
            <div className="max-w-6xl mx-auto w-full">
              <h2
                className={`${isMobilePreview ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"} font-bold text-center mb-3 sm:mb-4`}
                style={{ fontFamily: typography.headingFont, color: colors.text }}
              >
                Our Rooms
              </h2>
              <p className="text-center text-muted-foreground mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base">Choose your perfect accommodation</p>
              
              <div className={isMobilePreview ? "grid grid-cols-1 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full"}>
                {siteData.roomTypes.map((room: any, i: number) => (
                  <div
                    key={i}
                    className="group rounded-2xl sm:rounded-3xl border bg-white shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden w-full"
                  >
                    {room.imageUrl ? (
                      <div className="h-48 sm:h-56 overflow-hidden w-full">
                        <img
                          src={room.imageUrl}
                          alt={room.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-48 sm:h-56 flex items-center justify-center w-full"
                        style={{ background: `${colors.primary}15` }}
                      >
                        <span className="text-4xl sm:text-5xl md:text-6xl">🏨</span>
                      </div>
                    )}
                    <div className="p-4 sm:p-6 md:p-8 w-full">
                      <h3
                        className={`${isMobilePreview ? "text-xl" : "text-xl sm:text-2xl"} font-bold mb-2 sm:mb-3`}
                        style={{ fontFamily: typography.headingFont, color: colors.text }}
                      >
                        {room.name || "Room"}
                      </h3>
                      <div className="flex items-baseline gap-1 mb-3 sm:mb-4">
                        <span className="text-2xl sm:text-3xl font-bold" style={{ color: colors.primary }}>
                          ₱{room.price || "0"}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">/night</span>
                      </div>
                      <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: colors.text, lineHeight: 1.6 }}>
                        {room.description || ""}
                      </p>
                      <Button
                        className="w-full py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-full shadow-sm hover:shadow-md"
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

        {/* GALLERY */}
        {media.galleryImages?.length > 0 && (
          <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 w-full" style={{ backgroundColor: `${colors.primary}08` }}>
            <div className="max-w-6xl mx-auto w-full">
              <h2
                className={`${isMobilePreview ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"} font-bold text-center mb-3 sm:mb-4`}
                style={{ fontFamily: typography.headingFont, color: colors.text }}
              >
                Photo Gallery
              </h2>
              <p className="text-center text-muted-foreground mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base">Explore our resort</p>
              
              <div className={isMobilePreview ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full"}>
                {media.galleryImages.map((url: string, i: number) => (
                  <div
                    key={i}
                    className="group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-full"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* VIDEO */}
        {videoId && (
          <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 w-full" style={{ backgroundColor: colors.background }}>
            <div className="max-w-5xl mx-auto w-full">
              <h2
                className={`${isMobilePreview ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"} font-bold text-center mb-3 sm:mb-4`}
                style={{ fontFamily: typography.headingFont, color: colors.text }}
              >
                Video Tour
              </h2>
              <p className="text-center text-muted-foreground mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base">Take a virtual tour of our resort</p>
              <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                  title="Resort Video Tour"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        {testimonials.length > 0 && (
          <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 w-full" style={{ backgroundColor: `${colors.primary}08` }}>
            <div className="max-w-6xl mx-auto w-full">
              <h2
                className={`${isMobilePreview ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"} font-bold text-center mb-3 sm:mb-4`}
                style={{ fontFamily: typography.headingFont, color: colors.text }}
              >
                Guest Reviews
              </h2>
              <p className="text-center text-muted-foreground mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base">What our guests say about us</p>
              
              <div className={isMobilePreview ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full"}>
                {testimonials.map((testimonial: any, i: number) => (
                  <div
                    key={i}
                    className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border shadow-sm hover:shadow-xl transition-all duration-300 w-full"
                  >
                    <div className="flex gap-1 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          style={{
                            fill: j < (testimonial.rating || 5) ? colors.accent : "none",
                            color: j < (testimonial.rating || 5) ? colors.accent : "#d1d5db",
                          }}
                        />
                      ))}
                    </div>
                    <Quote className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{ color: colors.primary, opacity: 0.3 }} />
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6" style={{ lineHeight: 1.6, fontStyle: "italic" }}>
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {testimonial.name?.charAt(0) || "G"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base" style={{ color: colors.text }}>{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {siteData.faq?.length > 0 && (
          <section id="faq" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 w-full" style={{ backgroundColor: colors.background }}>
            <div className="max-w-4xl mx-auto w-full">
              <h2
                className={`${isMobilePreview ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"} font-bold text-center mb-3 sm:mb-4`}
                style={{ fontFamily: typography.headingFont, color: colors.text }}
              >
                FAQ
              </h2>
              <p className="text-center text-muted-foreground mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base">Common questions answered</p>
              <div className="space-y-3 sm:space-y-4 w-full">
                {siteData.faq.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow w-full"
                  >
                    <h3
                      className={`${isMobilePreview ? "text-lg" : "text-lg sm:text-xl"} font-semibold mb-2 sm:mb-3 flex items-start gap-2 sm:gap-3`}
                      style={{ fontFamily: typography.headingFont, color: colors.text }}
                    >
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} />
                      {item.question}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground" style={{ lineHeight: 1.6 }}>{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CONTACT */}
        <section id="contact" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 w-full" style={{ backgroundColor: colors.background }}>
          <div className="max-w-6xl mx-auto w-full">
            <h2
              className={`${isMobilePreview ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"} font-bold text-center mb-3 sm:mb-4`}
              style={{ fontFamily: typography.headingFont, color: colors.text }}
            >
              Contact Us
            </h2>
            <p className="text-center text-muted-foreground mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base">We'd love to hear from you</p>
            
            <div className={isMobilePreview ? "flex flex-col gap-8 w-full" : "grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 w-full"}>
              <div className="space-y-6 sm:space-y-8 w-full">
                {identity.contactEmail && (
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
                      <Mail className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: colors.text }}>Email</p>
                      <a href={`mailto:${identity.contactEmail}`} className="text-sm sm:text-base hover:underline break-all" style={{ color: colors.text }}>
                        {identity.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                {identity.phone && (
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
                      <Phone className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: colors.text }}>Phone</p>
                      <a href={`tel:${identity.phone}`} className="text-sm sm:text-base hover:underline" style={{ color: colors.text }}>
                        {identity.phone}
                      </a>
                    </div>
                  </div>
                )}
                {identity.fullAddress && (
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
                      <MapPinned className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: colors.text }}>Address</p>
                      <p className="text-sm sm:text-base" style={{ color: colors.text }}>{identity.fullAddress}</p>
                    </div>
                  </div>
                )}
                {identity.googleMapsLink && (
                  <a
                    href={identity.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm sm:text-base font-medium hover:underline"
                    style={{ color: colors.primary }}
                  >
                    View on Google Maps →
                  </a>
                )}
              </div>

              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border bg-white shadow-lg w-full">
                <form className="space-y-4 sm:space-y-6 w-full">
                  <div className="w-full">
                    <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                      style={{ borderColor: `${colors.primary}30` }}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                      style={{ borderColor: `${colors.primary}30` }}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none text-sm sm:text-base"
                      style={{ borderColor: `${colors.primary}30` }}
                      placeholder="Your message..."
                    />
                  </div>
                  <Button
                    className="w-full py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-full shadow-md hover:shadow-lg"
                    style={{ backgroundColor: colors.primary, color: "#ffffff" }}
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER - UNIFORM GLOBAL STANDARD */}
        <footer
          className="w-full py-12 sm:py-16 px-4 sm:px-6"
          style={{ backgroundColor: colors.text || "#1E293B", color: "#ffffff" }}
        >
          <div className="max-w-7xl mx-auto w-full">
            
            {/* Three Column Grid - Stacks on mobile, side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-10 sm:mb-12">
              
              {/* Column 1: Brand */}
              <div className="text-center sm:text-left">
                {headerLogoUrl ? (
                  <img
                    src={headerLogoUrl}
                    alt={resortName}
                    style={{ height: Math.min(headerLogoSize || 120, 45), filter: "brightness(0) invert(1)" }}
                    className="mb-3 object-contain mx-auto sm:mx-0"
                  />
                ) : (
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: typography.headingFont }}>
                    {resortName}
                  </h3>
                )}
                <p className="text-xs opacity-60">{brandStory.tagline || "paradise found"}</p>
              </div>

              {/* Column 2: Contact */}
              <div className="text-center sm:text-left">
                <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider opacity-70">CONTACT</h4>
                <div className="space-y-2 text-sm opacity-70">
                  {identity.phone && (
                    <p className="hover:opacity-100 transition-opacity">
                      <a href={`tel:${identity.phone}`} className="hover:underline">
                        {identity.phone}
                      </a>
                    </p>
                  )}
                  {identity.contactEmail && (
                    <p className="hover:opacity-100 transition-opacity break-all">
                      <a href={`mailto:${identity.contactEmail}`} className="hover:underline">
                        {identity.contactEmail}
                      </a>
                    </p>
                  )}
                  {!identity.phone && !identity.contactEmail && (
                    <>
                      <p>+63 947 444 5678</p>
                      <p>info@palawancollective.com</p>
                    </>
                  )}
                </div>
              </div>

              {/* Column 3: Quick Links */}
              <div className="text-center sm:text-left">
                <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider opacity-70">QUICK LINKS</h4>
                <div className="space-y-2 text-sm opacity-70">
                  <a href="#home" className="block hover:opacity-100 transition-opacity hover:translate-x-1 duration-200">Home</a>
                  <a href="#about" className="block hover:opacity-100 transition-opacity hover:translate-x-1 duration-200">About</a>
                  <a href="#rooms" className="block hover:opacity-100 transition-opacity hover:translate-x-1 duration-200">Rooms</a>
                  <a href="#contact" className="block hover:opacity-100 transition-opacity hover:translate-x-1 duration-200">Contact</a>
                </div>
              </div>
            </div>

            {/* Bottom Section: Social Icons (if enabled) + Copyright */}
            <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row justify-between items-center gap-4">
              {footer.showSocialIcons && socialLinks.length > 0 && (
                <div className="flex gap-4 order-2 sm:order-1">
                  {socialLinks.map((social, i) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={i}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              )}
              
              <p className="text-xs opacity-50 text-center order-1 sm:order-2">
                {footer.copyrightText || `© ${new Date().getFullYear()} ${resortName}. All rights reserved.`}
              </p>
              
              {/* Spacer for balance on desktop */}
              <div className="hidden sm:block w-24 order-3" />
            </div>
          </div>
        </footer>

        <style>{`
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fade-in-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
          .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
          .animation-delay-200 { animation-delay: 0.2s; }
          .animation-delay-400 { animation-delay: 0.4s; }
          .animation-delay-600 { animation-delay: 0.6s; }
        `}</style>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Device Preview Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={deviceView === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDeviceView("mobile")}
                className="gap-2"
                title="Mobile View (375px)"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Mobile</span>
              </Button>
              <Button
                variant={deviceView === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDeviceView("tablet")}
                className="gap-2"
                title="Tablet View (768px)"
              >
                <Tablet className="w-4 h-4" />
                <span className="hidden sm:inline">Tablet</span>
              </Button>
              <Button
                variant={deviceView === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDeviceView("desktop")}
                className="gap-2"
                title="Desktop View (1920px)"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Desktop</span>
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {deviceView === "mobile" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileRotation(mobileRotation === "portrait" ? "landscape" : "portrait")}
                  className="gap-2"
                  title="Toggle Orientation"
                >
                  <RotateCcw className={`w-4 h-4 transition-transform ${mobileRotation === "landscape" ? "rotate-90" : ""}`} />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Switch checked={showDeviceFrame} onCheckedChange={setShowDeviceFrame} id="frame-toggle" />
                <Label htmlFor="frame-toggle" className="text-sm">Show Frame</Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open(window.location.href, "_blank")} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open New Tab</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="pt-20 pb-8 px-4 min-h-screen flex items-start justify-center">
        <div
          className="transition-all duration-500 ease-in-out overflow-hidden"
          style={{
            width: deviceView === "desktop" ? "100%" : currentWidth,
            maxWidth: deviceView === "desktop" ? "1920px" : currentWidth,
          }}
        >
          {showDeviceFrame && deviceView !== "desktop" && (
            <div
              className="rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-800"
              style={{
                borderRadius: deviceView === "mobile" ? "40px" : "20px",
              }}
            >
              {deviceView === "mobile" && mobileRotation === "portrait" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-[101]" />
              )}
              <WebsiteContent />
            </div>
          )}
          
          {(!showDeviceFrame || deviceView === "desktop") && (
            <WebsiteContent />
          )}
        </div>
      </div>

      {/* Device Info Badge */}
      <div className="fixed bottom-6 left-6 z-[100] bg-white rounded-full shadow-lg px-4 py-2 text-sm font-medium flex items-center gap-2">
        {deviceView === "mobile" && <Smartphone className="w-4 h-4" />}
        {deviceView === "tablet" && <Tablet className="w-4 h-4" />}
        {deviceView === "desktop" && <Monitor className="w-4 h-4" />}
        <span>{deviceView === "mobile" ? `${currentWidth}×${mobileRotation === "portrait" ? "812" : "375"}` : deviceView === "tablet" ? "768×1024" : "1920×1080"}</span>
        {deviceView === "mobile" && mobileRotation === "landscape" && <span>(Landscape)</span>}
      </div>
    </div>
  );
}
