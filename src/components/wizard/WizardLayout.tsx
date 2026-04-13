import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// 13-step wizard
export const STEP_LABELS = [
  "Resort Identity",
  "Brand Story",
  "About the Owner",
  "Media & Photos",
  "Hero Video",
  "Rooms & Villas",
  "Guest Comforts",
  "Dining & Experiences",
  "FAQ",
  "Header & Footer",
  "Contact & Location",
  "Colors & Style",
  "SEO & Publish",
];

// Steps that can be skipped (optional fields)
export const SKIPPABLE_STEPS = new Set([2, 6, 7, 9, 11, 12]); // 1-indexed

export interface WizardLayoutProps {
  step: number;
  totalSteps: number;
  onStepComplete: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  isLastStep?: boolean;
}

export function WizardLayout({
  step,
  totalSteps = 13,
  onStepComplete,
  onBack,
  isSubmitting,
  isLastStep,
}: WizardLayoutProps) {
  const navigate = useNavigate();
  const label = STEP_LABELS[step - 1] || `Step ${step}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            ← Dashboard
          </button>
          <span className="text-xs font-heading font-semibold tracking-widest uppercase text-muted-foreground">
            {label}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">{step} / {totalSteps}</span>
        </div>
        {/* Progress bars */}
        <div className="max-w-xl mx-auto px-6 pb-3 grid grid-cols-13 gap-0.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-colors ${
                i < step - 1 ? "bg-primary/60" : i === step - 1 ? "bg-primary" : "bg-muted"
              }`}
              title={STEP_LABELS[i]}
            />
          ))}
        </div>
      </header>

      {/* Content area — scrollable, not centered */}
      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
        {onStepComplete && (
          <div className="mb-8 pt-2 flex items-center gap-2">
            {!isLastStep && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
            )}
            <div className="flex-1" />
          </div>
        )}

        <div className="space-y-6">
          {/* Step title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-semibold tracking-tight">{label}</h1>
            <p className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </p>
          </div>

          {/* Step content will be passed as children */}
          <div className="space-y-6">
            {/* Content slots rendered by parent */}
          </div>
        </div>
      </main>

      {/* Footer with Save & Continue */}
      <footer className="border-t border-border bg-surface/80 backdrop-blur sticky bottom-0 z-50">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={onBack}
              className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border hover:bg-muted"
            >
              Back
            </button>
          )}
          <button
            onClick={onStepComplete}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : isLastStep ? "Generate My Site" : "Save & Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function WizardContainer({
  children,
  step,
  onNext,
  onBack,
  submitting,
  lastStep,
}: {
  children: React.ReactNode;
  step: number;
  onNext: () => void;
  onBack: () => void;
  submitting?: boolean;
  lastStep?: boolean;
}) {
  const navigate = useNavigate();
  const label = STEP_LABELS[step - 1] || `Step ${step}`;
  const totalSteps = 13;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            ← Exit
          </button>
          <span className="text-xs font-heading font-semibold tracking-widest uppercase text-muted-foreground">
            {label}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">{step} / {totalSteps}</span>
        </div>
        <div className="max-w-xl mx-auto px-6 pb-3 grid grid-cols-13 gap-0.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-colors ${
                i < step - 1 ? "bg-primary/60" : i === step - 1 ? "bg-primary" : "bg-muted"
              }`}
              title={STEP_LABELS[i]}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
        {children}
      </main>

      <footer className="border-t border-border bg-surface/80 backdrop-blur sticky bottom-0 z-50">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={onBack}
              className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border hover:bg-muted"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            disabled={submitting}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : lastStep ? "Generate My Site" : "Save & Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
}
