import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { GlassView } from '@/components/ui/glass-view';
import { ToolUIs } from '@/features/chat/tool-uis';
import { ToolResultCard } from '@/components/features/ai/tool-result-card';
import { useAppRuntime } from '@/hooks/use-app-runtime';
import { AI_MODELS, DEFAULT_MODEL } from '@/lib/ai/engine';
import { useSettingsStore } from '@/lib/store/settings';
import { t } from '@/lib/i18n';
import { ChatErrorBoundary } from '@/components/chat-error-boundary';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useChatPersistence } from '@/hooks/use-chat-persistence';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { cn } from '@/lib/utils';
import {
  ActionBarPrimitive,
  AssistantRuntimeProvider,
  AttachmentPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
} from '@assistant-ui/react-native';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import {
  ArrowDown,
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
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
  WifiOff,
  X,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <BlurView
      intensity={isDark ? 40 : 30}
      tint={isDark ? 'dark' : 'light'}
      style={{ width, overflow: 'hidden' }}
    >
      <View
        style={{ width }}
        className={cn(
          'h-full border-r',
          isDark ? 'bg-background/80 border-white/8' : 'bg-background/85 border-black/5'
        )}
      >
        <ThreadListPrimitive.Root>
          <View className="gap-4 px-4 pt-5 pb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-foreground tracking-wide">
                {t('chat.history_title')}
              </Text>
              {!isLargeScreen && (
                <Pressable hitSlop={10} onPress={onClose} className="p-1">
                  <X size={18} className="text-muted-foreground" />
                </Pressable>
              )}
            </View>

            <ThreadListPrimitive.New
              style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
              <View className="flex-row items-center justify-center h-10 gap-2 rounded-xl bg-primary shadow-sm shadow-primary/20">
                <Plus size={15} color="white" strokeWidth={2.2} />
                <Text className="text-xs font-semibold text-primary-foreground">
                  {t('chat.new_chat')}
                </Text>
              </View>
            </ThreadListPrimitive.New>
          </View>

          <View className="mx-4 h-px bg-border/40" />

          <ThreadListPrimitive.Items
            renderItem={() => <SidebarItem onSelected={isLargeScreen ? undefined : onClose} />}
            contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 6, gap: 3 }}
          />
        </ThreadListPrimitive.Root>
      </View>
    </BlurView>
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
            'flex-row items-center gap-3 rounded-xl px-3 py-3',
            isActive ? 'bg-accent' : 'active:bg-accent/50',
          )}>
          <MessageSquare
            size={15}
            className={isActive ? 'text-primary' : 'text-muted-foreground'}
            strokeWidth={1.8}
          />
          <Text
            className={cn('flex-1 text-[14px]', isActive ? 'font-semibold text-foreground' : 'text-foreground/80')}
            numberOfLines={1}>
            {title || t('chat.untitled_thread')}
          </Text>
          <ThreadListItemPrimitive.Delete>
            <View className="items-center justify-center w-7 h-7 rounded-lg active:bg-destructive/10">
              <Trash2 size={13} className="text-muted-foreground/60" strokeWidth={1.8} />
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <BlurView
      intensity={isDark ? 40 : 30}
      tint={isDark ? 'dark' : 'light'}
      className="border-b border-border/40"
    >
      <View className={cn('flex-row items-center justify-between px-5 py-3.5', isDark ? 'bg-background/60' : 'bg-background/70')}>
        <Pressable
          hitSlop={10}
          onPress={onMenuPress}
          className="items-center justify-center w-10 h-10 rounded-xl active:bg-accent"
        >
          <Menu size={20} className="text-foreground" strokeWidth={1.8} />
        </Pressable>

        <Select value={model} onValueChange={(v) => v && onModelChange(v)}>
          <SelectTrigger size="sm" className="min-w-[140px] border-0 bg-transparent">
            <SelectValue placeholder={t('chat.select_model')} />
          </SelectTrigger>
          <SelectContent side="bottom">
            {AI_MODELS.map((m) => (
              <SelectItem key={m.value} label={m.label} value={m.value} />
            ))}
          </SelectContent>
        </Select>

        <Pressable
          hitSlop={10}
          className="items-center justify-center w-10 h-10 rounded-xl active:bg-accent"
        >
          <Pencil size={18} className="text-foreground" strokeWidth={1.8} />
        </Pressable>
      </View>
    </BlurView>
  );
}

// ─── Welcome / Empty ────────────────────────────────────────────────────────

function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  if (isConnected !== false) return null;

  return (
    <View className="flex-row items-center justify-center gap-2 px-4 py-2 bg-destructive/10">
      <WifiOff size={14} className="text-destructive" strokeWidth={2} />
      <Text className="text-xs font-medium text-destructive">
        {t('chat.offline_notice')}
      </Text>
    </View>
  );
}

function SuggestionCard({ title, subtitle }: { title: string; subtitle: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const aui = useAui();
  const { checkAndConsume } = useFeatureGate('ai_chat');

  const handlePress = () => {
    if (!checkAndConsume({ title: 'AI 对话次数已达上限', description: '升级到 Pro 获得无限 AI 对话。' })) {
      return;
    }
    aui.composer().setText(title);
    aui.composer().send();
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View className={cn(
        'px-5 py-4 border rounded-2xl active:bg-accent/50',
        isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white/80'
      )}>
        <Text className="text-[15px] font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted-foreground mt-1.5 leading-4">{subtitle}</Text>
      </View>
    </Pressable>
  );
}

function WelcomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="items-center w-full gap-8 px-6 py-24">
      <View className={cn(
        'items-center justify-center w-20 h-20 rounded-3xl shadow-lg',
        isDark ? 'bg-primary/20 shadow-primary/10' : 'bg-primary/10 shadow-primary/5'
      )}>
        <Sparkles size={32} className="text-primary" strokeWidth={1.8} />
      </View>
      <View className="items-center gap-3">
        <Text className="text-[26px] font-bold text-foreground tracking-tight">
          {t('chat.start_title')}
        </Text>
        <Text className="text-[15px] text-center text-muted-foreground leading-6 max-w-xs">
          {t('chat.start_subtitle')}
        </Text>
      </View>
      <View className="w-full max-w-md gap-3 mt-2">
        {getSuggestions().map((s) => (
          <SuggestionCard key={s.id} title={s.title} subtitle={s.subtitle} />
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

const TextPart = React.memo(function TextPart({ text }: { text: string }) {
  if (!text) return null;
  return <Text selectable className="text-[15px] leading-7 text-foreground">{text}</Text>;
});

function ReasoningPart({ text, status }: { text: string; status: { type: string } }) {
  const [expanded, setExpanded] = React.useState(false);
  const isThinking = status?.type === 'running';
  const wasThinkingRef = React.useRef(isThinking);

  React.useEffect(() => {
    if (wasThinkingRef.current && !isThinking && text) {
      setExpanded(true);
    }
    wasThinkingRef.current = isThinking;
  }, [isThinking, text]);

  return (
    <Pressable onPress={() => setExpanded((v) => !v)} className="mt-1.5 mb-1">
      <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
        <Brain size={13} className="text-muted-foreground" strokeWidth={2} />
        <Text className="flex-1 text-xs font-medium text-muted-foreground">
          {isThinking ? t('chat.thinking') + '...' : t('chat.thinking')}
        </Text>
        {isThinking && <PulsingDot />}
        {!isThinking && (
          expanded
            ? <ChevronUp size={13} className="text-muted-foreground" strokeWidth={2} />
            : <ChevronDown size={13} className="text-muted-foreground" strokeWidth={2} />
        )}
      </View>
      {(expanded || isThinking) && !!text && (
        <View className="px-3 pt-2 pb-1">
          <Text selectable className="text-xs leading-5 text-muted-foreground">{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

const PulsingDot = React.memo(function PulsingDot() {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.set(
      withRepeat(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1, // infinite
        true, // reverse
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  return (
    <Animated.View
      style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#888' }, animatedStyle]}
    />
  );
});

const ImagePart = React.memo(function ImagePart({ image }: { image: string }) {
  return (
    <Image
      source={{ uri: image }}
      style={{ width: 220, height: 160, borderRadius: 10, marginTop: 6 }}
      contentFit="cover"
      transition={200}
    />
  );
});

const FilePart = React.memo(function FilePart({ name }: { name?: string }) {
  return (
    <View className="flex-row items-center gap-2 px-3 py-2 mt-1 rounded-lg bg-muted/40 border border-border">
      <FileText size={14} className="text-muted-foreground" strokeWidth={2} />
      <Text className="text-xs text-foreground" numberOfLines={1}>{name ?? 'file'}</Text>
    </View>
  );
});

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
        <View className="items-end w-full py-2">
          <View className="max-w-[82%] gap-1.5">
            <View className="px-4 py-3 rounded-2xl bg-muted/80 border border-border/30">
              <MessagePrimitive.Parts
                components={{
                  Text: ({ text }) => (
                    <Text selectable className="text-[15px] leading-6 text-foreground">{text}</Text>
                  ),
                }}
              />
              <MessagePrimitive.Attachments components={{ Attachment: UserAttachment }} />
            </View>
            <View className="flex-row items-center justify-end gap-1">
              <BranchPicker />
              <ActionBarPrimitive.Edit
                style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <View className="px-1.5 py-1 rounded-lg active:bg-accent">
                  <Pencil size={12} className="text-muted-foreground" strokeWidth={2} />
                </View>
              </ActionBarPrimitive.Edit>
            </View>
          </View>
        </View>
      </ComposerPrimitive.If>

      <ComposerPrimitive.If editing>
        <View className="items-end w-full py-2">
          <View style={{ width: '90%' }}>
            <ComposerPrimitive.Root>
              <View className="gap-3 p-4 border rounded-2xl border-border/50 bg-muted/30">
                <ComposerInput
                  autoFocus
                  className="text-foreground min-h-[60px] w-full rounded-xl bg-background px-4 py-3 text-[15px]"
                  placeholder={t('chat.message_short_placeholder')}
                />
                <View className="flex-row justify-end gap-2.5">
                  <ComposerPrimitive.Cancel>
                    <View className="px-4 py-2 rounded-xl border border-border active:bg-accent">
                      <Text className="text-xs font-medium text-foreground">{t('chat.actions.cancel')}</Text>
                    </View>
                  </ComposerPrimitive.Cancel>
                  <ComposerPrimitive.Send>
                    <View className="px-4 py-2 rounded-xl bg-primary active:opacity-85">
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

function PulsingLoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.2);

  React.useEffect(() => {
    opacity.set(
      withDelay(
        delay,
        withRepeat(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        )
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  return (
    <Animated.View
      style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#999' }, animatedStyle]}
    />
  );
}

const LoadingIndicator = React.memo(function LoadingIndicator() {
  return (
    <View className="flex-row items-center gap-1.5 py-3">
      <PulsingLoadingDot delay={0} />
      <PulsingLoadingDot delay={200} />
      <PulsingLoadingDot delay={400} />
    </View>
  );
});

function AssistantMessage() {
  return (
    <View className="w-full py-2.5">
      <View className="pr-10">
        <MessagePrimitive.Parts
          components={{
            Text: ({ text }) => <TextPart text={text} />,
            Reasoning: ({ text, status }) => <ReasoningPart text={text} status={status} />,
            Image: ({ image }) => <ImagePart image={image} />,
            File: ({ filename }) => <FilePart name={filename} />,
            Empty: LoadingIndicator,
            tools: { Fallback: ToolResultCard },
          }}
        />
        <ErrorPrimitive.Root
          className="mt-3 flex-row items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3"
        >
          <AlertTriangle size={15} className="text-destructive mt-0.5" strokeWidth={2} />
          <View className="flex-1 gap-2">
            <ErrorPrimitive.Message className="text-sm leading-5 text-destructive" />
            <ActionBarPrimitive.Reload
              style={({ pressed }: any) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View className="self-start flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10">
                <RefreshCw size={12} className="text-destructive" strokeWidth={2} />
                <Text className="text-xs font-medium text-destructive">
                  {t('chat.actions.retry')}
                </Text>
              </View>
            </ActionBarPrimitive.Reload>
          </View>
        </ErrorPrimitive.Root>
        <MessagePrimitive.If running={false}>
          <AssistantActions />
        </MessagePrimitive.If>
      </View>
    </View>
  );
}

function AssistantActions() {
  return (
    <View className="flex-row items-center gap-1.5 mt-2.5 pt-1">
      <ActionBarPrimitive.Copy
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}
      >
        {({ isCopied }) => (
          <View className="p-2 rounded-lg active:bg-accent">
            <CopyIcon
              size={14}
              className={isCopied ? 'text-foreground' : 'text-muted-foreground'}
              strokeWidth={2}
            />
          </View>
        )}
      </ActionBarPrimitive.Copy>

      <ActionBarPrimitive.Reload
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}
      >
        <View className="p-2 rounded-lg active:bg-accent">
          <RefreshCw size={14} className="text-muted-foreground" strokeWidth={2} />
        </View>
      </ActionBarPrimitive.Reload>

      <ActionBarPrimitive.FeedbackPositive
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}
      >
        {({ isSubmitted }) => (
          <View className={cn('p-2 rounded-lg active:bg-accent', isSubmitted && 'bg-accent')}>
            <ThumbsUp size={14} className={isSubmitted ? 'text-foreground' : 'text-muted-foreground'} strokeWidth={2} />
          </View>
        )}
      </ActionBarPrimitive.FeedbackPositive>

      <ActionBarPrimitive.FeedbackNegative
        style={({ pressed }: any) => ({ opacity: pressed ? 0.5 : 1 })}
      >
        {({ isSubmitted }) => (
          <View className={cn('p-2 rounded-lg active:bg-accent', isSubmitted && 'bg-accent')}>
            <ThumbsDown size={14} className={isSubmitted ? 'text-foreground' : 'text-muted-foreground'} strokeWidth={2} />
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
  onFocus: onFocusProp,
  onBlur: onBlurProp,
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
      const node = inputRef.current;
      if (!node) return;
      if (node.setNativeProps) {
        node.setNativeProps({ text: storeText });
      } else if (Platform.OS === 'web') {
        // Web fallback: directly set the DOM value
        const el = node as unknown as { _node?: HTMLTextAreaElement };
        const dom = el._node ?? (node as any);
        if (dom && 'value' in dom) {
          (dom as HTMLTextAreaElement).value = storeText;
        }
      }
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
      onFocus={onFocusProp}
      onBlur={onBlurProp}
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

function SendButton() {
  const aui = useAui();
  const { checkAndConsume } = useFeatureGate('ai_chat');

  const handlePress = () => {
    if (!checkAndConsume({ title: 'AI 对话次数已达上限', description: '升级到 Pro 获得无限 AI 对话。' })) {
      return;
    }
    aui.composer().send();
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      className="items-center justify-center w-9 h-9 mb-0.5 rounded-full bg-primary shadow-sm shadow-primary/20 active:opacity-85">
      <Send size={15} color="white" strokeWidth={2.2} />
    </Pressable>
  );
}

function Composer() {
  const insets = useSafeAreaInsets();
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const [isFocused, setIsFocused] = React.useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <BlurView
      intensity={isDark ? 40 : 30}
      tint={isDark ? 'dark' : 'light'}
      className="border-t border-border/40"
    >
      <View
        className={cn('px-4 pt-3', isDark ? 'bg-background/60' : 'bg-background/70')}
        style={{ paddingBottom: Math.max(insets.bottom, 10) }}
      >
        <ComposerPrimitive.Root>
          <View className="gap-3">
            <ComposerPrimitive.Attachments
              components={{ Attachment: ComposerAttachmentChip }}
            />
            <View className="flex-row items-end gap-3">
              <ComposerPrimitive.AddAttachment
                style={({ pressed }: any) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <View className={cn(
                  'items-center justify-center w-10 h-10 rounded-full border active:bg-accent',
                  isDark ? 'border-white/12' : 'border-black/8'
                )}>
                  <Plus size={18} className="text-muted-foreground" strokeWidth={2} />
                </View>
              </ComposerPrimitive.AddAttachment>

              <View
                className={cn(
                  'flex-1 flex-row items-end rounded-2xl px-4 py-2',
                  isFocused
                    ? isDark
                      ? 'border border-white/12 bg-background/80'
                      : 'border border-black/8 bg-background'
                    : isDark
                      ? 'bg-white/6 border border-white/5'
                      : 'bg-black/4 border border-transparent',
                )}
              >
                <ComposerInput
                  placeholder={t('chat.message_placeholder')}
                  className="text-foreground flex-1 min-h-[38px] max-h-[120px] text-[15px] py-2"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                {isRunning ? (
                  <ComposerPrimitive.Cancel
                    style={({ pressed }: any) => ({ opacity: pressed ? 0.85 : 1 })}
                  >
                    <View className={cn(
                      'items-center justify-center w-9 h-9 mb-0.5 rounded-full',
                      isDark ? 'bg-white/90' : 'bg-foreground'
                    )}>
                      <Square size={13} color={isDark ? '#000' : '#fff'} strokeWidth={2.2} fill={isDark ? '#000' : '#fff'} />
                    </View>
                  </ComposerPrimitive.Cancel>
                ) : (
                  <SendButton />
                )}
              </View>
            </View>
          </View>
        </ComposerPrimitive.Root>
      </View>
    </BlurView>
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThreadPrimitive.Root style={{ flex: 1 }}>
      <ThreadPrimitive.Messages
        {...({ ref: flatListRef } as any)}
        components={{
          UserMessage,
          AssistantMessage,
        }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 10 }}
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
          className={cn(
            'absolute items-center justify-center rounded-full shadow-lg',
            isDark ? 'bg-white/90' : 'bg-foreground'
          )}
          style={{ width: 38, height: 38, alignSelf: 'center', bottom: 14, left: '50%', marginLeft: -19, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
        >
          <ArrowDown size={18} color={isDark ? '#000' : '#fff'} strokeWidth={2} />
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
  useChatPersistence(model?.value ?? DEFAULT_MODEL);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const sidebarWidth = isLargeScreen
    ? Math.min(Math.max(width * 0.25, 260), 320)
    : Math.min(Math.max(width * 0.75, 260), 320);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const { PaywallComponent } = useFeatureGate('ai_chat');

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
          <OfflineBanner />
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
            <Pressable className="flex-1 bg-black/50 backdrop-blur-sm" onPress={() => setDrawerOpen(false)} />
          </View>
        )}

        <PaywallComponent compact />
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
  const persistedModel = useSettingsStore((s) => s.aiModel);
  const [model, setModel] = React.useState<Option>(() => {
    const found = AI_MODELS.find((m) => m.value === persistedModel);
    return {
      label: found?.label ?? AI_MODELS[0].label,
      value: found?.value ?? AI_MODELS[0].value,
    };
  });

  React.useEffect(() => {
    const found = AI_MODELS.find((m) => m.value === persistedModel);
    if (found && found.value !== model?.value) {
      setModel({ label: found.label, value: found.value });
    }
  }, [persistedModel, model?.value]);

  const runtime = useAppRuntime(model?.value ?? DEFAULT_MODEL);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ToolUIs />
      <ChatScreenInner model={model} onModelChange={setModel} />
    </AssistantRuntimeProvider>
  );
}
