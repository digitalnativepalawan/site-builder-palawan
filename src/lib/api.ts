import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Step 1 submission anchor
export async function createSubmission(values: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("resort_submissions")
    .insert({ data: { basicInfo: values } })
    .select("id")
    .single();

  if (error) {
    toast.error("Failed to save your progress. Please try again.");
    throw error;
  }

  return data.id;
}

// Update existing submission with step data
export async function updateSubmission(
  submissionId: string,
  stepKey: string,
  values: Record<string, unknown>
) {
  const { error } = await supabase
    .from("resort_submissions")
    .update({
      data: {
        [stepKey]: values,
      },
    })
    .eq("id", submissionId);

  if (error) {
    toast.error("Failed to save your progress. Please try again.");
    throw error;
  }
}
