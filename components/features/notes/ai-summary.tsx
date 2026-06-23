import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
  classifyNote,
  extractTags,
  extractTodos,
  summarizeNote,
  type ExtractedTodo,
} from '@/lib/ai/notes';
import type { Note, NoteInput, NoteCategory } from '@/lib/store/notes';
import { Check, Sparkles, Tag, Tags, ListChecks, Lightbulb } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useFeatureGate } from '@/hooks/useFeatureGate';

type AISummaryProps = {
  note: Note;
  onApply: (input: Partial<NoteInput>) => void;
  onCreateTodos?: (todos: ExtractedTodo[]) => void;
};

function ActionButton({
  icon,
  label,
  loading,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={cn(
        'flex-row items-center gap-1.5 rounded-full px-3 py-1.5 border',
        loading ? 'opacity-60' : 'active:opacity-80',
        'bg-background border-input'
      )}>
      {icon}
      <Text className="text-[11px] font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}

export function AISummary({ note, onApply, onCreateTodos }: AISummaryProps) {
  const [summary, setSummary] = React.useState('');
  const [category, setCategory] = React.useState<Exclude<NoteCategory, 'all'> | null>(null);
  const [tags, setTags] = React.useState<string[]>([]);
  const [todos, setTodos] = React.useState<ExtractedTodo[]>([]);
  const [loading, setLoading] = React.useState<Record<string, boolean>>({});
  const { checkAndConsume, PaywallComponent } = useFeatureGate('ai_notes');

  const run = async (key: string, fn: () => Promise<void>) => {
    if (!checkAndConsume({ title: 'AI 笔记次数已达上限', description: '升级到 Pro 获得无限 AI 笔记增强。' })) {
      return;
    }
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await fn();
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <View className="rounded-2xl border border-border bg-card p-4 gap-3">
      <View className="flex-row items-center gap-2">
        <Sparkles size={14} className="text-primary" />
        <Text className="text-sm font-semibold text-foreground">AI 助手</Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <ActionButton
          icon={<Sparkles size={12} className="text-primary" />}
          label="生成摘要"
          loading={loading.summary}
          onPress={() =>
            run('summary', async () => {
              const text = await summarizeNote(note);
              setSummary(text);
            })
          }
        />
        <ActionButton
          icon={<Lightbulb size={12} className="text-primary" />}
          label="推荐分类"
          loading={loading.category}
          onPress={() =>
            run('category', async () => {
              const cat = await classifyNote(note);
              setCategory(cat);
            })
          }
        />
        <ActionButton
          icon={<Tags size={12} className="text-primary" />}
          label="提取标签"
          loading={loading.tags}
          onPress={() =>
            run('tags', async () => {
              const list = await extractTags(note);
              setTags(list);
            })
          }
        />
        <ActionButton
          icon={<ListChecks size={12} className="text-primary" />}
          label="提取待办"
          loading={loading.todos}
          onPress={() =>
            run('todos', async () => {
              const list = await extractTodos(note);
              setTodos(list);
            })
          }
        />
      </View>

      {summary ? (
        <View className="rounded-xl bg-muted/50 p-3">
          <Text className="text-xs font-medium text-muted-foreground mb-1">摘要</Text>
          <Text className="text-[13px] leading-5 text-foreground">{summary}</Text>
        </View>
      ) : null}

      {category ? (
        <SuggestionRow
          label={`推荐分类：${getCategoryLabel(category)}`}
          onApply={() => onApply({ category })}
        />
      ) : null}

      {tags.length > 0 ? (
        <View className="flex-row items-center gap-2 flex-wrap">
          <Tag size={12} className="text-muted-foreground" />
          {tags.map((tag) => (
            <View key={tag} className="rounded-full px-2 py-0.5 bg-muted">
              <Text className="text-[11px] text-muted-foreground">#{tag}</Text>
            </View>
          ))}
          <Pressable
            onPress={() => onApply({ tags: [...note.tags, ...tags] })}
            className="flex-row items-center gap-1 rounded-full px-2 py-0.5 bg-primary/10 active:opacity-80">
            <Check size={10} className="text-primary" />
            <Text className="text-[11px] font-medium text-primary">应用</Text>
          </Pressable>
        </View>
      ) : null}

      {todos.length > 0 ? (
        <View className="rounded-xl bg-muted/50 p-3 gap-2">
          <Text className="text-xs font-medium text-muted-foreground">提取到的待办</Text>
          {todos.map((todo, idx) => (
            <View key={idx} className="flex-row items-center gap-2">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <Text className="flex-1 text-[13px] text-foreground" numberOfLines={1}>
                {todo.title}
                {todo.due_date ? ` · ${todo.due_date}` : ''}
              </Text>
            </View>
          ))}
          {onCreateTodos && (
            <Pressable
              onPress={() => onCreateTodos(todos)}
              className="self-start rounded-full px-3 py-1 bg-primary active:opacity-80">
              <Text className="text-[11px] font-medium text-primary-foreground">创建为任务</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <PaywallComponent compact />
    </View>
  );
}

function SuggestionRow({ label, onApply }: { label: string; onApply: () => void }) {
  return (
    <View className="flex-row items-center justify-between rounded-xl bg-muted/50 p-3">
      <Text className="text-[13px] text-foreground">{label}</Text>
      <Pressable
        onPress={onApply}
        className="flex-row items-center gap-1 rounded-full px-2.5 py-1 bg-primary/10 active:opacity-80">
        <Check size={10} className="text-primary" />
        <Text className="text-[11px] font-medium text-primary">应用</Text>
      </Pressable>
    </View>
  );
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'personal':
      return '个人';
    case 'work':
      return '工作';
    case 'idea':
      return '灵感';
    default:
      return category;
  }
}
