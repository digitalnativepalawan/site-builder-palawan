import { useState } from "react";
import type { SectionData } from "@/types/sections";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type Style = { bg: string; text: string; accent: string; headingFont: string; bodyFont: string };
type DeviceMode = "desktop" | "tablet" | "mobile";
type Props = { data: SectionData; style: Style; device?: DeviceMode };
type PropsNoStyle = { data: SectionData; device?: DeviceMode };
const mob = (d?: DeviceMode) => d === "mobile";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}`;
  return null;
}

/* ═══ 1. COVER — full-screen hero with photo ═══ */
export function CoverSection({ data, style, device }: Props) {
  const hasBg = !!data.backgroundImage;
  const m = mob(device);
  return (
    <section className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: m ? "70vh" : "92vh", backgroundImage: hasBg ? `url(${data.backgroundImage})` : undefined, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: hasBg ? undefined : "var(--site-primary, #1E40AF)" }}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)" }} />
      <div className="relative z-10 text-white px-6 py-16 max-w-4xl mx-auto text-center w-full">
        <h1 style={{ fontFamily: style.headingFont, textShadow: "0 2px 20px rgba(0,0,0,0.5)", letterSpacing: "-0.02em", fontSize: m ? "2rem" : "4.5rem", fontWeight: 800, marginBottom: "1rem" }}>
          {data.headline}
        </h1>
        {data.subheadline && <p style={{ fontSize: m ? "1.1rem" : "1.5rem", opacity: 0.92, marginBottom: "0.75rem", fontWeight: 300 }}>{data.subheadline}</p>}
        {data.body && <p style={{ fontSize: m ? "0.95rem" : "1.1rem", opacity: 0.8, maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>{data.body}</p>}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", flexDirection: m ? "column" : "row", alignItems: "center" }}>
          {data.buttonText && (
            <a href={data.buttonUrl || "#"} style={{ backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", padding: "16px 36px", borderRadius: "8px", fontWeight: 700, fontSize: "1rem", textDecoration: "none", transition: "opacity 0.2s", minWidth: m ? "100%" : "auto", display: "inline-block", textAlign: "center" }}>
              {data.buttonText}
            </a>
          )}
          {data.buttonText2 && (
            <a href={data.buttonUrl2 || "#"} style={{ border: "2px solid white", color: "white", padding: "16px 36px", borderRadius: "8px", fontWeight: 600, fontSize: "1rem", textDecoration: "none", minWidth: m ? "100%" : "auto", display: "inline-block", textAlign: "center" }}>
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
  const m = mob(device);
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.5rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        {data.body && <p style={{ fontSize: m ? "1rem" : "1.1rem", lineHeight: 1.8, opacity: 0.85, whiteSpace: "pre-wrap" }}>{data.body}</p>}
        {data.buttonText && <a href={data.buttonUrl || "#"} style={{ display: "inline-block", marginTop: "1.5rem", backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", padding: "12px 28px", borderRadius: "8px", fontWeight: 600, textDecoration: "none" }}>{data.buttonText}</a>}
      </div>
    </section>
  );
}

/* ═══ 3. PHOTO ═══ */
export function PhotoSection({ data, device }: PropsNoStyle) {
  const m = mob(device);
  if (!data.imageUrl) return null;
  return (
    <section style={{ padding: m ? "2rem 1.5rem" : "4rem 2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <img src={data.imageUrl} alt={data.caption || ""} loading="lazy" style={{ width: "100%", borderRadius: "12px", objectFit: "cover" }} />
        {data.caption && <p style={{ fontSize: "0.9rem", opacity: 0.6, marginTop: "0.75rem", textAlign: "center" }}>{data.caption}</p>}
      </div>
    </section>
  );
}

/* ═══ 4. BULLET LIST — icon grid ═══ */
export function BulletListSection({ data, style, device }: Props) {
  const m = mob(device);
  const items = data.items || [];
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem", backgroundColor: "rgba(0,0,0,0.02)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "2rem", textAlign: m ? "left" : "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: "1rem" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ color: "var(--site-primary, #1E40AF)", fontSize: "1.1rem" }}>✓</span>
              <span style={{ fontSize: m ? "0.85rem" : "0.95rem", fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 5. PRICING — room cards with photos ═══ */
export function PricingSection({ data, style, device }: Props) {
  const m = mob(device);
  const plans = data.plans || [];
  if (!plans.length) return null;
  const cols = plans.length === 1 ? "1fr" : plans.length === 2 ? "1fr 1fr" : m ? "1fr" : "repeat(3, 1fr)";
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "2.5rem", textAlign: m ? "left" : "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : cols, gap: "1.5rem" }}>
          {plans.map((plan, i) => (
            <div key={i} style={{ borderRadius: "16px", overflow: "hidden", boxShadow: plan.recommended ? "0 8px 32px rgba(0,0,0,0.15)" : "0 2px 12px rgba(0,0,0,0.08)", border: plan.recommended ? "2px solid var(--site-primary, #1E40AF)" : "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", position: "relative" }}>
              {plan.recommended && <div style={{ backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", textAlign: "center", padding: "6px", fontSize: "0.8rem", fontWeight: 700 }}>⭐ Most Popular</div>}
              {/* Room photo */}
              {plan.imageUrl ? (
                <img src={plan.imageUrl} alt={plan.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "180px", backgroundColor: "var(--site-primary, #1E40AF)", opacity: 0.15, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "3rem" }}>🏨</span>
                </div>
              )}
              <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: style.headingFont, fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>{plan.name}</h3>
                {plan.description && <p style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "1rem", lineHeight: 1.6 }}>{plan.description}</p>}
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--site-primary, #1E40AF)", marginBottom: "1rem" }}>{plan.price}<span style={{ fontSize: "0.9rem", fontWeight: 400, opacity: 0.6 }}>/night</span></div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem", flex: 1 }}>
                  {(plan.features || []).filter(Boolean).map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", marginBottom: "6px", opacity: 0.8 }}>
                      <span style={{ color: "var(--site-primary, #1E40AF)", fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                {plan.buttonText && (
                  <a href={plan.buttonUrl || "#"} style={{ display: "block", textAlign: "center", backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff", padding: "12px", borderRadius: "8px", fontWeight: 600, textDecoration: "none", fontSize: "0.95rem" }}>
                    {plan.buttonText}
                  </a>
                )}
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
  const m = mob(device);
  const items = data.faqItems || [];
  if (!items.length) return null;
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem", backgroundColor: "rgba(0,0,0,0.02)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "2rem", textAlign: m ? "left" : "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <AccordionTrigger style={{ fontSize: m ? "1rem" : "1.05rem", fontWeight: 600, textAlign: "left", padding: "1.25rem 0" }}>{item.question}</AccordionTrigger>
              <AccordionContent style={{ fontSize: "0.95rem", lineHeight: 1.7, opacity: 0.8, paddingBottom: "1.25rem", whiteSpace: "pre-wrap" }}>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ═══ 7. REVIEWS ═══ */
export function ReviewsSection({ data, style, device }: Props) {
  const m = mob(device);
  const reviews = data.reviews || [];
  if (!reviews.length) return null;
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "2.5rem", textAlign: m ? "left" : "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : reviews.length === 1 ? "1fr" : reviews.length === 2 ? "1fr 1fr" : "repeat(3, 1fr)", gap: "1.5rem" }}>
          {reviews.map((rv, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "1.75rem", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ color: "var(--site-primary, #f59e0b)", fontSize: "1.1rem", letterSpacing: "2px" }}>{"★".repeat(parseInt(rv.rating) || 5)}</div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, opacity: 0.8, fontStyle: "italic" }}>"{rv.reviewText}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "auto" }}>
                {rv.photoUrl ? (
                  <img src={rv.photoUrl} alt={rv.guestName} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "var(--site-primary, #1E40AF)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0 }}>
                    {(rv.guestName || "G").charAt(0)}
                  </div>
                )}
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{rv.guestName}</p>
                  {rv.dateOfStay && <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>{rv.dateOfStay}</p>}
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
export function GallerySection({ data, device }: PropsNoStyle) {
  const m = mob(device);
  const images = data.images || [];
  if (!images.length) return null;
  return (
    <section style={{ padding: m ? "2rem 1.5rem" : "4rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: "8px" }}>
          {images.slice(0, 8).map((img: any, i: number) => (
            <div key={i} style={{ aspectRatio: "1", overflow: "hidden", borderRadius: "8px", backgroundColor: "#f0f0f0" }}>
              <img src={img.url || img} alt={img.alt || ""} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 9. CONTACT with phone, WhatsApp, map ═══ */
export function ContactFormSection({ data, style, device }: Props) {
  const m = mob(device);
  const [submitted, setSubmitted] = useState(false);
  const whatsapp = data.whatsapp?.replace(/[^0-9]/g, "");
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem", backgroundColor: "var(--site-primary, #1E40AF)", color: "#fff" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: m ? "left" : "center" }}>{data.headline}</h2>}
        <p style={{ textAlign: m ? "left" : "center", opacity: 0.85, marginBottom: "3rem" }}>We'd love to hear from you</p>

        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: "3rem" }}>
          {/* Contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {data.email && (
              <a href={`mailto:${data.email}`} style={{ display: "flex", alignItems: "center", gap: "12px", color: "#fff", textDecoration: "none", opacity: 0.9 }}>
                <span style={{ fontSize: "1.25rem" }}>✉️</span>
                <span>{data.email}</span>
              </a>
            )}
            {data.phone && (
              <a href={`tel:${data.phone}`} style={{ display: "flex", alignItems: "center", gap: "12px", color: "#fff", textDecoration: "none", opacity: 0.9 }}>
                <span style={{ fontSize: "1.25rem" }}>📞</span>
                <span>{data.phone}</span>
              </a>
            )}
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "10px", backgroundColor: "#25D366", color: "#fff", padding: "12px 24px", borderRadius: "8px", fontWeight: 700, textDecoration: "none", width: "fit-content" }}>
                <span style={{ fontSize: "1.1rem" }}>💬</span> WhatsApp Us
              </a>
            )}
            {data.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", opacity: 0.9 }}>
                <span style={{ fontSize: "1.25rem" }}>📍</span>
                <span style={{ lineHeight: 1.6 }}>{data.address}</span>
              </div>
            )}
            {data.googleMapsLink && (
              <a href={data.googleMapsLink} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#fff", opacity: 0.8, textDecoration: "underline", fontSize: "0.9rem" }}>
                View on Google Maps →
              </a>
            )}
          </div>

          {/* Form */}
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "2rem" }}>
            {submitted ? (
              <div style={{ textAlign: "center", color: "#22c55e", padding: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "#111" }}>Message sent!</p>
                <p style={{ color: "#666", marginTop: "0.5rem" }}>We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input required placeholder="Your name" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.95rem", color: "#111" }} />
                <input required type="email" placeholder="Email address" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.95rem", color: "#111" }} />
                <input placeholder="Phone / WhatsApp" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.95rem", color: "#111" }} />
                <textarea required placeholder="Your message" rows={4} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.95rem", resize: "none", color: "#111" }} />
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
  const m = mob(device);
  const embedUrl = data.videoUrl ? getEmbedUrl(data.videoUrl) : null;
  if (!embedUrl && !data.videoFileUrl) return null;
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {data.videoTitle && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: m ? "left" : "center", color: "var(--site-heading, inherit)" }}>{data.videoTitle}</h2>}
        <AspectRatio ratio={16 / 9} style={{ borderRadius: "16px", overflow: "hidden" }}>
          {embedUrl
            ? <iframe src={embedUrl} title={data.videoTitle || "Video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
            : <video src={data.videoFileUrl} controls className="w-full h-full object-contain" />}
        </AspectRatio>
      </div>
    </section>
  );
}

/* ═══ LEGACY / REMAINING SECTIONS ═══ */
export function TwoColumnsSection({ data, style, device }: Props) {
  const m = mob(device);
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "2rem", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: "2.5rem" }}>
          <div style={{ fontSize: "1rem", lineHeight: 1.8, opacity: 0.8, whiteSpace: "pre-wrap" }}>{data.leftContent}</div>
          <div style={{ fontSize: "1rem", lineHeight: 1.8, opacity: 0.8, whiteSpace: "pre-wrap" }}>{data.rightContent}</div>
        </div>
      </div>
    </section>
  );
}

export function KeyNumbersSection({ data, style, device }: Props) {
  const m = mob(device);
  const numbers = data.numbers || [];
  if (!numbers.length) return null;
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem", backgroundColor: "rgba(0,0,0,0.02)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "2.5rem", textAlign: "center", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : `repeat(${Math.min(numbers.length, 4)}, 1fr)`, gap: "2rem", textAlign: "center" }}>
          {numbers.map((n, i) => (
            <div key={i}>
              <div style={{ fontSize: m ? "2.5rem" : "3.5rem", fontWeight: 800, color: "var(--site-primary, #1E40AF)" }}>{n.value}</div>
              <div style={{ fontSize: "0.95rem", opacity: 0.65, marginTop: "0.25rem" }}>{n.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NumberCardsSection({ data, style, device }: Props) {
  const m = mob(device);
  const cards = data.numberCards || [];
  if (!cards.length) return null;
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: m ? "1fr" : "repeat(3, 1fr)", gap: "1.5rem" }}>
        {cards.map((card, i) => (
          <div key={i} style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, opacity: 0.2 }}>{card.number}</div>
            <h3 style={{ fontFamily: style.headingFont, fontSize: "1.15rem", fontWeight: 700, margin: "0.5rem 0 0.25rem" }}>{card.title}</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TimelineSection({ data, style, device }: Props) {
  const m = mob(device);
  const events = data.events || [];
  if (!events.length) return null;
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.25rem", fontWeight: 700, marginBottom: "2.5rem", color: "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        <div style={{ borderLeft: "3px solid var(--site-primary, #1E40AF)", paddingLeft: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {events.map((ev, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "-2.65rem", top: "4px", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "var(--site-primary, #1E40AF)", border: "3px solid #fff", boxShadow: "0 0 0 2px var(--site-primary, #1E40AF)" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, opacity: 0.5 }}>{ev.year}</span>
              <h3 style={{ fontFamily: style.headingFont, fontSize: "1.1rem", fontWeight: 700 }}>{ev.title}</h3>
              <p style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "0.25rem" }}>{ev.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeparatorSection({ data }: PropsNoStyle) {
  return <div style={{ padding: "1rem 2rem" }}><hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.1)", maxWidth: "600px", margin: "0 auto" }} /></div>;
}

export function CtaSection({ data, style, device }: Props) {
  const m = mob(device);
  const isBrand = data.background === "brand";
  return (
    <section style={{ padding: m ? "3rem 1.5rem" : "5rem 2rem", backgroundColor: isBrand ? "var(--site-primary, #1E40AF)" : "transparent" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        {data.headline && <h2 style={{ fontFamily: style.headingFont, fontSize: m ? "1.75rem" : "2.5rem", fontWeight: 700, marginBottom: "1rem", color: isBrand ? "#fff" : "var(--site-heading, inherit)" }}>{data.headline}</h2>}
        {data.subheadline && <p style={{ fontSize: "1.1rem", opacity: 0.8, marginBottom: "2rem", color: isBrand ? "#fff" : undefined }}>{data.subheadline}</p>}
        {data.buttonText && <a href={data.buttonUrl || "#"} style={{ display: "inline-block", padding: "16px 40px", borderRadius: "8px", fontWeight: 700, textDecoration: "none", backgroundColor: isBrand ? "#fff" : "var(--site-primary, #1E40AF)", color: isBrand ? "var(--site-primary, #1E40AF)" : "#fff" }}>{data.buttonText}</a>}
      </div>
    </section>
  );
}

export function ImageGallerySection({ data, device }: PropsNoStyle) {
  return <GallerySection data={data} device={device} />;
}
