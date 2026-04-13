import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { IdentityValues } from "@/lib/schema";

export type StepKey =
  | "identity" | "brandStory" | "aboutOwner" | "media" | "heroVideo"
  | "rooms" | "amenities" | "dining" | "faq" | "headerFooter"
  | "contact" | "colorPalette" | "seo";

export const STEP_KEYS: StepKey[] = [
  "identity", "brandStory", "aboutOwner", "media", "heroVideo",
  "rooms", "amenities", "dining", "faq", "headerFooter",
  "contact", "colorPalette", "seo",
];

// Steps that are optional (user can skip)
export const SKIPPABLE = new Set([2, 3, 5, 6, 8, 9, 10, 12]);

interface WizardContextValue {
  submissionId: string | null;
  allData: Record<string, unknown>;
  anchorSubmission: (values: IdentityValues) => Promise<string>;
  saveStepData: (stepKey: StepKey, stepNum: number, values: Record<string, unknown>) => Promise<void>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [allData, setAllData] = useState<Record<string, unknown>>({});

  const anchorSubmission = useCallback(async (values: IdentityValues) => {
    const { data, error } = await supabase
      .from("resort_submissions")
      .insert({ data: { identity: values } })
      .select("id")
      .maybeSingle();

    if (error || !data) {
      toast.error("Could not save your progress. Please try again.");
      throw error ?? new Error("No data returned");
    }
    setSubmissionId(data.id);
    return data.id;
  }, []);

  const saveStepData = useCallback(async (stepKey: StepKey, stepNum: number, values: Record<string, unknown>) => {
    if (!submissionId) throw new Error("No submission anchored");
    const merged = { ...allData, [stepKey]: values };
    const { error } = await supabase
      .from("resort_submissions")
      .upsert({ id: submissionId, data: merged });
    if (error) {
      toast.error("Failed to save step. Please try again.");
      throw error;
    }
    setAllData(merged);
  }, [submissionId, allData]);

  return (
    <WizardContext.Provider value={{ submissionId, allData, anchorSubmission, saveStepData }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside <WizardProvider>");
  return ctx;
}
