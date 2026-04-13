import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit3, Loader2, Building2, Trash2, X, Plus, Check, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ParsedSubmission {
  id: string;
  created_at: string;
  status: string;
  data: Record<string, any>;
  resortName: string;
  resortOwner: string;
  sectionCount: number;
  sectionPct: number;
  isComplete: boolean;
  isDraft: boolean;
}

// ── Helper: delete a single submission from Supabase ──────────
async function deleteFromSupabase(id: string): Promise<void> {
  // 1. Try to clean storage folder
  try {
    const { data: files } = await supabase.storage.from("resort-assets").list(id);
    if (files?.length) {
      const paths = files.map((f) => `${id}/${f.name}`);
      await supabase.storage.from("resort-assets").remove(paths);
    }
  } catch {
    // Storage cleanup is best-effort; even if it fails we still delete the DB row
  }

  // 2. Delete DB row
  const { error } = await supabase.from("resort_submissions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [hideDrafts, setHideDrafts] = useState(false);
  const [confirmingPurge, setConfirmingPurge] = useState(false);
  const [purging, setPurging] = useState(false);

  const { data: submissions, isLoading, refetch } = useQuery({
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

  /** Single delete mutation — invalidates the query so the row disappears */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFromSupabase(id),
    onSuccess: () => {
      toast.success("Resort deleted");
      queryClient.invalidateQueries({ queryKey: ["resort-submissions"] });
    },
    onError: (err: any) => {
      toast.error("Delete failed: " + err.message);
    },
  });

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteMutation]);

  /** Bulk-purge all drafts (Untitled Resort + 0% progress) */
  const handlePurgeDrafts = useCallback(async () => {
    setPurging(true);
    const draftIds = parsed.filter((s) => s.isDraft).map((s) => s.id);
    let count = 0;
    for (const id of draftIds) {
      try {
        await deleteFromSupabase(id);
        count++;
      } catch (err: any) {
        toast.error("Failed to delete " + id.slice(0, 8) + ": " + err.message);
      }
    }
    setPurging(false);
    setConfirmingPurge(false);
    if (count > 0) {
      toast.success(`Purged ${count} draft${count > 1 ? "s" : ""}`);
      queryClient.invalidateQueries({ queryKey: ["resort-submissions"] });
    } else {
      toast.info("No drafts to purge");
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Parse all submissions ──────────────────────────────────
  const parsed: ParsedSubmission[] = (submissions || []).map((sub: any) => {
    const d = (sub.data as Record<string, any>) || {};
    const identity = d.identity || d.basicInfo || {};
    const resortName = identity.resortName || "Untitled Resort";
    const resortOwner = identity.resortOwner || "";
    const sectionCount = [
      d.identity, d.brandStory, d.aboutOwner, d.media, d.heroVideo,
      d.rooms, (d.amenity || d.amenities), d.dining, d.faq,
      d.headerFooter, d.contact, d.colorPalette, d.seo,
    ].filter(Boolean).length;
    const sectionPct = Math.round((sectionCount / 13) * 100);
    const isPublished = d.seo?.publishImmediately === true;
    const status = isPublished ? "published" : (sub.status || "draft");
    return {
      id: sub.id, created_at: sub.created_at, status: sub.status, data: d,
      resortName, resortOwner, sectionCount, sectionPct, status,
      isComplete: sectionCount >= 8,
      isDraft: resortName === "Untitled Resort" && sectionPct === 0,
    };
  });

  const filtered = hideDrafts ? parsed.filter((s) => !s.isDraft) : parsed;
  const draftCount = parsed.filter((s) => s.isDraft).length;

  const statusColors: Record<string, string> = {
    published: "bg-green-500/10 text-green-500 border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    built: "bg-green-500/10 text-green-500 border-green-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    draft: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-heading font-bold">Resort Submissions</h1>
              <p className="text-sm text-muted-foreground">
                {parsed.filter((s) => !s.isDraft).length} resort{parsed.filter((s) => !s.isDraft).length !== 1 ? "s" : ""}
                {hideDrafts && draftCount > 0 && (
                  <span className="text-muted-foreground"> ({draftCount} hidden)</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {draftCount > 0 && (
              <button
                onClick={() => setConfirmingPurge(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Purge {draftCount} Draft{draftCount > 1 ? "s" : ""}
              </button>
            )}
            <button
              onClick={() => setHideDrafts(!hideDrafts)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${hideDrafts ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
            >
              <Check className="w-3.5 h-3.5" />
              {hideDrafts ? "Showing All" : "Hide Drafts"}
            </button>
            <Button onClick={() => (window.location.href = "/")} className="gap-2 min-h-[44px]">
              <Plus className="h-4 w-4" /> New Resort
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-3">Resort</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Progress</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {hideDrafts ? "No active resorts." : "No resorts yet."}
              </p>
              {hideDrafts && parsed.length > 0 && (
                <button onClick={() => setHideDrafts(false)} className="text-sm text-primary underline hover:opacity-80">
                  Show all {parsed.length} submission{parsed.length !== 1 ? "s" : ""}
                </button>
              )}
            </div>
          ) : (
            filtered.map((sub) => {
              return (
                <div
                  key={sub.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  {/* Resort */}
                  <div className="sm:col-span-3">
                    <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Resort</p>
                    <p className="font-semibold truncate">{sub.resortName}</p>
                    {sub.isDraft && (
                      <p className="text-[10px] text-muted-foreground/50 italic">Draft — no content yet</p>
                    )}
                  </div>

                  {/* Owner */}
                  <div className="sm:col-span-2">
                    <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Owner</p>
                    <p className="text-sm text-muted-foreground">{sub.resortOwner || "—"}</p>
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-2">
                    <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Status</p>
                    <Badge variant="outline" className={statusColors[sub.status] || "bg-muted text-muted-foreground"}>
                      {sub.status}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="sm:col-span-3">
                    <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${sub.sectionPct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">{sub.sectionPct}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-2 flex gap-1.5 justify-end">
                    {!sub.isDraft && (
                      <Button size="sm" variant="outline" className="min-h-[36px] min-w-[44px] px-2"
                        onClick={() => (window.location.href = `/resort/${sub.id}`)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="sm" className="min-h-[36px] min-w-[44px] px-2"
                      onClick={() => (window.location.href = `/`)}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <button
                      onClick={() => setDeleteId(sub.id)}
                      className="min-h-[36px] min-w-[44px] px-2 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ───────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => !deleteMutation.isPending && setDeleteId(null)}>
          <div className="bg-background rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold">Delete Resort</h3>
              <button onClick={() => !deleteMutation.isPending && setDeleteId(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              This will permanently delete the resort and all uploaded images.
            </p>
            {/* Show name for confirmation */}
            {(() => { const s = parsed.find((p) => p.id === deleteId); return s ? (
              <p className="text-sm font-medium mb-2">{s.resortName}</p>
            ) : null; })()}
            <p className="text-xs text-muted-foreground/60 font-mono mb-6">{deleteId.slice(0, 12)}…</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 min-h-[44px]" disabled={deleteMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleDelete} className="flex-1 min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting…</>
                ) : (
                  <><Trash2 className="h-4 w-4 mr-2" /> Delete</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Purge All Drafts Confirmation Modal ─────────────── */}
      {confirmingPurge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => !purging && setConfirmingPurge(false)}>
          <div className="bg-background rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-heading font-bold">Purge All Drafts</h3>
              </div>
              <button onClick={() => !purging && setConfirmingPurge(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              This will permanently delete <strong>{draftCount} draft{draftCount > 1 ? "s" : ""}</strong> and all their uploaded images.
            </p>
            <p className="text-xs text-muted-foreground/60 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmingPurge(false)} className="flex-1 min-h-[44px]" disabled={purging}>
                Cancel
              </Button>
              <Button onClick={handlePurgeDrafts} className="flex-1 min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={purging}>
                {purging ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Purging…</>
                ) : (
                  <><RotateCcw className="h-4 w-4 mr-2" /> Purge All</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
