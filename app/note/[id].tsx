import { useNote } from '@/hooks/useNotes';
import { NoteEditor } from '@/components/features/notes/note-editor';
import { AISummary } from '@/components/features/notes/ai-summary';
import { Text } from '@/components/ui/text';
import { useTasksStore } from '@/lib/store/tasks';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { ArrowLeft, Pin, Sparkles, Trash2, X } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import * as React from 'react';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { note, update, remove, pin, archive } = useNote(id);
  const [aiOpen, setAiOpen] = React.useState(false);
  const createTask = useTasksStore((s) => s.createTask);

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
              <Pressable onPress={() => setAiOpen((v) => !v)} hitSlop={10}>
                <Sparkles
                  size={18}
                  className={cn(aiOpen ? 'text-primary' : 'text-muted-foreground')}
                />
              </Pressable>
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
      <View className="flex-1">
        <NoteEditor note={note} onSave={(input) => update(input)} />
        {aiOpen && (
          <View className="absolute bottom-0 left-0 right-0 max-h-[70%] border-t border-border bg-background/95 backdrop-blur-md">
            <View className="flex-row items-center justify-between px-4 py-2 border-b border-border/40">
              <Text className="text-sm font-semibold text-foreground">AI 笔记助手</Text>
              <Pressable onPress={() => setAiOpen(false)} hitSlop={10}>
                <X size={18} className="text-muted-foreground" />
              </Pressable>
            </View>
            <AISummary
              note={note}
              onApply={(input) => update(input)}
              onCreateTodos={(todos) => {
                todos.forEach((todo) =>
                  createTask({
                    title: todo.title,
                    dueDate: todo.due_date ?? null,
                    priority: 'medium',
                  })
                );
              }}
            />
          </View>
        )}
      </View>
    </>
  );
}
