import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Plus, Trash2, Eye, Smartphone, Tablet, Monitor, Facebook, Instagram, Youtube, Wifi } from "lucide-react";

export function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const editId = searchParams.get("edit");
  
  const [loading, setLoading] = useState(!!editId);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      {/* Step 3: Social Media */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Facebook className="h-5 w-5" /> Social Media Links
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Facebook URL</Label>
              <Input
                value={formData.socialMedia?.facebook || ""}
                onChange={(e) => updateSocial("facebook", e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label>Instagram URL</Label>
              <Input
                value={formData.socialMedia?.instagram || ""}
                onChange={(e) => updateSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/yourpage"
              />
            </div>
            <div>
              <Label>TikTok URL</Label>
              <Input
                value={formData.socialMedia?.tiktok || ""}
                onChange={(e) => updateSocial("tiktok", e.target.value)}
                placeholder="https://tiktok.com/@yourpage"
              />
            </div>
            <div>
              <Label>YouTube URL</Label>
              <Input
                value={formData.socialMedia?.youtube || ""}
                onChange={(e) => updateSocial("youtube", e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
          </div>
          <div>
            <Label>WhatsApp Number</Label>
            <Input
              value={formData.socialMedia?.whatsapp || ""}
              onChange={(e) => updateSocial("whatsapp", e.target.value)}
              placeholder="+63 xxx xxx xxxx"
            />
          </div>
          <div className="flex gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.socialMedia?.showInHeader || false}
                onCheckedChange={(v) => updateSocial("showInHeader", v)}
              />
              <Label>Show in Header</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.socialMedia?.showInFooter || false}
                onCheckedChange={(v) => updateSocial("showInFooter", v)}
              />
              <Label>Show in Footer</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Header Settings */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5" /> Header Settings
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
            <div>
              <Label>Logo URL</Label>
              <Input
                value={formData.header?.logoUrl || ""}
                onChange={(e) => updateHeader("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.header?.sticky || false}
              onCheckedChange={(v) => updateHeader("sticky", v)}
            />
            <Label>Sticky Header (stays on scroll)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.header?.transparent || false}
              onCheckedChange={(v) => updateHeader("transparent", v)}
            />
            <Label>Transparent Header (over hero image)</Label>
          </div>
          <div>
            <Label>Navigation Links</Label>
            <div className="space-y-2 mt-2">
              {formData.header?.navigationLinks?.map((link: any, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={link.label}
                    onChange={(e) => {
                      const newLinks = [...formData.header.navigationLinks];
                      newLinks[i] = { ...newLinks[i], label: e.target.value };
                      updateHeader("navigationLinks", newLinks);
                    }}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...formData.header.navigationLinks];
                      newLinks[i] = { ...newLinks[i], url: e.target.value };
                      updateHeader("navigationLinks", newLinks);
                    }}
                    placeholder="#section"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newLinks = formData.header.navigationLinks.filter((_: any, idx: number) => idx !== i);
                      updateHeader("navigationLinks", newLinks);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  updateHeader("navigationLinks", [...(formData.header.navigationLinks || []), { label: "", url: "" }]);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 5: Footer Settings */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Wifi className="h-5 w-5" /> Footer Settings
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Copyright Text</Label>
            <Input
              value={formData.footer?.copyrightText || ""}
              onChange={(e) => updateFooter("copyrightText", e.target.value)}
              placeholder="© 2025 My Resort. All rights reserved."
            />
          </div>
          <div>
            <Label>Footer Columns</Label>
            <Select
              value={String(formData.footer?.columns || 3)}
              onValueChange={(v) => updateFooter("columns", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.footer?.showSocialIcons || false}
              onCheckedChange={(v) => updateFooter("showSocialIcons", v)}
            />
            <Label>Show Social Icons in Footer</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.footer?.showContactInfo || false}
              onCheckedChange={(v) => updateFooter("showContactInfo", v)}
            />
            <Label>Show Contact Info in Footer</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.footer?.showNavigation || false}
              onCheckedChange={(v) => updateFooter("showNavigation", v)}
            />
            <Label>Show Navigation Links in Footer</Label>
          </div>
        </div>
      </div>

      {/* Step 6: Amenities */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Amenities</h2>
        <div className="space-y-2">
          {(formData.amenities || []).map((amenity: string, i: number) => (
            <div key={i} className="flex gap-2">
              <Input
                value={amenity}
                onChange={(e) => {
                  const newAmenities = [...(formData.amenities || [])];
                  newAmenities[i] = e.target.value;
                  setFormData({ ...formData, amenities: newAmenities });
                }}
                placeholder="Amenity name"
              />
              <Button variant="destructive" size="icon" onClick={() => {
                const newAmenities = (formData.amenities || []).filter((_: any, idx: number) => idx !== i);
                setFormData({ ...formData, amenities: newAmenities });
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => {
            setFormData({ ...formData, amenities: [...(formData.amenities || []), ""] });
          }}>
            <Plus className="h-4 w-4 mr-2" /> Add Amenity
          </Button>
        </div>
      </div>

      {/* Step 7: Room Types */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Room Types</h2>
        <div className="space-y-4">
          {(formData.roomTypes || []).map((room: any, i: number) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Room {i + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => {
                  const newRooms = (formData.roomTypes || []).filter((_: any, idx: number) => idx !== i);
                  setFormData({ ...formData, roomTypes: newRooms });
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={room.name || ""}
                onChange={(e) => {
                  const newRooms = [...(formData.roomTypes || [])];
                  newRooms[i] = { ...newRooms[i], name: e.target.value };
                  setFormData({ ...formData, roomTypes: newRooms });
                }}
                placeholder="Room name"
              />
              <Input
                value={room.price || ""}
                onChange={(e) => {
                  const newRooms = [...(formData.roomTypes || [])];
                  newRooms[i] = { ...newRooms[i], price: e.target.value };
                  setFormData({ ...formData, roomTypes: newRooms });
                }}
                placeholder="Price per night"
              />
              <Input
                value={room.description || ""}
                onChange={(e) => {
                  const newRooms = [...(formData.roomTypes || [])];
                  newRooms[i] = { ...newRooms[i], description: e.target.value };
                  setFormData({ ...formData, roomTypes: newRooms });
                }}
                placeholder="Description"
              />
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => {
            setFormData({ ...formData, roomTypes: [...(formData.roomTypes || []), { name: "", price: "", description: "" }] });
          }}>
            <Plus className="h-4 w-4 mr-2" /> Add Room Type
          </Button>
        </div>
      </div>

      {/* Step 8: Location & Contact */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
        <div className="space-y-4">
          <div>
            <Label>Full Address</Label>
            <Input
              value={formData.location?.fullAddress || ""}
              onChange={(e) => updateNested("location", "fullAddress", e.target.value)}
              placeholder="Complete address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                value={formData.location?.contactEmail || ""}
                onChange={(e) => updateNested("location", "contactEmail", e.target.value)}
                placeholder="contact@resort.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.location?.phone || ""}
                onChange={(e) => updateNested("location", "phone", e.target.value)}
                placeholder="+63 xxx xxx xxxx"
              />
            </div>
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              value={formData.location?.whatsapp || ""}
              onChange={(e) => updateNested("location", "whatsapp", e.target.value)}
              placeholder="WhatsApp number"
            />
          </div>
          <div>
            <Label>Google Maps Link</Label>
            <Input
              value={formData.location?.googleMapsLink || ""}
              onChange={(e) => updateNested("location", "googleMapsLink", e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>

      {/* Step 9: FAQ */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">FAQ</h2>
        <div className="space-y-4">
          {(formData.faq || []).map((item: any, i: number) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Q&A {i + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => {
                  const newFaq = (formData.faq || []).filter((_: any, idx: number) => idx !== i);
                  setFormData({ ...formData, faq: newFaq });
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={item.question || ""}
                onChange={(e) => {
                  const newFaq = [...(formData.faq || [])];
                  newFaq[i] = { ...newFaq[i], question: e.target.value };
                  setFormData({ ...formData, faq: newFaq });
                }}
                placeholder="Question"
              />
              <Textarea
                rows={3}
                value={item.answer || ""}
                onChange={(e) => {
                  const newFaq = [...(formData.faq || [])];
                  newFaq[i] = { ...newFaq[i], answer: e.target.value };
                  setFormData({ ...formData, faq: newFaq });
                }}
                placeholder="Answer"
              />
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => {
            setFormData({ ...formData, faq: [...(formData.faq || []), { question: "", answer: "" }] });
          }}>
            <Plus className="h-4 w-4 mr-2" /> Add FAQ
          </Button>
        </div>
      </div>

      {/* Step 10: Media */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Media</h2>
        <div className="space-y-4">
          <div>
            <Label>Hero Image URL</Label>
            <Input
              value={formData.media?.heroImages?.[0] || ""}
              onChange={(e) => setFormData({ 
                ...formData, 
                media: { 
                  ...formData.media, 
                  heroImages: [e.target.value, ...(formData.media?.heroImages?.slice(1) || [])] 
                } 
              })}
              placeholder="https://example.com/hero.jpg"
            />
          </div>
          <div>
            <Label>Video URL (YouTube/Vimeo)</Label>
            <Input
              value={formData.media?.videoUrl || ""}
              onChange={(e) => setFormData({ ...formData, media: { ...formData.media, videoUrl: e.target.value } })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <Label>Gallery Images (one URL per line)</Label>
            <Textarea
              rows={4}
              value={(formData.media?.galleryImages || []).join("\n")}
              onChange={(e) => setFormData({ 
                ...formData, 
                media: { 
                  ...formData.media, 
                  galleryImages: e.target.value.split("\n").filter(url => url.trim()) 
                } 
              })}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </div>
        </div>
      </div>

      {/* Step 11: Color Palette */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Primary Color</Label>
            <Input
              type="color"
              value={formData.colorPalette?.primary || "#0EA5E9"}
              onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, primary: e.target.value } })}
              className="h-12"
            />
          </div>
          <div>
            <Label>Background Color</Label>
            <Input
              type="color"
              value={formData.colorPalette?.background || "#ffffff"}
              onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, background: e.target.value } })}
              className="h-12"
            />
          </div>
          <div>
            <Label>Text Color</Label>
            <Input
              type="color"
              value={formData.colorPalette?.text || "#1e293b"}
              onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, text: e.target.value } })}
              className="h-12"
            />
          </div>
          <div>
            <Label>Accent Color</Label>
            <Input
              type="color"
              value={formData.colorPalette?.accent || "#f59e0b"}
              onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, accent: e.target.value } })}
              className="h-12"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
