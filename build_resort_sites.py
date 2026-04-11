#!/usr/bin/env python3
"""Watch resort_submissions for 'pending' rows and build complete sites."""

SUPABASE_URL = "https://kektzjtsdpgduvvjfrig.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtla3R6anRzZHBnZHV2dmpmcmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTE0OTcsImV4cCI6MjA5MTMyNzQ5N30.5Rk5LBsICzHxiynctLJSh4iveZrxYTn-QYTsNr0dVqg"

import json, random, string, urllib.request, urllib.error

H = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def s(m, p, b=None):
    u = f"{SUPABASE_URL}/rest/v1/{p}"
    req = urllib.request.Request(u, method=m)
    for k, v in H.items(): req.add_header(k, v)
    d = json.dumps(b).encode() if b else None
    with urllib.request.urlopen(req, d, timeout=30) as resp:
        r = resp.read()
        return json.loads(r) if r else None

def build(si, d):
    bi, pub, media, loc = d.get('basicInfo',{}), d.get('publishing',{}), d.get('media',{}), d.get('location',{})
    name = bi.get('resortName','Resort')
    slug = "-".join(c.lower() if c.isalnum() else "-" for c in name).strip("-")
    sd = pub.get('customSubdomain') or f"{slug}-{''.join(random.choices(string.ascii_lowercase+string.digits,k=6))}"
    
    # 1. Site
    site = s("POST","sites",{"user_id":"4f66ea34-fdde-44aa-8d98-99c2a5a89f16","site_name":name,"subdomain":sd,"template":"business"})
    si = site[0]["id"]
    
    # 2. Sections
    secs, hi = [], media.get('heroImages',[])
    secs.append({"site_id":si,"section_type":"cover","order_index":0,"data":{"headline":name,"subheadline":bi.get('tagline',''),"body":bi.get('shortDescription',''),"buttonText":"Book Now","buttonUrl":f"mailto:{loc.get('contactEmail','')}","backgroundImage":hi[0] if hi else None}})
    fd = bi.get('fullDescription','')
    if fd: secs.append({"site_id":si,"section_type":"text_block","order_index":1,"data":{"headline":"About Us","body":fd,"background":"white"}})
    ix = len(secs)
    vu = media.get('videoUrl','')
    if vu: secs.append({"site_id":si,"section_type":"youtube","order_index":ix,"data":{"videoUrl":vu,"videoTitle":f"{name} Tour"}}); ix+=1
    vi = media.get('galleryImages',[])
    if vi: secs.append({"site_id":si,"section_type":"image_gallery","order_index":ix,"data":{"images":[{"url":u,"alt":"","caption":""} for u in vi[:20]],"layout":"3-col"}}); ix+=1
    am = d.get('amenities',[])
    if am: secs.append({"site_id":si,"section_type":"bullet_list","order_index":ix,"data":{"headline":"Amenities","items":[{"text":a,"icon":"check"} for a in am],"listLayout":"two-col"}}); ix+=1
    rms = d.get('roomTypes',[])
    if rms:
        secs.append({"site_id":si,"section_type":"pricing","order_index":ix,"data":{"headline":"Our Rooms","subheadline":"Choose your room","plans":[{"name":r.get('name','Room'),"price":f"₱{r.get('price','0')}/night","features":[r.get('description',''),f"Max {r.get('maxGuests','?')} guests",f"Bed: {r.get('bedType','-')}"]+r.get('amenities',[]),"buttonText":"Book Now","buttonUrl":""} for r in rms]}}); ix+=1
    revs = d.get('reviews',[])
    if revs:
        secs.append({"site_id":si,"section_type":"bullet_list","order_index":ix,"data":{"headline":"Guest Reviews","items":[{"text":f'{r.get("guestName","Guest")} — {"⭐"*int(r.get("rating",5))} {r.get("reviewText","")}'} for r in revs],"listLayout":"two-col"}}); ix+=1
    faqs = d.get('faqs',[])
    if faqs: secs.append({"site_id":si,"section_type":"faq","order_index":ix,"data":{"headline":"FAQ","faqItems":[{"question":f["question"],"answer":f["answer"]} for f in faqs if f.get("question")]}}); ix+=1
    if loc.get('contactEmail'):
        secs.append({"site_id":si,"section_type":"text_block","order_index":ix,"data":{"headline":f"📍 {loc.get('fullAddress','')}","body":f"📧 {loc.get('contactEmail','')}\n📞 {loc.get('phone','')}","background":"light-gray"}}); ix+=1
        secs.append({"site_id":si,"section_type":"contact_form","order_index":ix,"data":{"headline":"Contact Us","body":f"📧 {loc.get('contactEmail','')}\n📞 {loc.get('phone','')}","submitText":"Send Message","successMessage":"Thank you!"}})
    for sec in secs: s("POST","site_content",sec)
    
    # 3. Settings (no social_display column)
    bp,tp,lp,seo,st = d.get('colorPalette',{}),d.get('typography',{}),d.get('layout',{}),d.get('seo',{}),d.get('socialToggles',{})
    c = lambda k,d: bp.get(k,'') if bp.get(k,'').startswith('#') else d
    sl=[]
    for p,u in [('facebook',loc.get('facebook'))]:
        if st.get(p) and u: sl.append({"platform":p.title(),"url":u,"visible":True,"_display":{"showInHeader":True,"showInFooter":True,"iconStyle":"rounded"}})
    for p,h in [('instagram','https://instagram.com/'),('tiktok','https://tiktok.com/@')]:
        if st.get(p) and loc.get(p): sl.append({"platform":p.title(),"url":f"{h}{loc[p]}".replace("@",""),"visible":True,"_display":{"showInHeader":True,"showInFooter":True,"iconStyle":"rounded"}})
    
    s("POST","site_settings",{"site_id":si,
        "colors":{"primary":c("primary","#0EA5E9"),"background":c("background","#ffffff"),"text":c("text","#1e293b"),"heading":c("heading","#0f172a"),"cardBg":c("secondary","#f8fafc")},
        "typography":{"headingFont":tp.get("headingFont","Poppins"),"bodyFont":tp.get("bodyFont","Inter"),"scale":tp.get("fontScale","comfortable")},
        "layout":{"contentWidth":lp.get("contentWidth","1400px"),"spacing":tp.get("fontScale","comfortable"),"borderRadius":lp.get("borderRadius","8px")},
        "buttons":{"style":lp.get("buttonStyle","filled"),"shape":"999px"},
        "site_identity":{"siteTitle":name,"logoUrl":media.get("logoUrl",""),"faviconUrl":media.get("faviconUrl",""),"footerText":f"© {{year}} {name}"},
        "navigation":{"headerStyle":lp.get("headerStyle","blur"),"links":[{"label":"About","url":"#about"},{"label":"Rooms","url":"#rooms"},{"label":"Gallery","url":"#gallery"},{"label":"FAQ","url":"#faq"},{"label":"Contact","url":"#contact"}]},
        "social_links":sl,
        "seo":{"metaTitle":seo.get("metaTitle","") or name,"metaDescription":seo.get("metaDescription","") or bi.get("shortDescription",""),"ogImageUrl":(hi or [""])[0],"gaId":seo.get("googleAnalyticsId","")},
        "custom_css":seo.get("customCSS",""),
        "logo_settings":{"headerLogoUrl":media.get("logoUrl",""),"headerLogoSize":48,"headerLogoPosition":"left","heroLogoEnabled":True,"heroLogoUrl":media.get("logoUrl",""),"heroLogoUseSameAsHeader":True,"heroLogoSize":80,"faviconUrl":media.get("faviconUrl",""),"addShadow":False,"addWhiteBorder":False},
        "header_settings":{"visible":True,"sticky":lp.get("headerSticky",True),"bgColor":c("background","#ffffff"),"layout":"logo-left","height":"72px","ctaVisible":True,"ctaText":"Book Now","ctaLink":f"mailto:{loc.get('contactEmail','')}"},
        "footer_settings":{"visible":True,"columns":int(lp.get("footerColumns",3)),"showLogo":True,"copyrightText":f"© {{year}} {name}","bgColor":"#1e293b","showBackToTop":True},
        "theme_mode":"light",
    })
    
    # 4. Status
    ps = "published" if pub.get('publishImmediately',True) else "draft"
    s("PATCH",f"sites?id=eq.{si}",{"status":ps})
    
    # 5. Done
    s("PATCH",f"resort_submissions?id=eq.{sub_id}",{"status":"built"})
    return si, name, sd, len(secs), ps

# Main
rows = s("GET","resort_submissions?status=eq.pending&order=created_at.asc")
if not rows:
    print("No pending submissions.")
else:
    for row in rows:
        sub_id, d = row['id'], row.get('data',{})
        try:
            si, name, sd, sec, status = build(sub_id, d)
            print(f"✅ {name} → {si} ({sec} sections, {status})")
        except Exception as e:
            print(f"❌ {sub_id[:12]}: {e}")
