import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, ExternalLink, Trash2, Menu, Globe, Settings, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
import { format } from "date-fns";

function generateSubdomain(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
}

function SidebarNav() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const links = [
    { icon: LayoutDashboard, label: "My Sites", onClick: () => navigate("/dashboard") },
    { icon: Settings, label: "Account", onClick: () => navigate("/account") },
    { icon: LogOut, label: "Logout", onClick: signOut },
  ];

  return (
    <nav className="flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <Globe className="h-6 w-6 text-sidebar-primary" />
        <span className="font-heading text-lg font-bold text-sidebar-foreground">SiteForge</span>
      </div>
      {links.map((link) => (
        <button
          key={link.label}
          onClick={link.onClick}
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px]"
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </button>
      ))}
    </nav>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newSiteName, setNewSiteName] = useState("");
  const [newTemplate, setNewTemplate] = useState("business");

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
        user_id: user!.id,
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
      toast({ title: "Site created!" });
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

  const templateColors: Record<string, string> = {
    business: "bg-info/10 text-info",
    portfolio: "bg-foreground/10 text-foreground",
    blog: "bg-warning/10 text-warning",
  };

  return (
    <div className="flex min-h-screen max-w-full overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarNav />
      </aside>

      <div className="flex-1 flex flex-col max-w-full overflow-x-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px]">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar">
                <SidebarNav />
              </SheetContent>
            </Sheet>
            <h1 className="font-heading text-xl font-bold sm:text-2xl">My Sites</h1>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="min-h-[44px] gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Site</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Create New Site</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); createSite.mutate(); }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input value={newSiteName} onChange={(e) => setNewSiteName(e.target.value)} required className="min-h-[44px]" placeholder="My Awesome Site" />
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={newTemplate} onValueChange={setNewTemplate}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">🏢 Business</SelectItem>
                      <SelectItem value="portfolio">🎨 Portfolio</SelectItem>
                      <SelectItem value="blog">✍️ Blog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full min-h-[44px]" disabled={createSite.isPending}>
                  {createSite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Site
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !sites?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <Globe className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="font-heading text-xl font-semibold mb-2">No sites yet</h2>
              <p className="text-muted-foreground mb-6">Create your first site to get started</p>
              <Button onClick={() => setCreateOpen(true)} className="min-h-[44px] gap-2">
                <Plus className="h-4 w-4" /> Create Your First Site
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sites.map((site) => (
                <Card key={site.id} className="animate-fade-in hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-heading text-lg">{site.site_name}</CardTitle>
                      <Badge variant={site.status === "published" ? "default" : "secondary"} className={site.status === "published" ? "bg-success text-accent-foreground" : ""}>
                        {site.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Badge variant="outline" className={templateColors[site.template]}>{site.template}</Badge>
                      <span>·</span>
                      <span>{format(new Date(site.updated_at), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="min-h-[44px] flex-1 gap-1" onClick={() => navigate(`/sites/${site.id}/edit`)}>
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="min-h-[44px] flex-1 gap-1" onClick={() => navigate(`/preview/${site.id}`)}>
                        <ExternalLink className="h-3.5 w-3.5" /> Preview
                      </Button>
                      <Button size="sm" variant="ghost" className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive" onClick={() => setDeleteId(site.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this site?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All content and uploaded files will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction className="min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteId && deleteSite.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
