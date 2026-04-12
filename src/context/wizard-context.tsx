import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BasicInfoValues } from "@/lib/schema";

interface WizardContextValue {
  submissionId: string | null;
  allData: Record<string, unknown>;
  anchorSubmission: (values: BasicInfoValues) => Promise<string>;
  saveStepData: (stepKey: string, values: Record<string, unknown>) => Promise<void>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [allData, setAllData] = useState<Record<string, unknown>>({});

  const anchorSubmission = useCallback(async (values: BasicInfoValues) => {
    const { data, error } = await supabase
      .from("resort_submissions")
      .insert({ data: { basicInfo: values } })
      .select("id")
      .maybeSingle();

    if (error || !data) {
      toast.error("Could not save your progress. Please try again.");
      throw error ?? new Error("No data returned");
    }
    setSubmissionId(data.id);
    return data.id;
  }, []);

  const saveStepData = useCallback(async (stepKey: string, values: Record<string, unknown>) => {
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
