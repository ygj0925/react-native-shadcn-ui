import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth';
import type { SubscriptionTier } from '@/lib/store/subscription';

export async function updateProfileTier(tier: SubscriptionTier) {
  const user = useAuthStore.getState().user;
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) {
    console.warn('[Subscription] Failed to update profile tier:', error.message);
    return;
  }

  useAuthStore.getState().refreshProfile();
}
