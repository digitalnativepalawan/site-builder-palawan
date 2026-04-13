import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Identity", "Brand Story", "About Owner", "Media", "Hero Video", "Rooms", "Amenities", "Dining", "FAQ", "Header/Footer", "Contact", "Color Palette", "SEO"];

export function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(!!editId);
  const [isSaving, setIsSaving] = useState(false);

  // 1. THE FETCH LOGIC (The most likely failure point)
  useEffect(() => {
    if (!editId) return;

    async function loadResortData() {
      console.log("🛠️ Attempting to fetch ID:", editId);
      try {
        const { data, error } = await supabase
          .from("resort_submissions")
          .select("*")
          .eq("id", editId)
          .single();

        if (error) {
          console.error("❌ Supabase Error:", error);
          toast.error(`Database error: ${error.message}`);
          return;
        }

        if (data && data.data) {
          console.log("✅ Data Loaded Successfully:", data.data);
          setFormData(data.data);
        } else {
          toast.warning("Resort found, but data is empty.");
        }
      } catch (err) {
        console.error("❌ Fetch Crash:", err);
        toast.error("Critical error loading data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadResortData();
  }, [editId]);

  // 2. THE SAVE LOGIC
  const handleSave = async () => {
    if (!editId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("resort_submissions")
        .update({ data: formData, updated_at: new Date().toISOString() })
        .eq("id", editId);

      if (error) throw error;
      toast.success("Progress synced to cloud");
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => { handleSave(); setCurrentStep(s => Math.min(s + 1, 13)); window.scrollTo(0,0); };
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
      <p className="mt-4 text-muted-foreground">Pulling your resort data from Supabase...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <span className="text-xs font-bold uppercase tracking-tighter">Step {currentStep}: {STEPS[currentStep-1]}</span>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6">
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h1 className="text-3xl font-bold">Resort Identity</h1>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Resort Name</label>
                <input 
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 mt-2"
                  value={formData?.identity?.resortName || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    identity: { ...formData.identity, resortName: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Owner Name</label>
                <input 
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 mt-2"
                  value={formData?.identity?.resortOwner || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    identity: { ...formData.identity, resortOwner: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep > 1 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Step {currentStep} fields loading...</p>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
        <div className="max-w-5xl mx-auto flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>Back</Button>
          <Button onClick={nextStep}>{currentStep === 13 ? "Finish" : "Next Step"}</Button>
        </div>
      </footer>
    </div>
  );
}
