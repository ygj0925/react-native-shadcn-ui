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
import { cn } from '@/lib/utils';
import { Check, ChevronRight, ListChecks, MousePointerClick } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="mx-3 my-1.5 rounded-xl border border-border bg-card p-3.5 shadow-sm">
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
    <View className="flex-row items-center gap-2 mb-3">
      <View className="h-6 w-6 items-center justify-center rounded-full bg-muted border border-border">
        {icon}
      </View>
      <Text className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
        {eyebrow}
      </Text>
      <View className="w-px h-2.5 bg-border" />
      <Text className="flex-1 text-[13px] font-semibold text-foreground tracking-tight" numberOfLines={1}>
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
      className={cn(
        'flex-1 h-[30px] rounded-full items-center justify-center px-3.5',
        isPrimary
          ? disabled
            ? 'bg-muted-foreground/40'
            : 'bg-foreground'
          : 'bg-background border border-input',
        'active:opacity-80'
      )}>
      <Text
        className={cn(
          'text-xs font-semibold tracking-tight',
          isPrimary ? 'text-primary-foreground' : 'text-foreground'
        )}>
        {label}
      </Text>
    </Pressable>
  );
}

function ResultBanner({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-2 py-1.5 px-2.5 rounded-full bg-muted border border-border">
      <View className="h-4 w-4 items-center justify-center rounded-full bg-foreground">
        <Check size={9} color="hsl(var(--primary-foreground))" strokeWidth={3.2} />
      </View>
      <Text className="flex-1 text-xs font-medium text-foreground" numberOfLines={1}>
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
    if (!args) return null;

    if (result) {
      return (
        <ToolCard>
          <ToolHeader
            icon={<MousePointerClick size={12} className="text-foreground" strokeWidth={2.2} />}
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
        icon={<MousePointerClick size={12} className="text-foreground" strokeWidth={2.2} />}
        eyebrow="单选"
        title={args.title}
      />

      <View className="mb-3">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="rounded-full border-input bg-background h-8 px-3">
            <SelectValue placeholder="请选择..." />
          </SelectTrigger>
          <SelectContent side="bottom">
            {(args.options ?? []).map((opt) => (
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
    if (!args) return null;

    if (result) {
      return (
        <ToolCard>
          <ToolHeader
            icon={<ChevronRight size={12} className="text-foreground" strokeWidth={2.6} />}
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
          icon={<ChevronRight size={12} className="text-foreground" strokeWidth={2.6} />}
          eyebrow="确认"
          title={args.title}
        />

        <Text className="text-xs leading-[18px] text-muted-foreground mb-3.5">
          {args.message}
        </Text>

        <View className="flex-row gap-2">
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
    if (!args) return null;

    if (result) {
      const labels = (args.options ?? [])
        .filter((opt) => result.values.includes(opt.value))
        .map((opt) => opt.label);
      return (
        <ToolCard>
          <ToolHeader
            icon={<ListChecks size={12} className="text-foreground" strokeWidth={2.2} />}
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
        icon={<ListChecks size={12} className="text-foreground" strokeWidth={2.2} />}
        eyebrow="多选"
        title={args.title}
      />

      <View className="gap-1 mb-3">
        {(args.options ?? []).map((opt) => {
          const checked = selected.has(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => toggle(opt.value)}
              hitSlop={4}
              className={cn(
                'flex-row items-center gap-2 py-1.5 px-2.5 rounded-lg border active:opacity-80',
                checked ? 'bg-muted border-foreground' : 'bg-background border-border'
              )}>
              <View
                className={cn(
                  'h-3.5 w-3.5 items-center justify-center rounded border',
                  checked ? 'bg-foreground border-foreground' : 'bg-background border-input'
                )}>
                {checked ? (
                  <Check size={9} color="hsl(var(--primary-foreground))" strokeWidth={3.2} />
                ) : null}
              </View>
              <Text
                className={cn(
                  'flex-1 text-xs text-foreground',
                  checked ? 'font-semibold' : 'font-medium'
                )}>
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
