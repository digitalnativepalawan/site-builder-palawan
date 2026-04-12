import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Building2 } from "lucide-react";

import { identitySchema, type IdentityValues } from "@/lib/schema";
import { useWizard } from "@/context/wizard-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const RESORT_TYPES = [
  { value: "boutique", label: "Boutique Hotel" },
  { value: "resort", label: "Resort" },
  { value: "villa", label: "Private Villa" },
  { value: "hostel", label: "Hostel" },
  { value: "hotel", label: "Hotel" },
  { value: "eco-lodge", label: "Eco-Lodge" },
];

interface IdentityStepProps {
  onStepComplete: () => void;
}

export function IdentityStep({ onStepComplete }: IdentityStepProps) {
  const { anchorSubmission } = useWizard();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IdentityValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      resortName: "",
      resortOwner: "",
      email: "",
      phone: "",
      resortType: undefined,
    },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSaving(true);
      // PERSISTENCE LAW: anchor immediately, don't wait until Step 13
      const id = await anchorSubmission(values);
      console.log("Submission anchored:", id);
      onStepComplete();
    } catch (err) {
      console.error("Failed to anchor submission:", err);
    } finally {
      setSaving(false);
    }
  });

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
      exit={{ x: -40, opacity: 0 }}
      className="w-full max-w-lg mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-heading font-semibold tracking-tight">
          Tell Us About Your Resort
        </h1>
        <p className="text-sm text-muted-foreground">
          Step 1 of 2 — This anchors your application so you can resume anytime.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div>
          <Label htmlFor="resortName" required>Resort Name</Label>
          <Input
            id="resortName"
            placeholder="e.g. El Nido Paradise Resort"
            error={errors.resortName?.message}
            {...register("resortName")}
          />
        </div>

        <div>
          <Label htmlFor="resortOwner" required>Owner / Contact Person</Label>
          <Input
            id="resortOwner"
            placeholder="e.g. Juan Dela Cruz"
            error={errors.resortOwner?.message}
            {...register("resortOwner")}
          />
        </div>

        <div>
          <Label htmlFor="email" required>Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="owner@resort.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div>
          <Label htmlFor="phone" required>Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+63 917 123 4567"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        <div>
          <Label htmlFor="resortType" required>Resort Type</Label>
          <Select
            id="resortType"
            error={errors.resortType?.message}
            defaultValue=""
            {...register("resortType")}
          >
            <option value="" disabled>Select resort type</option>
            {RESORT_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" size="lg" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
