import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ToolUIs } from '@/features/chat/tool-uis';
import { MIMO_MODELS, useAppRuntime } from '@/hooks/use-app-runtime';
import { t } from '@/lib/i18n';
import { ChatErrorBoundary } from '@/components/chat-error-boundary';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
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
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Copy as CopyIcon,
  FileText,
  Menu,
  MessageSquare,
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
import * as React from 'react';
import { Image, Platform, Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = { headerShown: false };

// ─── Thread List Sidebar ────────────────────────────────────────────────────

function Sidebar({
  width,
  isLargeScreen,
  onClose,
}: {
  width: number;
  isLargeScreen: boolean;
  onClose: () => void;
}) {
  return (
    <View style={{ width }} className="h-full border-r border-border bg-secondary/30">
      <ThreadListPrimitive.Root>
        <View className="gap-3 px-3 pt-4 pb-3">
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-sm font-semibold text-foreground">
              {t('chat.history_title')}
            </Text>
            {!isLargeScreen && (
              <Pressable hitSlop={8} onPress={onClose}>
                <X size={18} className="text-muted-foreground" />
              </Pressable>
            )}
          </View>

          <ThreadListPrimitive.New
            style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
            <View className="flex-row items-center justify-center h-9 gap-2 rounded-lg bg-primary">
              <Plus size={14} color="white" strokeWidth={2.4} />
              <Text className="text-xs font-medium text-primary-foreground">
                {t('chat.new_chat')}
              </Text>
            </View>
          </ThreadListPrimitive.New>
        </View>

        <View className="mx-3 h-px bg-border" />

        <ThreadListPrimitive.Items
          renderItem={() => <SidebarItem onSelected={isLargeScreen ? undefined : onClose} />}
          contentContainerStyle={{ padding: 8, gap: 2 }}
        />
      </ThreadListPrimitive.Root>
    </View>
  );
}

function SidebarItem({ onSelected }: { onSelected?: () => void }) {
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
            'flex-row items-center gap-2.5 rounded-lg px-2.5 py-2.5',
            isActive ? 'bg-accent' : 'active:bg-accent/50',
          )}>
          <MessageSquare
            size={14}
            className={isActive ? 'text-foreground' : 'text-muted-foreground'}
            strokeWidth={2}
          />
          <Text
            className={cn('flex-1 text-sm', isActive ? 'font-medium text-foreground' : 'text-foreground')}
            numberOfLines={1}>
            {title || t('chat.untitled_thread')}
          </Text>
          <ThreadListItemPrimitive.Delete>
            <View className="items-center justify-center w-6 h-6 rounded active:bg-destructive/10">
              <Trash2 size={12} className="text-muted-foreground" strokeWidth={2} />
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
}: {
  model: Option;
  onModelChange: (option: Option) => void;
  onMenuPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-2 py-2 bg-background">
      <Pressable
        hitSlop={8}
        onPress={onMenuPress}
        className="items-center justify-center w-10 h-10 rounded-xl active:bg-accent">
        <Menu size={20} className="text-foreground" strokeWidth={1.8} />
      </Pressable>

      <Select value={model} onValueChange={(v) => v && onModelChange(v)}>
        <SelectTrigger size="sm" className="min-w-[140px] border-0 bg-transparent">
          <SelectValue placeholder={t('chat.select_model')} />
        </SelectTrigger>
        <SelectContent side="bottom">
          {MIMO_MODELS.map((m) => (
            <SelectItem key={m.value} label={m.label} value={m.value} />
          ))}
        </SelectContent>
      </Select>

      <Pressable
        hitSlop={8}
        className="items-center justify-center w-10 h-10 rounded-xl active:bg-accent">
        <Pencil size={18} className="text-foreground" strokeWidth={1.8} />
      </Pressable>
    </View>
  );
}

// ─── Welcome / Empty ────────────────────────────────────────────────────────

function WelcomeScreen() {
  return (
    <View className="items-center w-full gap-6 px-5 py-20">
      <View className="items-center justify-center w-14 h-14 rounded-full bg-foreground">
        <Sparkles size={22} color="white" strokeWidth={2.2} />
      </View>
      <View className="items-center gap-2">
        <Text className="text-2xl font-semibold text-foreground">
          {t('chat.start_title')}
        </Text>
        <Text className="text-sm text-center text-muted-foreground leading-5">
          {t('chat.start_subtitle')}
        </Text>
      </View>
      <View className="w-full max-w-md gap-2.5 mt-3">
        {getSuggestions().map((s) => (
          <ThreadPrimitive.Suggestion
            key={s.id}
            prompt={s.title}
            send
            style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
            <View className="px-4 py-3.5 border rounded-2xl border-border bg-background active:bg-accent/50">
              <Text className="text-[15px] font-medium text-foreground">{s.title}</Text>
              <Text className="text-xs text-muted-foreground mt-1">{s.subtitle}</Text>
            </View>
          </ThreadPrimitive.Suggestion>
        ))}
      </View>
    </View>
  );
}

function getSuggestions() {
  return [
    { id: 'schema', title: t('chat.suggestions.schema_title'), subtitle: t('chat.suggestions.schema_subtitle') },
    { id: 'turbulence', title: t('chat.suggestions.turbulence_title'), subtitle: t('chat.suggestions.turbulence_subtitle') },
    { id: 'release', title: t('chat.suggestions.release_title'), subtitle: t('chat.suggestions.release_subtitle') },
  ];
}

// ─── Message Part Renderers ─────────────────────────────────────────────────

function TextPart({ text }: { text: string }) {
  if (!text) return null;
  return <Text className="text-[15px] leading-7 text-foreground">{text}</Text>;
}

function ReasoningPart({ text }: { text: string }) {
  if (!text) return null;
  return (
    <View className="px-3 py-2 mt-1.5 rounded-lg bg-muted/50 border border-border">
      <Text className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
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
      style={{ width: 220, height: 160, borderRadius: 10, marginTop: 6 }}
      resizeMode="cover"
    />
  );
}

function FilePart({ name }: { name?: string }) {
  return (
    <View className="flex-row items-center gap-2 px-3 py-2 mt-1 rounded-lg bg-muted/40 border border-border">
      <FileText size={14} className="text-muted-foreground" strokeWidth={2} />
      <Text className="text-xs text-foreground" numberOfLines={1}>{name ?? 'file'}</Text>
    </View>
  );
}

// ─── User Message ───────────────────────────────────────────────────────────

function UserAttachment() {
  return (
    <View className="flex-row items-center gap-2 px-2 py-1 mt-1 rounded-md bg-foreground/10">
      <AttachmentPrimitive.Thumb style={{ width: 20, height: 20, borderRadius: 4 }} />
      <AttachmentPrimitive.Name
        style={{ fontSize: 11, flexShrink: 1 }}
        numberOfLines={1}
        className="text-foreground"
      />
    </View>
  );
}

function UserMessage() {
  return (
    <>
      <ComposerPrimitive.If editing={false}>
        <View className="items-end w-full py-1.5">
          <View className="max-w-[80%] gap-1">
            <View className="px-4 py-3 rounded-2xl bg-muted">
              <MessagePrimitive.Parts
                components={{
                  Text: ({ text }) => (
                    <Text className="text-[15px] leading-6 text-foreground">{text}</Text>
                  ),
                }}
              />
              <MessagePrimitive.Attachments components={{ Attachment: UserAttachment }} />
            </View>
            <View className="flex-row items-center justify-end gap-0.5">
              <BranchPicker />
              <ActionBarPrimitive.Edit
                style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
                <View className="px-1.5 py-1 rounded active:bg-accent">
                  <Pencil size={12} className="text-muted-foreground" strokeWidth={2} />
                </View>
              </ActionBarPrimitive.Edit>
            </View>
          </View>
        </View>
      </ComposerPrimitive.If>

      <ComposerPrimitive.If editing>
        <View className="items-end w-full py-1">
          <View style={{ width: '90%' }}>
            <ComposerPrimitive.Root>
              <View className="gap-2 p-3 border rounded-2xl border-border bg-muted/30">
                <ComposerInput
                  autoFocus
                  className="text-foreground min-h-[60px] w-full rounded-lg bg-background px-3 py-2 text-sm"
                  placeholder={t('chat.message_short_placeholder')}
                />
                <View className="flex-row justify-end gap-2">
                  <ComposerPrimitive.Cancel>
                    <View className="px-3 py-1.5 rounded-lg border border-border active:bg-accent">
                      <Text className="text-xs font-medium text-foreground">{t('chat.actions.cancel')}</Text>
                    </View>
                  </ComposerPrimitive.Cancel>
                  <ComposerPrimitive.Send>
                    <View className="px-3 py-1.5 rounded-lg bg-primary active:opacity-85">
                      <Text className="text-xs font-medium text-primary-foreground">{t('chat.actions.save')}</Text>
                    </View>
                  </ComposerPrimitive.Send>
                </View>
              </View>
            </ComposerPrimitive.Root>
          </View>
        </View>
      </ComposerPrimitive.If>
    </>
  );
}

// ─── Assistant Message ──────────────────────────────────────────────────────

function LoadingIndicator() {
  return (
    <View className="flex-row items-center gap-2 py-2">
      <Skeleton className="h-3 w-16 rounded-full" />
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="h-3 w-10 rounded-full" />
    </View>
  );
}

function AssistantMessage() {
  return (
    <View className="w-full py-2">
      <View className="pr-8">
        <MessagePrimitive.Parts
          components={{
            Text: ({ text }) => <TextPart text={text} />,
            Reasoning: ({ text }) => <ReasoningPart text={text} />,
            Image: ({ image }) => <ImagePart image={image} />,
            File: ({ filename }) => <FilePart name={filename} />,
            Empty: LoadingIndicator,
          }}
        />
        <AssistantActions />
      </View>
    </View>
  );
}

function AssistantActions() {
  return (
    <View className="flex-row items-center gap-1 mt-2 pt-1">
      <ActionBarPrimitive.Copy
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
        {({ isCopied }) => (
          <View className="p-1.5 rounded active:bg-accent">
            <CopyIcon
              size={13}
              className={isCopied ? 'text-foreground' : 'text-muted-foreground'}
              strokeWidth={2}
            />
          </View>
        )}
      </ActionBarPrimitive.Copy>

      <ActionBarPrimitive.Reload
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
        <View className="p-1.5 rounded active:bg-accent">
          <RefreshCw size={13} className="text-muted-foreground" strokeWidth={2} />
        </View>
      </ActionBarPrimitive.Reload>

      <ActionBarPrimitive.FeedbackPositive
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
        {({ isSubmitted }) => (
          <View className={cn('p-1.5 rounded active:bg-accent', isSubmitted && 'bg-accent')}>
            <ThumbsUp size={13} className={isSubmitted ? 'text-foreground' : 'text-muted-foreground'} strokeWidth={2} />
          </View>
        )}
      </ActionBarPrimitive.FeedbackPositive>

      <ActionBarPrimitive.FeedbackNegative
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
        {({ isSubmitted }) => (
          <View className={cn('p-1.5 rounded active:bg-accent', isSubmitted && 'bg-accent')}>
            <ThumbsDown size={13} className={isSubmitted ? 'text-foreground' : 'text-muted-foreground'} strokeWidth={2} />
          </View>
        )}
      </ActionBarPrimitive.FeedbackNegative>

      <BranchPicker />
    </View>
  );
}

// ─── Branch Picker ──────────────────────────────────────────────────────────

function BranchPicker() {
  const branchCount = useAuiState((s) => s.message.branchCount);
  if (branchCount <= 1) return null;

  return (
    <View className="flex-row items-center gap-0.5 ml-1">
      <BranchPickerPrimitive.Previous
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
        <View className="p-1 rounded active:bg-accent">
          <ChevronLeft size={13} className="text-muted-foreground" strokeWidth={2} />
        </View>
      </BranchPickerPrimitive.Previous>

      <View className="flex-row items-center">
        <BranchPickerPrimitive.Number className="text-[11px] text-muted-foreground" />
        <Text className="text-[11px] text-muted-foreground">/</Text>
        <BranchPickerPrimitive.Count className="text-[11px] text-muted-foreground" />
      </View>

      <BranchPickerPrimitive.Next
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
        <View className="p-1 rounded active:bg-accent">
          <ChevronRight size={13} className="text-muted-foreground" strokeWidth={2} />
        </View>
      </BranchPickerPrimitive.Next>
    </View>
  );
}

// ─── Composer Attachments ───────────────────────────────────────────────────

function ComposerAttachmentChip() {
  return (
    <AttachmentPrimitive.Root>
      <View className="flex-row items-center gap-2 px-2 py-1.5 rounded-lg border border-border bg-muted">
        <AttachmentPrimitive.Thumb style={{ width: 24, height: 24, borderRadius: 4 }} />
        <AttachmentPrimitive.Name
          className="text-xs text-foreground"
          style={{ maxWidth: 120 }}
          numberOfLines={1}
        />
        <AttachmentPrimitive.Remove
          style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}>
          <View className="items-center justify-center w-4 h-4 rounded-full bg-foreground/10">
            <X size={8} className="text-muted-foreground" strokeWidth={3} />
          </View>
        </AttachmentPrimitive.Remove>
      </View>
    </AttachmentPrimitive.Root>
  );
}

// ─── Composer Input (uncontrolled, IME-safe) ───────────────────────────────

function ComposerInput({
  className,
  placeholder,
  autoFocus,
  ...rest
}: Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText'>) {
  const aui = useAui();
  const storeText = useAuiState((s) => s.composer.text);
  const inputRef = React.useRef<TextInput>(null);
  const initialTextRef = React.useRef(storeText);
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
      autoFocus={autoFocus}
      multiline
      textAlignVertical="top"
      className={className}
      {...rest}
    />
  );
}

// ─── Composer ───────────────────────────────────────────────────────────────

function Composer() {
  const insets = useSafeAreaInsets();
  const isRunning = useAuiState((s) => s.thread.isRunning);

  return (
    <View
      className="px-3 pt-2 bg-background"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      <ComposerPrimitive.Root>
        <View className="gap-2">
          <ComposerPrimitive.Attachments
            components={{ Attachment: ComposerAttachmentChip }}
          />
          <View className="flex-row items-end gap-2">
            <ComposerPrimitive.AddAttachment
              style={({ pressed }: any) => ({ opacity: pressed ? 0.6 : 1 })}>
              <View className="items-center justify-center w-9 h-9 rounded-full border border-border active:bg-accent">
                <Plus size={18} className="text-muted-foreground" strokeWidth={2} />
              </View>
            </ComposerPrimitive.AddAttachment>

            <View className="flex-1 flex-row items-end rounded-3xl border border-border bg-muted/30 px-4 py-1">
              <ComposerInput
                placeholder={t('chat.message_placeholder')}
                className="text-foreground flex-1 min-h-[36px] max-h-[120px] text-[15px] py-1.5"
              />
              {isRunning ? (
                <ComposerPrimitive.Cancel
                  style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
                  <View className="items-center justify-center w-8 h-8 mb-0.5 rounded-full bg-foreground">
                    <Square size={12} color="white" strokeWidth={2.4} fill="white" />
                  </View>
                </ComposerPrimitive.Cancel>
              ) : (
                <ComposerPrimitive.Send
                  style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
                  <View className="items-center justify-center w-8 h-8 mb-0.5 rounded-full bg-foreground">
                    <Send size={14} color="white" strokeWidth={2.4} />
                  </View>
                </ComposerPrimitive.Send>
              )}
            </View>
          </View>
        </View>
      </ComposerPrimitive.Root>
    </View>
  );
}

// ─── Typing Footer ──────────────────────────────────────────────────────────

function RunningFooter() {
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const lastRole = useAuiState((s) => {
    const msgs = s.thread.messages;
    return msgs.length ? msgs[msgs.length - 1].role : undefined;
  });

  if (!isRunning || lastRole === 'assistant') return null;
  return (
    <View className="py-1">
      <LoadingIndicator />
    </View>
  );
}

// ─── Thread ─────────────────────────────────────────────────────────────────

function ChatThread() {
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const { flatListRef, showScrollButton, scrollToBottom, scrollProps } = useAutoScroll(isRunning);

  return (
    <ThreadPrimitive.Root style={{ flex: 1 }}>
      <ThreadPrimitive.Messages
        {...({ ref: flatListRef } as any)}
        components={{
          UserMessage,
          AssistantMessage,
        }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
        ListEmptyComponent={
          <ThreadPrimitive.Empty>
            <WelcomeScreen />
          </ThreadPrimitive.Empty>
        }
        ListFooterComponent={<RunningFooter />}
      />
      {showScrollButton && (
        <Pressable
          onPress={scrollToBottom}
          className="absolute items-center justify-center bg-foreground rounded-full shadow-md"
          style={{ width: 36, height: 36, alignSelf: 'center', bottom: 12, left: '50%', marginLeft: -18, elevation: 4 }}>
          <ArrowDown size={18} color="white" strokeWidth={2.2} />
        </Pressable>
      )}
    </ThreadPrimitive.Root>
  );
}

// ─── Screen Layout ──────────────────────────────────────────────────────────

function ChatScreenInner({
  model,
  onModelChange,
}: {
  model: Option;
  onModelChange: (option: Option) => void;
}) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const sidebarWidth = isLargeScreen
    ? Math.min(Math.max(width * 0.25, 260), 320)
    : Math.min(Math.max(width * 0.75, 260), 320);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = React.useState(true);

  React.useEffect(() => {
    if (!isLargeScreen) {
      setDrawerOpen(false);
      setSidebarVisible(true);
    }
  }, [isLargeScreen]);

  const onMenuPress = React.useCallback(() => {
    if (!isLargeScreen) {
      setDrawerOpen(true);
    } else {
      setSidebarVisible((v) => !v);
    }
  }, [isLargeScreen]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-row flex-1">
        {isLargeScreen && sidebarVisible && (
          <Sidebar width={sidebarWidth} isLargeScreen onClose={() => setSidebarVisible(false)} />
        )}

        <View className="flex-1">
          <ChatHeader model={model} onModelChange={onModelChange} onMenuPress={onMenuPress} />
          <ChatThread />
          <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
            <Composer />
          </KeyboardStickyView>
        </View>

        {!isLargeScreen && drawerOpen && (
          <View className="absolute inset-0 z-50 flex-row">
            <Sidebar
              width={sidebarWidth}
              isLargeScreen={false}
              onClose={() => setDrawerOpen(false)}
            />
            <Pressable className="flex-1 bg-black/40" onPress={() => setDrawerOpen(false)} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Root ───────────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const [resetKey, setResetKey] = React.useState(0);
  return (
    <ChatErrorBoundary onReset={() => setResetKey((k) => k + 1)}>
      <ChatScreenRoot key={resetKey} />
    </ChatErrorBoundary>
  );
}

function ChatScreenRoot() {
  const [model, setModel] = React.useState<Option>({
    label: 'MiMo-V2.5-Pro',
    value: 'mimo-v2.5-pro',
  });
  const runtime = useAppRuntime(model?.value ?? 'mimo-v2.5-pro');

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ToolUIs />
      <ChatScreenInner model={model} onModelChange={setModel} />
    </AssistantRuntimeProvider>
  );
}
