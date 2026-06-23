import { useEffect, useCallback } from 'react';
import {
  configureRevenueCat,
  setRevenueCatUserId,
  logoutRevenueCat,
  getOfferings,
  getCustomerInfo,
  restorePurchases,
  purchasePackage,
} from '@/lib/revenuecat/client';
import { useSubscriptionStore, type SubscriptionTier } from '@/lib/store/subscription';
import { useAuthStore } from '@/lib/store/auth';
import { updateProfileTier } from '@/lib/sync/subscription';

const ENTITLEMENT_PRO = 'pro';
const ENTITLEMENT_TEAM = 'team';

function tierFromEntitlements(customerInfo: any | null): SubscriptionTier {
  const entitlements = customerInfo?.entitlements?.active ?? {};
  if (entitlements[ENTITLEMENT_TEAM]) return 'team';
  if (entitlements[ENTITLEMENT_PRO]) return 'pro';
  return 'free';
}

export function useSubscription() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const tier = useSubscriptionStore((s) => s.tier);
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const offerings = useSubscriptionStore((s) => s.offerings);
  const customerInfo = useSubscriptionStore((s) => s.customerInfo);
  const setTier = useSubscriptionStore((s) => s.setTier);
  const setLoading = useSubscriptionStore((s) => s.setLoading);
  const setOfferings = useSubscriptionStore((s) => s.setOfferings);
  const setCustomerInfo = useSubscriptionStore((s) => s.setCustomerInfo);

  useEffect(() => {
    if (user?.id) {
      configureRevenueCat(user.id);
      setRevenueCatUserId(user.id);
    } else {
      logoutRevenueCat();
    }
  }, [user?.id]);

  // Sync tier from profile (source of truth from Supabase webhook)
  useEffect(() => {
    if (profile?.subscription_tier) {
      setTier(profile.subscription_tier);
    }
  }, [profile?.subscription_tier, setTier]);

  const loadOfferings = useCallback(async () => {
    setLoading(true);
    try {
      const [offeringsData, customerInfoData] = await Promise.all([
        getOfferings(),
        getCustomerInfo(),
      ]);
      setOfferings(offeringsData);
      setCustomerInfo(customerInfoData);
      if (customerInfoData) {
        setTier(tierFromEntitlements(customerInfoData));
      }
    } finally {
      setLoading(false);
    }
  }, [setCustomerInfo, setLoading, setOfferings, setTier]);

  const purchase = useCallback(
    async (pkg: any) => {
      setLoading(true);
      try {
        const result = await purchasePackage(pkg);
        const newTier = tierFromEntitlements(result.customerInfo);
        setCustomerInfo(result.customerInfo);
        setTier(newTier);
        updateProfileTier(newTier);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [setCustomerInfo, setLoading, setTier]
  );

  const restore = useCallback(async () => {
    setLoading(true);
    try {
      const result = await restorePurchases();
      const newTier = tierFromEntitlements(result);
      setCustomerInfo(result);
      setTier(newTier);
      updateProfileTier(newTier);
      return result;
    } finally {
      setLoading(false);
    }
  }, [setCustomerInfo, setLoading, setTier]);

  return {
    tier,
    isLoading,
    offerings,
    customerInfo,
    loadOfferings,
    purchase,
    restore,
  };
}
