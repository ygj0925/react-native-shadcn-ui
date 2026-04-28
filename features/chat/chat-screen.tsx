import {
  AssistantRuntimeProvider,
  useAui,
  useAuiState,
} from '@assistant-ui/react-native';
import type { MessageState } from '@assistant-ui/react-native';
import { Text } from '@/components/ui/text';
import { useAppRuntime } from '@/hooks/use-app-runtime';
import { cn } from '@/lib/utils';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MessageBubble({ message }: { message: MessageState }) {
  const isUser = message.role === 'user';
  const text = message.content
    .filter((part) => part.type === 'text')
    .map((part) => ('text' in part ? part.text : ''))
    .join('\n');

  return (
    <View
      className={cn(
        'my-1 mx-4 max-w-[80%] rounded-2xl p-3',
        isUser ? 'self-end bg-primary' : 'self-start bg-muted'
      )}>
      <Text className={isUser ? 'text-primary-foreground' : 'text-foreground'}>{text}</Text>
    </View>
  );
}

function Composer() {
  const aui = useAui();
  const text = useAuiState((state) => state.composer.text);
  const isEmpty = useAuiState((state) => state.composer.isEmpty);

  return (
    <View className="flex-row items-end bg-background p-3">
      <TextInput
        value={text}
        onChangeText={(value) => aui.composer().setText(value)}
        placeholder="Message..."
        multiline
        className="max-h-[120px] flex-1 rounded-[20px] border border-border px-4 py-2.5 text-foreground"
      />
      <Pressable
        onPress={() => aui.composer().send()}
        disabled={isEmpty}
        className={cn(
          'ml-2 h-9 w-9 items-center justify-center rounded-[20px]',
          !isEmpty ? 'bg-primary' : 'bg-muted'
        )}>
        <Text className="font-bold text-primary-foreground">{'>'}</Text>
      </Pressable>
    </View>
  );
}

function ChatScreen() {
  const messages = useAuiState((state) => state.thread.messages);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={messages}
        keyExtractor={(message) => message.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingBottom: 72 }}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />
      <KeyboardStickyView offset={{ closed: insets.bottom }}>
        <Composer />
      </KeyboardStickyView>
    </View>
  );
}

export default function ChatIndex() {
  const runtime = useAppRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatScreen />
    </AssistantRuntimeProvider>
  );
}
