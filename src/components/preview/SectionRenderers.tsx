import { useState, useEffect, useCallback } from "react";
import type { SectionData } from "@/types/sections";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { X, ChevronLeft, ChevronRight, Expand, Users, BedDouble, Star } from "lucide-react";

type Style = { bg: string; text: string; accent: string; headingFont: string; bodyFont: string };
type DeviceMode = "desktop" | "tablet" | "mobile";
type Props = { data: SectionData; style: Style; device?: DeviceMode };
type PropsNoStyle = { data: SectionData; device?: DeviceMode };
const isMob = (d?: DeviceMode) => d === "mobile";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}`;
  return null;
}

/* ═══ 1. COVER — full screen hero ═══ */
export function CoverSection({ data, style, device }: Props) {
  const hasBg = !!data.backgroundImage;
  const m = isMob(device);
  const headline = data.headline || data.businessName || "";
  return (
    <section style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: m ? "80vh" : "95vh",
      backgroundImage: hasBg ? `url(${data.backgroundImage})` : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: hasBg ? undefined : "var(--site-primary, #1E40AF)",
      overflow: "hidden",
    }}>
      {/* layered gradient overlay for depth */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.65) 100%)" }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff", padding: m ? "2rem 1.5rem" : "3rem 2rem", maxWidth: "900px", width: "100%" }}>
        {data.label && (
          <div style={{ display: "inline-block", marginBottom: "1rem", padding: "6px 16px", borderRadius: "999px", backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
            {data.label}
          </div>
        )}
        <h1 style={{
          fontFamily: style.headingFont,
          fontSize: m ? "2.4rem" : "4.8rem",
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.05,
          marginBottom: "1.25rem",
          textShadow: "0 2px 32px rgba(0,0,0,0.45)",
          letterSpacing: "-0.03em",
        }}>{headline}</h1>
        {data.subheadline && <p style={{ fontSize: m ? "1.05rem" : "1.4rem", color: "rgba(255,255,255,0.9)", marginBottom: "0.75rem", fontWeight: 300, textShadow: "0 1px 8px rgba(0,0,0,0.35)", lineHeight: 1.5 }}>{data.subheadline}</p>}
        {data.body && <p style={{ fontSize: m ? "0.95rem" : "1.05rem", color: "rgba(255,255,255,0.78)", maxWidth: "600px", margin: "0 auto 2.5rem", lineHeight: 1.75 }}>{data.body}</p>}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {data.buttonText && (
            <a href={data.buttonUrl || "#"} style={{ backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", padding: m ? "14px 28px" : "16px 44px", borderRadius: "999px", fontWeight: 700, fontSize: m ? "1rem" : "1.05rem", textDecoration: "none", display: "inline-block", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", letterSpacing: "0.01em" }}>
              {data.buttonText}
            </a>
          )}
          {data.buttonText2 && (
            <a href={data.buttonUrl2 || "#"} style={{ border: "2px solid rgba(255,255,255,0.75)", color: "#fff", padding: m ? "14px 28px" : "16px 44px", borderRadius: "999px", fontWeight: 600, fontSize: m ? "1rem" : "1.05rem", textDecoration: "none", display: "inline-block", backdropFilter: "blur(8px)", backgroundColor: "rgba(255,255,255,0.08)" }}>
              {data.buttonText2}
            </a>
          )}
        </div>
      </div>
      {/* scroll hint */}
      <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0.5 }}>
        <div style={{ width: "1.5px", height: "40px", background: "linear-gradient(to bottom, transparent, white)" }} />
      </div>
    </section>
  );
}

/* ═══ 2. TEXT SECTION ═══ */
export function TextSection({ data, style, device }: Props) {
  const m = isMob(device);
  const hasImage = !!data.imageUrl;
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {hasImage && !m ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: "2.5rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--site-heading, inherit)", lineHeight: 1.2 }}>{data.headline}</h2>}
              {data.body && <p style={{ fontSize: "1.1rem", lineHeight: 1.85, opacity: 0.75 }}>{data.body}</p>}
              {data.buttonText && <a href={data.buttonUrl || "#"} style={{ display: "inline-block", marginTop: "2rem", backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", padding: "13px 28px", borderRadius: "8px", fontWeight: 600, textDecoration: "none" }}>{data.buttonText}</a>}
            </div>
            <div>
              <img src={data.imageUrl} alt={data.headline || ""} style={{ width: "100%", borderRadius: "16px", objectFit: "cover", aspectRatio: "4/3", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }} />
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: m ? "left" : "center" }}>
            {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.8rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--site-heading, inherit)", lineHeight: 1.2 }}>{data.headline}</h2>}
            {data.body && <p style={{ fontSize: m ? "1rem" : "1.15rem", lineHeight: 1.85, opacity: 0.78, whiteSpace: "pre-wrap" }}>{data.body}</p>}
            {data.buttonText && <a href={data.buttonUrl || "#"} style={{ display: "inline-block", marginTop: "2rem", backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", padding: "12px 28px", borderRadius: "8px", fontWeight: 600, textDecoration: "none" }}>{data.buttonText}</a>}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══ 3. PHOTO ═══ */
export function PhotoSection({ data, device }: PropsNoStyle) {
  const m = isMob(device);
  if (!data.imageUrl) return null;
  return (
    <section style={{ padding: m ? "2rem 1.5rem" : "4rem 2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <img src={data.imageUrl} alt={data.caption || ""} loading="lazy" style={{ width: "100%", borderRadius: "16px", objectFit: "cover", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
        {data.caption && <p style={{ fontSize: "0.9rem", opacity: 0.55, marginTop: "0.75rem", textAlign: "center" }}>{data.caption}</p>}
      </div>
    </section>
  );
}

/* ═══ 4. BULLET LIST — amenities grid ═══ */
export function BulletListSection({ data, style, device }: Props) {
  const m = isMob(device);
  const items = data.items || [];
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem", backgroundColor: "rgba(0,0,0,0.025)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, marginBottom: "2.5rem", textAlign: "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: "12px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ color: "var(--site-primary, #1E40AF)", fontSize: "1rem", fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: m ? "0.85rem" : "0.95rem", fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 5. PRICING — premium room cards ═══ */
export function PricingSection({ data, style, device }: Props) {
  const m = isMob(device);
  // Support both `roomTypes` (schema field) and legacy `plans`
  const plans = data.roomTypes || data.plans || [];
  if (!plans.length) return null;
  const single = plans.length === 1;
  const cols = m ? 1 : single ? 1 : plans.length === 2 ? 2 : 3;

  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem", backgroundColor: "#f8f8f6" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {data.headline && (
          <div style={{ marginBottom: m ? "2rem" : "3rem" }}>
            <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.6rem", fontWeight: 700, color: "var(--site-heading, #111)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{data.headline}</h2>
            {data.subheadline && <p style={{ marginTop: "0.75rem", fontSize: "1rem", color: "#666", maxWidth: "520px" }}>{data.subheadline}</p>}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : single ? "minmax(auto,520px)" : `repeat(${cols}, 1fr)`, gap: m ? "1.25rem" : "1.5rem", justifyContent: single ? "start" : undefined }}>
          {plans.map((plan: any, i: number) => (
            <div key={i} style={{ borderRadius: "20px", overflow: "hidden", backgroundColor: "#fff", boxShadow: plan.recommended ? "0 12px 48px rgba(0,0,0,0.14)" : "0 2px 16px rgba(0,0,0,0.07)", border: plan.recommended ? `2px solid var(--site-primary, #1E40AF)` : "1px solid rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", transition: "box-shadow 0.25s, transform 0.25s", position: "relative" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 56px rgba(0,0,0,0.14)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = plan.recommended ? "0 12px 48px rgba(0,0,0,0.14)" : "0 2px 16px rgba(0,0,0,0.07)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              {/* Image */}
              <div style={{ position: "relative", height: m ? "200px" : "240px", overflow: "hidden", flexShrink: 0 }}>
                {plan.imageUrl ? (
                  <img src={plan.imageUrl} alt={plan.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--site-primary, #1E40AF) 0%, rgba(0,0,0,0.4) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem" }}>🏨</div>
                )}
                {plan.recommended && (
                  <div style={{ position: "absolute", top: "14px", left: "14px", padding: "5px 14px", borderRadius: "999px", backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Most Popular
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: m ? "1.25rem" : "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* Name + quick specs */}
                <div>
                  <h3 style={{ fontFamily: style.headingFont, fontSize: "1.2rem", fontWeight: 700, color: "#111", marginBottom: "0.35rem", lineHeight: 1.2 }}>{plan.name}</h3>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {plan.maxGuests && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "#888" }}>
                        <Users style={{ width: "13px", height: "13px" }} />{plan.maxGuests} guests
                      </span>
                    )}
                    {plan.bedType && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "#888" }}>
                        <BedDouble style={{ width: "13px", height: "13px" }} />{plan.bedType}
                      </span>
                    )}
                  </div>
                </div>

                {plan.description && (
                  <p style={{ fontSize: "0.875rem", color: "#666", lineHeight: 1.65, margin: 0 }}>{plan.description}</p>
                )}

                {/* Feature chips */}
                {(plan.features || []).filter(Boolean).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {(plan.features as string[]).slice(0, 4).map((f: string, j: number) => (
                      <span key={j} style={{ padding: "4px 10px", borderRadius: "999px", backgroundColor: "#f3f4f6", color: "#555", fontSize: "0.75rem", fontWeight: 500 }}>{f}</span>
                    ))}
                    {(plan.features as string[]).length > 4 && (
                      <span style={{ padding: "4px 10px", borderRadius: "999px", backgroundColor: "#f3f4f6", color: "#888", fontSize: "0.75rem" }}>+{(plan.features as string[]).length - 4}</span>
                    )}
                  </div>
                )}

                {/* Price + CTA */}
                <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: m ? "1.5rem" : "1.75rem", fontWeight: 800, color: "var(--site-primary, #1E40AF)", letterSpacing: "-0.02em" }}>{plan.price}</span>
                    <span style={{ fontSize: "0.8rem", color: "#aaa", marginLeft: "4px" }}>/night</span>
                  </div>
                  {plan.buttonText && (
                    <a href={plan.buttonUrl || "#"} style={{ flexShrink: 0, display: "inline-block", padding: "10px 20px", borderRadius: "999px", backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
                      {plan.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 6. FAQ — accordion with premium styling ═══ */
export function FaqSection({ data, style, device }: Props) {
  const m = isMob(device);
  const items = data.faqItems || [];
  if (!items.length) return null;
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem", backgroundColor: "#f8f8f6" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {data.headline && (
          <div style={{ marginBottom: m ? "2rem" : "2.75rem", textAlign: "center" }}>
            <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, color: "var(--site-heading, #111)", letterSpacing: "-0.02em" }}>{data.headline}</h2>
            {data.subheadline && <p style={{ marginTop: "0.75rem", fontSize: "1rem", color: "#777" }}>{data.subheadline}</p>}
          </div>
        )}
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <Accordion type="single" collapsible>
            {items.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} style={{ borderBottom: i < items.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none" }}>
                <AccordionTrigger style={{ fontSize: m ? "0.95rem" : "1rem", fontWeight: 600, padding: m ? "1.1rem 1.25rem" : "1.25rem 1.5rem", textAlign: "left", color: "var(--site-heading, #111)" }}>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#555", padding: m ? "0 1.25rem 1.25rem" : "0 1.5rem 1.5rem" }}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

/* ═══ 7. REVIEWS (stored as grid_cards) ═══ */
export function GridCardsSection({ data, style, device }: Props) {
  const m = isMob(device);
  const reviews = data.reviews || [];
  if (!reviews.length) return null;
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, marginBottom: "2.5rem", textAlign: "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : reviews.length === 1 ? "minmax(auto,480px)" : reviews.length === 2 ? "1fr 1fr" : "repeat(3,1fr)", gap: "1.5rem", justifyContent: reviews.length === 1 ? "center" : undefined }}>
          {reviews.filter((rv: any) => rv.reviewText).map((rv: any, i: number) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "1.75rem", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ color: "#f59e0b", fontSize: "1.1rem", letterSpacing: "3px" }}>{"★".repeat(parseInt(rv.rating) || 5)}</div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.75, opacity: 0.75, fontStyle: "italic", flex: 1 }}>"{rv.reviewText}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {rv.photoUrl ? (
                  <img src={rv.photoUrl} alt={rv.guestName} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "var(--site-primary, #1E40AF)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0 }}>
                    {(rv.guestName || "G").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{rv.guestName}</p>
                  {rv.dateOfStay && <p style={{ fontSize: "0.8rem", opacity: 0.45 }}>{rv.dateOfStay}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 8. GALLERY — masonry + lightbox ═══ */
export function ImageGallerySection({ data, device }: PropsNoStyle) {
  const m = isMob(device);
  // Support both `galleryImages` (schema field) and legacy `images`
  const raw = data.galleryImages || data.images || [];
  const images: Array<{ url: string; caption?: string; alt?: string }> = raw.map((img: any) =>
    typeof img === "string" ? { url: img } : img
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const previousImage = useCallback(() => setLightboxIndex(i => i !== null ? (i - 1 + images.length) % images.length : null), [images.length]);
  const nextImage = useCallback(() => setLightboxIndex(i => i !== null ? (i + 1) % images.length : null), [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") previousImage();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, previousImage, nextImage]);

  if (!images.length) return null;

  return (
    <>
      <section style={{ padding: data.headline ? undefined : "0", overflow: "hidden" }}>
        {data.headline && (
          <div style={{ padding: m ? "3rem 1.5rem 1.5rem" : "5rem 2rem 2.5rem", textAlign: "center" }}>
            <h2 style={{ fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{data.headline}</h2>
          </div>
        )}

        {/* CSS Masonry via columns */}
        <div style={{
          padding: m ? "1rem 1rem 2rem" : "1.5rem 2rem 4rem",
          columnCount: m ? 2 : 3,
          columnGap: m ? "8px" : "12px",
        }}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => openLightbox(i)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                breakInside: "avoid",
                marginBottom: m ? "8px" : "12px",
                borderRadius: m ? "10px" : "14px",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                display: "block",
              }}
            >
              <img
                src={img.url}
                alt={img.alt || img.caption || `Gallery ${i + 1}`}
                loading="lazy"
                style={{ width: "100%", display: "block", objectFit: "cover", transition: "transform 0.4s", transform: hoveredIndex === i ? "scale(1.04)" : "scale(1)" }}
              />
              {/* hover overlay controlled by parent hover state */}
              <div style={{
                position: "absolute", inset: 0,
                background: hoveredIndex === i ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0)",
                transition: "background 0.3s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Expand style={{ color: "white", width: "22px", height: "22px", opacity: hoveredIndex === i ? 1 : 0, transition: "opacity 0.3s" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.96)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", backdropFilter: "blur(8px)" }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); previousImage(); }}
              style={{ position: "absolute", left: "16px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", backdropFilter: "blur(8px)" }}
            >
              <ChevronLeft style={{ width: "24px", height: "24px" }} />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); nextImage(); }}
              style={{ position: "absolute", right: "16px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", backdropFilter: "blur(8px)" }}
            >
              <ChevronRight style={{ width: "24px", height: "24px" }} />
            </button>
          )}

          {/* Image */}
          <div
            style={{ maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].alt || ""}
              style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "10px" }}
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              {images[lightboxIndex].caption && (
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", textAlign: "center" }}>{images[lightboxIndex].caption}</p>
              )}
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>{lightboxIndex + 1} / {images.length}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══ 9. CONTACT ═══ */
export function ContactFormSection({ data, style, device }: Props) {
  const m = isMob(device);
  const [submitted, setSubmitted] = useState(false);
  const whatsapp = (data.whatsapp || "").replace(/[^0-9]/g, "");
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem", backgroundColor: "var(--site-primary, #1E40AF)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center", color: "#fff" }}>{data.headline}</h2>}
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.8)", marginBottom: "3rem", fontSize: "1.05rem" }}>We'd love to hear from you</p>
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: "3rem", alignItems: "start" }}>
          {/* Contact details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {data.email && (
              <a href={`mailto:${data.email}`} style={{ display: "flex", alignItems: "center", gap: "14px", color: "#fff", textDecoration: "none", fontSize: "1rem" }}>
                <span style={{ fontSize: "1.4rem", width: "32px", textAlign: "center" }}>✉️</span>{data.email}
              </a>
            )}
            {data.phone && (
              <a href={`tel:${data.phone}`} style={{ display: "flex", alignItems: "center", gap: "14px", color: "#fff", textDecoration: "none", fontSize: "1rem" }}>
                <span style={{ fontSize: "1.4rem", width: "32px", textAlign: "center" }}>📞</span>{data.phone}
              </a>
            )}
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "10px", backgroundColor: "#25D366", color: "#fff", padding: "13px 24px", borderRadius: "10px", fontWeight: 700, textDecoration: "none", width: "fit-content", fontSize: "1rem", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
                <span style={{ fontSize: "1.2rem" }}>💬</span> WhatsApp Us
              </a>
            )}
            {data.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", color: "rgba(255,255,255,0.85)", fontSize: "1rem" }}>
                <span style={{ fontSize: "1.4rem", width: "32px", textAlign: "center", flexShrink: 0 }}>📍</span>
                <span style={{ lineHeight: 1.6 }}>{data.address}</span>
              </div>
            )}
            {data.googleMapsLink && !data.googleMapsLink.includes("<iframe") && (
              <a href={data.googleMapsLink} target="_blank" rel="noreferrer"
                style={{ color: "rgba(255,255,255,0.75)", textDecoration: "underline", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                View on Google Maps →
              </a>
            )}
          </div>
          {/* Form */}
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "#111" }}>Message sent!</p>
                <p style={{ color: "#666", marginTop: "0.5rem", fontSize: "0.95rem" }}>We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input required placeholder="Your name" style={{ padding: "13px 14px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "0.95rem", color: "#111", outline: "none" }} />
                <input required type="email" placeholder="Email address" style={{ padding: "13px 14px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "0.95rem", color: "#111", outline: "none" }} />
                <input placeholder="Phone / WhatsApp" style={{ padding: "13px 14px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "0.95rem", color: "#111", outline: "none" }} />
                <textarea required placeholder="Your message..." rows={4} style={{ padding: "13px 14px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "0.95rem", resize: "none", color: "#111", outline: "none" }} />
                <button type="submit" style={{ backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", padding: "14px", borderRadius: "8px", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "1rem" }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ 10. YOUTUBE ═══ */
export function YoutubeSection({ data, style, device }: Props) {
  const m = isMob(device);
  const embedUrl = data.videoUrl ? getEmbedUrl(data.videoUrl) : null;
  if (!embedUrl && !data.videoFileUrl) return null;
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem", backgroundColor: "rgba(0,0,0,0.025)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {data.videoTitle && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center", color: "var(--site-heading, inherit)" }}>{data.videoTitle}</h2>}
        <AspectRatio ratio={16 / 9} style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
          {embedUrl
            ? <iframe src={embedUrl} title={data.videoTitle || "Video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
            : <video src={data.videoFileUrl} controls className="w-full h-full object-contain" />}
        </AspectRatio>
      </div>
    </section>
  );
}

/* ═══ REMAINING SECTIONS ═══ */
export function TwoColumnsSection({ data, style, device }: Props) {
  const m = isMob(device);
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, marginBottom: "2rem", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: "3rem" }}>
          <div style={{ fontSize: "1rem", lineHeight: 1.8, opacity: 0.8, whiteSpace: "pre-wrap" }}>{data.leftContent}</div>
          <div style={{ fontSize: "1rem", lineHeight: 1.8, opacity: 0.8, whiteSpace: "pre-wrap" }}>{data.rightContent}</div>
        </div>
      </div>
    </section>
  );
}

export function KeyNumbersSection({ data, style, device }: Props) {
  const m = isMob(device);
  const numbers = data.numbers || [];
  if (!numbers.length) return null;
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem", backgroundColor: "rgba(0,0,0,0.025)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, marginBottom: "2.5rem", textAlign: "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : `repeat(${Math.min(numbers.length, 4)}, 1fr)`, gap: "2rem", textAlign: "center" }}>
          {numbers.map((n, i) => (
            <div key={i}>
              <div style={{ fontSize: m ? "2.5rem" : "3.5rem", fontWeight: 800, color: "var(--site-primary, #1E40AF)" }}>{n.value}</div>
              <div style={{ fontSize: "0.95rem", opacity: 0.6, marginTop: "0.25rem" }}>{n.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NumberCardsSection({ data, style, device }: Props) {
  const m = isMob(device);
  const cards = data.numberCards || [];
  if (!cards.length) return null;
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: m ? "1fr" : "repeat(3, 1fr)", gap: "1.5rem" }}>
        {cards.map((card, i) => (
          <div key={i} style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, opacity: 0.18 }}>{card.number}</div>
            <h3 style={{ fontFamily: style.headingFont, fontSize: "1.15rem", fontWeight: 700, margin: "0.5rem 0 0.25rem" }}>{card.title}</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.65 }}>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TimelineSection({ data, style, device }: Props) {
  const m = isMob(device);
  const events = data.events || [];
  if (!events.length) return null;
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, marginBottom: "2.5rem", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ borderLeft: "3px solid var(--site-primary, #1E40AF)", paddingLeft: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {events.map((ev, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "-2.65rem", top: "4px", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "var(--site-primary, #1E40AF)", border: "3px solid #fff", boxShadow: "0 0 0 2px var(--site-primary, #1E40AF)" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, opacity: 0.45 }}>{ev.year}</span>
              <h3 style={{ fontFamily: style.headingFont, fontSize: "1.1rem", fontWeight: 700 }}>{ev.title}</h3>
              <p style={{ fontSize: "0.9rem", opacity: 0.65, marginTop: "0.25rem" }}>{ev.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeparatorSection({ }: PropsNoStyle) {
  return <div style={{ padding: "1rem 2rem" }}><hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", maxWidth: "600px", margin: "0 auto" }} /></div>;
}

export function CtaSection({ data, style, device }: Props) {
  const m = isMob(device);
  const isBrand = data.background === "brand";
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem", backgroundColor: isBrand ? "var(--site-primary, #1E40AF)" : "transparent" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.8rem", fontWeight: 700, marginBottom: "1rem", color: isBrand ? "#fff" : "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        {data.subheadline && <p style={{ fontSize: "1.1rem", opacity: 0.8, marginBottom: "2rem", color: isBrand ? "#fff" : undefined }}>{data.subheadline}</p>}
        {data.buttonText && <a href={data.buttonUrl || "#"} style={{ display: "inline-block", padding: "16px 40px", borderRadius: "8px", fontWeight: 700, textDecoration: "none", backgroundColor: isBrand ? "#fff" : "var(--site-primary, #1E40AF)", color: isBrand ? "var(--site-primary, #1E40AF)" : "#fff" }}>{data.buttonText}</a>}
      </div>
    </section>
  );
}
