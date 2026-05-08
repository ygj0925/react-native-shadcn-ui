import {
  AssistantRuntimeProvider,
  useAui,
  useAuiState,
} from '@assistant-ui/react-native';
import type { MessageState } from '@assistant-ui/react-native';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { useAppRuntime, MIMO_MODELS } from '@/hooks/use-app-runtime';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ChatHeader({
  model,
  onModelChange,
}: {
  model: Option;
  onModelChange: (option: Option) => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-border bg-background px-4 py-2">
      <Text className="text-base font-semibold text-foreground">{t('chat.assistant')}</Text>
      <Select value={model} onValueChange={onModelChange}>
        <SelectTrigger size="sm" className="min-w-[160px]">
          <SelectValue placeholder={t('chat.select_model')} />
        </SelectTrigger>
        <SelectContent side="bottom">
          {MIMO_MODELS.map((m) => (
            <SelectItem key={m.value} label={m.label} value={m.value} />
          ))}
        </SelectContent>
      </Select>
    </View>
  );
}

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
  const [text, setText] = useState('');

  function handleChangeText(value: string) {
    setText(value);
    aui.composer().setText(value);
  }

  function handleSend() {
    aui.composer().send();
    setText('');
  }

  const canSend = text.trim().length > 0;

  return (
    <View className="flex-row items-end p-3 bg-background">
      <TextInput
        value={text}
        onChangeText={handleChangeText}
        placeholder={t('chat.message_short_placeholder')}
        multiline
        className="max-h-[120px] flex-1 rounded-[20px] border border-border px-4 py-2.5 text-foreground"
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        className={cn(
          'ml-2 h-9 w-9 items-center justify-center rounded-[20px]',
          canSend ? 'bg-primary' : 'bg-muted'
        )}>
        <Text className="font-bold text-primary-foreground">{'>'}</Text>
      </Pressable>
    </View>
  );
}

function ChatScreen({ model, onModelChange }: { model: Option; onModelChange: (option: Option) => void }) {
  const messages = useAuiState((state) => state.thread.messages);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ChatHeader model={model} onModelChange={onModelChange} />
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
  const [model, setModel] = useState<Option>({
    label: 'MiMo-V2.5-Pro',
    value: 'mimo-v2.5-pro',
  });

  const runtime = useAppRuntime(model.value);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatScreen model={model} onModelChange={setModel} />
    </AssistantRuntimeProvider>
  );
}
