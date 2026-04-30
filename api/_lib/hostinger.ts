const HOSTINGER_BASE = process.env.HOSTINGER_BASE_URL || 'https://developers.hostinger.com';
const FETCH_TIMEOUT_MS = 8000;

function getToken(): string | undefined {
  return process.env.HOSTINGER_API_KEY;
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
  const dotIndex = domain.indexOf('.');
  if (dotIndex === -1) throw new Error('Invalid domain: must include a TLD (e.g. example.com)');
  const sld = domain.slice(0, dotIndex);
  const tld = domain.slice(dotIndex + 1);

  const url = `${HOSTINGER_BASE}/api/domains/v1/availability`;
  const res = await timedFetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken() ?? ''}`, 'Content-Type': 'application/json' },
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
    headers: { Authorization: `Bearer ${getToken() ?? ''}`, 'Content-Type': 'application/json' },
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
    headers: { Authorization: `Bearer ${getToken() ?? ''}`, 'Content-Type': 'application/json' },
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
