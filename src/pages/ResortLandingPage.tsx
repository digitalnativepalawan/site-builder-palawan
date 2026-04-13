import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Heart, ChevronDown, LayoutDashboard, Shield, Phone, Mail,
  Coffee, Snowflake, Droplets, Wifi, Sun, Waves, Anchor, UtensilsCrossed, Plane,
  Star, Leaf, Wine, Car, Tv, MapPin, Clock, ChevronUp, MessageCircle,
  ArrowUp, Globe, Facebook, Instagram,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// ═══ Icon Maps ═══
const AMENITY_ICONS: Record<string, any> = {
  Fiber: Wifi, FiberOptic: Wifi, AC: Snowflake, "Air Conditioning": Snowflake,
  HotWater: Droplets, "Hot Water": Droplets, Breakfast: Coffee,
  TV: Tv, CarPark: Car, Parking: Car, AirportTransfer: Plane, "Airport Transfer": Plane,
  IslandHopping: Anchor, "Island Hopping": Anchor, Diving: Anchor,
  Beachfront: Waves, Beach: Waves, InfinityPool: Waves, Pool: Waves,
  Solar: Sun, "Eco-Solar": Sun, Bar: UtensilsCrossed, Restaurant: UtensilsCrossed,
  "Bar & Restaurant": Coffee, Starlink: Wifi, Wifi: Wifi, "Starlink Wifi": Wifi,
};
const FEATURE_ICONS: Record<string, any> = {
  beachfront: Waves, "island-hopping": Anchor, diving: Anchor,
  starlink: Sun, solar: Leaf, "infinity-pool": Waves,
  "bar-restaurant": Coffee, "airport-transfer": Anchor,
};
const DINING_ICONS: Record<string, any> = {
  breakfast: Coffee, "in-house-restaurant": UtensilsCrossed, "pool-bar": Wine, "room-service": Coffee,
};

// ═══ Helpers ═══
function getNested(data: any, path: string): string {
  try {
    const keys = path.split("."); let val: any = data;
    for (const k of keys) { if (val == null) return ""; val = val[k]; }
    return typeof val === "string" ? val : "";
  } catch { return ""; }
}
function getArr(data: any, path: string): any[] {
  try {
    const keys = path.split("."); let val: any = data;
    for (const k of keys) { if (val == null) return []; val = val[k]; }
    return Array.isArray(val) ? val : [];
  } catch { return []; }
}
function getAmenityIcon(label: string): any {
  if (AMENITY_ICONS[label]) return AMENITY_ICONS[label];
  const lower = label.toLowerCase().replace(/[^a-z]/g, "");
  for (const [k, v] of Object.entries(AMENITY_ICONS)) {
    if (k.toLowerCase().replace(/[^a-z]/g, "") === lower) return v;
  }
  for (const [k, v] of Object.entries(AMENITY_ICONS)) {
    if (k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())) return v;
  }
  return Star;
}

// ═══ YouTube embed helper ═══
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
  return m ? m[1] : null;
}

// ═══ Page ═══
export default function ResortLandingPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const [showScroll, setShowScroll] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => setShowScroll(v < 0.1));
  }, [scrollYProgress]);

  const { data: row, isLoading } = useQuery({
    queryKey: ["resort-submission", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resort_submissions").select("*").eq("id", submissionId!).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Not found");
      return data;
    },
  });

  // ─── Data Mapping: new 13-step JSONB keys (with backward compat) ──
  const d = (row?.data as Record<string, any>) || {};

  // Identity (Step 1) — reads from both `identity` (new) and `basicInfo` (old)
  const identity = { ...d.identity, ...d.basicInfo };
  const resortName = identity.resortName || "Paradise Resort";
  const resortType = identity.resortType || "boutique";
  const resortOwner = identity.resortOwner || "";
  const email = identity.email || "";
  const phone = identity.phone || "";
  const typeLabel = resortType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Brand Story (Step 2)
  const brand = d.brandStory || {};
  const tagline = brand.tagline || "";
  const shortDesc = brand.shortDescription || "";
  const fullDesc = brand.fullDescription || "";
  const mission = brand.missionStatement || "";

  // About Owner (Step 3)
  const owner = d.aboutOwner || {};
  const ownerBio = owner.ownerBio || "";
  const ownerPhotoUrl = owner.ownerPhotoUrl || "";

  // Media (Step 4)
  const media = d.media || {};
  const heroImagesRaw = (media.heroImages as string[] | undefined)?.filter(Boolean) || [];
  const galleryImages = (media.galleryImages as string[] | undefined)?.filter(Boolean) || [];
  const logoUrl = media.logoUrl || "";
  let heroImages = [...heroImagesRaw];
  let allGallery = [...galleryImages];
  if (!heroImages.length && galleryImages.length >= 2) {
    heroImages = [galleryImages[0], galleryImages[1]];
    allGallery = galleryImages.slice(2);
  }

  // Hero Video (Step 5)
  const heroVideo = d.heroVideo || {};
  const videoUrl = heroVideo.videoUrl || "";
  const ytId = youtubeId(videoUrl);
  const videoCaption = heroVideo.videoCaption || "";
  const videoAutoplay = heroVideo.videoAutoplay !== false;

  // Rooms (Step 6)
  const roomsData = d.rooms || {};
  const roomTypes = roomsData.roomTypes || [];

  // Amenities (Step 7)
  const amenities = d.amenity || d.amenities || {};
  const features = Array.isArray(amenities.features) ? amenities.features : [];
  const dining = Array.isArray(amenities.dining) ? amenities.dining : [];
  const rd = amenities.roomDetails || {};
  const totalRooms = rd.totalRooms || 0;
  const roomAmenitiesList = [
    rd.ac ? "Air Conditioning" : "",
    rd.hotWater ? "Hot Water" : "",
    rd.breakfast ? "Breakfast Included" : "",
    rd.starlink ? "Starlink Wifi" : "",
    rd.solarPower ? "Solar Power" : "",
    rd.fiberInternet ? "Fiber Internet" : "",
    rd.wifi && rd.wifi !== "None" ? `${rd.wifi} Internet` : "",
  ].filter(Boolean);
  const allAmenities = [...features, ...dining, ...roomAmenitiesList];

  // Dining & Experiences (Step 8)
  const diningData = d.dining || {};
  const diningOptions = diningData.diningOptions || [];
  const experiences = Array.isArray(diningData.experiences) ? diningData.experiences : [];

  // FAQ (Step 9)
  const faqData = d.faq || {};
  const faqs = faqData.faqs || [];

  // Header & Footer (Step 10)
  const hfData = d.headerFooter || {};
  const footerCopyright = hfData.footerCopyright || "";

  // Contact (Step 11)
  const contactData = d.contact || {};
  const fullAddress = contactData.fullAddress || "";
  const googleMapsLink = contactData.googleMapsLink || "";
  const whatsapp = contactData.whatsapp || "";
  const facebookUrl = contactData.facebook || "";
  const instagramUrl = contactData.instagram || "";
  const tiktokUrl = contactData.tiktok || "";
  const checkInTime = contactData.checkInTime || "";
  const checkOutTime = contactData.checkOutTime || "";

  // Colors (Step 12)
  const cp = d.colorPalette || {};
  const primaryColor = cp.primary || "#B8860B";
  const secondaryColor = cp.secondary || "#1E40AF";
  const bgColor = cp.background || "#FFFFFF";

  // SEO / Publish (Step 13)
  const seoData = d.seo || {};
  const isPublished = seoData.publishImmediately === true;

  // ─── Auto-rotate hero ───
  useEffect(() => {
    if (heroImages.length > 1) {
      const timer = setInterval(() => setCurrentHero((p) => (p + 1) % heroImages.length), 5000);
      return () => clearInterval(timer);
    }
  }, [heroImages.length]);

  // ─── Loading / 404 ───
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-black"><Loader2 className="h-10 w-10 animate-spin text-white/60" /></div>;
  }
  if (!row) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white text-center px-6">
        <div>
          <h1 className="text-6xl font-heading font-bold mb-4">404</h1>
          <p className="text-white/60 mb-8">This resort couldn't be found.</p>
          <button onClick={() => navigate("/")} className="text-amber-500 underline">Return Home</button>
        </div>
      </div>
    );
  }

  // ─── Coming Soon (not published yet) ───
  const hasAnyContent = heroImages.length > 0 || resortName !== "Paradise Resort";

  // ═══ Render ═══
  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* ─── Admin bar (fixed) ─── */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-black/60 backdrop-blur-md text-white/80 hover:text-white px-4 py-2.5 rounded-full text-xs font-semibold transition-all hover:bg-black/80 border border-white/10">
          <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
        </button>
      </div>

      {/* ─── Coming Soon Overlay ─── */}
      {!isPublished && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-background border border-border rounded-2xl p-8 text-center max-w-sm mx-6 pointer-events-auto shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-8 h-8 text-amber-500" />
              <h2 className="text-xl font-heading font-bold">Coming Soon</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              This resort is currently being prepared. Check back soon for the full experience.
            </p>
            <button onClick={() => navigate("/dashboard")}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-sm font-bold transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ─── Hero Section ─── */}
      <div ref={heroRef} className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Background: video or images or gradient */}
        {ytId ? (
          <>
            <div className="absolute inset-0 pointer-events-none">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                className="w-full h-full object-cover"
                style={{ minWidth: "177.77vh", minHeight: "56.25vw", transform: "scale(1.2)", overflow: "hidden" }}
                allow="autoplay; encrypted-media"
                onLoad={() => setVideoReady(true)}
              />
            </div>
          </>
        ) : heroImages.length > 0 ? (
          heroImages.map((img, i) => (
            <motion.div key={i} style={{ opacity: heroOpacity, scale: heroScale, position: "absolute", inset: 0 }}
              animate={{ opacity: i === currentHero ? 1 : 0 }} transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}>
              <img src={img} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.65) saturate(1.1)" }} />
            </motion.div>
          ))
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)` }} />
        )}

        {/* Hero dots */}
        {heroImages.length > 1 && !ytId && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroImages.map((_, i) => (
              <button key={i} onClick={() => setCurrentHero(i)}
                className={`h-1 rounded-full transition-all duration-500 ${i === currentHero ? "w-6 bg-amber-500" : "w-3 bg-white/30"}`} />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Heart className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-widest">{typeLabel}</span>
          </motion.div>

          {logoUrl && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }} className="mb-4">
              <img src={logoUrl} alt="Logo" className="h-16 sm:h-20 object-contain mx-auto" />
            </motion.div>
          )}

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1] mb-3 max-w-4xl"
            style={{ textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>{resortName}</motion.h1>

          {(tagline || shortDesc) && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white/70 text-base sm:text-lg max-w-xl mb-8 font-light leading-relaxed">
              {tagline || shortDesc}
            </motion.p>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row gap-3 mt-4">
            {email && (
              <a href={`mailto:${email}`}
                className="px-8 py-3.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-black transition-all hover:scale-105 shadow-lg shadow-amber-500/20">
                Book Now
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`}
                className="px-8 py-3.5 rounded-xl text-sm font-bold border border-white/40 text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105">
                Call Us
              </a>
            )}
          </motion.div>

          {showScroll && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="absolute bottom-24 flex flex-col items-center gap-1 text-white/40">
              <span className="text-[10px] uppercase tracking-widest">Discover More</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══ THE STORY ═══ */}
      {(shortDesc || fullDesc || mission || resortOwner || ownerBio) && (
        <section className="py-20 px-6 sm:px-12" style={{ backgroundColor: bgColor }}>
          <div className="max-w-3xl mx-auto space-y-10">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
              className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="w-12 h-px" style={{ background: `${primaryColor}40` }} />
                <Heart className="w-4 h-4" style={{ color: primaryColor }} />
                <div className="w-12 h-px" style={{ background: `${primaryColor}40` }} />
              </div>
              {resortOwner && (
                <p className="text-xs uppercase tracking-widest" style={{ color: primaryColor, fontWeight: 600 }}>
                  By {resortOwner}
                </p>
              )}
              {shortDesc && (
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">{shortDesc}</p>
              )}
            </motion.div>

            {fullDesc && (
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="text-center">
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">{fullDesc}</p>
              </motion.div>
            )}

            {mission && (
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="text-center p-6 rounded-2xl border border-border">
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: primaryColor, fontWeight: 600 }}>Our Mission</p>
                <p className="text-muted-foreground text-sm italic max-w-xl mx-auto leading-relaxed">"{mission}"</p>
              </motion.div>
            )}

            {/* Owner Bio */}
            {(ownerBio || ownerPhotoUrl) && (
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-border text-left">
                {ownerPhotoUrl && (
                  <img src={ownerPhotoUrl} alt={resortOwner} className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-border" />
                )}
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: primaryColor, fontWeight: 600 }}>About the Owner</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{ownerBio}</p>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ═══ ROOMS & VILLAS ═══ */}
      {roomTypes.length > 0 && (
        <section className="py-20 px-6 sm:px-12" style={{ backgroundColor: "#f5f5f0" }}>
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-8 h-px" style={{ background: `${primaryColor}40` }} />
                  <p className="text-xs uppercase tracking-widest" style={{ color: primaryColor, fontWeight: 600 }}>Accommodations</p>
                  <div className="w-8 h-px" style={{ background: `${primaryColor}40` }} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold">Rooms & Villas</h2>
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                  Each room is designed for comfort and elegance
                </p>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {roomTypes.map((room: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group bg-background rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300">
                  {room.imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={room.imageUrl} alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-heading font-bold mb-1">{room.name}</h3>
                    {room.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{room.description}</p>}
                    {room.price && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <span className="text-sm font-semibold" style={{ color: primaryColor }}>From {room.price}/night</span>
                        <span className="text-xs text-muted-foreground">{room.maxGuests || 2} guests</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ AMENITIES ═══ */}
      {allAmenities.length > 0 && (
        <section className="py-20 px-6 sm:px-12" style={{ backgroundColor: bgColor }}>
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-8 h-px" style={{ background: `${primaryColor}40` }} />
                  <p className="text-xs uppercase tracking-widest" style={{ color: primaryColor, fontWeight: 600 }}>Guest Comforts</p>
                  <div className="w-8 h-px" style={{ background: `${primaryColor}40` }} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold">Amenities & Services</h2>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allAmenities.map((item: string, i: number) => {
                const Icon = getAmenityIcon(item);
                return (
                  <motion.div key={item} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${primaryColor}10` }}>
                      <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-xs font-semibold text-center text-foreground leading-tight">{item}</span>
                  </motion.div>
                );
              })}
            </div>
            {totalRooms > 0 && (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} className="mt-8 flex items-center justify-center gap-3 text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span className="text-sm">{totalRooms} rooms available</span>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ═══ GALLERY ═══ */}
      {allGallery.length > 0 && (
        <section className="py-20 px-6 sm:px-12" style={{ backgroundColor: "#f5f5f0" }}>
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-8 h-px" style={{ background: `${primaryColor}40` }} />
                  <p className="text-xs uppercase tracking-widest" style={{ color: primaryColor, fontWeight: 600 }}>Visual Tour</p>
                  <div className="w-8 h-px" style={{ background: `${primaryColor}40` }} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold">Gallery</h2>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {allGallery.map((url, i) => (
                <motion.div key={`${url}-${i}`} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm">
                  <img src={url} alt={`${resortName} gallery ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FAQ ═══ */}
      {faqs.length > 0 && (
        <section className="py-20 px-6 sm:px-12" style={{ backgroundColor: bgColor }}>
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-8 h-px" style={{ background: `${primaryColor}40` }} />
                  <p className="text-xs uppercase tracking-widest" style={{ color: primaryColor, fontWeight: 600 }}>Questions</p>
                  <div className="w-8 h-px" style={{ background: `${primaryColor}40` }} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold">Frequently Asked Questions</h2>
              </div>
            </motion.div>
            <div className="space-y-3">
              {faqs.map((f: any, i: number) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <button onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-start gap-4 p-5 rounded-xl border border-border bg-card text-left hover:shadow-sm transition-all">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold mb-1">{f.question}</h3>
                        {isOpen && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            className="text-sm text-muted-foreground leading-relaxed">{f.answer}</motion.p>
                        )}
                      </div>
                      <ChevronUp className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? "" : "rotate-180"}`} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CONTACT & FOOTER ═══ */}
      <footer className="py-16 px-6 sm:px-12" style={{ backgroundColor: "#111827", color: "#e5e7eb" }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {/* Location */}
            {(fullAddress || googleMapsLink) && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: primaryColor, fontWeight: 600 }}>
                  <MapPin className="w-3.5 h-3.5 inline mr-1" /> Location
                </p>
                {fullAddress && <p className="text-sm text-gray-400 leading-relaxed mb-2">{fullAddress}</p>}
                {googleMapsLink && (
                  <a href={googleMapsLink} target="_blank" rel="noopener noreferrer"
                    className="text-sm underline" style={{ color: primaryColor }}>View on Google Maps</a>
                )}
              </div>
            )}

            {/* Contact */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: primaryColor, fontWeight: 600 }}>
                <Phone className="w-3.5 h-3.5 inline mr-1" /> Contact
              </p>
              {email && (
                <a href={`mailto:${email}`} className="block text-sm text-gray-400 hover:text-white transition-colors mb-1">{email}</a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="block text-sm text-gray-400 hover:text-white transition-colors mb-1">{phone}</a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="block text-sm text-gray-400 hover:text-white transition-colors">WhatsApp</a>
              )}
            </div>

            {/* Hours */}
            {(checkInTime || checkOutTime) && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: primaryColor, fontWeight: 600 }}>
                  <Clock className="w-3.5 h-3.5 inline mr-1" /> Hours
                </p>
                {checkInTime && <p className="text-sm text-gray-400">Check-in: {checkInTime}</p>}
                {checkOutTime && <p className="text-sm text-gray-400">Check-out: {checkOutTime}</p>}
              </div>
            )}
          </div>

          {/* Social */}
          {(facebookUrl || instagramUrl || tiktokUrl) && (
            <div className="flex items-center gap-4 mb-8">
              {facebookUrl && <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/5 transition-colors"><Facebook className="w-5 h-5 text-gray-400" /></a>}
              {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/5 transition-colors"><Instagram className="w-5 h-5 text-gray-400" /></a>}
            </div>
          )}

          {/* Copyright */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              {footerCopyright.replace("{resortName}", resortName).replace("{year}", String(new Date().getFullYear()))}
            </p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
              <ArrowUp className="w-3 h-3" /> Back to Top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
