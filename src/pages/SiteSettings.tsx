import { useState, useEffect } from "react";
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
import { ArrowLeft, Save, Loader2, Plus, Trash2, AlertTriangle, ImageIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import type { Json } from "@/integrations/supabase/types";
import {
  type SiteSettingsData, type SiteColors, type SiteTypography, type SiteLayout,
  type SiteButtons, type SiteIdentity, type SiteNavigation, type SocialLink, type SiteSeo, type NavLink,
  type LogoSettings,
  getTemplateDefaults, FONT_OPTIONS_HEADING, FONT_OPTIONS_BODY,
} from "@/types/settings";

function parseSettings(row: Record<string, unknown>): SiteSettingsData {
  const d = getTemplateDefaults("business");
  return {
    colors: { ...d.colors, ...(row.colors as SiteColors || {}) },
    typography: { ...d.typography, ...(row.typography as SiteTypography || {}) },
    layout: { ...d.layout, ...(row.layout as SiteLayout || {}) },
    buttons: { ...d.buttons, ...(row.buttons as SiteButtons || {}) },
    site_identity: { ...d.site_identity, ...(row.site_identity as SiteIdentity || {}) },
    navigation: { ...d.navigation, ...(row.navigation as SiteNavigation || {}) },
    social_links: Array.isArray(row.social_links) ? (row.social_links as SocialLink[]) : d.social_links,
    seo: { ...d.seo, ...(row.seo as SiteSeo || {}) },
    custom_css: (row.custom_css as string) || "",
    logo_settings: { ...d.logo_settings, ...(row.logo_settings as LogoSettings || {}) },
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

  const { data: site } = useQuery({
    queryKey: ["site", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").eq("id", siteId!).single();
      if (error) throw error;
      return data;
    },
  });

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
      const { error } = await supabase.from("site_settings").update({
        colors: s.colors as unknown as Json,
        typography: s.typography as unknown as Json,
        layout: s.layout as unknown as Json,
        buttons: s.buttons as unknown as Json,
        site_identity: s.site_identity as unknown as Json,
        navigation: s.navigation as unknown as Json,
        social_links: s.social_links as unknown as Json,
        seo: s.seo as unknown as Json,
        custom_css: s.custom_css,
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

  const upd = <K extends keyof SiteSettingsData>(key: K, val: SiteSettingsData[K]) =>
    setSettings(prev => prev ? { ...prev, [key]: val } : prev);

  const c = settings.colors;
  const t = settings.typography;
  const l = settings.layout;
  const b = settings.buttons;
  const id = settings.site_identity;
  const nav = settings.navigation;
  const seo = settings.seo;

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
            {["colors", "typography", "layout", "buttons", "identity", "navigation", "social", "seo"].map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize text-xs sm:text-sm">{tab}</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}
