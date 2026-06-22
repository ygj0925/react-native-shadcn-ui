import { useNote } from '@/hooks/useNotes';
import { NoteEditor } from '@/components/features/notes/note-editor';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { ArrowLeft, Pin, Trash2 } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { note, update, remove, pin, archive } = useNote(id);

  if (!note) {
    return (
      <>
        <Stack.Screen options={{ title: '笔记未找到' }} />
        <View className="flex-1 items-center justify-center bg-background">
          <Pressable onPress={() => router.back()} className="px-4 py-2 rounded-lg bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
        </View>
      </>
    );
  }

  const handleDelete = () => {
    Alert.alert('删除笔记', '确定要删除这篇笔记吗？此操作不可撤销。', [
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

  const handlePin = () => {
    pin();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: note.title || '编辑笔记',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
          headerRight: () => (
            <View className="flex-row items-center gap-3">
              <Pressable onPress={handlePin} hitSlop={10}>
                <Pin
                  size={18}
                  className={cn(
                    note.isPinned ? 'text-primary' : 'text-muted-foreground'
                  )}
                  fill={note.isPinned ? 'currentColor' : 'none'}
                />
              </Pressable>
              <Pressable onPress={handleDelete} hitSlop={10}>
                <Trash2 size={18} className="text-destructive" />
              </Pressable>
            </View>
          ),
        }}
      />
      <NoteEditor note={note} onSave={(input) => update(input)} />
    </>
  );
}
