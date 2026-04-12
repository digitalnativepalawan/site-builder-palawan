import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

import { WizardProvider } from "@/context/wizard-context";
import { IdentityStep } from "@/components/wizard/IdentityStep";
import { MediaStep } from "@/components/wizard/MediaStep";
import { AmenityStep } from "@/components/wizard/AmenityStep";
import { SuccessStep } from "@/components/wizard/SuccessStep";
import { useWizard } from "@/context/wizard-context";
import { Button } from "@/components/ui/button";

function WizardContent() {
  const [step, setStep] = useState(1);
  const { submissionId } = useWizard();

  const goNext = () => setStep((s) => s + 1);  // no cap - step 4 = success
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const stepLabels = ["Identity", "Media", "Amenities", "Done"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-heading font-semibold tracking-widest uppercase text-muted-foreground">
            {stepLabels[step - 1]}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">{step} / 4</span>
        </div>
        <div className="max-w-xl mx-auto px-6 pb-3 flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 1 && <IdentityStep key="s1" onStepComplete={goNext} />}
          {step === 2 && <MediaStep key="s2" onStepComplete={goNext} />}
          {step === 3 && <AmenityStep key="s3" onStepComplete={goNext} />}
          {step === 4 && <SuccessStep key="s4" submissionId={submissionId} />}
        </AnimatePresence>
      </main>

      {step > 1 && step < 4 && (
        <footer className="border-t border-border bg-surface/80 backdrop-blur">
          <div className="max-w-xl mx-auto px-6 py-4 flex justify-between">
            <Button variant="ghost" onClick={goBack}>Back</Button>
            <Button variant="outline" onClick={goNext} disabled={step >= 3}>
              {step === 2 ? "Next" : "Finish"}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <WizardProvider>
      <WizardContent />
      <Toaster position="top-center" richColors />
    </WizardProvider>
  );
}
