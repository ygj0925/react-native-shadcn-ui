import { EventForm } from '@/components/features/calendar/event-form';
import { useCalendar } from '@/hooks/useCalendar';
import { useRouter, Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

export default function NewEventScreen() {
  const router = useRouter();
  const { createEvent, selectedDate } = useCalendar();

  const handleSave = (input: Parameters<typeof createEvent>[0]) => {
    const event = createEvent(input);
    router.replace(`/event/${event.id}` as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '新建事件',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
        }}
      />
      <EventForm selectedDate={selectedDate} onSave={handleSave} />
    </>
  );
}
