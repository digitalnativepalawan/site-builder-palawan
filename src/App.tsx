import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

import { WizardProvider } from "@/context/wizard-context";
import { IdentityStep } from "@/components/wizard/IdentityStep";
import { MediaStep } from "@/components/wizard/MediaStep";
import { Button } from "@/components/ui/button";

function PlaceholderStep({ title }: { title: string }) {
  return (
    <div className="text-center space-y-4 py-12">
      <h2 className="text-2xl font-heading font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">Coming next.</p>
    </div>
  );
}

function WizardContent() {
  const [step, setStep] = useState(1);

  const goNext = () => setStep((s) => Math.min(s + 1, 2));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-heading font-semibold tracking-widest uppercase text-muted-foreground">
            {step === 1 ? "Identity" : "Media & Branding"}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">{step} / 2</span>
        </div>
        <div className="max-w-xl mx-auto px-6 pb-3 flex gap-1.5">
          {[1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 1 && <IdentityStep key="s1" onStepComplete={goNext} />}
          {step === 2 && <MediaStep key="s2" onStepComplete={goNext} />}
        </AnimatePresence>
      </main>

      {step > 1 && (
        <footer className="border-t border-border bg-surface/80 backdrop-blur">
          <div className="max-w-xl mx-auto px-6 py-4 flex justify-between">
            <Button variant="ghost" onClick={goBack}>Back</Button>
            <Button variant="outline" disabled>Finish</Button>
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
