import { useNotes } from '@/hooks/useNotes';
import { NoteEditor } from '@/components/features/notes/note-editor';
import { useRouter, Stack } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { t } from '@/lib/i18n';
import { useFeatureGate } from '@/hooks/useFeatureGate';

export default function NewNoteScreen() {
  const router = useRouter();
  const { createNote } = useNotes();
  const { checkAndConsume, PaywallComponent } = useFeatureGate('unlimited_notes');

  const handleSave = (input: Parameters<typeof createNote>[0]) => {
    if (!checkAndConsume({ title: '笔记数量已达上限', description: '升级到 Pro 创建无限笔记。' })) {
      return;
    }
    const note = createNote(input);
    // Navigate to the edit page for the new note
    router.replace(`/note/${note.id}` as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '新建笔记',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
        }}
      />
      <NoteEditor onSave={handleSave} />
      <PaywallComponent compact />
    </>
  );
}
