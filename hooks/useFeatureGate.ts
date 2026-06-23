import { usePaywall } from '@/components/features/subscription/paywall';
import { usePermission, type Feature } from '@/hooks/usePermission';
import { useSubscriptionStore } from '@/lib/store/subscription';
import { useCallback } from 'react';

export function useFeatureGate(feature: Feature) {
  const { canUseFeature } = usePermission();
  const { showPaywall, PaywallComponent } = usePaywall();
  const incrementAIUsage = useSubscriptionStore((s) => s.incrementAIUsage);

  const checkAndConsume = useCallback(
    (overrides?: { title?: string; description?: string; reason?: string }): boolean => {
      const permission = canUseFeature(feature);
      if (permission.allowed) {
        if (feature === 'ai_chat' || feature === 'ai_notes') {
          incrementAIUsage();
        }
        return true;
      }

      showPaywall({
        title: overrides?.title ?? '升级以继续',
        description:
          overrides?.description ??
          '当前方案已达到使用上限，升级到 Pro 解锁全部功能。',
        reason: overrides?.reason ?? permission.reason,
      });
      return false;
    },
    [canUseFeature, feature, incrementAIUsage, showPaywall]
  );

  return {
    allowed: canUseFeature(feature).allowed,
    checkAndConsume,
    PaywallComponent,
  };
}
