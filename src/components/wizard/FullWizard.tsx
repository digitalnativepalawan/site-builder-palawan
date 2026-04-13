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

function popConfetti() {
  try {
    const confetti = require("canvas-confetti");
    confetti({ particleCount: 140, spread: 80, startVelocity: 50, gravity: 0.75 });
  } catch {
    console.warn("Confetti not available");
  }
}

export function FullWizard() {
  const navigate = useNavigate();
  const { submissionId, allData, anchorSubmission } = useWizard();
  const [step, setStep] = useState(1);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const firedRef = useRef(false);
  const stepKey = STEP_KEYS[step - 1];
  const isLast = step === 13;
  const isSkippable = SKIPPABLE.has(step);

  // ═══ HARD REHYDRATION ENGINE ═══
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    
    if (editId && !firedRef.current) {
      firedRef.current = true;
      const loadResortData = async () => {
        const { data: row, error } = await supabase
          .from("resort_submissions")
          .select("*")
          .eq("id", editId)
          .single();

        if (row && !error) {
          const savedData = row.data || {};
          setStepData(savedData);
          
          // Move to the last saved step if available
          if (savedData.currentStep) {
            setStep(Number(savedData.currentStep));
          }
          
          toast.success(`Welcome back to ${savedData.identity?.resortName || 'your resort'}`);
        }
        setIsLoaded(true);
      };
      loadResortData();
    } else {
      setIsLoaded(true);
    }
  }, []);

  const validate = () => {
    if (step === 1) {
      const d = stepData.identity || {};
      if (!d.resortName || d.resortName.length < 2) { toast.error("Resort name is required"); return false; }
      if (!d.resortOwner || d.resortOwner.length < 2) { toast.error("Resort owner is required"); return false; }
      if (!d.resortType) { toast.error("Select a resort type"); return false; }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!isLoaded) return;

    try {
      setSubmitting(true);
      const params = new URLSearchParams(window.location.search);
      let currentId = params.get('edit') || submissionId;

      if (step === 1 && !currentId) {
        currentId = await anchorSubmission(stepData.identity);
      }

      const merged = { 
        ...stepData, 
        currentStep: isLast ? step : step + 1 
      };

      if (!currentId) {
        toast.error("No submission found. Please start from Step 1.");
        return;
      }

      if (isLast) {
        const status = stepData.seo?.publishImmediately ? "published" : "draft";
        await supabase.from("resort_submissions").update({ data: merged, status }).eq("id", currentId);
        
        if (status === "published") {
          popConfetti();
          setPublished(true);
        } else {
          toast.success("Saved as draft!");
          navigate("/dashboard");
        }
      } else {
        await supabase.from("resort_submissions").update({ data: merged }).eq("id", currentId);
        setStep((s) => s + 1);
        window.scrollTo(0, 0);
      }
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const currentData = stepData[stepKey] || {};
  const Component = STEP_COMPONENTS[step - 1];

  if (published) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Sparkles className="w-12 h-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Resort Published!</h1>
        <p className="text-muted-foreground mb-8 text-sm">Your Palawan paradise is now live.</p>
        <div className="flex gap-4">
          <button onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-primary text-white rounded-lg">Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="text-xs text-muted-foreground hover:text-primary transition-colors">← Dashboard</button>
          <span className="text-xs font-heading font-semibold tracking-widest uppercase text-muted-foreground">{STEP_LABELS[step - 1]}</span>
          <span className="text-xs text-muted-foreground tabular-nums">{step} / 13</span>
        </div>
        <div className="max-w-xl mx-auto px-6 pb-3 grid grid-cols-13 gap-0.5">
          {Array.from({ length: 13 }, (_, i) => (
            <div key={i} className={`h-1 rounded-full ${i < step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
        {!isLoaded ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Loading resort data...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <Component
                data={currentData}
                onChange={(newData: any) => setStepData((prev) => ({ ...prev, [stepKey]: newData }))}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <footer className="border-t border-border bg-surface/80 backdrop-blur sticky bottom-0 z-50 p-4">
        <div className="max-w-xl mx-auto flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 text-sm rounded-lg border border-border">Back</button>
          )}
          <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground">
            {submitting ? "Saving..." : isLast ? "Publish Resort" : "Save & Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
}
