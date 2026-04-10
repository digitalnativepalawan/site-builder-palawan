export interface SiteColors {
  primary: string;
  background: string;
  text: string;
  heading: string;
  cardBg: string;
}

export interface SiteTypography {
  headingFont: string;
  bodyFont: string;
  scale: "compact" | "comfortable" | "relaxed";
}

export interface SiteLayout {
  contentWidth: "800px" | "1200px" | "1400px";
  spacing: "compact" | "comfortable" | "relaxed";
  borderRadius: "0px" | "4px" | "8px" | "999px";
}

export interface SiteButtons {
  style: "filled" | "outline" | "ghost";
  shape: "0px" | "4px" | "999px";
}

export interface SiteIdentity {
  siteTitle: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
}

export interface NavLink {
  label: string;
  url: string;
}

export interface SiteNavigation {
  headerStyle: "solid" | "transparent" | "blur";
  links: NavLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  visible: boolean;
}

export interface SiteSeo {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  gaId: string;
}

export interface SiteSettingsData {
  colors: SiteColors;
  typography: SiteTypography;
  layout: SiteLayout;
  buttons: SiteButtons;
  site_identity: SiteIdentity;
  navigation: SiteNavigation;
  social_links: SocialLink[];
  seo: SiteSeo;
  custom_css: string;
}

const SOCIAL_PLATFORMS = ["Twitter", "Instagram", "Facebook", "LinkedIn", "GitHub", "TikTok"];

export const FONT_OPTIONS_HEADING = [
  { value: "system-ui, sans-serif", label: "System" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
];

export const FONT_OPTIONS_BODY = [
  { value: "system-ui, sans-serif", label: "System" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Lora', serif", label: "Lora" },
];

export function getTemplateDefaults(template: string): SiteSettingsData {
  const base: SiteSettingsData = {
    colors: { primary: "#3b82f6", background: "#ffffff", text: "#1e293b", heading: "#0f172a", cardBg: "#ffffff" },
    typography: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", scale: "comfortable" },
    layout: { contentWidth: "1200px", spacing: "comfortable", borderRadius: "4px" },
    buttons: { style: "filled", shape: "4px" },
    site_identity: { siteTitle: "", logoUrl: "", faviconUrl: "", footerText: "" },
    navigation: { headerStyle: "solid", links: [] },
    social_links: SOCIAL_PLATFORMS.map(p => ({ platform: p, url: "", visible: false })),
    seo: { metaTitle: "", metaDescription: "", ogImageUrl: "", gaId: "" },
    custom_css: "",
  };

  if (template === "blog") {
    base.colors = { primary: "#78716c", background: "#fffbeb", text: "#44403c", heading: "#1c1917", cardBg: "#ffffff" };
    base.typography = { headingFont: "'Playfair Display', serif", bodyFont: "'Lora', serif", scale: "relaxed" };
    base.layout = { contentWidth: "800px", spacing: "relaxed", borderRadius: "0px" };
  } else if (template === "portfolio") {
    base.colors = { primary: "#ffffff", background: "#18181b", text: "#e4e4e7", heading: "#fafafa", cardBg: "#27272a" };
    base.typography = { headingFont: "'Montserrat', sans-serif", bodyFont: "'Inter', sans-serif", scale: "comfortable" };
    base.layout = { contentWidth: "1400px", spacing: "comfortable", borderRadius: "0px" };
  }

  return base;
}
