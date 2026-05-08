import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { THEME } from '@/lib/theme';
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
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { FlatList, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  headerShown: false,
};

type ToolCall = {
  id: string;
  function: { name: string; arguments: string };
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

type ToolCallUI = {
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
};

const MIMO_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'show_select',
      description: '展示一个下拉选择框让用户从多个选项中选择一个。当需要用户做单选决策时使用此工具。',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '选择框的标题' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: '显示给用户的选项文本' },
                value: { type: 'string', description: '选项的值' },
              },
              required: ['label', 'value'],
            },
            description: '可供选择的选项列表',
          },
        },
        required: ['title', 'options'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'show_confirm',
      description: '展示一个确认对话框让用户确认或取消操作。当需要用户做是/否决策时使用此工具。',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '确认框的标题' },
          message: { type: 'string', description: '确认框的详细描述信息' },
        },
        required: ['title', 'message'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'show_multi_select',
      description: '展示一个多选列表让用户选择多个选项。当需要用户从列表中勾选多项时使用此工具。',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '多选框的标题' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: '显示给用户的选项文本' },
                value: { type: 'string', description: '选项的值' },
              },
              required: ['label', 'value'],
            },
            description: '可供选择的选项列表',
          },
        },
        required: ['title', 'options'],
      },
    },
  },
];

const MIMO_BASE_URL =
  Platform.OS === 'web' ? '/mimo-api' : (process.env.EXPO_PUBLIC_MIMO_BASE_URL ?? '');
const MIMO_API_KEY = process.env.EXPO_PUBLIC_MIMO_API_KEY ?? '';
const MIMO_MODEL = process.env.EXPO_PUBLIC_MIMO_MODEL ?? 'mimo-v2.5-pro';

let messageIdCounter = 0;
function nextMessageId(role: string) {
  return `${++messageIdCounter}-${role}`;
}

function ChatBubble({ item, maxWidth }: { item: Message; maxWidth: number }) {
  const isUser = item.role === 'user';

  if (item.role === 'tool') return null;
  if (!item.content && !item.tool_calls?.length) return null;

  return (
    <View className={cn('w-full', isUser ? 'items-end' : 'items-start')}>
      {item.content ? (
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
              {isUser ? t('chat.you') : t('chat.assistant')}
            </Text>
            <Text className={cn('leading-6', isUser ? 'text-primary-foreground' : 'text-foreground')}>
              {item.content}
            </Text>
          </CardContent>
        </Card>
      ) : null}
    </View>
  );
}

function SelectToolUI({
  args,
  result,
  onResult,
}: {
  args: { title: string; options: { label: string; value: string }[] };
  result?: { value: string; label: string };
  onResult: (result: any) => void;
}) {
  const [selected, setSelected] = React.useState<Option | undefined>();

  if (result) {
    return (
      <Card className="py-0 border-border bg-card shadow-sm shadow-black/5">
        <CardContent className="gap-2 px-4 py-3">
          <Text className="text-xs font-medium text-muted-foreground">{args.title}</Text>
          <Text className="text-foreground">已选择: {result.label || result.value}</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-0 border-border bg-card shadow-sm shadow-black/5">
      <CardContent className="gap-3 px-4 py-3">
        <Text className="text-sm font-medium text-foreground">{args.title}</Text>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="请选择..." />
          </SelectTrigger>
          <SelectContent side="bottom">
            {args.options.map((opt) => (
              <SelectItem key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter className="px-4 pb-3">
        <Button
          disabled={!selected}
          onPress={() => {
            if (selected) onResult({ value: selected.value, label: selected.label });
          }}>
          <Text className="text-primary-foreground">确认</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ConfirmToolUI({
  args,
  result,
  onResult,
}: {
  args: { title: string; message: string };
  result?: { confirmed: boolean };
  onResult: (result: any) => void;
}) {
  if (result) {
    return (
      <Card className="py-0 border-border bg-card shadow-sm shadow-black/5">
        <CardContent className="gap-2 px-4 py-3">
          <Text className="text-xs font-medium text-muted-foreground">{args.title}</Text>
          <Text className="text-foreground">{result.confirmed ? '已确认' : '已取消'}</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-0 border-border bg-card shadow-sm shadow-black/5">
      <CardContent className="gap-2 px-4 py-3">
        <Text className="text-sm font-medium text-foreground">{args.title}</Text>
        <Text className="text-muted-foreground">{args.message}</Text>
      </CardContent>
      <CardFooter className="flex-row gap-3 px-4 pb-3">
        <Button variant="outline" onPress={() => onResult({ confirmed: false })}>
          <Text>取消</Text>
        </Button>
        <Button onPress={() => onResult({ confirmed: true })}>
          <Text className="text-primary-foreground">确认</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}

function MultiSelectToolUI({
  args,
  result,
  onResult,
}: {
  args: { title: string; options: { label: string; value: string }[] };
  result?: { values: string[] };
  onResult: (result: any) => void;
}) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  if (result) {
    const labels = args.options
      .filter((opt) => result.values.includes(opt.value))
      .map((opt) => opt.label);
    return (
      <Card className="py-0 border-border bg-card shadow-sm shadow-black/5">
        <CardContent className="gap-2 px-4 py-3">
          <Text className="text-xs font-medium text-muted-foreground">{args.title}</Text>
          <Text className="text-foreground">已选择: {labels.join(', ')}</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-0 border-border bg-card shadow-sm shadow-black/5">
      <CardContent className="gap-3 px-4 py-3">
        <Text className="text-sm font-medium text-foreground">{args.title}</Text>
        {args.options.map((opt) => (
          <Pressable
            key={opt.value}
            className="flex-row items-center gap-3"
            onPress={() => toggle(opt.value)}>
            <Checkbox
              checked={selected.has(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            />
            <Text className="text-foreground">{opt.label}</Text>
          </Pressable>
        ))}
      </CardContent>
      <CardFooter className="px-4 pb-3">
        <Button
          disabled={selected.size === 0}
          onPress={() => onResult({ values: Array.from(selected) })}>
          <Text className="text-primary-foreground">提交</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ToolCallBubble({
  toolCall,
  maxWidth,
  onResult,
}: {
  toolCall: ToolCallUI;
  maxWidth: number;
  onResult: (toolCallId: string, result: any) => void;
}) {
  let args: any = {};
  try {
    args = typeof toolCall.args === 'string' ? JSON.parse(toolCall.args) : toolCall.args;
  } catch { /* empty */ }

  const handleResult = (result: any) => onResult(toolCall.toolCallId, result);

  return (
    <View className="w-full items-start" style={{ maxWidth }}>
      {toolCall.toolName === 'show_select' && (
        <SelectToolUI args={args} result={toolCall.result} onResult={handleResult} />
      )}
      {toolCall.toolName === 'show_confirm' && (
        <ConfirmToolUI args={args} result={toolCall.result} onResult={handleResult} />
      )}
      {toolCall.toolName === 'show_multi_select' && (
        <MultiSelectToolUI args={args} result={toolCall.result} onResult={handleResult} />
      )}
    </View>
  );
}

export default function ChatScreen() {
  const { colorScheme } = useColorScheme();
  const tint = THEME[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const messagesRef = React.useRef<Message[]>([]);
  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const [toolCalls, setToolCalls] = React.useState<ToolCallUI[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const [activeHistoryId, setActiveHistoryId] = React.useState('current');
  const flatListRef = React.useRef<FlatList<Message>>(null);
  const isCompact = width < 390;
  const isLargeScreen = width >= 768;
  const contentPadding = isCompact ? 12 : 16;
  const bubbleMaxWidth = Math.min(width - contentPadding * 2 - 12, width * 0.88);
  const suggestionWidth = Math.min(Math.max(width * 0.62, 160), 220);
  const sidebarWidth = isLargeScreen
    ? Math.min(Math.max(width * 0.28, 280), 340)
    : Math.min(Math.max(width * 0.78, 260), 340);

  const SUGGESTIONS = [
    { id: '1', title: t('chat.suggestions.schema_title'), subtitle: t('chat.suggestions.schema_subtitle') },
    { id: '2', title: t('chat.suggestions.turbulence_title'), subtitle: t('chat.suggestions.turbulence_subtitle') },
    { id: '3', title: t('chat.suggestions.release_title'), subtitle: t('chat.suggestions.release_subtitle') },
  ];

  const HISTORY_ITEMS = [
    { id: 'current', title: t('chat.history.current_title'), preview: t('chat.history.current_preview') },
    { id: 'schema', title: t('chat.history.schema_title'), preview: t('chat.history.schema_preview') },
    { id: 'release', title: t('chat.history.release_title'), preview: t('chat.history.release_preview') },
    { id: 'summary', title: t('chat.history.summary_title'), preview: t('chat.history.summary_preview') },
  ];

  React.useEffect(() => {
    if (!isLargeScreen) {
      setSidebarVisible(true);
      setDrawerOpen(false);
    }
  }, [isLargeScreen]);

  React.useEffect(() => {
    if (!messages.length && !isGenerating) {
      return;
    }

    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages, isGenerating]);

  async function callApi(apiMessages: { role: string; content: string; tool_calls?: any[]; tool_call_id?: string }[]) {
    const response = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MIMO_API_KEY,
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: apiMessages,
        tools: MIMO_TOOLS,
        tool_choice: 'auto',
        max_completion_tokens: 4096,
        temperature: 1.0,
        top_p: 0.95,
        stream: false,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || isGenerating) {
      return;
    }

    const userMsg: Message = {
      id: nextMessageId('user'),
      role: 'user',
      content: trimmed,
    };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput('');
    setIsGenerating(true);

    try {
      const apiMessages = updatedMessages.map((m) => {
        const msg: any = { role: m.role, content: m.content };
        if (m.tool_calls) msg.tool_calls = m.tool_calls;
        if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
        return msg;
      });

      const data = await callApi(apiMessages);
      const choice = data.choices?.[0];
      const msg = choice?.message;

      if (msg?.tool_calls?.length) {
        const assistantMsg: Message = {
          id: nextMessageId('assistant'),
          role: 'assistant',
          content: msg.content || '',
          tool_calls: msg.tool_calls,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        const newToolCalls: ToolCallUI[] = msg.tool_calls.map((tc: any) => ({
          toolCallId: tc.id,
          toolName: tc.function.name,
          args: tc.function.arguments,
        }));
        setToolCalls((prev) => [...prev, ...newToolCalls]);
      } else {
        const reply = msg?.content || msg?.reasoning_content || t('chat.no_reply');
        setMessages((prev) => [
          ...prev,
          { id: nextMessageId('assistant'), role: 'assistant', content: reply },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId('assistant'), role: 'assistant', content: t('chat.request_failed') },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleToolResult(toolCallId: string, result: any) {
    setToolCalls((prev) =>
      prev.map((tc) => (tc.toolCallId === toolCallId ? { ...tc, result } : tc))
    );

    const toolResultMsg: Message = {
      id: nextMessageId('tool'),
      role: 'tool',
      content: JSON.stringify(result),
      tool_call_id: toolCallId,
    };

    const updatedMessages = [...messagesRef.current, toolResultMsg];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    setIsGenerating(true);

    try {
      const apiMessages = updatedMessages.map((m) => {
        const msg: any = { role: m.role, content: m.content };
        if (m.tool_calls) msg.tool_calls = m.tool_calls;
        if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
        return msg;
      });

      const data = await callApi(apiMessages);
      const choice = data.choices?.[0];
      const msg = choice?.message;

      if (msg?.tool_calls?.length) {
        const assistantMsg: Message = {
          id: nextMessageId('assistant'),
          role: 'assistant',
          content: msg.content || '',
          tool_calls: msg.tool_calls,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        const newToolCalls: ToolCallUI[] = msg.tool_calls.map((tc: any) => ({
          toolCallId: tc.id,
          toolName: tc.function.name,
          args: tc.function.arguments,
        }));
        setToolCalls((prev) => [...prev, ...newToolCalls]);
      } else {
        const reply = msg?.content || msg?.reasoning_content || t('chat.no_reply');
        setMessages((prev) => [
          ...prev,
          { id: nextMessageId('assistant'), role: 'assistant', content: reply },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId('assistant'), role: 'assistant', content: t('chat.request_failed') },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  function onSend() {
    sendMessage(input);
  }

  function onMenuPress() {
    if (!isLargeScreen) {
      setDrawerOpen(true);
      return;
    }

    setSidebarVisible((current) => !current);
  }

  function renderHistorySidebar() {
    return (
      <View style={{ width: sidebarWidth }}>
        <Card className="h-full py-0 border-r rounded-none shadow-2xl border-border bg-card shadow-black/10">
          <CardHeader className="gap-3 px-4 pt-5 pb-3">
            <View className="flex-row items-center justify-between">
              <View className="gap-1">
                <CardTitle className="text-lg">{t('chat.history_title')}</CardTitle>
                <Text className="text-sm text-muted-foreground">
                  {t('chat.history_subtitle')}
                </Text>
              </View>

              {!isLargeScreen ? (
                <Button variant="ghost" size="icon" onPress={() => setDrawerOpen(false)}>
                  <Pencil size={18} color="currentColor" strokeWidth={2} />
                </Button>
              ) : null}
            </View>

            <Button
              className="justify-start"
              onPress={() => {
                setMessages([]);
                setActiveHistoryId('current');
                if (!isLargeScreen) {
                  setDrawerOpen(false);
                }
              }}>
              <Plus size={16} color="currentColor" strokeWidth={2.3} />
              <Text>{t('chat.new_chat')}</Text>
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
                      if (!isLargeScreen) {
                        setDrawerOpen(false);
                      }
                    }}>
                    <View className="flex-row items-start gap-3">
                      <View
                        className={cn(
                          'mt-0.5 h-8 w-8 items-center justify-center rounded-lg',
                          active ? 'bg-primary' : 'bg-muted'
                        )}>
                        <Clock3
                          size={15}
                          color={active ? tint.primaryForeground : 'currentColor'}
                          strokeWidth={2}
                        />
                      </View>

                      <View className="flex-1 gap-1">
                        <Text className="text-sm font-medium" numberOfLines={1}>
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
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-background">
      <Stack.Screen
        options={{
          ...SCREEN_OPTIONS,
          headerShown: isLargeScreen,
          title: t('chat.title'),
          headerShadowVisible: true,
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={onMenuPress}>
              <Menu size={18} color="currentColor" strokeWidth={2} />
            </Button>
          ),
        }}
      />

      <View className="flex-row flex-1 bg-background">
        {isLargeScreen && sidebarVisible ? renderHistorySidebar() : null}

        <View className="flex-1 bg-background">
          {!isLargeScreen ? (
            <View
              className="flex-row items-center justify-between pt-2 pb-3"
              style={{ paddingHorizontal: contentPadding }}>
              <Button variant="ghost" size="icon" onPress={onMenuPress}>
                <Menu size={18} color="currentColor" strokeWidth={2} />
              </Button>

              <View className="items-center gap-0.5">
                <Text className="text-xs font-medium text-muted-foreground">{t('chat.workspace')}</Text>
                <Text
                  className={cn(
                    'font-semibold tracking-tight',
                    isCompact ? 'text-base' : 'text-lg'
                  )}>
                  {t('chat.title')}
                </Text>
              </View>

              <Button variant="ghost" size="icon">
                <Pencil size={18} color="currentColor" strokeWidth={2} />
              </Button>
            </View>
          ) : null}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            className="flex-1"
            contentContainerClassName={cn(
              messages.length ? 'gap-4 pt-2' : 'flex-grow items-center justify-center py-12'
            )}
            contentContainerStyle={{ paddingHorizontal: isLargeScreen ? 20 : contentPadding }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              if (item.role === 'tool') return null;
              const itemToolCalls = (item.tool_calls
                ?.map((tc) => toolCalls.find((t) => t.toolCallId === tc.id))
                .filter(Boolean) ?? []) as ToolCallUI[];

              return (
                <View className="gap-3">
                  <ChatBubble item={item} maxWidth={bubbleMaxWidth} />
                  {itemToolCalls.map((tc) => (
                    <ToolCallBubble
                      key={tc.toolCallId}
                      toolCall={tc}
                      maxWidth={bubbleMaxWidth}
                      onResult={handleToolResult}
                    />
                  ))}
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="items-center w-full max-w-sm gap-5">
                <View className="items-center justify-center w-16 h-16 rounded-full bg-primary">
                  <Sparkles size={24} color={tint.primaryForeground} strokeWidth={2.3} />
                </View>
                <View className="items-center gap-2">
                  <Text className="text-2xl font-semibold tracking-tight">{t('chat.start_title')}</Text>
                  <Text className="px-6 text-center text-muted-foreground">
                    {t('chat.start_subtitle')}
                  </Text>
                </View>
              </View>
            }
            ListFooterComponent={
              <View className="pt-1">
                {isGenerating ? (
                  <Card
                    style={{ maxWidth: bubbleMaxWidth }}
                    className="py-0 shadow-sm border-border bg-card shadow-black/5">
                    <CardContent className="gap-2 px-4 py-3">
                      <Text className="text-xs font-medium uppercase tracking-[0.8px] text-muted-foreground">
                        {t('chat.assistant')}
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
            <View
              className="bg-background"
              style={{ paddingHorizontal: isLargeScreen ? 20 : contentPadding }}>
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
                      className="py-0 shadow-sm border-border bg-card shadow-black/5">
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

              <Card className="py-0 shadow-sm border-border bg-card shadow-black/5">
                <CardHeader className="flex-row items-center justify-between px-4 pt-4 pb-2">
                  <CardTitle className={cn(isCompact ? 'text-sm' : 'text-base')}>
                    {t('chat.composer_title')}
                  </CardTitle>
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {isGenerating ? t('chat.generating') : t('chat.ready')}
                  </Text>
                </CardHeader>

                <Separator />

                <CardContent className="gap-3 px-4 py-3">
                  <View className="flex-row items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Plus size={16} color="currentColor" strokeWidth={2.3} />
                    </Button>

                    <Input
                      className="flex-1 h-11"
                      placeholder={t('chat.message_placeholder')}
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

                    <Text className="flex-1 pl-3 text-xs text-right text-muted-foreground" numberOfLines={1}>
                      {t('chat.send_hint')}
                    </Text>
                  </View>
                </CardContent>
              </Card>

              <View style={{ height: Math.max(insets.bottom, 10) }} />
            </View>
          </KeyboardStickyView>
        </View>

        {!isLargeScreen && drawerOpen ? (
          <View className="absolute inset-0 z-50 flex-row">
            {renderHistorySidebar()}
            <Pressable
              className="flex-1 bg-black/35"
              onPress={() => setDrawerOpen(false)}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
