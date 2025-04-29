import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { IdentityValues } from '@/lib/schema';
import type { MediaValues } from '@/lib/schema';
import type { AmenitiesValues } from '@/lib/schema';
import type { DomainFormValues } from '@/lib/domain-schema';

// ── Supabase client ──────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY!
);

// ── Wizard data shape ───────────────────────────────────────────────
export interface WizardData {
  identity?: IdentityValues;
  media?: MediaValues;
  amenities?: AmenitiesValues;
  domain?: DomainFormValues;
}

interface WizardContextType {
  submissionId: string | null;
  setSubmissionId: (id: string) => void;
  formData: WizardData;
  updateFormData: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
  saveStepData: (step: keyof WizardData, data: unknown) => Promise<void>;
}

const WizardContext = createContext<WizardContextType | null>(null);

// ── Provider ────────────────────────────────────────────────────────
export function WizardProvider({ children }: { children: ReactNode }) {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WizardData>({
    domain: { purchaseDomain: false, customDomain: '' },
  });

  const updateFormData = useCallback(<K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const saveStepData = useCallback(async (step: keyof WizardData, data: unknown) => {
    if (!submissionId) {
      throw new Error('No submission ID – cannot save step data');
    }

    // Update local state optimistically
    setFormData(prev => {
      const updated = { ...prev, [step]: data };
      // Fire-and-forget persistent save
      supabase
        .from('resort_submissions')
        .update({ data: updated })
        .eq('id', submissionId)
        .catch(err => console.error('Failed to save step:', err));
      return updated;
    });
  }, [submissionId]);

  return (
    <WizardContext.Provider
      value={{
        submissionId,
        setSubmissionId,
        formData,
        updateFormData,
        saveStepData,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────────────
export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return ctx;
}
