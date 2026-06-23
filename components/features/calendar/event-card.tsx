import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/store/calendar';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MapPin, Pencil, Trash2 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type EventCardProps = {
  event: CalendarEvent;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function EventCard({ event, onPress, onEdit, onDelete }: EventCardProps) {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const timeRange = event.isAllDay
    ? '全天'
    : `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-70"
    >
      <View className="rounded-xl border border-border bg-card p-4 gap-2">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-[15px] font-semibold text-foreground" numberOfLines={1}>
              {event.title || '无标题'}
            </Text>
            <Text className="text-xs text-primary font-medium">{timeRange}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            {onEdit ? (
              <Pressable onPress={onEdit} hitSlop={8}>
                <Pencil size={16} className="text-muted-foreground" />
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable onPress={onDelete} hitSlop={8}>
                <Trash2 size={16} className="text-destructive" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {event.description ? (
          <Text className="text-xs text-muted-foreground leading-5" numberOfLines={2}>
            {event.description}
          </Text>
        ) : null}

        {event.location ? (
          <View className="flex-row items-center gap-1.5">
            <MapPin size={12} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
