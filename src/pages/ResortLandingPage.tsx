import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverSection, TextSection, BulletListSection, PricingSection, FaqSection, ImageGallerySection, ContactFormSection, YoutubeSection } from "@/components/preview/SectionRenderers";

export default function ResortLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    console.log("=== PREVIEW PAGE DEBUG ===");
    console.log("Route ID param:", id);
    
    if (!id) {
      setError("No resort ID provided in URL");
      setLoading(false);
      return;
    }

    const fetchSite = async () => {
      try {
        console.log("Fetching from Supabase...");
        console.log("Table: resort_submissions");
        console.log("ID:", id);
        
        const { data, error } = await supabase
          .from("resort_submissions")
          .select("data, status, id, created_at")
          .eq("id", id)
          .single();

        console.log("=== SUPABASE RESPONSE ===");
        console.log("Data:", data);
        console.log("Error:", error);
        
        setDebugInfo({ data, error });

        if (error) {
          console.error("Supabase query failed:", error);
          throw new Error(error.message);
        }

        if (!data) {
          console.error("No data returned from query");
          throw new Error("Resort not found in database");
        }

        console.log("=== DATA STRUCTURE ===");
        console.log("data.data:", data.data);
        console.log("Type:", typeof data.data);
        
        setSiteData(data);
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
        <p className="text-xs text-muted-foreground">ID: {id}</p>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Resort</h1>
        <p className="text-muted-foreground max-w-md text-center">{error || "Resort not found"}</p>
        
        {debugInfo && (
          <details className="w-full max-w-2xl bg-muted p-4 rounded-lg">
            <summary className="cursor-pointer font-medium">Debug Info (click to expand)</summary>
            <pre className="text-xs mt-2 overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
        
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

  const d = siteData.data || {};
  const identity = d.identity || d.basicInfo || {};
  const resortName = identity.resortName || "Resort";
  
  console.log("=== BUILDING SECTIONS ===");
  console.log("Identity:", identity);
  console.log("Resort Name:", resortName);
  
  // Build sections from data
  const sections = [];
  
  // Cover/Hero
  if (d.media?.heroImages?.[0] || identity.resortName) {
    sections.push({
      type: "cover",
      data: {
        headline: identity.resortName,
        subheadline: d.brandStory?.tagline || "",
        body: d.brandStory?.shortDescription || "",
        buttonText: "Book Now",
        buttonUrl: `mailto:${d.location?.contactEmail || ""}`,
        backgroundImage: d.media?.heroImages?.[0],
      },
    });
  }

  // About
  if (d.brandStory?.fullDescription) {
    sections.push({
      type: "text",
      data: {
        headline: "About Us",
        body: d.brandStory.fullDescription,
        background: "white",
      },
    });
  }

  // Video
  if (d.media?.videoUrl) {
    sections.push({
      type: "youtube",
      data: {
        videoUrl: d.media.videoUrl,
        videoTitle: `${resortName} Tour`,
      },
    });
  }

  // Gallery
  if (d.media?.galleryImages?.length) {
    sections.push({
      type: "gallery",
      data: {
        headline: "Gallery",
        images: d.media.galleryImages.slice(0, 20).map((url: string) => ({ url, alt: "", caption: "" })),
        layout: "3-col",
      },
    });
  }

  // Amenities
  if (d.amenities?.length) {
    sections.push({
      type: "bullet_list",
      data: {
        headline: "Amenities",
        items: d.amenities.map((a: string) => ({ text: a, icon: "check" })),
        listLayout: "two-col",
      },
    });
  }

  // Rooms
  if (d.roomTypes?.length) {
    sections.push({
      type: "pricing",
      data: {
        headline: "Our Rooms",
        subheadline: "Choose your room",
        plans: d.roomTypes.map((r: any) => ({
          name: r.name || "Room",
          price: `₱${r.price || "0"}/night`,
          features: [r.description || "", `Max ${r.maxGuests || "?"} guests`, `Bed: ${r.bedType || "-"}`],
          buttonText: "Book Now",
          buttonUrl: "",
        })),
      },
    });
  }

  // FAQ
  if (d.faq?.length) {
    sections.push({
      type: "faq",
      data: {
        headline: "FAQ",
        faqItems: d.faq.map((f: any) => ({ question: f.question, answer: f.answer })),
      },
    });
  }

  // Contact
  if (d.location?.contactEmail) {
    sections.push({
      type: "contact",
      data: {
        headline: "Contact Us",
        email: d.location.contactEmail,
        phone: d.location.phone,
        address: d.location.fullAddress,
        whatsapp: d.location.whatsapp,
        googleMapsLink: d.location.googleMapsLink,
      },
    });
  }

  // Get colors from palette
  const colors = d.colorPalette || {};
  const style = {
    bg: colors.background || "#ffffff",
    text: colors.text || "#1e293b",
    accent: colors.primary || "#0EA5E9",
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Inter', sans-serif",
  };

  console.log("=== SECTIONS BUILT ===");
  console.log("Total sections:", sections.length);
  console.log("Sections:", sections);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold">{resortName}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/wizard?edit=${id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(window.location.href, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" /> Open New Tab
            </Button>
          </div>
        </div>
      </header>

      {/* Sections */}
      <main>
        {sections.map((section: any, i: number) => {
          switch (section.type) {
            case "cover":
              return <CoverSection key={i} data={section.data} style={style} />;
            case "text":
              return <TextSection key={i} data={section.data} style={style} />;
            case "bullet_list":
              return <BulletListSection key={i} data={section.data} style={style} />;
            case "pricing":
              return <PricingSection key={i} data={section.data} style={style} />;
            case "faq":
              return <FaqSection key={i} data={section.data} style={style} />;
            case "gallery":
              return <ImageGallerySection key={i} data={section.data} />;
            case "youtube":
              return <YoutubeSection key={i} data={section.data} style={style} />;
            case "contact":
              return <ContactFormSection key={i} data={section.data} style={style} />;
            default:
              return null;
          }
        })}
        
        {sections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-2xl font-bold mb-4">No Content Yet</h2>
            <p className="text-muted-foreground mb-4">This resort doesn't have any sections configured.</p>
            <Button onClick={() => navigate(`/wizard?edit=${id}`)}>
              Add Content
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {resortName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
