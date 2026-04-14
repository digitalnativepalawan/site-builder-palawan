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
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"_
