import { EventForm } from '@/components/features/calendar/event-form';
import { useEvent } from '@/hooks/useCalendar';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { ArrowLeft, Trash2 } from 'lucide-react-native';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { event, update, remove } = useEvent(id);

  if (!event) {
    return (
      <>
        <Stack.Screen options={{ title: '事件未找到' }} />
        <View className="flex-1 items-center justify-center bg-background">
          <Pressable onPress={() => router.back()} className="px-4 py-2 rounded-lg bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
        </View>
      </>
    );
  }

  const handleDelete = () => {
    Alert.alert('删除事件', '确定要删除这个事件吗？此操作不可撤销。', [
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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: event.title || '编辑事件',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleDelete} hitSlop={10}>
              <Trash2 size={18} className="text-destructive" />
            </Pressable>
          ),
        }}
      />
      <EventForm
        event={event}
        selectedDate={event.startTime.slice(0, 10)}
        onSave={(input) => update(input)}
        onDelete={handleDelete}
      />
    </>
  );
}
