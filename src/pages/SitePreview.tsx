import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface SectionData {
  headline?: string;
  subheadline?: string;
  body?: string;
  buttonText?: string;
  buttonUrl?: string;
  images?: { url: string; alt: string; caption: string }[];
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "upload";
  videoTitle?: string;
  videoDescription?: string;
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

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match?.[1] || null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] || null;
}

function HeroSection({ data, style }: { data: SectionData; style: typeof templateStyles.business }) {
  return (
    <section className={`py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 ${style.bg}`}>
      <div className="mx-auto max-w-3xl text-center">
        <h1 className={`text-3xl sm:text-4xl lg:text-6xl font-bold ${style.headingFont} ${style.text} mb-4`}>{data.headline}</h1>
        {data.subheadline && <p className={`text-lg sm:text-xl ${style.text} opacity-70 mb-8`}>{data.subheadline}</p>}
        {data.body && <p className={`text-base ${style.text} opacity-60 max-w-[65ch] mx-auto mb-8`}>{data.body}</p>}
        {data.buttonText && (
          <a href={data.buttonUrl || "#"} className={`inline-block px-8 py-3 rounded-lg font-medium transition-colors ${style.accent}`}>
            {data.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

function TextSection({ data, style }: { data: SectionData; style: typeof templateStyles.business }) {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[65ch]">
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
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

function VideoSection({ data }: { data: SectionData }) {
  if (!data.videoUrl) return null;

  let embedSrc = "";
  if (data.videoType === "youtube") {
    const id = getYouTubeId(data.videoUrl);
    if (id) embedSrc = `https://www.youtube.com/embed/${id}`;
  } else if (data.videoType === "vimeo") {
    const id = getVimeoId(data.videoUrl);
    if (id) embedSrc = `https://player.vimeo.com/video/${id}`;
  }

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {data.videoTitle && <h3 className="text-xl font-bold font-heading mb-4">{data.videoTitle}</h3>}
        <div className="relative w-full" style={{ paddingBottom: "56.25%", maxWidth: "100%" }}>
          {data.videoType === "upload" ? (
            <video src={data.videoUrl} controls className="absolute inset-0 w-full h-full rounded-lg" style={{ maxWidth: "100%" }} />
          ) : embedSrc ? (
            <iframe src={embedSrc} className="absolute inset-0 w-full h-full rounded-lg" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          ) : (
            <p className="text-muted-foreground">Invalid video URL</p>
          )}
        </div>
        {data.videoDescription && <p className="mt-4 text-muted-foreground">{data.videoDescription}</p>}
      </div>
    </section>
  );
}

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
      {/* Sections */}
      {sections?.map((section) => {
        switch (section.section_type) {
          case "hero": return <HeroSection key={section.id} data={section.data} style={style} />;
          case "text_block": return <TextSection key={section.id} data={section.data} style={style} />;
          case "image_gallery": return <ImageGallerySection key={section.id} data={section.data} />;
          case "video": return <VideoSection key={section.id} data={section.data} />;
          default: return null;
        }
      })}

      {/* Footer */}
      <footer className={`py-8 px-4 border-t ${style.text} opacity-50 text-center text-sm`}>
        <p>{site.site_name} · © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
