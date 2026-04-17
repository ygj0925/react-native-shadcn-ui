import {
  AssistantRuntimeProvider,
  useAuiState,
  useAui,
} from "@assistant-ui/react-native";
import type { ThreadMessage } from "@assistant-ui/react-native";
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppRuntime } from "@/hooks/use-app-runtime";

function MessageBubble({ message }: { message: ThreadMessage }) {
  const isUser = message.role === "user";
  const text = message.content
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("\n");

  return (
    <View
      className={cn(
        'rounded-2xl p-3 my-1 mx-4 max-w-[80%]',
        isUser ? 'self-end bg-primary' : 'self-start bg-muted'
      )}
    >
      <Text className={isUser ? 'text-primary-foreground' : 'text-foreground'}>{text}</Text>
    </View>
  );
}

function Composer() {
  const aui = useAui();
  const text = useAuiState((s) => s.composer.text);
  const isEmpty = useAuiState((s) => s.composer.isEmpty);

  return (
    <View className="flex-row p-3 items-end bg-background">
      <TextInput
        value={text}
        onChangeText={(t) => aui.composer().setText(t)}
        placeholder="Message..."
        multiline
        className="flex-1 border border-border rounded-[20px] px-4 py-2.5 max-h-[120px] text-foreground"
      />
      <Pressable
        onPress={() => aui.composer().send()}
        disabled={isEmpty}
        className={cn(
          'ml-2 rounded-[20px] w-9 h-9 items-center justify-center',
          !isEmpty ? 'bg-primary' : 'bg-muted'
        )}
      >
        <Text className="text-primary-foreground font-bold">↑</Text>
      </Pressable>
    </View>
  );
}

function ChatScreen() {
  const messages = useAuiState(
    (s) => s.thread.messages,
  ) as ThreadMessage[];
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
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
