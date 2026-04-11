import { useState } from "react";
import type { SectionData } from "@/types/sections";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
      {/* gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)" }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff", padding: m ? "2rem 1.5rem" : "3rem 2rem", maxWidth: "900px", width: "100%" }}>
        <h1 style={{
          fontFamily: style.headingFont,
          fontSize: m ? "2.2rem" : "4.5rem",
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.1,
          marginBottom: "1rem",
          textShadow: "0 2px 24px rgba(0,0,0,0.5)",
          letterSpacing: "-0.02em",
        }}>{data.headline}</h1>
        {data.subheadline && <p style={{ fontSize: m ? "1.1rem" : "1.5rem", color: "rgba(255,255,255,0.92)", marginBottom: "0.75rem", fontWeight: 300, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>{data.subheadline}</p>}
        {data.body && <p style={{ fontSize: m ? "0.95rem" : "1.1rem", color: "rgba(255,255,255,0.82)", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>{data.body}</p>}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {data.buttonText && (
            <a href={data.buttonUrl || "#"} style={{ backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", padding: m ? "14px 28px" : "16px 40px", borderRadius: "8px", fontWeight: 700, fontSize: m ? "1rem" : "1.1rem", textDecoration: "none", display: "inline-block", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
              {data.buttonText}
            </a>
          )}
          {data.buttonText2 && (
            <a href={data.buttonUrl2 || "#"} style={{ border: "2px solid rgba(255,255,255,0.8)", color: "#fff", padding: m ? "14px 28px" : "16px 40px", borderRadius: "8px", fontWeight: 600, fontSize: m ? "1rem" : "1.1rem", textDecoration: "none", display: "inline-block" }}>
              {data.buttonText2}
            </a>
          )}
        </div>
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

/* ═══ 5. PRICING — room cards ═══ */
export function PricingSection({ data, style, device }: Props) {
  const m = isMob(device);
  const plans = data.plans || [];
  if (!plans.length) return null;
  const single = plans.length === 1;
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, marginBottom: "2.5rem", textAlign: "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : single ? "minmax(auto, 480px)" : plans.length === 2 ? "1fr 1fr" : "repeat(3, 1fr)", gap: "1.5rem", justifyContent: single ? "center" : undefined, margin: single ? "0 auto" : undefined, maxWidth: single ? "480px" : undefined }}>
          {plans.map((plan, i) => (
            <div key={i} style={{ borderRadius: "16px", overflow: "hidden", boxShadow: plan.recommended ? "0 8px 40px rgba(0,0,0,0.15)" : "0 2px 16px rgba(0,0,0,0.08)", border: plan.recommended ? `2px solid var(--site-primary, #1E40AF)` : "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", backgroundColor: "#fff" }}>
              {plan.imageUrl ? (
                <img src={plan.imageUrl} alt={plan.name} style={{ width: "100%", height: "220px", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "180px", backgroundColor: "var(--site-primary, #1E40AF)", opacity: 0.12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>🏨</div>
              )}
              <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: style.headingFont, fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.4rem" }}>{plan.name}</h3>
                {plan.description && <p style={{ fontSize: "0.9rem", opacity: 0.65, marginBottom: "1rem", lineHeight: 1.6 }}>{plan.description}</p>}
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--site-primary, #1E40AF)", marginBottom: "1rem" }}>
                  {plan.price}<span style={{ fontSize: "0.85rem", fontWeight: 400, opacity: 0.55 }}>/night</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem", flex: 1 }}>
                  {(plan.features || []).filter(Boolean).map((f: string, j: number) => (
                    <li key={j} style={{ display: "flex", gap: "8px", fontSize: "0.88rem", marginBottom: "6px", opacity: 0.75 }}>
                      <span style={{ color: "var(--site-primary, #1E40AF)", fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                {plan.buttonText && <a href={plan.buttonUrl || "#"} style={{ display: "block", textAlign: "center", backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", padding: "13px", borderRadius: "8px", fontWeight: 700, textDecoration: "none" }}>{plan.buttonText}</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 6. FAQ ═══ */
export function FaqSection({ data, style, device }: Props) {
  const m = isMob(device);
  const items = data.faqItems || [];
  if (!items.length) return null;
  return (
    <section style={{ padding: m ? "3.5rem 1.5rem" : "6rem 2rem", backgroundColor: "rgba(0,0,0,0.025)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <Accordion type="single" collapsible>
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <AccordionTrigger style={{ fontSize: m ? "1rem" : "1.05rem", fontWeight: 600, padding: "1.25rem 0", textAlign: "left" }}>{item.question}</AccordionTrigger>
              <AccordionContent style={{ fontSize: "0.95rem", lineHeight: 1.75, opacity: 0.75, paddingBottom: "1.25rem" }}>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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

/* ═══ 8. GALLERY ═══ */
export function ImageGallerySection({ data, device }: PropsNoStyle) {
  const m = isMob(device);
  const images = data.images || [];
  if (!images.length) return null;
  const [main, ...rest] = images;
  return (
    <section style={{ padding: m ? "0" : "0", overflow: "hidden" }}>
      {data.headline && (
        <div style={{ padding: m ? "3rem 1.5rem 1.5rem" : "4rem 2rem 2rem", textAlign: "center" }}>
          <h2 style={{ fontSize: m ? "1.8rem" : "2.5rem", fontWeight: 700 }}>{data.headline}</h2>
        </div>
      )}
      {!m ? (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "300px 300px", gap: "6px" }}>
          {/* Main big image */}
          <div style={{ gridRow: "1 / 3", overflow: "hidden" }}>
            <img src={(main as any)?.url || main} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
          </div>
          {/* Smaller images */}
          {rest.slice(0, 4).map((img: any, i: number) => (
            <div key={i} style={{ overflow: "hidden" }}>
              <img src={img?.url || img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
          {images.slice(0, 6).map((img: any, i: number) => (
            <div key={i} style={{ aspectRatio: i === 0 ? "2/1" : "1", overflow: "hidden", gridColumn: i === 0 ? "1 / 3" : undefined }}>
              <img src={img?.url || img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}
    </section>
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
