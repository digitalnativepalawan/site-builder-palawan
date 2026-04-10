import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, Plus, Trash2, AlertTriangle, ImageIcon, Globe, Download, Upload, CheckCircle, XCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import type { Json } from "@/integrations/supabase/types";
import {
  type SiteSettingsData, type SiteColors, type SiteTypography, type SiteLayout,
  type SiteButtons, type SiteIdentity, type SiteNavigation, type SocialLink, type SiteSeo, type NavLink,
  type LogoSettings, type HeaderSettings, type FooterSettings, type SocialDisplaySettings,
  getTemplateDefaults, FONT_OPTIONS_HEADING, FONT_OPTIONS_BODY,
  defaultHeaderSettings, defaultFooterSettings, defaultSocialDisplay,
} from "@/types/settings";

function parseSettings(row: Record<string, unknown>): SiteSettingsData {
  const d = getTemplateDefaults("business");
  // social_display might be stored as last element with _display key
  const rawSocial = row.social_links;
  let socialLinks = d.social_links;
  let socialDisplay = d.social_display;
  if (Array.isArray(rawSocial)) {
    const displayItem = rawSocial.find((item: any) => item && typeof item === "object" && "_display" in item);
    if (displayItem) {
      socialDisplay = { ...d.social_display, ...(displayItem as any)._display };
      socialLinks = rawSocial.filter((item: any) => !(item && typeof item === "object" && "_display" in item)) as SocialLink[];
    } else {
      socialLinks = rawSocial as SocialLink[];
    }
  }
  return {
    colors: { ...d.colors, ...(row.colors as SiteColors || {}) },
    typography: { ...d.typography, ...(row.typography as SiteTypography || {}) },
    layout: { ...d.layout, ...(row.layout as SiteLayout || {}) },
    buttons: { ...d.buttons, ...(row.buttons as SiteButtons || {}) },
    site_identity: { ...d.site_identity, ...(row.site_identity as SiteIdentity || {}) },
    navigation: { ...d.navigation, ...(row.navigation as SiteNavigation || {}) },
    social_links: socialLinks,
    social_display: socialDisplay,
    seo: { ...d.seo, ...(row.seo as SiteSeo || {}) },
    custom_css: (row.custom_css as string) || "",
    logo_settings: { ...d.logo_settings, ...(row.logo_settings as LogoSettings || {}) },
    header_settings: { ...d.header_settings, ...(row.header_settings as HeaderSettings || {}) },
    footer_settings: { ...d.footer_settings, ...(row.footer_settings as FooterSettings || {}) },
  };
}

export default function SiteSettings() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [domainSaving, setDomainSaving] = useState(false);
  const [domainStatus, setDomainStatus] = useState<"idle" | "checking" | "ok" | "fail">("idle");
  const backupInputRef = useRef<HTMLInputElement>(null);

  const { data: site } = useQuery({
    queryKey: ["site", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").eq("id", siteId!).single();
      if (error) throw error;
      return data;
    },
  });

  // Sync custom_domain from site data
  useEffect(() => {
    if (site?.custom_domain) setCustomDomain(site.custom_domain);
  }, [site]);

  const { data: existingRow, isLoading } = useQuery({
    queryKey: ["site-settings", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("site_id", siteId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Auto-create settings row if missing
  useEffect(() => {
    if (isLoading || !site) return;
    if (!existingRow && site) {
      const defaults = getTemplateDefaults(site.template);
      defaults.site_identity.siteTitle = site.site_name;
      supabase.from("site_settings").insert({
        site_id: siteId!,
        colors: defaults.colors as unknown as Json,
        typography: defaults.typography as unknown as Json,
        layout: defaults.layout as unknown as Json,
        buttons: defaults.buttons as unknown as Json,
        site_identity: defaults.site_identity as unknown as Json,
        navigation: defaults.navigation as unknown as Json,
        social_links: defaults.social_links as unknown as Json,
        seo: defaults.seo as unknown as Json,
        custom_css: defaults.custom_css,
        logo_settings: defaults.logo_settings as unknown as Json,
        header_settings: defaults.header_settings as unknown as Json,
        footer_settings: defaults.footer_settings as unknown as Json,
      }).then(({ error }) => {
        if (!error) qc.invalidateQueries({ queryKey: ["site-settings", siteId] });
      });
      setSettings(defaults);
    } else if (existingRow) {
      setSettings(parseSettings(existingRow as unknown as Record<string, unknown>));
    }
  }, [existingRow, isLoading, site]);

  const saveMutation = useMutation({
    mutationFn: async (s: SiteSettingsData) => {
      // Store social_display alongside social_links as a special _display key
      const socialPayload = [...s.social_links, { _display: s.social_display }] as unknown as Json;
      const { error } = await supabase.from("site_settings").update({
        colors: s.colors as unknown as Json,
        typography: s.typography as unknown as Json,
        layout: s.layout as unknown as Json,
        buttons: s.buttons as unknown as Json,
        site_identity: s.site_identity as unknown as Json,
        navigation: s.navigation as unknown as Json,
        social_links: socialPayload,
        seo: s.seo as unknown as Json,
        custom_css: s.custom_css,
        logo_settings: s.logo_settings as unknown as Json,
        header_settings: s.header_settings as unknown as Json,
        footer_settings: s.footer_settings as unknown as Json,
      }).eq("site_id", siteId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings", siteId] });
      toast({ title: "Settings saved!" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const uploadFile = async (file: File) => {
    if (!user || !siteId) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${siteId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    if (error) return null;
    return supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setter(url);
    setUploading(false);
  };

  if (isLoading || !settings) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const saveCustomDomain = async () => {
    setDomainSaving(true);
    const { error } = await supabase.from("sites").update({ custom_domain: customDomain || null } as any).eq("id", siteId!);
    setDomainSaving(false);
    if (error) {
      toast({ title: "Error saving domain", description: error.message, variant: "destructive" });
    } else {
      qc.invalidateQueries({ queryKey: ["site", siteId] });
      toast({ title: "Custom domain saved!" });
    }
  };

  const verifyDomain = async () => {
    if (!customDomain) return;
    setDomainStatus("checking");
    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(customDomain)}&type=CNAME`);
      const json = await res.json();
      setDomainStatus(json.Answer ? "ok" : "fail");
    } catch {
      setDomainStatus("fail");
    }
  };

  const downloadBackup = async () => {
    const { data: content } = await supabase.from("site_content").select("*").eq("site_id", siteId!);
    const { data: settingsData } = await supabase.from("site_settings").select("*").eq("site_id", siteId!).maybeSingle();
    const backup = {
      version: 1,
      exported_at: new Date().toISOString(),
      site_id: siteId,
      site_content: content || [],
      site_settings: settingsData || {},
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${site?.site_name || siteId}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Backup downloaded!" });
  };

  const restoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!backup.site_content || !backup.site_settings) throw new Error("Invalid backup file");

      // Restore settings
      const { version, exported_at, site_id: _sid, ...settingsToRestore } = backup.site_settings;
      await supabase.from("site_settings").update(settingsToRestore).eq("site_id", siteId!);

      // Delete existing content and re-insert
      await supabase.from("site_content").delete().eq("site_id", siteId!);
      if (backup.site_content.length > 0) {
        const rows = backup.site_content.map((row: any) => ({
          site_id: siteId!,
          section_type: row.section_type,
          data: row.data,
          order_index: row.order_index,
        }));
        await supabase.from("site_content").insert(rows);
      }

      qc.invalidateQueries({ queryKey: ["site-settings", siteId] });
      qc.invalidateQueries({ queryKey: ["site-content", siteId] });
      toast({ title: "Backup restored successfully!" });
    } catch (err: any) {
      toast({ title: "Restore failed", description: err.message, variant: "destructive" });
    }
    if (backupInputRef.current) backupInputRef.current.value = "";
  };

  const upd = <K extends keyof SiteSettingsData>(key: K, val: SiteSettingsData[K]) =>
    setSettings(prev => prev ? { ...prev, [key]: val } : prev);

  const c = settings.colors;
  const t = settings.typography;
  const l = settings.layout;
  const b = settings.buttons;
  const id = settings.site_identity;
  const nav = settings.navigation;
  const seo = settings.seo;
  const logo = settings.logo_settings;

  const isPng = (url: string) => url.toLowerCase().endsWith(".png") || url.toLowerCase().endsWith(".svg");
  const logoVisibilityWarning = logo.headerLogoUrl && c.background && !isPng(logo.headerLogoUrl);
  const effectiveHeroLogo = logo.heroLogoUseSameAsHeader ? logo.headerLogoUrl : logo.heroLogoUrl;
  const hdr = settings.header_settings;
  const ftr = settings.footer_settings;

  const logoImgStyle = (size: number): React.CSSProperties => ({
    height: size,
    objectFit: "contain" as const,
    ...(logo.addShadow ? { filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" } : {}),
    ...(logo.addWhiteBorder ? { padding: 4, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 6 } : {}),
  });

  return (
    <div className="flex min-h-screen flex-col max-w-full overflow-x-hidden">
      <header className="flex items-center justify-between border-b px-4 py-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] shrink-0" onClick={() => navigate(`/sites/${siteId}/edit`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-heading text-lg font-bold truncate">Settings — {site?.site_name || "..."}</h1>
        </div>
        <Button className="min-h-[44px] gap-2" onClick={() => saveMutation.mutate(settings)} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </header>

      <div className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full">
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 mb-6">
            {["colors", "typography", "layout", "buttons", "logo", "identity", "navigation", "social", "seo", "header", "footer", "domain", "backup"].map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize text-xs sm:text-sm">
                {tab === "logo" ? "Logo & Branding" : tab === "domain" ? "Domain" : tab === "backup" ? "Backup" : tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* TAB 1: COLORS */}
          <TabsContent value="colors" className="space-y-4">
            {(["primary", "background", "text", "heading", "cardBg"] as (keyof SiteColors)[]).map(k => (
              <div key={k} className="flex items-center gap-3">
                <input type="color" value={c[k]} onChange={e => upd("colors", { ...c, [k]: e.target.value })} className="h-10 w-14 rounded border cursor-pointer" />
                <Label className="capitalize">{k === "cardBg" ? "Card Background" : k}</Label>
              </div>
            ))}
            <div className="mt-6 rounded-lg border p-6" style={{ backgroundColor: c.background, color: c.text }}>
              <h3 style={{ color: c.heading, fontWeight: 700, fontSize: 20 }}>Preview Heading</h3>
              <p className="mt-2">This is body text on the chosen background.</p>
              <div className="mt-4 inline-block px-4 py-2 rounded font-medium" style={{ backgroundColor: c.primary, color: "#fff" }}>Button</div>
              <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: c.cardBg }}>
                <p style={{ color: c.text }}>Card content</p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: TYPOGRAPHY */}
          <TabsContent value="typography" className="space-y-4">
            <div>
              <Label>Heading Font</Label>
              <Select value={t.headingFont} onValueChange={v => upd("typography", { ...t, headingFont: v })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS_HEADING.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Body Font</Label>
              <Select value={t.bodyFont} onValueChange={v => upd("typography", { ...t, bodyFont: v })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS_BODY.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Font Scale</Label>
              <Select value={t.scale} onValueChange={v => upd("typography", { ...t, scale: v as SiteTypography["scale"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-6 rounded-lg border p-6">
              <h3 style={{ fontFamily: t.headingFont, fontSize: t.scale === "compact" ? 20 : t.scale === "relaxed" ? 28 : 24, fontWeight: 700 }}>Heading Preview</h3>
              <p style={{ fontFamily: t.bodyFont, fontSize: t.scale === "compact" ? 14 : t.scale === "relaxed" ? 18 : 16 }} className="mt-2">Body text preview with the selected font and scale.</p>
            </div>
          </TabsContent>

          {/* TAB 3: LAYOUT */}
          <TabsContent value="layout" className="space-y-4">
            <div>
              <Label>Content Width</Label>
              <Select value={l.contentWidth} onValueChange={v => upd("layout", { ...l, contentWidth: v as SiteLayout["contentWidth"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="800px">Narrow (800px)</SelectItem>
                  <SelectItem value="1200px">Standard (1200px)</SelectItem>
                  <SelectItem value="1400px">Wide (1400px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section Spacing</Label>
              <Select value={l.spacing} onValueChange={v => upd("layout", { ...l, spacing: v as SiteLayout["spacing"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Border Radius</Label>
              <Select value={l.borderRadius} onValueChange={v => upd("layout", { ...l, borderRadius: v as SiteLayout["borderRadius"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0px">Sharp (0px)</SelectItem>
                  <SelectItem value="4px">Slight (4px)</SelectItem>
                  <SelectItem value="8px">Rounded (8px)</SelectItem>
                  <SelectItem value="999px">Pill (999px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* TAB 4: BUTTONS */}
          <TabsContent value="buttons" className="space-y-4">
            <div>
              <Label>Button Style</Label>
              <Select value={b.style} onValueChange={v => upd("buttons", { ...b, style: v as SiteButtons["style"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Button Shape</Label>
              <Select value={b.shape} onValueChange={v => upd("buttons", { ...b, shape: v as SiteButtons["shape"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0px">Rectangle</SelectItem>
                  <SelectItem value="4px">Slight</SelectItem>
                  <SelectItem value="999px">Pill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-6 flex gap-4">
              <button className="px-6 py-2 font-medium transition-colors" style={{
                borderRadius: b.shape,
                ...(b.style === "filled" ? { backgroundColor: c.primary, color: "#fff" } :
                  b.style === "outline" ? { border: `2px solid ${c.primary}`, color: c.primary, background: "transparent" } :
                    { background: "transparent", color: c.primary }),
              }}>Preview Button</button>
            </div>
          </TabsContent>

          {/* TAB: LOGO & BRANDING */}
          <TabsContent value="logo" className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Header Logo</h3>
              {logo.headerLogoUrl && <img src={logo.headerLogoUrl} alt="Header logo" style={logoImgStyle(logo.headerLogoSize)} />}
              <Input type="file" accept=".png,.svg,.jpg,.jpeg,.webp" onChange={e => handleFileUpload(e, url => upd("logo_settings", { ...logo, headerLogoUrl: url }))} disabled={uploading} className="min-h-[44px]" />
              {logo.headerLogoUrl && !isPng(logo.headerLogoUrl) && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> Use a PNG or SVG for better transparency support.
                </div>
              )}
              <div>
                <Label>Logo Size: {logo.headerLogoSize}px</Label>
                <Slider min={80} max={200} step={4} value={[logo.headerLogoSize]} onValueChange={([v]) => upd("logo_settings", { ...logo, headerLogoSize: v })} className="mt-2" />
              </div>
              <div>
                <Label>Position</Label>
                <Select value={logo.headerLogoPosition} onValueChange={v => upd("logo_settings", { ...logo, headerLogoPosition: v as "left" | "center" })}>
                  <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left Aligned</SelectItem>
                    <SelectItem value="center">Centered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <hr className="border-border" />
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold">Hero Logo</h3>
              <div className="flex items-center gap-3">
                <Switch checked={logo.heroLogoEnabled} onCheckedChange={v => upd("logo_settings", { ...logo, heroLogoEnabled: v })} />
                <Label>Show large logo in hero section</Label>
              </div>
              {logo.heroLogoEnabled && (
                <>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={logo.heroLogoUseSameAsHeader} onCheckedChange={v => upd("logo_settings", { ...logo, heroLogoUseSameAsHeader: !!v })} />
                    <Label>Use same image as header logo</Label>
                  </div>
                  {!logo.heroLogoUseSameAsHeader && (
                    <>
                      {logo.heroLogoUrl && <img src={logo.heroLogoUrl} alt="Hero logo" style={logoImgStyle(logo.heroLogoSize)} />}
                      <Input type="file" accept=".png,.svg,.jpg,.jpeg,.webp" onChange={e => handleFileUpload(e, url => upd("logo_settings", { ...logo, heroLogoUrl: url }))} disabled={uploading} className="min-h-[44px]" />
                    </>
                  )}
                  <div>
                    <Label>Hero Logo Size: {logo.heroLogoSize}px</Label>
                    <Slider min={120} max={300} step={4} value={[logo.heroLogoSize]} onValueChange={([v]) => upd("logo_settings", { ...logo, heroLogoSize: v })} className="mt-2" />
                  </div>
                </>
              )}
            </div>
            <hr className="border-border" />
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold">Favicon</h3>
              {logo.faviconUrl && <img src={logo.faviconUrl} alt="Favicon" className="h-8 w-8 object-contain border rounded" />}
              <Input type="file" accept=".png,.ico,.svg" onChange={e => handleFileUpload(e, url => upd("logo_settings", { ...logo, faviconUrl: url }))} disabled={uploading} className="min-h-[44px]" />
              <p className="text-xs text-muted-foreground">Recommended: 32×32 or 64×64 square image</p>
            </div>
            <hr className="border-border" />
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold">Smart Helpers</h3>
              <div className="flex items-center gap-3">
                <Checkbox checked={logo.addShadow} onCheckedChange={v => upd("logo_settings", { ...logo, addShadow: !!v })} />
                <Label>Add subtle shadow (helps logo stand out)</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={logo.addWhiteBorder} onCheckedChange={v => upd("logo_settings", { ...logo, addWhiteBorder: !!v })} />
                <Label>Add white border (for dark logos on dark backgrounds)</Label>
              </div>
              {logoVisibilityWarning && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> Your logo may not be visible on this background. Consider using a PNG with transparency.
                </div>
              )}
            </div>
            <hr className="border-border" />
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold">Live Preview</h3>
              <div className="rounded-lg border overflow-hidden">
                <div className="px-4 py-2 border-b" style={{ backgroundColor: c.background }}>
                  <div className={`flex items-center ${logo.headerLogoPosition === "center" ? "justify-center" : "justify-start"} gap-3`}>
                    {logo.headerLogoUrl ? (
                      <img src={logo.headerLogoUrl} alt="Header" style={logoImgStyle(Math.min(logo.headerLogoSize, 48))} />
                    ) : (
                      <span style={{ color: c.heading, fontWeight: 700 }}>{id.siteTitle || site?.site_name || "Site Name"}</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground p-2 bg-muted/30">Desktop Header</p>
              </div>
              {logo.heroLogoEnabled && effectiveHeroLogo && (
                <div className="rounded-lg border overflow-hidden">
                  <div className="py-8 flex flex-col items-center gap-3" style={{ backgroundColor: c.background }}>
                    <img src={effectiveHeroLogo} alt="Hero" style={logoImgStyle(Math.min(logo.heroLogoSize, 160))} />
                    <h2 style={{ color: c.heading, fontWeight: 700, fontSize: 20 }}>Welcome</h2>
                  </div>
                  <p className="text-xs text-muted-foreground p-2 bg-muted/30">Hero Section with Logo</p>
                </div>
              )}
              <div className="rounded-lg border overflow-hidden max-w-[320px]">
                <div className="px-3 py-2 border-b" style={{ backgroundColor: c.background }}>
                  <div className={`flex items-center ${logo.headerLogoPosition === "center" ? "justify-center" : "justify-between"}`}>
                    {logo.headerLogoUrl ? (
                      <img src={logo.headerLogoUrl} alt="Mobile" style={logoImgStyle(Math.min(logo.headerLogoSize * 0.8, 36))} />
                    ) : (
                      <span style={{ color: c.heading, fontWeight: 700, fontSize: 14 }}>{id.siteTitle || site?.site_name || "Site"}</span>
                    )}
                    <span className="text-xs" style={{ color: c.text }}>☰</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground p-2 bg-muted/30">Mobile Header</p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: SITE IDENTITY */}
          <TabsContent value="identity" className="space-y-4">
            <div>
              <Label>Site Title</Label>
              <Input value={id.siteTitle} onChange={e => upd("site_identity", { ...id, siteTitle: e.target.value })} className="min-h-[44px]" />
            </div>
            <div>
              <Label>Logo</Label>
              {id.logoUrl && <img src={id.logoUrl} alt="Logo" className="h-12 mb-2 object-contain" />}
              <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, url => upd("site_identity", { ...id, logoUrl: url }))} disabled={uploading} className="min-h-[44px]" />
            </div>
            <div>
              <Label>Favicon</Label>
              {id.faviconUrl && <img src={id.faviconUrl} alt="Favicon" className="h-8 mb-2" />}
              <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, url => upd("site_identity", { ...id, faviconUrl: url }))} disabled={uploading} className="min-h-[44px]" />
            </div>
            <div>
              <Label>Footer Text</Label>
              <Input value={id.footerText} onChange={e => upd("site_identity", { ...id, footerText: e.target.value })} className="min-h-[44px]" placeholder="© 2026 My Site" />
            </div>
          </TabsContent>

          {/* TAB 6: NAVIGATION */}
          <TabsContent value="navigation" className="space-y-4">
            <div>
              <Label>Header Style</Label>
              <Select value={nav.headerStyle} onValueChange={v => upd("navigation", { ...nav, headerStyle: v as SiteNavigation["headerStyle"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="blur">Blur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Navigation Links</Label>
              <div className="space-y-2 mt-2">
                {nav.links.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={link.label} placeholder="Label" className="min-h-[44px]" onChange={e => {
                      const updated = [...nav.links];
                      updated[i] = { ...updated[i], label: e.target.value };
                      upd("navigation", { ...nav, links: updated });
                    }} />
                    <Input value={link.url} placeholder="URL" className="min-h-[44px]" onChange={e => {
                      const updated = [...nav.links];
                      updated[i] = { ...updated[i], url: e.target.value };
                      upd("navigation", { ...nav, links: updated });
                    }} />
                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-destructive shrink-0" onClick={() =>
                      upd("navigation", { ...nav, links: nav.links.filter((_, j) => j !== i) })
                    }><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" className="min-h-[44px] gap-2" onClick={() =>
                  upd("navigation", { ...nav, links: [...nav.links, { label: "", url: "" }] })
                }><Plus className="h-4 w-4" /> Add Link</Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 7: SOCIAL LINKS */}
          <TabsContent value="social" className="space-y-4">
            {settings.social_links.map((sl, i) => (
              <div key={sl.platform} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium shrink-0">{sl.platform}</span>
                <Input value={sl.url} placeholder={`https://${sl.platform.toLowerCase()}.com/...`} className="min-h-[44px] flex-1" onChange={e => {
                  const updated = [...settings.social_links];
                  updated[i] = { ...updated[i], url: e.target.value };
                  upd("social_links", updated);
                }} />
                <Switch checked={sl.visible} onCheckedChange={v => {
                  const updated = [...settings.social_links];
                  updated[i] = { ...updated[i], visible: v };
                  upd("social_links", updated);
                }} />
              </div>
            ))}
            <hr className="border-border my-4" />
            <h3 className="font-heading text-base font-semibold">Display Options</h3>
            <div className="flex items-center gap-3">
              <Switch checked={settings.social_display.showInHeader} onCheckedChange={v => upd("social_display", { ...settings.social_display, showInHeader: v })} />
              <Label>Show social icons in header</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={settings.social_display.showInFooter} onCheckedChange={v => upd("social_display", { ...settings.social_display, showInFooter: v })} />
              <Label>Show social icons in footer</Label>
            </div>
            <div>
              <Label>Icon Style</Label>
              <Select value={settings.social_display.iconStyle} onValueChange={v => upd("social_display", { ...settings.social_display, iconStyle: v as SocialDisplaySettings["iconStyle"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="text">Just text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* TAB 8: SEO & CUSTOM CSS */}
          <TabsContent value="seo" className="space-y-4">
            <div>
              <Label>Meta Title</Label>
              <Input value={seo.metaTitle} onChange={e => upd("seo", { ...seo, metaTitle: e.target.value })} className="min-h-[44px]" />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea value={seo.metaDescription} onChange={e => upd("seo", { ...seo, metaDescription: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Open Graph Image</Label>
              {seo.ogImageUrl && <img src={seo.ogImageUrl} alt="OG" className="h-20 mb-2 rounded object-cover" />}
              <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, url => upd("seo", { ...seo, ogImageUrl: url }))} disabled={uploading} className="min-h-[44px]" />
            </div>
            <div>
              <Label>Google Analytics ID</Label>
              <Input value={seo.gaId} onChange={e => upd("seo", { ...seo, gaId: e.target.value })} className="min-h-[44px]" placeholder="G-XXXXXXXXXX" />
            </div>
            <div>
              <Label>Custom CSS</Label>
              <Textarea value={settings.custom_css} onChange={e => upd("custom_css" as keyof SiteSettingsData, e.target.value as never)} rows={8} className="font-mono text-sm" placeholder=".my-class { color: red; }" />
            </div>
          </TabsContent>

          {/* TAB: HEADER SETTINGS */}
          <TabsContent value="header" className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={hdr.visible} onCheckedChange={v => upd("header_settings", { ...hdr, visible: v })} />
              <Label>Show Header</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={hdr.sticky} onCheckedChange={v => upd("header_settings", { ...hdr, sticky: v })} />
              <Label>Sticky Header</Label>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">Header background automatically uses the <strong>Card Background</strong> color from the Colors tab.</p>
            <div>
              <Label>Layout</Label>
              <Select value={hdr.layout} onValueChange={v => upd("header_settings", { ...hdr, layout: v as HeaderSettings["layout"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="logo-left">Logo left + nav right</SelectItem>
                  <SelectItem value="logo-center">Logo center + nav below</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Desktop Height</Label>
              <Select value={hdr.height} onValueChange={v => upd("header_settings", { ...hdr, height: v as HeaderSettings["height"] })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="60px">60px</SelectItem>
                  <SelectItem value="72px">72px</SelectItem>
                  <SelectItem value="80px">80px</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <hr className="border-border" />
            <h3 className="font-heading text-base font-semibold">CTA Button</h3>
            <div className="flex items-center gap-3">
              <Switch checked={hdr.ctaVisible} onCheckedChange={v => upd("header_settings", { ...hdr, ctaVisible: v })} />
              <Label>Show CTA Button</Label>
            </div>
            {hdr.ctaVisible && (
              <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                <div>
                  <Label>Button Text</Label>
                  <Input value={hdr.ctaText} onChange={e => upd("header_settings", { ...hdr, ctaText: e.target.value })} className="min-h-[44px]" placeholder="Get Started" />
                </div>
                <div>
                  <Label>Button Link</Label>
                  <Input value={hdr.ctaLink} onChange={e => upd("header_settings", { ...hdr, ctaLink: e.target.value })} className="min-h-[44px]" placeholder="https://..." />
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB: FOOTER SETTINGS */}
          <TabsContent value="footer" className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={ftr.visible} onCheckedChange={v => upd("footer_settings", { ...ftr, visible: v })} />
              <Label>Show Footer</Label>
            </div>
            <div>
              <Label>Columns</Label>
              <Select value={String(ftr.columns)} onValueChange={v => upd("footer_settings", { ...ftr, columns: Number(v) as 2 | 3 | 4 })}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={ftr.showLogo} onCheckedChange={v => upd("footer_settings", { ...ftr, showLogo: v })} />
              <Label>Show Logo in Footer</Label>
            </div>
            <div>
              <Label>Copyright Text</Label>
              <Input value={ftr.copyrightText} onChange={e => upd("footer_settings", { ...ftr, copyrightText: e.target.value })} className="min-h-[44px]" placeholder="© {year} {site name}" />
              <p className="text-xs text-muted-foreground mt-1">Use <code className="bg-muted px-1 rounded">{"{year}"}</code> and <code className="bg-muted px-1 rounded">{"{site name}"}</code> as dynamic variables.</p>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">Footer background automatically uses a dark color derived from your <strong>Primary</strong> color in the Colors tab.</p>
            <div className="flex items-center gap-3">
              <Switch checked={ftr.showBackToTop} onCheckedChange={v => upd("footer_settings", { ...ftr, showBackToTop: v })} />
              <Label>Show "Back to Top" Button</Label>
            </div>
          </TabsContent>

          {/* TAB: CUSTOM DOMAIN */}
          <TabsContent value="domain" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-bold">Custom Domain Setup</h2>
              <p className="text-sm text-muted-foreground">
                Your current site URL: <span className="font-mono font-medium text-foreground">{site?.subdomain}.vercel.app</span>
              </p>
            </div>

            <hr className="border-border" />

            <div className="space-y-4">
              <h3 className="font-heading text-base font-semibold">How to add your own domain (free on Vercel)</h3>

              <div className="rounded-lg border bg-muted/30 p-4 space-y-4 text-sm">
                <div className="space-y-1">
                  <p className="font-semibold">Step 1:</p>
                  <p className="text-muted-foreground">Go to your Vercel dashboard</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Step 2:</p>
                  <p className="text-muted-foreground">Find your project (name matches your site)</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Step 3:</p>
                  <p className="text-muted-foreground">Go to Settings → Domains → Add Domain</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Step 4:</p>
                  <p className="text-muted-foreground">Enter: <span className="font-mono">www.yourdomain.com</span></p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Step 5:</p>
                  <p className="text-muted-foreground">Copy the DNS records Vercel shows you</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Step 6:</p>
                  <p className="text-muted-foreground">At your domain registrar, add:</p>
                  <div className="rounded border bg-background p-3 font-mono text-xs space-y-1 ml-4">
                    <p>CNAME record: www → cname.vercel-dns.com</p>
                    <p>A record: @ → 76.76.21.21</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Important for login to keep working
              </h3>
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2 text-sm">
                <p>After your domain is added, update your backend auth settings:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Go to <strong>app.supabase.com → Authentication → URL Configuration</strong></li>
                  <li>Add your domain to <strong>"Site URL"</strong> and <strong>"Redirect URLs"</strong></li>
                </ul>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold">Free Tier Info</h3>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Vercel:</strong> Custom domains are FREE</p>
                <p>• <strong>Supabase:</strong> 500MB database, 50k users FREE</p>
                <p>• Most sites never need to upgrade</p>
              </div>
            </div>
          </TabsContent>

          {/* TAB: BACKUP & RESTORE */}
          <TabsContent value="backup" className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" /> Download Backup
              </h3>
              <p className="text-sm text-muted-foreground">
                Export all your site content and settings as a JSON file. Use this to keep a safe copy of your work.
              </p>
              <Button className="min-h-[44px] gap-2" onClick={downloadBackup}>
                <Download className="h-4 w-4" /> Download Backup
              </Button>
            </div>
            <hr className="border-border" />
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" /> Restore from Backup
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload a previously downloaded backup file to restore your site's content and settings.
              </p>
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Restoring will <strong>overwrite</strong> all current content and settings. This cannot be undone.</span>
              </div>
              <input type="file" ref={backupInputRef} accept=".json" className="hidden" onChange={restoreBackup} />
              <Button variant="outline" className="min-h-[44px] gap-2" onClick={() => backupInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Upload & Restore
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
