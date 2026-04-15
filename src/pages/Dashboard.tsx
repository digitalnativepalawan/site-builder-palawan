import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, ExternalLink, Trash2, Globe, Loader2, Building2, MoreVertical } from "lucide-react";
import { format } from "date-fns";

function generateSubdomain(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
}

const BUSINESS_TYPES = [
  { value: "resort", label: "🏖️ Resort / Hotel" },
  { value: "restaurant", label: "🍽️ Restaurant / Café" },
  { value: "service", label: "🛠️ Service Business" },
  { value: "shop", label: "🛍️ Shop / Retail" },
  { value: "portfolio", label: "🎨 Portfolio / Creative" },
  { value: "blog", label: "✍️ Blog / Content" },
];

const TYPE_COLORS: Record<string, string> = {
  resort: "bg-cyan-50 text-cyan-700 border-cyan-200",
  restaurant: "bg-orange-50 text-orange-700 border-orange-200",
  service: "bg-blue-50 text-blue-700 border-blue-200",
  shop: "bg-purple-50 text-purple-700 border-purple-200",
  portfolio: "bg-pink-50 text-pink-700 border-pink-200",
  blog: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function Dashboard() {
  const DEV_USER_ID = "4f66ea34-fdde-44aa-8d98-99c2a5a89f16";
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newSiteName, setNewSiteName] = useState("");
  const [newTemplate, setNewTemplate] = useState("service");

  const { data: sites, isLoading } = useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createSite = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("sites").insert({
        user_id: DEV_USER_ID,
        site_name: newSiteName,
        subdomain: generateSubdomain(newSiteName),
        template: newTemplate,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      setCreateOpen(false);
      setNewSiteName("");
      toast({ title: "Business created! Let's build your site." });
      navigate(`/sites/${data.id}/edit`);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteSite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      setDeleteId(null);
      toast({ title: "Site deleted" });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="h-5 w-5 text-blue-600 shrink-0" />
            <h1 className="font-bold text-lg text-gray-900 truncate">My Businesses</h1>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="min-h-[44px] gap-2 shrink-0 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                <span>New Business</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-md rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Create Your Business Site</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Fill in the basics — you can add more details after.</p>
              </DialogHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); if (newSiteName.trim()) createSite.mutate(); }}
                className="space-y-5 mt-4"
              >
                <div className="space-y-2">
                  <Label className="font-semibold">Business Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    required
                    className="min-h-[48px] rounded-xl text-base"
                    placeholder="e.g. Sunset Beach Resort"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Business Type</Label>
                  <Select value={newTemplate} onValueChange={setNewTemplate}>
                    <SelectTrigger className="min-h-[48px] rounded-xl text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="min-h-[44px] text-base">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400">Don't worry — all types share the same sections. This just sets the default labels.</p>
                </div>
                <Button
                  type="submit"
                  className="w-full min-h-[52px] rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700"
                  disabled={createSite.isPending || !newSiteName.trim()}
                >
                  {createSite.isPending
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
                    : "Create & Start Building →"
                  }
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : !sites?.length ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
              <Building2 className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Build your first website</h2>
            <p className="text-gray-500 mb-8 max-w-xs leading-relaxed">
              Create a professional website for your business in minutes — no technical skills needed.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="min-h-[52px] px-8 gap-2 bg-blue-600 hover:bg-blue-700 text-base font-bold rounded-xl"
            >
              <Plus className="h-5 w-5" /> Create Your First Site
            </Button>
          </div>
        ) : (
          /* Sites grid */
          <div className="space-y-3">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Card top */}
                <div className="p-4 flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xl">
                      {BUSINESS_TYPES.find(t => t.value === site.template)?.label.split(" ")[0] || "🌐"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{site.site_name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[site.template] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {BUSINESS_TYPES.find(t => t.value === site.template)?.label.split(" ").slice(1).join(" ") || site.template}
                      </span>
                      <span className="text-xs text-gray-400">
                        Updated {format(new Date(site.updated_at), "MMM d")}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        site.status === "published"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}>
                        {site.status === "published" ? "● Live" : "○ Draft"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action bar */}
                <div className="border-t border-gray-50 px-4 py-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1 min-h-[44px] gap-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
                    onClick={() => navigate(`/sites/${site.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" /> Edit Site
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[44px] px-4 gap-1.5 rounded-xl font-semibold"
                    onClick={() => navigate(`/preview/${site.id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="min-h-[44px] min-w-[44px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    onClick={() => setDeleteId(site.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add another */}
            <button
              onClick={() => setCreateOpen(true)}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Another Business
            </button>
          </div>
        )}
      </main>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this site?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. All content and uploaded files will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="min-h-[44px] rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteSite.mutate(deleteId)}
            >
              Delete Site
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
