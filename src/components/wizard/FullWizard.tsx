import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWizard, STEP_KEYS, type StepKey, SKIPPABLE } from "@/context/wizard-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Step1_Identity, Step2_BrandStory, Step3_AboutOwner, Step4_Media,
  Step5_HeroVideo, Step6_Rooms, Step7_Amenities, Step8_Dining,
  Step9_FAQ, Step10_HeaderFooter, Step11_Contact, Step12_Colors, Step13_SEO,
} from "./WizardSteps";

const STEP_COMPONENTS = [
  Step1_Identity, Step2_BrandStory, Step3_AboutOwner, Step4_Media,
  Step5_HeroVideo, Step6_Rooms, Step7_Amenities, Step8_Dining,
  Step9_FAQ, Step10_HeaderFooter, Step11_Contact, Step12_Colors, Step13_SEO,
];

const STEP_LABELS = [
  "Resort Identity", "Brand Story", "About the Owner", "Media & Photos",
  "Hero Video", "Rooms & Villas", "Guest Comforts", "Dining & Experiences",
  "FAQ", "Header & Footer", "Contact & Location", "Colors & Style", "SEO & Publish",
];

// ═══ 13-Step Wizard Controller ═══
export function FullWizard() {
  const navigate = useNavigate();
  const { submissionId, allData, saveStepData, anchorSubmission } = useWizard();
  const [step, setStep] = useState(1);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const isLast = step === 13;
  const isSkippable = SKIPPABLE.has(step);
  const stepKey = STEP_KEYS[step - 1];

  const validate = () => {
    if (step === 1) {
      const d = stepData.identity || allData.identity || {};
      if (!d.resortName || d.resortName.length < 2) { toast.error("Resort name is required"); return false; }
      if (!d.resortOwner || d.resortOwner.length < 2) { toast.error("Resort owner is required"); return false; }
      if (!d.email || !d.email.includes("@")) { toast.error("Valid email is required"); return false; }
      if (!d.phone || d.phone.length < 7) { toast.error("Valid phone required"); return false; }
      if (!d.resortType) { toast.error("Select a resort type"); return false; }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      // Step 1: anchor the submission if first time
      if (step === 1 && !submissionId) {
        const d = stepData.identity;
        await anchorSubmission(d);
      }

      // Save current step data
      const currentSaveData = stepData[stepKey] || {};

      // Merge with existing allData for upsert
      const merged: Record<string, any> = { ...allData };

      // Preserve identity across steps — merge into basicInfo for compatibility
      if (step === 1) {
        merged.basicInfo = currentSaveData;
        merged.identity = currentSaveData;
      } else {
        merged[stepKey] = currentSaveData;
        // Merge with identity for steps that need it
        if (allData.identity) merged.identity = allData.identity;
        if (allData.basicInfo) merged.basicInfo = allData.basicInfo;
      }

      // Save to Supabase
      const currentId = submissionId || (allData as any)._submissionId;
      if (!currentId) {
        toast.error("No submission — please fill out Step 1 first");
        setSubmitting(false);
        return;
      }

      if (isLast) {
        // Final step
        merged.seo = currentSaveData;
        await supabase.from("resort_submissions").update({ data: merged, status: "pending" }).eq("id", currentId);
        toast.success("Your resort profile is complete! Generating your site...");
        setTimeout(() => navigate(`/resort/${currentId}`), 1500);
      } else {
        await supabase.from("resort_submissions").update({ data: merged }).eq("id", currentId);
        setStep((s) => s + 1);
        window.scrollTo(0, 0);
        toast.success(`${STEP_LABELS[step - 1]} saved`);
      }
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (isSkippable) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo(0, 0);
    }
  };

  // Merge step data with persistent allData
  const currentData = { ...(allData[stepKey] || {}), ...(stepData[stepKey] || {}) };

  // Pre-populate identity into Step 1 data
  if (step === 1) {
    Object.assign(currentData, allData.identity || {}, allData.basicInfo || {});
  }

  const Component = STEP_COMPONENTS[step - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Dashboard
          </button>
          <span className="text-xs font-heading font-semibold tracking-widest uppercase text-muted-foreground">
            {STEP_LABELS[step - 1]}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">{step} / 13</span>
        </div>
        {/* Progress bar — 13 segments */}
        <div className="max-w-xl mx-auto px-6 pb-3 grid grid-cols-13 gap-0.5">
          {Array.from({ length: 13 }, (_, i) => (
            <div key={i} className={`h-1 rounded-full transition-colors ${i < step - 1 ? "bg-primary/60" : i === step - 1 ? "bg-primary" : "bg-muted"}`} title={STEP_LABELS[i]} />
          ))}
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="space-y-3 mb-8">
              <h1 className="text-2xl font-heading font-semibold tracking-tight">{STEP_LABELS[step - 1]}</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Step {step} of 13</p>
            </div>
            <Component
              data={currentData}
              onChange={(newData: any) => setStepData((prev) => ({ ...prev, [stepKey]: newData }))}
              submissionId={submissionId || (allData as any)._submissionId}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky footer */}
      <footer className="border-t border-border bg-surface/80 backdrop-blur sticky bottom-0 z-50">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-3">
          {step > 1 && (
            <button onClick={handleBack} className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border hover:bg-muted min-w-[70px]" disabled={submitting}>
              Back
            </button>
          )}
          {isSkippable && (
            <button onClick={handleSkip} className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors" disabled={submitting}>
              Skip →
            </button>
          )}
          <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50" disabled={submitting}>
            {submitting ? "Saving…" : isLast ? "Generate My Site" : "Save & Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
}
