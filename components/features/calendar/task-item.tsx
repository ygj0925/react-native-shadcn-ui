import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { Task, TaskPriority, TaskStatus } from '@/lib/store/tasks';
import { Check, Circle, Clock } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type TaskItemProps = {
  task: Task;
  onToggle?: (id: string) => void;
  onPress?: (id: string) => void;
};

const STATUS_ICON = {
  pending: Circle,
  in_progress: Clock,
  done: Check,
  cancelled: Circle,
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: '待办',
  in_progress: '进行中',
  done: '已完成',
  cancelled: '已取消',
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: 'bg-blue-500/10 text-blue-600',
  medium: 'bg-orange-500/10 text-orange-600',
  high: 'bg-red-500/10 text-red-600',
  urgent: 'bg-purple-500/10 text-purple-600',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export function TaskItem({ task, onToggle, onPress }: TaskItemProps) {
  const StatusIcon = STATUS_ICON[task.status];
  const isDone = task.status === 'done';

  return (
    <Pressable
      onPress={() => onPress?.(task.id)}
      className="active:opacity-70"
    >
      <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3">
        <Pressable onPress={() => onToggle?.(task.id)} hitSlop={8}>
          <StatusIcon
            size={20}
            className={cn(isDone ? 'text-primary' : 'text-muted-foreground')}
            fill={isDone ? 'currentColor' : 'none'}
          />
        </Pressable>

        <View className="flex-1 gap-1">
          <Text
            className={cn(
              'text-sm font-medium text-foreground',
              isDone && 'line-through text-muted-foreground'
            )}
            numberOfLines={1}>
            {task.title || '无标题'}
          </Text>
          {task.dueTime ? (
            <Text className="text-xs text-muted-foreground">{task.dueTime}</Text>
          ) : null}
        </View>

        <View className={cn('rounded-full px-2 py-0.5', PRIORITY_COLOR[task.priority].split(' ')[0])}>
          <Text className={cn('text-[10px] font-medium', PRIORITY_COLOR[task.priority].split(' ')[1])}>
            {PRIORITY_LABEL[task.priority]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
