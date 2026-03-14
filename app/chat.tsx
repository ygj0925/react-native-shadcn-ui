import { ThemeToggle } from '@/components/themeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  title: 'Chat',
  headerShown: true,
  headerTransparent: false,
  headerRight: () => <ThemeToggle />,
};

const INITIAL_MESSAGES = [
  {
    id: '1',
    role: 'assistant',
    content: 'This chat screen keeps the composer visible when the keyboard opens.',
  },
  {
    id: '2',
    role: 'user',
    content: 'That makes replying much more comfortable on mobile.',
  },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState(INITIAL_MESSAGES);

  function onSend() {
    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: String(Date.now()),
        role: 'user',
        content: trimmed,
      },
    ]);
    setInput('');
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-background">
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1">
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerClassName="gap-3 px-4 py-5"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isUser = item.role === 'user';

            return (
              <View className={isUser ? 'items-end' : 'items-start'}>
                <View
                  className={
                    isUser
                      ? 'max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3'
                      : 'max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-3'
                  }>
                  <Text className={isUser ? 'text-primary-foreground' : 'text-foreground'}>
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
          ListHeaderComponent={
            <View className="gap-1 pb-3">
              <Text className="text-2xl font-semibold tracking-tight">Conversation</Text>
              <Text className="text-muted-foreground">
                The composer is attached to the keyboard, so it lifts together instead of being
                covered.
              </Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 96 + Math.max(insets.bottom, 12) }} />}
        />

        <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
          <View className="border-t border-border bg-background px-4 pt-3">
            <View
              className="flex-row items-end gap-3"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
              <Input
                className="max-h-28 min-h-11 flex-1 py-3"
                multiline
                numberOfLines={3}
                placeholder="Type a message..."
                returnKeyType="send"
                submitBehavior="blurAndSubmit"
                blurOnSubmit={false}
                textAlignVertical="top"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={onSend}
              />
              <Button className="h-11 px-5" onPress={onSend} disabled={!input.trim()}>
                <Text>Send</Text>
              </Button>
            </View>
          </View>
        </KeyboardStickyView>
      </View>
    </SafeAreaView>
  );
}
