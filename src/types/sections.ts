import type { Json } from "@/integrations/supabase/types";

export interface BulletItem { text: string; icon?: string }
export interface PricingPlan { name: string; price: string; features: string[]; buttonText: string; buttonUrl: string; recommended?: boolean }
export interface FaqItem { question: string; answer: string }
export interface KeyNumber { value: string; label: string }
export interface NumberCard { number: string; title: string; description: string }
export interface TimelineEvent { year: string; title: string; description: string }
export interface GalleryImage { url: string; alt: string; caption: string }
export interface CardItem { image: string; title: string; subtitle: string; description: string }

export interface SectionData {
  // Common
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
  background?: "white" | "light-gray" | "brand";

  // Photo
  imageUrl?: string;
  imageAlt?: string;
  caption?: string;
  size?: "small" | "medium" | "large";

  // Image gallery
  images?: GalleryImage[];
  layout?: "single" | "2-col" | "3-col";

  // Split / grid
  imagePosition?: "left" | "right";
  cards?: CardItem[];
  columns?: 2 | 3 | 4;

  // Bullet list
  items?: BulletItem[];
  listLayout?: "single" | "two-col";

  // Pricing
  plans?: PricingPlan[];

  // FAQ
  faqItems?: FaqItem[];

  // Two columns
  leftContent?: string;
  rightContent?: string;

  // Key numbers
  numbers?: KeyNumber[];

  // Number cards
  numberCards?: NumberCard[];

  // Timeline
  events?: TimelineEvent[];

  // YouTube / Video
  videoUrl?: string;
  videoFileUrl?: string;
  videoTitle?: string;

  // Contact form
  submitText?: string;
  successMessage?: string;

  // Separator
  separatorWidth?: "small" | "medium" | "full";
  separatorColor?: "gray" | "brand";
}

export interface Section {
  id: string;
  site_id: string;
  section_type: string;
  data: SectionData;
  order_index: number;
  created_at: string;
}

export function parseSectionData(data: Json): SectionData {
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return data as unknown as SectionData;
  }
  return {};
}

export const SECTION_TYPES = [
  { type: "cover", label: "🖼️ Cover / Banner", desc: "Big background image with headline & CTA" },
  { type: "text_block", label: "✍️ Text Section", desc: "Headline + body text" },
  { type: "photo", label: "📷 Photo", desc: "Single image with optional caption" },
  { type: "bullet_list", label: "📋 Bullet List", desc: "List of items with optional icons" },
  { type: "pricing", label: "💰 Pricing Table", desc: "Plans with features & prices" },
  { type: "faq", label: "❓ Q&A / FAQ", desc: "Accordion-style questions & answers" },
  { type: "two_columns", label: "📰 Two Columns", desc: "Side-by-side content" },
  { type: "key_numbers", label: "📊 Key Numbers", desc: "Big stats with labels" },
  { type: "number_cards", label: "🔢 Number Cards", desc: "Numbered step cards" },
  { type: "timeline", label: "📅 Timeline", desc: "Chronological events" },
  { type: "youtube", label: "▶️ Video", desc: "YouTube URL or uploaded video" },
  { type: "contact_form", label: "📬 Contact Form", desc: "Name, email, message form" },
  { type: "separator", label: "➖ Separator", desc: "Horizontal divider line" },
  { type: "cta", label: "🎯 Call to Action", desc: "Headline + button with bg color" },
] as const;

export const SECTION_DEFAULTS: Record<string, SectionData> = {
  cover: { headline: "Welcome", subheadline: "Your amazing site", buttonText: "Learn More", buttonUrl: "#" },
  text_block: { headline: "", body: "", alignment: "left", width: "normal", background: "white" },
  photo: { imageUrl: "", caption: "", size: "large" },
  bullet_list: { items: [{ text: "Item 1" }, { text: "Item 2" }, { text: "Item 3" }], listLayout: "single" },
  pricing: { plans: [{ name: "Basic", price: "$9/mo", features: ["Feature 1", "Feature 2"], buttonText: "Choose", buttonUrl: "#", recommended: false }] },
  faq: { faqItems: [{ question: "Question?", answer: "Answer." }] },
  two_columns: { leftContent: "Left column content", rightContent: "Right column content" },
  key_numbers: { numbers: [{ value: "100+", label: "Clients" }, { value: "50+", label: "Projects" }] },
  number_cards: { numberCards: [{ number: "1", title: "Step One", description: "Description" }], columns: 3 },
  timeline: { events: [{ year: "2024", title: "Event", description: "Description" }] },
  youtube: { videoUrl: "", videoTitle: "" },
  contact_form: { submitText: "Send Message", successMessage: "Thanks! We'll be in touch." },
  separator: { separatorWidth: "medium", separatorColor: "gray" },
  cta: { headline: "Ready to get started?", subheadline: "", buttonText: "Get Started", buttonUrl: "#", background: "brand" },
};

export function sectionLabel(type: string): string {
  const found = SECTION_TYPES.find((s) => s.type === type);
  if (found) return found.label;
  // Legacy compat
  if (type === "hero") return "🖼️ Cover / Banner";
  if (type === "image_gallery") return "📷 Image Gallery";
  if (type === "split_layout") return "📰 Two Columns";
  if (type === "grid_cards") return "🔢 Number Cards";
  return type;
}
