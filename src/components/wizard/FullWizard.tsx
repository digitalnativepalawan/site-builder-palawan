import { useState, useRef, useEffect } from "react";
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
import { Eye, LayoutDashboard, Sparkles } from "lucide-react";

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

// Confetti trigger
function popConfetti() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const confetti = require("canvas-confetti");
    confetti({ particleCount: 140, spread: 80, startVelocity: 50, gravity: 0.75 });
    setTimeout(() => {
      const left = confetti.create({ origin: { x: 0 } });
      const right = confetti.create({ origin: { x: 1 } });
      left({ particleCount: 60, spread: 60, startVelocity: 40, gravity: 0.85 });
      right({ particleCount: 60, spread: 60, startVelocity: 40, gravity: 0.85 });
    }, 400);
  } catch {
    console.warn("Confetti not available");
  }
}

// ═══ Success Screen after Step 13 Publish ═══
function PublishSuccess({ submissionId, onPreview, onDashboard }: {
  submissionId: string;
  onPreview: () => void;
  onDashboard: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20 mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-heading font-bold tracking-tight mb-3">Site Published!</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Your resort website is ready and live. You can preview it or manage it from the dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button onClick={onPreview}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" /> View Live Site
        </button>
        <button onClick={onDashboard}
          className="flex-1 py-3 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors flex items-center justify-center gap-2">
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </button>
      </div>
    </motion.div>
  );
}

// ═══ 13-Step Wizard Controller ═══
export function FullWizard() {
  const navigate = useNavigate();
  const { submissionId, allData, anchorSubmission } = useWizard();
  const [step, setStep] = useState(1);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const isLast = step === 13;
  const isSkippable = SKIPPABLE.has(step);
  const stepKey = STEP_KEYS[step - 1];
  const firedRef = useRef(false);

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

      let currentId = submissionId || (allData as any)._submissionId;

      // Step 1: anchor the submission if first time
      if (step === 1 && !currentId) {
        const d = stepData.identity;
        currentId = await anchorSubmission(d);
      }

      const currentSaveData = stepData[stepKey] || {};

      // Merge with existing allData for upsert
      const merged: Record<string, any> = { ...allData };
      if (step === 1) {
        merged.basicInfo = currentSaveData;
        merged.identity = currentSaveData;
      } else {
        merged[stepKey] = currentSaveData;
        if (allData.identity) merged.identity = allData.identity;
        if (allData.basicInfo) merged.basicInfo = allData.basicInfo;
      }

      if (!currentId) {
        toast.error("No submission — please fill out Step 1 first");
        setSubmitting(false);
        return;
      }

      if (isLast) {
        // Final step — publish
        merged.seo = currentSaveData;
        const status = currentSaveData.publishImmediately ? "published" : "draft";
        await supabase.from("resort_submissions").update({ data: merged, status }).eq("id", currentId);

        if (currentSaveData.publishImmediately) {
          // Trigger confetti and show success screen
          if (!firedRef.current) {
            firedRef.current = true;
            popConfetti();
          }
          setPublished(true);
        } else {
          toast.success("Resort profile saved as draft!");
          navigate(`/resort/${currentId}`);
        }
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
  if (step === 1) {
    Object.assign(currentData, allData.identity || {}, allData.basicInfo || {});
  }

  const Component = STEP_COMPONENTS[step - 1];

  // ═══ Published Success Screen ═══
  if (published && submissionId) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-xl mx-auto px-6 py-3 text-center">
            <span className="text-xs font-heading font-semibold tracking-widest uppercase text-amber-500">
              ✨ Site Published
            </span>
          </div>
        </header>
        <PublishSuccess
          submissionId={submissionId}
          onPreview={() => navigate(`/resort/${submissionId}`)}
          onDashboard={() => navigate("/dashboard")}
        />
      </div>
    );
  }

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
