import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
  ArrowUp,
  Clock3,
  Folder,
  Image as ImageIcon,
  Menu,
  Mic,
  Pencil,
  Plus,
  Sparkles,
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import * as React from 'react';
import { FlatList, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  headerShown: false,
};

const SUGGESTIONS = [
  {
    id: '1',
    title: 'Design a database schema',
    subtitle: 'for an online merch store',
  },
  {
    id: '2',
    title: 'Explain airplane turbulence',
    subtitle: 'in a simple and calm tone',
  },
  {
    id: '3',
    title: 'Write a release note',
    subtitle: 'for a new mobile chat feature',
  },
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_ASSISTANT_REPLY =
  "Sure! Imagine you're in a car, smoothly cruising down the highway. Turbulence is like the road getting a little bumpy for a moment, but the plane is still safely moving forward.";

const HISTORY_ITEMS = [
  {
    id: 'current',
    title: 'Airplane turbulence explanation',
    preview: 'Simple analogy for a first-time flyer',
  },
  {
    id: 'schema',
    title: 'Merch store schema draft',
    preview: 'Products, carts, orders, and inventory',
  },
  {
    id: 'release',
    title: 'Release note brainstorming',
    preview: 'Mobile chat update and keyboard polish',
  },
  {
    id: 'summary',
    title: 'Weekly meeting summary',
    preview: 'Action items and follow-up owners',
  },
];

function ChatBubble({ item, maxWidth }: { item: Message; maxWidth: number }) {
  const isUser = item.role === 'user';

  return (
    <View className={cn('w-full', isUser ? 'items-end' : 'items-start')}>
      <Card
        style={{ maxWidth }}
        className={cn(
          'gap-0 border py-0 shadow-sm shadow-black/5',
          isUser ? 'border-primary bg-primary' : 'border-border bg-card'
        )}>
        <CardContent className="gap-2 px-4 py-3">
          <Text
            className={cn(
              'text-xs font-medium uppercase tracking-[0.8px]',
              isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}>
            {isUser ? 'You' : 'Assistant'}
          </Text>
          <Text className={cn('leading-6', isUser ? 'text-primary-foreground' : 'text-foreground')}>
            {item.content}
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeHistoryId, setActiveHistoryId] = React.useState('current');
  const flatListRef = React.useRef<FlatList<Message>>(null);
  const isCompact = width < 390;
  const contentPadding = isCompact ? 12 : 16;
  const bubbleMaxWidth = Math.min(width - contentPadding * 2 - 12, width * 0.88);
  const suggestionWidth = Math.min(Math.max(width * 0.62, 160), 220);
  const drawerWidth = Math.min(Math.max(width * 0.78, 260), 340);

  React.useEffect(() => {
    if (!messages.length && !isGenerating) {
      return;
    }

    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages, isGenerating]);

  function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || isGenerating) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-user`,
        role: 'user',
        content: trimmed,
      },
    ]);
    setInput('');
    setIsGenerating(true);

    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: INITIAL_ASSISTANT_REPLY,
        },
      ]);
      setIsGenerating(false);
    }, 1200);
  }

  function onSend() {
    sendMessage(input);
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-background">
      <Stack.Screen options={SCREEN_OPTIONS} />

      <View className="flex-1 bg-background">
        <View
          className="flex-row items-center justify-between pb-3 pt-2"
          style={{ paddingHorizontal: contentPadding }}>
          <Button variant="ghost" size="icon" onPress={() => setDrawerOpen(true)}>
            <Menu size={18} color="currentColor" strokeWidth={2} />
          </Button>

          <View className="items-center gap-0.5">
            <Text className="text-xs font-medium text-muted-foreground">Workspace</Text>
            <Text className={cn('font-semibold tracking-tight', isCompact ? 'text-base' : 'text-lg')}>
              Chat
            </Text>
          </View>

          <Button variant="ghost" size="icon">
            <Pencil size={18} color="currentColor" strokeWidth={2} />
          </Button>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerClassName={cn(
            messages.length ? 'gap-4 pt-2' : 'flex-grow items-center justify-center py-12'
          )}
          contentContainerStyle={{ paddingHorizontal: contentPadding }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <ChatBubble item={item} maxWidth={bubbleMaxWidth} />}
          ListEmptyComponent={
            <View className="w-full max-w-sm items-center gap-5">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
                <Sparkles size={24} color="#ffffff" strokeWidth={2.3} />
              </View>
              <View className="items-center gap-2">
                <Text className="text-2xl font-semibold tracking-tight">Start a conversation</Text>
                <Text className="px-6 text-center text-muted-foreground">
                  Ask for product copy, code review, summaries, or quick brainstorming.
                </Text>
              </View>
            </View>
          }
          ListFooterComponent={
            <View className="pt-1">
              {isGenerating ? (
                <Card
                  style={{ maxWidth: bubbleMaxWidth }}
                  className="border-border bg-card py-0 shadow-sm shadow-black/5">
                  <CardContent className="gap-2 px-4 py-3">
                    <Text className="text-xs font-medium uppercase tracking-[0.8px] text-muted-foreground">
                      Assistant
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <View className="h-2.5 w-2.5 rounded-full bg-foreground" />
                      <View className="h-2.5 w-2.5 rounded-full bg-foreground/45" />
                      <View className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
                    </View>
                  </CardContent>
                </Card>
              ) : null}
            </View>
          }
          ListFooterComponentStyle={{
            paddingBottom: 224 + Math.max(insets.bottom, 10),
          }}
        />

        <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
          <View className="bg-background" style={{ paddingHorizontal: contentPadding }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  className="mr-3"
                  onPress={() => setInput(suggestion.title)}>
                  <Card
                    style={{ width: suggestionWidth }}
                    className="border-border bg-card py-0 shadow-sm shadow-black/5">
                    <CardContent className="gap-1 px-4 py-3">
                      <Text className="text-sm font-semibold leading-5">{suggestion.title}</Text>
                      <Text className="text-xs leading-4 text-muted-foreground">
                        {suggestion.subtitle}
                      </Text>
                    </CardContent>
                  </Card>
                </Pressable>
              ))}
            </ScrollView>

            <Card className="border-border bg-card py-0 shadow-lg shadow-black/5">
              <CardHeader className="flex-row items-center justify-between px-4 pb-2 pt-4">
                <CardTitle className={cn(isCompact ? 'text-sm' : 'text-base')}>
                  Message Composer
                </CardTitle>
                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                  {isGenerating ? 'Generating...' : 'Ready'}
                </Text>
              </CardHeader>

              <Separator />

              <CardContent className="gap-3 px-4 py-3">
                <View className="flex-row items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Plus size={16} color="currentColor" strokeWidth={2.3} />
                  </Button>

                  <Input
                    className="h-11 flex-1"
                    placeholder="Message"
                    returnKeyType="send"
                    submitBehavior="submit"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={onSend}
                  />

                  <Button variant="ghost" size="icon">
                    <Mic size={16} color="currentColor" strokeWidth={2.1} />
                  </Button>

                  <Button size="icon" onPress={onSend} disabled={!input.trim() || isGenerating}>
                    <ArrowUp size={16} color="currentColor" strokeWidth={2.6} />
                  </Button>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <ImageIcon size={16} color="currentColor" strokeWidth={2} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Folder size={16} color="currentColor" strokeWidth={2} />
                    </Button>
                  </View>

                  <Text className="flex-1 pl-3 text-right text-xs text-muted-foreground" numberOfLines={1}>
                    Press enter or tap send
                  </Text>
                </View>
              </CardContent>
            </Card>

            <View style={{ height: Math.max(insets.bottom, 10) }} />
          </View>
        </KeyboardStickyView>

        {drawerOpen ? (
          <View className="absolute inset-0 z-50 flex-row">
            <View style={{ width: drawerWidth }}>
              <Card className="h-full rounded-none border-r border-border bg-card py-0 shadow-2xl shadow-black/10">
                <CardHeader className="gap-3 px-4 pb-3 pt-5">
                  <View className="flex-row items-center justify-between">
                    <View className="gap-1">
                      <CardTitle className="text-lg">Chat History</CardTitle>
                      <Text className="text-sm text-muted-foreground">
                        Resume a recent conversation
                      </Text>
                    </View>

                    <Button variant="ghost" size="icon" onPress={() => setDrawerOpen(false)}>
                      <Menu size={18} color="currentColor" strokeWidth={2} />
                    </Button>
                  </View>

                  <Button
                    className="justify-start"
                    onPress={() => {
                      setMessages([]);
                      setActiveHistoryId('current');
                      setDrawerOpen(false);
                    }}>
                    <Plus size={16} color="currentColor" strokeWidth={2.3} />
                    <Text>New chat</Text>
                  </Button>
                </CardHeader>

                <Separator />

                <ScrollView className="flex-1" contentContainerStyle={{ padding: 12 }}>
                  <View className="gap-2">
                    {HISTORY_ITEMS.map((item) => {
                      const active = item.id === activeHistoryId;

                      return (
                        <Pressable
                          key={item.id}
                          className={cn(
                            'rounded-xl border px-3 py-3',
                            active
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-background active:bg-accent'
                          )}
                          onPress={() => {
                            setActiveHistoryId(item.id);
                            setDrawerOpen(false);
                          }}>
                          <View className="flex-row items-start gap-3">
                            <View
                              className={cn(
                                'mt-0.5 h-8 w-8 items-center justify-center rounded-lg',
                                active ? 'bg-primary text-primary-foreground' : 'bg-muted'
                              )}>
                              <Clock3
                                size={15}
                                color={active ? '#ffffff' : 'currentColor'}
                                strokeWidth={2}
                              />
                            </View>

                            <View className="flex-1 gap-1">
                              <Text
                                className={cn(
                                  'text-sm font-medium',
                                  active ? 'text-foreground' : 'text-foreground'
                                )}
                                numberOfLines={1}>
                                {item.title}
                              </Text>
                              <Text className="text-xs leading-4 text-muted-foreground" numberOfLines={2}>
                                {item.preview}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </Card>
            </View>

            <Pressable className="flex-1 bg-black/35" onPress={() => setDrawerOpen(false)} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
