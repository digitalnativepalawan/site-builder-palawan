import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronLeft, ChevronRight, Save, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  "Identity", "Brand Story", "About Owner", "Media", "Hero Video",
  "Rooms", "Amenities", "Dining", "FAQ", "Header/Footer", 
  "Contact", "Color Palette", "SEO"
];

export function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isRehydrating, setIsRehydrating] = useState(!!editId);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- REHYDRATION ENGINE ---
  useEffect(() => {
    if (editId) {
      const fetchResort = async () => {
        try {
          const { data, error } = await supabase
            .from("resort_submissions")
            .select("data")
            .eq("id", editId)
            .single();

          if (error) throw error;
          if (data?.data) {
            setFormData(data.data);
          }
        } catch (err) {
          console.error("Rehydration error:", err);
          toast.error("Failed to load resort data");
        } finally {
          setIsRehydrating(false);
        }
      };
      fetchResort();
    } else {
      setIsRehydrating(false);
    }
  }, [editId]);

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    if (!editId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("resort_submissions")
        .update({ 
          data: formData, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", editId);

      if (error) throw error;
      toast.success("Progress saved");
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  // --- SUBMIT FINAL FORM ---
  const handleSubmit = async () => {
    if (!editId) {
      toast.error("No submission ID. Please start from Step 1.");
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("resort_submissions")
        .update({ 
          data: formData, 
          status: "pending",
          updated_at: new Date().toISOString() 
        })
        .eq("id", editId);

      if (error) throw error;
      
      toast.success("🎉 Resort submitted! Building your site...");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep === STEPS.length) {
      handleSubmit();
    } else {
      handleSave();
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // --- IMAGE UPLOAD HELPER ---
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
      
      setFormData({
        ...formData,
        [field]: [...(formData[field] || []), ...urls]
      });
      toast.success("Images uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (field: string, index: number) => {
    const images = formData[field] || [];
    setFormData({
      ...formData,
      [field]: images.filter((_: any, i: number) => i !== index)
    });
  };

  // --- RENDER GUARDS ---
  if (isRehydrating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Fetching your resort details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
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
          <Button size="sm" onClick={handleSave} disabled={isSaving || !editId}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 pb-32">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ═════ STEP 1: IDENTITY ═════ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Resort Identity</h1>
                <p className="text-muted-foreground">Basic information about your resort.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Resort Name</Label>
                  <Input 
                    placeholder="e.g. Palawan Collective"
                    value={formData.identity?.resortName || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      identity: { ...formData.identity, resortName: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Owner / Contact Person</Label>
                  <Input 
                    placeholder="Your full name"
                    value={formData.identity?.resortOwner || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      identity: { ...formData.identity, resortOwner: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="owner@resort.com"
                    value={formData.identity?.email || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      identity: { ...formData.identity, email: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input 
                    type="tel"
                    placeholder="+63 917 123 4567"
                    value={formData.identity?.phone || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      identity: { ...formData.identity, phone: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 2: BRAND STORY ═════ */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Brand Story</h1>
                <p className="text-muted-foreground">Tell guests what makes you special.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Tagline</Label>
                  <Input 
                    placeholder="e.g. Paradise Found"
                    value={formData.brandStory?.tagline || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      brandStory: { ...formData.brandStory, tagline: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Short Description</Label>
                  <Textarea 
                    placeholder="Max 200 characters — shown in search results"
                    rows={3}
                    value={formData.brandStory?.shortDescription || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      brandStory: { ...formData.brandStory, shortDescription: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Full Description</Label>
                  <Textarea 
                    placeholder="Your complete resort story"
                    rows={6}
                    value={formData.brandStory?.fullDescription || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      brandStory: { ...formData.brandStory, fullDescription: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 3: ABOUT OWNER ═════ */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">About Owner</h1>
                <p className="text-muted-foreground">Share your story with guests.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Owner Bio</Label>
                  <Textarea 
                    placeholder="Tell guests about yourself and your vision"
                    rows={6}
                    value={formData.aboutOwner?.bio || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      aboutOwner: { ...formData.aboutOwner, bio: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 4: MEDIA ═════ */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Media</h1>
                <p className="text-muted-foreground">Upload your best photos.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Hero Images (up to 5)</Label>
                  <Input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(Array.from(e.target.files || []), 'media.heroImages')}
                    disabled={uploading}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {(formData.media?.heroImages || []).map((url: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <Button 
                          size="icon" 
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage('media.heroImages', i)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Gallery Images (up to 20)</Label>
                  <Input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(Array.from(e.target.files || []), 'media.galleryImages')}
                    disabled={uploading}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {(formData.media?.galleryImages || []).map((url: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <Button 
                          size="icon" 
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage('media.galleryImages', i)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 5: HERO VIDEO ═════ */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Hero Video</h1>
                <p className="text-muted-foreground">Add a video tour of your resort.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>YouTube or Vimeo URL</Label>
                  <Input 
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.media?.videoUrl || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      media: { ...formData.media, videoUrl: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 6: ROOMS ═════ */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
                <p className="text-muted-foreground">Add your room types and pricing.</p>
              </div>
              <div className="space-y-4">
                {(formData.roomTypes || []).map((room: any, i: number) => (
                  <div key={i} className="p-4 border rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Room Type {i + 1}</Label>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => setFormData({
                          ...formData,
                          roomTypes: formData.roomTypes.filter((_: any, j: number) => j !== i)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input 
                      placeholder="Room Name"
                      value={room.name || ""}
                      onChange={(e) => {
                        const rooms = [...formData.roomTypes];
                        rooms[i] = { ...rooms[i], name: e.target.value };
                        setFormData({ ...formData, roomTypes: rooms });
                      }}
                    />
                    <Input 
                      type="number"
                      placeholder="Price per Night (PHP)"
                      value={room.price || ""}
                      onChange={(e) => {
                        const rooms = [...formData.roomTypes];
                        rooms[i] = { ...rooms[i], price: e.target.value };
                        setFormData({ ...formData, roomTypes: rooms });
                      }}
                    />
                    <Textarea 
                      placeholder="Description"
                      rows={2}
                      value={room.description || ""}
                      onChange={(e) => {
                        const rooms = [...formData.roomTypes];
                        rooms[i] = { ...rooms[i], description: e.target.value };
                        setFormData({ ...formData, roomTypes: rooms });
                      }}
                    />
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFormData({
                    ...formData,
                    roomTypes: [...(formData.roomTypes || []), { name: "", price: "", description: "" }]
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Room Type
                </Button>
              </div>
            </div>
          )}

          {/* ═════ STEP 7: AMENITIES ═════ */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Amenities</h1>
                <p className="text-muted-foreground">What features do you offer?</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {['Pool', 'WiFi', 'Restaurant', 'Bar', 'Spa', 'Parking', 'Airport Transfer', 'Beachfront', 'Air Conditioning', 'Hot Water'].map((amenity) => (
                    <Button
                      key={amenity}
                      variant={(formData.amenities || []).includes(amenity) ? "default" : "outline"}
                      onClick={() => {
                        const amenities = formData.amenities || [];
                        setFormData({
                          ...formData,
                          amenities: amenities.includes(amenity)
                            ? amenities.filter((a: string) => a !== amenity)
                            : [...amenities, amenity]
                        });
                      }}
                    >
                      {amenity}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 8: DINING ═════ */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Dining</h1>
                <p className="text-muted-foreground">Food and beverage options.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Dining Options</Label>
                  <Textarea 
                    placeholder="e.g. Breakfast included, Pool bar, In-house restaurant"
                    rows={4}
                    value={formData.dining?.options || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      dining: { ...formData.dining, options: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 9: FAQ ═════ */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
                <p className="text-muted-foreground">Common guest questions.</p>
              </div>
              <div className="space-y-4">
                {(formData.faqs || []).map((faq: any, i: number) => (
                  <div key={i} className="p-4 border rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>FAQ {i + 1}</Label>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => setFormData({
                          ...formData,
                          faqs: formData.faqs.filter((_: any, j: number) => j !== i)
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input 
                      placeholder="Question"
                      value={faq.question || ""}
                      onChange={(e) => {
                        const faqs = [...formData.faqs];
                        faqs[i] = { ...faqs[i], question: e.target.value };
                        setFormData({ ...formData, faqs: faqs });
                      }}
                    />
                    <Textarea 
                      placeholder="Answer"
                      rows={2}
                      value={faq.answer || ""}
                      onChange={(e) => {
                        const faqs = [...formData.faqs];
                        faqs[i] = { ...faqs[i], answer: e.target.value };
                        setFormData({ ...formData, faqs: faqs });
                      }}
                    />
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFormData({
                    ...formData,
                    faqs: [...(formData.faqs || []), { question: "", answer: "" }]
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add FAQ
                </Button>
              </div>
            </div>
          )}

          {/* ═════ STEP 10: HEADER/FOOTER ═════ */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Header & Footer</h1>
                <p className="text-muted-foreground">Navigation and footer settings.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Header Style</Label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2"
                    value={formData.layout?.headerStyle || "blur"}
                    onChange={(e) => setFormData({
                      ...formData,
                      layout: { ...formData.layout, headerStyle: e.target.value }
                    })}
                  >
                    <option value="blur">Blur</option>
                    <option value="solid">Solid</option>
                    <option value="transparent">Transparent</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Footer Text</Label>
                  <Input 
                    placeholder="© 2025 Your Resort Name"
                    value={formData.layout?.footerText || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      layout: { ...formData.layout, footerText: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 11: CONTACT ═════ */}
          {currentStep === 11 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
                <p className="text-muted-foreground">How can guests reach you?</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="info@resort.com"
                    value={formData.location?.contactEmail || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, contactEmail: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input 
                    type="tel"
                    placeholder="+63 917 123 4567"
                    value={formData.location?.phone || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, phone: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Full Address</Label>
                  <Textarea 
                    placeholder="Complete address"
                    rows={3}
                    value={formData.location?.fullAddress || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, fullAddress: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Google Maps Link</Label>
                  <Input 
                    placeholder="https://maps.google.com/..."
                    value={formData.location?.googleMapsLink || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, googleMapsLink: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 12: COLOR PALETTE ═════ */}
          {currentStep === 12 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Color Palette</h1>
                <p className="text-muted-foreground">Customize your brand colors.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-3">
                    <Input 
                      type="color"
                      className="w-20 h-12"
                      value={formData.colorPalette?.primary || "#0EA5E9"}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorPalette: { ...formData.colorPalette, primary: e.target.value }
                      })}
                    />
                    <Input 
                      value={formData.colorPalette?.primary || "#0EA5E9"}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorPalette: { ...formData.colorPalette, primary: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-3">
                    <Input 
                      type="color"
                      className="w-20 h-12"
                      value={formData.colorPalette?.background || "#ffffff"}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorPalette: { ...formData.colorPalette, background: e.target.value }
                      })}
                    />
                    <Input 
                      value={formData.colorPalette?.background || "#ffffff"}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorPalette: { ...formData.colorPalette, background: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-3">
                    <Input 
                      type="color"
                      className="w-20 h-12"
                      value={formData.colorPalette?.text || "#1e293b"}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorPalette: { ...formData.colorPalette, text: e.target.value }
                      })}
                    />
                    <Input 
                      value={formData.colorPalette?.text || "#1e293b"}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorPalette: { ...formData.colorPalette, text: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════ STEP 13: SEO ═════ */}
          {currentStep === 13 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">SEO & Publishing</h1>
                <p className="text-muted-foreground">Search engine settings.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Meta Title</Label>
                  <Input 
                    placeholder="Your resort name for Google"
                    value={formData.seo?.metaTitle || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, metaTitle: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Meta Description</Label>
                  <Textarea 
                    placeholder="Description for search results (150-160 chars)"
                    rows={3}
                    value={formData.seo?.metaDescription || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, metaDescription: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Google Analytics ID</Label>
                  <Input 
                    placeholder="G-XXXXXXXXXX"
                    value={formData.seo?.googleAnalyticsId || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo: { ...formData.seo, googleAnalyticsId: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Publish Setting</Label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2"
                    value={formData.publishing?.publishImmediately ? "yes" : "no"}
                    onChange={(e) => setFormData({
                      ...formData,
                      publishing: { ...formData.publishing, publishImmediately: e.target.value === "yes" }
                    })}
                  >
                    <option value="yes">Yes — Build and publish automatically</option>
                    <option value="no">No — Save as draft for review</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md p-4 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1}
            className="rounded-xl px-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <Button 
            onClick={nextStep}
            className="rounded-xl px-8 bg-primary hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : currentStep === STEPS.length ? (
              "Submit & Build Site"
            ) : (
              "Next Step"
            )} 
            {currentStep !== STEPS.length && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
