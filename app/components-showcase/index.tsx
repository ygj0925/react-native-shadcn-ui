import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useScrollToTop } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { COMPONENTS } from '@/lib/constants';
import { Link, Stack } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { Platform, View } from 'react-native';

export default function ComponentsShowcaseScreen() {
  const [search, setSearch] = React.useState('');
  const [isAtTop, setIsAtTop] = React.useState(true);
  const isAtTopRef = React.useRef(true);
  const flashListRef = React.useRef(null);
  useScrollToTop(flashListRef);

  const data = !search
    ? COMPONENTS
    : COMPONENTS.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View
      className={cn(
        'web:p-4 mx-auto w-full max-w-lg flex-1',
        Platform.select({ android: cn('border-border/0 border-t', !isAtTop && 'border-border') })
      )}>
      <Stack.Screen options={{ title: 'Components', headerShown: true }} />
      <FlashList
        ref={flashListRef}
        data={data}
        onScroll={Platform.select({
          android: ({ nativeEvent }) => {
            const isScrollAtTop = nativeEvent.contentOffset.y <= 0;
            if (isScrollAtTop !== isAtTopRef.current) {
              isAtTopRef.current = isScrollAtTop;
              setIsAtTop(isScrollAtTop);
            }
          },
        })}
        scrollToOverflowEnabled={Platform.OS === 'ios'}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-4 pb-2"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="pb-4 pt-2">
            <Input
              placeholder="搜索组件"
              clearButtonMode="always"
              onChangeText={setSearch}
              autoCorrect={false}
              enterKeyHint="search"
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <Link href={`/components-showcase/${item.slug}`} asChild>
            <Button
              variant="outline"
              size="lg"
              unstable_pressDelay={100}
              className={cn(
                'dark:bg-background border-border flex-row justify-between rounded-none border-b-0 pl-4 pr-3.5',
                index === 0 && 'rounded-t-lg',
                index === data.length - 1 && 'rounded-b-lg border-b'
              )}>
              <Text className="text-base font-normal">{item.name}</Text>
              <Icon as={ChevronRight} className="text-muted-foreground size-4 stroke-[1.5px]" />
            </Button>
          </Link>
        )}
        ListFooterComponent={<View className="android:pb-safe" />}
      />
    </View>
  );
}
