import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/store/tasks';
import { Check, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-600',
  high: 'bg-orange-500/10 text-orange-600',
  urgent: 'bg-destructive/10 text-destructive',
};

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

type TodayTasksProps = {
  tasks: Task[];
  overdueTasks: Task[];
  onToggle: (task: Task) => void;
  onPress: (task: Task) => void;
  onAddPress: () => void;
};

export function TodayTasks({ tasks, overdueTasks, onToggle, onPress, onAddPress }: TodayTasksProps) {
  const displayTasks = tasks.length > 0 ? tasks : overdueTasks.slice(0, 3);
  const hasOverdue = overdueTasks.length > 0;

  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between px-4 py-4">
        <View className="gap-0.5">
          <CardTitle className="text-[15px]">今日任务</CardTitle>
          <Text className="text-xs text-muted-foreground">
            {tasks.length > 0
              ? `${tasks.filter((t) => t.status === 'done').length}/${tasks.length} 已完成`
              : hasOverdue
                ? `有 ${overdueTasks.length} 个逾期任务`
                : '今天还没有任务'}
          </Text>
        </View>
        <Pressable
          onPress={onAddPress}
          className="h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-accent">
          <Plus size={16} className="text-foreground" />
        </Pressable>
      </CardHeader>
      <CardContent className="px-4 pb-4 gap-2">
        {displayTasks.length === 0 ? (
          <View className="py-4 items-center">
            <Text className="text-sm text-muted-foreground">点击右上角添加今日任务</Text>
          </View>
        ) : (
          displayTasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => onPress(task)}
              className="flex-row items-center gap-3 py-2.5 active:opacity-70">
              <Pressable
                onPress={() => onToggle(task)}
                className={cn(
                  'h-5 w-5 rounded-md border items-center justify-center',
                  task.status === 'done'
                    ? 'bg-primary border-primary'
                    : 'border-border bg-background'
                )}>
                {task.status === 'done' && <Check size={12} className="text-primary-foreground" />}
              </Pressable>
              <View className="flex-1 gap-1">
                <Text
                  className={cn(
                    'text-[14px] leading-5',
                    task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}>
                  {task.title || '无标题任务'}
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className={cn('rounded px-1.5 py-0.5', PRIORITY_COLORS[task.priority])}>
                    <Text className="text-[10px] font-medium">{PRIORITY_LABELS[task.priority]}</Text>
                  </View>
                  {task.dueTime ? (
                    <Text className="text-[10px] text-muted-foreground">{task.dueTime.slice(0, 5)}</Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))
        )}
      </CardContent>
    </Card>
  );
}
