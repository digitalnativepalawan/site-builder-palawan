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
import {
  ArrowLeft, Plus, Trash2, GripVertical, Eye, Upload as UploadIcon,
  Loader2, Save, ChevronUp, ChevronDown, Type, Image, Sparkles,
  LayoutPanelLeft, Grid3X3,
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface CardItem {
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

interface SectionData {
  headline?: string;
  subheadline?: string;
  body?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonText2?: string;
  buttonUrl2?: string;
  backgroundImage?: string;
  alignment?: "left" | "center";
  width?: "narrow" | "normal";
  background?: "white" | "light-gray";
  images?: { url: string; alt: string; caption: string }[];
  layout?: "single" | "2-col" | "3-col";
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  cards?: CardItem[];
  columns?: 2 | 3 | 4;
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

const BLOCK_TYPES = [
  { type: "text_block", label: "Text Block", icon: <Type className="h-4 w-4" /> },
  { type: "image_gallery", label: "Image Gallery", icon: <Image className="h-4 w-4" /> },
  { type: "split_layout", label: "Split Layout", icon: <LayoutPanelLeft className="h-4 w-4" /> },
  { type: "grid_cards", label: "Grid / Cards", icon: <Grid3X3 className="h-4 w-4" /> },
];

function sectionIcon(type: string) {
  switch (type) {
    case "hero": return <Sparkles className="h-4 w-4" />;
    case "text_block": return <Type className="h-4 w-4" />;
    case "image_gallery": return <Image className="h-4 w-4" />;
    case "split_layout": return <LayoutPanelLeft className="h-4 w-4" />;
    case "grid_cards": return <Grid3X3 className="h-4 w-4" />;
    default: return <Type className="h-4 w-4" />;
  }
}

function sectionLabel(type: string) {
  switch (type) {
    case "hero": return "Hero";
    case "text_block": return "Text Block";
    case "image_gallery": return "Image Gallery";
    case "split_layout": return "Split Layout";
    case "grid_cards": return "Grid / Cards";
    default: return type;
  }
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

  // Auto-create hero if none exists
  const ensureHero = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("id")
        .eq("site_id", siteId!)
        .eq("section_type", "hero")
        .limit(1);
      if (error) throw error;
      if (data.length === 0) {
        const { error: insertError } = await supabase.from("site_content").insert({
          site_id: siteId!,
          section_type: "hero",
          data: { headline: "Welcome", subheadline: "Your amazing site" } as unknown as Json,
          order_index: 0,
        });
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", siteId] }),
  });

  useEffect(() => {
    if (siteId && sections && !sections.find((s) => s.section_type === "hero")) {
      ensureHero.mutate();
    }
  }, [siteId, sections]);

  useEffect(() => {
    if (editingSection) setEditData(editingSection.data);
  }, [editingSection]);

  const addSection = useMutation({
    mutationFn: async (type: string) => {
      const maxOrder = sections?.length ? Math.max(...sections.map((s) => s.order_index)) + 1 : 1;
      const defaults: Record<string, SectionData> = {
        text_block: { headline: "", body: "", alignment: "left", width: "normal", background: "white" },
        image_gallery: { images: [], layout: "3-col" },
        split_layout: { headline: "", body: "", imageUrl: "", imagePosition: "left" },
        grid_cards: { headline: "", cards: [{ image: "", title: "", subtitle: "", description: "" }], columns: 3 },
      };
      const { error } = await supabase.from("site_content").insert({
        site_id: siteId!,
        section_type: type,
        data: (defaults[type] || {}) as unknown as Json,
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
      // Don't allow swapping past hero (index 0)
      if (sections[0]?.section_type === "hero" && (swapIdx === 0 || idx === 0)) return;
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

  // --- Upload helpers ---
  const uploadFile = async (file: File, accept: "image" | "video" = "image") => {
    if (!user || !siteId) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${siteId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const newImages = [...(editData.images || [])];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) newImages.push({ url, alt: file.name, caption: "" });
    }
    setEditData((d) => ({ ...d, images: newImages }));
    setUploading(false);
  };

  const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "imageUrl" | "backgroundImage") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setEditData((d) => ({ ...d, [field]: url }));
    setUploading(false);
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) {
      setEditData((d) => {
        const cards = [...(d.cards || [])];
        cards[cardIndex] = { ...cards[cardIndex], image: url };
        return { ...d, cards };
      });
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setEditData((d) => ({ ...d, images: (d.images || []).filter((_, i) => i !== index) }));
  };

  const isHero = (s: Section) => s.section_type === "hero";

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
                      {!isHero(section) && (
                        <>
                          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={(e) => { e.stopPropagation(); moveSection.mutate({ id: section.id, direction: "up" }); }} disabled={idx <= 1}>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={(e) => { e.stopPropagation(); moveSection.mutate({ id: section.id, direction: "down" }); }} disabled={idx === (sections?.length ?? 0) - 1}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-destructive" onClick={(e) => { e.stopPropagation(); deleteSection.mutate(section.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add block */}
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Add Block</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {BLOCK_TYPES.map((b) => (
                    <Button key={b.type} variant="outline" className="min-h-[44px] gap-2 flex-1 min-w-[120px]" onClick={() => addSection.mutate(b.type)}>
                      {b.icon} {b.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Edit panel */}
      <Sheet open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto sm:h-auto sm:max-h-[80vh]">
          <SheetHeader>
            <SheetTitle className="font-heading">{editingSection && sectionLabel(editingSection.section_type)}</SheetTitle>
          </SheetHeader>
          {editingSection && (
            <div className="space-y-4 py-4">
              {/* HERO */}
              {editingSection.section_type === "hero" && <HeroEditPanel editData={editData} setEditData={setEditData} uploading={uploading} onBgUpload={(e) => handleSingleImageUpload(e, "backgroundImage")} />}

              {/* TEXT BLOCK */}
              {editingSection.section_type === "text_block" && <TextBlockEditPanel editData={editData} setEditData={setEditData} />}

              {/* IMAGE GALLERY */}
              {editingSection.section_type === "image_gallery" && <ImageGalleryEditPanel editData={editData} setEditData={setEditData} uploading={uploading} onUpload={handleImageUpload} onRemove={removeImage} />}

              {/* SPLIT LAYOUT */}
              {editingSection.section_type === "split_layout" && <SplitLayoutEditPanel editData={editData} setEditData={setEditData} uploading={uploading} onImageUpload={(e) => handleSingleImageUpload(e, "imageUrl")} />}

              {/* GRID / CARDS */}
              {editingSection.section_type === "grid_cards" && <GridCardsEditPanel editData={editData} setEditData={setEditData} uploading={uploading} onCardImageUpload={handleCardImageUpload} />}

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

/* ─── Edit Panels ─── */

function HeroEditPanel({ editData, setEditData, uploading, onBgUpload }: {
  editData: SectionData;
  setEditData: React.Dispatch<React.SetStateAction<SectionData>>;
  uploading: boolean;
  onBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Subheadline</Label>
        <Input className="min-h-[44px]" value={editData.subheadline || ""} onChange={(e) => setEditData((d) => ({ ...d, subheadline: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Body Text</Label>
        <Textarea rows={3} value={editData.body || ""} onChange={(e) => setEditData((d) => ({ ...d, body: e.target.value }))} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Button 1 Text</Label>
          <Input className="min-h-[44px]" value={editData.buttonText || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonText: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Button 1 URL</Label>
          <Input className="min-h-[44px]" value={editData.buttonUrl || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonUrl: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Button 2 Text</Label>
          <Input className="min-h-[44px]" value={editData.buttonText2 || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonText2: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Button 2 URL</Label>
          <Input className="min-h-[44px]" value={editData.buttonUrl2 || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonUrl2: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Background Image</Label>
        {editData.backgroundImage && (
          <img src={editData.backgroundImage} alt="" className="w-full max-h-40 object-cover rounded-lg" />
        )}
        <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadIcon className="h-5 w-5" />}
          <span>{uploading ? "Uploading..." : editData.backgroundImage ? "Replace Image" : "Upload Background"}</span>
          <input type="file" className="hidden" accept="image/*" onChange={onBgUpload} disabled={uploading} />
        </label>
      </div>
    </>
  );
}

function TextBlockEditPanel({ editData, setEditData }: {
  editData: SectionData;
  setEditData: React.Dispatch<React.SetStateAction<SectionData>>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Body Text</Label>
        <Textarea rows={6} value={editData.body || ""} onChange={(e) => setEditData((d) => ({ ...d, body: e.target.value }))} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Alignment</Label>
          <Select value={editData.alignment || "left"} onValueChange={(v) => setEditData((d) => ({ ...d, alignment: v as "left" | "center" }))}>
            <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Width</Label>
          <Select value={editData.width || "normal"} onValueChange={(v) => setEditData((d) => ({ ...d, width: v as "narrow" | "normal" }))}>
            <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="narrow">Narrow (800px)</SelectItem>
              <SelectItem value="normal">Normal (full)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Background</Label>
          <Select value={editData.background || "white"} onValueChange={(v) => setEditData((d) => ({ ...d, background: v as "white" | "light-gray" }))}>
            <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="light-gray">Light Gray</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}

function ImageGalleryEditPanel({ editData, setEditData, uploading, onUpload, onRemove }: {
  editData: SectionData;
  setEditData: React.Dispatch<React.SetStateAction<SectionData>>;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={editData.layout || "3-col"} onValueChange={(v) => setEditData((d) => ({ ...d, layout: v as "single" | "2-col" | "3-col" }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Image</SelectItem>
            <SelectItem value="2-col">2 Columns</SelectItem>
            <SelectItem value="3-col">3 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {editData.images?.map((img, i) => (
          <div key={i} className="relative group">
            <img src={img.url} alt={img.alt} className="w-full aspect-square object-cover rounded-lg" />
            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(i)}>
              <Trash2 className="h-3 w-3" />
            </Button>
            <Input placeholder="Alt text" className="mt-1 text-xs min-h-[36px]" value={img.alt} onChange={(e) => {
              const newImages = [...(editData.images || [])];
              newImages[i] = { ...newImages[i], alt: e.target.value };
              setEditData((d) => ({ ...d, images: newImages }));
            }} />
            <Input placeholder="Caption" className="mt-1 text-xs min-h-[36px]" value={img.caption} onChange={(e) => {
              const newImages = [...(editData.images || [])];
              newImages[i] = { ...newImages[i], caption: e.target.value };
              setEditData((d) => ({ ...d, images: newImages }));
            }} />
          </div>
        ))}
      </div>
      <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]">
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadIcon className="h-5 w-5" />}
        <span>{uploading ? "Uploading..." : "Upload Images"}</span>
        <input type="file" className="hidden" accept="image/*" multiple onChange={onUpload} disabled={uploading} />
      </label>
    </>
  );
}

function SplitLayoutEditPanel({ editData, setEditData, uploading, onImageUpload }: {
  editData: SectionData;
  setEditData: React.Dispatch<React.SetStateAction<SectionData>>;
  uploading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Image Position</Label>
        <Select value={editData.imagePosition || "left"} onValueChange={(v) => setEditData((d) => ({ ...d, imagePosition: v as "left" | "right" }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Image Left</SelectItem>
            <SelectItem value="right">Image Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Image</Label>
        {editData.imageUrl && <img src={editData.imageUrl} alt={editData.imageAlt || ""} className="w-full max-h-40 object-cover rounded-lg" />}
        <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadIcon className="h-5 w-5" />}
          <span>{uploading ? "Uploading..." : editData.imageUrl ? "Replace Image" : "Upload Image"}</span>
          <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} disabled={uploading} />
        </label>
        <Input placeholder="Image alt text" className="min-h-[44px]" value={editData.imageAlt || ""} onChange={(e) => setEditData((d) => ({ ...d, imageAlt: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} />
      </div>
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
  );
}

function GridCardsEditPanel({ editData, setEditData, uploading, onCardImageUpload }: {
  editData: SectionData;
  setEditData: React.Dispatch<React.SetStateAction<SectionData>>;
  uploading: boolean;
  onCardImageUpload: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
}) {
  const cards = editData.cards || [];

  const addCard = () => {
    setEditData((d) => ({
      ...d,
      cards: [...(d.cards || []), { image: "", title: "", subtitle: "", description: "" }],
    }));
  };

  const removeCard = (idx: number) => {
    setEditData((d) => ({ ...d, cards: (d.cards || []).filter((_, i) => i !== idx) }));
  };

  const updateCard = (idx: number, field: keyof CardItem, value: string) => {
    setEditData((d) => {
      const newCards = [...(d.cards || [])];
      newCards[idx] = { ...newCards[idx], [field]: value };
      return { ...d, cards: newCards };
    });
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Section Headline</Label>
        <Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Columns</Label>
        <Select value={String(editData.columns || 3)} onValueChange={(v) => setEditData((d) => ({ ...d, columns: Number(v) as 2 | 3 | 4 }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {cards.map((card, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Card {idx + 1}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeCard(idx)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              {card.image && <img src={card.image} alt="" className="w-full max-h-24 object-cover rounded" />}
              <label className="flex items-center justify-center gap-2 rounded border-2 border-dashed p-3 cursor-pointer hover:bg-muted/50 text-sm min-h-[44px]">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadIcon className="h-4 w-4" />}
                <span>{card.image ? "Replace" : "Upload"} Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onCardImageUpload(e, idx)} disabled={uploading} />
              </label>
              <Input placeholder="Title" className="min-h-[44px]" value={card.title} onChange={(e) => updateCard(idx, "title", e.target.value)} />
              <Input placeholder="Subtitle" className="min-h-[44px]" value={card.subtitle} onChange={(e) => updateCard(idx, "subtitle", e.target.value)} />
              <Textarea placeholder="Description" rows={2} value={card.description} onChange={(e) => updateCard(idx, "description", e.target.value)} />
            </CardContent>
          </Card>
        ))}
      </div>
      <Button variant="outline" className="w-full min-h-[44px] gap-2" onClick={addCard}>
        <Plus className="h-4 w-4" /> Add Card
      </Button>
    </>
  );
}
