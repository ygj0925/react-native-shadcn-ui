import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressRing } from './progress-ring';
import { cn } from '@/lib/utils';
import type { Goal, GoalInput } from '@/lib/store/goals';
import { Check, Plus, Trash2 } from 'lucide-react-native';
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

type KeyResultsProps = {
  keyResults: Goal[];
  onToggleStatus: (keyResult: Goal) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onUpdateProgress: (id: string, progress: number) => void;
};

export function KeyResults({
  keyResults,
  onToggleStatus,
  onDelete,
  onAdd,
  onUpdateProgress,
}: KeyResultsProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between px-4 py-4">
        <CardTitle className="text-[15px]">关键结果</CardTitle>
        <Button variant="ghost" size="sm" className="px-2" onPress={onAdd}>
          <Plus size={16} className="text-primary" />
          <Text className="text-primary text-xs">添加</Text>
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 gap-3">
        {keyResults.length === 0 ? (
          <View className="py-6 items-center gap-2">
            <Text className="text-sm text-muted-foreground">还没有关键结果</Text>
            <Text className="text-xs text-muted-foreground">添加子目标来跟踪进度</Text>
          </View>
        ) : (
          keyResults.map((kr) => (
            <View
              key={kr.id}
              className="flex-row items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Pressable
                onPress={() => onToggleStatus(kr)}
                className={cn(
                  'h-6 w-6 rounded-full border items-center justify-center',
                  kr.status === 'achieved'
                    ? 'bg-green-500 border-green-500'
                    : 'border-border bg-background'
                )}>
                {kr.status === 'achieved' && <Check size={14} className="text-white" />}
              </Pressable>

              <View className="flex-1 gap-1">
                <Text
                  className={cn(
                    'text-[14px] font-medium',
                    kr.status === 'achieved' ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}>
                  {kr.title || '未命名关键结果'}
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className={cn('rounded px-1.5 py-0.5', STATUS_COLORS[kr.status])}>
                    <Text className="text-[10px] font-medium">{STATUS_LABELS[kr.status]}</Text>
                  </View>
                  <Text className="text-[10px] text-muted-foreground">{kr.progress}%</Text>
                </View>
              </View>

              <ProgressRing progress={kr.progress} size={36} strokeWidth={4} showLabel={false} />

              <Pressable onPress={() => onDelete(kr.id)} className="p-1.5 rounded-full active:bg-destructive/10">
                <Trash2 size={14} className="text-destructive" />
              </Pressable>
            </View>
          ))
        )}
      </CardContent>
    </Card>
  );
}
