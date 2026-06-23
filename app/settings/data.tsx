import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/store/auth';
import { useNotesStore } from '@/lib/store/notes';
import { useTasksStore } from '@/lib/store/tasks';
import { useHabitsStore } from '@/lib/store/habits';
import { useCalendarStore } from '@/lib/store/calendar';
import { useGoalsStore } from '@/lib/store/goals';
import { Stack, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ArrowLeft, Download, Upload } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function buildExportData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes: useNotesStore.getState().notes,
    tasks: useTasksStore.getState().tasks,
    habits: useHabitsStore.getState().habits,
    habitLogs: useHabitsStore.getState().logs,
    events: useCalendarStore.getState().events,
    goals: useGoalsStore.getState().goals,
  };
}

export default function DataSettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [importText, setImportText] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const handleExportJSON = async () => {
    setBusy(true);
    try {
      const payload = buildExportData();
      const json = JSON.stringify(payload, null, 2);
      const fileName = `mindflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, json);
      await Sharing.shareAsync(fileUri);
    } catch (e: any) {
      Alert.alert('导出失败', e.message ?? '无法导出数据');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      Alert.alert('导入失败', '请输入有效的 JSON 数据');
      return;
    }

    Alert.alert(
      '确认导入',
      '导入将合并数据，重复的条目可能会被覆盖。建议先导出备份。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '导入',
          onPress: () => {
            try {
              const data = JSON.parse(importText);
              if (data.notes) useNotesStore.setState({ notes: data.notes });
              if (data.tasks) useTasksStore.setState({ tasks: data.tasks });
              if (data.habits) useHabitsStore.setState({ habits: data.habits });
              if (data.habitLogs) useHabitsStore.setState({ logs: data.habitLogs });
              if (data.events) useCalendarStore.setState({ events: data.events });
              if (data.goals) useGoalsStore.setState({ goals: data.goals });
              Alert.alert('导入成功', '数据已合并到本地。');
              setImportText('');
            } catch (e: any) {
              Alert.alert('导入失败', e.message ?? 'JSON 格式错误');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: '数据管理',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 pt-4 pb-6 gap-5">
          <Text className="text-sm text-muted-foreground">
            导出你的笔记、任务、习惯、日程和目标数据，或从 JSON 备份中导入。
          </Text>

          <Card className="py-0 border-border/60">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-[15px] font-semibold">导出数据</CardTitle>
              <CardDescription>生成 JSON 备份并分享到其他应用</CardDescription>
            </CardHeader>
            <Separator className="opacity-50" />
            <CardContent className="px-5 py-4">
              <Button
                onPress={handleExportJSON}
                disabled={busy}
                className="w-full rounded-xl"
              >
                <Download size={16} color="#fff" strokeWidth={2} />
                <Text className="text-sm font-medium text-primary-foreground">导出为 JSON</Text>
              </Button>
            </CardContent>
          </Card>

          <Card className="py-0 border-border/60">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-[15px] font-semibold">导入数据</CardTitle>
              <CardDescription>粘贴之前导出的 JSON 数据进行恢复</CardDescription>
            </CardHeader>
            <Separator className="opacity-50" />
            <CardContent className="px-5 py-4 gap-4">
              <TextInput
                value={importText}
                onChangeText={setImportText}
                placeholder="在此粘贴 JSON 数据..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="min-h-[120px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
                placeholderTextColor="#71717a"
              />
              <Button
                onPress={handleImport}
                variant="outline"
                className="w-full rounded-xl"
              >
                <Upload size={16} className="text-foreground" strokeWidth={2} />
                <Text className="text-sm font-medium text-foreground">导入 JSON</Text>
              </Button>
            </CardContent>
          </Card>

          {user ? (
            <Text className="text-xs text-center text-muted-foreground">
              当前用户：{user.email ?? user.id}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
