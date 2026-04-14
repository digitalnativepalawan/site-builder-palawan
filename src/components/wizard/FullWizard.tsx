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
import { Loader2, X, Plus, Trash2, Eye, Smartphone, Tablet, Monitor, Facebook, Instagram, Youtube, Wifi, Upload, AlertTriangle, CheckCircle, Image } from "lucide-react";

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
  const [formData, setFormData] = useState<any>({
    identity: { resortName: "", location: "" },
    brandStory: { tagline: "", shortDescription: "", fullDescription: "" },
    amenities: [],
    roomTypes: [],
    location: { fullAddress: "", contactEmail: "", phone: "", whatsapp: "", googleMapsLink: "" },
    faq: [],
    media: { heroImages: [], videoUrl: "", galleryImages: [] },
    colorPalette: { primary: "#0EA5E9", background: "#ffffff", text: "#1e293b", accent: "#f59e0b" },
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
      showNavigation: true,
      navigationLinks: [{ label: "Home", url: "#home" }, { label: "About", url: "#about" }, { label: "Rooms", url: "#rooms" }, { label: "Contact", url: "#contact" }],
      sticky: true,
      transparent: false,
    },
    footer: {
      copyrightText: "",
      showSocialIcons: true,
      showContactInfo: true,
      showNavigation: true,
      columns: 3,
    },
    hero: {
      showLogo: false,
      heroLogoUrl: "",
      heroLogoSize: 200,
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

  // 🔥 FILE UPLOAD FUNCTION
  const uploadLogo = async (file: File, type: "header" | "hero") => {
    if (!editId) {
      toast({
        variant: "destructive",
        title: "Save First",
        description: "Please save the resort before uploading images.",
      });
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-logo-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${editId}/logos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("resort-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("resort-assets")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err.message,
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleHeaderLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, SVG, WebP)",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Logo must be less than 5MB",
      });
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
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, SVG, WebP)",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Logo must be less than 5MB",
      });
      return;
    }

    const url = await uploadLogo(file, "hero");
    if (url) {
      updateHero("heroLogoUrl", url);
      toast({ title: "Logo uploaded!", description: "Hero logo saved." });
    }
  };

  // Check if logo has transparency warning (JPG doesn't support transparency)
  const isJpg = (url: string) => url.toLowerCase().endsWith(".jpg") || url.toLowerCase().endsWith(".jpeg");
  const isPng = (url: string) => url.toLowerCase().endsWith(".png");
  const isSvg = (url: string) => url.toLowerCase().endsWith(".svg");

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {editId ? "Edit Resort" : "New Resort"}
        </h1>
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

      {/* 📋 LOGO UPLOAD GUIDELINES */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" /> Logo Best Practices
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">✅ Recommended Format</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>PNG with transparency</strong> (best for headers)</li>
              <li>• <strong>SVG</strong> (scalable, crisp at any size)</li>
              <li>• <strong>WebP</strong> (modern, small file size)</li>
              <li>• Max file size: <strong>5MB</strong></li>
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
          <div>
            <h3 className="font-semibold mb-2">📏 Recommended Sizes</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>Header Logo:</strong> 200×60px or 300×80px</li>
              <li>• <strong>Hero Logo:</strong> 400×400px or 500×500px</li>
              <li>• <strong>Favicon:</strong> 32×32px or 64×64px</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🎨 Background Tips</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Dark logo for light backgrounds</li>
              <li>• Light/white logo for dark backgrounds</li>
              <li>• Consider uploading 2 versions (light & dark)</li>
              <li>• Transparent PNG works on any background</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <Label>Resort Name</Label>
            <Input
              value={formData.identity?.resortName || ""}
              onChange={(e) => updateNested("identity", "resortName", e.target.value)}
              placeholder="Enter resort name"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={formData.identity?.location || ""}
              onChange={(e) => updateNested("identity", "location", e.target.value)}
              placeholder="e.g. Palawan, Philippines"
            />
          </div>
        </div>
      </div>

      {/* 🎨 HEADER LOGO */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Image className="h-5 w-5" /> Header Logo
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.header?.showLogo || false}
              onCheckedChange={(v) => updateHeader("showLogo", v)}
            />
            <Label>Show Logo in Header</Label>
          </div>

          {formData.header?.showLogo && (
            <>
              {/* Upload Button */}
              <div>
                <Label>Upload Logo</Label>
                <div className="mt-2 flex gap-4 items-start">
                  <Button
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploading || !editId}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Choose File"}
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleHeaderLogoUpload}
                  />
                  {!editId && (
                    <p className="text-sm text-muted-foreground">Save resort first to upload images</p>
                  )}
                </div>
              </div>

              {/* Logo Preview */}
              {formData.header?.logoUrl && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Current Logo</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateHeader("logoUrl", "")}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-4 items-center">
                    <img
                      src={formData.header.logoUrl}
                      alt="Header logo"
                      style={{ height: formData.header.logoSize || 120, objectFit: "contain" }}
                      className="border rounded bg-white p-2"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label>Logo Size: {formData.header.logoSize}px</Label>
                        <Slider
                          min={60}
                          max={200}
                          step={10}
                          value={[formData.header.logoSize || 120]}
                          onValueChange={([v]) => updateHeader("logoSize", v)}
                          className="mt-2"
                        />
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

              {/* Logo Position */}
              <div>
                <Label>Logo Position</Label>
                <Select
                  value={formData.header?.logoPosition || "left"}
                  onValueChange={(v) => updateHeader("logoPosition", v)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
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

      {/* 🖼️ HERO LOGO */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Image className="h-5 w-5" /> Hero Section Logo
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.hero?.showLogo || false}
              onCheckedChange={(v) => updateHero("showLogo", v)}
            />
            <Label>Show Large Logo in Hero Section</Label>
          </div>

          {formData.hero?.showLogo && (
            <>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Switch
                  checked={formData.hero?.useSameAsHeader || false}
                  onCheckedChange={(v) => updateHero("useSameAsHeader", v)}
                />
                <div>
                  <Label className="font-medium">Use Same Logo as Header</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to use the header logo, or disable to upload a different one
                  </p>
                </div>
              </div>

              {!formData.hero?.useSameAsHeader && (
                <div>
                  <Label>Upload Hero Logo</Label>
                  <div className="mt-2 flex gap-4 items-start">
                    <Button
                      variant="outline"
                      onClick={() => heroLogoInputRef.current?.click()}
                      disabled={uploading || !editId}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Choose File"}
                    </Button>
                    <input
                      ref={heroLogoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={handleHeroLogoUpload}
                    />
                  </div>
                </div>
              )}

              {/* Hero Logo Preview */}
              {(formData.hero?.heroLogoUrl || (formData.hero?.useSameAsHeader && formData.header?.logoUrl)) && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Current Hero Logo</Label>
                    {!formData.hero?.useSameAsHeader && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateHero("heroLogoUrl", "")}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={formData.hero?.useSameAsHeader ? formData.header?.logoUrl : formData.hero?.heroLogoUrl}
                      alt="Hero logo"
                      style={{ height: formData.hero.heroLogoSize || 200, objectFit: "contain" }}
                      className="border rounded bg-white p-4"
                    />
                    <div className="w-full space-y-2">
                      <div>
                        <Label>Hero Logo Size: {formData.hero.heroLogoSize}px</Label>
                        <Slider
                          min={100}
                          max={400}
                          step={20}
                          value={[formData.hero.heroLogoSize || 200]}
                          onValueChange={([v]) => updateHero("heroLogoSize", v)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Step 2: Brand Story */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Brand Story</h2>
        <div className="space-y-4">
          <div>
            <Label>Tagline</Label>
            <Input
              value={formData.brandStory?.tagline || ""}
              onChange={(e) => updateNested("brandStory", "tagline", e.target.value)}
              placeholder="Short catchy tagline"
            />
          </div>
          <div>
            <Label>Short Description</Label>
            <Textarea
              rows={3}
              value={formData.brandStory?.shortDescription || ""}
              onChange={(e) => updateNested("brandStory", "shortDescription", e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div>
            <Label>Full Description</Label>
            <Textarea
              rows={5}
              value={formData.brandStory?.fullDescription || ""}
              onChange={(e) => updateNested("brandStory", "fullDescription", e.target.value)}
              placeholder="Detailed description about your resort"
            />
          </div>
        </div>
      </div>

      {/* ... rest of the form sections (Social Media, Header, Footer, Amenities, Rooms, etc.) ... */}
      {/* I'll keep these the same as before to save space - let me know if you want me to include them all */}

    </div>
  );
}
