import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface CardItem {
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

interface SectionData {
  headline?: string;
  subheadline?: string;
  body?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonText2?: string;
  buttonUrl2?: string;
  backgroundImage?: string;
  alignment?: "left" | "center";
  width?: "narrow" | "normal";
  background?: "white" | "light-gray";
  images?: { url: string; alt: string; caption: string }[];
  layout?: "single" | "2-col" | "3-col";
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  cards?: CardItem[];
  columns?: 2 | 3 | 4;
}

function parseSectionData(data: Json): SectionData {
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return data as unknown as SectionData;
  }
  return {};
}

const templateStyles: Record<string, { bg: string; text: string; accent: string; headingFont: string; bodyFont: string }> = {
  business: {
    bg: "bg-gradient-to-b from-blue-50 to-white",
    text: "text-slate-800",
    accent: "bg-blue-600 hover:bg-blue-700 text-white",
    headingFont: "font-heading",
    bodyFont: "font-body",
  },
  portfolio: {
    bg: "bg-gradient-to-b from-zinc-900 to-zinc-950",
    text: "text-zinc-100",
    accent: "bg-white hover:bg-zinc-100 text-zinc-900",
    headingFont: "font-heading",
    bodyFont: "font-body",
  },
  blog: {
    bg: "bg-gradient-to-b from-amber-50 to-white",
    text: "text-stone-800",
    accent: "bg-stone-800 hover:bg-stone-900 text-white",
    headingFont: "font-serif",
    bodyFont: "font-body",
  },
};

type Style = typeof templateStyles.business;

/* ─── Section Renderers ─── */

function HeroSection({ data, style }: { data: SectionData; style: Style }) {
  const hasBg = !!data.backgroundImage;
  return (
    <section
      className={`relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 ${!hasBg ? style.bg : ""}`}
      style={hasBg ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {hasBg && <div className="absolute inset-0 bg-black/40" />}
      <div className={`relative mx-auto max-w-3xl text-center ${hasBg ? "text-white" : style.text}`}>
        <h1 className={`text-3xl sm:text-4xl lg:text-6xl font-bold ${style.headingFont} mb-4`}>{data.headline}</h1>
        {data.subheadline && <p className="text-lg sm:text-xl opacity-70 mb-8">{data.subheadline}</p>}
        {data.body && <p className="text-base opacity-60 max-w-[65ch] mx-auto mb-8">{data.body}</p>}
        <div className="flex flex-wrap gap-4 justify-center">
          {data.buttonText && (
            <a href={data.buttonUrl || "#"} className={`inline-block px-8 py-3 rounded-lg font-medium transition-colors ${style.accent}`}>
              {data.buttonText}
            </a>
          )}
          {data.buttonText2 && (
            <a href={data.buttonUrl2 || "#"} className="inline-block px-8 py-3 rounded-lg font-medium border border-current transition-colors hover:opacity-80">
              {data.buttonText2}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function TextSection({ data, style }: { data: SectionData; style: Style }) {
  const bgClass = data.background === "light-gray" ? "bg-muted/50" : "";
  const align = data.alignment === "center" ? "text-center" : "text-left";
  const maxW = data.width === "narrow" ? "max-w-[800px]" : "max-w-4xl";

  return (
    <section className={`py-12 sm:py-16 px-4 sm:px-6 lg:px-8 ${bgClass}`}>
      <div className={`mx-auto ${maxW} ${align}`}>
        {data.headline && <h2 className={`text-2xl sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-4`}>{data.headline}</h2>}
        {data.body && <div className={`text-base sm:text-lg leading-relaxed ${style.text} opacity-80 whitespace-pre-wrap`}>{data.body}</div>}
        {data.buttonText && (
          <a href={data.buttonUrl || "#"} className={`inline-block mt-6 px-6 py-3 rounded-lg font-medium transition-colors ${style.accent}`}>
            {data.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

function ImageGallerySection({ data }: { data: SectionData }) {
  if (!data.images?.length) return null;
  const colsClass = data.layout === "single" ? "grid-cols-1 max-w-2xl" : data.layout === "2-col" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className={`grid ${colsClass} gap-4 ${data.layout === "single" ? "mx-auto" : ""}`}>
          {data.images.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-lg">
              <img src={img.url} alt={img.alt} loading="lazy" className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300" style={{ maxWidth: "100%", height: "auto" }} />
              {img.caption && <p className="text-sm text-muted-foreground p-2">{img.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SplitLayoutSection({ data, style }: { data: SectionData; style: Style }) {
  const imgLeft = data.imagePosition !== "right";
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className={`mx-auto max-w-6xl flex flex-col ${imgLeft ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-12 items-center`}>
        {data.imageUrl && (
          <div className="w-full lg:w-1/2">
            <img src={data.imageUrl} alt={data.imageAlt || ""} className="w-full rounded-lg object-cover" style={{ maxWidth: "100%", height: "auto" }} />
          </div>
        )}
        <div className="w-full lg:w-1/2">
          {data.headline && <h2 className={`text-2xl sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-4`}>{data.headline}</h2>}
          {data.body && <p className={`text-base sm:text-lg leading-relaxed ${style.text} opacity-80 whitespace-pre-wrap`}>{data.body}</p>}
          {data.buttonText && (
            <a href={data.buttonUrl || "#"} className={`inline-block mt-6 px-6 py-3 rounded-lg font-medium transition-colors ${style.accent}`}>
              {data.buttonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function GridCardsSection({ data, style }: { data: SectionData; style: Style }) {
  if (!data.cards?.length) return null;
  const cols = data.columns || 3;
  const colsClass = cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {data.headline && <h2 className={`text-2xl sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-8 text-center`}>{data.headline}</h2>}
        <div className={`grid grid-cols-1 ${colsClass} gap-6`}>
          {data.cards.map((card, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {card.image && <img src={card.image} alt={card.title} className="w-full aspect-video object-cover" style={{ maxWidth: "100%", height: "auto" }} />}
              <div className="p-5">
                {card.title && <h3 className={`text-lg font-bold ${style.headingFont} ${style.text} mb-1`}>{card.title}</h3>}
                {card.subtitle && <p className="text-sm text-muted-foreground mb-2">{card.subtitle}</p>}
                {card.description && <p className={`text-sm ${style.text} opacity-70`}>{card.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Preview ─── */

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold mb-2">404</h1>
          <p className="text-muted-foreground">Site not found</p>
        </div>
      </div>
    );
  }

  const style = templateStyles[site.template] || templateStyles.business;

  return (
    <div className={`min-h-screen max-w-full overflow-x-hidden ${style.bg}`}>
      {sections?.map((section) => {
        switch (section.section_type) {
          case "hero": return <HeroSection key={section.id} data={section.data} style={style} />;
          case "text_block": return <TextSection key={section.id} data={section.data} style={style} />;
          case "image_gallery": return <ImageGallerySection key={section.id} data={section.data} />;
          case "split_layout": return <SplitLayoutSection key={section.id} data={section.data} style={style} />;
          case "grid_cards": return <GridCardsSection key={section.id} data={section.data} style={style} />;
          default: return null;
        }
      })}

      <footer className={`py-8 px-4 border-t ${style.text} opacity-50 text-center text-sm`}>
        <p>{site.site_name} · © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
