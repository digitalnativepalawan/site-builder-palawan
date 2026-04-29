/**
 * Hostinger REST API Client
 * Direct HTTP calls to Hostinger's API (no MCP).
 *
 * Environment variables (Vercel):
 * - HOSTINGER_API_KEY
 * - HOSTINGER_BASE_URL (optional, defaults to https://developers.hostinger.com)
 */

const HOSTINGER_BASE = process.env.HOSTINGER_BASE_URL || 'https://developers.hostinger.com';

function getToken(): string {
  const token = process.env.HOSTINGER_API_KEY;
  if (!token) throw new Error('HOSTINGER_API_KEY environment variable is required');
  return token;
}

/* ── Types ─────────────────────────────────────────────────────────── */

export interface DomainCheckResponse {
  domain: string;
  available: boolean;
  price?: number;
  currency?: string;
  tld?: string;
  message?: string;
}

export interface PurchaseResponse {
  orderId: string;
  domain: string;
  expiryDate: string;
}

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';
  name: string; // '@' for root, 'www' for subdomain
  value: string;
  ttl?: number;
}

/* ── Check Domain Availability ─────────────────────────────────────── */

export async function checkDomainAvailability(domain: string): Promise<DomainCheckResponse> {
  const dotIndex = domain.indexOf('.');
  if (dotIndex === -1) throw new Error('Invalid domain: must include a TLD (e.g. example.com)');
  const sld = domain.slice(0, dotIndex);
  const tld = domain.slice(dotIndex + 1);

  const url = `${HOSTINGER_BASE}/api/domains/v1/availability`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domain: sld, tlds: [tld] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err.message || `Hostinger API error ${res.status}`);
  }

  const results = await res.json() as Array<{ domain: string; is_available: boolean; restriction?: string | null }>;
  const result = results[0];
  if (!result) throw new Error('No availability data returned for this domain');
  return { domain: result.domain, available: result.is_available };
}

/* ── Purchase Domain ───────────────────────────────────────────────── */

export async function purchaseDomain({
  domain,
  years,
  contact,
  privacyProtection = true,
}: {
  domain: string;
  years: number;
  contact?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  privacyProtection?: boolean;
}): Promise<PurchaseResponse> {
  const url = `${HOSTINGER_BASE}/v2/domains/purchase`;

  const body: any = {
    domain,
    period: years,
    privacy_protection: privacyProtection,
  };
  if (contact) body.registrant = contact;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Purchase failed: ${res.status}`);
  }

  return res.json();
}

/* ── Update DNS Records ────────────────────────────────────────────── */

export async function setDNSRecords(
  domain: string,
  records: DNSRecord[]
): Promise<{ success: boolean; message?: string }> {
  const url = `${HOSTINGER_BASE}/v2/domains/${encodeURIComponent(domain)}/dns`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `DNS update failed: ${res.status}`);
  }

  return res.json();
}

/* ── Helper: Point domain to Vercel ────────────────────────────────── */

export async function pointDomainToVercel(domain: string): Promise<void> {
  // Vercel's IP for A records (root/apex domain)
  const VERCEL_IP = '76.76.21.21';
  // Vercel's CNAME target for www subdomain
  const VERCEL_CNAME = 'cname.vercel-dns.com';

  const records: DNSRecord[] = [
    { type: 'A', name: '@', value: VERCEL_IP, ttl: 14400 },
    { type: 'CNAME', name: 'www', value: VERCEL_CNAME, ttl: 14400 },
  ];

  await setDNSRecords(domain, records);
}

/* ── Convenience: Purchase and auto-configure ────────────────────── */

export async function purchaseAndConfigureDomain(
  domain: string,
  years: number,
  contact?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
    address?: string;
  }
): Promise<{ domain: string; dnsConfigured: boolean; purchase: PurchaseResponse }> {
  // Step 1: Purchase
  const purchase = await purchaseDomain({ domain, years, contact });

  // Step 2: Configure DNS (fire-and-forget – don't fail if DNS errors)
  try {
    await pointDomainToVercel(domain);
    return { domain: purchase.domain, dnsConfigured: true, purchase };
  } catch (dnsErr) {
    console.warn('DNS configuration failed, but domain purchased:', dnsErr);
    return { domain: purchase.domain, dnsConfigured: false, purchase };
  }
}
