import { useNotes } from '@/hooks/useNotes';
import { NoteEditor } from '@/components/features/notes/note-editor';
import { useRouter, Stack } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { t } from '@/lib/i18n';

export default function NewNoteScreen() {
  const router = useRouter();
  const { createNote } = useNotes();

  const handleSave = (input: Parameters<typeof createNote>[0]) => {
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
    </>
  );
}
