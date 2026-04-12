import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { IdentityValues } from "@/lib/schema";

interface WizardContextValue {
  submissionId: string | null;
  anchorSubmission: (values: IdentityValues) => Promise<string>;
  allData: Record<string, unknown>;
  setStepData: (key: string, values: Record<string, unknown>) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [allData, setAllData] = useState<Record<string, unknown>>({});

  // PERSISTENCE LAW: immediate upsert on Step 1 Next
  const anchorSubmission = useCallback(async (values: IdentityValues) => {
    const { data, error } = await supabase
      .from("resort_submissions")
      .upsert(
        { data: { basicInfo: values } },
        { onConflict: "id" } // if we re-pass an id later
      )
      .select("id")
      .maybeSingle();

    if (error || !data) {
      toast.error("Could not save your progress. Please try again.");
      throw error ?? new Error("No data returned");
    }

    setSubmissionId(data.id);
    return data.id;
  }, []);

  const setStepData = useCallback((key: string, values: Record<string, unknown>) => {
    setAllData((prev) => ({ ...prev, [key]: values }));
  }, []);

  return (
    <WizardContext.Provider value={{ submissionId, anchorSubmission, allData, setStepData }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside <WizardProvider>");
  return ctx;
}
