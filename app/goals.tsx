import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { GoalCard } from '@/components/features/goals/goal-card';
import { GoalForm } from '@/components/features/goals/goal-form';
import { useGoals } from '@/hooks/useGoals';
import { useRouter, Stack } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X } from 'lucide-react-native';

export default function GoalsScreen() {
  const router = useRouter();
  const { rootGoals, createGoal } = useGoals();
  const [showForm, setShowForm] = React.useState(false);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: true, title: '目标管理' }} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 py-5 gap-4">
          <View className="flex-row items-center justify-between">
            <View className="gap-0.5">
              <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide">我的目标</Text>
              <Text className="text-2xl font-bold text-foreground tracking-tight">
                {rootGoals.length} 个目标
              </Text>
            </View>
            <Button
              size="sm"
              className="rounded-xl"
              onPress={() => setShowForm((v) => !v)}>
              {showForm ? <X size={16} /> : <Plus size={16} />}
              <Text>{showForm ? '取消' : '新建'}</Text>
            </Button>
          </View>

          {showForm && (
            <View className="p-4 rounded-2xl bg-card border border-border/60">
              <GoalForm
                onSave={(input) => {
                  createGoal(input);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            </View>
          )}

          {rootGoals.length === 0 ? (
            <View className="py-12 items-center gap-2">
              <Text className="text-base text-muted-foreground">还没有目标</Text>
              <Text className="text-sm text-muted-foreground">点击右上角创建你的第一个目标</Text>
            </View>
          ) : (
            rootGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={(id) => router.push(`/goal/${id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
