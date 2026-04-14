import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit3, Plus, Eye } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your resorts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Resort Submissions</h1>
          <p className="text-muted-foreground mt-1">Manage and edit your resort websites</p>
        </div>
        <Button onClick={() => navigate("/wizard")} className="gap-2">
          <Plus className="h-4 w-4" /> New Resort
        </Button>
      </div>

      {submissions?.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">No resorts yet</h2>
          <p className="text-muted-foreground mb-4">Create your first resort website</p>
          <Button onClick={() => navigate("/wizard")}>
            <Plus className="h-4 w-4 mr-2" /> Create Resort
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions?.map((s) => (
            <div
              key={s.id}
              className="p-6 border rounded-lg bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {s.data?.identity?.resortName || "Untitled"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {s.data?.location?.fullAddress || "No address"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        s.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {s.status || "draft"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/resort/${s.id}`)}
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/wizard?edit=${s.id}`)}
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
