import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { NoteCategory } from '@/lib/store/notes';
import { Pressable, ScrollView, View } from 'react-native';

type CategoryItem = {
  key: NoteCategory;
  label: string;
  count?: number;
};

type NoteCategoryTabsProps = {
  active: NoteCategory;
  onChange: (category: NoteCategory) => void;
  counts?: Record<NoteCategory, number>;
};

const CATEGORIES: CategoryItem[] = [
  { key: 'all', label: '全部' },
  { key: 'personal', label: '个人' },
  { key: 'work', label: '工作' },
  { key: 'idea', label: '灵感' },
  { key: 'archive', label: '归档' },
];

export function NoteCategoryTabs({ active, onChange, counts }: NoteCategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.key;
        const count = counts?.[cat.key] ?? 0;

        return (
          <Pressable
            key={cat.key}
            onPress={() => onChange(cat.key)}
            className={cn(
              'flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5',
              isActive ? 'bg-primary' : 'bg-muted'
            )}
          >
            <Text
              className={cn(
                'text-xs font-medium',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {cat.label}
            </Text>
            {count > 0 && (
              <View
                className={cn(
                  'rounded-full min-w-[18px] h-[18px] items-center justify-center px-1',
                  isActive ? 'bg-primary-foreground/20' : 'bg-foreground/10'
                )}
              >
                <Text
                  className={cn(
                    'text-[10px] font-semibold',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
