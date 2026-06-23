import { Text } from '@/components/ui/text';
import type { Note } from '@/lib/store/notes';
import { NoteCard } from './note-card';
import { View } from 'react-native';
import { FileText } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';

type NoteListProps = {
  notes: Note[];
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
};

export function NoteList({ notes, onPress, onLongPress }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 py-20">
        <FileText size={40} className="text-muted-foreground/40" strokeWidth={1.5} />
        <Text className="text-sm text-muted-foreground">还没有笔记</Text>
        <Text className="text-xs text-muted-foreground/60">点击右下角 + 创建第一篇笔记</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4">
      <FlashList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard note={item} onPress={onPress} onLongPress={onLongPress} />
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
}
