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
import { Loader2, X, Plus, Trash2, Eye, Upload, AlertTriangle, CheckCircle, Image, Facebook, Instagram, Youtube, Wifi, Monitor, Palette, Type, Star, Zap } from "lucide-react";
import { DomainStep } from './DomainStep';

const COLOR_PRESETS = [
  { name: "Ocean Breeze", primary: "#0EA5E9", background: "#FFFFFF", text: "#1E293B", accent: "#F59E0B", gradient: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)" },
  { name: "Tropical Sunset", primary: "#F97316", background: "#FFFBEB", text: "#1C1917", accent: "#EC4899", gradient: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)" },
  { name: "Forest Retreat", primary: "#059669", background: "#F0FDF4", text: "#14532D", accent: "#84CC16", gradient: "linear-gradient(135deg, #059669 0%, #10B981 100%)" },
  { name: "Luxury Gold", primary: "#1E1B4B", background: "#FEFCE8", text: "#1C1917", accent: "#D97706", gradient: "linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)" },
  { name: "Minimal Modern", primary: "#18181B", background: "#FAFAFA", text: "#18181B", accent: "#71717A", gradient: "linear-gradient(135deg, #18181B 0%, #52525B 100%)" },
  { name: "Beach Vibes", primary: "#06B6D4", background: "#F0F9FF", text: "#0C4A6E", accent: "#FBBF24", gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)" },
];

const TYPOGRAPHY_PRESETS = [
  { name: "Modern Clean", headingFont: "'Space Grotesk', sans-serif", bodyFont: "'Inter', sans-serif", scale: "comfortable" },
  { name: "Elegant Classic", headingFont: "'Playfair Display', serif", bodyFont: "'Lato', sans-serif", scale: "comfortable" },
  { name: "Bold Impact", headingFont: "'Montserrat', sans-serif", bodyFont: "'Open Sans', sans-serif", scale: "spacious" },
  { name: "Minimal Refined", headingFont: "'DM Sans', sans-serif", bodyFont: "'DM Sans', sans-serif", scale: "compact" },
];

export function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const editId = searchParams.get("edit");

  // ── Upload refs — one per upload target ──
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroLogoInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null); // ← FIX: proper ref instead of createElement

  const [loading, setLoading] = useState(!!editId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeColorPreset, setActiveColorPreset] = useState<number | null>(null);
  const [activeTypographyPreset, setActiveTypographyPreset] = useState<number | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(editId);

  const [formData, setFormData] = useState<any>({
    identity: { resortName: "", location: "" },
    brandStory: { tagline: "", shortDescription: "", fullDescription: "" },
    amenities: [],
    roomTypes: [],
    location: { fullAddress: "", contactEmail: "", phone: "", whatsapp: "", googleMapsLink: "" },
    faq: [],
    testimonials: [],
    features: [],
    media: { heroImages: [], heroImage: "", videoUrl: "", galleryImages: [] },
    colorPalette: COLOR_PRESETS[0],
    typography: TYPOGRAPHY_PRESETS[0],
    socialMedia: { facebook: "", instagram: "", tiktok: "", youtube: "", whatsapp: "", showInHeader: true, showInFooter: true },
    header: {
      showLogo: true, logoUrl: "", logoSize: 120, logoPosition: "left",
      showNavigation: true,
      navigationLinks: [
        { label: "Home", url: "#home" }, { label: "About", url: "#about" },
        { label: "Rooms", url: "#rooms" }, { label: "Contact", url: "#contact" },
      ],
      sticky: true, transparent: true,
    },
    footer: { copyrightText: "", showSocialIcons: true, showContactInfo: true, showNavigation: true, columns: 3 },
    booking: { system: "", url: "", embedCode: "", sectionTitle: "Book Your Stay", sectionSubtitle: "" },
    hero: { showLogo: true, heroLogoUrl: "", heroLogoSize: 180, useSameAsHeader: true },
    domain: { purchaseDomain: false, customDomain: '' },
  });

  useEffect(() => {
    if (!editId) { setLoading(false); return; }
    const fetchData = async () => {
      try {
        const { data: submission, error } = await supabase.from("resort_submissions").select("*").eq("id", editId).single();
        if (error) throw error;
        if (submission?.data) {
          setFormData((prev: any) => ({
            ...prev, ...submission.data,
            socialMedia: { ...prev.socialMedia, ...submission.data.socialMedia },
            header: { ...prev.header, ...submission.data.header },
            footer: { ...prev.footer, ...submission.data.footer },
            hero: { ...prev.hero, ...submission.data.hero },
            colorPalette: submission.data.colorPalette || prev.colorPalette,
            typography: submission.data.typography || prev.typography,
        domain: submission.data.domain || prev.domain,
            testimonials: submission.data.testimonials || [],
            features: submission.data.features || [],
            booking: submission.data.booking || prev.booking,
          }));
        }
      } catch (err: any) {
        toast({ variant: "destructive", title: "Load failed", description: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [editId]);

  // ── Auto-save to get an ID before uploading ──
  const ensureId = async (): Promise<string | null> => {
    if (currentId) return currentId;
    try {
      const { data, error } = await supabase
        .from("resort_submissions")
        .insert([{ data: formData, updated_at: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      setCurrentId(data.id);
      // Update URL without reload
      window.history.replaceState(null, "", `/wizard?edit=${data.id}`);
      return data.id;
    } catch (err: any) {
      toast({ variant: "destructive", title: "Auto-save failed", description: err.message });
      return null;
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const id = await ensureId();
      if (!id) return;
      const { error } = await supabase
        .from("resort_submissions")
        .update({ data: formData, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Saved!", description: "Your business site has been saved." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (currentId) navigate(`/site/${currentId}`);
    else toast({ title: "Save first", description: "Please save before previewing." });
  };

  const updateNested = (section: string, field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  const updateSocial = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, socialMedia: { ...prev.socialMedia, [field]: value } }));
  const updateHeader = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, header: { ...prev.header, [field]: value } }));
  const updateFooter = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
  const updateHero = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  const applyColorPreset = (preset: any, index: number) => {
    setFormData((prev: any) => ({ ...prev, colorPalette: preset }));
    setActiveColorPreset(index);
  };
  const applyTypographyPreset = (preset: any, index: number) => {
    setFormData((prev: any) => ({ ...prev, typography: preset }));
    setActiveTypographyPreset(index);
  };

  // ── Core upload function ──
  const uploadImage = async (file: File, folder: string, id: string): Promise<string | null> => {
    setUploading(folder);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${id}/${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("resort-assets").upload(filePath, file);
      if (error) throw error;
      return supabase.storage.from("resort-assets").getPublicUrl(filePath).data.publicUrl;
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
      return null;
    } finally {
      setUploading(null);
    }
  };

  // ── Logo upload ──
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "header" | "hero") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ variant: "destructive", title: "Not an image" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ variant: "destructive", title: "File too large", description: "Max 5MB" }); return; }
    const id = await ensureId();
    if (!id) return;
    const url = await uploadImage(file, "logos", id);
    if (url) {
      if (type === "header") updateHeader("logoUrl", url);
      else updateHero("heroLogoUrl", url);
      toast({ title: "Logo uploaded!" });
    }
    e.target.value = ""; // reset so same file can be re-selected
  };

  // ── Hero image upload ──
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ variant: "destructive", title: "Not an image" }); return; }
    if (file.size > 10 * 1024 * 1024) { toast({ variant: "destructive", title: "File too large", description: "Max 10MB" }); return; }
    const id = await ensureId();
    if (!id) return;
    const url = await uploadImage(file, "hero", id);
    if (url) {
      setFormData((prev: any) => ({
        ...prev,
        media: { ...prev.media, heroImage: url, heroImages: [url, ...(prev.media?.heroImages?.slice(1) || [])] },
      }));
      toast({ title: "Hero image uploaded!" });
    }
    e.target.value = "";
  };

  // ── Room image upload ──
  const handleRoomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, roomIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ variant: "destructive", title: "Not an image" }); return; }
    const id = await ensureId();
    if (!id) return;
    const url = await uploadImage(file, "rooms", id);
    if (url) {
      setFormData((prev: any) => {
        const newRooms = [...(prev.roomTypes || [])];
        newRooms[roomIndex] = { ...newRooms[roomIndex], imageUrl: url };
        return { ...prev, roomTypes: newRooms };
      });
      toast({ title: "Room image uploaded!" });
    }
    e.target.value = "";
  };

  // ── Gallery upload — FIX: uses ref, not createElement ──
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const id = await ensureId();
    if (!id) return;
    setUploading("gallery");
    const urls: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const filePath = `${id}/gallery/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("resort-assets").upload(filePath, file);
      if (!error) {
        const url = supabase.storage.from("resort-assets").getPublicUrl(filePath).data.publicUrl;
        urls.push(url);
      }
    }
    if (urls.length) {
      setFormData((prev: any) => ({
        ...prev,
        media: { ...prev.media, galleryImages: [...(prev.media?.galleryImages || []), ...urls] },
      }));
      toast({ title: `${urls.length} image(s) uploaded!` });
    }
    setUploading(null);
    e.target.value = "";
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      media: { ...prev.media, galleryImages: (prev.media?.galleryImages || []).filter((_: any, i: number) => i !== index) },
    }));
  };

  const isJpg = (url: string) => /\.(jpg|jpeg)$/i.test(url);
  const isPng = (url: string) => /\.png$/i.test(url);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="font-bold text-lg truncate">
            {currentId ? "Edit Business" : "New Business"}
          </h1>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="min-h-[40px]">Cancel</Button>
            {currentId && (
              <Button variant="outline" size="sm" onClick={handlePreview} className="min-h-[40px] gap-1">
                <Eye className="h-4 w-4" /> Preview
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="min-h-[40px] bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (currentId ? "Save" : "Create")}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* COLOR SCHEME */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2"><Palette className="h-5 w-5 text-blue-500" /> Color Scheme</h2>
          <p className="text-sm text-gray-400 mb-4">Choose a professional color palette for your website</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COLOR_PRESETS.map((preset, index) => (
              <button key={index} onClick={() => applyColorPreset(preset, index)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${activeColorPreset === index ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}>
                <div className="flex gap-1 mb-2">
                  {[preset.primary, preset.accent, preset.background].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-gray-100" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="font-semibold text-xs">{preset.name}</p>
                <div className="h-1.5 rounded-full mt-2" style={{ background: preset.gradient }} />
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Label className="text-sm font-semibold mb-3 block">Customize Colors</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["primary", "background", "text", "accent"].map((key) => (
                <div key={key}>
                  <Label className="text-xs capitalize text-gray-500">{key}</Label>
                  <Input type="color" value={formData.colorPalette?.[key] || "#000000"}
                    onChange={(e) => { setFormData((p: any) => ({ ...p, colorPalette: { ...p.colorPalette, [key]: e.target.value } })); setActiveColorPreset(null); }}
                    className="h-10 w-full mt-1 p-1 rounded-lg cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TYPOGRAPHY */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2"><Type className="h-5 w-5 text-blue-500" /> Typography</h2>
          <p className="text-sm text-gray-400 mb-4">Choose professional font pairings</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TYPOGRAPHY_PRESETS.map((preset, index) => (
              <button key={index} onClick={() => applyTypographyPreset(preset, index)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${activeTypographyPreset === index ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}>
                <p className="font-bold text-sm mb-1">{preset.name}</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: preset.headingFont }}>Heading: {preset.headingFont.split("'")[1] || preset.headingFont}</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: preset.bodyFont }}>Body: {preset.bodyFont.split("'")[1] || preset.bodyFont}</p>
              </button>
            ))}
          </div>
        </div>

        {/* IMAGE GUIDELINES */}
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl">
          <h2 className="font-bold mb-3 flex items-center gap-2 text-blue-800"><CheckCircle className="h-5 w-5" /> Image Guidelines</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-blue-700">
            <ul className="space-y-1">
              <li>• Logo: PNG with transparency (200×60px)</li>
              <li>• Hero Image: JPG/WebP (1920×1080px)</li>
              <li>• Photos: JPG (800×600px)</li>
              <li>• Max file size: 10MB</li>
            </ul>
            <ul className="space-y-1">
              <li>• Use high-quality professional photos</li>
              <li>• Compress images before upload</li>
              <li>• Hero images work best with dark areas</li>
              <li>• Room photos should be well-lit</li>
            </ul>
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label>Business Name <span className="text-red-500">*</span></Label>
              <Input className="mt-1 min-h-[44px]" value={formData.identity?.resortName || ""} onChange={(e) => updateNested("identity", "resortName", e.target.value)} placeholder="Enter business name" />
            </div>
            <div>
              <Label>Location</Label>
              <Input className="mt-1 min-h-[44px]" value={formData.identity?.location || ""} onChange={(e) => updateNested("identity", "location", e.target.value)} placeholder="e.g. Palawan, Philippines" />
            </div>
          </div>
        </div>

        {/* HEADER LOGO */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Image className="h-5 w-5 text-blue-500" /> Header Logo</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={formData.header?.showLogo || false} onCheckedChange={(v) => updateHeader("showLogo", v)} />
              <Label>Show Logo in Header</Label>
            </div>
            {formData.header?.showLogo && (
              <>
                {/* Hidden input — connected via ref */}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "header")} />
                <Button variant="outline" className="gap-2 min-h-[44px]"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading !== null}>
                  <Upload className="h-4 w-4" />
                  {uploading === "logos" ? "Uploading…" : "Upload Logo"}
                </Button>
                {formData.header?.logoUrl && (
                  <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Current Logo</Label>
                      <Button variant="ghost" size="sm" onClick={() => updateHeader("logoUrl", "")} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <img src={formData.header.logoUrl} alt="Logo" style={{ height: formData.header.logoSize || 120 }} className="object-contain border rounded bg-white p-2" />
                    {isJpg(formData.header.logoUrl) && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" /> JPG detected — consider PNG for transparency
                      </p>
                    )}
                    {isPng(formData.header.logoUrl) && (
                      <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0" /> PNG — great for transparency!
                      </p>
                    )}
                    <div>
                      <Label className="text-xs">Size: {formData.header.logoSize || 120}px</Label>
                      <Slider min={60} max={200} step={10} value={[formData.header.logoSize || 120]} onValueChange={([v]) => updateHeader("logoSize", v)} className="mt-2" />
                    </div>
                  </div>
                )}
                <div>
                  <Label>Logo Position</Label>
                  <Select value={formData.header?.logoPosition || "left"} onValueChange={(v) => updateHeader("logoPosition", v)}>
                    <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
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

        {/* HERO SECTION LOGO */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Image className="h-5 w-5 text-blue-500" /> Hero Section Logo</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={formData.hero?.showLogo || false} onCheckedChange={(v) => updateHero("showLogo", v)} />
              <Label>Show Large Logo in Hero Section</Label>
            </div>
            {formData.hero?.showLogo && (
              <>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Switch checked={formData.hero?.useSameAsHeader || false} onCheckedChange={(v) => updateHero("useSameAsHeader", v)} />
                  <div>
                    <Label className="font-medium">Use Same Logo as Header</Label>
                    <p className="text-xs text-gray-400 mt-0.5">Disable to upload a different hero logo</p>
                  </div>
                </div>
                {!formData.hero?.useSameAsHeader && (
                  <>
                    <input ref={heroLogoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "hero")} />
                    <Button variant="outline" className="gap-2 min-h-[44px]"
                      onClick={() => heroLogoInputRef.current?.click()}
                      disabled={uploading !== null}>
                      <Upload className="h-4 w-4" />
                      {uploading === "logos" ? "Uploading…" : "Upload Hero Logo"}
                    </Button>
                  </>
                )}
                {(formData.hero?.heroLogoUrl || (formData.hero?.useSameAsHeader && formData.header?.logoUrl)) && (
                  <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                    <Label>Hero Logo Preview</Label>
                    <img
                      src={formData.hero?.useSameAsHeader ? formData.header?.logoUrl : formData.hero?.heroLogoUrl}
                      alt="Hero logo"
                      style={{ height: formData.hero.heroLogoSize || 180 }}
                      className="object-contain border rounded bg-white p-3 mx-auto block"
                    />
                    <div>
                      <Label className="text-xs">Size: {formData.hero.heroLogoSize || 180}px</Label>
                      <Slider min={100} max={400} step={20} value={[formData.hero.heroLogoSize || 180]} onValueChange={([v]) => updateHero("heroLogoSize", v)} className="mt-2" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* HERO BACKGROUND IMAGE */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Image className="h-5 w-5 text-blue-500" /> Hero Background Image</h2>
          <div className="space-y-4">
            <input ref={heroImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeroImageUpload} />
            <Button variant="outline" className="gap-2 min-h-[44px]"
              onClick={() => heroImageInputRef.current?.click()}
              disabled={uploading !== null}>
              <Upload className="h-4 w-4" />
              {uploading === "hero" ? "Uploading…" : "Upload Hero Image"}
            </Button>
            <p className="text-xs text-gray-400">Recommended: 1920×1080px JPG or WebP. Best with dark areas for text overlay.</p>
            {formData.media?.heroImage && (
              <div className="border rounded-xl p-4 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Current Hero Image</Label>
                  <Button variant="ghost" size="sm" onClick={() => setFormData((p: any) => ({ ...p, media: { ...p.media, heroImage: "", heroImages: [] } }))} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <img src={formData.media.heroImage} alt="Hero" className="w-full h-48 object-cover rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* BRAND STORY */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4">Brand Story</h2>
          <div className="space-y-4">
            <div>
              <Label>Tagline</Label>
              <Input className="mt-1 min-h-[44px]" value={formData.brandStory?.tagline || ""} onChange={(e) => updateNested("brandStory", "tagline", e.target.value)} placeholder="Short catchy tagline" />
            </div>
            <div>
              <Label>Short Description</Label>
              <Textarea className="mt-1" rows={3} value={formData.brandStory?.shortDescription || ""} onChange={(e) => updateNested("brandStory", "shortDescription", e.target.value)} placeholder="Brief description" />
            </div>
            <div>
              <Label>Full Description</Label>
              <Textarea className="mt-1" rows={5} value={formData.brandStory?.fullDescription || ""} onChange={(e) => updateNested("brandStory", "fullDescription", e.target.value)} placeholder="Detailed description about your business" />
            </div>
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> Testimonials</h2>
          <p className="text-sm text-gray-400 mb-4">Add guest reviews to build trust</p>
          <div className="space-y-4">
            {(formData.testimonials || []).map((t: any, i: number) => (
              <div key={i} className="p-4 border rounded-xl space-y-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Review {i + 1}</span>
                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setFormData((p: any) => ({ ...p, testimonials: p.testimonials.filter((_: any, idx: number) => idx !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input className="min-h-[44px]" value={t.name || ""} placeholder="Guest name" onChange={(e) => { const arr = [...formData.testimonials]; arr[i] = { ...arr[i], name: e.target.value }; setFormData((p: any) => ({ ...p, testimonials: arr })); }} />
                  <Input className="min-h-[44px]" value={t.location || ""} placeholder="Location" onChange={(e) => { const arr = [...formData.testimonials]; arr[i] = { ...arr[i], location: e.target.value }; setFormData((p: any) => ({ ...p, testimonials: arr })); }} />
                </div>
                <Textarea rows={3} value={t.text || ""} placeholder="Review text" onChange={(e) => { const arr = [...formData.testimonials]; arr[i] = { ...arr[i], text: e.target.value }; setFormData((p: any) => ({ ...p, testimonials: arr })); }} />
                <Select value={String(t.rating || 5)} onValueChange={(v) => { const arr = [...formData.testimonials]; arr[i] = { ...arr[i], rating: Number(v) }; setFormData((p: any) => ({ ...p, testimonials: arr })); }}>
                  <SelectTrigger className="w-40 min-h-[44px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button variant="outline" className="w-full min-h-[44px]" onClick={() => setFormData((p: any) => ({ ...p, testimonials: [...(p.testimonials || []), { name: "", location: "", text: "", rating: 5 }] }))}>
              <Plus className="h-4 w-4 mr-2" /> Add Testimonial
            </Button>
          </div>
        </div>

        {/* FEATURES */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2"><Zap className="h-5 w-5 text-blue-500" /> Features / Why Choose Us</h2>
          <p className="text-sm text-gray-400 mb-4">Highlight what makes your business special</p>
          <div className="space-y-4">
            {(formData.features || []).map((f: any, i: number) => (
              <div key={i} className="p-4 border rounded-xl space-y-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Feature {i + 1}</span>
                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setFormData((p: any) => ({ ...p, features: p.features.filter((_: any, idx: number) => idx !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input className="min-h-[44px]" value={f.title || ""} placeholder="Feature title" onChange={(e) => { const arr = [...formData.features]; arr[i] = { ...arr[i], title: e.target.value }; setFormData((p: any) => ({ ...p, features: arr })); }} />
                  <Input className="min-h-[44px]" value={f.icon || ""} placeholder="Emoji icon 🏖️" onChange={(e) => { const arr = [...formData.features]; arr[i] = { ...arr[i], icon: e.target.value }; setFormData((p: any) => ({ ...p, features: arr })); }} />
                </div>
                <Textarea rows={2} value={f.description || ""} placeholder="Brief description" onChange={(e) => { const arr = [...formData.features]; arr[i] = { ...arr[i], description: e.target.value }; setFormData((p: any) => ({ ...p, features: arr })); }} />
              </div>
            ))}
            <Button variant="outline" className="w-full min-h-[44px]" onClick={() => setFormData((p: any) => ({ ...p, features: [...(p.features || []), { title: "", icon: "✨", description: "" }] }))}>
              <Plus className="h-4 w-4 mr-2" /> Add Feature
            </Button>
          </div>
        </div>

        {/* SOCIAL MEDIA */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Facebook className="h-5 w-5 text-blue-500" /> Social Media Links</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/yourpage" },
                { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/yourpage" },
                { key: "tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@yourpage" },
                { key: "youtube", label: "YouTube URL", placeholder: "https://youtube.com/@yourchannel" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input className="mt-1 min-h-[44px]" value={formData.socialMedia?.[key] || ""} onChange={(e) => updateSocial(key, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input className="mt-1 min-h-[44px]" value={formData.socialMedia?.whatsapp || ""} onChange={(e) => updateSocial("whatsapp", e.target.value)} placeholder="+63 xxx xxx xxxx" />
            </div>
            <div className="flex gap-6 pt-3 border-t flex-wrap">
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

        {/* HEADER SETTINGS */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Monitor className="h-5 w-5 text-blue-500" /> Header Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={formData.header?.sticky || false} onCheckedChange={(v) => updateHeader("sticky", v)} />
              <Label>Sticky Header (stays on scroll)</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formData.header?.transparent || false} onCheckedChange={(v) => updateHeader("transparent", v)} />
              <Label>Transparent Header (over hero image)</Label>
            </div>
            <div>
              <Label className="mb-2 block">Navigation Links</Label>
              <div className="space-y-2">
                {formData.header?.navigationLinks?.map((link: any, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input className="min-h-[44px]" value={link.label} placeholder="Label" onChange={(e) => { const arr = [...formData.header.navigationLinks]; arr[i] = { ...arr[i], label: e.target.value }; updateHeader("navigationLinks", arr); }} />
                    <Input className="min-h-[44px]" value={link.url} placeholder="#section" onChange={(e) => { const arr = [...formData.header.navigationLinks]; arr[i] = { ...arr[i], url: e.target.value }; updateHeader("navigationLinks", arr); }} />
                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-red-400" onClick={() => updateHeader("navigationLinks", formData.header.navigationLinks.filter((_: any, idx: number) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full min-h-[44px]" onClick={() => updateHeader("navigationLinks", [...(formData.header.navigationLinks || []), { label: "", url: "" }])}>
                  <Plus className="h-4 w-4 mr-2" /> Add Link
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER SETTINGS */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Wifi className="h-5 w-5 text-blue-500" /> Footer Settings</h2>
          <div className="space-y-4">
            <div>
              <Label>Copyright Text</Label>
              <Input className="mt-1 min-h-[44px]" value={formData.footer?.copyrightText || ""} onChange={(e) => updateFooter("copyrightText", e.target.value)} placeholder={`© ${new Date().getFullYear()} My Business. All rights reserved.`} />
            </div>
            <div>
              <Label>Footer Columns</Label>
              <Select value={String(formData.footer?.columns || 3)} onValueChange={(v) => updateFooter("columns", Number(v))}>
                <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {[
              { key: "showSocialIcons", label: "Show Social Icons in Footer" },
              { key: "showContactInfo", label: "Show Contact Info in Footer" },
              { key: "showNavigation", label: "Show Navigation Links in Footer" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <Switch checked={formData.footer?.[key] || false} onCheckedChange={(v) => updateFooter(key, v)} />
                <Label>{label}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* AMENITIES */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4">Amenities</h2>
          <div className="space-y-2">
            {(formData.amenities || []).map((a: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input className="min-h-[44px]" value={a} placeholder="Amenity name" onChange={(e) => { const arr = [...formData.amenities]; arr[i] = e.target.value; setFormData((p: any) => ({ ...p, amenities: arr })); }} />
                <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-red-400" onClick={() => setFormData((p: any) => ({ ...p, amenities: p.amenities.filter((_: any, idx: number) => idx !== i) }))}><X className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" className="w-full min-h-[44px]" onClick={() => setFormData((p: any) => ({ ...p, amenities: [...(p.amenities || []), ""] }))}>
              <Plus className="h-4 w-4 mr-2" /> Add Amenity
            </Button>
          </div>
        </div>

        {/* ROOM TYPES */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4">Room Types / Services</h2>
          <div className="space-y-4">
            {(formData.roomTypes || []).map((room: any, i: number) => (
              <div key={i} className="p-4 border rounded-xl space-y-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Item {i + 1}</span>
                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setFormData((p: any) => ({ ...p, roomTypes: p.roomTypes.filter((_: any, idx: number) => idx !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div>
                  <input id={`room-img-${i}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleRoomImageUpload(e, i)} />
                  <Button variant="outline" size="sm" className="gap-2 min-h-[44px]" onClick={() => document.getElementById(`room-img-${i}`)?.click()} disabled={uploading !== null}>
                    <Upload className="h-4 w-4" /> {room.imageUrl ? "Replace Image" : "Upload Image"}
                  </Button>
                  {room.imageUrl && (
                    <div className="mt-2 relative">
                      <img src={room.imageUrl} alt="Room" className="w-full h-36 object-cover rounded-xl" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => { const arr = [...formData.roomTypes]; arr[i] = { ...arr[i], imageUrl: "" }; setFormData((p: any) => ({ ...p, roomTypes: arr })); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </div>
                {[
                  { key: "name", placeholder: "Room / service name" },
                  { key: "price", placeholder: "Price (e.g. ₱2,500/night)" },
                  { key: "description", placeholder: "Description" },
                ].map(({ key, placeholder }) => (
                  <Input key={key} className="min-h-[44px]" value={room[key] || ""} placeholder={placeholder}
                    onChange={(e) => { const arr = [...formData.roomTypes]; arr[i] = { ...arr[i], [key]: e.target.value }; setFormData((p: any) => ({ ...p, roomTypes: arr })); }} />
                ))}
              </div>
            ))}
            <Button variant="outline" className="w-full min-h-[44px]" onClick={() => setFormData((p: any) => ({ ...p, roomTypes: [...(p.roomTypes || []), { name: "", price: "", description: "", imageUrl: "" }] }))}>
              <Plus className="h-4 w-4 mr-2" /> Add Room / Service
            </Button>
          </div>
        </div>

        {/* PHOTO GALLERY — FIX: uses galleryInputRef */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2"><Image className="h-5 w-5 text-blue-500" /> Photo Gallery</h2>
          <p className="text-sm text-gray-400 mb-4">Upload multiple photos for your gallery section</p>
          <div className="space-y-4">
            {/* Hidden input connected via ref */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
            />
            <Button
              variant="outline"
              className="gap-2 min-h-[44px]"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading !== null}
            >
              <Upload className="h-4 w-4" />
              {uploading === "gallery" ? "Uploading…" : "Upload Photos"}
            </Button>
            {formData.media?.galleryImages?.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {formData.media.galleryImages.map((url: string, i: number) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border bg-gray-100">
                    <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeGalleryImage(i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LOCATION & CONTACT */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4">Location & Contact</h2>
          <div className="space-y-4">
            <div>
              <Label>Full Address</Label>
              <Input className="mt-1 min-h-[44px]" value={formData.location?.fullAddress || ""} onChange={(e) => updateNested("location", "fullAddress", e.target.value)} placeholder="Complete address" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input className="mt-1 min-h-[44px]" value={formData.location?.contactEmail || ""} onChange={(e) => updateNested("location", "contactEmail", e.target.value)} placeholder="contact@business.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1 min-h-[44px]" value={formData.location?.phone || ""} onChange={(e) => updateNested("location", "phone", e.target.value)} placeholder="+63 xxx xxx xxxx" />
              </div>
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input className="mt-1 min-h-[44px]" value={formData.location?.whatsapp || ""} onChange={(e) => updateNested("location", "whatsapp", e.target.value)} placeholder="+63 xxx xxx xxxx" />
            </div>
            <div>
              <Label>Google Maps Link</Label>
              <Input className="mt-1 min-h-[44px]" value={formData.location?.googleMapsLink || ""} onChange={(e) => updateNested("location", "googleMapsLink", e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4">FAQ</h2>
          <div className="space-y-4">
            {(formData.faq || []).map((item: any, i: number) => (
              <div key={i} className="p-4 border rounded-xl space-y-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Q&A {i + 1}</span>
                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setFormData((p: any) => ({ ...p, faq: p.faq.filter((_: any, idx: number) => idx !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <Input className="min-h-[44px]" value={item.question || ""} placeholder="Question" onChange={(e) => { const arr = [...formData.faq]; arr[i] = { ...arr[i], question: e.target.value }; setFormData((p: any) => ({ ...p, faq: arr })); }} />
                <Textarea rows={3} value={item.answer || ""} placeholder="Answer" onChange={(e) => { const arr = [...formData.faq]; arr[i] = { ...arr[i], answer: e.target.value }; setFormData((p: any) => ({ ...p, faq: arr })); }} />
              </div>
            ))}
            <Button variant="outline" className="w-full min-h-[44px]" onClick={() => setFormData((p: any) => ({ ...p, faq: [...(p.faq || []), { question: "", answer: "" }] }))}>
              <Plus className="h-4 w-4 mr-2" /> Add FAQ
            </Button>
          </div>
        </div>

        {/* VIDEO TOUR */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-4">Video Tour</h2>
          <Label>YouTube / Vimeo URL</Label>
          <Input className="mt-1 min-h-[44px]" value={formData.media?.videoUrl || ""} onChange={(e) => setFormData((p: any) => ({ ...p, media: { ...p.media, videoUrl: e.target.value } }))} placeholder="https://youtube.com/watch?v=..." />
        </div>

        {/* BOOKING INTEGRATION */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <span>🗓️</span> Booking Integration
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Connect a booking system so guests can reserve directly from your site. If you use Cloudbeds, Lodgify, Little Hotelier, or similar — paste their embed code here.
          </p>
          <div className="space-y-4">
            <div>
              <Label>Booking System</Label>
              <Select
                value={formData.booking?.system || "none"}
                onValueChange={(v) => setFormData((p: any) => ({ ...p, booking: { ...p.booking, system: v === "none" ? "" : v } }))}
              >
                <SelectTrigger className="mt-1 min-h-[44px]">
                  <SelectValue placeholder="Select a system..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Cloudbeds">Cloudbeds</SelectItem>
                  <SelectItem value="Lodgify">Lodgify</SelectItem>
                  <SelectItem value="Little Hotelier">Little Hotelier</SelectItem>
                  <SelectItem value="Smoobu">Smoobu</SelectItem>
                  <SelectItem value="Booking.com">Booking.com</SelectItem>
                  <SelectItem value="Airbnb">Airbnb</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Booking Page URL</Label>
              <Input
                className="mt-1 min-h-[44px]"
                value={formData.booking?.url || ""}
                onChange={(e) => setFormData((p: any) => ({ ...p, booking: { ...p.booking, url: e.target.value } }))}
                placeholder="https://hotels.cloudbeds.com/en/reserve/yourproperty"
              />
              <p className="text-xs text-gray-400 mt-1">
                The "Book Now" button will link here. If you also paste embed code below, the full widget shows on the site instead.
              </p>
            </div>

            <div>
              <Label>
                Embed Code{" "}
                <span className="text-gray-400 font-normal text-xs">(optional — paste from your booking system)</span>
              </Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                rows={6}
                value={formData.booking?.embedCode || ""}
                onChange={(e) => setFormData((p: any) => ({ ...p, booking: { ...p.booking, embedCode: e.target.value } }))}
                placeholder={'<script src="https://hotels.cloudbeds.com/..."></script>\n<div id="cb-booking-widget"></div>'}
              />
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 space-y-1">
                <p className="font-semibold">Where to get your embed code:</p>
                <p>• <strong>Cloudbeds:</strong> Settings → Booking Engine → Embeds tab → copy the widget code</p>
                <p>• <strong>Lodgify:</strong> Dashboard → Booking Widget → Copy Code</p>
                <p>• <strong>Little Hotelier:</strong> Settings → Booking Engine → Widget → Get Code</p>
                <p>• <strong>Smoobu:</strong> Settings → Booking Widget → Embed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Section Title</Label>
                <Input
                  className="mt-1 min-h-[44px]"
                  value={formData.booking?.sectionTitle || ""}
                  onChange={(e) => setFormData((p: any) => ({ ...p, booking: { ...p.booking, sectionTitle: e.target.value } }))}
                  placeholder="Book Your Stay"
                />
              </div>
              <div>
                <Label>Section Subtitle</Label>
                <Input
                  className="mt-1 min-h-[44px]"
                  value={formData.booking?.sectionSubtitle || ""}
                  onChange={(e) => setFormData((p: any) => ({ ...p, booking: { ...p.booking, sectionSubtitle: e.target.value } }))}
                  placeholder="Best rates guaranteed when booking direct."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom save */}
        {/* DOMAIN */}
        <div className="bg-white p-6 rounded-2xl border">
          <DomainStep
            data={formData.domain || { purchaseDomain: false, customDomain: '' }}
            onChange={(domainData) => setFormData(prev => ({ ...prev, domain: domainData }))}
          />
        </div>


        <div className="pb-8">
          <Button className="w-full min-h-[52px] text-base font-bold bg-blue-600 hover:bg-blue-700 rounded-xl" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {isSubmitting ? "Saving…" : (currentId ? "Save Changes" : "Create Business Site")}
          </Button>
        </div>

      </div>
    </div>
  );
}
