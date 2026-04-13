import { useState, useEffect, useRef } from "react";
import { TField, ChipGrid, ToggleCheck, PillGroup, ImageDropzone, ImagePreview, RESORT_TYPES, RESORT_ICONS, PALAWAN_FEATURES, DINING_OPTIONS } from "./FormPrimitives";
import { ImageFileUploader } from "./ImageUploader";
import { Plus, Trash2 } from "lucide-react";

// Each step component receives: data, onChange, submissionId, errors
interface StepProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  submissionId?: string | null;
  errors?: Record<string, string>;
}

// ═══ Step 1: Identity ═══
export function Step1_Identity({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Let's start with the essentials. This is how your resort will appear to guests.</p>
      <ChipGrid label="What best describes your property?"
        chips={RESORT_TYPES.map(t => ({ id: t, label: t.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()), icon: RESORT_ICONS[t] }))}
        selected={data.resortType ? [data.resortType] : []} onChange={(v) => onChange({ ...data, resortType: v[0] })} multi={false} />
      <TField label="Resort Name" placeholder="e.g., Palawan Collective" value={data.resortName} onChange={(v) => onChange({ ...data, resortName: v })} />
      <TField label="Resort Owner" placeholder="Your full name" value={data.resortOwner} onChange={(v) => onChange({ ...data, resortOwner: v })} />
      <TField label="Contact Email" placeholder="hello@yourresort.com" type="email" value={data.email} onChange={(v) => onChange({ ...data, email: v })} sub="Primary contact for guests" />
      <TField label="Phone Number" placeholder="+63 917 000 0000" type="tel" value={data.phone} onChange={(v) => onChange({ ...data, phone: v })} sub="Include country code" />
    </div>
  );
}

// ═══ Step 2: Brand Story ═══
export function Step2_BrandStory({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Tell us your resort's story. This shapes the voice of your website.</p>
      <TField label="Tagline" placeholder="e.g., Where Paradise Meets Palawan" value={data.tagline} onChange={(v) => onChange({ ...data, tagline: v })} sub="A catchy one-liner — shown on the hero" />
      <TField label="Short Description" placeholder="2-3 sentences about your resort" value={data.shortDescription} onChange={(v) => onChange({ ...data, shortDescription: v })} textarea sub="Used on homepage and social sharing" />
      <TField label="Full Story" placeholder="Tell the full story of your resort..." value={data.fullDescription} onChange={(v) => onChange({ ...data, fullDescription: v })} textarea rows={5} sub="For the 'About' section on your site" />
      <TField label="Mission Statement" placeholder="Your resort's guiding philosophy..." value={data.missionStatement} onChange={(v) => onChange({ ...data, missionStatement: v })} textarea sub="What drives your hospitality" />
    </div>
  );
}

// ═══ Step 3: About the Owner ═══
export function Step3_AboutOwner({ data, onChange, submissionId }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Guests connect with the people behind the property.</p>

      {/* Owner portrait — native file upload */}
      <ImageFileUploader
        submissionId={submissionId}
        label="Owner Portrait"
        sublabel="A clear, professional photo. Click to upload."
        existingUrl={data.ownerPhotoUrl}
        onUploaded={(urls) => onChange({ ...data, ownerPhotoUrl: urls[0] || data.ownerPhotoUrl || "" })}
      />

      <TField label="Owner Bio" placeholder="A brief introduction about yourself..." value={data.ownerBio} onChange={(v) => onChange({ ...data, ownerBio: v })} textarea sub="Your background, passion, and story" />
    </div>
  );
}

// ═══ Step 4: Media & Photos ═══
export function Step4_Media({ data, onChange, submissionId }: StepProps) {
  const [previews, setPreviews] = useState<{ url: string; file: File | null }[]>([]);

  useEffect(() => {
    const hero = (data.heroImages as string[] | undefined)?.filter(Boolean) || [];
    const gallery = (data.galleryImages as string[] | undefined)?.filter(Boolean) || [];
    const allImages = [...hero, ...gallery];
    setPreviews(allImages.map(u => ({ url: u, file: null })));
  }, [data.heroImages, data.galleryImages]);

  const updatePreviews = (newPreviews: { url: string; file: File | null }[]) => {
    setPreviews(newPreviews);
    const allUrls = newPreviews.map(p => p.url);
    const heroCount = Math.min(2, allUrls.length);
    onChange({
      heroImages: allUrls.slice(0, heroCount),
      galleryImages: allUrls.slice(heroCount),
      logoUrl: data.logoUrl || "",
    });
  };

  const uploadToSupabase = async (files: File[]) => {
    if (!submissionId) return;
    const existing = [...previews];
    const newFiles: { url: string; file: File | null }[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const localUrl = URL.createObjectURL(file);
      newFiles.push({ url: localUrl, file });
    }

    const updatedPreviews = [...existing, ...newFiles];
    updatePreviews(updatedPreviews);

    // Upload each to Supabase
    const bucket = supabase.storage.from("resort-assets");
    const finalUrls: string[] = [];

    for (const p of updatedPreviews) {
      if (p.file) {
        const ext = p.file.name.split(".").pop() || "jpg";
        const path = `${submissionId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await bucket.upload(path, p.file, { upsert: true, contentType: p.file.type });
        if (!error) {
          const { data: { publicUrl } } = bucket.getPublicUrl(path);
          finalUrls.push(publicUrl);
        } else {
          finalUrls.push(p.url); // fallback to local URL
        }
      } else {
        finalUrls.push(p.url);
      }
    }

    // Update with Supabase URLs
    const heroCount = Math.min(2, finalUrls.length);
    onChange({
      heroImages: finalUrls.slice(0, heroCount),
      galleryImages: finalUrls.slice(heroCount),
      logoUrl: data.logoUrl || "",
    });
  };

  const removeImage = (i: number) => {
    const remaining = previews.filter((_, idx) => idx !== i);
    updatePreviews(remaining);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Upload your best photos. First 2 become hero images; rest go to the gallery.</p>

      <ImageDropzone onFiles={uploadToSupabase} />

      <ImagePreview
        images={previews.map(p => p.url)}
        onRemove={removeImage}
        roleLabels={previews.map((_, i) => i === 0 ? "Hero 1" : i === 1 ? "Hero 2" : "Gallery")}
      />
      {previews.length > 0 && (
        <p className="text-xs text-muted-foreground">{previews.length} photo{previews.length > 1 ? "s" : ""} uploaded — click a photo to remove</p>
      )}
    </div>
  );
}

// ═══ Step 5: Hero Video ═══
export function Step5_HeroVideo({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Add a background video to your hero section for an immersive feel.</p>
      <TField label="Video URL" placeholder="https://www.youtube.com/watch?v=..." value={data.videoUrl} onChange={(v) => onChange({ ...data, videoUrl: v })} sub="YouTube or Vimeo link" />
      <TField label="Video Caption" placeholder="e.g., A morning at Palawan Collective" value={data.videoCaption} onChange={(v) => onChange({ ...data, videoCaption: v })} sub="Shown below the video" />
      <ToggleCheck label="Autoplay Video" sub="Video starts automatically when page loads" checked={data.videoAutoplay !== false} onChange={(v) => onChange({ ...data, videoAutoplay: v })} />
    </div>
  );
}

// ═══ Step 6: Rooms & Villas ═══
export function Step6_Rooms({ data, onChange }: StepProps) {
  const rooms = data.roomTypes || [];
  const addRoom = () => onChange({ ...data, roomTypes: [...rooms, { name: "", description: "", price: "", maxGuests: 2, amenities: [], imageUrl: "" }] });
  const updateRoom = (i: number, field: string, value: any) => {
    const updated = [...rooms]; updated[i] = { ...updated[i], [field]: value };
    onChange({ ...data, roomTypes: updated });
  };
  const removeRoom = (i: number) => onChange({ ...data, roomTypes: rooms.filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Define your room types, pricing, and capacity.</p>
      {rooms.map((r: any, i: number) => (
        <div key={i} className="space-y-3 p-4 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Room {i + 1}</span>
            <button onClick={() => removeRoom(i)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"><Trash2 className="w-4 h-4" /></button>
          </div>
          <TField label="Room Name" placeholder="e.g., Deluxe Ocean View" value={r.name} onChange={(v) => updateRoom(i, "name", v)} />
          <TField label="Description" placeholder="What makes this room special..." value={r.description} onChange={(v) => updateRoom(i, "description", v)} textarea rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <TField label="Price / Night" placeholder="₱5,000" value={r.price} onChange={(v) => updateRoom(i, "price", v)} />
            <TField label="Max Guests" type="tel" placeholder="2" value={String(r.maxGuests || 2)} onChange={(v) => updateRoom(i, "maxGuests", Number(v) || 0)} />
          </div>
          <TField label="Room Photo URL" placeholder="https://..." value={r.imageUrl} onChange={(v) => updateRoom(i, "imageUrl", v)} sub="Direct image link" />
        </div>
      ))}
      <button type="button" onClick={addRoom} className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add Room Type
      </button>
    </div>
  );
}

// ═══ Step 7: Guest Comforts ═══
export function Step7_Amenities({ data, onChange }: StepProps) {
  const rd = data.roomDetails || {};
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Select all the features and comforts your resort offers.</p>
      <ChipGrid label="Palawan Features"
        chips={PALAWAN_FEATURES}
        selected={data.features || []}
        onChange={(v) => onChange({ ...data, features: v })} />
      <ChipGrid label="Dining Options"
        chips={DINING_OPTIONS}
        selected={data.dining || []}
        onChange={(v) => onChange({ ...data, dining: v })} />
      <div className="space-y-3">
        <label className="text-sm font-medium block">Room Comforts</label>
        <ToggleCheck label="Air Conditioning" checked={rd.ac} onChange={(v) => onChange({ ...data, roomDetails: { ...rd, ac: v } })} />
        <ToggleCheck label="Hot Water" checked={rd.hotWater} onChange={(v) => onChange({ ...data, roomDetails: { ...rd, hotWater: v } })} />
        <ToggleCheck label="Breakfast Included" checked={rd.breakfast} onChange={(v) => onChange({ ...data, roomDetails: { ...rd, breakfast: v } })} />
        <ToggleCheck label="Solar Power" sub="Eco-friendly energy" checked={rd.solarPower} onChange={(v) => onChange({ ...data, roomDetails: { ...rd, solarPower: v } })} />
        <ToggleCheck label="Starlink Internet" checked={rd.starlink} onChange={(v) => onChange({ ...data, roomDetails: { ...rd, starlink: v } })} />
        <ToggleCheck label="Fiber Optic Internet" checked={rd.fiberInternet} onChange={(v) => onChange({ ...data, roomDetails: { ...rd, fiberInternet: v } })} />
      </div>
      <PillGroup label="Internet Type" options={[{ value: "Fiber", label: "Fiber" }, { value: "Starlink", label: "Starlink" }, { value: "None", label: "None" }]} value={rd.wifi || ""} onChange={(v) => onChange({ ...data, roomDetails: { ...rd, wifi: v } })} />
      <TField label="Total Rooms" type="tel" placeholder="12" value={String(rd.totalRooms || "")} onChange={(v) => onChange({ ...data, roomDetails: { ...rd, totalRooms: Number(v) || 0 } })} />
    </div>
  );
}

// ═══ Step 8: Dining & Experiences ═══
export function Step8_Dining({ data, onChange }: StepProps) {
  const items = data.diningOptions || [];
  const addDining = () => onChange({ ...data, diningOptions: [...items, { name: "", description: "", type: "restaurant" }] });
  const updateItem = (i: number, field: string, value: any) => { const u = [...items]; u[i] = { ...u[i], [field]: value }; onChange({ ...data, diningOptions: u }); };
  const removeItem = (i: number) => onChange({ ...data, diningOptions: items.filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Define your restaurant, bar, and unique guest experiences.</p>
      {items.map((d: any, i: number) => (
        <div key={i} className="space-y-3 p-4 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Experience {i + 1}</span>
            <button onClick={() => removeItem(i)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"><Trash2 className="w-4 h-4" /></button>
          </div>
          <TField label="Name" placeholder="e.g., Sunset Bar" value={d.name} onChange={(v) => updateItem(i, "name", v)} />
          <TField label="Description" placeholder="Brief description..." value={d.description} onChange={(v) => updateItem(i, "description", v)} textarea rows={2} />
          <PillGroup label="Type" options={[{ value: "restaurant", label: "Restaurant" }, { value: "bar", label: "Bar" }, { value: "cafe", label: "Cafe" }, { value: "pool-bar", label: "Pool Bar" }, { value: "room-service", label: "Room Service" }]} value={d.type || "restaurant"} onChange={(v) => updateItem(i, "type", v)} />
        </div>
      ))}
      <button type="button" onClick={addDining} className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add Dining or Experience
      </button>
      <TField label="Experiences List" placeholder="Island hopping, snorkeling, cultural tours..." value={(data.experiences || []).join(", ")} onChange={(v) => onChange({ ...data, experiences: v.split(",").map((s: string) => s.trim()).filter(Boolean) })} textarea sub="Comma-separated list" />
    </div>
  );
}

// ═══ Step 9: FAQ ═══
export function Step9_FAQ({ data, onChange }: StepProps) {
  const faqs = data.faqs || [];
  const addFaq = () => onChange({ ...data, faqs: [...faqs, { question: "", answer: "" }] });
  const updateFaq = (i: number, field: string, value: string) => { const u = [...faqs]; u[i] = { ...u[i], [field]: value }; onChange({ ...data, faqs: u }); };
  const removeFaq = (i: number) => onChange({ ...data, faqs: faqs.filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Anticipate guest questions and provide clear answers.</p>
      {faqs.map((f: any, i: number) => (
        <div key={i} className="space-y-3 p-4 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Q{i + 1}</span>
            <button onClick={() => removeFaq(i)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"><Trash2 className="w-4 h-4" /></button>
          </div>
          <TField label="Question" placeholder="e.g., What time is check-in?" value={f.question} onChange={(v) => updateFaq(i, "question", v)} />
          <TField label="Answer" placeholder="Check-in starts at..." value={f.answer} onChange={(v) => updateFaq(i, "answer", v)} textarea rows={2} />
        </div>
      ))}
      <button type="button" onClick={addFaq} className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add FAQ
      </button>
    </div>
  );
}

// ═══ Step 10: Header & Footer ═══
export function Step10_HeaderFooter({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Customize the top and bottom of your site.</p>
      <PillGroup label="Header Style" options={[{ value: "solid", label: "Solid" }, { value: "transparent", label: "Transparent" }, { value: "minimal", label: "Minimal" }]} value={data.headerStyle || "transparent"} onChange={(v) => onChange({ ...data, headerStyle: v })} />
      <PillGroup label="Footer Style" options={[{ value: "full", label: "Full" }, { value: "minimal", label: "Minimal" }, { value: "compact", label: "Compact" }]} value={data.footerStyle || "full"} onChange={(v) => onChange({ ...data, footerStyle: v })} />
      <ToggleCheck label="Sticky Header" sub="Header stays visible as users scroll" checked={data.headerSticky !== false} onChange={(v) => onChange({ ...data, headerSticky: v })} />
      <ToggleCheck label="Back to Top Button" checked={data.showBackToTop !== false} onChange={(v) => onChange({ ...data, showBackToTop: v })} />
      <TField label="Footer Copyright" placeholder="© 2026 {resortName}. All rights reserved." value={data.footerCopyright} onChange={(v) => onChange({ ...data, footerCopyright: v })} sub="Use {'{resortName}'} as placeholder" />
    </div>
  );
}

// ═══ Step 11: Contact & Location ═══
export function Step11_Contact({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">How do guests find and reach your resort?</p>
      <TField label="Full Address" placeholder="Brgy. San Miguel, El Nido, Palawan" value={data.fullAddress} onChange={(v) => onChange({ ...data, fullAddress: v })} />
      <TField label="Google Maps Link" placeholder="https://maps.google.com/..." value={data.googleMapsLink} onChange={(v) => onChange({ ...data, googleMapsLink: v })} sub="Embed location on your site" />
      <TField label="WhatsApp Number" placeholder="+639170000000" value={data.whatsapp} onChange={(v) => onChange({ ...data, whatsapp: v })} sub="For WhatsApp chat button" />
      <TField label="Facebook URL" placeholder="https://facebook.com/..." value={data.facebook} onChange={(v) => onChange({ ...data, facebook: v })} />
      <TField label="Instagram URL" placeholder="https://instagram.com/..." value={data.instagram} onChange={(v) => onChange({ ...data, instagram: v })} />
      <TField label="TikTok URL" placeholder="https://tiktok.com/@" value={data.tiktok} onChange={(v) => onChange({ ...data, tiktok: v })} />
      <div className="grid grid-cols-2 gap-3">
        <TField label="Check-in Time" placeholder="14:00" value={data.checkInTime || "14:00"} onChange={(v) => onChange({ ...data, checkInTime: v })} />
        <TField label="Checkout Time" placeholder="11:00" value={data.checkOutTime || "11:00"} onChange={(v) => onChange({ ...data, checkOutTime: v })} />
      </div>
    </div>
  );
}

// ═══ Step 12: Colors & Style ═══
export function Step12_Colors({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Set the visual tone of your resort website.</p>
      <div className="space-y-3">
        <label className="text-sm font-medium block">Color Palette</label>
        {[
          { key: "primary", label: "Primary (Brand)", default: "#B8860B" },
          { key: "secondary", label: "Secondary", default: "#1E40AF" },
          { key: "accent", label: "Accent", default: "#F59E0B" },
          { key: "background", label: "Background", default: "#FFFFFF" },
          { key: "text", label: "Text", default: "#0f172a" },
          { key: "heading", label: "Heading", default: "#0f172a" },
        ].map((c) => (
          <div key={c.key} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface">
            <input type="color" value={data[c.key] || c.default}
              onChange={(e) => onChange({ ...data, [c.key]: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground font-mono">{data[c.key] || c.default}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Heading Font", options: ["Space Grotesk", "Playfair Display", "Inter", "Poppins"], key: "headingFont", default: "Space Grotesk" },
          { label: "Body Font", options: ["Inter", "Poppins", "DM Sans", "Nunito"], key: "bodyFont", default: "Inter" },
        ].map((f) => (
          <PillGroup key={f.key} label={f.label} options={f.options.map((o) => ({ value: o, label: o }))} value={data[f.key] || f.default} onChange={(v) => onChange({ ...data, [f.key]: v })} />
        ))}
      </div>
    </div>
  );
}

// ═══ Step 13: SEO & Publish ═══
export function Step13_SEO({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Optimize for search engines and generate your site.</p>
      <TField label="Meta Title" placeholder={data.identity?.resortName || "Your Resort"} value={data.metaTitle} onChange={(v) => onChange({ ...data, metaTitle: v })} sub="Shown in Google (60 chars max)" />
      <TField label="Meta Description" placeholder="A brief description for search engines..." value={data.metaDescription} onChange={(v) => onChange({ ...data, metaDescription: v })} textarea rows={2} sub="What appears under your title in Google (160 chars)" />
      <TField label="Meta Keywords" placeholder="palawan, resort, boutique hotel, beach..." value={data.metaKeywords} onChange={(v) => onChange({ ...data, metaKeywords: v })} sub="Comma-separated" />
      <TField label="Google Analytics ID" placeholder="G-XXXXXXXXXX" value={data.googleAnalyticsId} onChange={(v) => onChange({ ...data, googleAnalyticsId: v })} />
      <ToggleCheck label="Publish Immediately" sub="Go live as soon as the site is generated" checked={data.publishImmediately} onChange={(v) => onChange({ ...data, publishImmediately: v })} />
    </div>
  );
}
