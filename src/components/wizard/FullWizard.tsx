import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function FullWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // THE HANDSHAKE: Catching the ID from the URL
  const editId = searchParams.get("edit");
  
  const [loading, setLoading] = useState(!!editId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
    identity: { resortName: "", location: "" },
  });

  // THE INDEX: Fetching the Source of Truth
  useEffect(() => {
    if (!editId) return;

    const fetchResortData = async () => {
      try {
        const { data: submission, error } = await supabase
          .from("resort_submissions")
          .select("*")
          .eq("id", editId)
          .single();

        if (error) throw error;

        if (submission && submission.data) {
          setFormData(submission.data);
        }
      } catch (err: any) {
        console.error("Handshake Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResortData();
  }, [editId]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        data: formData,
        updated_at: new Date().toISOString(),
      };

      if (editId) {
        const { error } = await supabase
          .from("resort_submissions")
          .update(payload)
          .eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("resort_submissions")
          .insert([payload]);
        if (error) throw error;
      }

      toast({ title: "Success", description: "Resort saved." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <header className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">
          {editId ? "Edit Resort" : "New Resort"}
        </h1>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {editId ? "Update" : "Save"}
          </Button>
        </div>
      </header>

      <div className="bg-white p-6 rounded border">
        <label className="block mb-2">Resort Name</label>
        <input
          className="w-full p-2 border rounded"
          value={formData.identity?.resortName || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              identity: { ...formData.identity, resortName: e.target.value },
            })
          }
        />
      </div>
    </div>
  );
}
