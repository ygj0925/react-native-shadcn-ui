import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

export type Plan = 'free' | 'pro' | 'team';

export type PricingPlan = {
  id: Plan;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: '免费版',
    price: '¥0',
    description: '适合个人轻量使用',
    features: ['每月 10 次 AI 对话', '最多 20 篇笔记', '最多 50 个任务', '最多 3 个习惯'],
    cta: '当前方案',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '¥28',
    period: '/月',
    description: '解锁全部 AI 与个人生产力功能',
    highlighted: true,
    features: ['无限 AI 对话', '无限笔记', '无限任务与习惯', '高级 AI 模型', '数据洞察周报'],
    cta: '升级 Pro',
  },
  {
    id: 'team',
    name: 'Team',
    price: '¥68',
    period: '/月',
    description: '即将推出，适合小团队共享',
    features: ['包含 Pro 全部功能', '团队共享空间', '成员权限管理', '优先客服支持'],
    cta: '敬请期待',
  },
];

const FEATURE_COMPARISON = [
  { feature: 'AI 对话', free: '10 次/月', pro: '无限', team: '无限' },
  { feature: 'AI 笔记增强', free: '5 次/月', pro: '无限', team: '无限' },
  { feature: '笔记数量', free: '20 篇', pro: '无限', team: '无限' },
  { feature: '任务数量', free: '50 个', pro: '无限', team: '无限' },
  { feature: '习惯数量', free: '3 个', pro: '无限', team: '无限' },
  { feature: '数据洞察', free: '-', pro: '✓', team: '✓' },
  { feature: '高级 AI 模型', free: '-', pro: '✓', team: '✓' },
  { feature: '团队共享', free: '-', pro: '-', team: '✓' },
];

type PricingTableProps = {
  currentPlan?: Plan;
  offerings?: any | null;
  onSelectPlan?: (plan: Plan, packageToPurchase?: any) => void;
  compact?: boolean;
};

export function PricingTable({ currentPlan = 'free', offerings, onSelectPlan, compact }: PricingTableProps) {
  const [selected, setSelected] = React.useState<Plan>(currentPlan);
  const offering = offerings?.current;

  const plans = React.useMemo<PricingPlan[]>(() => {
    const packages = offering?.availablePackages ?? [];
    const findPrice = (planId: string) => {
      const pkg = packages.find((p: any) => p.identifier === planId || p.product?.identifier?.includes(planId));
      return pkg?.product?.priceString ?? null;
    };

    return DEFAULT_PLANS.map((plan) => {
      const overridePrice = findPrice(plan.id);
      return {
        ...plan,
        price: overridePrice ?? plan.price,
        cta: plan.id === currentPlan ? '当前方案' : plan.id === 'team' ? '敬请期待' : plan.cta,
      };
    });
  }, [offering, currentPlan]);

  const handleSelect = (plan: Plan) => {
    setSelected(plan);
    if (plan === 'team') return;
    const pkg = offering?.availablePackages?.find(
      (p: any) => p.identifier === plan || p.product?.identifier?.includes(plan)
    );
    onSelectPlan?.(plan, pkg);
  };

  return (
    <View className="gap-5">
      <View className={cn('gap-3', compact ? 'flex-col' : 'flex-col sm:flex-row')}>
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isSelected = selected === plan.id;
          return (
            <Pressable
              key={plan.id}
              onPress={() => handleSelect(plan.id)}
              className={cn(
                'flex-1 rounded-2xl border p-4 gap-3 active:opacity-90',
                plan.highlighted
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card',
                isSelected && !isCurrent && 'ring-2 ring-primary/40'
              )}>
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-base font-semibold text-foreground">{plan.name}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">{plan.description}</Text>
                </View>
                {plan.highlighted ? (
                  <Badge variant="default">
                    <Text className="text-xs font-medium text-primary-foreground">推荐</Text>
                  </Badge>
                ) : null}
              </View>

              <View className="flex-row items-baseline">
                <Text className="text-2xl font-bold text-foreground">{plan.price}</Text>
                {plan.period ? <Text className="text-sm text-muted-foreground">{plan.period}</Text> : null}
              </View>

              <View className="gap-1.5">
                {plan.features.map((feature, idx) => (
                  <View key={idx} className="flex-row items-center gap-2">
                    <Check size={12} className="text-primary" strokeWidth={2.5} />
                    <Text className="text-xs text-muted-foreground">{feature}</Text>
                  </View>
                ))}
              </View>

              <Button
                variant={plan.highlighted ? 'default' : 'outline'}
                className="w-full rounded-xl"
                disabled={isCurrent || plan.id === 'team'}
                onPress={() => handleSelect(plan.id)}>
                <Text className={cn('text-sm font-medium', plan.highlighted ? 'text-primary-foreground' : 'text-foreground')}>
                  {isCurrent ? '当前方案' : plan.cta}
                </Text>
              </Button>
            </Pressable>
          );
        })}
      </View>

      {!compact ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">功能对比</CardTitle>
            <CardDescription>不同方案的功能差异</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="px-0 py-0">
            {FEATURE_COMPARISON.map((row, index) => (
              <View
                key={row.feature}
                className={cn(
                  'flex-row items-center px-5 py-3',
                  index !== FEATURE_COMPARISON.length - 1 && 'border-b border-border/40'
                )}>
                <Text className="flex-1 text-sm text-foreground">{row.feature}</Text>
                <View className="flex-1 flex-row justify-around">
                  <Text className={cn('text-xs text-center', currentPlan === 'free' ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    {row.free}
                  </Text>
                </View>
                <View className="flex-1 flex-row justify-around">
                  <Text className={cn('text-xs text-center', currentPlan === 'pro' ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    {row.pro}
                  </Text>
                </View>
                <View className="flex-1 flex-row justify-around">
                  <Text className={cn('text-xs text-center', currentPlan === 'team' ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    {row.team}
                  </Text>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </View>
  );
}
