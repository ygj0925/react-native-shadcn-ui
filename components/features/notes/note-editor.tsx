import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { Note, NoteInput, NoteCategory } from '@/lib/store/notes';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';

type NoteEditorProps = {
  note?: Note;
  onSave: (input: NoteInput & { category: Exclude<NoteCategory, 'all'> }) => void;
  onDelete?: () => void;
};

const CATEGORIES: { key: Exclude<NoteCategory, 'all'>; label: string }[] = [
  { key: 'personal', label: '个人' },
  { key: 'work', label: '工作' },
  { key: 'idea', label: '灵感' },
];

export function NoteEditor({ note, onSave, onDelete }: NoteEditorProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [title, setTitle] = React.useState(note?.title ?? '');
  const [content, setContent] = React.useState(note?.plainText ?? '');
  const [category, setCategory] = React.useState<Exclude<NoteCategory, 'all'>>(note?.category ?? 'personal');
  const [tagsInput, setTagsInput] = React.useState(note?.tags.join(', ') ?? '');

  React.useEffect(() => {
    if (note) {
      setCategory(note.category);
      setTagsInput(note.tags.join(', '));
    }
  }, [note?.category, note?.tags.join(', ')]);

  // Auto-save on blur or unmount
  const saveRef = React.useRef({ title, content, category, tagsInput });
  saveRef.current = { title, content, category, tagsInput };

  const handleSave = React.useCallback(() => {
    const { title: t, content: c, category: cat, tagsInput: tags } = saveRef.current;
    const parsedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSave({
      title: t,
      content: c, // Will be replaced with TipTap JSON later
      plainText: c,
      category: cat,
      tags: parsedTags,
    });
  }, [onSave]);

  // Save when content changes (debounced via effect)
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(handleSave, 500);
    return () => clearTimeout(timer);
  }, [title, content, category, tagsInput]);

  return (
    <View className="flex-1 bg-background">
      {/* Category selector */}
      <View className="flex-row items-center gap-2 px-4 py-2 border-b border-border/40">
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            onPress={() => setCategory(cat.key)}
            className={cn(
              'rounded-full px-3 py-1',
              category === cat.key ? 'bg-primary' : 'bg-muted'
            )}
          >
            <Text
              className={cn(
                'text-xs font-medium',
                category === cat.key ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Title */}
      <View className="px-4 pt-4">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="标题"
          placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
          className="text-xl font-bold text-foreground"
          multiline
          scrollEnabled={false}
          blurOnSubmit
        />
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-3">
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="开始写点什么..."
          placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
          className="flex-1 text-[15px] text-foreground leading-7"
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
          autoFocus={!note}
        />
      </View>

      {/* Tags */}
      <View className="px-4 py-3 border-t border-border/40">
        <TextInput
          value={tagsInput}
          onChangeText={setTagsInput}
          placeholder="标签 (用逗号分隔)"
          placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
          className="text-xs text-muted-foreground"
        />
      </View>
    </View>
  );
}
