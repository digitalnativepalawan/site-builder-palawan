import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { parseSectionData } from "@/types/sections";
import {
  CoverSection, TextSection, PhotoSection, BulletListSection, PricingSection,
  FaqSection, TwoColumnsSection, KeyNumbersSection, NumberCardsSection,
  TimelineSection, YoutubeSection, ContactFormSection, SeparatorSection,
  CtaSection, ImageGallerySection,
} from "@/components/preview/SectionRenderers";

const templateStyles = {
  business: { bg: "bg-gradient-to-b from-blue-50 to-white", text: "text-slate-800", accent: "bg-blue-600 hover:bg-blue-700 text-white", headingFont: "font-heading", bodyFont: "font-body" },
  portfolio: { bg: "bg-gradient-to-b from-zinc-900 to-zinc-950", text: "text-zinc-100", accent: "bg-white hover:bg-zinc-100 text-zinc-900", headingFont: "font-heading", bodyFont: "font-body" },
  blog: { bg: "bg-gradient-to-b from-amber-50 to-white", text: "text-stone-800", accent: "bg-stone-800 hover:bg-stone-900 text-white", headingFont: "font-serif", bodyFont: "font-body" },
};

type Style = typeof templateStyles.business;

export default function SitePreview() {
  const { siteId } = useParams<{ siteId: string }>();

  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ["preview-site", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").eq("id", siteId!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["preview-sections", siteId],
    enabled: !!site,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*").eq("site_id", siteId!).order("order_index");
      if (error) throw error;
      return data.map((s) => ({ ...s, data: parseSectionData(s.data) }));
    },
  });

  if (siteLoading || sectionsLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!site) {
    return <div className="flex min-h-screen items-center justify-center"><div className="text-center"><h1 className="font-heading text-4xl font-bold mb-2">404</h1><p className="text-muted-foreground">Site not found</p></div></div>;
  }

  const style = templateStyles[site.template as keyof typeof templateStyles] || templateStyles.business;

  const renderSection = (section: { id: string; section_type: string; data: ReturnType<typeof parseSectionData> }) => {
    const { data } = section;
    switch (section.section_type) {
      case "cover": case "hero": return <CoverSection key={section.id} data={data} style={style} />;
      case "text_block": return <TextSection key={section.id} data={data} style={style} />;
      case "photo": return <PhotoSection key={section.id} data={data} />;
      case "image_gallery": return <ImageGallerySection key={section.id} data={data} />;
      case "bullet_list": return <BulletListSection key={section.id} data={data} style={style} />;
      case "pricing": return <PricingSection key={section.id} data={data} style={style} />;
      case "faq": return <FaqSection key={section.id} data={data} style={style} />;
      case "two_columns": return <TwoColumnsSection key={section.id} data={data} style={style} />;
      case "key_numbers": return <KeyNumbersSection key={section.id} data={data} style={style} />;
      case "number_cards": return <NumberCardsSection key={section.id} data={data} style={style} />;
      case "timeline": return <TimelineSection key={section.id} data={data} style={style} />;
      case "youtube": return <YoutubeSection key={section.id} data={data} style={style} />;
      case "contact_form": return <ContactFormSection key={section.id} data={data} style={style} />;
      case "separator": return <SeparatorSection key={section.id} data={data} />;
      case "cta": return <CtaSection key={section.id} data={data} style={style} />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen max-w-full overflow-x-hidden ${style.bg}`}>
      {sections?.map(renderSection)}
      <footer className={`py-8 px-4 border-t ${style.text} opacity-50 text-center text-sm`}>
        <p>{site.site_name} · © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
