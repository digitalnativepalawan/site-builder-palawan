import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, ArrowLeft, Phone, Mail, 
  Smartphone, Tablet, Monitor 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ResortLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState<any>(null);
  const [deviceView, setDeviceView] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
      const { data } = await supabase.from("resort_submissions").select("*").eq("id", id).single();
      if (data) setSiteData(data.data);
      setLoading(false);
    };
    fetchSite();
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const { identity = {}, brandStory = {}, media = {}, colorPalette: colors = {}, typography = {} } = siteData || {};
  const heroImage = media.heroImage || media.heroImages?.[0];

  const WebsiteContent = () => (
    <div className="w-full flex flex-col overflow-x-hidden scroll-smooth" style={{ backgroundColor: colors.background, color: colors.text, fontFamily: typography.bodyFont }}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <span className="font-bold text-lg">{identity.resortName}</span>
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="#rooms">Rooms</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[400px] flex items-center justify-center text-center p-6"
        style={{ background: heroImage ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url(${heroImage}) center/cover` : colors.gradient }}>
        <div className="max-w-2xl text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{identity.resortName}</h1>
          <p className="text-base md:text-lg mb-6 opacity-90">{brandStory.tagline}</p>
          <Button style={{ backgroundColor: colors.accent }}>Book Now</Button>
        </div>
      </section>

      {/* AMENITIES - STACKING FIX */}
      <section className="py-12 px-4 bg-white">
        <h2 className="text-2xl font-bold text-center mb-8">Amenities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-6xl mx-auto">
          {siteData.amenities?.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-lg border bg-slate-50">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors.primary }} />
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ROOMS - STACKING FIX */}
      <section id="rooms" className="py-12 px-4 bg-slate-50">
        <h2 className="text-2xl font-bold text-center mb-8">Our Rooms</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {siteData.roomTypes?.map((room: any, i: number) => (
            <div key={i} className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
              <div className="aspect-video bg-slate-200">
                {room.imageUrl && <img src={room.imageUrl} className="w-full h-full object-cover" />}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-1">{room.name}</h3>
                <p className="text-blue-600 font-bold mb-4">₱{room.price?.toLocaleString()}</p>
                <Button className="mt-auto w-full" style={{ backgroundColor: colors.primary }}>Details</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT - STACKING FIX */}
      <section id="contact" className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold">Contact Us</h2>
            <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-blue-500" /> <span>{identity.phone}</span></div>
            <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-500" /> <span className="break-all">{identity.contactEmail}</span></div>
          </div>
          <div className="flex-1 space-y-3 bg-slate-50 p-6 rounded-xl border">
            <input className="w-full p-3 border rounded-lg" placeholder="Name" />
            <textarea className="w-full p-3 border rounded-lg h-24" placeholder="Message" />
            <Button className="w-full" style={{ backgroundColor: colors.primary }}>Send</Button>
          </div>
        </div>
      </section>

      <footer className="py-6 bg-slate-900 text-white text-center text-xs opacity-50">
        © {new Date().getFullYear()} {identity.resortName}
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between sticky top-0 z-[100]">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <div className="flex bg-slate-100 p-1 rounded-md">
          <Button variant={deviceView === "mobile" ? "secondary" : "ghost"} size="sm" onClick={() => setDeviceView("mobile")}><Smartphone className="h-4 w-4" /></Button>
          <Button variant={deviceView === "tablet" ? "secondary" : "ghost"} size="sm" onClick={() => setDeviceView("tablet")}><Tablet className="h-4 w-4" /></Button>
          <Button variant={deviceView === "desktop" ? "secondary" : "ghost"} size="sm" onClick={() => setDeviceView("desktop")}><Monitor className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showDeviceFrame} onCheckedChange={setShowDeviceFrame} />
          <Label className="text-[10px] uppercase font-bold text-slate-500">Frame</Label>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-start p-4 md:p-10 overflow-auto">
        <div className={`transition-all duration-300 bg-white shadow-2xl ${showDeviceFrame && deviceView !== "desktop" ? "rounded-[2.5rem] border-[8px] border-slate-900" : ""}`}
          style={{ width: deviceView === "mobile" ? "375px" : deviceView === "tablet" ? "768px" : "100%", height: deviceView === "desktop" ? "auto" : "667px", overflowY: "auto" }}>
          <WebsiteContent />
        </div>
      </div>
    </div>
  );
}
