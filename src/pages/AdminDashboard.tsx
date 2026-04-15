import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit3, Plus, Eye, Trash2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["resort_submissions"],
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
      const { error } = await supabase
        .from("resort_submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resort_submissions"] });
      toast({
        title: "Business deleted",
        description: "The website has been permanently removed.",
      });
      setDeleteDialogOpen(false);
      setBusinessToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    },
  });

  const handleDeleteClick = (id: string, name: string) => {
    setBusinessToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (businessToDelete) {
      deleteMutation.mutate(businessToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">My Businesses</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Manage and edit your business websites</p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/wizard")}
            className="gap-2 min-h-[44px] bg-blue-600 hover:bg-blue-700 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>New Business</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {submissions?.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
              <Building2 className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No businesses yet</h2>
            <p className="text-gray-500 mb-8 max-w-xs leading-relaxed">
              Create a professional website for your business in minutes — no technical skills needed.
            </p>
            <Button
              onClick={() => navigate("/wizard")}
              className="min-h-[52px] px-8 gap-2 bg-blue-600 hover:bg-blue-700 text-base font-bold rounded-xl"
            >
              <Plus className="h-5 w-5" /> Create Your First Site
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions?.map((s) => {
              const name = s.data?.identity?.resortName || s.data?.identity?.businessName || "Untitled";
              const address = s.data?.location?.fullAddress || s.data?.identity?.location || "";
              const isPublished = s.status === "published";

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Card info */}
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{name}</h3>
                      {address && (
                        <p className="text-sm text-gray-400 mt-0.5 truncate">{address}</p>
                      )}
                      <div className="mt-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isPublished
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {isPublished ? "● Live" : "○ Draft"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="border-t border-gray-50 px-4 py-3 flex items-center gap-2">
                    <Button
                      className="flex-1 min-h-[44px] gap-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
                      size="sm"
                      onClick={() => navigate(`/wizard?edit=${s.id}`)}
                    >
                      <Edit3 className="h-4 w-4" /> Edit Site
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[44px] px-4 gap-1.5 rounded-xl font-semibold"
                      onClick={() => navigate(`/site/${s.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] min-w-[44px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      onClick={() => handleDeleteClick(s.id, name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Add another */}
            <button
              onClick={() => navigate("/wizard")}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Another Business
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete Website Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 space-y-3">
              <p>
                You are about to delete: <span className="font-semibold text-foreground">"{businessToDelete?.name}"</span>
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 space-y-1">
                <p className="font-semibold">This cannot be undone:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>All website data will be permanently deleted</li>
                  <li>All content, images, and settings will be lost</li>
                  <li>The website URL will stop working</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="min-h-[44px] rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Yes, Delete Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
