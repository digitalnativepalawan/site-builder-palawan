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

export interface SocialDisplaySettings {
  showInHeader: boolean;
  showInFooter: boolean;
  iconStyle: "rounded" | "square" | "text";
}

export interface SiteSeo {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  gaId: string;
}

export interface LogoSettings {
  headerLogoUrl: string;
  headerLogoSize: number;
  headerLogoPosition: "left" | "center";
  heroLogoEnabled: boolean;
  heroLogoUrl: string;
  heroLogoUseSameAsHeader: boolean;
  heroLogoSize: number;
  faviconUrl: string;
  addShadow: boolean;
  addWhiteBorder: boolean;
}

export interface HeaderSettings {
  visible: boolean;
  sticky: boolean;
  bgColor: string;
  layout: "logo-left" | "logo-center";
  height: "60px" | "72px" | "80px";
  ctaVisible: boolean;
  ctaText: string;
  ctaLink: string;
}

export interface FooterSettings {
  visible: boolean;
  columns: 2 | 3 | 4;
  showLogo: boolean;
  copyrightText: string;
  bgColor: string;
  showBackToTop: boolean;
}

export const defaultSocialDisplay: SocialDisplaySettings = {
  showInHeader: false,
  showInFooter: true,
  iconStyle: "rounded",
};

export const defaultHeaderSettings: HeaderSettings = {
  visible: true, sticky: false, bgColor: "#ffffff",
  layout: "logo-left", height: "72px",
  ctaVisible: false, ctaText: "", ctaLink: "",
};

export const defaultFooterSettings: FooterSettings = {
  visible: true, columns: 3, showLogo: false,
  copyrightText: "© {year} {site name}", bgColor: "#1e293b",
  showBackToTop: false,
};

export interface SiteSettingsData {
  colors: SiteColors;
  typography: SiteTypography;
  layout: SiteLayout;
  buttons: SiteButtons;
  site_identity: SiteIdentity;
  navigation: SiteNavigation;
  social_links: SocialLink[];
  social_display: SocialDisplaySettings;
  seo: SiteSeo;
  custom_css: string;
  logo_settings: LogoSettings;
  header_settings: HeaderSettings;
  footer_settings: FooterSettings;
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
    social_display: { ...defaultSocialDisplay },
    seo: { metaTitle: "", metaDescription: "", ogImageUrl: "", gaId: "" },
    custom_css: "",
    logo_settings: {
      headerLogoUrl: "", headerLogoSize: 120, headerLogoPosition: "left",
      heroLogoEnabled: false, heroLogoUrl: "", heroLogoUseSameAsHeader: true, heroLogoSize: 180,
      faviconUrl: "", addShadow: false, addWhiteBorder: false,
    },
    header_settings: { ...defaultHeaderSettings },
    footer_settings: { ...defaultFooterSettings },
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
