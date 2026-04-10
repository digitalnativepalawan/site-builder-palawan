import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Monitor, Tablet, Smartphone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseSectionData } from "@/types/sections";
import type { SiteSettingsData } from "@/types/settings";
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
type DeviceMode = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<DeviceMode, string> = { desktop: "100%", tablet: "768px", mobile: "375px" };

export default function SitePreview() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceMode>("desktop");

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

  const { data: settingsRow } = useQuery({
    queryKey: ["preview-settings", siteId],
    enabled: !!site,
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("site_id", siteId!).maybeSingle();
      return data;
    },
  });

  if (siteLoading || sectionsLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!site) {
    return <div className="flex min-h-screen items-center justify-center"><div className="text-center"><h1 className="font-heading text-4xl font-bold mb-2">404</h1><p className="text-muted-foreground">Site not found</p></div></div>;
  }

  const style = templateStyles[site.template as keyof typeof templateStyles] || templateStyles.business;

  // Build CSS variables from settings
  const ss = settingsRow as unknown as Record<string, unknown> | null;
  const colors = ss?.colors as SiteSettingsData["colors"] | undefined;
  const typo = ss?.typography as SiteSettingsData["typography"] | undefined;
  const layout = ss?.layout as SiteSettingsData["layout"] | undefined;
  const customCss = (ss?.custom_css as string) || "";
  const identity = ss?.site_identity as SiteSettingsData["site_identity"] | undefined;
  const logoSettings = ss?.logo_settings as SiteSettingsData["logo_settings"] | undefined;
  const spacingMap = { compact: "2rem", comfortable: "3rem", relaxed: "4.5rem" };

  const cssVars: React.CSSProperties = {
    ...(colors ? {
      "--site-primary": colors.primary,
      "--site-bg": colors.background,
      "--site-text": colors.text,
      "--site-heading": colors.heading,
      "--site-card-bg": colors.cardBg,
    } as React.CSSProperties : {}),
  };

  const wrapperStyle: React.CSSProperties = {
    ...cssVars,
    ...(colors ? { backgroundColor: colors.background, color: colors.text } : {}),
    ...(typo ? { fontFamily: typo.bodyFont } : {}),
  };

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

  const footerText = identity?.footerText || `${site.site_name} · © ${new Date().getFullYear()}`;

  // Google fonts link
  const fontFamilies = new Set<string>();
  if (typo?.headingFont && !typo.headingFont.startsWith("system")) {
    const match = typo.headingFont.match(/'([^']+)'/);
    if (match) fontFamilies.add(match[1].replace(/ /g, "+"));
  }
  if (typo?.bodyFont && !typo.bodyFont.startsWith("system")) {
    const match = typo.bodyFont.match(/'([^']+)'/);
    if (match) fontFamilies.add(match[1].replace(/ /g, "+"));
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      {/* Device Preview Toolbar */}
      <header className="flex items-center justify-between border-b bg-background px-4 py-2 shrink-0 z-10">
        <Button variant="ghost" size="sm" className="gap-2 min-h-[44px]" onClick={() => navigate(`/sites/${siteId}/edit`)}>
          <ArrowLeft className="h-4 w-4" /> Editor
        </Button>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as [DeviceMode, typeof Monitor][]).map(([mode, Icon]) => (
            <Button key={mode} variant={device === mode ? "default" : "ghost"} size="sm" className="min-h-[36px] min-w-[36px] px-3" onClick={() => setDevice(mode)}>
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5 capitalize">{mode}</span>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">{deviceWidths[device]}</div>
      </header>

      {/* Font loading */}
      {fontFamilies.size > 0 && (
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${[...fontFamilies].map(f => `family=${f}:wght@400;500;600;700`).join("&")}&display=swap`} />
      )}

      {/* Custom CSS */}
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}

      {/* Preview Container */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <div
          className={`transition-all duration-300 ${device !== "desktop" ? "shadow-2xl border rounded-lg overflow-hidden" : "w-full"}`}
          style={{ maxWidth: deviceWidths[device], width: "100%", minHeight: "100%" }}
        >
          <div className={`min-h-screen max-w-full overflow-x-hidden ${!colors ? style.bg : ""}`} style={wrapperStyle}>
            {/* Header with logo */}
            {logoSettings?.headerLogoUrl && (
              <header className={`px-4 sm:px-6 lg:px-8 py-3 border-b border-current/10 flex items-center ${logoSettings.headerLogoPosition === "center" ? "justify-center" : "justify-start"}`}>
                <img
                  src={logoSettings.headerLogoUrl}
                  alt="Site logo"
                  style={{
                    height: device === "mobile" ? logoSettings.headerLogoSize * 0.8 : logoSettings.headerLogoSize,
                    maxHeight: 80,
                    objectFit: "contain" as const,
                    ...(logoSettings.addShadow ? { filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" } : {}),
                    ...(logoSettings.addWhiteBorder ? { padding: 4, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 6 } : {}),
                  }}
                />
              </header>
            )}
            {/* Hero logo injection */}
            {sections?.map((section) => {
              if ((section.section_type === "cover" || section.section_type === "hero") && logoSettings?.heroLogoEnabled) {
                const heroUrl = logoSettings.heroLogoUseSameAsHeader ? logoSettings.headerLogoUrl : logoSettings.heroLogoUrl;
                if (heroUrl) {
                  return (
                    <div key={`hero-logo-${section.id}`}>
                      <div className="flex justify-center pt-8">
                        <img
                          src={heroUrl}
                          alt="Hero logo"
                          style={{
                            height: device === "mobile" ? logoSettings.heroLogoSize * 0.8 : logoSettings.heroLogoSize,
                            objectFit: "contain" as const,
                            ...(logoSettings.addShadow ? { filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" } : {}),
                            ...(logoSettings.addWhiteBorder ? { padding: 4, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 6 } : {}),
                          }}
                        />
                      </div>
                      {renderSection(section)}
                    </div>
                  );
                }
              }
              return renderSection(section);
            })}
            <footer className={`py-8 px-4 border-t ${!colors ? `${style.text} opacity-50` : "opacity-50"} text-center text-sm`}>
              <p>{footerText}</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
