import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    try {
      // Delete all user's sites (cascade will handle site_content, site_settings)
      const { data: sites } = await supabase.from("sites").select("id").eq("user_id", user!.id);
      if (sites) {
        for (const site of sites) {
          // Delete storage files for each site
          const { data: files } = await supabase.storage.from("site-assets").list(`${user!.id}/${site.id}`);
          if (files?.length) {
            await supabase.storage.from("site-assets").remove(
              files.map(f => `${user!.id}/${site.id}/${f.name}`)
            );
          }
          // Delete site content and settings
          await supabase.from("site_content").delete().eq("site_id", site.id);
          await supabase.from("site_settings").delete().eq("site_id", site.id);
        }
        // Delete all sites
        await supabase.from("sites").delete().eq("user_id", user!.id);
      }

      // Sign out
      await signOut();
      toast({ title: "Account data deleted", description: "Your sites and data have been removed." });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col max-w-full overflow-x-hidden">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-heading text-lg font-bold">Account Settings</h1>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Email</Label>
          <p className="font-medium">{user?.email}</p>
        </div>

        <hr className="border-border" />

        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground">
            Deleting your account will permanently remove all your sites, content, uploaded files, and settings.
          </p>
          <Button
            variant="destructive"
            className="min-h-[44px] gap-2"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={v => { if (!v) { setShowDelete(false); setConfirmText(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block font-semibold text-destructive">This action is permanent and cannot be undone.</span>
              <span className="block">All your sites, content, and uploaded files will be permanently deleted.</span>
              <span className="block">Type <strong>DELETE</strong> below to confirm:</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="min-h-[44px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              className="min-h-[44px]"
              disabled={confirmText !== "DELETE" || deleting}
              onClick={handleDeleteAccount}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Permanently Delete Account
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
