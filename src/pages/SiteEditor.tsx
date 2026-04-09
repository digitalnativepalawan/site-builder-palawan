import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, GripVertical, Eye, Upload as UploadIcon, Loader2, Save, ChevronUp, ChevronDown, Type, Image, Video, Sparkles } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface SectionData {
  headline?: string;
  subheadline?: string;
  body?: string;
  buttonText?: string;
  buttonUrl?: string;
  images?: { url: string; alt: string; caption: string }[];
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "upload";
  videoTitle?: string;
  videoDescription?: string;
}

interface Section {
  id: string;
  site_id: string;
  section_type: string;
  data: SectionData;
  order_index: number;
  created_at: string;
}

function parseSectionData(data: Json): SectionData {
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return data as unknown as SectionData;
  }
  return {};
}

export default function SiteEditor() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editData, setEditData] = useState<SectionData>({});
  const [uploading, setUploading] = useState(false);

  const { data: site } = useQuery({
    queryKey: ["site", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").eq("id", siteId!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: sections, isLoading } = useQuery({
    queryKey: ["sections", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*").eq("site_id", siteId!).order("order_index");
      if (error) throw error;
      return data.map((s) => ({ ...s, data: parseSectionData(s.data) })) as Section[];
    },
  });

  useEffect(() => {
    if (editingSection) {
      setEditData(editingSection.data);
    }
  }, [editingSection]);

  const addSection = useMutation({
    mutationFn: async (type: string) => {
      const maxOrder = sections?.length ? Math.max(...sections.map((s) => s.order_index)) + 1 : 0;
      const defaultData: SectionData = type === "hero" ? { headline: "Welcome", subheadline: "Your amazing site", body: "" }
        : type === "text_block" ? { headline: "", body: "" }
        : type === "image_gallery" ? { images: [] }
        : { videoUrl: "", videoType: "youtube", videoTitle: "" };
      const { error } = await supabase.from("site_content").insert({
        site_id: siteId!,
        section_type: type,
        data: defaultData as unknown as Json,
        order_index: maxOrder,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", siteId] }),
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SectionData }) => {
      const { error } = await supabase.from("site_content").update({ data: data as unknown as Json }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", siteId] });
      toast({ title: "Saved!" });
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", siteId] });
      setEditingSection(null);
    },
  });

  const moveSection = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      if (!sections) return;
      const idx = sections.findIndex((s) => s.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sections.length) return;
      await Promise.all([
        supabase.from("site_content").update({ order_index: sections[swapIdx].order_index }).eq("id", sections[idx].id),
        supabase.from("site_content").update({ order_index: sections[idx].order_index }).eq("id", sections[swapIdx].id),
      ]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", siteId] }),
  });

  const publishSite = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sites").update({ status: "published" }).eq("id", siteId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site", siteId] });
      toast({ title: "Site published! 🎉" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !user || !siteId) return;
    setUploading(true);
    const newImages = [...(editData.images || [])];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${siteId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, file);
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
      newImages.push({ url: urlData.publicUrl, alt: file.name, caption: "" });
    }

    setEditData((d) => ({ ...d, images: newImages }));
    setUploading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !siteId) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${siteId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    setEditData((d) => ({ ...d, videoUrl: urlData.publicUrl, videoType: "upload" }));
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setEditData((d) => ({
      ...d,
      images: (d.images || []).filter((_, i) => i !== index),
    }));
  };

  const sectionIcon = (type: string) => {
    switch (type) {
      case "hero": return <Sparkles className="h-4 w-4" />;
      case "text_block": return <Type className="h-4 w-4" />;
      case "image_gallery": return <Image className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  const sectionLabel = (type: string) => {
    switch (type) {
      case "hero": return "Hero";
      case "text_block": return "Text Block";
      case "image_gallery": return "Image Gallery";
      case "video": return "Video";
      default: return type;
    }
  };

  return (
    <div className="flex min-h-screen flex-col max-w-full overflow-x-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b px-4 py-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] shrink-0" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-heading text-lg font-bold truncate">{site?.site_name || "Loading..."}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="min-h-[44px]" onClick={() => navigate(`/preview/${siteId}`)}>
            <Eye className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Preview</span>
          </Button>
          <Button className="min-h-[44px]" onClick={() => publishSite.mutate()} disabled={publishSite.isPending}>
            {publishSite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 max-w-full overflow-x-hidden">
        {/* Section list */}
        <div className="flex-1 p-4 sm:p-6 max-w-full overflow-x-hidden">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              {sections?.map((section, idx) => (
                <Card
                  key={section.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${editingSection?.id === section.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setEditingSection(section)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {sectionIcon(section.section_type)}
                      <span className="font-medium truncate">{sectionLabel(section.section_type)}</span>
                      {section.data.headline && (
                        <span className="text-sm text-muted-foreground truncate hidden sm:inline">— {section.data.headline}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={(e) => { e.stopPropagation(); moveSection.mutate({ id: section.id, direction: "up" }); }} disabled={idx === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={(e) => { e.stopPropagation(); moveSection.mutate({ id: section.id, direction: "down" }); }} disabled={idx === (sections?.length ?? 0) - 1}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-destructive" onClick={(e) => { e.stopPropagation(); deleteSection.mutate(section.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add section */}
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Add Section</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {[
                    { type: "hero", label: "Hero", icon: <Sparkles className="h-4 w-4" /> },
                    { type: "text_block", label: "Text", icon: <Type className="h-4 w-4" /> },
                    { type: "image_gallery", label: "Images", icon: <Image className="h-4 w-4" /> },
                    { type: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
                  ].map((s) => (
                    <Button key={s.type} variant="outline" className="min-h-[44px] gap-2 flex-1 min-w-[100px]" onClick={() => addSection.mutate(s.type)}>
                      {s.icon} {s.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Edit panel - Sheet on mobile, inline on desktop */}
      <Sheet open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto sm:h-auto sm:max-h-[80vh]">
          <SheetHeader>
            <SheetTitle className="font-heading">{editingSection && sectionLabel(editingSection.section_type)}</SheetTitle>
          </SheetHeader>
          {editingSection && (
            <div className="space-y-4 py-4">
              {/* Text fields for hero / text_block */}
              {(editingSection.section_type === "hero" || editingSection.section_type === "text_block") && (
                <>
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} />
                  </div>
                  {editingSection.section_type === "hero" && (
                    <div className="space-y-2">
                      <Label>Subheadline</Label>
                      <Input className="min-h-[44px]" value={editData.subheadline || ""} onChange={(e) => setEditData((d) => ({ ...d, subheadline: e.target.value }))} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Body Text</Label>
                    <Textarea rows={4} value={editData.body || ""} onChange={(e) => setEditData((d) => ({ ...d, body: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input className="min-h-[44px]" value={editData.buttonText || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonText: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Button URL</Label>
                      <Input className="min-h-[44px]" value={editData.buttonUrl || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonUrl: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}

              {/* Image gallery */}
              {editingSection.section_type === "image_gallery" && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {editData.images?.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img.url} alt={img.alt} className="w-full aspect-square object-cover rounded-lg" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Input
                          placeholder="Alt text"
                          className="mt-1 text-xs min-h-[36px]"
                          value={img.alt}
                          onChange={(e) => {
                            const newImages = [...(editData.images || [])];
                            newImages[i] = { ...newImages[i], alt: e.target.value };
                            setEditData((d) => ({ ...d, images: newImages }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadIcon className="h-5 w-5" />}
                    <span>{uploading ? "Uploading..." : "Upload Images"}</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </>
              )}

              {/* Video */}
              {editingSection.section_type === "video" && (
                <>
                  <div className="space-y-2">
                    <Label>Video Source</Label>
                    <Select value={editData.videoType || "youtube"} onValueChange={(v) => setEditData((d) => ({ ...d, videoType: v as "youtube" | "vimeo" | "upload" }))}>
                      <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube URL</SelectItem>
                        <SelectItem value="vimeo">Vimeo URL</SelectItem>
                        <SelectItem value="upload">Upload Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editData.videoType !== "upload" ? (
                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <Input className="min-h-[44px]" value={editData.videoUrl || ""} onChange={(e) => setEditData((d) => ({ ...d, videoUrl: e.target.value }))} placeholder={editData.videoType === "youtube" ? "https://youtube.com/watch?v=..." : "https://vimeo.com/..."} />
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]">
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadIcon className="h-5 w-5" />}
                      <span>{uploading ? "Uploading..." : editData.videoUrl ? "Replace Video" : "Upload Video"}</span>
                      <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} disabled={uploading} />
                    </label>
                  )}
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input className="min-h-[44px]" value={editData.videoTitle || ""} onChange={(e) => setEditData((d) => ({ ...d, videoTitle: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={editData.videoDescription || ""} onChange={(e) => setEditData((d) => ({ ...d, videoDescription: e.target.value }))} />
                  </div>
                </>
              )}

              <Button
                className="w-full min-h-[44px] gap-2"
                onClick={() => {
                  updateSection.mutate({ id: editingSection.id, data: editData });
                  setEditingSection(null);
                }}
                disabled={updateSection.isPending}
              >
                {updateSection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
