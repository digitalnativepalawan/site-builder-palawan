// Shared types for all sections
export interface SectionProps {
  data: Record<string, any>;
  device?: "desktop" | "tablet" | "mobile";
  settings?: SiteSettings;
}

export interface SiteSettings {
  colors: {
    primary: string;
    background: string;
    text: string;
    heading: string;
    accent: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  site_identity: {
    siteTitle: string;
    logoUrl: string;
    footerText: string;
  };
  social_links: Array<{
    platform: string;
    url: string;
    visible: boolean;
  }>;
}

export interface RoomData {
  name: string;
  price: string;
  description: string;
  imageUrl?: string;
  features: string[];
  maxGuests?: number;
  bedType?: string;
  recommended?: boolean;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
}

export interface TestimonialItem {
  guestName: string;
  reviewText: string;
  rating: number;
  dateOfStay?: string;
  photoUrl?: string;
}

export interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
