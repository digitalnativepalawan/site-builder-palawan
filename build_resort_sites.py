#!/usr/bin/env python3
"""
Resort Website Builder — watches resort_submissions for pending rows
and builds complete sites in the site-builder-palawan database.

Run: python3 build_resort_sites.py
     (or via cron every 1 min)
"""

import json, sys, urllib.request, urllib.error, time

SUPABASE_URL = "https://kektzjtsdpgduvvjfrig.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtla3R6anRzZHBnZHV2dmpmcmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTE0OTcsImV4cCI6MjA5MTMyNzQ5N30.5Rk5LBsICzHxiynctLJSh4iveZrxYTn-QYTsNr0dVqg"

HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def supabase(method, path, body=None):
    """Make a typed Supabase REST call and return parsed JSON."""
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    req = urllib.request.Request(url, method=method)
    for k, v in HEADERS.items():
        req.add_header(k, v)
    data = json.dumps(body).encode() if body else None
    try:
        with urllib.request.urlopen(req, data, timeout=30) as resp:
            return json.loads(resp.read()) if resp.status in (200, 201) else None
    except urllib.error.HTTPError as e:
        print(f"  ❌ HTTP {e.code} on {method} {path}: {e.read().decode()}")
        raise


# ─────────────────────────────────────────────
# Section helpers
# ─────────────────────────────────────────────

def mk_cover(d):
    """Hero / cover section."""
    hero_imgs = d.get("media", {}).get("heroImages", [])
    return {
        "section_type": "cover",
        "data": {
            "headline": d.get("basicInfo", {}).get("resortName", ""),
            "subheadline": d.get("basicInfo", {}).get("tagline", ""),
            "body": d.get("basicInfo", {}).get("shortDescription", ""),
            "buttonText": "Book Now",
            "buttonUrl": d.get("location", {}).get("contactEmail", ""),
            "backgroundImage": hero_imgs[0] if hero_imgs else None,
        },
    }


def mk_text_block(headline, body, bg="white", alignment="center"):
    return {
        "section_type": "text_block",
        "data": {"headline": headline, "body": body, "background": bg, "alignment": alignment},
    }


def mk_gallery(images):
    """Image gallery section."""
    return {
        "section_type": "image_gallery",
        "data": {
            "images": [
                {"url": u, "alt": "", "caption": ""} for u in images[:20]
            ],
            "layout": "3-col",
        },
    }


def mk_amenity_bullet_list(amenities):
    return {
        "section_type": "bullet_list",
        "data": {
            "headline": "Amenities & Facilities",
            "items": [{"text": a, "icon": "check"} for a in (amenities or [])],
            "listLayout": "two-col",
        },
    }


def mk_pricing(rooms):
    """Room types as pricing cards."""
    plans = []
    for r in (rooms or []):
        plans.append({
            "name": r.get("name", "Room"),
            "price": f"₱{r.get('price', '0')} / night",
            "features": [
                r.get("description", ""),
                f"Max {r.get('maxGuests', '?')} guests",
                f"Bed: {r.get('bedType', '-')}",
                *(r.get("amenities", [])),
                *(f"{r.get('size', '?')} sqm" if r.get("size") else [],),
            ],
            "buttonText": "Book Now",
            "buttonUrl": "",
        })
    return {
        "section_type": "pricing",
        "data": {
            "headline": "Our Rooms",
            "subheadline": "Choose the perfect room for your stay",
            "plans": plans,
        },
    }


def mk_faq(faqs):
    return {
        "section_type": "faq",
        "data": {
            "headline": "Frequently Asked Questions",
            "faqItems": [
                {"question": f["question"], "answer": f["answer"]}
                for f in (faqs or []) if f.get("question")
            ],
        },
    }


def mk_contact(location):
    return {
        "section_type": "contact_form",
        "data": {
            "headline": "Contact Us",
            "body": f"📧 {location.get('contactEmail', '')}\n📞 {location.get('phone', '')}\n📍 {location.get('fullAddress', '')}",
            "submitText": "Send Message",
            "successMessage": "Thank you! We will get back to you soon.",
        },
    }


def mk_video(video_url):
    return {
        "section_type": "youtube",
        "data": {"videoUrl": video_url, "videoTitle": "Resort Video Tour"},
    }


def mk_reviews(reviews):
    """Render as text_block cards (closest supported)."""
    items = []
    for r in (reviews or []):
        stars = "⭐" * int(r.get("rating", 5))
        items.append({
            "text": f'{r.get("guestName", "Guest")} — {stars}\n{r.get("reviewText", "")}',
            "icon": "star",
        })
    return {
        "section_type": "bullet_list",
        "data": {
            "headline": "What Our Guests Say",
            "items": items,
            "listLayout": "two-col",
        },
    }


# ─────────────────────────────────────────────
# Section plan — ordered list of (section_fn, args_extractor)
# ─────────────────────────────────────────────

def build_section_plan(d):
    """Return ordered list of section dicts."""
    plan = []

    # 1. Cover (always)
    plan.append(mk_cover(d))

    # 2. Full description text block
    full_desc = d.get("basicInfo", {}).get("fullDescription", "")
    if full_desc:
        plan.append(mk_text_block("About Us", full_desc, bg="white", alignment="center"))

    # 3. Video tour
    video_url = d.get("media", {}).get("videoUrl", "")
    if video_url:
        plan.append(mk_video(video_url))

    # 4. Gallery
    gallery_imgs = d.get("media", {}).get("galleryImages", [])
    if gallery_imgs:
        plan.append(mk_gallery(gallery_imgs))

    # 5. Amenities
    amenities = d.get("amenities", [])
    if amenities:
        plan.append(mk_amenity_bullet_list(amenities))

    # 6. Rooms (pricing)
    rooms = d.get("roomTypes", [])
    if rooms:
        plan.append(mk_pricing(rooms))

    # 7. Guest reviews
    reviews = d.get("reviews", [])
    if reviews:
        plan.append(mk_reviews(reviews))

    # 8. FAQ
    faqs = d.get("faqs", [])
    if faqs:
        plan.append(mk_faq(faqs))

    # 9. Location / Contact
    location = d.get("location", {})
    if location.get("contactEmail") or location.get("phone"):
        plan.append(mk_text_block(
            "📍 " + (location.get("fullAddress", "") or "Our Location"),
            f"📧 {location.get('contactEmail', '')}\n📞 {location.get('phone', '')}\n🗺️ {location.get('googleMapsLink', '')}",
            bg="light-gray",
        ))
        plan.append(mk_contact(location))

    return plan


# ─────────────────────────────────────────────
# Settings builder
# ─────────────────────────────────────────────

def build_settings(d):
    bp = d.get("colorPalette", {})
    tp = d.get("typography", {})
    lp = d.get("layout", {})
    seo = d.get("seo", {})
    loc = d.get("location", {})
    bi = d.get("basicInfo", {})
    social = d.get("socialToggles", {})
    media_data = d.get("media", {})

    def hex_or(bp_key, default):
        v = bp.get(bp_key)
        if v and v.startswith("#"):
            return v
        return default

    # Build social links
    social_links = []
    if social.get("facebook"):
        social_links.append({"platform": "Facebook", "url": loc.get("facebook", ""), "visible": True})
    if social.get("instagram"):
        social_links.append({"platform": "Instagram", "url": f"https://instagram.com/{loc.get('instagram','')}".replace("@",""), "visible": True})
    if social.get("twitter"):
        social_links.append({"platform": "Twitter", "url": f"https://twitter.com/{loc.get('twitter','')}".replace("@",""), "visible": True})
    if social.get("tiktok"):
        social_links.append({"platform": "TikTok", "url": f"https://tiktok.com/@{loc.get('tiktok','')}".replace("@",""), "visible": True})
    if social.get("youtube"):
        social_links.append({"platform": "YouTube", "url": loc.get("youtubeChannel", "") or loc.get("youtube", ""), "visible": True})

    meta_title = seo.get("metaTitle", "") or bi.get("resortName", "")
    meta_desc = seo.get("metaDescription", "") or bi.get("shortDescription", "")

    return {
        "colors": {
            "primary": hex_or("primary", "#1E40AF"),
            "background": hex_or("background", "#ffffff"),
            "text": hex_or("text", "#1e293b"),
            "heading": hex_or("heading", "#0f172a"),
            "cardBg": hex_or("secondary", "#f8fafc"),
        },
        "typography": {
            "headingFont": tp.get("headingFont", "Poppins"),
            "bodyFont": tp.get("bodyFont", "Inter"),
            "scale": tp.get("fontScale", "comfortable"),
        },
        "layout": {
            "contentWidth": lp.get("contentWidth", "1200px"),
            "spacing": tp.get("fontScale", "comfortable"),
            "borderRadius": lp.get("borderRadius", "4px"),
        },
        "buttons": {
            "style": lp.get("buttonStyle", "filled"),
            "shape": "999px",
        },
        "site_identity": {
            "siteTitle": bi.get("resortName", ""),
            "logoUrl": media_data.get("logoUrl", ""),
            "faviconUrl": media_data.get("faviconUrl", ""),
            "footerText": f"© {{year}} {bi.get('resortName', '')}. All rights reserved.",
        },
        "navigation": {
            "headerStyle": lp.get("headerStyle", "blur"),
            "links": [
                {"label": "About", "url": "#about"},
                {"label": "Rooms", "url": "#rooms"},
                {"label": "Gallery", "url": "#gallery"},
                {"label": "FAQ", "url": "#faq"},
                {"label": "Contact", "url": "#contact"},
            ],
        },
        "social_links": social_links,
        "social_display": {
            "showInHeader": lp.get("showSocialIn") in ("header", "both"),
            "showInFooter": lp.get("showSocialIn") in ("footer", "both"),
            "iconStyle": "rounded",
        },
        "seo": {
            "metaTitle": meta_title,
            "metaDescription": meta_desc,
            "ogImageUrl": (d.get("media", {}).get("heroImages") or [""])[0],
            "gaId": seo.get("googleAnalyticsId", ""),
        },
        "custom_css": seo.get("customCSS", ""),
        "logo_settings": {
            "headerLogoUrl": media_data.get("logoUrl", ""),
            "headerLogoSize": 48,
            "headerLogoPosition": "left",
            "heroLogoEnabled": True,
            "heroLogoUrl": media_data.get("logoUrl", ""),
            "heroLogoUseSameAsHeader": True,
            "heroLogoSize": 80,
            "faviconUrl": media_data.get("faviconUrl", ""),
            "addShadow": False,
            "addWhiteBorder": False,
        },
        "header_settings": {
            "visible": True,
            "sticky": lp.get("headerSticky", True),
            "bgColor": hex_or("background", "#ffffff"),
            "layout": "logo-left",
            "height": "72px",
            "ctaVisible": True,
            "ctaText": "Book Now",
            "ctaLink": f"mailto:{loc.get('contactEmail', '')}",
        },
        "footer_settings": {
            "visible": True,
            "columns": int(lp.get("footerColumns", 3)),
            "showLogo": True,
            "copyrightText": f"© {{year}} {bi.get('resortName', '')}",
            "bgColor": "#1e293b",
            "showBackToTop": True,
        },
        "theme_mode": "light",
    }


# ─────────────────────────────────────────────
# Main build logic
# ─────────────────────────────────────────────

def generate_subdomain(name):
    slug = "".join(c.lower() if c.isalnum() else "-" for c in name)
    slug = slug.strip("-")
    import random, string
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"{slug}-{suffix}"


def build_site(submission_id, data):
    """Create site + sections + settings. Returns site_id or raises."""
    basic = data.get("basicInfo", {})
    resort_name = basic.get("resortName", "Unnamed Resort")
    pub = data.get("publishing", {})
    subdomain = pub.get("customSubdomain") or generate_subdomain(resort_name)

    print(f"  Creating site: {resort_name}")

    # 1. Create the site
    sites = supabase("POST", "sites", {
        "user_id": "4f66ea34-fdde-44aa-8d98-99c2a5a89f16",
        "site_name": resort_name,
        "subdomain": subdomain,
        "template": "business",
    })
    if not sites:
        raise Exception("Failed to create site")
    site_id = sites[0]["id"]
    print(f"  Site created: {site_id}")

    # 2. Create sections
    section_plan = build_section_plan(data)
    for i, section in enumerate(section_plan):
        section["site_id"] = site_id
        section["order_index"] = i
        supabase("POST", "site_content", section)
        print(f"    Section {i}: {section['section_type']}")

    # 3. Create settings
    settings = build_settings(data)
    settings["site_id"] = site_id
    supabase("POST", "site_settings", settings)
    print(f"    Settings created")

    # 4. Update site status
    publish_now = pub.get("publishImmediately", True)
    status = "published" if publish_now else "draft"
    supabase("PATCH", f"sites?id=eq.{site_id}", {"status": status})
    print(f"  Site status: {status}")

    return site_id


def main():
    print("⏳ Checking for pending resort submissions…")

    # Fetch pending submissions
    rows = supabase("GET", "resort_submissions?status=eq.pending&order=created_at.asc")
    if not rows:
        print("✅ No pending submissions.")
        return

    print(f"🔧 Found {len(rows)} pending submission(s)")

    for row in rows:
        sub_id = row["id"]
        data = row.get("data", {})
        print(f"\n{'='*60}")
        print(f"Processing submission {sub_id}")
        print(f"{'='*60}")

        try:
            site_id = build_site(sub_id, data)

            # Mark submission as built
            supabase("PATCH", f"resort_submissions?id=eq.{sub_id}", {
                "status": "built",
                "data": {**data, "_site_id": site_id},
            })
            print(f"\n✅ Submission {sub_id} → site {site_id}")

        except Exception as e:
            print(f"\n❌ Failed to build site for {sub_id}: {e}")
            supabase("PATCH", f"resort_submissions?id=eq.{sub_id}", {
                "status": "error",
            })

    print("\n✅ Done.")


if __name__ == "__main__":
    main()
