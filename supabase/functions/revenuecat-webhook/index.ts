import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2';

const REVENUECAT_WEBHOOK_AUTH_HEADER = 'Authorization';

function tierFromEntitlements(entitlements: Record<string, unknown>): string {
  if (entitlements.team) return 'team';
  if (entitlements.pro) return 'pro';
  return 'free';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Optional: verify RevenueCat webhook auth header using a shared secret.
  // Set REVENUECAT_WEBHOOK_SECRET in Supabase Edge Function secrets.
  const authHeader = req.headers.get(REVENUECAT_WEBHOOK_AUTH_HEADER);
  const expectedSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const eventType = payload?.event?.type;
  const appUserId = payload?.event?.app_user_id;
  const entitlements = payload?.event?.entitlements ?? {};

  if (!appUserId) {
    return new Response(JSON.stringify({ error: 'Missing app_user_id' }), { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const newTier = tierFromEntitlements(entitlements);

  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: newTier, updated_at: new Date().toISOString() })
    .eq('id', appUserId);

  if (error) {
    console.error('[RevenueCat Webhook] Failed to update profile:', error);
    return new Response(JSON.stringify({ error: 'Database update failed' }), { status: 500 });
  }

  console.log(`[RevenueCat Webhook] Updated ${appUserId} to ${newTier} (${eventType})`);

  return new Response(JSON.stringify({ success: true, tier: newTier }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
