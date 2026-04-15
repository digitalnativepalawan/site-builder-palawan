import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ExternalLink, Facebook, Instagram, Youtube, Phone, Mail, MapPinned, Star, Quote, CheckCircle2, Smartphone, Tablet, Monitor } from "lucide-react";
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
        <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
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

  // Configuration Constants
  const identity = siteData.identity || {};
  const brandStory = siteData.brandStory || {};
  const header = siteData.header || {};
  const hero = siteData.hero || {};
  const media = siteData.media || {};
  
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
  };

  const resortName = identity.resortName || "Resort";
  const headerLogoUrl = header.showLogo ? header.logoUrl : null;
  const heroImage = media.heroImage || media.heroImages?.[0];

  // Logic for the Device Frame Viewport
  const deviceWidths = {
    mobile: mobileRotation === "portrait" ? 375 : 667,
    tablet: 768,
    desktop: 1920,
  };

  // FIXED: currentWidth is now accessible here
  const currentWidth = deviceWidths[deviceView];

  const WebsiteContent = () => (
    <div
      className="min-h-screen w-full flex flex-col overflow-x-hidden"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: typography.bodyFont,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        h1, h2, h3, p, span { word-break: normal; overflow-wrap: break-word; }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          {headerLogoUrl ? (
            <img src={headerLogoUrl} alt={resortName} className="h-10 object-contain" />
          ) : (
            <h1 className="text-xl font-bold" style={{ fontFamily: typography.headingFont }}>{resortName}</h1>
          )}
          <nav className="hidden md:flex gap-6">
            <a href="#home" className="text-sm font-medium">Home</a>
            <a href="#rooms" className="text-sm font-medium">Rooms</a>
            <a href="#contact" className="text-sm font-medium">Contact</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[500px] flex items-center justify-center text-center p-6"
        style={{
          background: heroImage ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${heroImage})` : colors.gradient,
          backgroundSize: "cover", backgroundPosition: "center"
        }}>
        <div className="max-w-3xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: typography.headingFont }}>{resortName}</h1>
          <p className="text-lg mb-8 opacity-90">{brandStory.tagline}</p>
          <Button size="lg" style={{ backgroundColor: colors.accent }}>Book Your Stay</Button>
        </div>
      </section>

      {/* AMENITIES - GRID FIX */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: typography.headingFont }}>Amenities</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
            {siteData.amenities?.map((amenity: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border bg-slate-50">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors.primary }} />
                <span className="text-sm font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROOMS - RESPONSIVE FIX */}
      <section id="rooms" className="py-16 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: typography.headingFont }}>Our Rooms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteData.roomTypes?.map((room: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border">
                <div className="aspect-video bg-slate-200">
                  {room.imageUrl && <img src={room.imageUrl} className="w-full h-full object-cover" />}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{room.name}</h3>
                  <p className="text-xl font-bold mb-4" style={{ color: colors.primary }}>₱{room.price?.toLocaleString()}</p>
                  <Button className="w-full" style={{ backgroundColor: colors.primary }}>View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT - LAYOUT FIX */}
      <section id="contact" className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold" style={{ fontFamily: typography.headingFont }}>Contact</h2>
            <div className="flex gap-4"><Phone className="shrink-0 text-sky-500" /> <span>{identity.phone}</span></div>
            <div className="flex gap-4"><Mail className="shrink-0 text-sky-500" /> <span className="break-all">{identity.contactEmail}</span></div>
          </div>
          <div className="flex-1 bg-slate-50 p-6 rounded-2xl border">
            <div className="space-y-4">
              <input className="w-full p-3 border rounded-xl" placeholder="Your Name" />
              <input className="w-full p-3 border rounded-xl" placeholder="Email Address" />
              <textarea className="w-full p-3 border rounded-xl h-32" placeholder="Message" />
              <Button className="w-full py-6" style={{ backgroundColor: colors.primary }}>Send Message</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 bg-slate-900 text-white text-center text-xs opacity-60">
        <p>© {new Date().getFullYear()} {resortName}.</p>
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* TOOLBAR */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between sticky top-0 z-[100]">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <Button variant={deviceView === "mobile" ? "secondary" : "ghost"} size="sm" onClick={() => setDeviceView("mobile")}><Smartphone className="w-4 h-4" /></Button>
          <Button variant={deviceView === "tablet" ? "secondary" : "ghost"} size="sm" onClick={() => setDeviceView("tablet")}><Tablet className="w-4 h-4" /></Button>
          <Button variant={deviceView === "desktop" ? "secondary" : "ghost"} size="sm" onClick={() => setDeviceView("desktop")}><Monitor className="w-4 h-4" /></Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={showDeviceFrame} onCheckedChange={setShowDeviceFrame} id="show-frame" />
            <Label htmlFor="show-frame" className="text-xs">Frame</Label>
          </div>
        </div>
      </div>

      {/* VIEWPORT AREA */}
      <div className="flex-1 flex justify-center items-start overflow-auto p-4 md:p-8">
        <div 
          className={`transition-all duration-500 bg-white shadow-2xl overflow-hidden ${
            showDeviceFrame && deviceView !== "desktop" ? "rounded-[3rem] border-[12px] border-slate-900" : ""
          }`}
          style={{ 
            width: deviceView === "desktop" ? "100%" : `${currentWidth}px`,
            maxWidth: "100%",
            height: deviceView === "desktop" ? "auto" : "812px"
          }}
        >
          <WebsiteContent />
        </div>
      </div>
    </div>
  );
}
