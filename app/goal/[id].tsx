import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressRing } from '@/components/features/goals/progress-ring';
import { KeyResults } from '@/components/features/goals/key-results';
import { GoalForm } from '@/components/features/goals/goal-form';
import { useGoal } from '@/hooks/useGoals';
import { breakdownGoal } from '@/lib/ai/goals';
import type { Goal } from '@/lib/store/goals';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Pencil, Trash2, Sparkles } from 'lucide-react-native';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<Goal['status'], string> = {
  not_started: '未开始',
  in_progress: '进行中',
  achieved: '已完成',
  abandoned: '已放弃',
};

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { goal, childGoals, update, remove, setStatus, addKeyResult, deleteKeyResult, updateKeyResult } = useGoal(id);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showKeyResultForm, setShowKeyResultForm] = React.useState(false);
  const [isBreakingDown, setIsBreakingDown] = React.useState(false);

  if (!goal) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
        <Stack.Screen options={{ title: '目标未找到' }} />
        <View className="flex-1 items-center justify-center">
          <Pressable onPress={() => router.back()} className="px-4 py-2 rounded-lg bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('删除目标', '确定要删除这个目标吗？子目标也会被一并删除。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          remove();
          router.back();
        },
      },
    ]);
  };

  const handleToggleKeyResult = (keyResult: Goal) => {
    if (keyResult.status === 'achieved') {
      updateKeyResult(keyResult.id, { status: 'in_progress', progress: Math.min(keyResult.progress, 90) });
    } else {
      updateKeyResult(keyResult.id, { status: 'achieved', progress: 100 });
    }
  };

  const handleAIBreakdown = async () => {
    if (isBreakingDown) return;
    setIsBreakingDown(true);
    try {
      const results = await breakdownGoal(goal.title, goal.description || undefined);
      if (results.length === 0) {
        Alert.alert('AI 拆解失败', '未能生成子目标，请稍后重试。');
        return;
      }
      results.forEach((item) => {
        addKeyResult({ title: item.title, description: item.description });
      });
    } finally {
      setIsBreakingDown(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: goal.title || '目标详情',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
          headerRight: () => (
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => setIsEditing((v) => !v)} hitSlop={10}>
                <Pencil size={18} className="text-primary" />
              </Pressable>
              <Pressable onPress={handleDelete} hitSlop={10}>
                <Trash2 size={18} className="text-destructive" />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 py-5 gap-5">
          {isEditing ? (
            <Card className="border-border/60">
              <CardContent className="p-4">
                <GoalForm
                  goal={goal}
                  onSave={(input) => {
                    update(input);
                    setIsEditing(false);
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60">
              <CardContent className="p-5 gap-4">
                <View className="flex-row items-start gap-4">
                  <ProgressRing progress={goal.progress} size={72} strokeWidth={7} />
                  <View className="flex-1 gap-1">
                    <Text className="text-xl font-bold text-foreground">{goal.title || '未命名目标'}</Text>
                    <Text className="text-sm text-muted-foreground">{goal.description || '暂无描述'}</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  <View className={cn('rounded-full px-2.5 py-1 bg-muted')}>
                    <Text className="text-xs font-medium">{STATUS_LABELS[goal.status]}</Text>
                  </View>
                  {goal.targetDate ? (
                    <View className="rounded-full px-2.5 py-1 bg-muted">
                      <Text className="text-xs font-medium text-muted-foreground">
                        截止 {goal.targetDate}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View className="flex-row gap-2 pt-1">
                  <Button
                    variant={goal.status === 'in_progress' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 rounded-xl"
                    onPress={() => setStatus('in_progress')}>
                    <Text className={goal.status === 'in_progress' ? 'text-primary-foreground' : ''}>开始</Text>
                  </Button>
                  <Button
                    variant={goal.status === 'achieved' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 rounded-xl"
                    onPress={() => setStatus('achieved')}>
                    <Text className={goal.status === 'achieved' ? 'text-primary-foreground' : ''}>完成</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}

          <Button
            variant="outline"
            className="rounded-xl"
            disabled={isBreakingDown}
            onPress={handleAIBreakdown}>
            <Sparkles size={16} className={cn('text-primary', isBreakingDown && 'opacity-50')} />
            <Text className={cn(isBreakingDown && 'opacity-60')}>
              {isBreakingDown ? 'AI 拆解中...' : 'AI 拆解目标'}
            </Text>
          </Button>

          {showKeyResultForm ? (
            <Card className="border-border/60">
              <CardContent className="p-4">
                <GoalForm
                  onSave={(input) => {
                    addKeyResult(input);
                    setShowKeyResultForm(false);
                  }}
                  onCancel={() => setShowKeyResultForm(false)}
                />
              </CardContent>
            </Card>
          ) : null}

          <KeyResults
            keyResults={childGoals}
            onToggleStatus={handleToggleKeyResult}
            onDelete={(keyResultId) => {
              Alert.alert('删除关键结果', '确定删除这个关键结果吗？', [
                { text: '取消', style: 'cancel' },
                { text: '删除', style: 'destructive', onPress: () => deleteKeyResult(keyResultId) },
              ]);
            }}
            onAdd={() => setShowKeyResultForm(true)}
            onUpdateProgress={(keyResultId, progress) => updateKeyResult(keyResultId, { progress })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
