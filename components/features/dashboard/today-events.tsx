import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/store/calendar';
import { CalendarDays, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function isPastEvent(event: CalendarEvent): boolean {
  return new Date(event.endTime).getTime() < Date.now();
}

type TodayEventsProps = {
  events: CalendarEvent[];
  onPress: (event: CalendarEvent) => void;
  onSeeAll: () => void;
};

export function TodayEvents({ events, onPress, onSeeAll }: TodayEventsProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between px-4 py-4">
        <View className="gap-0.5">
          <CardTitle className="text-[15px]">今日日程</CardTitle>
          <Text className="text-xs text-muted-foreground">
            {events.length === 0 ? '今天没有安排' : `${events.length} 个事件`}
          </Text>
        </View>
        <Pressable
          onPress={onSeeAll}
          className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-muted active:bg-accent">
          <Text className="text-xs text-muted-foreground">查看全部</Text>
          <ChevronRight size={14} className="text-muted-foreground" />
        </Pressable>
      </CardHeader>
      <CardContent className="px-4 pb-4 gap-3">
        {events.length === 0 ? (
          <View className="py-4 items-center gap-2">
            <CalendarDays size={24} className="text-muted-foreground/50" />
            <Text className="text-sm text-muted-foreground">今天还没有日程</Text>
          </View>
        ) : (
          events.map((event) => {
            const past = isPastEvent(event);
            return (
              <Pressable
                key={event.id}
                onPress={() => onPress(event)}
                className="flex-row items-center gap-3 py-1 active:opacity-70">
                <View className="w-14 items-center">
                  <Text className={cn('text-[13px] font-medium', past ? 'text-muted-foreground' : 'text-foreground')}>
                    {event.isAllDay ? '全天' : formatTime(event.startTime)}
                  </Text>
                  {!event.isAllDay && (
                    <Text className="text-[10px] text-muted-foreground">{formatTime(event.endTime)}</Text>
                  )}
                </View>
                <View className="flex-1 gap-0.5">
                  <Text
                    className={cn(
                      'text-[14px] leading-5',
                      past ? 'text-muted-foreground line-through' : 'text-foreground'
                    )}>
                    {event.title || '未命名日程'}
                  </Text>
                  {event.location ? (
                    <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                      {event.location}
                    </Text>
                  ) : null}
                </View>
                <View
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                />
              </Pressable>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
