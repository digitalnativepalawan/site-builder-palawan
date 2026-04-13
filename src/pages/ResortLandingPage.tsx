import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverSection, TextSection, BulletListSection, PricingSection, FaqSection, ImageGallerySection, ContactFormSection, YoutubeSection } from "@/components/preview/SectionRenderers";

export default function ResortLandingPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    if (!submissionId) return;

    const fetchSite = async () => {
      try {
        const { data, error } = await supabase
          .from("resort_submissions")
          .select("data, status")
          .eq("id", submissionId)
          .single();

        if (error) throw error;
        setSiteData(data);
      } catch (err) {
        console.error("Failed to load site:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Resort not found</h1>
        <Button onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const d = siteData.data || {};
  const identity = d.identity || d.basicInfo || {};
  const resortName = identity.resortName || "Resort";
  
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold">{resortName}</h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
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
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {resortName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
