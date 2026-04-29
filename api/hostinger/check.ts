import { checkDomainAvailability } from '../_lib/hostinger.js';

export default async function handler(req: Request): Promise<Response> {
  // Validate API key early
  if (!process.env.HOSTINGER_API_KEY) {
    return new Response(JSON.stringify({ error: 'Hostinger API key not configured on server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { domain } = (await req.json()) as { domain?: string };
    if (!domain || typeof domain !== 'string') {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await checkDomainAvailability(domain.trim().toLowerCase());
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    return new Response(
      JSON.stringify({ error: isTimeout ? 'Domain check timed out — Hostinger API did not respond in time' : (err.message || 'Failed to check domain') }),
      {
        status: isTimeout ? 504 : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
