import {
  AssistantRuntimeProvider,
  MessagePrimitive,
  MessageByIndexProvider,
  useAui,
  useAuiState,
} from '@assistant-ui/react-native';
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
import { ToolUIs } from '@/features/chat/tool-uis';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react-native';
import { useState, useRef, useCallback, useEffect } from 'react';
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

function AssistantTextBubble({ text }: { text: string }) {
  if (!text) return null;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        maxWidth: '85%',
        marginHorizontal: 12,
        marginVertical: 2,
        backgroundColor: '#f0f0f3',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}>
      <Text style={{ color: '#1c2024', fontSize: 14, lineHeight: 20 }}>{text}</Text>
    </View>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <View
      style={{
        alignSelf: 'flex-end',
        maxWidth: '85%',
        marginHorizontal: 12,
        marginVertical: 2,
        backgroundColor: '#000000',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}>
      <Text style={{ color: '#ffffff', fontSize: 14, lineHeight: 20 }}>{text}</Text>
    </View>
  );
}

function MessageBubble({ index, isUser, plainText }: { index: number; isUser: boolean; plainText: string }) {
  if (isUser) {
    return <UserBubble text={plainText} />;
  }
  return (
    <MessageByIndexProvider index={index}>
      <MessagePrimitive.Root>
        <MessagePrimitive.Parts
          components={{
            Text: ({ text }) => <AssistantTextBubble text={text} />,
          }}
        />
      </MessagePrimitive.Root>
    </MessageByIndexProvider>
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
  const isRunning = useAuiState((state) => state.thread.isRunning);
  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList>(null);
  const isAtBottomRef = useRef(true);
  const prevIsRunningRef = useRef(isRunning);
  const userScrollingRef = useRef(false);
  const layoutHeightRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScrollBeginDrag = useCallback(() => {
    userScrollingRef.current = true;
    isAtBottomRef.current = false;
  }, []);

  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - contentOffset.y - layoutMeasurement.height;

    if (userScrollingRef.current) {
      if (distanceFromBottom < 20) {
        isAtBottomRef.current = true;
        userScrollingRef.current = false;
        setIsAtBottom(true);
      } else if (distanceFromBottom > 80) {
        setIsAtBottom(false);
      }
    } else if (distanceFromBottom < 20) {
      isAtBottomRef.current = true;
      setIsAtBottom(true);
    }
  }, []);

  const handleLayout = useCallback((event: any) => {
    layoutHeightRef.current = event.nativeEvent.layout.height;
  }, []);

  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    if (isAtBottomRef.current) {
      const offset = Math.max(0, h - layoutHeightRef.current);
      flatListRef.current?.scrollToOffset({ offset, animated: true });
    } else if (userScrollingRef.current) {
      setIsAtBottom(false);
    }
  }, []);

  useEffect(() => {
    if (isRunning && !prevIsRunningRef.current) {
      userScrollingRef.current = false;
      isAtBottomRef.current = true;
      flatListRef.current?.scrollToEnd({ animated: true });
    } else if (!isRunning && prevIsRunningRef.current && isAtBottomRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
    prevIsRunningRef.current = isRunning;
  }, [isRunning]);

  const scrollToBottom = useCallback(() => {
    userScrollingRef.current = false;
    isAtBottomRef.current = true;
    setIsAtBottom(true);
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ChatHeader model={model} onModelChange={onModelChange} />
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(message) => message.id}
          renderItem={({ item, index }) => {
            const plainText = item.content
              .filter((part) => part.type === 'text')
              .map((part) => ('text' in part ? part.text : ''))
              .join('\n');
            return (
              <MessageBubble
                index={index}
                isUser={item.role === 'user'}
                plainText={plainText}
              />
            );
          }}
          contentContainerStyle={{ paddingBottom: 8, paddingTop: 8 }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
          scrollEventThrottle={16}
          onLayout={handleLayout}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
        />
        {!isAtBottom && (
          <Pressable
            onPress={scrollToBottom}
            className="absolute items-center justify-center bg-background border border-border rounded-full shadow-md"
            style={{ width: 36, height: 36, right: 16, bottom: 12, elevation: 4 }}>
            <ChevronDown size={20} color="currentColor" strokeWidth={2} />
          </Pressable>
        )}
      </View>
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
      <ToolUIs />
      <ChatScreen model={model} onModelChange={setModel} />
    </AssistantRuntimeProvider>
  );
}
