import { purchaseAndConfigureDomain } from '../_lib/hostinger.js';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (service role for writes)
// Initialize lazily after env var validation to avoid module init crashes
let supabase: Awaited<ReturnType<typeof createClient>> | null = null;

function getSupabase() {
  if (!supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

export default async function handler(req: Request): Promise<Response> {
  // Validate required env vars early
  if (!process.env.HOSTINGER_API_KEY) {
    return new Response(JSON.stringify({ error: 'Hostinger API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Initialize Supabase after validation
  const sb = getSupabase();

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { domain, years, submissionId } = (await req.json()) as {
      domain: string;
      years?: number;
      submissionId?: string;
    };

    if (!domain || typeof domain !== 'string') {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Optional: derive registrant contact from existing submission data
    let contact:
      | {
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          countryCode: string;
          address?: string;
        }
      | undefined;

    let existingData: any = null;
    if (submissionId) {
      const { data: submission, error: subErr } = await sb
        .from('resort_submissions')
        .select('data')
        .eq('id', submissionId)
        .single();

      if (!subErr && submission?.data) {
        existingData = submission.data;
        const bi = submission.data.basicInfo || {};
        const loc = submission.data.location || {};
        contact = {
          firstName: bi.resortName || 'Resort Owner',
          lastName: '',
          email: loc.contactEmail || '',
          phone: loc.phone || '',
          countryCode: 'PH',
          address: loc.fullAddress || '',
        };
      }
    }

    // Purchase domain + configure DNS via Hostinger API
    const result = await purchaseAndConfigureDomain(
      domain.trim().toLowerCase(),
      years ?? 1,
      contact
    );

    // Persist purchase info to submission (fire-and-forget)
    if (submissionId) {
      await sb
        .from('resort_submissions')
        .update({
          data: {
            ...(existingData || {}),
            domain: {
              customDomain: domain,
              purchased: true,
              purchaseResult: result,
              purchasedAt: new Date().toISOString(),
            },
          },
        })
        .eq('id', submissionId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain: result.domain,
        dnsConfigured: result.dnsConfigured,
        orderId: result.purchase.orderId,
        expiryDate: result.purchase.expiryDate,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Domain purchase failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
