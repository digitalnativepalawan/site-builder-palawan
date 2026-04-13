import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver, type Resolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Upload, X, Plus, ChevronDown, Crown, Monitor, Sparkles } from "lucide-react";

// ═══════════════════════════════════════════════════
// Reusable Form Components for Wizard Steps
// ═══════════════════════════════════════════════════

// ── Text Input ──
export function TInput({
  label, sub, placeholder, required = false, register, name, error, type, textarea, rows, leftIcon, rightElement, className,
}: {
  label: string; sub?: string; placeholder?: string; required?: boolean;
  register: any; name: string; error?: { message?: string };
  type?: string; textarea?: boolean; rows?: number; leftIcon?: React.ReactNode; rightElement?: React.ReactNode;
  className?: string;
}) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className={className}>
      <label className="text-sm font-medium block mb-1.5">
        {leftIcon && <span className="mr-1.5 text-muted-foreground">{leftIcon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {sub && <p className="text-xs text-muted-foreground -mt-1 mb-1.5">{sub}</p>}
      <Tag
        type={type || "text"}
        {...register(name)}
        rows={rows || 3}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-50 resize-none"
      />
      {rightElement}
      {error && <p className="text-xs text-red-500 mt-1">{String(error.message)}</p>}
    </div>
  );
}

// ── Toggle Chip Selector ──
export function ToggleChips({
  label, options, value, onChange, multi = true,
}: {
  label: string; options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string[]; onChange: (v: string[]) => void; multi?: boolean;
}) {
  const toggle = (v: string) => {
    if (multi) {
      onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
    } else {
      onChange(value.includes(v) ? [] : [v]);
    }
  };
  return (
    <div>
      <label className="text-sm font-medium block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                active
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              {o.icon}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Image Dropzone ──
export function ImageDropzone({
  label, sub, onFiles,
}: {
  label?: string; sub?: string; onFiles: (files: File[]) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => ref.current?.click()}
      className={`relative rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[100px]
        ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-muted/10"}`}
    >
      <Upload className={`w-6 h-6 ${dragActive ? "text-primary" : "text-muted-foreground/50"}`} />
      <p className="text-sm text-center">{label || "Drop images here or click to browse"}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

// ── Image Preview Grid ──
export function ImagePreviewGrid({
  images, onRemove, labels,
}: {
  images: string[]; onRemove?: (i: number) => void; labels?: string[];
}) {
  if (!images.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((url, i) => (
        <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20">
          <img src={url} alt={labels?.[i] || `Image ${i + 1}`} className="w-full h-full object-cover" />
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {labels && (
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
              {labels[i]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step Form Wrapper ──
export function StepForm<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  children,
  submitting,
}: {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => Promise<void> | void;
  children: (form: {
    register: ReturnType<typeof useForm>["register"];
    errors: Record<string, any>;
    watch: ReturnType<typeof useForm>["watch"];
    setValue: ReturnType<typeof useForm>["setValue"];
    getValues: ReturnType<typeof useForm>["getValues"];
    control: ReturnType<typeof useForm>["control"];
  }) => React.ReactNode;
  submitting?: boolean;
}) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema) as unknown as Resolver<z.infer<T>>,
    defaultValues,
    mode: "onBlur",
  });
  const { register, formState: { errors }, watch, setValue, getValues, control } = form;

  const submit = form.handleSubmit((values) => {
    return onSubmit(values);
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {children({ register, errors, watch, setValue, getValues, control })}
    </form>
  );
}

// ── Simple Toggle Switch ──
export function ToggleSwitch({
  label, sub, checked, onChange,
}: {
  label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface cursor-pointer hover:bg-muted/30 transition">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 mt-0.5"
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </label>
  );
}

// ── Select Pill ──
export function SelectPills({
  label, options, value, onChange,
}: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
              value === o.value
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
