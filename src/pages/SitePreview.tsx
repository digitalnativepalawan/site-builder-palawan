import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Monitor, Tablet, Smartphone, ArrowLeft, ArrowUp, Menu, X, Twitter, Instagram, Facebook, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseSectionData } from "@/types/sections";
import type { SiteSettingsData, SocialLink, SocialDisplaySettings } from "@/types/settings";
import { defaultHeaderSettings, defaultFooterSettings, defaultSocialDisplay } from "@/types/settings";
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

type DeviceMode = "desktop" | "tablet" | "mobile";
const deviceWidths: Record<DeviceMode, string> = { desktop: "100%", tablet: "768px", mobile: "375px" };

/* Helper: determine if a color is dark */
function isDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 140;
}

/* Helper: darken a hex color */
function darkenHex(hex: string, amount = 40): string {
  const c = hex.replace("#", "");
  const r = Math.max(0, parseInt(c.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(c.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(c.substring(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/* Social icon mapping */
const socialIcons: Record<string, typeof Twitter> = {
  Twitter, Instagram, Facebook, LinkedIn: Linkedin, GitHub: Github,
};

function SocialIcons({ links, display, color }: { links: SocialLink[]; display: SocialDisplaySettings; color: string }) {
  const visible = links.filter(l => l.visible && l.url);
  if (!visible.length) return null;

  return (
    <div className="flex items-center gap-2">
      {visible.map(l => {
        const Icon = socialIcons[l.platform];
        if (display.iconStyle === "text") {
          return (
            <a key={l.platform} href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-70 transition-opacity" style={{ color }}>
              {l.platform}
            </a>
          );
        }
        if (!Icon) {
          return (
            <a key={l.platform} href={l.url} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center justify-center w-8 h-8 text-xs font-medium hover:opacity-70 transition-opacity ${display.iconStyle === "rounded" ? "rounded-full" : "rounded"}`}
              style={{ color, border: `1px solid ${color}40` }}>
              {l.platform.charAt(0)}
            </a>
          );
        }
        return (
          <a key={l.platform} href={l.url} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center justify-center w-8 h-8 hover:opacity-70 transition-opacity ${display.iconStyle === "rounded" ? "rounded-full" : "rounded"}`}
            style={{ color, border: `1px solid ${color}40` }}>
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}

export default function SitePreview() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const ss = settingsRow as unknown as Record<string, unknown> | null;
  const colors = ss?.colors as SiteSettingsData["colors"] | undefined;
  const typo = ss?.typography as SiteSettingsData["typography"] | undefined;
  const customCss = (ss?.custom_css as string) || "";
  const identity = ss?.site_identity as SiteSettingsData["site_identity"] | undefined;
  const logoSettings = ss?.logo_settings as SiteSettingsData["logo_settings"] | undefined;
  const headerSettings = { ...defaultHeaderSettings, ...(ss?.header_settings as Partial<SiteSettingsData["header_settings"]> || {}) };
  const footerSettings = { ...defaultFooterSettings, ...(ss?.footer_settings as Partial<SiteSettingsData["footer_settings"]> || {}) };
  const navSettings = ss?.navigation as SiteSettingsData["navigation"] | undefined;
  const themeMode = (ss?.theme_mode as SiteSettingsData["theme_mode"]) || "light";

  // Parse social links and display settings
  const rawSocial = ss?.social_links;
  let socialLinks: SocialLink[] = [];
  let socialDisplay: SocialDisplaySettings = { ...defaultSocialDisplay };
  if (Array.isArray(rawSocial)) {
    const displayItem = rawSocial.find((item: any) => item && typeof item === "object" && "_display" in item);
    if (displayItem) {
      socialDisplay = { ...defaultSocialDisplay, ...(displayItem as any)._display };
      socialLinks = rawSocial.filter((item: any) => !(item && typeof item === "object" && "_display" in item)) as SocialLink[];
    } else {
      socialLinks = rawSocial as SocialLink[];
    }
  }

  // Derive header/footer colors based on effective theme
  const headerBg = themeMode === "dark" ? darkColors.cardBg : (colors?.cardBg || "#ffffff");
  const headerTextColor = isDark(headerBg) ? "#f8fafc" : "#1e293b";
  const footerBg = themeMode === "dark" ? "#0a0a0a" : (colors?.primary ? darkenHex(colors.primary, 60) : "#1e293b");
  const footerTextColor = isDark(footerBg) ? "#e2e8f0" : "#1e293b";

  // Dark mode color overrides
  const darkColors = {
    background: "#0f0f0f",
    text: "#e5e5e5",
    heading: "#ffffff",
    cardBg: "#1a1a1a",
  };

  // Determine effective colors based on theme mode
  const effectiveColors = colors ? (() => {
    if (themeMode === "dark") {
      return { ...colors, background: darkColors.background, text: darkColors.text, heading: darkColors.heading, cardBg: darkColors.cardBg };
    }
    return colors;
  })() : undefined;

  const cssVars: React.CSSProperties = {
    ...(effectiveColors ? {
      "--site-primary": effectiveColors.primary,
      "--site-bg": effectiveColors.background,
      "--site-text": effectiveColors.text,
      "--site-heading": effectiveColors.heading,
      "--site-card-bg": effectiveColors.cardBg,
    } as React.CSSProperties : {}),
  };

  const wrapperStyle: React.CSSProperties = {
    ...cssVars,
    ...(effectiveColors ? { backgroundColor: effectiveColors.background, color: effectiveColors.text } : {}),
    ...(typo ? { fontFamily: typo.bodyFont } : {}),
  };

  // Dark-mode CSS for "auto" mode using prefers-color-scheme
  const autoDarkCss = themeMode === "auto" ? `
    @media (prefers-color-scheme: dark) {
      .site-preview-wrapper {
        background-color: ${darkColors.background} !important;
        color: ${darkColors.text} !important;
        --site-bg: ${darkColors.background};
        --site-text: ${darkColors.text};
        --site-heading: ${darkColors.heading};
        --site-card-bg: ${darkColors.cardBg};
      }
    }
  ` : "";

  const renderSection = (section: { id: string; section_type: string; data: ReturnType<typeof parseSectionData> }) => {
    const { data } = section;
    switch (section.section_type) {
      case "cover": case "hero": return <CoverSection key={section.id} data={data} style={style} device={device} />;
      case "text_block": return <TextSection key={section.id} data={data} style={style} device={device} />;
      case "photo": return <PhotoSection key={section.id} data={data} device={device} />;
      case "image_gallery": return <ImageGallerySection key={section.id} data={data} device={device} />;
      case "bullet_list": return <BulletListSection key={section.id} data={data} style={style} device={device} />;
      case "pricing": return <PricingSection key={section.id} data={data} style={style} device={device} />;
      case "faq": return <FaqSection key={section.id} data={data} style={style} device={device} />;
      case "two_columns": return <TwoColumnsSection key={section.id} data={data} style={style} device={device} />;
      case "key_numbers": return <KeyNumbersSection key={section.id} data={data} style={style} device={device} />;
      case "number_cards": return <NumberCardsSection key={section.id} data={data} style={style} device={device} />;
      case "timeline": return <TimelineSection key={section.id} data={data} style={style} device={device} />;
      case "youtube": return <YoutubeSection key={section.id} data={data} style={style} device={device} />;
      case "contact_form": return <ContactFormSection key={section.id} data={data} style={style} device={device} />;
      case "separator": return <SeparatorSection key={section.id} data={data} device={device} />;
      case "cta": return <CtaSection key={section.id} data={data} style={style} device={device} />;
      default: return null;
    }
  };

  const copyrightText = footerSettings.copyrightText
    .replace("{year}", String(new Date().getFullYear()))
    .replace("{site name}", site.site_name);

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

  const navLinks = navSettings?.links || [];
  const visibleSocials = socialLinks.filter(l => l.visible && l.url);

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      {/* Device Preview Toolbar */}
      <header className="flex items-center justify-between border-b bg-background px-4 py-2 shrink-0 z-10">
        <Button variant="ghost" size="sm" className="gap-2 min-h-[44px]" onClick={() => navigate(`/sites/${siteId}/edit`)}>
          <ArrowLeft className="h-4 w-4" /> Editor
        </Button>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as [DeviceMode, typeof Monitor][]).map(([mode, Icon]) => (
            <Button key={mode} variant={device === mode ? "default" : "ghost"} size="sm" className="min-h-[36px] min-w-[36px] px-3" onClick={() => { setDevice(mode); setMobileMenuOpen(false); }}>
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
      {autoDarkCss && <style dangerouslySetInnerHTML={{ __html: autoDarkCss }} />}

      {/* Preview Container */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <div
          className={`transition-all duration-300 ${device !== "desktop" ? "shadow-2xl border rounded-lg overflow-hidden" : "w-full"}`}
          style={{ maxWidth: deviceWidths[device], width: "100%", minHeight: "100%" }}
        >
          <div className={`site-preview-wrapper min-h-screen max-w-full overflow-x-hidden ${!effectiveColors ? style.bg : ""}`} style={wrapperStyle}>
            {/* ═══ HEADER ═══ */}
            {headerSettings.visible && (
              <header
                className={`px-5 ${device !== "mobile" ? "sm:px-6 lg:px-8" : ""} border-b ${headerSettings.sticky ? "sticky top-0 z-50" : ""}`}
                style={{ backgroundColor: headerBg, minHeight: headerSettings.height }}
              >
                {/* Desktop header */}
                {device !== "mobile" && (
                  <div className={`flex items-center ${headerSettings.layout === "logo-center" ? "flex-col" : "justify-between"}`} style={{ minHeight: headerSettings.height }}>
                    <div className={`flex items-center gap-3 ${headerSettings.layout === "logo-center" ? "justify-center" : ""}`}>
                      {logoSettings?.headerLogoUrl ? (
                        <img src={logoSettings.headerLogoUrl} alt="Site logo"
                          style={{
                            height: logoSettings.headerLogoSize || 120, maxHeight: 80, objectFit: "contain" as const,
                            ...(logoSettings.addShadow ? { filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" } : {}),
                            ...(logoSettings.addWhiteBorder ? { padding: 4, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 6 } : {}),
                          }}
                        />
                      ) : (
                        <span style={{ color: headerTextColor, fontWeight: 700, fontSize: 18 }}>{identity?.siteTitle || site.site_name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {navLinks.map((link, i) => (
                        <a key={i} href={link.url} className="text-sm hover:opacity-70 transition-opacity" style={{ color: headerTextColor }}>{link.label}</a>
                      ))}
                      {socialDisplay.showInHeader && visibleSocials.length > 0 && (
                        <SocialIcons links={socialLinks} display={socialDisplay} color={headerTextColor} />
                      )}
                      {headerSettings.ctaVisible && headerSettings.ctaText && (
                        <a href={headerSettings.ctaLink || "#"} className="px-4 py-1.5 rounded text-sm font-medium text-white" style={{ backgroundColor: colors?.primary || "#3b82f6" }}>
                          {headerSettings.ctaText}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Mobile header */}
                {device === "mobile" && (
                  <div className="flex items-center justify-between" style={{ minHeight: headerSettings.height }}>
                    <div className="flex items-center gap-2">
                      {logoSettings?.headerLogoUrl ? (
                        <img src={logoSettings.headerLogoUrl} alt="Site logo"
                          style={{
                            height: (logoSettings.headerLogoSize || 120) * 0.65, maxHeight: 48, objectFit: "contain" as const,
                            ...(logoSettings.addShadow ? { filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" } : {}),
                          }}
                        />
                      ) : (
                        <span style={{ color: headerTextColor, fontWeight: 700, fontSize: 16 }}>{identity?.siteTitle || site.site_name}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      style={{ color: headerTextColor }}
                      aria-label="Toggle menu"
                    >
                      {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                  </div>
                )}

                {/* Mobile dropdown menu */}
                {device === "mobile" && mobileMenuOpen && (
                  <div className="pb-4 space-y-2 border-t" style={{ borderColor: `${headerTextColor}20` }}>
                    {navLinks.map((link, i) => (
                      <a key={i} href={link.url} className="block py-2 text-base hover:opacity-70 transition-opacity" style={{ color: headerTextColor }}>{link.label}</a>
                    ))}
                    {socialDisplay.showInHeader && visibleSocials.length > 0 && (
                      <div className="py-2">
                        <SocialIcons links={socialLinks} display={socialDisplay} color={headerTextColor} />
                      </div>
                    )}
                    {headerSettings.ctaVisible && headerSettings.ctaText && (
                      <a href={headerSettings.ctaLink || "#"} className="block w-full text-center px-4 py-3 min-h-[44px] rounded text-sm font-medium text-white" style={{ backgroundColor: colors?.primary || "#3b82f6" }}>
                        {headerSettings.ctaText}
                      </a>
                    )}
                  </div>
                )}
              </header>
            )}

            {/* Hero logo injection */}
            {sections?.map((section) => {
              if ((section.section_type === "cover" || section.section_type === "hero") && logoSettings?.heroLogoEnabled) {
                const heroUrl = logoSettings.heroLogoUseSameAsHeader ? logoSettings.headerLogoUrl : logoSettings.heroLogoUrl;
                if (heroUrl) {
                  return (
                    <div key={`hero-logo-${section.id}`}>
                      <div className="flex justify-center pt-8 px-5">
                        <img src={heroUrl} alt="Hero logo"
                          style={{
                            height: device === "mobile" ? logoSettings.heroLogoSize * 0.7 : logoSettings.heroLogoSize,
                            maxWidth: "100%", objectFit: "contain" as const,
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

            {/* ═══ FOOTER ═══ */}
            {footerSettings.visible && (
              <footer className={`py-8 px-5 ${device !== "mobile" ? "sm:px-6 lg:px-8" : ""} text-sm`} style={{ backgroundColor: footerBg, color: footerTextColor }}>
                <div className={`max-w-5xl mx-auto grid grid-cols-1 ${device !== "mobile" ? "sm:grid-cols-2 lg:grid-cols-3" : ""} gap-6`}>
                  {footerSettings.showLogo && logoSettings?.headerLogoUrl && (
                    <div className="flex items-start">
                      <img src={logoSettings.headerLogoUrl} alt="Logo" style={{ height: 40, objectFit: "contain" as const }} className="max-w-full" />
                    </div>
                  )}
                  <div>
                    <p style={{ opacity: 0.7 }}>{copyrightText}</p>
                  </div>
                  {socialDisplay.showInFooter && visibleSocials.length > 0 && (
                    <div>
                      <p className="font-medium mb-2" style={{ opacity: 0.9 }}>Follow Us</p>
                      <SocialIcons links={socialLinks} display={socialDisplay} color={footerTextColor} />
                    </div>
                  )}
                </div>
                {footerSettings.showBackToTop && (
                  <div className="flex justify-center mt-6">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-1 text-xs hover:opacity-100 transition-opacity" style={{ color: footerTextColor, opacity: 0.6 }}>
                      <ArrowUp className="h-3 w-3" /> Back to Top
                    </button>
                  </div>
                )}
              </footer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
