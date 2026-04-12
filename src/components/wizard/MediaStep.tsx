import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Upload, Crown, Monitor, Sparkles, X,
} from "lucide-react";

import { mediaSchema, type MediaValues } from "@/lib/schema";
import { useWizard } from "@/context/wizard-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ImageRole = "hero-1" | "hero-2" | "logo" | "gallery-only";

interface GalleryImage {
  id: string;
  file: File;
  role: ImageRole;
}

interface MediaStepProps {
  onStepComplete: () => void;
}

// ─── Component ───────────────────────────────────────────────
export function MediaStep({ onStepComplete }: MediaStepProps) {
  const { submissionId, saveStepData } = useWizard();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Gallery state — device uploads only
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const bulkFileRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<MediaValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: { heroImages: [], galleryImages: [], logoUrl: "" },
    mode: "onBlur",
  });

  // Auto-assign: first image → logo, first two → hero-1/hero-2, rest → gallery
  const pickInitialRole = (index: number): ImageRole => {
    switch (index) {
      case 0: return "logo";
      case 1: return "hero-1";
      case 2: return "hero-2";
      default: return "gallery-only";
    }
  };

  const uid = () => crypto.randomUUID();

  // ── Add files ──
  const addFiles = useCallback((files: File[]) => {
    setGallery((prev) => {
      const newImages: GalleryImage[] = [];
      for (let i = 0; i < files.length; i++) {
        newImages.push({
          id: uid(),
          file: files[i],
          role: pickInitialRole(prev.length + i),
        });
      }
      return [...prev, ...newImages];
    });
  }, []);

  // ── Remove ──
  const removeImage = (id: string) => {
    setGallery((prev) => prev.filter((i) => i.id !== id));
  };

  // ── Cycle role on badge click ──
  const cycleRole = (id: string) => {
    const cycle: Record<ImageRole, ImageRole> = {
      "gallery-only": "hero-1",
      "hero-1": "hero-2",
      "hero-2": "logo",
      logo: "gallery-only",
    };
    setGallery((prev) =>
      prev.map((i) => (i.id === id ? { ...i, role: cycle[i.role] } : i))
    );
  };

  const roleBadge = (role: ImageRole) => {
    switch (role) {
      case "hero-1":
        return { label: "Hero 1", icon: Crown, color: "bg-amber-500 text-white" };
      case "hero-2":
        return { label: "Hero 2", icon: Monitor, color: "bg-blue-500 text-white" };
      case "logo":
        return { label: "Logo", icon: Sparkles, color: "bg-violet-500 text-white" };
      default:
        return { label: "Gallery", icon: null, color: "bg-muted text-muted-foreground" };
    }
  };

  // ── Drag & Drop ──
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) addFiles(files);
  };

  // ── Enforce: at least 3 images (logo + 2 heroes) to submit ──
  const hasRequiredRoles = gallery.some((i) => i.role === "logo") &&
    gallery.some((i) => i.role === "hero-1") &&
    gallery.some((i) => i.role === "hero-2");

  // ── Submit ──
  const onSubmit = handleSubmit(async () => {
    if (!submissionId) {
      toast.error("No submission anchored — complete Step 1 first.");
      return;
    }
    if (gallery.length < 3) {
      toast.info("Upload at least 3 photos (1 logo + 2 heroes).");
      return;
    }
    if (!hasRequiredRoles) {
      toast.info("Assign roles: need 1 Logo, Hero 1, and Hero 2.");
      return;
    }

    try {
      setUploading(true);
      const bucket = supabase.storage.from("resort-assets");

      const uploadedUrls: Record<string, string> = {};
      for (const img of gallery) {
        const ext = img.file.name.split(".").pop() ?? "jpg";
        const path = `${submissionId}/${img.id}.${ext}`;
        const { error } = await bucket.upload(path, img.file, { upsert: true });
        if (error) throw error;
        uploadedUrls[img.id] = bucket.getPublicUrl(path).data.publicUrl;
      }

      const heroImages = gallery
        .filter((i) => i.role.startsWith("hero"))
        .map((i) => uploadedUrls[i.id]);
      const logoUrl =
        gallery.find((i) => i.role === "logo")
          ? uploadedUrls[gallery.find((i) => i.role === "logo")!.id]
          : "";
      const galleryImages = gallery
        .filter((i) => !i.role.startsWith("hero") && i.role !== "logo")
        .map((i) => uploadedUrls[i.id]);

      const payload: MediaValues = { heroImages, galleryImages, logoUrl };
      mediaSchema.parse(payload);

      await saveStepData("media", payload as unknown as Record<string, unknown>);
      toast.success("Media saved!");
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
      className="w-full max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-heading font-semibold tracking-tight">Media & Branding</h1>
        <p className="text-sm text-muted-foreground">Step 2 — Upload your resort photos. Drag or browse.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>

        {/* ── Upload Zone ── */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => bulkFileRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-[140px]
            ${dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40 bg-muted/10"}`}
        >
          <Upload className={`w-8 h-8 transition-colors ${dragActive ? "text-primary" : "text-muted-foreground/50"}`} />
          <p className="text-sm font-medium text-center">
            Drop your photos here, or <span className="text-primary underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP — multiple files</p>
          <input
            ref={bulkFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []).filter((f) =>
                f.type.startsWith("image/")
              );
              if (files.length) addFiles(files);
            }}
          />
        </div>

        {/* ── Gallery Grid — only uploaded images, no placeholders ── */}
        {gallery.length > 0 && (
          <div>
            <Label className="text-xs uppercase tracking-widest">{gallery.length} Photo{gallery.length > 1 ? "s" : ""}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
              <AnimatePresence>
                {gallery.map((img) => {
                  const badge = roleBadge(img.role);
                  const previewUrl = URL.createObjectURL(img.file);

                  return (
                    <motion.div
                      key={img.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20"
                    >
                      <img src={previewUrl} alt={img.role} className="w-full h-full object-cover" />

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Badge — click to cycle role */}
                      <button
                        type="button"
                        onClick={() => cycleRole(img.id)}
                        className={`absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm transition z-10 ${badge.color}`}
                      >
                        {badge.icon && <badge.icon className="w-3 h-3" />}
                        {badge.label}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {errors.heroImages && (
          <p className="text-xs text-red-500">{String(errors.heroImages.message)}</p>
        )}

        {/* Progress indicator */}
        <div className="text-xs text-muted-foreground text-center">
          {gallery.length < 3
            ? `Upload ${3 - gallery.length} more photo${3 - gallery.length > 1 ? "s" : ""} to continue`
            : hasRequiredRoles
            ? "All roles assigned — ready to save"
            : "Assign roles: need 1 Logo, Hero 1, and Hero 2"}
        </div>

        {/* ── Submit ── */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="submit"
            className="flex-1"
            size="lg"
            disabled={uploading || gallery.length < 3 || !hasRequiredRoles}
          >
            {uploading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Uploading…</> : "Save & Continue"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
