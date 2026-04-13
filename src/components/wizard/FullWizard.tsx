import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  "Identity", "Brand Story", "About Owner", "Media", "Hero Video",
  "Rooms", "Amenities", "Dining", "FAQ", "Header/Footer", 
  "Contact", "Color Palette", "SEO"
];

export default function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isRehydrating, setIsRehydrating] = useState(!!editId);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      const fetchResort = async () => {
        try {
          const { data, error } = await supabase
            .from("resort_submissions")
            .select("data")
            .eq("id", editId)
            .single();

          if (error) throw error;
          if (data?.data) {
            setFormData(data.data);
          }
        } catch (err) {
          console.error("Rehydration error:", err);
          toast.error("Failed to load resort data");
        } finally {
          setIsRehydrating(false);
        }
      };
      fetchResort();
    }
  }, [editId]);

  const handleSave = async () => {
    if (!editId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("resort_submissions")
        .update({ data: formData, updated_at: new Date().toISOString() })
        .eq("id", editId);

      if (error) throw error;
      toast.success("Progress saved");
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    handleSave();
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  if (isRehydrating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Fetching resort details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Step {currentStep} of {STEPS.length}
            </p>
            <h2 className="text-sm font-semibold text-primary">{STEPS[currentStep - 1]}</h2>
          </div>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !editId}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
        <div className="w-full h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 pb-32">
        <div className="space-y-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Resort Identity</h1>
                <p className="text-muted-foreground">Confirm your resort and owner details.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Resort Name</label>
                  <input 
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2"
                    value={formData.identity?.resortName || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      identity: { ...formData.identity, resortName: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Owner Name</label>
                  <input 
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2"
                    value={formData.identity?.resortOwner || ""}
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
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-semibold">Step {currentStep}: {STEPS[currentStep-1]}</h2>
              <p className="text-muted-foreground">Field configuration in progress...</p>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md p-4 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={nextStep}>
            {currentStep === STEPS.length ? "Finish" : "Next Step"} 
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
