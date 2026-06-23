import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Brain, TrendingUp, Zap } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type InsightCardProps = {
  summary: string;
  periodStart: string;
  periodEnd: string;
  taskCompletionRate: number;
  habitCompletionRate: number;
  bestDay?: string;
  habitCorrelation?: string;
  onPress?: () => void;
  compact?: boolean;
};

export function InsightCard({
  summary,
  periodStart,
  periodEnd,
  taskCompletionRate,
  habitCompletionRate,
  bestDay,
  habitCorrelation,
  onPress,
  compact,
}: InsightCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card className={cn('border-border/60 active:bg-accent/50', compact ? 'py-4' : 'py-5')}>
        <CardHeader className={cn('flex-row items-center gap-2', compact ? 'px-4 pb-2' : 'px-5 pb-3')}>
          <View className="items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Brain size={16} className="text-primary" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <CardTitle className={cn('text-foreground', compact ? 'text-sm' : 'text-[15px]')}>
              本周 AI 洞察
            </CardTitle>
          </View>
          <Badge variant="secondary">
            <Text className="text-[10px] font-medium text-secondary-foreground">{periodStart} ~ {periodEnd}</Text>
          </Badge>
        </CardHeader>

        <CardContent className={cn('gap-3', compact ? 'px-4' : 'px-5')}>
          <Text className={cn('text-foreground leading-relaxed', compact ? 'text-xs' : 'text-sm')}>
            {summary}
          </Text>

          <View className={cn('flex-row gap-2', compact ? 'flex-wrap' : '')}>
            <StatChip
              icon={<Zap size={12} className="text-primary" />}
              label={`任务 ${taskCompletionRate}%`}
            />
            <StatChip
              icon={<TrendingUp size={12} className="text-primary" />}
              label={`习惯 ${habitCompletionRate}%`}
            />
            {bestDay ? (
              <StatChip
                icon={<TrendingUp size={12} className="text-primary" />}
                label={`最佳 ${bestDay}`}
              />
            ) : null}
          </View>

          {habitCorrelation ? (
            <View className="rounded-xl bg-muted/50 px-3 py-2">
              <Text className="text-xs text-muted-foreground">{habitCorrelation}</Text>
            </View>
          ) : null}
        </CardContent>
      </Card>
    </Pressable>
  );
}

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1">
      {icon}
      <Text className="text-[11px] font-medium text-primary">{label}</Text>
    </View>
  );
}
