import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit3, Loader2, Building2 } from "lucide-react";

export default function AdminDashboard() {
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
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-heading font-bold">Resort Submissions</h1>
            <p className="text-sm text-muted-foreground">{submissions?.length || 0} resorts in the system</p>
          </div>
        </div>

        {/* Submissions table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-4">Resort Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Rows */}
          {submissions?.map((sub) => {
            const basicInfo = (sub.data as any)?.basicInfo || {};
            const resortName = basicInfo.resortName || "Untitled";
            const resortType = basicInfo.resortType || "—";
            const status = sub.status || "pending";
            const statusColors: Record<string, string> = {
              pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
              built: "bg-green-500/10 text-green-500 border-green-500/20",
              failed: "bg-red-500/10 text-red-500 border-red-500/20",
              processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            };

            return (
              <div
                key={sub.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                {/* Mobile: stacked name */}
                <div className="sm:col-span-4">
                  <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Resort Name</p>
                  <p className="font-semibold">{resortName}</p>
                  <p className="text-xs text-muted-foreground truncate">{sub.id}</p>
                </div>

                {/* Type */}
                <div className="sm:col-span-2">
                  <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Type</p>
                  <p className="text-sm text-muted-foreground capitalize">{resortType}</p>
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Status</p>
                  <Badge variant="outline" className={statusColors[status] || "bg-muted text-muted-foreground"}>
                    {status}
                  </Badge>
                </div>

                {/* Date */}
                <div className="sm:col-span-2">
                  <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Date</p>
                  <p className="text-sm text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                <div className="sm:col-span-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 min-h-[36px]"
                    onClick={() => window.location.href = `/resort/${sub.id}`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-1 min-h-[36px]"
                    onClick={() => window.location.href = `/`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
