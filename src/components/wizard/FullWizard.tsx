import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Plus, Trash2, Eye, Upload, AlertTriangle, CheckCircle, Image, Facebook, Instagram, Youtube, Wifi, Monitor, Palette, Type } from "lucide-react";

// 🎨 PROFESSIONAL COLOR PALETTES
const COLOR_PRESETS = [
  {
    name: "Ocean Breeze",
    primary: "#0EA5E9",
    background: "#FFFFFF",
    text: "#1E293B",
    accent: "#F59E0B",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
  },
  {
    name: "Tropical Sunset",
    primary: "#F97316",
    background: "#FFFBEB",
    text: "#1C1917",
    accent: "#EC4899",
    gradient: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
  },
  {
    name: "Forest Retreat",
    primary: "#059669",
    background: "#F0FDF4",
    text: "#14532D",
    accent: "#84CC16",
    gradient: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
  },
  {
    name: "Luxury Gold",
    primary: "#1E1B4B",
    background: "#FEFCE8",
    text: "#1C1917",
    accent: "#D97706",
    gradient: "linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)",
  },
  {
    name: "Minimal Modern",
    primary: "#18181B",
    background: "#FAFAFA",
    text: "#18181B",
    accent: "#71717A",
    gradient: "linear-gradient(135deg, #18181B 0%, #52525B 100%)",
  },
  {
    name: "Beach Vibes",
    primary: "#06B6D4",
    background: "#F0F9FF",
    text: "#0C4A6E",
    accent: "#FBBF24",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
  },
];

// 📐 TYPOGRAPHY PRESETS
const TYPOGRAPHY_PRESETS = [
  {
    name: "Modern Clean",
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Inter', sans-serif",
    scale: "comfortable",
  },
  {
    name: "Elegant Classic",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Lato', sans-serif",
    scale: "comfortable",
  },
  {
    name: "Bold Impact",
    headingFont: "'Montserrat', sans-serif",
    bodyFont: "'Open Sans', sans-serif",
    scale: "spacious",
  },
  {
    name: "Minimal Refined",
    headingFont: "'DM Sans', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    scale: "compact",
  },
];

export function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const editId = searchParams.get("edit");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroLogoInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(!!editId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeColorPreset, setActiveColorPreset] = useState<number | null>(null);
  const [activeTypographyPreset, setActiveTypographyPreset] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<any>({
    identity: { resortName: "", location: "" },
    brandStory: { tagline: "", shortDescription: "", fullDescription: "" },
    amenities: [],
    roomTypes: [],
    location: { fullAddress: "", contactEmail: "", phone: "", whatsapp: "", googleMapsLink: "" },
    faq: [],
    media: { heroImages: [], videoUrl: "", galleryImages: [] },
    colorPalette: COLOR_PRESETS[0],
    typography: TYPOGRAPHY_PRESETS[0],
    socialMedia: {
      facebook: "",
      instagram: "",
      tiktok: "",
      youtube: "",
      whatsapp: "",
      showInHeader: true,
      showInFooter: true,
    },
    header: {
      showLogo: true,
      logoUrl: "",
      logoSize: 120,
      logoPosition: "left",
      showNavigation: true,
      navigationLinks: [{ label: "Home", url: "#home" }, { label: "About", url: "#about" }, { label: "Rooms", url: "#rooms" }, { label: "Contact", url: "#contact" }],
      sticky: true,
      transparent: true,
    },
    footer: {
      copyrightText: "",
      showSocialIcons: true,
      showContactInfo: true,
      showNavigation: true,
      columns: 3,
    },
    hero: {
      showLogo: true,
      heroLogoUrl: "",
      heroLogoSize: 180,
      useSameAsHeader: true,
    },
  });

  useEffect(() => {
    if (!editId) {
      setLoading(false);
      return;
    }

    const fetchResortData = async () => {
      try {
        const { data: submission, error } = await supabase
          .from("resort_submissions")
          .select("*")
          .eq("id", editId)
          .single();

        if (error) throw error;

        if (submission && submission.data) {
          setFormData({
            ...formData,
            ...submission.data,
            socialMedia: { ...formData.socialMedia, ...submission.data.socialMedia },
            header: { ...formData.header, ...submission.data.header },
            footer: { ...formData.footer, ...submission.data.footer },
            hero: { ...formData.hero, ...submission.data.hero },
            colorPalette: submission.data.colorPalette || formData.colorPalette,
            typography: submission.data.typography || formData.typography,
          });
        }
      } catch (err: any) {
        console.error("Handshake Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResortData();
  }, [editId]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        data: formData,
        updated_at: new Date().toISOString(),
      };

      if (editId) {
        const { error } = await supabase
          .from("resort_submissions")
          .update(payload)
          .eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("resort_submissions")
          .insert([payload]);
        if (error) throw error;
      }

      toast({ title: "Success", description: "Resort saved." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (editId) {
      navigate(`/resort/${editId}`);
    } else {
      toast({ title: "Save First", description: "Please save the resort before previewing." });
    }
  };

  const updateNested = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const applyColorPreset = (preset: any, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      colorPalette: preset,
    }));
    setActiveColorPreset(index);
    toast({ title: "Color scheme applied!", description: preset.name });
  };

  const applyTypographyPreset = (preset: any, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      typography: preset,
    }));
    setActiveTypographyPreset(index);
    toast({ title: "Typography applied!", description: preset.name });
  };

  const updateSocial = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [field]: value },
    }));
  };

  const updateHeader = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      header: { ...prev.header, [field]: value },
    }));
  };

  const updateFooter = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      footer: { ...prev.footer, [field]: value },
    }));
  };

  const updateHero = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const uploadLogo = async (file: File, type: "header" | "hero") => {
    if (!editId) {
      toast({ variant: "destructive", title: "Save First", description: "Please save the resort before uploading images." });
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-logo-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${editId}/logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("resort-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("resort-assets")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleHeaderLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please upload an image file (PNG, JPG, SVG, WebP)" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File Too Large", description: "Logo must be less than 5MB" });
      return;
    }
    const url = await uploadLogo(file, "header");
    if (url) {
      updateHeader("logoUrl", url);
      toast({ title: "Logo uploaded!", description: "Header logo saved." });
    }
  };

  const handleHeroLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please upload an image file (PNG, JPG, SVG, WebP)" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File Too Large", description: "Logo must be less than 5MB" });
      return;
    }
    const url = await uploadLogo(file, "hero");
    if (url) {
      updateHero("heroLogoUrl", url);
      toast({ title: "Logo uploaded!", description: "Hero logo saved." });
    }
  };

  const isJpg = (url: string) => url.toLowerCase().endsWith(".jpg") || url.toLowerCase().endsWith(".jpeg");
  const isPng = (url: string) => url.toLowerCase().endsWith(".png");

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{editId ? "Edit Resort" : "New Resort"}</h1>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
          {editId && (
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editId ? "Update" : "Save")}
          </Button>
        </div>
      </header>

      {/* 🎨 COLOR PALETTE PRESETS */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" /> Color Scheme
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Choose a professional color palette for your website</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {COLOR_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyColorPreset(preset, index)}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeColorPreset === index ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex gap-1 mb-3">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.background }} />
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.text }} />
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.accent }} />
              </div>
              <p className="font-medium text-sm">{preset.name}</p>
              <div
                className="h-2 rounded-full mt-2"
                style={{ background: preset.gradient }}
              />
            </button>
          ))}
        </div>
        
        {/* Custom Color Pickers */}
        <div className="mt-6 pt-6 border-t">
          <Label className="text-sm font-medium mb-3 block">Or Customize Colors</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Primary</Label>
              <Input
                type="color"
                value={formData.colorPalette?.primary || "#0EA5E9"}
                onChange={(e) => {
                  setFormData({ ...formData, colorPalette: { ...formData.colorPalette, primary: e.target.value } });
                  setActiveColorPreset(null);
                }}
                className="h-10 w-full"
              />
            </div>
            <div>
              <Label className="text-xs">Background</Label>
              <Input
                type="color"
                value={formData.colorPalette?.background || "#FFFFFF"}
                onChange={(e) => {
                  setFormData({ ...formData, colorPalette: { ...formData.colorPalette, background: e.target.value } });
                  setActiveColorPreset(null);
                }}
                className="h-10 w-full"
              />
            </div>
            <div>
              <Label className="text-xs">Text</Label>
              <Input
                type="color"
                value={formData.colorPalette?.text || "#1E293B"}
                onChange={(e) => {
                  setFormData({ ...formData, colorPalette: { ...formData.colorPalette, text: e.target.value } });
                  setActiveColorPreset(null);
                }}
                className="h-10 w-full"
              />
            </div>
            <div>
              <Label className="text-xs">Accent</Label>
              <Input
                type="color"
                value={formData.colorPalette?.accent || "#F59E0B"}
                onChange={(e) => {
                  setFormData({ ...formData, colorPalette: { ...formData.colorPalette, accent: e.target.value } });
                  setActiveColorPreset(null);
                }}
                className="h-10 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 📐 TYPOGRAPHY PRESETS */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Type className="h-5 w-5" /> Typography
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Choose professional font pairings</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TYPOGRAPHY_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyTypographyPreset(preset, index)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                activeTypographyPreset === index ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
              }`}
            >
              <p className="font-semibold mb-2">{preset.name}</p>
              <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: preset.headingFont }}>
                Heading: {preset.headingFont.split("'")[1] || preset.headingFont}
              </p>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: preset.bodyFont }}>
                Body: {preset.bodyFont.split("'")[1] || preset.bodyFont}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-blue-600" /> Logo Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">✅ Recommended Format</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• PNG with transparency (best for headers)</li>
              <li>• SVG (scalable, crisp at any size)</li>
              <li>• WebP (modern, small file size)</li>
              <li>• Max file size: 5MB</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">⚠️ Avoid These</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• JPG with white background (won't blend)</li>
              <li>• Low resolution (will look pixelated)</li>
              <li>• Too much detail (hard to read when small)</li>
              <li>• Text too small (won't be readable on mobile)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <Label>Resort Name</Label>
            <Input value={formData.identity?.resortName || ""} onChange={(e) => updateNested("identity", "resortName", e.target.value)} placeholder="Enter resort name" />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={formData.identity?.location || ""} onChange={(e) => updateNested("identity", "location", e.target.value)} placeholder="e.g. Palawan, Philippines" />
          </div>
        </div>
      </div>

      {/* Header Logo */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Image className="h-5 w-5" /> Header Logo</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch checked={formData.header?.showLogo || false} onCheckedChange={(v) => updateHeader("showLogo", v)} />
            <Label>Show Logo in Header</Label>
          </div>
          {formData.header?.showLogo && (
            <>
              <div>
                <Label>Upload Logo</Label>
                <div className="mt-2 flex gap-4 items-start">
                  <Button variant="outline" onClick={() => logoInputRef.current?.click()} disabled={uploading || !editId} className="gap-2">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Choose File"}
                  </Button>
                  <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleHeaderLogoUpload} />
                  {!editId && <p className="text-sm text-muted-foreground">Save resort first to upload images</p>}
                </div>
              </div>
              {formData.header?.logoUrl && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Current Logo</Label>
                    <Button variant="ghost" size="sm" onClick={() => updateHeader("logoUrl", "")} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex gap-4 items-center">
                    <img src={formData.header.logoUrl} alt="Header logo" style={{ height: formData.header.logoSize || 120, objectFit: "contain" }} className="border rounded bg-white p-2" />
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label>Logo Size: {formData.header.logoSize}px</Label>
                        <Slider min={60} max={200} step={10} value={[formData.header.logoSize || 120]} onValueChange={([v]) => updateHeader("logoSize", v)} className="mt-2" />
                      </div>
                      {isJpg(formData.header.logoUrl) && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>JPG format detected. Consider using PNG with transparency for better results.</span>
                        </div>
                      )}
                      {isPng(formData.header.logoUrl) && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-2">
                          <CheckCircle className="h-4 w-4 shrink-0" />
                          <span>PNG format - Great for transparency!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <Label>Logo Position</Label>
                <Select value={formData.header?.logoPosition || "left"} onValueChange={(v) => updateHeader("logoPosition", v)}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left Aligned</SelectItem>
                    <SelectItem value="center">Centered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hero Section Logo */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Image className="h-5 w-5" /> Hero Section Logo</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch checked={formData.hero?.showLogo || false} onCheckedChange={(v) => updateHero("showLogo", v)} />
            <Label>Show Large Logo in Hero Section</Label>
          </div>
          {formData.hero?.showLogo && (
            <>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Switch checked={formData.hero?.useSameAsHeader || false} onCheckedChange={(v) => updateHero("useSameAsHeader", v)} />
                <div>
                  <Label className="font-medium">Use Same Logo as Header</Label>
                  <p className="text-sm text-muted-foreground">Enable to use the header logo, or disable to upload a different one</p>
                </div>
              </div>
              {!formData.hero?.useSameAsHeader && (
                <div>
                  <Label>Upload Hero Logo</Label>
                  <div className="mt-2 flex gap-4 items-start">
                    <Button variant="outline" onClick={() => heroLogoInputRef.current?.click()} disabled={uploading || !editId} className="gap-2">
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Choose File"}
                    </Button>
                    <input ref={heroLogoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleHeroLogoUpload} />
                  </div>
                </div>
              )}
              {(formData.hero?.heroLogoUrl || (formData.hero?.useSameAsHeader && formData.header?.logoUrl)) && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Current Hero Logo</Label>
                    {!formData.hero?.useSameAsHeader && (
                      <Button variant="ghost" size="sm" onClick={() => updateHero("heroLogoUrl", "")} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <img src={formData.hero?.useSameAsHeader ? formData.header?.logoUrl : formData.hero?.heroLogoUrl} alt="Hero logo" style={{ height: formData.hero.heroLogoSize || 180, objectFit: "contain" }} className="border rounded bg-white p-4" />
                    <div className="w-full space-y-2">
                      <div>
                        <Label>Hero Logo Size: {formData.hero.heroLogoSize}px</Label>
                        <Slider min={100} max={400} step={20} value={[formData.hero.heroLogoSize || 180]} onValueChange={([v]) => updateHero("heroLogoSize", v)} className="mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Brand Story */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Brand Story</h2>
        <div className="space-y-4">
          <div>
            <Label>Tagline</Label>
            <Input value={formData.brandStory?.tagline || ""} onChange={(e) => updateNested("brandStory", "tagline", e.target.value)} placeholder="Short catchy tagline" />
          </div>
          <div>
            <Label>Short Description</Label>
            <Textarea rows={3} value={formData.brandStory?.shortDescription || ""} onChange={(e) => updateNested("brandStory", "shortDescription", e.target.value)} placeholder="Brief description" />
          </div>
          <div>
            <Label>Full Description</Label>
            <Textarea rows={5} value={formData.brandStory?.fullDescription || ""} onChange={(e) => updateNested("brandStory", "fullDescription", e.target.value)} placeholder="Detailed description about your resort" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Facebook className="h-5 w-5" /> Social Media Links</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Facebook URL</Label>
              <Input value={formData.socialMedia?.facebook || ""} onChange={(e) => updateSocial("facebook", e.target.value)} placeholder="https://facebook.com/yourpage" />
            </div>
            <div>
              <Label>Instagram URL</Label>
              <Input value={formData.socialMedia?.instagram || ""} onChange={(e) => updateSocial("instagram", e.target.value)} placeholder="https://instagram.com/yourpage" />
            </div>
            <div>
              <Label>TikTok URL</Label>
              <Input value={formData.socialMedia?.tiktok || ""} onChange={(e) => updateSocial("tiktok", e.target.value)} placeholder="https://tiktok.com/@yourpage" />
            </div>
            <div>
              <Label>YouTube URL</Label>
              <Input value={formData.socialMedia?.youtube || ""} onChange={(e) => updateSocial("youtube", e.target.value)} placeholder="https://youtube.com/@yourchannel" />
            </div>
          </div>
          <div>
            <Label>WhatsApp Number</Label>
            <Input value={formData.socialMedia?.whatsapp || ""} onChange={(e) => updateSocial("whatsapp", e.target.value)} placeholder="+63 xxx xxx xxxx" />
          </div>
          <div className="flex gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Switch checked={formData.socialMedia?.showInHeader || false} onCheckedChange={(v) => updateSocial("showInHeader", v)} />
              <Label>Show in Header</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.socialMedia?.showInFooter || false} onCheckedChange={(v) => updateSocial("showInFooter", v)} />
              <Label>Show in Footer</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Header Settings */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Monitor className="h-5 w-5" /> Header Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch checked={formData.header?.sticky || false} onCheckedChange={(v) => updateHeader("sticky", v)} />
            <Label>Sticky Header (stays on scroll)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={formData.header?.transparent || false} onCheckedChange={(v) => updateHeader("transparent", v)} />
            <Label>Transparent Header (over hero image)</Label>
          </div>
          <div>
            <Label>Navigation Links</Label>
            <div className="space-y-2 mt-2">
              {formData.header?.navigationLinks?.map((link: any, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input value={link.label} onChange={(e) => { const newLinks = [...formData.header.navigationLinks]; newLinks[i] = { ...newLinks[i], label: e.target.value }; updateHeader("navigationLinks", newLinks); }} placeholder="Label" className="flex-1" />
                  <Input value={link.url} onChange={(e) => { const newLinks = [...formData.header.navigationLinks]; newLinks[i] = { ...newLinks[i], url: e.target.value }; updateHeader("navigationLinks", newLinks); }} placeholder="#section" className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => { const newLinks = formData.header.navigationLinks.filter((_: any, idx: number) => idx !== i); updateHeader("navigationLinks", newLinks); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => { updateHeader("navigationLinks", [...(formData.header.navigationLinks || []), { label: "", url: "" }]); }}><Plus className="h-4 w-4 mr-2" /> Add Link</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Wifi className="h-5 w-5" /> Footer Settings</h2>
        <div className="space-y-4">
          <div>
            <Label>Copyright Text</Label>
            <Input value={formData.footer?.copyrightText || ""} onChange={(e) => updateFooter("copyrightText", e.target.value)} placeholder="© 2025 My Resort. All rights reserved." />
          </div>
          <div>
            <Label>Footer Columns</Label>
            <Select value={String(formData.footer?.columns || 3)} onValueChange={(v) => updateFooter("columns", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={formData.footer?.showSocialIcons || false} onCheckedChange={(v) => updateFooter("showSocialIcons", v)} />
            <Label>Show Social Icons in Footer</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={formData.footer?.showContactInfo || false} onCheckedChange={(v) => updateFooter("showContactInfo", v)} />
            <Label>Show Contact Info in Footer</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={formData.footer?.showNavigation || false} onCheckedChange={(v) => updateFooter("showNavigation", v)} />
            <Label>Show Navigation Links in Footer</Label>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Amenities</h2>
        <div className="space-y-2">
          {(formData.amenities || []).map((amenity: string, i: number) => (
            <div key={i} className="flex gap-2">
              <Input value={amenity} onChange={(e) => { const newAmenities = [...(formData.amenities || [])]; newAmenities[i] = e.target.value; setFormData({ ...formData, amenities: newAmenities }); }} placeholder="Amenity name" />
              <Button variant="destructive" size="icon" onClick={() => { const newAmenities = (formData.amenities || []).filter((_: any, idx: number) => idx !== i); setFormData({ ...formData, amenities: newAmenities }); }}><X className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => { setFormData({ ...formData, amenities: [...(formData.amenities || []), ""] }); }}><Plus className="h-4 w-4 mr-2" /> Add Amenity</Button>
        </div>
      </div>

      {/* Room Types */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Room Types</h2>
        <div className="space-y-4">
          {(formData.roomTypes || []).map((room: any, i: number) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Room {i + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => { const newRooms = (formData.roomTypes || []).filter((_: any, idx: number) => idx !== i); setFormData({ ...formData, roomTypes: newRooms }); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <Input value={room.name || ""} onChange={(e) => { const newRooms = [...(formData.roomTypes || [])]; newRooms[i] = { ...newRooms[i], name: e.target.value }; setFormData({ ...formData, roomTypes: newRooms }); }} placeholder="Room name" />
              <Input value={room.price || ""} onChange={(e) => { const newRooms = [...(formData.roomTypes || [])]; newRooms[i] = { ...newRooms[i], price: e.target.value }; setFormData({ ...formData, roomTypes: newRooms }); }} placeholder="Price per night" />
              <Input value={room.description || ""} onChange={(e) => { const newRooms = [...(formData.roomTypes || [])]; newRooms[i] = { ...newRooms[i], description: e.target.value }; setFormData({ ...formData, roomTypes: newRooms }); }} placeholder="Description" />
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => { setFormData({ ...formData, roomTypes: [...(formData.roomTypes || []), { name: "", price: "", description: "" }] }); }}><Plus className="h-4 w-4 mr-2" /> Add Room Type</Button>
        </div>
      </div>

      {/* Location & Contact */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
        <div className="space-y-4">
          <div>
            <Label>Full Address</Label>
            <Input value={formData.location?.fullAddress || ""} onChange={(e) => updateNested("location", "fullAddress", e.target.value)} placeholder="Complete address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={formData.location?.contactEmail || ""} onChange={(e) => updateNested("location", "contactEmail", e.target.value)} placeholder="contact@resort.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.location?.phone || ""} onChange={(e) => updateNested("location", "phone", e.target.value)} placeholder="+63 xxx xxx xxxx" />
            </div>
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={formData.location?.whatsapp || ""} onChange={(e) => updateNested("location", "whatsapp", e.target.value)} placeholder="WhatsApp number" />
          </div>
          <div>
            <Label>Google Maps Link</Label>
            <Input value={formData.location?.googleMapsLink || ""} onChange={(e) => updateNested("location", "googleMapsLink", e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">FAQ</h2>
        <div className="space-y-4">
          {(formData.faq || []).map((item: any, i: number) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Q&A {i + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => { const newFaq = (formData.faq || []).filter((_: any, idx: number) => idx !== i); setFormData({ ...formData, faq: newFaq }); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <Input value={item.question || ""} onChange={(e) => { const newFaq = [...(formData.faq || [])]; newFaq[i] = { ...newFaq[i], question: e.target.value }; setFormData({ ...formData, faq: newFaq }); }} placeholder="Question" />
              <Textarea rows={3} value={item.answer || ""} onChange={(e) => { const newFaq = [...(formData.faq || [])]; newFaq[i] = { ...newFaq[i], answer: e.target.value }; setFormData({ ...formData, faq: newFaq }); }} placeholder="Answer" />
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => { setFormData({ ...formData, faq: [...(formData.faq || []), { question: "", answer: "" }] }); }}><Plus className="h-4 w-4 mr-2" /> Add FAQ</Button>
        </div>
      </div>

      {/* Media */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Media</h2>
        <div className="space-y-4">
          <div>
            <Label>Hero Image URL</Label>
            <Input value={formData.media?.heroImages?.[0] || ""} onChange={(e) => setFormData({ ...formData, media: { ...formData.media, heroImages: [e.target.value, ...(formData.media?.heroImages?.slice(1) || [])] } })} placeholder="https://example.com/hero.jpg" />
          </div>
          <div>
            <Label>Video URL (YouTube/Vimeo)</Label>
            <Input value={formData.media?.videoUrl || ""} onChange={(e) => setFormData({ ...formData, media: { ...formData.media, videoUrl: e.target.value } })} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <Label>Gallery Images (one URL per line)</Label>
            <Textarea rows={4} value={(formData.media?.galleryImages || []).join("\n")} onChange={(e) => setFormData({ ...formData, media: { ...formData.media, galleryImages: e.target.value.split("\n").filter(url => url.trim()) } })} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
          </div>
        </div>
      </div>
    </div>
  );
}
