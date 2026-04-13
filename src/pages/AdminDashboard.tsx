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
            <div className="col-span-3">Resort</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Progress</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Rows */}
          {submissions?.map((sub) => {
            // Pull resort name from data.identity.resortName (new) or data.basicInfo.resortName (old)
            const d = sub.data as Record<string, any> || {};
            const identity = d.identity || d.basicInfo || {};
            const resortName = identity.resortName || "Untitled Resort";
            const resortOwner = identity.resortOwner || "";
            const hasMedia = (d.media?.heroImages?.length || 0) > 0;
            const hasAmenities = (d.amenity?.features?.length || d.amenities?.features?.length || 0) > 0;
            const hasRooms = (d.rooms?.roomTypes?.length || 0) > 0;
            const hasFaq = (d.faq?.faqs?.length || 0) > 0;
            const isPublished = d.seo?.publishImmediately === true;
            const status = isPublished ? "published" : (sub.status || "draft");
            const sectionCount = [d.identity, d.brandStory, d.aboutOwner, d.media, d.heroVideo, d.rooms, (d.amenity || d.amenities), d.dining, d.faq, d.headerFooter, d.contact, d.colorPalette, d.seo]
              .filter(Boolean).length;
            const sectionPct = Math.round((sectionCount / 13) * 100);
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
                {/* Resort name */}
                <div className="sm:col-span-3">
                  <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Resort</p>
                  <p className="font-semibold">{resortName}</p>
                  {hasMedia && <span className="text-xs text-primary">✓ Photos</span>}
                  {hasRooms && <span className="text-xs text-primary ml-1">✓ Rooms</span>}
                  {hasFaq && <span className="text-xs text-primary ml-1">✓ FAQ</span>}
                </div>

                {/* Owner */}
                <div className="sm:col-span-2">
                  <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Owner</p>
                  <p className="text-sm text-muted-foreground">{resortOwner || "—"}</p>
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Status</p>
                  <Badge variant="outline" className={statusColors[status] || "bg-muted text-muted-foreground"}>
                    {status}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="sm:col-span-3">
                  <p className="sm:hidden text-xs text-muted-foreground font-semibold uppercase mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${sectionPct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{sectionPct}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="sm:col-span-2 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 min-h-[36px]"
                    onClick={() => window.location.href = `/resort/${sub.id}`}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button size="sm" className="flex-1 gap-1 min-h-[36px]"
                    onClick={() => window.location.href = `/`}>
                    <Edit3 className="h-3.5 w-3.5" /> Edit
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
