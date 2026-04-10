import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Eye, Loader2, Save, ChevronUp, ChevronDown, Settings,
  LayoutTemplate, AlignLeft, Image, List, CreditCard, HelpCircle, Columns2, Hash, Grid3x3, Clock, Youtube, Mail, Minus, Megaphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { parseSectionData, sectionLabel, SECTION_TYPES, SECTION_DEFAULTS } from "@/types/sections";
import type { SectionData, Section } from "@/types/sections";
import {
  CoverEditPanel, TextBlockEditPanel, PhotoEditPanel, BulletListEditPanel,
  PricingEditPanel, FaqEditPanel, TwoColumnsEditPanel, KeyNumbersEditPanel,
  NumberCardsEditPanel, TimelineEditPanel, YoutubeEditPanel, ContactFormEditPanel,
  SeparatorEditPanel, CtaEditPanel, ImageGalleryEditPanel,
} from "@/components/editor/EditPanels";

export default function SiteEditor() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editData, setEditData] = useState<SectionData>({});
  const [uploading, setUploading] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

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

  // Auto-create cover if none exists
  const ensureCover = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("site_content").select("id").eq("site_id", siteId!)
        .in("section_type", ["cover", "hero"]).limit(1);
      if (error) throw error;
      if (data.length === 0) {
        await supabase.from("site_content").insert({
          site_id: siteId!,
          section_type: "cover",
          data: (SECTION_DEFAULTS.cover || {}) as unknown as Json,
          order_index: 0,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", siteId] }),
  });

  useEffect(() => {
    if (siteId && sections && !sections.find((s) => s.section_type === "cover" || s.section_type === "hero")) {
      ensureCover.mutate();
    }
  }, [siteId, sections]);

  useEffect(() => {
    if (editingSection) setEditData(editingSection.data);
  }, [editingSection]);

  const addSection = useMutation({
    mutationFn: async (type: string) => {
      const maxOrder = sections?.length ? Math.max(...sections.map((s) => s.order_index)) + 1 : 1;
      await supabase.from("site_content").insert({
        site_id: siteId!,
        section_type: type,
        data: (SECTION_DEFAULTS[type] || {}) as unknown as Json,
        order_index: maxOrder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", siteId] });
      setShowAddMenu(false);
    },
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
      await supabase.from("site_content").delete().eq("id", id);
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
      const isCover = (s: Section) => s.section_type === "cover" || s.section_type === "hero";
      if (isCover(sections[0]) && (swapIdx === 0 || idx === 0)) return;
      await Promise.all([
        supabase.from("site_content").update({ order_index: sections[swapIdx].order_index }).eq("id", sections[idx].id),
        supabase.from("site_content").update({ order_index: sections[idx].order_index }).eq("id", sections[swapIdx].id),
      ]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", siteId] }),
  });

  const publishSite = useMutation({
    mutationFn: async () => {
      await supabase.from("sites").update({ status: "published" }).eq("id", siteId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site", siteId] });
      toast({ title: "Site published! 🎉" });
    },
  });

  // --- Upload helpers ---
  const uploadFile = async (file: File) => {
    if (!user || !siteId) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${siteId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    return supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
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

  const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setEditData((d) => ({ ...d, [field]: url }));
    setUploading(false);
  };

  const SECTION_ICONS: Record<string, LucideIcon> = {
    cover: LayoutTemplate, hero: LayoutTemplate, text_block: AlignLeft, photo: Image,
    image_gallery: Image, bullet_list: List, pricing: CreditCard, faq: HelpCircle,
    two_columns: Columns2, key_numbers: Hash, number_cards: Grid3x3, timeline: Clock,
    youtube: Youtube, contact_form: Mail, separator: Minus, cta: Megaphone,
    split_layout: Columns2, grid_cards: Grid3x3,
  };

  const isCoverType = (s: Section) => s.section_type === "cover" || s.section_type === "hero";

  const renderEditPanel = () => {
    if (!editingSection) return null;
    const t = editingSection.section_type;
    const up = { editData, setEditData, uploading };

    switch (t) {
      case "cover": case "hero":
        return <CoverEditPanel {...up} onBgUpload={(e) => handleSingleUpload(e, "backgroundImage")} />;
      case "text_block":
        return <TextBlockEditPanel editData={editData} setEditData={setEditData} />;
      case "photo":
        return <PhotoEditPanel {...up} onImageUpload={(e) => handleSingleUpload(e, "imageUrl")} />;
      case "image_gallery":
        return <ImageGalleryEditPanel {...up} onUpload={handleImageUpload} onRemove={(i) => setEditData((d) => ({ ...d, images: (d.images || []).filter((_, j) => j !== i) }))} />;
      case "bullet_list":
        return <BulletListEditPanel editData={editData} setEditData={setEditData} />;
      case "pricing":
        return <PricingEditPanel editData={editData} setEditData={setEditData} />;
      case "faq":
        return <FaqEditPanel editData={editData} setEditData={setEditData} />;
      case "two_columns":
        return <TwoColumnsEditPanel editData={editData} setEditData={setEditData} />;
      case "key_numbers":
        return <KeyNumbersEditPanel editData={editData} setEditData={setEditData} />;
      case "number_cards":
        return <NumberCardsEditPanel editData={editData} setEditData={setEditData} />;
      case "timeline":
        return <TimelineEditPanel editData={editData} setEditData={setEditData} />;
      case "youtube":
        return <YoutubeEditPanel {...up} onVideoUpload={(e) => handleSingleUpload(e, "videoFileUrl")} />;
      case "contact_form":
        return <ContactFormEditPanel editData={editData} setEditData={setEditData} />;
      case "separator":
        return <SeparatorEditPanel editData={editData} setEditData={setEditData} />;
      case "cta":
        return <CtaEditPanel editData={editData} setEditData={setEditData} />;
      default:
        return <p className="text-muted-foreground">Unknown section type</p>;
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
          <Button variant="outline" className="min-h-[44px]" onClick={() => navigate(`/sites/${siteId}/settings`)}>
            <Settings className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Settings</span>
          </Button>
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
                      <span className="font-medium truncate">{sectionLabel(section.section_type)}</span>
                      {section.data.headline && (
                        <span className="text-sm text-muted-foreground truncate hidden sm:inline">— {section.data.headline}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!isCoverType(section) && (
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

              {/* Add Section */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  {!showAddMenu ? (
                    <Button variant="outline" className="w-full min-h-[44px] gap-2" onClick={() => setShowAddMenu(true)}>
                      <Plus className="h-4 w-4" /> Add Section
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Choose a section type</span>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddMenu(false)}>Cancel</Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SECTION_TYPES.filter(s => s.type !== "cover").map((s) => (
                          <Button
                            key={s.type}
                            variant="outline"
                            className="min-h-[44px] justify-start gap-2 text-left h-auto py-3"
                            onClick={() => addSection.mutate(s.type)}
                          >
                            <span className="text-lg shrink-0">{s.label.split(" ")[0]}</span>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{s.label.slice(s.label.indexOf(" ") + 1)}</div>
                              <div className="text-xs text-muted-foreground truncate">{s.desc}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
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
              {renderEditPanel()}
              <Button
                className="w-full min-h-[44px] gap-2"
                onClick={() => { updateSection.mutate({ id: editingSection.id, data: editData }); setEditingSection(null); }}
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
