import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Goal, GoalInput, GoalStatus, GoalType } from '@/lib/store/goals';
import { Minus, Plus } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type GoalFormProps = {
  goal?: Goal;
  onSave: (input: GoalInput) => void;
  onCancel?: () => void;
};

const TYPE_OPTIONS: { key: GoalType; label: string }[] = [
  { key: 'custom', label: '自定义' },
  { key: 'okr', label: 'OKR' },
  { key: 'milestone', label: '里程碑' },
];

const STATUS_OPTIONS: { key: GoalStatus; label: string }[] = [
  { key: 'not_started', label: '未开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'achieved', label: '已完成' },
  { key: 'abandoned', label: '已放弃' },
];

export function GoalForm({ goal, onSave, onCancel }: GoalFormProps) {
  const [title, setTitle] = React.useState(goal?.title ?? '');
  const [description, setDescription] = React.useState(goal?.description ?? '');
  const [type, setType] = React.useState<GoalType>(goal?.type ?? 'custom');
  const [status, setStatus] = React.useState<GoalStatus>(goal?.status ?? 'not_started');
  const [targetDate, setTargetDate] = React.useState(goal?.targetDate ?? '');
  const [progress, setProgress] = React.useState(goal?.progress ?? 0);

  const handleSave = () => {
    onSave({
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      targetDate: targetDate || null,
      progress,
    });
  };

  const adjustProgress = (delta: number) => {
    setProgress((p) => Math.max(0, Math.min(100, p + delta)));
  };

  return (
    <View className="gap-5">
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">目标名称</Text>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="输入目标名称"
          className="h-12 rounded-xl border-border bg-muted text-foreground"
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">描述</Text>
        <Textarea
          value={description}
          onChangeText={setDescription}
          placeholder="描述这个目标..."
          className="min-h-24 rounded-xl border-border bg-muted text-foreground"
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">类型</Text>
        <View className="flex-row gap-2">
          {TYPE_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setType(option.key)}
              className={cn(
                'flex-1 items-center py-2.5 rounded-xl border',
                type === option.key
                  ? 'bg-primary border-primary'
                  : 'bg-background border-border active:bg-accent'
              )}>
              <Text
                className={cn(
                  'text-sm font-medium',
                  type === option.key ? 'text-primary-foreground' : 'text-foreground'
                )}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">状态</Text>
        <View className="flex-row flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setStatus(option.key)}
              className={cn(
                'px-3 py-2 rounded-xl border',
                status === option.key
                  ? 'bg-primary border-primary'
                  : 'bg-background border-border active:bg-accent'
              )}>
              <Text
                className={cn(
                  'text-sm font-medium',
                  status === option.key ? 'text-primary-foreground' : 'text-foreground'
                )}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">截止日期</Text>
        <Input
          value={targetDate}
          onChangeText={setTargetDate}
          placeholder="YYYY-MM-DD"
          className="h-12 rounded-xl border-border bg-muted text-foreground"
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">进度 ({progress}%)</Text>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => adjustProgress(-10)}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted active:bg-accent">
            <Minus size={16} className="text-foreground" />
          </Pressable>
          <View className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Pressable
            onPress={() => adjustProgress(10)}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted active:bg-accent">
            <Plus size={16} className="text-foreground" />
          </Pressable>
        </View>
      </View>

      <View className="flex-row gap-3 pt-2">
        {onCancel && (
          <Button variant="outline" className="flex-1 rounded-xl" onPress={onCancel}>
            <Text>取消</Text>
          </Button>
        )}
        <Button className="flex-1 rounded-xl" onPress={handleSave}>
          <Text>{goal ? '保存' : '创建'}</Text>
        </Button>
      </View>
    </View>
  );
}
