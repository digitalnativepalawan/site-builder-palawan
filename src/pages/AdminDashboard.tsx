import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit3, Plus } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: submissions } = useQuery({
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

  return (
    <div className="p-8">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold">Resort Submissions</h1>
        <Button onClick={() => navigate("/wizard")}>New Resort</Button>
      </div>

      <div className="space-y-4">
        {submissions?.map((s) => (
          <div key={s.id} className="p-4 border rounded flex justify-between items-center bg-white">
            <span>{s.data?.identity?.resortName || "Untitled"}</span>
            <Button variant="outline" onClick={() => navigate(`/wizard?edit=${s.id}`)}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
