import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ToolUIs } from '@/features/chat/tool-uis';
import { MIMO_MODELS, useAppRuntime } from '@/hooks/use-app-runtime';
import { t } from '@/lib/i18n';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import {
  ActionBarPrimitive,
  AssistantRuntimeProvider,
  AttachmentPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
} from '@assistant-ui/react-native';
import { Stack } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Copy as CopyIcon,
  FileText,
  Menu,
  MessageSquarePlus,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { FlatList, Image, Platform, Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = { headerShown: false };

// ─── Suggestions ────────────────────────────────────────────────────────────

function getSuggestions() {
  return [
    {
      id: 'schema',
      title: t('chat.suggestions.schema_title'),
      subtitle: t('chat.suggestions.schema_subtitle'),
    },
    {
      id: 'turbulence',
      title: t('chat.suggestions.turbulence_title'),
      subtitle: t('chat.suggestions.turbulence_subtitle'),
    },
    {
      id: 'release',
      title: t('chat.suggestions.release_title'),
      subtitle: t('chat.suggestions.release_subtitle'),
    },
  ];
}

// ─── Thread List / History Sidebar ──────────────────────────────────────────

function HistorySidebar({
  width,
  isLargeScreen,
  onClose,
}: {
  width: number;
  isLargeScreen: boolean;
  onClose: () => void;
}) {
  return (
    <View style={{ width }}>
      <Card className="h-full py-0 border-r rounded-none shadow-2xl border-border bg-card shadow-black/10">
        <ThreadListPrimitive.Root>
          <CardHeader className="gap-3 px-4 pt-5 pb-3">
            <View className="flex-row items-center justify-between">
              <View className="gap-1">
                <CardTitle className="text-lg">{t('chat.history_title')}</CardTitle>
                <Text className="text-sm text-muted-foreground">
                  {t('chat.history_subtitle')}
                </Text>
              </View>
              {!isLargeScreen ? (
                <Button variant="ghost" size="icon" onPress={onClose}>
                  <X size={18} color="currentColor" strokeWidth={2} />
                </Button>
              ) : null}
            </View>

            <ThreadListPrimitive.New
              style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
              <View className="flex-row items-center justify-center h-10 gap-2 rounded-md bg-primary">
                <Plus size={16} color="white" strokeWidth={2.4} />
                <Text className="text-sm font-medium text-primary-foreground">
                  {t('chat.new_chat')}
                </Text>
              </View>
            </ThreadListPrimitive.New>
          </CardHeader>

          <Separator />

          <ThreadListPrimitive.Items
            renderItem={() => (
              <HistorySidebarItem onSelected={isLargeScreen ? undefined : onClose} />
            )}
            contentContainerStyle={{ padding: 12, gap: 8 }}
          />
        </ThreadListPrimitive.Root>
      </Card>
    </View>
  );
}

function HistorySidebarItem({ onSelected }: { onSelected?: () => void }) {
  const itemId = useAuiState((s) => s.threadListItem?.id);
  const mainId = useAuiState((s) => s.threads.mainThreadId);
  const title = useAuiState((s) => s.threadListItem?.title);
  const isActive = !!itemId && itemId === mainId;

  return (
    <ThreadListItemPrimitive.Root>
      <ThreadListItemPrimitive.Trigger
        onPressIn={onSelected}
        style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
        <View
          className={cn(
            'rounded-xl border px-3 py-3 flex-row items-center gap-3',
            isActive
              ? 'border-primary bg-primary/10'
              : 'border-border bg-background active:bg-accent',
          )}>
          <View
            className={cn(
              'h-8 w-8 items-center justify-center rounded-lg',
              isActive ? 'bg-primary' : 'bg-muted',
            )}>
            <MessageSquarePlus
              size={15}
              color={isActive ? 'white' : 'currentColor'}
              strokeWidth={2}
            />
          </View>

          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-medium" numberOfLines={1}>
              {title || t('chat.untitled_thread')}
            </Text>
          </View>

          <ThreadListItemPrimitive.Delete>
            <View className="items-center justify-center w-8 h-8 rounded-md active:bg-destructive/10">
              <Trash2 size={14} color="currentColor" strokeWidth={2} />
            </View>
          </ThreadListItemPrimitive.Delete>
        </View>
      </ThreadListItemPrimitive.Trigger>
    </ThreadListItemPrimitive.Root>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────

function ChatHeader({
  model,
  onModelChange,
  onMenuPress,
  isLargeScreen,
}: {
  model: Option;
  onModelChange: (option: Option) => void;
  onMenuPress: () => void;
  isLargeScreen: boolean;
}) {
  return (
    <View
      className="flex-row items-center justify-between gap-3 px-4 py-2 border-b border-border bg-background"
      style={{ paddingTop: 10 }}>
      <View className="flex-row items-center gap-2">
        <Button variant="ghost" size="icon" onPress={onMenuPress}>
          <Menu size={18} color="currentColor" strokeWidth={2} />
        </Button>
        {!isLargeScreen ? (
          <Text className="text-base font-semibold">{t('chat.title')}</Text>
        ) : null}
      </View>

      <Select value={model} onValueChange={(v) => v && onModelChange(v)}>
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

// ─── Welcome / Empty State ───────────────────────────────────────────────────

function WelcomeScreen() {
  const suggestions = getSuggestions();
  const tint = THEME[useColorScheme().colorScheme ?? 'light'];

  return (
    <View className="items-center w-full gap-6 py-12">
      <View className="items-center justify-center w-16 h-16 rounded-full bg-primary">
        <Sparkles size={24} color={tint.primaryForeground} strokeWidth={2.3} />
      </View>
      <View className="items-center gap-2">
        <Text className="text-2xl font-semibold tracking-tight">
          {t('chat.start_title')}
        </Text>
        <Text className="px-6 text-center text-muted-foreground">
          {t('chat.start_subtitle')}
        </Text>
      </View>

      <View className="w-full max-w-xl gap-3 px-4">
        {suggestions.map((s) => (
          <ThreadPrimitive.Suggestion
            key={s.id}
            prompt={s.title}
            send
            style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
            <Card className="py-0 border-border bg-card">
              <CardContent className="gap-1 px-4 py-3">
                <Text className="text-sm font-semibold leading-5">{s.title}</Text>
                <Text className="text-xs leading-4 text-muted-foreground">
                  {s.subtitle}
                </Text>
              </CardContent>
            </Card>
          </ThreadPrimitive.Suggestion>
        ))}
      </View>
    </View>
  );
}

// ─── Message Part Renderers ──────────────────────────────────────────────────

function TextPart({ text }: { text: string }) {
  if (!text) return null;
  return <Text className="leading-6 text-foreground">{text}</Text>;
}

function ReasoningPart({ text }: { text: string }) {
  if (!text) return null;
  return (
    <View className="px-3 py-2 mt-1 rounded-lg bg-muted/60">
      <Text className="text-[11px] uppercase tracking-[0.6px] text-muted-foreground">
        {t('chat.thinking')}
      </Text>
      <Text className="mt-1 text-xs leading-5 text-muted-foreground">{text}</Text>
    </View>
  );
}

function ImagePart({ image }: { image: string }) {
  return (
    <Image
      source={{ uri: image }}
      style={{ width: 220, height: 160, borderRadius: 8, marginTop: 6 }}
      resizeMode="cover"
    />
  );
}

function FilePart({ name }: { name?: string }) {
  return (
    <View className="flex-row items-center gap-2 px-3 py-2 mt-1 border rounded-lg border-border bg-muted/40">
      <FileText size={14} color="currentColor" strokeWidth={2} />
      <Text className="text-xs text-foreground" numberOfLines={1}>
        {name ?? 'file'}
      </Text>
    </View>
  );
}

// ─── Message Components ──────────────────────────────────────────────────────

function AssistantInProgress() {
  return (
    <View className="flex-row items-center gap-2 py-1">
      <View className="h-2.5 w-2.5 rounded-full bg-foreground" />
      <View className="h-2.5 w-2.5 rounded-full bg-foreground/45" />
      <View className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
    </View>
  );
}

function BranchPicker() {
  // Only render when there are multiple branches
  const branchCount = useAuiState((s) => s.message.branchCount);
  if (branchCount <= 1) return null;

  return (
    <View className="flex-row items-center gap-0.5">
      <BranchPickerPrimitive.Previous
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
        <View className="items-center justify-center w-6 h-6 rounded-md active:bg-accent">
          <ChevronLeft size={14} color="currentColor" strokeWidth={2} />
        </View>
      </BranchPickerPrimitive.Previous>

      <View className="flex-row items-center px-1">
        <BranchPickerPrimitive.Number className="text-[11px] text-muted-foreground" />
        <Text className="text-[11px] text-muted-foreground">/</Text>
        <BranchPickerPrimitive.Count className="text-[11px] text-muted-foreground" />
      </View>

      <BranchPickerPrimitive.Next
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
        <View className="items-center justify-center w-6 h-6 rounded-md active:bg-accent">
          <ChevronRight size={14} color="currentColor" strokeWidth={2} />
        </View>
      </BranchPickerPrimitive.Next>
    </View>
  );
}

function UserAttachment() {
  return (
    <View className="flex-row items-center gap-2 px-2 py-1.5 mt-1 rounded-md bg-primary-foreground/10">
      <AttachmentPrimitive.Thumb style={{ width: 24, height: 24, borderRadius: 4 }} />
      <AttachmentPrimitive.Name
        style={{ color: 'white', fontSize: 12, flexShrink: 1 }}
        numberOfLines={1}
      />
    </View>
  );
}

// Combined user message: shows read view or edit composer based on editing state.
// Uses ComposerPrimitive.If (checking s.composer.isEditing) — MessagePrimitive.If
// does not support the editing prop in @assistant-ui/react-native.
function UserMessageItem() {
  const bubbleMaxWidth = useBubbleMaxWidth();

  return (
    <>
      {/* Normal (read) view — hidden while editing */}
      <ComposerPrimitive.If editing={false}>
        <View className="items-end w-full px-3 py-2">
          <View style={{ maxWidth: bubbleMaxWidth }} className="gap-1">
            <Card className="py-0 border bg-primary border-primary">
              <CardContent className="gap-2 px-4 py-3">
                <MessagePrimitive.Parts
                  components={{
                    Text: ({ text }) => (
                      <Text className="text-primary-foreground leading-6">{text}</Text>
                    ),
                  }}
                />
                <MessagePrimitive.Attachments
                  components={{ Attachment: UserAttachment }}
                />
              </CardContent>
            </Card>

            <View className="flex-row items-center justify-end gap-1">
              <BranchPicker />
              <ActionBarPrimitive.Edit
                style={({ pressed }: any) => ({ opacity: pressed ? 0.6 : 1 })}>
                <View className="flex-row items-center gap-1 px-2 py-1 rounded-md active:bg-accent">
                  <Pencil size={12} color="currentColor" strokeWidth={2} />
                  <Text className="text-[11px] text-muted-foreground">
                    {t('chat.actions.edit')}
                  </Text>
                </View>
              </ActionBarPrimitive.Edit>
            </View>
          </View>
        </View>
      </ComposerPrimitive.If>

      {/* Edit composer — visible while editing */}
      <ComposerPrimitive.If editing>
        <View className="items-end w-full px-3 py-2">
          <View style={{ width: '92%' }}>
            <ComposerPrimitive.Root>
              <Card className="py-0 border-border bg-card">
                <CardContent className="gap-2 px-3 py-3">
                  <NativeComposerInput
                    multiline
                    autoFocus
                    className="min-h-[48px] text-foreground"
                    placeholder={t('chat.message_short_placeholder')}
                  />
                  <View className="flex-row justify-end gap-2">
                    <ComposerPrimitive.Cancel>
                      <View className="px-3 py-1.5 rounded-md border border-border active:bg-accent">
                        <Text className="text-xs font-medium">
                          {t('chat.actions.cancel')}
                        </Text>
                      </View>
                    </ComposerPrimitive.Cancel>
                    <ComposerPrimitive.Send>
                      <View className="px-3 py-1.5 rounded-md bg-primary active:opacity-85">
                        <Text className="text-xs font-medium text-primary-foreground">
                          {t('chat.actions.save')}
                        </Text>
                      </View>
                    </ComposerPrimitive.Send>
                  </View>
                </CardContent>
              </Card>
            </ComposerPrimitive.Root>
          </View>
        </View>
      </ComposerPrimitive.If>
    </>
  );
}

function AssistantMessage() {
  const bubbleMaxWidth = useBubbleMaxWidth();

  return (
    <View className="items-start w-full px-3 py-2">
      <View style={{ maxWidth: bubbleMaxWidth }} className="gap-1">
        <Card className="py-0 border-border bg-card">
          <CardContent className="gap-1 px-4 py-3">
            <Text className="text-xs font-medium uppercase tracking-[0.8px] text-muted-foreground">
              {t('chat.assistant')}
            </Text>
            <MessagePrimitive.Parts
              components={{
                Text: ({ text }) => <TextPart text={text} />,
                Reasoning: ({ text }) => <ReasoningPart text={text} />,
                Image: ({ image }) => <ImagePart image={image} />,
                File: ({ filename }) => <FilePart name={filename} />,
                Empty: AssistantInProgress,
              }}
            />
          </CardContent>
        </Card>

        <View className="flex-row items-center gap-1">
          <ActionBarPrimitive.Copy
            style={({ pressed }: any) => ({ opacity: pressed ? 0.6 : 1 })}>
            {({ isCopied }) => (
              <View className="flex-row items-center gap-1 px-2 py-1 rounded-md active:bg-accent">
                <CopyIcon size={12} color="currentColor" strokeWidth={2} />
                <Text className="text-[11px] text-muted-foreground">
                  {isCopied ? t('chat.actions.copied') : t('chat.actions.copy')}
                </Text>
              </View>
            )}
          </ActionBarPrimitive.Copy>

          <ActionBarPrimitive.Reload
            style={({ pressed }: any) => ({ opacity: pressed ? 0.6 : 1 })}>
            <View className="flex-row items-center gap-1 px-2 py-1 rounded-md active:bg-accent">
              <RefreshCw size={12} color="currentColor" strokeWidth={2} />
              <Text className="text-[11px] text-muted-foreground">
                {t('chat.actions.regenerate')}
              </Text>
            </View>
          </ActionBarPrimitive.Reload>

          <ActionBarPrimitive.FeedbackPositive
            style={({ pressed }: any) => ({ opacity: pressed ? 0.6 : 1 })}>
            {({ isSubmitted }) => (
              <View
                className={cn(
                  'flex-row items-center gap-1 px-2 py-1 rounded-md active:bg-accent',
                  isSubmitted && 'bg-accent',
                )}>
                <ThumbsUp size={12} color="currentColor" strokeWidth={2} />
              </View>
            )}
          </ActionBarPrimitive.FeedbackPositive>

          <ActionBarPrimitive.FeedbackNegative
            style={({ pressed }: any) => ({ opacity: pressed ? 0.6 : 1 })}>
            {({ isSubmitted }) => (
              <View
                className={cn(
                  'flex-row items-center gap-1 px-2 py-1 rounded-md active:bg-accent',
                  isSubmitted && 'bg-accent',
                )}>
                <ThumbsDown size={12} color="currentColor" strokeWidth={2} />
              </View>
            )}
          </ActionBarPrimitive.FeedbackNegative>

          <BranchPicker />
        </View>
      </View>
    </View>
  );
}

// ─── Attachment Chips ────────────────────────────────────────────────────────

function ComposerAttachmentChip() {
  return (
    <AttachmentPrimitive.Root>
      <View className="flex-row items-center gap-2 px-2 py-1.5 border rounded-md border-border bg-muted">
        <AttachmentPrimitive.Thumb style={{ width: 28, height: 28, borderRadius: 4 }} />
        <AttachmentPrimitive.Name
          className="text-xs text-foreground"
          style={{ maxWidth: 140 }}
          numberOfLines={1}
        />
        <AttachmentPrimitive.Remove
          style={({ pressed }: any) => ({ opacity: pressed ? 0.6 : 1 })}>
          <View className="items-center justify-center w-5 h-5 rounded-full bg-foreground/10">
            <X size={10} color="currentColor" strokeWidth={2.5} />
          </View>
        </AttachmentPrimitive.Remove>
      </View>
    </AttachmentPrimitive.Root>
  );
}

// ─── Composer ────────────────────────────────────────────────────────────────

// Uncontrolled TextInput wrapper that avoids the controlled-input / Chinese IME
// conflict. Uses defaultValue for the initial text (handles the edit-composer
// case where the store starts with existing message text), then syncs via
// setNativeProps when the store text changes externally (e.g. after send → "").
function NativeComposerInput({
  placeholder,
  className,
  style,
  multiline,
  ...rest
}: {
  placeholder?: string;
  className?: string;
  style?: any;
  multiline?: boolean;
  [key: string]: any;
}) {
  const aui = useAui();
  const storeText = useAuiState((s) => s.composer.text);
  const inputRef = React.useRef<TextInput>(null);
  // Snapshot on first render — used as defaultValue so the native input
  // starts with the correct text (empty for the main composer, existing
  // message text for the edit composer).
  const initialTextRef = React.useRef(storeText);
  // Track what we last pushed into the store so we can skip spurious
  // setNativeProps calls for changes we originated ourselves.
  const lastTextRef = React.useRef(storeText);

  React.useEffect(() => {
    if (storeText !== lastTextRef.current) {
      lastTextRef.current = storeText;
      inputRef.current?.setNativeProps?.({ text: storeText });
    }
  }, [storeText]);

  const handleChangeText = React.useCallback(
    (value: string) => {
      lastTextRef.current = value;
      aui.composer().setText(value);
    },
    [aui],
  );

  // On web, Enter (without Shift) submits the message.
  const handleKeyPress = React.useCallback(
    (e: any) => {
      if (Platform.OS !== 'web') return;
      const { key, shiftKey } = e.nativeEvent as { key: string; shiftKey: boolean };
      if (key === 'Enter' && !shiftKey) {
        e.preventDefault?.();
        aui.composer().send();
      }
    },
    [aui],
  );

  return (
    <TextInput
      ref={inputRef}
      defaultValue={initialTextRef.current}
      onChangeText={handleChangeText}
      onKeyPress={handleKeyPress}
      placeholder={placeholder}
      className={className}
      style={style}
      multiline={multiline}
      {...rest}
    />
  );
}

function SendOrCancelButton() {
  const isRunning = useAuiState((s) => s.thread.isRunning);

  if (isRunning) {
    return (
      <ComposerPrimitive.Cancel
        style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
        <View className="items-center justify-center rounded-full h-9 w-9 bg-destructive">
          <Square size={14} color="white" strokeWidth={2.4} fill="white" />
        </View>
      </ComposerPrimitive.Cancel>
    );
  }

  return (
    <ComposerPrimitive.Send
      style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View className="items-center justify-center rounded-full h-9 w-9 bg-primary">
        <Send size={14} color="white" strokeWidth={2.4} />
      </View>
    </ComposerPrimitive.Send>
  );
}

function ComposerBar() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="px-3 pt-2 border-t bg-background border-border"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      <ComposerPrimitive.Root>
        <View className="gap-2">
          <ComposerPrimitive.Attachments
            components={{ Attachment: ComposerAttachmentChip }}
          />

          <View className="flex-row items-end gap-2">
            <ComposerPrimitive.AddAttachment
              style={({ pressed }: any) => ({ opacity: pressed ? 0.6 : 1 })}>
              <View className="items-center justify-center border rounded-full h-9 w-9 border-border bg-background active:bg-accent">
                <Paperclip size={16} color="currentColor" strokeWidth={2} />
              </View>
            </ComposerPrimitive.AddAttachment>

            <View className="flex-1 px-3 py-1.5 border rounded-2xl border-border bg-background">
              <NativeComposerInput
                multiline
                placeholder={t('chat.message_placeholder')}
                className="min-h-[36px] max-h-[120px] text-foreground"
              />
            </View>

            <SendOrCancelButton />
          </View>
        </View>
      </ComposerPrimitive.Root>
    </View>
  );
}

// ─── Thread ──────────────────────────────────────────────────────────────────

const BubbleWidthCtx = React.createContext(320);
function useBubbleMaxWidth() {
  return React.useContext(BubbleWidthCtx);
}

// Shows a typing indicator at the bottom of the list when the AI is generating
// a response but the first assistant token hasn't arrived yet.
function RunningFooter({ bubbleMaxWidth }: { bubbleMaxWidth: number }) {
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const lastMessageRole = useAuiState((s) => {
    const msgs = s.thread.messages;
    return msgs.length ? msgs[msgs.length - 1].role : undefined;
  });

  if (!isRunning || lastMessageRole === 'assistant') return null;

  return (
    <View className="items-start w-full px-3 py-2">
      <View style={{ maxWidth: bubbleMaxWidth }}>
        <Card className="py-0 border-border bg-card">
          <CardContent className="gap-2 px-4 py-3">
            <Text className="text-xs font-medium uppercase tracking-[0.8px] text-muted-foreground">
              {t('chat.assistant')}
            </Text>
            <AssistantInProgress />
          </CardContent>
        </Card>
      </View>
    </View>
  );
}

function ChatThread({
  bubbleMaxWidth,
  isLargeScreen,
  contentPadding,
}: {
  bubbleMaxWidth: number;
  isLargeScreen: boolean;
  contentPadding: number;
}) {
  const flatListRef = React.useRef<FlatList>(null);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const isAtBottomRef = React.useRef(true);
  const isRunningRef = React.useRef(isRunning);
  isRunningRef.current = isRunning;

  const handleScroll = React.useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - contentOffset.y - layoutMeasurement.height;
    isAtBottomRef.current = distanceFromBottom < 80;
  }, []);

  const handleContentSizeChange = React.useCallback(() => {
    if (isAtBottomRef.current || isRunningRef.current) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, []);

  React.useEffect(() => {
    if (isRunning) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [isRunning]);

  const footer = React.useMemo(
    () => <RunningFooter bubbleMaxWidth={bubbleMaxWidth} />,
    [bubbleMaxWidth],
  );

  return (
    <BubbleWidthCtx.Provider value={bubbleMaxWidth}>
      <ThreadPrimitive.Root style={{ flex: 1 }}>
        <ThreadPrimitive.Messages
          {...({ ref: flatListRef } as any)}
          components={{
            UserMessage: UserMessageItem,
            AssistantMessage,
          }}
          contentContainerStyle={{
            paddingHorizontal: isLargeScreen ? 8 : Math.max(0, contentPadding - 12),
            paddingVertical: 8,
            gap: 4,
          }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          ListEmptyComponent={
            <ThreadPrimitive.Empty>
              <WelcomeScreen />
            </ThreadPrimitive.Empty>
          }
          ListFooterComponent={footer}
        />
      </ThreadPrimitive.Root>
    </BubbleWidthCtx.Provider>
  );
}

// ─── Screen Layout ───────────────────────────────────────────────────────────

function ChatScreenInner({
  model,
  onModelChange,
}: {
  model: Option;
  onModelChange: (option: Option) => void;
}) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const isLargeScreen = width >= 768;
  const contentPadding = isCompact ? 12 : 16;
  const bubbleMaxWidth = Math.min(width - contentPadding * 2 - 12, width * 0.9);
  const sidebarWidth = isLargeScreen
    ? Math.min(Math.max(width * 0.28, 280), 340)
    : Math.min(Math.max(width * 0.78, 260), 340);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = React.useState(true);

  React.useEffect(() => {
    if (!isLargeScreen) {
      setDrawerOpen(false);
      setSidebarVisible(true);
    }
  }, [isLargeScreen]);

  function onMenuPress() {
    if (!isLargeScreen) {
      setDrawerOpen(true);
      return;
    }
    setSidebarVisible((v) => !v);
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen options={SCREEN_OPTIONS} />

      <View className="flex-row flex-1 bg-background">
        {isLargeScreen && sidebarVisible ? (
          <HistorySidebar
            width={sidebarWidth}
            isLargeScreen
            onClose={() => setSidebarVisible(false)}
          />
        ) : null}

        <View className="flex-1 bg-background">
          <ChatHeader
            model={model}
            onModelChange={onModelChange}
            onMenuPress={onMenuPress}
            isLargeScreen={isLargeScreen}
          />

          <ChatThread
            bubbleMaxWidth={bubbleMaxWidth}
            isLargeScreen={isLargeScreen}
            contentPadding={contentPadding}
          />

          <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
            <ComposerBar />
          </KeyboardStickyView>
        </View>

        {!isLargeScreen && drawerOpen ? (
          <View className="absolute inset-0 z-50 flex-row">
            <HistorySidebar
              width={sidebarWidth}
              isLargeScreen={false}
              onClose={() => setDrawerOpen(false)}
            />
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

// ─── Root ────────────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const [model, setModel] = React.useState<Option>({
    label: 'MiMo-V2.5-Pro',
    value: 'mimo-v2.5-pro',
  });

  // useAppRuntime creates the transport once (stable ref via prepareCall + ref),
  // so model switching never recreates the runtime or loses conversation history.
  const runtime = useAppRuntime(model?.value ?? 'mimo-v2.5-pro');

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ToolUIs />
      <ChatScreenInner model={model} onModelChange={setModel} />
    </AssistantRuntimeProvider>
  );
}
