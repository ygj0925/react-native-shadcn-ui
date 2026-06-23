import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Separator } from '@/components/ui/separator';
import { PricingTable, type Plan } from '@/components/features/subscription/pricing-table';
import { useSubscription } from '@/hooks/useSubscription';
import { usePermission } from '@/hooks/usePermission';
import { useSubscriptionStore } from '@/lib/store/subscription';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Check, Crown, Sparkles, Users } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIER_META: Record<Plan, { label: string; icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>; color: string }> = {
  free: { label: '免费版', icon: Sparkles, color: 'text-muted-foreground' },
  pro: { label: 'Pro', icon: Crown, color: 'text-primary' },
  team: { label: 'Team', icon: Users, color: 'text-purple-500' },
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const { tier, offerings, isLoading, purchase, restore, loadOfferings } = useSubscription();
  const { canUseFeature } = usePermission();
  const aiUsageThisMonth = useSubscriptionStore((s) => s.aiUsageThisMonth);
  const noteCount = useSubscriptionStore((s) => s.noteCount);
  const [purchasing, setPurchasing] = React.useState(false);

  React.useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  const aiChat = canUseFeature('ai_chat');
  const aiNotes = canUseFeature('ai_notes');
  const notes = canUseFeature('unlimited_notes');
  const tasks = canUseFeature('unlimited_tasks');
  const habits = canUseFeature('unlimited_habits');
  const insights = canUseFeature('insights');

  const handleSelectPlan = async (plan: Plan, pkg?: any) => {
    if (!pkg || plan === 'free' || plan === 'team') return;
    setPurchasing(true);
    try {
      await purchase(pkg);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    await restore();
  };

  const TierIcon = TIER_META[tier].icon;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: '订阅管理',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 pt-4 pb-6 gap-5">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <TierIcon size={18} className={TIER_META[tier].color} strokeWidth={2} />
                <CardTitle className="text-base">当前方案：{TIER_META[tier].label}</CardTitle>
              </View>
              <CardDescription>管理你的订阅与使用情况</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="gap-3 pt-4">
              <UsageRow label="AI 对话" check={aiChat} current={aiUsageThisMonth} limit={aiChat.limit} />
              <UsageRow label="AI 笔记" check={aiNotes} current={aiUsageThisMonth} limit={aiNotes.limit} />
              <UsageRow label="笔记数量" check={notes} current={noteCount} limit={notes.limit} />
              <UsageRow label="任务数量" check={tasks} />
              <UsageRow label="习惯数量" check={habits} />
              <UsageRow label="数据洞察" check={insights} />
            </CardContent>
          </Card>

          {/* Pricing */}
          <PricingTable
            currentPlan={tier}
            offerings={offerings}
            onSelectPlan={handleSelectPlan}
          />

          {purchasing || isLoading ? (
            <View className="items-center">
              <Text className="text-sm text-muted-foreground">处理中...</Text>
            </View>
          ) : null}

          {/* Restore */}
          <Button variant="outline" onPress={handleRestore} className="w-full rounded-xl">
            <Text className="text-sm font-medium text-foreground">恢复购买</Text>
          </Button>

          <Text className="text-xs text-center text-muted-foreground">
            订阅会通过 App Store / Google Play 管理。升级后即表示同意自动续费，可随时取消。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function UsageRow({
  label,
  check,
  current,
  limit,
}: {
  label: string;
  check: { allowed: boolean; limit?: number; current?: number };
  current?: number;
  limit?: number;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-foreground">{label}</Text>
      <View className="flex-row items-center gap-2">
        {limit !== undefined ? (
          <Text className="text-xs text-muted-foreground">
            {current ?? 0} / {limit === Infinity ? '∞' : limit}
          </Text>
        ) : null}
        {check.allowed ? (
          <Check size={14} className="text-primary" strokeWidth={2.5} />
        ) : (
          <View className="rounded-full bg-muted px-2 py-0.5">
            <Text className="text-[10px] text-muted-foreground">受限</Text>
          </View>
        )}
      </View>
    </View>
  );
}
