import { Text } from '@/components/ui/text';
import { useNotes } from '@/hooks/useNotes';
import { NoteCategoryTabs } from '@/components/features/notes/note-category-tabs';
import { NoteList } from '@/components/features/notes/note-list';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Plus, Search, X } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { OfflineBanner } from '@/components/features/shared/offline-banner';

export default function NotesScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    filteredNotes,
    notesCount,
    searchQuery,
    activeCategory,
    setSearchQuery,
    setActiveCategory,
  } = useNotes();

  const [showSearch, setShowSearch] = React.useState(false);
  const { checkAndConsume, PaywallComponent } = useFeatureGate('unlimited_notes');

  const handlePress = (id: string) => {
    router.push(`/note/${id}` as any);
  };

  const handleCreate = () => {
    if (!checkAndConsume({ title: '笔记数量已达上限', description: '升级到 Pro 创建无限笔记。' })) {
      return;
    }
    router.push('/note/new' as any);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <OfflineBanner />
      {/* Header */}
      <View className="px-4 pt-2 pb-3 gap-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">笔记</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {notesCount} 篇笔记
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setShowSearch(!showSearch)}
              className="w-9 h-9 items-center justify-center rounded-full active:bg-accent"
            >
              {showSearch ? (
                <X size={18} className="text-foreground" />
              ) : (
                <Search size={18} className="text-foreground" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Search bar */}
        {showSearch && (
          <View className="flex-row items-center gap-2 rounded-xl bg-muted px-3 py-2">
            <Search size={16} className="text-muted-foreground" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="搜索笔记..."
              placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
              className="flex-1 text-sm text-foreground"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={14} className="text-muted-foreground" />
              </Pressable>
            )}
          </View>
        )}

        {/* Category tabs */}
        <NoteCategoryTabs
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </View>

      {/* Note list */}
      <View className="flex-1">
        <NoteList
          notes={filteredNotes}
          onPress={handlePress}
        />
      </View>

      {/* FAB */}
      <Pressable
        onPress={handleCreate}
        className={cn(
          'absolute bottom-6 right-6 w-14 h-14 items-center justify-center rounded-full shadow-lg',
          isDark ? 'bg-primary shadow-primary/20' : 'bg-foreground shadow-foreground/20'
        )}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      >
        <Plus size={24} color={isDark ? '#000' : '#fff'} strokeWidth={2.5} />
      </Pressable>

      <PaywallComponent compact />
    </SafeAreaView>
  );
}
