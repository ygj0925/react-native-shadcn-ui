import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressRing } from './progress-ring';
import { cn } from '@/lib/utils';
import type { Goal } from '@/lib/store/goals';
import { ChevronRight, Target, Trophy, Flag, CircleDashed } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

const STATUS_COLORS: Record<Goal['status'], string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/10 text-blue-600',
  achieved: 'bg-green-500/10 text-green-600',
  abandoned: 'bg-destructive/10 text-destructive',
};

const STATUS_LABELS: Record<Goal['status'], string> = {
  not_started: '未开始',
  in_progress: '进行中',
  achieved: '已完成',
  abandoned: '已放弃',
};

const TYPE_ICONS: Record<Goal['type'], React.ElementType> = {
  okr: Target,
  milestone: Flag,
  custom: CircleDashed,
};

type GoalCardProps = {
  goal: Goal;
  onPress: (id: string) => void;
};

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const TypeIcon = TYPE_ICONS[goal.type];
  const isAchieved = goal.status === 'achieved';

  return (
    <Pressable onPress={() => onPress(goal.id)} className="active:opacity-70">
      <Card className="border-border/60">
        <CardContent className="p-4">
          <View className="flex-row items-center gap-4">
            <ProgressRing
              progress={goal.progress}
              size={56}
              strokeWidth={5}
              color={isAchieved ? 'hsl(var(--chart-2))' : 'hsl(var(--primary))'}
            />
            <View className="flex-1 gap-1.5">
              <View className="flex-row items-center gap-2">
                <TypeIcon size={14} className="text-muted-foreground" />
                <Text className="text-[15px] font-semibold text-foreground" numberOfLines={1}>
                  {goal.title || '未命名目标'}
                </Text>
              </View>
              {goal.description ? (
                <Text className="text-xs text-muted-foreground" numberOfLines={2}>
                  {goal.description}
                </Text>
              ) : null}
              <View className="flex-row items-center gap-2 mt-0.5">
                <View className={cn('rounded-full px-2 py-0.5', STATUS_COLORS[goal.status])}>
                  <Text className="text-[10px] font-medium">{STATUS_LABELS[goal.status]}</Text>
                </View>
                {goal.targetDate ? (
                  <Text className="text-[10px] text-muted-foreground">截止 {goal.targetDate}</Text>
                ) : null}
              </View>
            </View>
            <ChevronRight size={18} className="text-muted-foreground/60" />
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
