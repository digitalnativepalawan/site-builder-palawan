const HOSTINGER_BASE = process.env.HOSTINGER_BASE_URL || 'https://api.hostinger.com';
const FETCH_TIMEOUT_MS = 8000;

function getToken(): string {
  const token = process.env.HOSTINGER_API_KEY;
  if (!token) throw new Error('HOSTINGER_API_KEY environment variable is required');
  return token;
}

function timedFetch(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

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
  name: string;
  value: string;
  ttl?: number;
}

export async function checkDomainAvailability(domain: string): Promise<DomainCheckResponse> {
  const url = `${HOSTINGER_BASE}/v2/domains/check-availability/${encodeURIComponent(domain)}`;
  const res = await timedFetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err.message || `Hostinger API error ${res.status}`);
  }
  return res.json();
}

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
  const body: any = { domain, period: years, privacy_protection: privacyProtection };
  if (contact) body.registrant = contact;
  const res = await timedFetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err.message || `Purchase failed: ${res.status}`);
  }
  return res.json();
}

export async function setDNSRecords(
  domain: string,
  records: DNSRecord[]
): Promise<{ success: boolean; message?: string }> {
  const url = `${HOSTINGER_BASE}/v2/domains/${encodeURIComponent(domain)}/dns`;
  const res = await timedFetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err.message || `DNS update failed: ${res.status}`);
  }
  return res.json();
}

export async function pointDomainToVercel(domain: string): Promise<void> {
  await setDNSRecords(domain, [
    { type: 'A', name: '@', value: '76.76.21.21', ttl: 14400 },
    { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: 14400 },
  ]);
}

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
  const purchase = await purchaseDomain({ domain, years, contact });
  try {
    await pointDomainToVercel(domain);
    return { domain: purchase.domain, dnsConfigured: true, purchase };
  } catch {
    return { domain: purchase.domain, dnsConfigured: false, purchase };
  }
}
