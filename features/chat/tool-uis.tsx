import { makeAssistantToolUI } from '@assistant-ui/react-native';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Check, ChevronRight, ListChecks, MousePointerClick } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

const COLORS = {
  surface: '#ffffff',
  canvas: '#f0f0f3',
  borderLavender: '#e0e1e6',
  inputBorder: '#d9d9e0',
  nearBlack: '#1c2024',
  slate: '#60646c',
  silver: '#b0b4ba',
  black: '#000000',
  white: '#ffffff',
  midSlate: '#555860',
};

const whisperShadow =
  Platform.OS === 'web'
    ? ({
        boxShadow:
          'rgba(0,0,0,0.08) 0px 3px 6px, rgba(0,0,0,0.07) 0px 2px 4px',
      } as any)
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      };

function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={[
        {
          marginHorizontal: 12,
          marginVertical: 6,
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.borderLavender,
          padding: 14,
        },
        whisperShadow,
      ]}>
      {children}
    </View>
  );
}

function ToolHeader({
  icon,
  eyebrow,
  title,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 9999,
          backgroundColor: COLORS.canvas,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: COLORS.borderLavender,
        }}>
        {icon}
      </View>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '600',
          color: COLORS.silver,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}>
        {eyebrow}
      </Text>
      <View style={{ width: 1, height: 10, backgroundColor: COLORS.borderLavender }} />
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: '600',
          color: COLORS.nearBlack,
          letterSpacing: -0.1,
        }}
        numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

function PillButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
}) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => ({
        flex: 1,
        height: 30,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        backgroundColor: isPrimary
          ? disabled
            ? COLORS.silver
            : COLORS.black
          : COLORS.white,
        borderWidth: isPrimary ? 0 : 1,
        borderColor: COLORS.inputBorder,
        opacity: pressed ? 0.85 : 1,
      })}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: isPrimary ? COLORS.white : COLORS.nearBlack,
          letterSpacing: -0.1,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ResultBanner({ label }: { label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 9999,
        backgroundColor: COLORS.canvas,
        borderWidth: 1,
        borderColor: COLORS.borderLavender,
      }}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 9999,
          backgroundColor: COLORS.black,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Check size={9} color={COLORS.white} strokeWidth={3.2} />
      </View>
      <Text
        style={{ flex: 1, fontSize: 12, fontWeight: '500', color: COLORS.nearBlack }}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

type SelectArgs = {
  title: string;
  options: { label: string; value: string }[];
};

type SelectResult = {
  value: string;
  label: string;
};

export const SelectToolUI = makeAssistantToolUI<SelectArgs, SelectResult>({
  toolName: 'show_select',
  render: ({ args, result, addResult }) => {
    if (result) {
      return (
        <ToolCard>
          <ToolHeader
            icon={<MousePointerClick size={12} color={COLORS.nearBlack} strokeWidth={2.2} />}
            eyebrow="单选"
            title={args.title}
          />
          <ResultBanner label={`已选择 · ${result.label || result.value}`} />
        </ToolCard>
      );
    }

    return <SelectToolInput args={args} addResult={addResult} />;
  },
});

function SelectToolInput({
  args,
  addResult,
}: {
  args: SelectArgs;
  addResult: (result: SelectResult) => void;
}) {
  const [selected, setSelected] = useState<Option | undefined>();

  return (
    <ToolCard>
      <ToolHeader
        icon={<MousePointerClick size={12} color={COLORS.nearBlack} strokeWidth={2.2} />}
        eyebrow="单选"
        title={args.title}
      />

      <View style={{ marginBottom: 12 }}>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger
            style={{
              borderRadius: 9999,
              borderColor: COLORS.inputBorder,
              backgroundColor: COLORS.white,
              height: 32,
              paddingHorizontal: 12,
            }}>
            <SelectValue placeholder="请选择..." />
          </SelectTrigger>
          <SelectContent side="bottom">
            {args.options.map((opt) => (
              <SelectItem key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </SelectContent>
        </Select>
      </View>

      <PillButton
        label="确认"
        disabled={!selected}
        onPress={() => {
          if (selected) addResult({ value: selected.value, label: selected.label });
        }}
      />
    </ToolCard>
  );
}

type ConfirmArgs = {
  title: string;
  message: string;
};

type ConfirmResult = {
  confirmed: boolean;
};

export const ConfirmToolUI = makeAssistantToolUI<ConfirmArgs, ConfirmResult>({
  toolName: 'show_confirm',
  render: ({ args, result, addResult }) => {
    if (result) {
      return (
        <ToolCard>
          <ToolHeader
            icon={<ChevronRight size={12} color={COLORS.nearBlack} strokeWidth={2.6} />}
            eyebrow="确认"
            title={args.title}
          />
          <ResultBanner label={result.confirmed ? '已确认操作' : '已取消操作'} />
        </ToolCard>
      );
    }

    return (
      <ToolCard>
        <ToolHeader
          icon={<ChevronRight size={12} color={COLORS.nearBlack} strokeWidth={2.6} />}
          eyebrow="确认"
          title={args.title}
        />

        <Text
          style={{
            fontSize: 12,
            lineHeight: 18,
            color: COLORS.slate,
            marginBottom: 14,
          }}>
          {args.message}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <PillButton
            label="取消"
            variant="outline"
            onPress={() => addResult({ confirmed: false })}
          />
          <PillButton label="确认" onPress={() => addResult({ confirmed: true })} />
        </View>
      </ToolCard>
    );
  },
});

type MultiSelectArgs = {
  title: string;
  options: { label: string; value: string }[];
};

type MultiSelectResult = {
  values: string[];
};

export const MultiSelectToolUI = makeAssistantToolUI<MultiSelectArgs, MultiSelectResult>({
  toolName: 'show_multi_select',
  render: ({ args, result, addResult }) => {
    if (result) {
      const labels = args.options
        .filter((opt) => result.values.includes(opt.value))
        .map((opt) => opt.label);
      return (
        <ToolCard>
          <ToolHeader
            icon={<ListChecks size={12} color={COLORS.nearBlack} strokeWidth={2.2} />}
            eyebrow="多选"
            title={args.title}
          />
          <ResultBanner label={`已选择 · ${labels.join('、')}`} />
        </ToolCard>
      );
    }

    return <MultiSelectToolInput args={args} addResult={addResult} />;
  },
});

function MultiSelectToolInput({
  args,
  addResult,
}: {
  args: MultiSelectArgs;
  addResult: (result: MultiSelectResult) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  return (
    <ToolCard>
      <ToolHeader
        icon={<ListChecks size={12} color={COLORS.nearBlack} strokeWidth={2.2} />}
        eyebrow="多选"
        title={args.title}
      />

      <View style={{ gap: 4, marginBottom: 12 }}>
        {args.options.map((opt) => {
          const checked = selected.has(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => toggle(opt.value)}
              hitSlop={4}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
                backgroundColor: checked ? COLORS.canvas : COLORS.white,
                borderWidth: 1,
                borderColor: checked ? COLORS.nearBlack : COLORS.borderLavender,
                opacity: pressed ? 0.85 : 1,
              })}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: checked ? COLORS.black : COLORS.white,
                  borderWidth: 1.2,
                  borderColor: checked ? COLORS.black : COLORS.inputBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {checked ? <Check size={9} color={COLORS.white} strokeWidth={3.2} /> : null}
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: checked ? '600' : '500',
                  color: COLORS.nearBlack,
                }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PillButton
        label={selected.size > 0 ? `提交 · ${selected.size} 项` : '提交'}
        disabled={selected.size === 0}
        onPress={() => addResult({ values: Array.from(selected) })}
      />
    </ToolCard>
  );
}

export function ToolUIs() {
  return (
    <>
      <SelectToolUI />
      <ConfirmToolUI />
      <MultiSelectToolUI />
    </>
  );
}
