import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResortLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState<any>(null);

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
        console.error("Error fetching resort:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400 font-medium">Loading your paradise...</p>
      </div>
    );
  }

  // Fallback defaults if data is missing
  const { 
    identity = {}, 
    brandStory = {}, 
    media = {}, 
    colorPalette: colors = {
      primary: "#0EA5E9",
      background: "#FFFFFF",
      text: "#1E293B",
      accent: "#F59E0B",
      gradient: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
    },
    typography = {
      headingFont: "'Space Grotesk', sans-serif",
      bodyFont: "'Inter', sans-serif",
    }
  } = siteData || {};

  const resortName = identity.resortName || "Resort Name";
  const heroImage = media.heroImage || media.heroImages?.[0];

  return (
    <div 
      className="min-h-screen w-full flex flex-col overflow-x-hidden scroll-smooth" 
      style={{ 
        backgroundColor: colors.background, 
        color: colors.text, 
        fontFamily: typography.bodyFont 
      }}
    >
      {/* Google Fonts Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* DASHBOARD NAVIGATION */}
      <div className="fixed top-6 left-6 z-[100]">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => navigate("/dashboard")}
          className="bg-white/90 backdrop-blur-sm shadow-xl border-none hover:bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit to Dashboard
        </Button>
      </div>

      {/* HEADER */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <span className="font-bold text-2xl tracking-tight" style={{ fontFamily: typography.headingFont }}>
            {resortName}
          </span>
          <nav className="hidden md:flex gap-10 text-sm font-bold uppercase tracking-widest">
            <a href="#rooms" className="hover:text-blue-500 transition-colors">Accommodations</a>
            <a href="#contact" className="hover:text-blue-500 transition-colors">Inquiries</a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center text-center px-6"
        style={{ 
          background: heroImage ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${heroImage}) center/cover no-repeat fixed` : colors.gradient 
        }}
      >
        <div className="max-w-4xl text-white">
          <h1 className="text-5xl md:text-8xl font-extrabold mb-6 leading-tight" style={{ fontFamily: typography.headingFont }}>
            {resortName}
          </h1>
          <p className="text-xl md:text-3xl mb-10 opacity-90 font-light max-w-2xl mx-auto">
            {brandStory.tagline}
          </p>
          <Button 
            size="lg" 
            style={{ backgroundColor: colors.accent }}
            className="rounded-full px-10 py-8 text-xl font-bold shadow-2xl hover:scale-105 transition-transform"
          >
            Check Availability
          </Button>
        </div>
      </section>

      {/* AMENITIES SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: typography.headingFont }}>
            World-Class Amenities
          </h2>
          <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: colors.primary }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {siteData.amenities?.map((item: string, i: number) => (
            <div key={i} className="group flex flex-col items-center text-center gap-6 p-10 rounded-3xl border border-slate-100 bg-white hover:shadow-2xl transition-all duration-300">
              <div className="w-4 h-4 rounded-full group-hover:scale-150 transition-transform" style={{ backgroundColor: colors.primary }} />
              <span className="font-bold text-lg text-slate-800">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ROOMS SECTION */}
      <section id="rooms" className="py-24 px-6 bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: typography.headingFont }}>
              Luxury Living
            </h2>
            <p className="text-slate-500 text-lg">Choose your perfect escape</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {siteData.roomTypes?.map((room: any, i: number) => (
              <div key={i} className="bg-white rounded-[2rem] border-none shadow-xl overflow-hidden flex flex-col group">
                <div className="aspect-[4/3] overflow-hidden bg-slate-200 relative">
                  {room.imageUrl && (
                    <img 
                      src={room.imageUrl} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-black text-lg" style={{ color: colors.primary }}>
                    ₱{room.price?.toLocaleString()}
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="font-bold text-3xl mb-4 text-slate-900">{room.name}</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">Experience ultimate comfort with our premium {room.name.toLowerCase()} suites designed for relaxation.</p>
                  <Button className="mt-auto w-full py-7 rounded-2xl font-black text-lg shadow-lg" style={{ backgroundColor: colors.primary }}>
                    Book Room
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-32 px-6 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-[3rem] border shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 p-12 md:p-20 bg-slate-900 text-white space-y-10">
            <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: typography.headingFont }}>Let's Connect</h2>
            <p className="text-slate-400 text-xl">Planning a group event or a romantic getaway? Our team is here to help you curate the perfect experience.</p>
            <div className="space-y-8 pt-6">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-white/10 text-white"><Phone size={28} /></div>
                <span className="text-2xl font-light">{identity.phone}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-white/10 text-white"><Mail size={28} /></div>
                <span className="text-2xl font-light break-all">{identity.contactEmail}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-12 md:p-20 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <input className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Full Name" />
              <input className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Email Address" />
              <textarea className="w-full p-5 bg-slate-50 border-none rounded-2xl h-40 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Your Message..." />
              <Button className="w-full py-8 rounded-2xl text-xl font-black shadow-xl" style={{ backgroundColor: colors.primary }}>
                Send Inquiry
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 bg-white border-t text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-lg font-medium text-slate-900 mb-2">{resortName}</p>
          <p className="text-sm">© {new Date().getFullYear()} Palawan Collective Hospitality Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
