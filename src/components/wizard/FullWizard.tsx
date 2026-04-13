import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronLeft, ChevronRight, Save, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  "Identity", "Brand Story", "About Owner", "Media", "Hero Video",
  "Rooms", "Amenities", "Dining", "FAQ", "Header/Footer", 
  "Contact", "Color Palette", "SEO"
];

export function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlEditId = searchParams.get("edit");

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(!!urlEditId);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --- REHYDRATION ENGINE with TIMEOUT ---
  useEffect(() => {
    if (!urlEditId) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchResort = async () => {
      try {
        console.log("🔍 Fetching resort:", urlEditId);
        
        const { data, error } = await supabase
          .from("resort_submissions")
          .select("data")
          .eq("id", urlEditId)
          .single();

        if (isCancelled) return;

        if (error) {
          console.error("❌ Supabase error:", error);
          setLoadError(error.message);
          toast.error("Failed to load: " + error.message);
          setIsLoading(false);
          return;
        }
        
        if (data?.data) {
          console.log("✅ Data loaded:", data.data);
          setFormData(data.data);
        }
        
        setIsLoading(false);
      } catch (err: any) {
        console.error("❌ Catch error:", err);
        if (!isCancelled) {
          setLoadError(err.message || "Unknown error");
          toast.error("Failed to load resort data");
          setIsLoading(false);
        }
      }
    };

    // Timeout fallback - prevents infinite loading
    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        console.error("⏱️ Fetch timeout after 10 seconds");
        setLoadError("Request timed out");
        toast.error("Loading timed out. Please refresh.");
        setIsLoading(false);
      }
    }, 10000);

    fetchResort();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [urlEditId]);

  // --- CREATE NEW SUBMISSION ---
  const createSubmission = async () => {
    try {
      const { data, error } = await supabase
        .from("resort_submissions")
        .insert({ data: formData, status: "draft" })
        .select()
        .single();

      if (error) throw error;
      
      const newId = data.id;
      const newUrl = `/wizard?edit=${newId}`;
      window.history.replaceState({}, '', newUrl);
      
      toast.success("Resort created!");
      return newId;
    } catch (err: any) {
      toast.error(err.message || "Failed to create");
      return null;
    }
  };

  // --- SAVE ---
  const handleSave = async () => {
    if (!urlEditId) {
      toast.error("No submission ID");
      return false;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("resort_submissions")
        .update({ data: formData, updated_at: new Date().toISOString() })
        .eq("id", urlEditId);

      if (error) throw error;
      toast.success("Saved");
      return true;
    } catch (err) {
      toast.error("Save failed");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!urlEditId) {
      toast.error("No submission ID");
      return;
    }
    
    setIsSaving(true);
    try {
      await supabase
        .from("resort_submissions")
        .update({ data: formData, status: "pending", updated_at: new Date().toISOString() })
        .eq("id", urlEditId);

      toast.success("🎉 Submitted!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1 && !urlEditId) {
      setIsSaving(true);
      const newId = await createSubmission();
      setIsSaving(false);
      if (!newId) return;
      setTimeout(() => { setCurrentStep(2); window.scrollTo(0, 0); }, 100);
      return;
    }
    
    if (currentStep === STEPS.length) {
      handleSubmit();
    } else {
      const saved = await handleSave();
      if (saved) {
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        window.scrollTo(0, 0);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // --- IMAGE UPLOAD ---
  const handleImageUpload = async (files: File[], field: string) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `resort-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resort-assets')
          .upload(path, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('resort-assets')
          .getPublicUrl(path);
        
        urls.push(publicUrl);
      }
      
      setFormData({ ...formData, [field]: [...(formData[field] || []), ...urls] });
      toast.success("Uploaded!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (field: string, index: number) => {
    setFormData({
      ...formData,
      [field]: (formData[field] || []).filter((_: any, i: number) => i !== index)
    });
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading resort data...</p>
        <p className="text-xs text-muted-foreground mt-2">ID: {urlEditId?.slice(0, 8)}...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-destructive">Failed to Load</h1>
          <p className="text-muted-foreground">{loadError}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Step {currentStep} of {STEPS.length}
            </p>
            <h2 className="text-sm font-semibold text-primary">{STEPS[currentStep - 1]}</h2>
          </div>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !urlEditId}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
        <div className="w-full h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 pb-32">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Resort Identity</h1>
                <p className="text-muted-foreground">{urlEditId ? "Editing existing resort" : "Create new resort"}</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Resort Name</Label>
                  <Input placeholder="e.g. Palawan Collective" value={formData.identity?.resortName || ""} onChange={(e) => setFormData({ ...formData, identity: { ...formData.identity, resortName: e.target.value } })} />
                </div>
                <div className="grid gap-2">
                  <Label>Owner</Label>
                  <Input placeholder="Your name" value={formData.identity?.resortOwner || ""} onChange={(e) => setFormData({ ...formData, identity: { ...formData.identity, resortOwner: e.target.value } })} />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="owner@resort.com" value={formData.identity?.email || ""} onChange={(e) => setFormData({ ...formData, identity: { ...formData.identity, email: e.target.value } })} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input type="tel" placeholder="+63 917 123 4567" value={formData.identity?.phone || ""} onChange={(e) => setFormData({ ...formData, identity: { ...formData.identity, phone: e.target.value } })} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Brand Story</h1>
                <p className="text-muted-foreground">Tell guests what makes you special.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Tagline</Label>
                  <Input placeholder="e.g. Paradise Found" value={formData.brandStory?.tagline || ""} onChange={(e) => setFormData({ ...formData, brandStory: { ...formData.brandStory, tagline: e.target.value } })} />
                </div>
                <div className="grid gap-2">
                  <Label>Short Description</Label>
                  <Textarea rows={3} value={formData.brandStory?.shortDescription || ""} onChange={(e) => setFormData({ ...formData, brandStory: { ...formData.brandStory, shortDescription: e.target.value } })} />
                </div>
                <div className="grid gap-2">
                  <Label>Full Description</Label>
                  <Textarea rows={6} value={formData.brandStory?.fullDescription || ""} onChange={(e) => setFormData({ ...formData, brandStory: { ...formData.brandStory, fullDescription: e.target.value } })} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">About Owner</h1>
                <p className="text-muted-foreground">Share your story.</p>
              </div>
              <Textarea rows={6} value={formData.aboutOwner?.bio || ""} onChange={(e) => setFormData({ ...formData, aboutOwner: { ...formData.aboutOwner, bio: e.target.value } })} />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Media</h1>
                <p className="text-muted-foreground">Upload photos.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Hero Images</Label>
                  <Input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(Array.from(e.target.files || []), 'media.heroImages')} disabled={uploading} />
                  <div className="grid grid-cols-3 gap-2">
                    {(formData.media?.heroImages || []).map((url: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeImage('media.heroImages', i)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Gallery Images</Label>
                  <Input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(Array.from(e.target.files || []), 'media.galleryImages')} disabled={uploading} />
                  <div className="grid grid-cols-3 gap-2">
                    {(formData.media?.galleryImages || []).map((url: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeImage('media.galleryImages', i)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Hero Video</h1>
              </div>
              <Input placeholder="https://youtube.com/watch?v=..." value={formData.media?.videoUrl || ""} onChange={(e) => setFormData({ ...formData, media: { ...formData.media, videoUrl: e.target.value } })} />
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
              </div>
              {(formData.roomTypes || []).map((room: any, i: number) => (
                <div key={i} className="p-4 border rounded-xl space-y-3">
                  <div className="flex justify-between"><Label>Room {i + 1}</Label><Button size="sm" variant="destructive" onClick={() => setFormData({ ...formData, roomTypes: formData.roomTypes.filter((_: any, j: number) => j !== i) })}><Trash2 className="w-4 h-4" /></Button></div>
                  <Input placeholder="Name" value={room.name || ""} onChange={(e) => { const r = [...formData.roomTypes]; r[i] = { ...r[i], name: e.target.value }; setFormData({ ...formData, roomTypes: r }); }} />
                  <Input type="number" placeholder="Price" value={room.price || ""} onChange={(e) => { const r = [...formData.roomTypes]; r[i] = { ...r[i], price: e.target.value }; setFormData({ ...formData, roomTypes: r }); }} />
                  <Textarea rows={2} placeholder="Description" value={room.description || ""} onChange={(e) => { const r = [...formData.roomTypes]; r[i] = { ...r[i], description: e.target.value }; setFormData({ ...formData, roomTypes: r }); }} />
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setFormData({ ...formData, roomTypes: [...(formData.roomTypes || []), { name: "", price: "", description: "" }] })}><Plus className="w-4 h-4 mr-2" /> Add Room</Button>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Amenities</h1>
              <div className="grid grid-cols-2 gap-3">
                {['Pool', 'WiFi', 'Restaurant', 'Bar', 'Spa', 'Parking', 'Airport Transfer', 'Beachfront', 'Air Conditioning', 'Hot Water'].map((a) => (
                  <Button key={a} variant={(formData.amenities || []).includes(a) ? "default" : "outline"} onClick={() => setFormData({ ...formData, amenities: (formData.amenities || []).includes(a) ? (formData.amenities || []).filter((x: string) => x !== a) : [...(formData.amenities || []), a] })}>{a}</Button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Dining</h1>
              <Textarea rows={4} value={formData.dining?.options || ""} onChange={(e) => setFormData({ ...formData, dining: { ...formData.dining, options: e.target.value } })} />
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">FAQ</h1>
              {(formData.faqs || []).map((faq: any, i: number) => (
                <div key={i} className="p-4 border rounded-xl space-y-3">
                  <div className="flex justify-between"><Label>FAQ {i + 1}</Label><Button size="sm" variant="destructive" onClick={() => setFormData({ ...formData, faqs: formData.faqs.filter((_: any, j: number) => j !== i) })}><Trash2 className="w-4 h-4" /></Button></div>
                  <Input placeholder="Question" value={faq.question || ""} onChange={(e) => { const f = [...formData.faqs]; f[i] = { ...f[i], question: e.target.value }; setFormData({ ...formData, faqs: f }); }} />
                  <Textarea rows={2} placeholder="Answer" value={faq.answer || ""} onChange={(e) => { const f = [...formData.faqs]; f[i] = { ...f[i], answer: e.target.value }; setFormData({ ...formData, faqs: f }); }} />
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setFormData({ ...formData, faqs: [...(formData.faqs || []), { question: "", answer: "" }] })}><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button>
            </div>
          )}

          {currentStep === 10 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Header & Footer</h1>
              <select className="flex h-11 w-full rounded-lg border" value={formData.layout?.headerStyle || "blur"} onChange={(e) => setFormData({ ...formData, layout: { ...formData.layout, headerStyle: e.target.value } })}>
                <option value="blur">Blur</option>
                <option value="solid">Solid</option>
                <option value="transparent">Transparent</option>
              </select>
              <Input placeholder="Footer text" value={formData.layout?.footerText || ""} onChange={(e) => setFormData({ ...formData, layout: { ...formData.layout, footerText: e.target.value } })} />
            </div>
          )}

          {currentStep === 11 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Contact</h1>
              <Input type="email" placeholder="Email" value={formData.location?.contactEmail || ""} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, contactEmail: e.target.value } })} />
              <Input type="tel" placeholder="Phone" value={formData.location?.phone || ""} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, phone: e.target.value } })} />
              <Textarea rows={3} placeholder="Address" value={formData.location?.fullAddress || ""} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, fullAddress: e.target.value } })} />
              <Input placeholder="Google Maps URL" value={formData.location?.googleMapsLink || ""} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, googleMapsLink: e.target.value } })} />
            </div>
          )}

          {currentStep === 12 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Color Palette</h1>
              <div className="grid gap-2">
                <Label>Primary</Label>
                <div className="flex gap-3"><Input type="color" className="w-20 h-12" value={formData.colorPalette?.primary || "#0EA5E9"} onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, primary: e.target.value } })} /><Input value={formData.colorPalette?.primary || "#0EA5E9"} onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, primary: e.target.value } })} /></div>
              </div>
              <div className="grid gap-2">
                <Label>Background</Label>
                <div className="flex gap-3"><Input type="color" className="w-20 h-12" value={formData.colorPalette?.background || "#ffffff"} onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, background: e.target.value } })} /><Input value={formData.colorPalette?.background || "#ffffff"} onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, background: e.target.value } })} /></div>
              </div>
            </div>
          )}

          {currentStep === 13 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">SEO & Publishing</h1>
              <Input placeholder="Meta Title" value={formData.seo?.metaTitle || ""} onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })} />
              <Textarea rows={3} placeholder="Meta Description" value={formData.seo?.metaDescription || ""} onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })} />
              <Input placeholder="Google Analytics ID" value={formData.seo?.googleAnalyticsId || ""} onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, googleAnalyticsId: e.target.value } })} />
              <select className="flex h-11 w-full rounded-lg border" value={formData.publishing?.publishImmediately ? "yes" : "no"} onChange={(e) => setFormData({ ...formData, publishing: { ...formData.publishing, publishImmediately: e.target.value === "yes" } })}>
                <option value="yes">Yes — Publish automatically</option>
                <option value="no">No — Save as draft</option>
              </select>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md p-4 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="rounded-xl px-6"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
          <Button onClick={nextStep} className="rounded-xl px-8 bg-primary hover:bg-primary/90" disabled={isSaving}>
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : currentStep === STEPS.length ? "Submit & Build Site" : "Next Step"} {currentStep !== STEPS.length && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
