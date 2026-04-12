import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Circle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stepTitles } from "@/lib/steps";

const stepKeys = [
  "basicInfo",
  "overview",
  "location",
  "resortDetails",
  "amenities",
  "rooms",
  "services",
  "policies",
  "media",
  "contacts",
  "social",
  "booking",
  "review",
];

interface WizardLayoutProps {
  currentStep: number;
  completedSteps: Set<number>;
  onNext: () => void;
  onBack: () => void;
  canProceed?: boolean;
  children: React.ReactNode;
}

export function WizardLayout({
  currentStep,
  completedSteps,
  onNext,
  onBack,
  canProceed = true,
  children,
}: WizardLayoutProps) {
  const isLast = currentStep >= 13;
  const info = stepTitles[currentStep];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar at top */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground font-heading tracking-widest uppercase">
              {info?.title ?? `Step ${currentStep}`}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentStep} / 13
            </span>
          </div>
          {/* Progress track */}
          <div className="flex gap-1.5">
            {stepKeys.map((_, idx) => {
              const step = idx + 1;
              const done = completedSteps.has(step);
              const active = step === currentStep;
              return (
                <div
                  key={step}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    done
                      ? "bg-primary"
                      : active
                      ? "bg-primary/50"
                      : "bg-border"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </header>

      {/* Step indicator circles — desktop */}
      <div className="hidden md:flex justify-center gap-2 py-4">
        {stepKeys.map((_, idx) => {
          const step = idx + 1;
          const done = completedSteps.has(step);
          return (
            <div key={step} className="relative flex items-center">
              {done ? (
                <CheckCircle2 className="w-7 h-7 text-primary" />
              ) : (
                <motion.div
                  animate={step === currentStep ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      step === currentStep
                        ? "bg-primary text-white ring-2 ring-primary/30"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                </motion.div>
              )}
              {step < 13 && (
                <div className={`w-3 h-px ${done ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <main className="flex-1 flex flex-col justify-center px-6 py-8 md:py-12">
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </main>

      {/* Footer navigation */}
      <footer className="border-t border-border bg-surface/80 backdrop-blur">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={currentStep <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!canProceed}
          >
            {isLast ? "Submit" : "Continue"}
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
