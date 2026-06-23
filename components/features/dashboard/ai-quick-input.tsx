import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Sparkles, Send } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useColorScheme } from 'nativewind';

type AIQuickInputProps = {
  onSend: (text: string) => void;
  suggestions?: string[];
};

const DEFAULT_SUGGESTIONS = [
  '帮我规划今天的时间',
  '总结一下最近的笔记',
  '提醒我下午开会',
];

export function AIQuickInput({ onSend, suggestions = DEFAULT_SUGGESTIONS }: AIQuickInputProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [text, setText] = React.useState('');

  const handleSend = React.useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }, [text, onSend]);

  return (
    <View className="gap-3">
      <View
        className={cn(
          'flex-row items-center gap-2 px-3 py-2 rounded-2xl border',
          'bg-card border-border'
        )}>
        <Sparkles size={18} className="text-primary ml-1" />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="问问 AI 助手..."
          placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
          className="flex-1 text-[15px] text-foreground py-2"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim()}
          className={cn(
            'h-8 w-8 items-center justify-center rounded-full',
            text.trim() ? 'bg-primary' : 'bg-muted'
          )}>
          <Send size={14} className={text.trim() ? 'text-primary-foreground' : 'text-muted-foreground'} />
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => onSend(suggestion)}
            className="px-3 py-1.5 rounded-full bg-muted border border-border active:bg-accent">
            <Text className="text-xs text-muted-foreground">{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
