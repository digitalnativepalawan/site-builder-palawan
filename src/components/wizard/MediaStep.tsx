import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, ImagePlus, Upload, Trash2 } from "lucide-react";

import { mediaSchema, type MediaValues } from "@/lib/schema";
import { useWizard } from "@/context/wizard-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MediaStepProps {
  onStepComplete: () => void;
}

export function MediaStep({ onStepComplete }: MediaStepProps) {
  const { submissionId, saveStepData } = useWizard();
  const [uploading, setUploading] = useState(false);

  // Local file state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFiles, setHeroFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // Public URL state (populated after upload or manual URL entry)
  const [logoUrl, setLogoUrl] = useState("");
  const [heroUrls, setHeroUrls] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<MediaValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: { heroImages: [], galleryImages: [], logoUrl: "" },
    mode: "onBlur",
  });

  const handleFileSelect = (setter: (f: File | File[]) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setter(files.length === 1 ? files[0] : files);
  };

  const createPreview = (file: File) => URL.createObjectURL(file);

  const uploadToSupabase = useCallback(async () => {
    if (!submissionId) throw new Error("Missing submission ID");

    const uploaded: MediaValues = { heroImages: [], galleryImages: [], logoUrl: "" };
    const bucket = supabase.storage.from("resort-assets");

    // Helper: upload single file
    const uploadOne = async (file: File, type: "logo" | "hero" | "gallery") => {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${submissionId}/${type}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await bucket.upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = bucket.getPublicUrl(path);
      return data.publicUrl;
    };

    // Upload logo
    if (logoFile) uploaded.logoUrl = await uploadOne(logoFile, "logo");
    else uploaded.logoUrl = getValues("logoUrl");

    // Upload heroes
    if (heroFiles.length) {
      for (const f of heroFiles) uploaded.heroImages!.push(await uploadOne(f, "hero"));
    } else uploaded.heroImages = getValues("heroImages");

    // Upload gallery
    if (galleryFiles.length) {
      for (const f of galleryFiles) uploaded.galleryImages!.push(await uploadOne(f, "gallery"));
    } else uploaded.galleryImages = getValues("galleryImages");

    return mediaSchema.parse(uploaded);
  }, [submissionId, logoFile, heroFiles, galleryFiles, getValues]);

  const onSubmit = handleSubmit(async () => {
    try {
      setUploading(true);
      const payload = await uploadToSupabase();
      await saveStepData("media", payload as unknown as Record<string, unknown>);
      toast.success("Media saved successfully!");
      onStepComplete();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  });

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
      exit={{ x: -40, opacity: 0 }}
      className="w-full max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-heading font-semibold tracking-tight">Media & Branding</h1>
        <p className="text-sm text-muted-foreground">Step 2 — Showcase your resort's visual identity.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8" noValidate>
        {/* Logo */}
        <section className="space-y-2">
          <Label>Brand Logo</Label>
          <div className="flex items-center gap-4">
            {logoFile ? (
              <img src={createPreview(logoFile)} alt="Logo" className="h-20 w-20 rounded-lg object-cover border" />
            ) : logoUrl ? (
              <img src={logoUrl} alt="Logo URL" className="h-20 w-20 rounded-lg object-cover border" />
            ) : (
              <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                <ImagePlus className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <input type="file" accept="image/*" onChange={handleFileSelect(setLogoFile)} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              <Input placeholder="Or paste image URL..." className="mt-2" {...register("logoUrl")} />
            </div>
          </div>
          {errors.logoUrl && <p className="text-xs text-red-500">{errors.logoUrl.message}</p>}
        </section>

        {/* Hero Images */}
        <section className="space-y-2">
          <Label>Hero Images (1-2 recommended)</Label>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <label key={i} className="relative aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/20 cursor-pointer overflow-hidden group hover:border-primary/50 transition-colors">
                {heroFiles[i] ? (
                  <img src={createPreview(heroFiles[i])} className="absolute inset-0 w-full h-full object-cover" />
                ) : heroUrls[i] ? (
                  <img src={heroUrls[i]} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-5 h-5 mx-auto text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Hero {i + 1}</span>
                  </div>
                )}
                {heroFiles[i] && (
                  <button type="button" onClick={() => setHeroFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-red-500 transition"><Trash2 className="w-3 h-3" /></button>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setHeroFiles(prev => { const next = [...prev]; next[i] = f; return next; });
                }} />
              </label>
            ))}
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="space-y-2">
          <Label>Gallery (up to 6)</Label>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <label key={i} className="relative aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/20 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden">
                {galleryFiles[i] ? (
                  <img src={createPreview(galleryFiles[i])} className="absolute inset-0 w-full h-full object-cover" />
                ) : galleryUrls[i] ? (
                  <img src={galleryUrls[i]} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setGalleryFiles(prev => { const next = [...prev]; next[i] = f; return next; });
                }} />
              </label>
            ))}
          </div>
        </section>

        <Button type="submit" className="w-full mt-6" size="lg" disabled={uploading}>
          {uploading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Uploading…</> : "Save & Continue"}
        </Button>
      </form>
    </motion.div>
  );
}
