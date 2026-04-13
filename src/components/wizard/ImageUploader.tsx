import { useState, useCallback, useEffect } from "react";
import { Upload, Image as ImageIcon, X, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Native image file upload component.
 * Uploads directly to the `resort-assets` Supabase storage bucket.
 */
export function ImageFileUploader({
  submissionId,
  label = "Upload Image",
  sublabel,
  maxFiles = 1,
  accept = "image/jpeg,image/png,image/webp",
  onUploaded,
  existingUrl,
}: {
  submissionId: string | null;
  label?: string;
  sublabel?: string;
  maxFiles?: number;
  accept?: string;
  /** Called with the public URL(s) of the uploaded file(s) */
  onUploaded: (urls: string[]) => void;
  existingUrl?: string;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null);

  useEffect(() => {
    setPreviewUrl(existingUrl || null);
  }, [existingUrl]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!submissionId) return;
      setUploading(true);
      setError(null);
      const urls: string[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        try {
          const ext = file.name.split(".").pop() || "jpg";
          const path = `${submissionId}/${crypto.randomUUID()}.${ext}`;
          const { error, data } = await supabase.storage
            .from("resort-assets")
            .upload(path, file, { upsert: true, contentType: file.type });

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabase.storage.from("resort-assets").getPublicUrl(path);

          urls.push(publicUrl);
          setPreviewUrl(publicUrl);
        } catch (err: any) {
          console.error("Upload error:", err);
          setError(err.message || "Upload failed");
        }
      }

      setUploading(false);
      if (urls.length) onUploaded(urls);
    },
    [submissionId, onUploaded]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else setDragActive(false);
  };

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = maxFiles > 1;
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      uploadFiles(files);
    };
    input.click();
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploaded([]);
  };

  if (previewUrl && maxFiles === 1 && !uploading) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="group relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-border bg-muted/20">
          <img src={previewUrl} alt="Uploaded" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <Check className="w-3 h-3" /> Uploaded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 transition-all min-h-[100px] cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/40 bg-muted/10"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
        onClick={!uploading ? handleBrowse : undefined}
      >
        {uploading ? (
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        ) : (
          <ImageIcon className={`w-8 h-8 ${dragActive ? "text-primary" : "text-muted-foreground/50"}`} />
        )}

        {uploading ? (
          <p className="text-sm font-medium text-muted-foreground">Uploading…</p>
        ) : (
          <p className="text-sm text-center">
            {maxFiles === 1 ? "Drop a photo here, or " : "Drop photos here, or "}
            <span className="text-primary underline">browse</span>
          </p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        {maxFiles > 1 && (
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP — up to {maxFiles} files</p>
        )}
      </div>
    </div>
  );
}
