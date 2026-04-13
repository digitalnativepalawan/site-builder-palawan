import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Waves, Anchor, Crown, Heart, Bed, Globe, Leaf, Check, X, Plus, Trash2, Upload, Sun, Coffee, Star, Wifi, Snowflake, Droplets, Wine, Car, Building2 } from "lucide-react";
import { toast } from "sonner";

// ═══════════════════════════════════════════
// REUSABLE FORM PRIMITIVES
// ═══════════════════════════════════════════

/** Text/Textarea field */
export function TField({ label, sub, placeholder, value, onChange, error, textarea, type = "text", rows = 3 }: {
  label: string; sub?: string; placeholder?: string; value?: string; onChange: (v: string) => void;
  error?: string; textarea?: boolean; type?: string; rows?: number;
}) {
  const Tag = textarea ? ("textarea" as const) : ("input" as const);
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      {sub && <p className="text-xs text-muted-foreground -mt-1 mb-1.5">{sub}</p>}
      <Tag
        type={!textarea ? type : undefined}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={textarea ? rows : undefined}
        className={`w-full px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none ${textarea ? "h-24 py-3" : "h-11"}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/** Multi-select chip grid */
export function ChipGrid({ label, chips, selected, onChange, multi = true }: {
  label: string; chips: { id: string; label: string; icon?: any }[];
  selected: string[]; onChange: (v: string[]) => void; multi?: boolean;
}) {
  const toggle = (id: string) => onChange(multi
    ? (selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
    : (selected.includes(id) ? [] : [id]));
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {chips.map((c) => {
          const active = selected.includes(c.id);
          const Icon = c.icon;
          return (
            <button key={c.id} type="button" onClick={() => toggle(c.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all relative ${active ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/30"}`}>
              {active && <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
              {Icon && <Icon className={`w-6 h-6 ${active ? "text-primary" : "text-muted-foreground/60"}`} />}
              <span className={`text-xs font-semibold text-center ${active ? "text-primary" : "text-foreground/80"}`}>{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Toggle checkbox */
export function ToggleCheck({ label, sub, checked, onChange }: {
  label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface cursor-pointer hover:bg-muted/30 transition">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </label>
  );
}

/** Pill button group (single select) */
export function PillGroup({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all ${value === o.value ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted"}`}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

/** Image dropzone with multi-file support */
export function ImageDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else setDragActive(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) onFiles(files);
  };
  const browse = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*"; input.multiple = true;
    input.onchange = () => { const files = Array.from(input.files || []).filter((f) => f.type.startsWith("image/")); if (files.length) onFiles(files); };
    input.click();
  };
  return (
    <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={browse}
      className={`relative rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[120px] ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-muted/10"}`}>
      <Upload className={`w-8 h-8 ${dragActive ? "text-primary" : "text-muted-foreground/50"}`} />
      <p className="text-sm font-medium text-center">Drag & drop your photos, or <span className="text-primary underline">browse</span></p>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP — multiple files</p>
    </div>
  );
}

/** Image preview thumbnails */
export function ImagePreview({ images, onRemove, roleLabels }: {
  images: string[]; onRemove?: (i: number) => void; roleLabels?: string[];
}) {
  if (!images.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((url, i) => (
        <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20">
          <img src={url} alt="" className="w-full h-full object-cover" />
          {onRemove && (
            <button onClick={() => onRemove(i)} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
          )}
          {roleLabels && roleLabels[i] && (
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize">{roleLabels[i]}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// CONSTANTS (exported for wizard steps)
// ═══════════════════════════════════════════

export const RESORT_TYPES = ["boutique","resort","villa","eco-lodge","glamping","guest-house"];
export const RESORT_ICONS: Record<string, any> = {
  boutique: Crown, resort: Globe, villa: Heart, "eco-lodge": Leaf, glamping: Sun, "guest-house": Building2,
};

export const PALAWAN_FEATURES = [
  { id: "starlink", label: "Starlink", icon: Wifi },
  { id: "fiber", label: "Fiber", icon: Wifi },
  { id: "solar-power", label: "Solar Power", icon: Sun },
  { id: "beachfront", label: "Beachfront", icon: Anchor },
  { id: "island-hopping", label: "Island Hopping", icon: Waves },
  { id: "dive-center", label: "Dive Center", icon: Anchor },
];

export const AMENITIES_OPTIONS = [
  { id: "ac", label: "Air Conditioning", icon: Snowflake },
  { id: "hot-water", label: "Hot Water", icon: Droplets },
  { id: "pool", label: "Pool", icon: Waves },
  { id: "bar", label: "Bar", icon: Wine },
  { id: "restaurant", label: "Restaurant", icon: Coffee },
  { id: "wifi", label: "Wifi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "room-service", label: "Room Service", icon: Coffee },
];

export const DINING_OPTIONS = [
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "in-house-restaurant", label: "Restaurant", icon: Coffee },
  { id: "pool-bar", label: "Pool Bar", icon: Star },
  { id: "room-service", label: "Room Service", icon: Coffee },
];
