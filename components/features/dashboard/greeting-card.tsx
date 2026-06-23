import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getStaticGreeting, generateAIGreeting } from '@/lib/ai/dashboard';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';

type GreetingCardProps = {
  userName: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    todayEvents: number;
    habitsDue: number;
    habitsDone: number;
  };
};

export function GreetingCard({ userName, stats }: GreetingCardProps) {
  const [greeting, setGreeting] = React.useState(() => getStaticGreeting(userName));
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = React.useCallback(async () => {
    setIsGenerating(true);
    try {
      const aiGreeting = await generateAIGreeting();
      setGreeting(aiGreeting || getStaticGreeting(userName));
    } finally {
      setIsGenerating(false);
    }
  }, [userName]);

  const progressText = React.useMemo(() => {
    if (stats.totalTasks === 0 && stats.todayEvents === 0 && stats.habitsDue === 0) {
      return '今天还没有安排，休息一下也不错。';
    }
    const parts: string[] = [];
    if (stats.totalTasks > 0) {
      parts.push(`待办 ${stats.completedTasks}/${stats.totalTasks}`);
    }
    if (stats.todayEvents > 0) {
      parts.push(`日程 ${stats.todayEvents} 个`);
    }
    if (stats.habitsDue > 0) {
      parts.push(`习惯 ${stats.habitsDone}/${stats.habitsDue}`);
    }
    return `今日进度：${parts.join(' · ')}`;
  }, [stats]);

  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-0">
        <View
          className={cn(
            'px-5 py-6 gap-4',
            'bg-gradient-to-br from-primary via-primary/90 to-primary/70'
          )}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-[13px] font-medium text-white/80">{progressText}</Text>
              <Text
                className={cn(
                  'text-[22px] font-bold text-white leading-tight',
                  isGenerating && 'opacity-60'
                )}>
                {greeting}
              </Text>
            </View>
            <Pressable
              onPress={handleGenerate}
              disabled={isGenerating}
              className={cn(
                'h-9 w-9 items-center justify-center rounded-full',
                'bg-white/15 border border-white/20 active:bg-white/25'
              )}>
              <Sparkles
                size={16}
                className={cn('text-white', isGenerating && 'opacity-50')}
              />
            </Pressable>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
