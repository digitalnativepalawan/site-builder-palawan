import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Plus, Trash2, Eye } from "lucide-react";

export function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const editId = searchParams.get("edit");
  
  const [loading, setLoading] = useState(!!editId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
    identity: { resortName: "", location: "" },
  });

  useEffect(() => {
    if (!editId) return;

    const fetchResortData = async () => {
      try {
        const { data: submission, error } = await supabase
          .from("resort_submissions")
          .select("*")
          .eq("id", editId)
          .single();

        if (error) throw error;

        if (submission && submission.data) {
          setFormData(submission.data);
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
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

      {/* Step 1: Identity */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Resort Name</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData.identity?.resortName || ""}
              onChange={(e) => setFormData({ ...formData, identity: { ...formData.identity, resortName: e.target.value } })}
              placeholder="Enter resort name"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Location</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData.identity?.location || ""}
              onChange={(e) => setFormData({ ...formData, identity: { ...formData.identity, location: e.target.value } })}
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
            <label className="block mb-2 text-sm font-medium">Tagline</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData.brandStory?.tagline || ""}
              onChange={(e) => setFormData({ ...formData, brandStory: { ...formData.brandStory, tagline: e.target.value } })}
              placeholder="Short catchy tagline"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Short Description</label>
            <textarea
              className="w-full p-3 border rounded-lg"
              rows={3}
              value={formData.brandStory?.shortDescription || ""}
              onChange={(e) => setFormData({ ...formData, brandStory: { ...formData.brandStory, shortDescription: e.target.value } })}
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Full Description</label>
            <textarea
              className="w-full p-3 border rounded-lg"
              rows={5}
              value={formData.brandStory?.fullDescription || ""}
              onChange={(e) => setFormData({ ...formData, brandStory: { ...formData.brandStory, fullDescription: e.target.value } })}
              placeholder="Detailed description about your resort"
            />
          </div>
        </div>
      </div>

      {/* Step 3: Amenities */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Amenities</h2>
        <div className="space-y-2">
          {(formData.amenities || []).map((amenity: string, i: number) => (
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 p-3 border rounded-lg"
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

      {/* Step 4: Room Types */}
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
              <input
                className="w-full p-3 border rounded-lg"
                value={room.name || ""}
                onChange={(e) => {
                  const newRooms = [...(formData.roomTypes || [])];
                  newRooms[i] = { ...newRooms[i], name: e.target.value };
                  setFormData({ ...formData, roomTypes: newRooms });
                }}
                placeholder="Room name (e.g. Deluxe Ocean View)"
              />
              <input
                className="w-full p-3 border rounded-lg"
                value={room.price || ""}
                onChange={(e) => {
                  const newRooms = [...(formData.roomTypes || [])];
                  newRooms[i] = { ...newRooms[i], price: e.target.value };
                  setFormData({ ...formData, roomTypes: newRooms });
                }}
                placeholder="Price per night"
              />
              <input
                className="w-full p-3 border rounded-lg"
                value={room.description || ""}
                onChange={(e) => {
                  const newRooms = [...(formData.roomTypes || [])];
                  newRooms[i] = { ...newRooms[i], description: e.target.value };
                  setFormData({ ...formData, roomTypes: newRooms });
                }}
                placeholder="Room description"
              />
              <input
                className="w-full p-3 border rounded-lg"
                value={room.maxGuests || ""}
                onChange={(e) => {
                  const newRooms = [...(formData.roomTypes || [])];
                  newRooms[i] = { ...newRooms[i], maxGuests: e.target.value };
                  setFormData({ ...formData, roomTypes: newRooms });
                }}
                placeholder="Max guests"
              />
              <input
                className="w-full p-3 border rounded-lg"
                value={room.bedType || ""}
                onChange={(e) => {
                  const newRooms = [...(formData.roomTypes || [])];
                  newRooms[i] = { ...newRooms[i], bedType: e.target.value };
                  setFormData({ ...formData, roomTypes: newRooms });
                }}
                placeholder="Bed type (e.g. King, Twin)"
              />
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => {
            setFormData({ ...formData, roomTypes: [...(formData.roomTypes || []), { name: "", price: "", description: "", maxGuests: "", bedType: "" }] });
          }}>
            <Plus className="h-4 w-4 mr-2" /> Add Room Type
          </Button>
        </div>
      </div>

      {/* Step 5: Location & Contact */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Full Address</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData.location?.fullAddress || ""}
              onChange={(e) => setFormData({ ...formData, location: { ...formData.location, fullAddress: e.target.value } })}
              placeholder="Complete address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Email</label>
              <input
                className="w-full p-3 border rounded-lg"
                value={formData.location?.contactEmail || ""}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, contactEmail: e.target.value } })}
                placeholder="contact@resort.com"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Phone</label>
              <input
                className="w-full p-3 border rounded-lg"
                value={formData.location?.phone || ""}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, phone: e.target.value } })}
                placeholder="+63 xxx xxx xxxx"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">WhatsApp</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData.location?.whatsapp || ""}
              onChange={(e) => setFormData({ ...formData, location: { ...formData.location, whatsapp: e.target.value } })}
              placeholder="WhatsApp number"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Google Maps Link</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData.location?.googleMapsLink || ""}
              onChange={(e) => setFormData({ ...formData, location: { ...formData.location, googleMapsLink: e.target.value } })}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>

      {/* Step 6: FAQ */}
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
              <input
                className="w-full p-3 border rounded-lg"
                value={item.question || ""}
                onChange={(e) => {
                  const newFaq = [...(formData.faq || [])];
                  newFaq[i] = { ...newFaq[i], question: e.target.value };
                  setFormData({ ...formData, faq: newFaq });
                }}
                placeholder="Question"
              />
              <textarea
                className="w-full p-3 border rounded-lg"
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

      {/* Step 7: Media (Hero & Gallery Images) */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Media</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Hero Image URL</label>
            <input
              className="w-full p-3 border rounded-lg"
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
            <label className="block mb-2 text-sm font-medium">Video URL (YouTube/Vimeo)</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData.media?.videoUrl || ""}
              onChange={(e) => setFormData({ ...formData, media: { ...formData.media, videoUrl: e.target.value } })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Gallery Images (comma-separated URLs)</label>
            <textarea
              className="w-full p-3 border rounded-lg"
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

      {/* Step 8: Color Palette */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Primary Color</label>
            <input
              type="color"
              className="w-full h-12 border rounded-lg"
              value={formData.colorPalette?.primary || "#0EA5E9"}
              onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, primary: e.target.value } })}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Background Color</label>
            <input
              type="color"
              className="w-full h-12 border rounded-lg"
              value={formData.colorPalette?.background || "#ffffff"}
              onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, background: e.target.value } })}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Text Color</label>
            <input
              type="color"
              className="w-full h-12 border rounded-lg"
              value={formData.colorPalette?.text || "#1e293b"}
              onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, text: e.target.value } })}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Accent Color</label>
            <input
              type="color"
              className="w-full h-12 border rounded-lg"
              value={formData.colorPalette?.accent || "#f59e0b"}
              onChange={(e) => setFormData({ ...formData, colorPalette: { ...formData.colorPalette, accent: e.target.value } })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
