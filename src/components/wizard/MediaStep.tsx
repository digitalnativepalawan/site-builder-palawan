import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, ImagePlus, Upload, Trash2, Link as LinkIcon,
  Crown, Monitor, Sparkles, X, Plus,
} from "lucide-react";

import { mediaSchema, type MediaValues } from "@/lib/schema";
import { useWizard } from "@/context/wizard-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageRole = "hero-1" | "hero-2" | "logo" | "gallery-only";

interface GalleryImage {
  id: string;
  file?: File;
  url: string;
  role: ImageRole;
}

interface MediaStepProps {
  onStepComplete: () => void;
}

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i;

function isDirectImageUrl(url: string): boolean {
  try {
    return IMAGE_EXT.test(url) || IMAGE_EXT.test(new URL(url).pathname);
  } catch {
    return IMAGE_EXT.test(url);
  }
}

function proxyUrl(u: string): string {
  return `https://images.weserv.nl/?url=${encodeURIComponent(u)}`;
}

// ─── Magic Link: proxy scrape ────────────────────────────────
async function scrapeImagesFromUrl(url: string): Promise<string[]> {
  console.log("[Magic Link] Scraping:", url);
  const proxyUrl_str = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const resp = await fetch(proxyUrl_str);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const html = await resp.text();

  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const sources: string[] = [];
  let match;
  while ((match = imgSrcRegex.exec(html)) !== null) {
    sources.push(match[1]);
  }

  const base = new URL(url);
  const resolved = sources
    .map((src) => {
      try { return new URL(src, base).href; } catch { return null; }
    })
    .filter((u): u is string => !!u)
    .filter((u) => IMAGE_EXT.test(u) || /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(u));

  return [...new Set(resolved)];
}

// ─── Component ───────────────────────────────────────────────
export function MediaStep({ onStepComplete }: MediaStepProps) {
  const { submissionId, saveStepData } = useWizard();

  // RLS guard: must have an anchored submission from Step 1
  if (!submissionId) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center py-12">
        <p className="text-lg font-semibold text-destructive">No submission found.</p>
        <p className="text-sm text-muted-foreground mt-2">Complete Step 1 (Identity) before uploading media.</p>
      </div>
    );
  }
  const [uploading, setUploading] = useState(false);

  // Gallery state
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [magicUrl, setMagicUrl] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // URL input mode for individual slots
  const [urlMode, setUrlMode] = useState<Record<string, boolean>>({});
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});

  const dropRef = useRef<HTMLDivElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<MediaValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: { heroImages: [], galleryImages: [], logoUrl: "" },
    mode: "onBlur",
  });

  // ── Helpers ──
  const uid = () => crypto.randomUUID();

  const addFiles = useCallback((files: File[]) => {
    setGallery((prev) => [
      ...prev,
      ...files.map((f) => ({ id: uid(), file: f, url: URL.createObjectURL(f), role: "gallery-only" as ImageRole })),
    ]);
  }, []);

  const addUrls = useCallback((urls: string[]) => {
    setGallery((prev) => [
      ...prev,
      ...urls.filter(Boolean).map((u) => ({ id: uid(), url: u, role: "gallery-only" as ImageRole })),
    ]);
  }, []);

  const removeImage = (id: string) => {
    setGallery((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.file?.type.startsWith("blob:")) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const cycleRole = (id: string) => {
    setGallery((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const cycle: Record<ImageRole, ImageRole> = {
          "gallery-only": "hero-1",
          "hero-1": "hero-2",
          "hero-2": "logo",
          logo: "gallery-only",
        };
        return { ...i, role: cycle[i.role] };
      })
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
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) addFiles(files);
  };

  // ── Magic Link ──
  const handleMagicLink = async () => {
    if (!magicUrl.trim()) { toast.info("Paste a URL first"); return; }
    try {
      setMagicLoading(true);
      // If it's a direct image URL, skip scraper — just add it
      if (isDirectImageUrl(magicUrl.trim())) {
        const proxied = proxyUrl(magicUrl.trim());
        addUrls([proxied]);
        toast.success("Image added via proxy!");
      } else {
        const urls = await scrapeImagesFromUrl(magicUrl);
        // Proxy each URL through weserv.nl so the browser can display them
        const proxied = urls.map((u) => proxyUrl(u));
        addUrls(proxied);
        toast.success(`Found ${proxied.length} images from link!`);
      }
    } catch {
      toast.error("Could not extract images from URL");
    } finally {
      setMagicLoading(false);
    }
  };

  // ── URL paste for individual slot ──
  const addByUrl = (id: string) => {
    const url = urlInputs[id]?.trim();
    if (!url) return;
    // Accept any string that looks like a URL or path — relaxed validation
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      toast.error("URL must start with http://, https://, or /");
      return;
    }
    setGallery((prev) => prev.map((i) => i.id === id ? { ...i, url, file: undefined } : i));
    setUrlMode((prev) => ({ ...prev, [id]: false }));
    setUrlInputs((prev) => ({ ...prev, [id]: "" }));
  };

  // ── Submit ──
  const onSubmit = handleSubmit(async () => {
    if (!submissionId) { toast.error("No submission anchored"); return; }
    if (!gallery.length) { toast.info("Add at least one image"); return; }

    try {
      setUploading(true);
      const bucket = supabase.storage.from("resort-assets");

      const uploaded: GalleryImage[] = [];
      for (const img of gallery) {
        let finalUrl = img.url;
        if (img.file) {
          const ext = img.file.name.split(".").pop() ?? "jpg";
          const path = `${submissionId}/${img.id}.${ext}`;
          const { error } = await bucket.upload(path, img.file, { upsert: true });
          if (error) throw error;
          finalUrl = bucket.getPublicUrl(path).data.publicUrl;
        }
        uploaded.push({ ...img, url: finalUrl });
      }

      const heroImages = uploaded.filter((i) => i.role.startsWith("hero")).map((i) => i.url);
      const logoUrl = uploaded.find((i) => i.role === "logo")?.url ?? "";
      const galleryImages = uploaded.filter((i) => !i.role.startsWith("hero") && i.role !== "logo").map((i) => i.url);

      const payload: MediaValues = { heroImages: heroImages.length ? heroImages : ["", ""], galleryImages, logoUrl };
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

  // ── Ensure at least 2 preview slots if gallery empty ──
  const displayImages = gallery.length ? gallery : [
    { id: "slot-1", url: "", role: "gallery-only" as ImageRole },
    { id: "slot-2", url: "", role: "gallery-only" as ImageRole },
  ];

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
      exit={{ x: -40, opacity: 0 }}
      className="w-full max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-heading font-semibold tracking-tight">Media & Branding</h1>
        <p className="text-sm text-muted-foreground">Step 2 — Drag, paste, or import. Assign roles with one click.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>

        {/* ── Magic Link ── */}
        <div className="rounded-xl border border-border p-4 bg-gradient-to-r from-primary/[0.03] to-accent/[0.03]">
          <Label className="flex items-center gap-2 text-xs uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Magic Import
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Paste Airbnb, Booking.com, or website URL…"
              value={magicUrl}
              onChange={(e) => setMagicUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleMagicLink())}
              className="flex-1"
            />
            <Button type="button" onClick={handleMagicLink} disabled={magicLoading || !magicUrl.trim()} variant="default">
              {magicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
              Import
            </Button>
          </div>
        </div>

        {/* ── Drag & Drop Zone ── */}
        <div
          ref={dropRef}
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
            Drop all your photos here, or <span className="text-primary underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">Supports JPG, PNG, WebP — up to 20 files</p>
          <input
            ref={bulkFileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
              if (files.length) addFiles(files);
            }}
          />
        </div>

        {/* ── Gallery Grid ── */}
        <div>
          <Label className="text-xs uppercase tracking-widest">Your Images</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
            <AnimatePresence>
              {displayImages.map((img, idx) => {
                const badge = roleBadge(img.role);
                const isEmpty = !img.url;
                const isUrlMode = urlMode[img.id];

                return (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20"
                  >
                    {isEmpty ? (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/40 transition"
                        onClick={() => setUrlMode((p) => ({ ...p, [img.id]: true }))}
                      >
                        <Plus className="w-5 h-5 text-muted-foreground/50" />
                        <span className="text-[10px] text-muted-foreground/60">Add image</span>
                      </div>
                    ) : (
                      <img src={img.url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                    )}

                    {/* Remove */}
                    {!isEmpty && (
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}

                    {/* Badge — click to cycle role */}
                    {!isEmpty && (
                      <button
                        type="button"
                        onClick={() => cycleRole(img.id)}
                        className={`absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm transition z-10 ${badge.color}`}
                      >
                        {badge.icon && <badge.icon className="w-3 h-3" />}
                        {badge.label}
                      </button>
                    )}

                    {/* URL input overlay */}
                    {isUrlMode && (
                      <div className="absolute inset-0 bg-background/95 flex flex-col gap-1.5 p-2 z-20">
                        <input
                          autoFocus
                          placeholder="Paste image URL…"
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          value={urlInputs[img.id] ?? ""}
                          onChange={(e) => setUrlInputs((p) => ({ ...p, [img.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && addByUrl(img.id)}
                        />
                        <button
                          type="button"
                          onClick={() => { setUrlMode((p) => ({ ...p, [img.id]: false })); setUrlInputs((p) => ({ ...p, [img.id]: "" })); }}
                          className="text-[10px] text-muted-foreground underline self-center"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {errors.heroImages && <p className="text-xs text-red-500">{String(errors.heroImages.message)}</p>}

        {/* ── Submit ── */}
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" className="flex-1" size="lg" disabled={uploading}>
            {uploading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Uploading…</> : "Save & Continue"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
