import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Wifi, Waves, UtensilsCrossed, Star, Phone, Mail,
  Coffee, Snowflake, Droplets, Plane, Anchor, Sun, ChevronRight } from "lucide-react";

// ─── Icon map for Palawan features ─────────────────────────────
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
  "pool-bar": Star,
  "room-service": Coffee,
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

// ─── Page ──────────────────────────────────────────────────────
export default function ResortLandingPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center">
        <div>
          <h1 className="font-heading text-4xl font-bold mb-3">404</h1>
          <p className="text-muted-foreground">Resort not found</p>
          <button onClick={() => navigate("/")} className="mt-4 text-primary underline text-sm">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const d = row.data as Record<string, any> || {};
  const basic = d.basicInfo || {};
  const media = d.media || {};
  const amenities = d.amenities || {};
  const rooms = amenities.roomDetails || {};

  // Derived data
  const resortName = basic.resortName || "Resort";
  const heroImageUrl = (media.heroImages as string[] | undefined)?.[0];
  const heroImage2 = (media.heroImages as string[] | undefined)?.[1];
  const logoUrl = media.logoUrl || "";
  const gallery = (media.galleryImages as string[] | undefined) || [];
  const features = getArray(amenities, "features");
  const dining = getArray(amenities, "dining");
  const hasAc = rooms.ac;
  const hasHotWater = rooms.hotWater;
  const hasBreakfast = rooms.breakfast;
  const totalRooms = rooms.totalRooms;
  const wifi = rooms.wifi;
  const email = basic.email || "";
  const phone = basic.phone || "";
  const resortType = basic.resortType || "resort";
  const resortOwner = basic.resortOwner || "";

  // Primary color from palette
  const primaryColor = d.colorPalette?.primary || "#B8860B";

  // ─── Hero Section ────────────────────────────────────
  const HeroSection = () => (
    <section className="relative h-screen min-h-[600px] flex items-end justify-start overflow-hidden">
      {/* Background image or gradient */}
      {heroImageUrl ? (
        <img
          src={heroImageUrl}
          alt={resortName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${primaryColor}33 0%, ${primaryColor}11 100%)` }}
        />
      )}
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Hero content */}
      <div className="relative z-10 px-6 pb-16 sm:px-12 sm:pb-24 max-w-3xl">
        {/* Resort type badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white/90 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider mb-4">
          <Star className="w-3 h-3" />
          {resortType}
        </div>

        {/* Name */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-3">
          {resortName}
        </h1>

        {/* Owner / Tagline */}
        {resortOwner && (
          <p className="text-white/80 text-sm sm:text-base mb-4 font-light">
            By {resortOwner}
          </p>
        )}

        {/* CTA */}
        <div className="flex flex-wrap gap-3 mt-6">
          {email && (
            <a
              href={`mailto:${email}`}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ backgroundColor: primaryColor }}
            >
              Book Now
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="px-6 py-3 rounded-xl text-sm font-bold border border-white/40 text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Call Us
            </a>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
        <ChevronRight className="w-6 h-6 rotate-90" />
      </div>
    </section>
  );

  // ─── Logo + About ────────────────────────────────────
  const AboutSection = () => (
    <section className="py-16 px-6 sm:px-12 bg-background">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="mx-auto h-20 object-contain" />
        )}
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">
            Welcome to {resortName}
          </h2>
          {basic.shortDescription && (
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {basic.shortDescription}
            </p>
          )}
          {basic.fullDescription && (
            <p className="text-muted-foreground text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              {basic.fullDescription}
            </p>
          )}
        </div>
      </div>
    </section>
  );

  // ─── Features ─────────────────────────────────────────
  const FeaturesSection = () => {
    if (!features.length) return null;
    return (
      <section className="py-16 px-6 sm:px-12 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">Features & Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {features.map((f: string) => {
              const iconId = f.toLowerCase().replace(/\s+/g, "-");
              const Icon = FEATURE_ICONS[iconId] || Star;
              return (
                <div key={f} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                  <Icon className="h-6 w-6" style={{ color: primaryColor }} />
                  <span className="text-xs font-semibold text-center">{f}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // ─── Dining ───────────────────────────────────────────
  const DiningSection = () => {
    if (!dining.length) return null;
    return (
      <section className="py-16 px-6 sm:px-12 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">Dining</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {dining.map((d: string) => {
              const iconId = d.toLowerCase().replace(/\s+/g, "-");
              const Icon = DINING_ICONS[iconId] || UtensilsCrossed;
              return (
                <div key={d} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                  <Icon className="h-6 w-6" style={{ color: primaryColor }} />
                  <span className="text-xs font-semibold text-center">{d}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // ─── Rooms ────────────────────────────────────────────
  const RoomsSection = () => {
    if (!totalRooms && !hasAc && !hasHotWater && !hasBreakfast && !wifi) return null;
    return (
      <section className="py-16 px-6 sm:px-12 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">Room Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {hasAc && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <Snowflake className="h-6 w-6 text-blue-500" />
                <span className="text-xs font-semibold text-center">Air Conditioning</span>
              </div>
            )}
            {hasHotWater && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <Droplets className="h-6 w-6 text-cyan-500" />
                <span className="text-xs font-semibold text-center">Hot Water</span>
              </div>
            )}
            {hasBreakfast && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <Coffee className="h-6 w-6 text-amber-600" />
                <span className="text-xs font-semibold text-center">Breakfast</span>
              </div>
            )}
            {wifi && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <Wifi className="h-6 w-6 text-primary" />
                <span className="text-xs font-semibold text-center">{wifi} Wifi</span>
              </div>
            )}
            {totalRooms > 0 && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <span className="text-2xl font-bold" style={{ color: primaryColor }}>{totalRooms}</span>
                <span className="text-xs font-semibold text-center">Rooms</span>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  // ─── Gallery ──────────────────────────────────────────
  const GallerySection = () => {
    const allImages = [...gallery];
    if (heroImageUrl) allImages.unshift(heroImageUrl);
    if (heroImage2) allImages.push(heroImage2);
    if (allImages.length === 0) return null;
    return (
      <section className="py-16 px-6 sm:px-12 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {allImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${resortName} photo ${i + 1}`}
                className="rounded-xl aspect-square object-cover border border-border hover:scale-[1.02] transition-transform"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ─── Contact ──────────────────────────────────────────
  const ContactSection = () => {
    if (!email && !phone) return null;
    return (
      <section className="py-16 px-6 sm:px-12 bg-muted/20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-heading font-bold">Get In Touch</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
                <span>{email}</span>
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-5 w-5" />
                <span>{phone}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    );
  };

  // ─── Footer ───────────────────────────────────────────
  const Footer = () => (
    <footer className="py-8 px-6 text-center text-sm text-muted-foreground bg-background border-t border-border">
      <p>&copy; {new Date().getFullYear()} {resortName}. All rights reserved.</p>
    </footer>
  );

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <DiningSection />
      <RoomsSection />
      <GallerySection />
      <ContactSection />
      <Footer />
    </div>
  );
}
