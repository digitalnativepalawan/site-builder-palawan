import { useState, useCallback } from "react";
import { useForm, useFormContext, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Wifi, Waves, UtensilsCrossed, Sun, Plane, Anchor,
  Coffee, Snowflake, Droplets, Zap, Check, Star,
} from "lucide-react";

import { amenitiesSchema, type AmenitiesValues } from "@/lib/schema";
import { useWizard } from "@/context/wizard-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// ─── Palawan "Quick-Select" Data ───────────────────────────────
const PALAWAN_FEATURES = [
  { id: "beachfront", label: "Beachfront", icon: Waves },
  { id: "island-hopping", label: "Island Hopping", icon: Anchor },
  { id: "diving", label: "Dive Center", icon: Anchor },
  { id: "starlink", label: "Starlink Wifi", icon: Wifi },
  { id: "solar", label: "Eco-Solar", icon: Sun },
  { id: "infinity-pool", label: "Infinity Pool", icon: Waves },
  { id: "bar-restaurant", label: "Bar & Restaurant", icon: UtensilsCrossed },
  { id: "airport-transfer", label: "Airport Transfer", icon: Plane },
];

const DINING_OPTIONS = [
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "in-house-restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "pool-bar", label: "Pool Bar", icon: Star },
  { id: "room-service", label: "Room Service", icon: Coffee },
];

interface AmenityStepProps {
  onStepComplete: () => void;
}

// ─── Reusable Toggle Chip ──────────────────────────────────────
function ToggleChip({
  id,
  label,
  icon: Icon,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
        checked
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-surface hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      {checked && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <Icon className={`w-6 h-6 transition-colors ${checked ? "text-primary" : "text-muted-foreground/60"}`} />
      <span className={`text-xs font-semibold transition-colors ${checked ? "text-primary" : "text-foreground/80"}`}>
        {label}
      </span>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────
export function AmenityStep({ onStepComplete }: AmenityStepProps) {
  const { submissionId, saveStepData } = useWizard();
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AmenitiesValues>({
    resolver: zodResolver(amenitiesSchema),
    defaultValues: {
      tags: [],
      features: [],
      roomDetails: { ac: false, hotWater: false, wifi: "", breakfast: false, totalRooms: 0 },
      dining: [],
    },
    mode: "onBlur",
  });

  // Helper to sync feature IDs with form state
  const FeatureToggle = ({ feature }: { feature: typeof PALAWAN_FEATURES[0] }) => {
    return (
      <Controller
        name="features"
        control={control}
        render={({ field }) => {
          const checked = field.value.includes(feature.id);
          return (
            <ToggleChip
              id={feature.id}
              label={feature.label}
              icon={feature.icon}
              checked={checked}
              onChange={(val) => {
                const next = val
                  ? [...field.value, feature.id]
                  : field.value.filter((v: string) => v !== feature.id);
                field.onChange(next);
              }}
            />
          );
        }}
      />
    );
  };

  // Helper for dining options
  const DiningToggle = ({ item }: { item: typeof DINING_OPTIONS[0] }) => (
    <Controller
      name="dining"
      control={control}
      render={({ field }) => {
        const checked = field.value.includes(item.id);
        return (
          <ToggleChip
            id={item.id}
            label={item.label}
            icon={item.icon}
            checked={checked}
            onChange={(val) => {
              const next = val
                ? [...field.value, item.id]
                : field.value.filter((v: string) => v !== item.id);
              field.onChange(next);
            }}
          />
        );
      }}
    />
  );

  const onSubmit = handleSubmit(async (values) => {
    if (!submissionId) { toast.error("No submission anchored"); return; }
    try {
      setLoading(true);
      await saveStepData("amenities", values as unknown as Record<string, unknown>);
      toast.success("Amenities saved!");
      onStepComplete();
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-heading font-semibold tracking-tight">Amenities & Rooms</h1>
        <p className="text-sm text-muted-foreground">Step 3 — Tap to select your features.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8" noValidate>

        {/* ── Section 1: Key Features ── */}
        <section className="space-y-3">
          <Label className="text-xs uppercase tracking-widest">Key Features</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PALAWAN_FEATURES.map((f) => (
              <FeatureToggle key={f.id} feature={f} />
            ))}
          </div>
          {errors.features?.message && (
            <p className="text-xs text-red-500">{String(errors.features.message)}</p>
          )}
        </section>

        {/* ── Section 2: Dining Options ── */}
        <section className="space-y-3 border-t border-border pt-6">
          <Label className="text-xs uppercase tracking-widest">Dining Options</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DINING_OPTIONS.map((d) => (
              <DiningToggle key={d.id} item={d} />
            ))}
          </div>
        </section>

        {/* ── Section 3: Room Comforts (Checkboxes) ── */}
        <section className="space-y-4 border-t border-border pt-6">
          <Label className="text-xs uppercase tracking-widest">Room Comforts</Label>
          <div className="space-y-3">
            {/* AC */}
            <Controller
              name="roomDetails.ac"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface cursor-pointer hover:bg-muted/30 transition">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  />
                  <Snowflake className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Air Conditioning</span>
                </label>
              )}
            />
            {/* Hot Water */}
            <Controller
              name="roomDetails.hotWater"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface cursor-pointer hover:bg-muted/30 transition">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  />
                  <Droplets className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Hot Water</span>
                </label>
              )}
            />
            {/* Breakfast */}
            <Controller
              name="roomDetails.breakfast"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface cursor-pointer hover:bg-muted/30 transition">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  />
                  <Coffee className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Breakfast Included</span>
                </label>
              )}
            />
          </div>
        </section>

        {/* ── Section 4: Room Count & Internet ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border pt-6">
          <div className="space-y-2">
            <Label>Total Rooms</Label>
            <Controller
              name="roomDetails.totalRooms"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="12"
                  className="h-12 text-lg"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              )}
            />
            {errors.roomDetails?.totalRooms && (
              <p className="text-xs text-red-500">{String(errors.roomDetails.totalRooms.message)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Internet</Label>
            <Controller
              name="roomDetails.wifi"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {["Fiber", "Starlink", "None"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => field.onChange(type)}
                      className={`px-3 py-3 rounded-lg border text-xs font-semibold transition-all ${
                        field.value === type
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </section>

        {/* ── Submit ── */}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Saving…" : "Continue"}
        </Button>

      </form>
    </motion.div>
  );
}
