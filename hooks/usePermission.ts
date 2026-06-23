import { useMemo } from 'react';
import { useSubscriptionStore, type SubscriptionTier } from '@/lib/store/subscription';

export type Feature =
  | 'ai_chat'
  | 'ai_notes'
  | 'unlimited_notes'
  | 'unlimited_tasks'
  | 'unlimited_habits'
  | 'insights'
  | 'advanced_ai_models';

type PermissionCheck = {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
};

const FEATURE_LIMITS: Record<
  Feature,
  { free: number | boolean; pro: number | boolean; team: number | boolean }
> = {
  ai_chat: { free: 10, pro: Infinity, team: Infinity },
  ai_notes: { free: 5, pro: Infinity, team: Infinity },
  unlimited_notes: { free: 20, pro: Infinity, team: Infinity },
  unlimited_tasks: { free: 50, pro: Infinity, team: Infinity },
  unlimited_habits: { free: 3, pro: Infinity, team: Infinity },
  insights: { free: false, pro: true, team: true },
  advanced_ai_models: { free: false, pro: true, team: true },
};

function resolveLimit(limit: number | boolean): { allowed: boolean; limit?: number } {
  if (limit === true) return { allowed: true };
  if (limit === false) return { allowed: false };
  return { allowed: true, limit };
}

export function usePermission() {
  const tier = useSubscriptionStore((s) => s.tier);
  const aiUsageThisMonth = useSubscriptionStore((s) => s.aiUsageThisMonth);
  const noteCount = useSubscriptionStore((s) => s.noteCount);

  const canUseFeature = useMemo(() => {
    return (feature: Feature): PermissionCheck => {
      const config = FEATURE_LIMITS[feature][tier];
      const { allowed, limit } = resolveLimit(config);

      if (!allowed) {
        return { allowed: false, reason: '升级订阅以解锁此功能' };
      }

      if (limit !== undefined) {
        let current = 0;
        if (feature === 'ai_chat' || feature === 'ai_notes') {
          current = aiUsageThisMonth;
        } else if (feature === 'unlimited_notes') {
          current = noteCount;
        }

        if (current >= limit) {
          return {
            allowed: false,
            reason: `已达到 ${tier === 'free' ? '免费版' : '当前套餐'} 使用上限`,
            limit,
            current,
          };
        }

        return { allowed: true, limit, current };
      }

      return { allowed: true };
    };
  }, [tier, aiUsageThisMonth, noteCount]);

  const isPaid = useMemo(() => tier === 'pro' || tier === 'team', [tier]);

  return {
    tier,
    isPaid,
    canUseFeature,
  };
}

export function checkPermission(
  tier: SubscriptionTier,
  feature: Feature,
  currentUsage?: number
): PermissionCheck {
  const config = FEATURE_LIMITS[feature][tier];
  const { allowed, limit } = resolveLimit(config);

  if (!allowed) {
    return { allowed: false, reason: '升级订阅以解锁此功能' };
  }

  if (limit !== undefined && currentUsage !== undefined && currentUsage >= limit) {
    return {
      allowed: false,
      reason: `已达到 ${tier === 'free' ? '免费版' : '当前套餐'} 使用上限`,
      limit,
      current: currentUsage,
    };
  }

  return { allowed: true, limit, current: currentUsage };
}
