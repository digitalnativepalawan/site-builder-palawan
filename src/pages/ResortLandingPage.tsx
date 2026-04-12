import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Wifi, Waves, UtensilsCrossed, Star, Phone, Mail,
  Coffee, Snowflake, Droplets, Plane, Anchor, Sun,
  ArrowLeft, ChevronDown, Heart, Shield, Leaf, Wine, Car, Tv, Camera, Mountain,
  LayoutDashboard } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// ─── Icon maps ───────────────────────────────────────────────
const FEATURE_ICONS: Record<string, typeof Waves> = {
  beachfront: Waves,
  "island-hopping": Anchor,
  diving: Anchor,
  starlink: Wifi,
  solar: Sun,
  "infinity-pool": Waves,
  "bar-restaurant": UtensilsCrossed,
  "airport-transfer": Plane,
};

const DINING_ICONS: Record<string, typeof Coffee> = {
  breakfast: Coffee,
  "in-house-restaurant": UtensilsCrossed,
  "pool-bar": Wine,
  "room-service": Coffee,
};

const ROOM_ICONS: Record<string, typeof Snowflake> = {
  ac: Snowflake,
  hotWater: Droplets,
  breakfast: Coffee,
};

const AMENITY_ICONS: Record<string, typeof Shield> = {
  Fiber: Wifi,
  FiberOptic: Wifi,
  AC: Snowflake,
  "Air Conditioning": Snowflake,
  HotWater: Droplets,
  "Hot Water": Droplets,
  Breakfast: Coffee,
  TV: Tv,
  CarPark: Car,
  Parking: Car,
  AirportTransfer: Plane,
  "Airport Transfer": Plane,
  IslandHopping: Anchor,
  "Island Hopping": Anchor,
  Diving: Anchor,
  Beachfront: Waves,
  Beach: Waves,
  InfinityPool: Waves,
  Pool: Waves,
  Solar: Sun,
  "Eco-Solar": Sun,
  Bar: UtensilsCrossed,
  Restaurant: UtensilsCrossed,
  "Bar & Restaurant": UtensilsCrossed,
  Starlink: Wifi,
  Wifi: Wifi,
  "Starlink Wifi": Wifi,
};

// ─── Helpers ───────────────────────────────────────────────────
function getNested(data: unknown, path: string): string {
  try {
    const keys = path.split(".");
    let val: any = data;
    for (const k of keys) {
      if (val == null) return "";
      val = val[k];
    }
    return typeof val === "string" ? val : "";
  } catch {
    return "";
  }
}

function getArray(data: unknown, path: string): string[] {
  try {
    const keys = path.split(".");
    let val: any = data;
    for (const k of keys) {
      if (val == null) return [];
      val = val[k];
    }
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

function getAmenityIcon(label: string): any {
  // Direct lookup
  if (AMENITY_ICONS[label]) return AMENITY_ICONS[label];
  // Case-insensitive lookup
  const lower = label.toLowerCase().replace(/[^a-z]/g, "");
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (key.toLowerCase().replace(/[^a-z]/g, "") === lower) return icon;
  }
  // Partial match
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) return icon;
  }
  return Star;
}

// ─── Page ──────────────────────────────────────────────────────
export default function ResortLandingPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const [showScroll, setShowScroll] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setShowScroll(v < 0.1));
    return unsub;
  }, [scrollYProgress]);

  // Auto-rotate hero images
  useEffect(() => {
    if (heroImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentHero((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, []);

  const { data: row, isLoading } = useQuery({
    queryKey: ["resort-submission", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resort_submissions")
        .select("*")
        .eq("id", submissionId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Not found");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-white/60" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white text-center">
        <div>
          <h1 className="text-6xl font-heading font-bold mb-4">404</h1>
          <p className="text-white/60 mb-8">This resort couldn't be found.</p>
          <button onClick={() => navigate("/")} className="text-amber-500 underline">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const d = row.data as Record<string, any> || {};
  const basic = d.basicInfo || {};
  const media = d.media || {};
  const amenities = d.amenity || d.amenities || {};
  const rooms = (amenities.roomDetails || amenities.room_details || {}) as Record<string, any>;

  const resortName = basic.resortName || "Paradise Resort";
  const resortType = basic.resortType || "Boutique Resort";
  const resortOwner = basic.resortOwner || "";
  const email = basic.email || "";
  const phone = basic.phone || "";
  const shortDesc = basic.shortDescription || "";
  const fullDesc = basic.fullDescription || "";
  const tagline = basic.tagline || "";

  const primaryColor = d.colorPalette?.primary || "#B8860B";
  const secondaryColor = d.colorPalette?.secondary || "#1E40AF";
  const bgColor = d.colorPalette?.background || "#0a0a0a";

  // Hero images: merge heroImages + gallery for slideshow
  const heroImagesRaw = (media.heroImages as string[] | undefined)?.filter(Boolean) || [];
  const galleryImages = (media.galleryImages as string[] | undefined)?.filter(Boolean) || [];
  const logoUrl = media.logoUrl || "";

  // Combine: heroImages first, then gallery
  let heroImages = [...heroImagesRaw];
  let allGallery = [...galleryImages];
  // If no hero images, use first 2 from gallery
  if (!heroImages.length && galleryImages.length >= 2) {
    heroImages = [galleryImages[0], galleryImages[1]];
    allGallery = galleryImages.slice(2);
  }

  // Amenities
  const features = getArray(amenities, "features") || [];
  const dining = getArray(amenities, "dining") || [];
  const hasAc = rooms.ac;
  const hasHotWater = rooms.hotWater;
  const hasBreakfast = rooms.breakfast;
  const totalRooms = rooms.totalRooms || 0;
  const wifi = rooms.wifi || "";

  // Build amenities list
  const roomAmenities = [
    hasAc ? "Air Conditioning" : "",
    hasHotWater ? "Hot Water" : "",
    hasBreakfast ? "Breakfast Included" : "",
    wifi ? `${wifi} Internet` : "",
  ].filter(Boolean);

  const allAmenities = [...features, ...dining, ...roomAmenities];

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background" style={{ backgroundColor: bgColor }}>
      {/* ─── Admin bar (fixed, top-right) ─────────────── */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-black/60 backdrop-blur-md text-white/80 hover:text-white px-4 py-2.5 rounded-full text-xs font-semibold transition-all hover:bg-black/80 border border-white/10"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </button>
      </div>

      {/* ─── Hero Section ─────────────────────────────── */}
      <div ref={heroRef} className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Background slideshow */}
        {heroImages.length > 0 ? (
          <>
            {heroImages.map((img, i) => (
              <motion.div
                key={i}
                style={{
                  opacity: heroOpacity,
                  scale: heroScale,
                  position: "absolute",
                  inset: 0,
                }}
                animate={{
                  opacity: i === currentHero ? 1 : 0,
                  transition: { duration: 1.5, ease: [0.4, 0, 0.2, 1] },
                }}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.65) saturate(1.1)" }}
                  onLoad={() => setHeroLoaded(true)}
                />
              </motion.div>
            ))}

            {/* Hero indicators */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentHero(i)}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === currentHero ? "w-8 bg-amber-500" : "w-4 bg-white/30"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent z-10" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          </div>
        )}

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 px-6 text-center">
          {/* Resort type badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <Heart className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-widest">{resortType}</span>
          </motion.div>

          {/* Logo */}
          {logoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-6"
            >
              <img src={logoUrl} alt="Logo" className="h-16 sm:h-20 object-contain mx-auto" />
            </motion.div>
          )}

          {/* Resort name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1] mb-4 max-w-4xl"
            style={{ textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
          >
            {resortName}
          </motion.h1>

          {/* Tagline / Short Description */}
          {(tagline || shortDesc) && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white/70 text-base sm:text-lg max-w-xl mb-8 font-light leading-relaxed"
            >
              {tagline || shortDesc}
            </motion.p>
          )}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 mt-4"
          >
            {email && (
              <a
                href={`mailto:${email}`}
                className="px-8 py-3.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-black transition-all hover:scale-105 shadow-lg shadow-amber-500/20"
              >
                Book Now
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="px-8 py-3.5 rounded-xl text-sm font-bold border border-white/40 text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105"
              >
                Call Us
              </a>
            )}
          </motion.div>

          {/* Scroll indicator */}
          {showScroll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-12 flex flex-col items-center gap-1 text-white/40"
            >
              <span className="text-[10px] uppercase tracking-widest">Discover More</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── About Section ────────────────────────────── */}
      {(shortDesc || fullDesc || resortOwner) && (
        <section className="py-20 px-6 sm:px-12 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-12 h-px bg-amber-500/40" />
              <Heart className="w-4 h-4 text-amber-500" />
              <div className="w-12 h-px bg-amber-500/40" />
            </div>

            {resortOwner && (
              <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
                By {resortOwner}
              </p>
            )}

            {shortDesc && (
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                {shortDesc}
              </p>
            )}

            {fullDesc && (
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
                {fullDesc}
              </p>
            )}
          </motion.div>
        </section>
      )}

      {/* ─── Amenities Section ────────────────────────── */}
      {allAmenities.length > 0 && (
        <section className="py-20 px-6 sm:px-12 bg-neutral-50 dark:bg-neutral-950/50">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-8 h-px bg-amber-500/40" />
                <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Guest Comforts</p>
                <div className="w-8 h-px bg-amber-500/40" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold">Amenities & Services</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allAmenities.map((item: string) => {
                const Icon = getAmenityIcon(item);
                return (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                      <Icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-xs font-semibold text-center text-neutral-700 leading-tight">
                      {item}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {totalRooms > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-8 flex items-center justify-center gap-3 text-muted-foreground"
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm">{totalRooms} rooms available</span>
              </motion.div>
            )}
          </motion.div>
        </section>
      )}

      {/* ─── Gallery Section ──────────────────────────── */}
      {allGallery.length > 0 && (
        <section className="py-20 px-6 sm:px-12 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-8 h-px bg-amber-500/40" />
                <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Visual Tour</p>
                <div className="w-8 h-px bg-amber-500/40" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold">Gallery</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {allGallery.map((url, i) => (
                <motion.div
                  key={`${url}-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm"
                >
                  <img
                    src={url}
                    alt={`${resortName} gallery ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ─── Contact Section ──────────────────────────── */}
      {(email || phone) && (
        <section className="py-20 px-6 sm:px-12 bg-neutral-50 dark:bg-neutral-950/50">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center space-y-8"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-px bg-amber-500/40" />
              <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Reservations</p>
              <div className="w-8 h-px bg-amber-500/40" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-bold">Get In Touch</h2>
            <p className="text-muted-foreground">
              Ready to experience {resortName}? Contact us to reserve your stay.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-background border border-neutral-200 hover:border-amber-500/30 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700 group-hover:text-amber-600 transition-colors">
                    {email}
                  </span>
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-background border border-neutral-200 hover:border-amber-500/30 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700 group-hover:text-amber-600 transition-colors">
                    {phone}
                  </span>
                </a>
              )}
            </div>

            {/* Big Book Now CTA */}
            {email && (
              <a
                href={`mailto:${email}?subject=Reservation Inquiry — ${resortName}`}
                className="inline-flex items-center px-10 py-4 rounded-2xl text-base font-bold bg-amber-500 hover:bg-amber-600 text-black transition-all hover:scale-105 shadow-lg shadow-amber-500/20 mt-4"
              >
                Book Your Stay at {resortName}
              </a>
            )}
          </motion.div>
        </section>
      )}

      {/* ─── Footer ───────────────────────────────────── */}
      <footer className="py-12 px-6 text-center border-t border-neutral-200 dark:border-neutral-800 bg-background">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">{resortName}</span>. All rights reserved.
        </p>
        {resortOwner && (
          <p className="text-xs text-muted-foreground/60 mt-2">
            Managed by {resortOwner}
          </p>
        )}
      </footer>
    </div>
  );
}
