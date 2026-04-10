import { useState } from "react";
import type { SectionData } from "@/types/sections";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type Style = { bg: string; text: string; accent: string; headingFont: string; bodyFont: string };

/* helper: extract YouTube embed URL */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

/* ═══ 1. COVER / BANNER ═══ */
export function CoverSection({ data, style }: { data: SectionData; style: Style }) {
  const hasBg = !!data.backgroundImage;
  return (
    <section
      className={`relative py-12 px-5 sm:px-6 lg:px-8 sm:py-24 lg:py-32 ${!hasBg ? style.bg : ""}`}
      style={hasBg ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {hasBg && <div className="absolute inset-0 bg-black/40" />}
      <div className={`relative mx-auto max-w-3xl text-left sm:text-center ${hasBg ? "text-white" : style.text}`}>
        <h1 className={`text-[28px] sm:text-4xl lg:text-6xl font-bold ${style.headingFont} mb-4`}>{data.headline}</h1>
        {data.subheadline && <p className="text-base sm:text-xl opacity-70 mb-8">{data.subheadline}</p>}
        {data.body && <p className="text-base opacity-60 max-w-[65ch] sm:mx-auto mb-8">{data.body}</p>}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:justify-center">
          {data.buttonText && <a href={data.buttonUrl || "#"} className={`inline-block w-full sm:w-auto text-center px-8 py-3 min-h-[44px] rounded-lg font-medium transition-colors ${style.accent}`}>{data.buttonText}</a>}
          {data.buttonText2 && <a href={data.buttonUrl2 || "#"} className="inline-block w-full sm:w-auto text-center px-8 py-3 min-h-[44px] rounded-lg font-medium border border-current transition-colors hover:opacity-80">{data.buttonText2}</a>}
        </div>
      </div>
    </section>
  );
}

/* ═══ 2. TEXT SECTION ═══ */
export function TextSection({ data, style }: { data: SectionData; style: Style }) {
  const bgClass = data.background === "light-gray" ? "bg-muted/50" : "";
  const align = data.alignment === "center" ? "text-left sm:text-center" : "text-left";
  const maxW = data.width === "narrow" ? "max-w-[800px]" : "max-w-4xl";
  return (
    <section className={`py-12 px-5 sm:px-6 lg:px-8 ${bgClass}`}>
      <div className={`mx-auto ${maxW} ${align}`}>
        {data.headline && <h2 className={`text-[28px] sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-4`}>{data.headline}</h2>}
        {data.body && <div className={`text-base sm:text-lg leading-relaxed ${style.text} opacity-80 whitespace-pre-wrap`}>{data.body}</div>}
        {data.buttonText && <a href={data.buttonUrl || "#"} className={`inline-block w-full sm:w-auto text-center mt-6 px-6 py-3 min-h-[44px] rounded-lg font-medium transition-colors ${style.accent}`}>{data.buttonText}</a>}
      </div>
    </section>
  );
}

/* ═══ 3. PHOTO ═══ */
export function PhotoSection({ data }: { data: SectionData }) {
  if (!data.imageUrl) return null;
  const sizeClass = data.size === "small" ? "max-w-sm" : data.size === "medium" ? "max-w-xl" : "max-w-4xl";
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className={`mx-auto ${sizeClass}`}>
        <img src={data.imageUrl} alt={data.imageAlt || data.caption || ""} loading="lazy" className="w-full h-auto rounded-lg max-w-full" />
        {data.caption && <p className="text-sm text-muted-foreground mt-2 text-left sm:text-center">{data.caption}</p>}
      </div>
    </section>
  );
}

/* ═══ 4. BULLET LIST ═══ */
export function BulletListSection({ data, style }: { data: SectionData; style: Style }) {
  const items = data.items || [];
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {data.headline && <h2 className={`text-[28px] sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-6`}>{data.headline}</h2>}
        <ul className={`space-y-3 ${data.listLayout === "two-col" ? "sm:columns-2 sm:gap-8" : ""}`}>
          {items.map((item, i) => (
            <li key={i} className={`flex items-start gap-2 ${style.text}`}>
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
              <span className="text-base sm:text-lg">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═══ 5. PRICING TABLE ═══ */
export function PricingSection({ data, style }: { data: SectionData; style: Style }) {
  const plans = data.plans || [];
  if (!plans.length) return null;
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {data.headline && <h2 className={`text-[28px] sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-8 text-left sm:text-center`}>{data.headline}</h2>}
        <div className={`grid grid-cols-1 ${plans.length === 1 ? "sm:max-w-md sm:mx-auto" : plans.length === 2 ? "sm:grid-cols-2 sm:max-w-3xl sm:mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"} gap-6`}>
          {plans.map((plan, i) => (
            <div key={i} className={`rounded-xl border p-6 flex flex-col ${plan.recommended ? "ring-2 ring-primary shadow-lg relative" : "shadow-sm"}`}>
              {plan.recommended && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Recommended</span>}
              <h3 className={`text-xl font-bold ${style.headingFont} ${style.text} mb-1`}>{plan.name}</h3>
              <p className={`text-3xl font-bold ${style.text} mb-4`}>{plan.price}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {(plan.features || []).filter(Boolean).map((f, j) => (
                  <li key={j} className={`text-sm ${style.text} opacity-70 flex items-start gap-2`}>
                    <span className="text-primary mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              {plan.buttonText && <a href={plan.buttonUrl || "#"} className={`block text-center w-full px-6 py-3 min-h-[44px] rounded-lg font-medium transition-colors ${style.accent}`}>{plan.buttonText}</a>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 6. FAQ ═══ */
export function FaqSection({ data, style }: { data: SectionData; style: Style }) {
  const items = data.faqItems || [];
  if (!items.length) return null;
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {data.headline && <h2 className={`text-[28px] sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-8 text-left sm:text-center`}>{data.headline}</h2>}
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className={`text-left ${style.text} text-base sm:text-lg`}>{item.question}</AccordionTrigger>
              <AccordionContent className={`${style.text} opacity-80 text-base whitespace-pre-wrap`}>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ═══ 7. TWO COLUMNS ═══ */
export function TwoColumnsSection({ data, style }: { data: SectionData; style: Style }) {
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {data.headline && <h2 className={`text-[28px] sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-8`}>{data.headline}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className={`${style.text} opacity-80 text-base sm:text-lg whitespace-pre-wrap`}>{data.leftContent}</div>
          <div className={`${style.text} opacity-80 text-base sm:text-lg whitespace-pre-wrap`}>{data.rightContent}</div>
        </div>
      </div>
    </section>
  );
}

/* ═══ 8. KEY NUMBERS ═══ */
export function KeyNumbersSection({ data, style }: { data: SectionData; style: Style }) {
  const numbers = data.numbers || [];
  if (!numbers.length) return null;
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {data.headline && <h2 className={`text-[28px] sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-8 text-left sm:text-center`}>{data.headline}</h2>}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${numbers.length > 2 ? "lg:grid-cols-4" : ""} gap-6 text-left sm:text-center`}>
          {numbers.map((n, i) => (
            <div key={i}>
              <p className={`text-4xl sm:text-5xl font-bold ${style.text}`}>{n.value}</p>
              <p className={`text-sm sm:text-base ${style.text} opacity-60 mt-1`}>{n.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 9. NUMBER CARDS ═══ */
export function NumberCardsSection({ data, style }: { data: SectionData; style: Style }) {
  const cards = data.numberCards || [];
  if (!cards.length) return null;
  const cols = data.columns || 3;
  const colsClass = cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className={`grid grid-cols-1 ${colsClass} gap-6`}>
          {cards.map((card, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
              <span className={`text-3xl font-bold ${style.text} opacity-30`}>{card.number}</span>
              <h3 className={`text-lg font-bold ${style.headingFont} ${style.text} mt-2 mb-1`}>{card.title}</h3>
              <p className={`text-sm ${style.text} opacity-70`}>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 10. TIMELINE ═══ */
export function TimelineSection({ data, style }: { data: SectionData; style: Style }) {
  const events = data.events || [];
  if (!events.length) return null;
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {data.headline && <h2 className={`text-[28px] sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-8 text-left sm:text-center`}>{data.headline}</h2>}
        <div className="relative border-l-2 border-primary/30 pl-6 space-y-8 ml-4">
          {events.map((ev, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary border-2 border-background" />
              <span className={`text-sm font-bold ${style.text} opacity-50`}>{ev.year}</span>
              <h3 className={`text-lg font-bold ${style.headingFont} ${style.text}`}>{ev.title}</h3>
              <p className={`text-sm ${style.text} opacity-70 mt-1`}>{ev.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 11. YOUTUBE / VIDEO ═══ */
export function YoutubeSection({ data, style }: { data: SectionData; style: Style }) {
  const embedUrl = data.videoUrl ? getEmbedUrl(data.videoUrl) : null;
  const hasVideo = embedUrl || data.videoFileUrl;
  if (!hasVideo) return null;
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {data.videoTitle && <h2 className={`text-[28px] sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-6 text-left sm:text-center`}>{data.videoTitle}</h2>}
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
          {embedUrl ? (
            <iframe src={embedUrl} title={data.videoTitle || "Video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
          ) : data.videoFileUrl ? (
            <video src={data.videoFileUrl} controls className="w-full h-full object-contain" />
          ) : null}
        </AspectRatio>
      </div>
    </section>
  );
}

/* ═══ 12. CONTACT FORM ═══ */
export function ContactFormSection({ data, style }: { data: SectionData; style: Style }) {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        {data.headline && <h2 className={`text-[28px] sm:text-3xl font-bold ${style.headingFont} ${style.text} mb-6 text-left sm:text-center`}>{data.headline}</h2>}
        {submitted ? (
          <p className={`text-left sm:text-center text-lg ${style.text}`}>{data.successMessage || "Thanks! We'll be in touch."}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="Name" className="w-full min-h-[44px] rounded-lg border bg-background px-4 py-2" />
            <input required type="email" placeholder="Email" className="w-full min-h-[44px] rounded-lg border bg-background px-4 py-2" />
            <textarea required placeholder="Message" rows={4} className="w-full rounded-lg border bg-background px-4 py-2" />
            <button type="submit" className={`w-full min-h-[44px] rounded-lg font-medium transition-colors ${style.accent}`}>
              {data.submitText || "Send Message"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ═══ 13. SEPARATOR ═══ */
export function SeparatorSection({ data }: { data: SectionData }) {
  const widthClass = data.separatorWidth === "small" ? "max-w-xs" : data.separatorWidth === "full" ? "max-w-full" : "max-w-lg";
  const colorClass = data.separatorColor === "brand" ? "border-primary" : "border-muted-foreground/20";
  return (
    <section className="py-6 px-5 sm:px-4">
      <hr className={`mx-auto ${widthClass} ${colorClass} border-t`} />
    </section>
  );
}

/* ═══ 14. CALL TO ACTION ═══ */
export function CtaSection({ data, style }: { data: SectionData; style: Style }) {
  const bgClass = data.background === "brand" ? "bg-primary text-primary-foreground" : data.background === "light-gray" ? "bg-muted/50" : "";
  return (
    <section className={`py-12 sm:py-20 px-5 sm:px-6 lg:px-8 ${bgClass}`}>
      <div className="mx-auto max-w-3xl text-left sm:text-center">
        {data.headline && <h2 className={`text-[28px] sm:text-4xl font-bold ${style.headingFont} ${data.background === "brand" ? "" : style.text} mb-4`}>{data.headline}</h2>}
        {data.subheadline && <p className={`text-base sm:text-lg ${data.background === "brand" ? "opacity-80" : `${style.text} opacity-60`} mb-8`}>{data.subheadline}</p>}
        {data.buttonText && (
          <a href={data.buttonUrl || "#"} className={`inline-block w-full sm:w-auto text-center px-8 py-3 min-h-[44px] rounded-lg font-medium transition-colors ${data.background === "brand" ? "bg-background text-foreground hover:bg-background/90" : style.accent}`}>
            {data.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

/* ═══ IMAGE GALLERY (legacy compat) ═══ */
export function ImageGallerySection({ data }: { data: SectionData }) {
  if (!data.images?.length) return null;
  const colsClass = data.layout === "single" ? "grid-cols-1 max-w-2xl" : data.layout === "2-col" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <section className="py-12 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className={`grid ${colsClass} gap-4 ${data.layout === "single" ? "mx-auto" : ""}`}>
          {data.images.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-lg">
              <img src={img.url} alt={img.alt} loading="lazy" className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300 max-w-full h-auto" />
              {img.caption && <p className="text-sm text-muted-foreground p-2">{img.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
