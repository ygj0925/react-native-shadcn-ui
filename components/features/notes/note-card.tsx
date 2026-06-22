import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { Note } from '@/lib/store/notes';
import { Pin } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type NoteCardProps = {
  note: Note;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
};

export function NoteCard({ note, onPress, onLongPress }: NoteCardProps) {
  const preview = note.plainText.slice(0, 100) || '空白笔记';
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <Pressable
      onPress={() => onPress(note.id)}
      onLongPress={() => onLongPress?.(note.id)}
      className="active:opacity-70"
    >
      <View className="rounded-xl border border-border bg-card p-4 gap-2">
        {/* Header */}
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-[15px] font-semibold text-foreground" numberOfLines={1}>
            {note.title || '无标题'}
          </Text>
          {note.isPinned && (
            <Pin size={14} className="text-primary" fill="currentColor" />
          )}
        </View>

        {/* Preview */}
        <Text className="text-xs text-muted-foreground leading-5" numberOfLines={2}>
          {preview}
        </Text>

        {/* Footer */}
        <View className="flex-row items-center justify-between gap-2 mt-1">
          <View className="flex-row items-center gap-1.5">
            {/* Category badge */}
            <View className={cn(
              'rounded-full px-2 py-0.5',
              getCategoryStyle(note.category)
            )}>
              <Text className="text-[10px] font-medium">
                {getCategoryLabel(note.category)}
              </Text>
            </View>

            {/* Tags */}
            {note.tags.slice(0, 2).map((tag) => (
              <View key={tag} className="rounded-full px-2 py-0.5 bg-muted">
                <Text className="text-[10px] text-muted-foreground">#{tag}</Text>
              </View>
            ))}
          </View>

          <Text className="text-[10px] text-muted-foreground">{timeAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function getCategoryStyle(category: string): string {
  switch (category) {
    case 'personal':
      return 'bg-blue-500/10';
    case 'work':
      return 'bg-orange-500/10';
    case 'idea':
      return 'bg-purple-500/10';
    default:
      return 'bg-muted';
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'personal':
      return '个人';
    case 'work':
      return '工作';
    case 'idea':
      return '灵感';
    case 'archive':
      return '归档';
    default:
      return category;
  }
}
