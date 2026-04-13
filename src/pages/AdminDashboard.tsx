import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit3, Loader2, Building2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ParsedSubmission {
  id: string;
  created_at: string;
  status: string;
  data: Record<string, any>;
  resortName: string;
  resortOwner: string;
  sectionPct: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["resort-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resort_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resort_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resort deleted");
      queryClient.invalidateQueries({ queryKey: ["resort-submissions"] });
    },
  });

  const parsed: ParsedSubmission[] = (submissions || []).map((sub: any) => {
    const d = sub.data || {};
    const identity = d.identity || {};
    const resortName = identity.resortName || "Untitled Resort";
    
    // Calculate progress based on existing top-level keys in the data JSON
    const keys = Object.keys(d).length;
    const sectionPct = Math.min(Math.round((keys / 13) * 100), 100);

    return {
      id: sub.id,
      created_at: sub.created_at,
      status: sub.status || "draft",
      data: d,
      resortName,
      resortOwner: identity.resortOwner || "—",
      sectionPct: sectionPct || 8,
    };
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Resort Submissions</h1>
          </div>
          <Button onClick={() => navigate("/wizard")} className="rounded-xl shadow-lg">
            <Plus className="h-4 w-4 mr-2" /> New Resort
          </Button>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/30 text-[10px] uppercase font-bold tracking-widest text-muted-foreground border-b">
            <div className="col-span-4">Resort</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-4">Progress</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {parsed.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No resorts found yet.</div>
          ) : (
            parsed.map((sub) => (
              <div key={sub.id} className="grid grid-cols-12 gap-4 px-6 py-5 border-b last:border-0 hover:bg-muted/10 transition-colors items-center">
                <div className="col-span-4">
                  <p className="font-bold text-sm">{sub.resortName}</p>
                  <p className="text-xs text-muted-foreground">{sub.resortOwner}</p>
                </div>
                <div className="col-span-2">
                  <Badge variant="outline" className="capitalize text-[10px] font-bold">
                    {sub.status}
                  </Badge>
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${sub.sectionPct}%` }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold">{sub.sectionPct}%</span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-9 w-9 p-0 rounded-lg"
                    onClick={() => {
                      if (!sub.id) return toast.error("Invalid ID");
                      console.log("Navigating to:", `/wizard?edit=${sub.id}`);
                      navigate(`/wizard?edit=${sub.id}`);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-9 w-9 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(sub.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-background rounded-2xl border p-6 max-w-sm w-full animate-in zoom-in-95">
            <h3 className="text-lg font-bold">Delete Property?</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">This will permanently remove this resort and all associated media.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  deleteMutation.mutate(deleteId);
                  setDeleteId(null);
                }} 
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
