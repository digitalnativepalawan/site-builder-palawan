import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Upload as UploadIcon, Loader2 } from "lucide-react";
import type { SectionData, BulletItem, PricingPlan, FaqItem, KeyNumber, NumberCard, TimelineEvent } from "@/types/sections";

type EP = {
  editData: SectionData;
  setEditData: React.Dispatch<React.SetStateAction<SectionData>>;
};
type EPUpload = EP & { uploading: boolean };

/* ═══ File upload label helper ═══ */
function UploadArea({ uploading, label, hasFile, accept = "image/*", onChange, multiple }: {
  uploading: boolean; label: string; hasFile?: boolean; accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; multiple?: boolean;
}) {
  return (
    <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]">
      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadIcon className="h-5 w-5" />}
      <span>{uploading ? "Uploading..." : hasFile ? `Replace ${label}` : `Upload ${label}`}</span>
      <input type="file" className="hidden" accept={accept} onChange={onChange} disabled={uploading} multiple={multiple} />
    </label>
  );
}

/* ═══ 1. COVER / BANNER ═══ */
export function CoverEditPanel({ editData, setEditData, uploading, onBgUpload }: EPUpload & { onBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <>
      <Field label="Headline"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      <Field label="Subheadline"><Input className="min-h-[44px]" value={editData.subheadline || ""} onChange={(e) => setEditData((d) => ({ ...d, subheadline: e.target.value }))} /></Field>
      <Field label="Body Text"><Textarea rows={3} value={editData.body || ""} onChange={(e) => setEditData((d) => ({ ...d, body: e.target.value }))} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Button Text"><Input className="min-h-[44px]" value={editData.buttonText || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonText: e.target.value }))} /></Field>
        <Field label="Button URL"><Input className="min-h-[44px]" value={editData.buttonUrl || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonUrl: e.target.value }))} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Button 2 Text"><Input className="min-h-[44px]" value={editData.buttonText2 || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonText2: e.target.value }))} /></Field>
        <Field label="Button 2 URL"><Input className="min-h-[44px]" value={editData.buttonUrl2 || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonUrl2: e.target.value }))} /></Field>
      </div>
      <div className="space-y-2">
        <Label>Background Image</Label>
        {editData.backgroundImage && <img src={editData.backgroundImage} alt="" className="w-full max-h-40 object-cover rounded-lg" />}
        <UploadArea uploading={uploading} label="Background" hasFile={!!editData.backgroundImage} onChange={onBgUpload} />
      </div>
    </>
  );
}

/* ═══ 2. TEXT SECTION ═══ */
export function TextBlockEditPanel({ editData, setEditData }: EP) {
  return (
    <>
      <Field label="Headline"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      <Field label="Body Text"><Textarea rows={6} value={editData.body || ""} onChange={(e) => setEditData((d) => ({ ...d, body: e.target.value }))} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Alignment">
          <Select value={editData.alignment || "left"} onValueChange={(v) => setEditData((d) => ({ ...d, alignment: v as any }))}>
            <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="center">Center</SelectItem></SelectContent>
          </Select>
        </Field>
        <Field label="Width">
          <Select value={editData.width || "normal"} onValueChange={(v) => setEditData((d) => ({ ...d, width: v as any }))}>
            <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="narrow">Narrow (800px)</SelectItem><SelectItem value="normal">Normal</SelectItem></SelectContent>
          </Select>
        </Field>
        <Field label="Background">
          <Select value={editData.background || "white"} onValueChange={(v) => setEditData((d) => ({ ...d, background: v as any }))}>
            <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="white">White</SelectItem><SelectItem value="light-gray">Light Gray</SelectItem></SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Button Text (optional)"><Input className="min-h-[44px]" value={editData.buttonText || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonText: e.target.value }))} /></Field>
        <Field label="Button URL"><Input className="min-h-[44px]" value={editData.buttonUrl || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonUrl: e.target.value }))} /></Field>
      </div>
    </>
  );
}

/* ═══ 3. PHOTO ═══ */
export function PhotoEditPanel({ editData, setEditData, uploading, onImageUpload }: EPUpload & { onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <>
      {editData.imageUrl && <img src={editData.imageUrl} alt="" className="w-full max-h-48 object-cover rounded-lg" />}
      <UploadArea uploading={uploading} label="Photo" hasFile={!!editData.imageUrl} onChange={onImageUpload} />
      <Field label="Caption"><Input className="min-h-[44px]" value={editData.caption || ""} onChange={(e) => setEditData((d) => ({ ...d, caption: e.target.value }))} /></Field>
      <Field label="Size">
        <Select value={editData.size || "large"} onValueChange={(v) => setEditData((d) => ({ ...d, size: v as any }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent>
        </Select>
      </Field>
    </>
  );
}

/* ═══ 4. BULLET LIST ═══ */
export function BulletListEditPanel({ editData, setEditData }: EP) {
  const items = editData.items || [];
  const update = (idx: number, text: string) => setEditData((d) => {
    const newItems = [...(d.items || [])];
    newItems[idx] = { ...newItems[idx], text };
    return { ...d, items: newItems };
  });
  return (
    <>
      <Field label="Layout">
        <Select value={editData.listLayout || "single"} onValueChange={(v) => setEditData((d) => ({ ...d, listLayout: v as any }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="single">Single Column</SelectItem><SelectItem value="two-col">Two Columns</SelectItem></SelectContent>
        </Select>
      </Field>
      <Field label="Headline (optional)"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input className="min-h-[44px] flex-1" value={item.text} onChange={(e) => update(i, e.target.value)} placeholder={`Item ${i + 1}`} />
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-destructive shrink-0" onClick={() => setEditData((d) => ({ ...d, items: (d.items || []).filter((_, j) => j !== i) }))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full min-h-[44px] gap-2" onClick={() => setEditData((d) => ({ ...d, items: [...(d.items || []), { text: "" }] }))}><Plus className="h-4 w-4" /> Add Item</Button>
    </>
  );
}

/* ═══ 5. PRICING TABLE ═══ */
export function PricingEditPanel({ editData, setEditData }: EP) {
  const plans = editData.plans || [];
  const updatePlan = (idx: number, field: keyof PricingPlan, value: any) => setEditData((d) => {
    const p = [...(d.plans || [])];
    p[idx] = { ...p[idx], [field]: value };
    return { ...d, plans: p };
  });
  return (
    <>
      <Field label="Section Headline"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      {plans.map((plan, i) => (
        <Card key={i}><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Plan {i + 1}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setEditData((d) => ({ ...d, plans: (d.plans || []).filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Plan name" className="min-h-[44px]" value={plan.name} onChange={(e) => updatePlan(i, "name", e.target.value)} />
            <Input placeholder="Price" className="min-h-[44px]" value={plan.price} onChange={(e) => updatePlan(i, "price", e.target.value)} />
          </div>
          <Textarea placeholder="Features (one per line)" rows={3} value={(plan.features || []).join("\n")} onChange={(e) => updatePlan(i, "features", e.target.value.split("\n"))} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Button text" className="min-h-[44px]" value={plan.buttonText} onChange={(e) => updatePlan(i, "buttonText", e.target.value)} />
            <Input placeholder="Button URL" className="min-h-[44px]" value={plan.buttonUrl} onChange={(e) => updatePlan(i, "buttonUrl", e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={!!plan.recommended} onCheckedChange={(c) => updatePlan(i, "recommended", !!c)} id={`rec-${i}`} />
            <label htmlFor={`rec-${i}`} className="text-sm">Recommended</label>
          </div>
        </CardContent></Card>
      ))}
      <Button variant="outline" className="w-full min-h-[44px] gap-2" onClick={() => setEditData((d) => ({ ...d, plans: [...(d.plans || []), { name: "", price: "", features: [], buttonText: "Choose", buttonUrl: "#", recommended: false }] }))}><Plus className="h-4 w-4" /> Add Plan</Button>
    </>
  );
}

/* ═══ 6. FAQ ═══ */
export function FaqEditPanel({ editData, setEditData }: EP) {
  const items = editData.faqItems || [];
  const updateItem = (idx: number, field: keyof FaqItem, value: string) => setEditData((d) => {
    const newItems = [...(d.faqItems || [])];
    newItems[idx] = { ...newItems[idx], [field]: value };
    return { ...d, faqItems: newItems };
  });
  return (
    <>
      <Field label="Section Headline"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      {items.map((item, i) => (
        <Card key={i}><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Q&A {i + 1}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setEditData((d) => ({ ...d, faqItems: (d.faqItems || []).filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
          </div>
          <Input placeholder="Question" className="min-h-[44px]" value={item.question} onChange={(e) => updateItem(i, "question", e.target.value)} />
          <Textarea placeholder="Answer" rows={3} value={item.answer} onChange={(e) => updateItem(i, "answer", e.target.value)} />
        </CardContent></Card>
      ))}
      <Button variant="outline" className="w-full min-h-[44px] gap-2" onClick={() => setEditData((d) => ({ ...d, faqItems: [...(d.faqItems || []), { question: "", answer: "" }] }))}><Plus className="h-4 w-4" /> Add Q&A</Button>
    </>
  );
}

/* ═══ 7. TWO COLUMNS ═══ */
export function TwoColumnsEditPanel({ editData, setEditData }: EP) {
  return (
    <>
      <Field label="Headline (optional)"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Left Column"><Textarea rows={6} value={editData.leftContent || ""} onChange={(e) => setEditData((d) => ({ ...d, leftContent: e.target.value }))} /></Field>
        <Field label="Right Column"><Textarea rows={6} value={editData.rightContent || ""} onChange={(e) => setEditData((d) => ({ ...d, rightContent: e.target.value }))} /></Field>
      </div>
    </>
  );
}

/* ═══ 8. KEY NUMBERS ═══ */
export function KeyNumbersEditPanel({ editData, setEditData }: EP) {
  const numbers = editData.numbers || [];
  const update = (idx: number, field: keyof KeyNumber, value: string) => setEditData((d) => {
    const n = [...(d.numbers || [])];
    n[idx] = { ...n[idx], [field]: value };
    return { ...d, numbers: n };
  });
  return (
    <>
      <Field label="Headline (optional)"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      {numbers.map((n, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input className="min-h-[44px] w-28" placeholder="100+" value={n.value} onChange={(e) => update(i, "value", e.target.value)} />
          <Input className="min-h-[44px] flex-1" placeholder="Label" value={n.label} onChange={(e) => update(i, "label", e.target.value)} />
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-destructive shrink-0" onClick={() => setEditData((d) => ({ ...d, numbers: (d.numbers || []).filter((_, j) => j !== i) }))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      {numbers.length < 4 && (
        <Button variant="outline" className="w-full min-h-[44px] gap-2" onClick={() => setEditData((d) => ({ ...d, numbers: [...(d.numbers || []), { value: "", label: "" }] }))}><Plus className="h-4 w-4" /> Add Number</Button>
      )}
    </>
  );
}

/* ═══ 9. NUMBER CARDS ═══ */
export function NumberCardsEditPanel({ editData, setEditData }: EP) {
  const cards = editData.numberCards || [];
  const update = (idx: number, field: keyof NumberCard, value: string) => setEditData((d) => {
    const c = [...(d.numberCards || [])];
    c[idx] = { ...c[idx], [field]: value };
    return { ...d, numberCards: c };
  });
  return (
    <>
      <Field label="Columns">
        <Select value={String(editData.columns || 3)} onValueChange={(v) => setEditData((d) => ({ ...d, columns: Number(v) as 2 | 3 | 4 }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem></SelectContent>
        </Select>
      </Field>
      {cards.map((card, i) => (
        <Card key={i}><CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Card {i + 1}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setEditData((d) => ({ ...d, numberCards: (d.numberCards || []).filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
          </div>
          <Input placeholder="Number (e.g. 1, 01)" className="min-h-[44px]" value={card.number} onChange={(e) => update(i, "number", e.target.value)} />
          <Input placeholder="Title" className="min-h-[44px]" value={card.title} onChange={(e) => update(i, "title", e.target.value)} />
          <Textarea placeholder="Description" rows={2} value={card.description} onChange={(e) => update(i, "description", e.target.value)} />
        </CardContent></Card>
      ))}
      <Button variant="outline" className="w-full min-h-[44px] gap-2" onClick={() => setEditData((d) => ({ ...d, numberCards: [...(d.numberCards || []), { number: String((d.numberCards?.length || 0) + 1), title: "", description: "" }] }))}><Plus className="h-4 w-4" /> Add Card</Button>
    </>
  );
}

/* ═══ 10. TIMELINE ═══ */
export function TimelineEditPanel({ editData, setEditData }: EP) {
  const events = editData.events || [];
  const update = (idx: number, field: keyof TimelineEvent, value: string) => setEditData((d) => {
    const e = [...(d.events || [])];
    e[idx] = { ...e[idx], [field]: value };
    return { ...d, events: e };
  });
  return (
    <>
      <Field label="Headline (optional)"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      {events.map((ev, i) => (
        <Card key={i}><CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Event {i + 1}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setEditData((d) => ({ ...d, events: (d.events || []).filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
          </div>
          <Input placeholder="Year" className="min-h-[44px]" value={ev.year} onChange={(e) => update(i, "year", e.target.value)} />
          <Input placeholder="Title" className="min-h-[44px]" value={ev.title} onChange={(e) => update(i, "title", e.target.value)} />
          <Textarea placeholder="Description" rows={2} value={ev.description} onChange={(e) => update(i, "description", e.target.value)} />
        </CardContent></Card>
      ))}
      <Button variant="outline" className="w-full min-h-[44px] gap-2" onClick={() => setEditData((d) => ({ ...d, events: [...(d.events || []), { year: "", title: "", description: "" }] }))}><Plus className="h-4 w-4" /> Add Event</Button>
    </>
  );
}

/* ═══ 11. YOUTUBE / VIDEO ═══ */
export function YoutubeEditPanel({ editData, setEditData, uploading, onVideoUpload }: EPUpload & { onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <>
      <Field label="Video Title (optional)"><Input className="min-h-[44px]" value={editData.videoTitle || ""} onChange={(e) => setEditData((d) => ({ ...d, videoTitle: e.target.value }))} /></Field>
      <Field label="YouTube or Vimeo URL"><Input className="min-h-[44px]" placeholder="https://youtube.com/watch?v=..." value={editData.videoUrl || ""} onChange={(e) => setEditData((d) => ({ ...d, videoUrl: e.target.value }))} /></Field>
      <p className="text-xs text-muted-foreground text-center">— or upload a video file —</p>
      {editData.videoFileUrl && <p className="text-sm text-muted-foreground truncate">Uploaded: {editData.videoFileUrl.split("/").pop()}</p>}
      <UploadArea uploading={uploading} label="Video" hasFile={!!editData.videoFileUrl} accept="video/mp4,video/webm" onChange={onVideoUpload} />
    </>
  );
}

/* ═══ 12. CONTACT FORM ═══ */
export function ContactFormEditPanel({ editData, setEditData }: EP) {
  return (
    <>
      <Field label="Headline (optional)"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      <Field label="Submit Button Text"><Input className="min-h-[44px]" value={editData.submitText || "Send Message"} onChange={(e) => setEditData((d) => ({ ...d, submitText: e.target.value }))} /></Field>
      <Field label="Success Message"><Input className="min-h-[44px]" value={editData.successMessage || ""} onChange={(e) => setEditData((d) => ({ ...d, successMessage: e.target.value }))} /></Field>
    </>
  );
}

/* ═══ 13. SEPARATOR ═══ */
export function SeparatorEditPanel({ editData, setEditData }: EP) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Width">
        <Select value={editData.separatorWidth || "medium"} onValueChange={(v) => setEditData((d) => ({ ...d, separatorWidth: v as any }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="full">Full Width</SelectItem></SelectContent>
        </Select>
      </Field>
      <Field label="Color">
        <Select value={editData.separatorColor || "gray"} onValueChange={(v) => setEditData((d) => ({ ...d, separatorColor: v as any }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="gray">Gray</SelectItem><SelectItem value="brand">Brand Color</SelectItem></SelectContent>
        </Select>
      </Field>
    </div>
  );
}

/* ═══ 14. CALL TO ACTION ═══ */
export function CtaEditPanel({ editData, setEditData }: EP) {
  return (
    <>
      <Field label="Headline"><Input className="min-h-[44px]" value={editData.headline || ""} onChange={(e) => setEditData((d) => ({ ...d, headline: e.target.value }))} /></Field>
      <Field label="Subheadline"><Input className="min-h-[44px]" value={editData.subheadline || ""} onChange={(e) => setEditData((d) => ({ ...d, subheadline: e.target.value }))} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Button Text"><Input className="min-h-[44px]" value={editData.buttonText || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonText: e.target.value }))} /></Field>
        <Field label="Button URL"><Input className="min-h-[44px]" value={editData.buttonUrl || ""} onChange={(e) => setEditData((d) => ({ ...d, buttonUrl: e.target.value }))} /></Field>
      </div>
      <Field label="Background">
        <Select value={editData.background || "brand"} onValueChange={(v) => setEditData((d) => ({ ...d, background: v as any }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="white">White</SelectItem><SelectItem value="light-gray">Gray</SelectItem><SelectItem value="brand">Brand Color</SelectItem></SelectContent>
        </Select>
      </Field>
    </>
  );
}

/* ═══ IMAGE GALLERY (kept from before) ═══ */
export function ImageGalleryEditPanel({ editData, setEditData, uploading, onUpload, onRemove }: EPUpload & {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <>
      <Field label="Layout">
        <Select value={editData.layout || "3-col"} onValueChange={(v) => setEditData((d) => ({ ...d, layout: v as any }))}>
          <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="2-col">2 Columns</SelectItem><SelectItem value="3-col">3 Columns</SelectItem></SelectContent>
        </Select>
      </Field>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {editData.images?.map((img, i) => (
          <div key={i} className="relative group">
            <img src={img.url} alt={img.alt} className="w-full aspect-square object-cover rounded-lg" />
            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(i)}><Trash2 className="h-3 w-3" /></Button>
            <Input placeholder="Caption" className="mt-1 text-xs min-h-[36px]" value={img.caption} onChange={(e) => {
              const newImages = [...(editData.images || [])];
              newImages[i] = { ...newImages[i], caption: e.target.value };
              setEditData((d) => ({ ...d, images: newImages }));
            }} />
          </div>
        ))}
      </div>
      <UploadArea uploading={uploading} label="Images" onChange={onUpload} multiple />
    </>
  );
}

/* ═══ Helper ═══ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
