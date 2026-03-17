import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { getItem, setItem } from '@/lib/storage';
import { cn } from '@/lib/utils';
import * as DeviceCalendar from 'expo-calendar';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react-native';
import * as React from 'react';
import { Alert, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

type SystemCalendarOption = {
  id: string;
  title: string;
  color?: string;
  isPrimary?: boolean;
  allowsModifications: boolean;
};

type ScheduleItem = {
  id: string;
  title: string;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
  calendarId?: string | null;
  calendarTitle?: string | null;
  reminderMinutesBefore?: number | null;
  systemCalendarEventId?: string | null;
  lastSyncedAt?: string | null;
};

type DeviceEventItem = {
  id: string;
  title: string;
  notes: string;
  location: string;
  startDate: string;
  endDate: string;
  date: string;
  startTime: string;
  endTime: string;
  calendarId: string;
  calendarTitle: string;
  color?: string;
  allDay: boolean;
};

type ScheduleForm = {
  title: string;
  notes: string;
  startTime: string;
  endTime: string;
  location: string;
  calendarId: string | null;
  calendarTitle: string | null;
  reminderMinutesBefore: number | null;
  syncToSystemCalendar: boolean;
};

type AgendaItem =
  | ({ source: 'local'; color: string } & ScheduleItem)
  | ({ source: 'system'; color: string } & DeviceEventItem);

const STORAGE_KEY = 'about-schedules';

const REMINDER_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: '不提醒', value: null },
  { label: '15 分钟前', value: 15 },
  { label: '30 分钟前', value: 30 },
  { label: '1 小时前', value: 60 },
];

function createEmptyForm(): ScheduleForm {
  return {
    title: '',
    notes: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    calendarId: null,
    calendarTitle: null,
    reminderMinutesBefore: 15,
    syncToSystemCalendar: true,
  };
}

function sortSchedules(items: ScheduleItem[]) {
  return [...items].sort((left, right) => {
    if (left.date === right.date) {
      return left.startTime.localeCompare(right.startTime);
    }

    return left.date.localeCompare(right.date);
  });
}

function formatSelectedMonth(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(`${date}T00:00:00`));
}

function formatSelectedYear(date: string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date(`${date}T00:00:00`));
}

function formatSyncLabel(value?: string | null) {
  if (!value) {
    return '未同步';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatTimeLabel(dateValue: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

function normalizeTimeValue(value: string, fallback: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return fallback;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return fallback;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function combineDateAndTime(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function toDateKey(dateValue: string | Date) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return new Date(value.getFullYear(), value.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999);
}

function pickDefaultCalendar(calendars: SystemCalendarOption[]) {
  return calendars.find((item) => item.isPrimary) ?? calendars[0] ?? null;
}

function buildEventDetails(item: ScheduleItem) {
  return {
    title: item.title,
    notes: item.notes || undefined,
    location: item.location || undefined,
    startDate: combineDateAndTime(item.date, item.startTime),
    endDate: combineDateAndTime(item.date, item.endTime),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    alarms:
      item.reminderMinutesBefore != null
        ? [{ relativeOffset: -item.reminderMinutesBefore }]
        : undefined,
  };
}

function buildMarkedDates(
  schedules: ScheduleItem[],
  systemEvents: DeviceEventItem[],
  selectedDate: string
) {
  const map: Record<string, Array<{ key: string; color: string }>> = {};

  schedules.forEach((item) => {
    map[item.date] = [
      ...(map[item.date] ?? []),
      {
        key: `local-${item.id}`,
        color: item.systemCalendarEventId ? '#10b981' : '#8b5cf6',
      },
    ].slice(0, 3);
  });

  systemEvents.forEach((item) => {
    const existing = map[item.date] ?? [];
    if (!existing.some((entry) => entry.color === '#3b82f6')) {
      map[item.date] = [...existing, { key: `system-${item.id}`, color: '#3b82f6' }].slice(0, 3);
    }
  });

  const result: Record<
    string,
    { selected?: boolean; selectedColor?: string; dots?: Array<{ key: string; color: string }> }
  > = {};
  Object.entries(map).forEach(([date, dots]) => {
    result[date] = {
      dots,
      selected: date === selectedDate,
      selectedColor: '#7c3aed',
    };
  });

  result[selectedDate] = {
    ...(result[selectedDate] ?? {}),
    selected: true,
    selectedColor: '#7c3aed',
  };

  return result;
}
function toDeviceEventItem(event: DeviceCalendar.Event, calendars: SystemCalendarOption[]) {
  if (!event.id || !event.startDate || !event.endDate) {
    return null;
  }

  const calendar = calendars.find((item) => item.id === event.calendarId);
  const startDate = new Date(event.startDate).toISOString();
  const endDate = new Date(event.endDate).toISOString();

  return {
    id: event.id,
    title: event.title?.trim() || '未命名日程',
    notes: event.notes?.trim() || '',
    location: event.location?.trim() || '',
    startDate,
    endDate,
    date: toDateKey(startDate),
    startTime: formatTimeLabel(startDate),
    endTime: formatTimeLabel(endDate),
    calendarId: event.calendarId,
    calendarTitle: calendar?.title ?? '系统日历',
    color: calendar?.color ?? '#3b82f6',
    allDay: !!event.allDay,
  } satisfies DeviceEventItem;
}

function getReminderLabel(value: number | null | undefined) {
  return REMINDER_OPTIONS.find((option) => option.value === value)?.label ?? '不提醒';
}

function AgendaCard({
  item,
  onEdit,
  onDelete,
  onOpen,
  busy,
}: {
  item: AgendaItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpen: () => void;
  busy?: boolean;
}) {
  return (
    <View className="rounded-[26px] bg-white px-4 py-4 shadow-sm shadow-slate-200/70">
      <View className="flex-row items-start gap-3">
        <View className="items-center pt-1">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
        </View>

        <View className="flex-1 gap-2">
          <Text className="text-xs tracking-wide text-slate-400">
            {item.source === 'system' && item.allDay
              ? '全天日程'
              : `${item.startTime} - ${item.endTime}`}
          </Text>
          <Text className="text-xl font-semibold leading-7 text-slate-800">{item.title}</Text>

          {item.notes ? (
            <Text className="text-sm leading-6 text-slate-400" numberOfLines={2}>
              {item.notes}
            </Text>
          ) : null}

          <View className="flex-row flex-wrap items-center gap-3">
            <View className="rounded-full bg-violet-50 px-3 py-1">
              <Text className="text-xs font-medium text-violet-600">
                {item.source === 'local' ? '应用内日程' : item.calendarTitle}
              </Text>
            </View>

            {item.location ? (
              <View className="flex-row items-center gap-1">
                <MapPin size={12} color="#94a3b8" />
                <Text className="text-xs text-slate-400">{item.location}</Text>
              </View>
            ) : null}
          </View>

          {item.source === 'local' ? (
            <Text className="text-xs text-slate-400">
              {item.calendarTitle
                ? `系统日历: ${item.calendarTitle} · ${getReminderLabel(item.reminderMinutesBefore)}`
                : '当前仅保存在应用内'}
            </Text>
          ) : null}

          {item.source === 'local' ? (
            <Text className="text-xs text-slate-400">
              最近同步: {formatSyncLabel(item.lastSyncedAt)}
            </Text>
          ) : null}
        </View>

        <View className="gap-2">
          {item.source === 'local' && onEdit ? (
            <Button variant="ghost" size="icon" className="rounded-full" onPress={onEdit}>
              <Pencil size={16} color="#7c3aed" />
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={busy}
            onPress={onOpen}>
            {busy ? (
              <LoaderCircle size={16} color="#7c3aed" />
            ) : (
              <ExternalLink size={16} color="#7c3aed" />
            )}
          </Button>

          {item.source === 'local' && onDelete ? (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              disabled={busy}
              onPress={onDelete}>
              <Trash2 size={16} color="#ef4444" />
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [monthAnchor, setMonthAnchor] = React.useState(today);
  const [form, setForm] = React.useState<ScheduleForm>(createEmptyForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [schedules, setSchedules] = React.useState<ScheduleItem[]>([]);
  const [deviceCalendars, setDeviceCalendars] = React.useState<SystemCalendarOption[]>([]);
  const [systemEvents, setSystemEvents] = React.useState<DeviceEventItem[]>([]);
  const [loadingCalendars, setLoadingCalendars] = React.useState(false);
  const [loadingSystemEvents, setLoadingSystemEvents] = React.useState(false);
  const [pendingActionId, setPendingActionId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSchedules(sortSchedules(getItem<ScheduleItem[]>(STORAGE_KEY) ?? []));
  }, []);

  React.useEffect(() => {
    void setItem(STORAGE_KEY, schedules);
  }, [schedules]);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    void loadCalendarsAndEvents(today);
  }, [today]);

  const writableCalendars = React.useMemo(
    () => deviceCalendars.filter((item) => item.allowsModifications),
    [deviceCalendars]
  );

  const editingSchedule = React.useMemo(
    () => schedules.find((item) => item.id === editingId) ?? null,
    [editingId, schedules]
  );

  const selectedAgenda = React.useMemo(() => {
    const localItems: AgendaItem[] = schedules
      .filter((item) => item.date === selectedDate)
      .map((item) => ({
        ...item,
        source: 'local' as const,
        color: item.systemCalendarEventId ? '#10b981' : '#8b5cf6',
      }));

    const systemItems: AgendaItem[] = systemEvents
      .filter((item) => item.date === selectedDate)
      .filter(
        (item) => !localItems.some((localItem) => localItem.systemCalendarEventId === item.id)
      )
      .map((item) => ({ ...item, source: 'system' as const, color: item.color ?? '#3b82f6' }));

    return [...localItems, ...systemItems].sort((left, right) => {
      const leftTime = left.source === 'system' && left.allDay ? '00:00' : left.startTime;
      const rightTime = right.source === 'system' && right.allDay ? '00:00' : right.startTime;
      return leftTime.localeCompare(rightTime);
    });
  }, [schedules, selectedDate, systemEvents]);

  const monthStats = React.useMemo(() => {
    const monthPrefix = monthAnchor.slice(0, 7);
    return {
      localCount: schedules.filter((item) => item.date.startsWith(monthPrefix)).length,
      systemCount: systemEvents.filter((item) => item.date.startsWith(monthPrefix)).length,
    };
  }, [monthAnchor, schedules, systemEvents]);

  function updateForm<K extends keyof ScheduleForm>(key: K, value: ScheduleForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm(nextDate = selectedDate) {
    const fallback = pickDefaultCalendar(writableCalendars);
    setEditingId(null);
    setSelectedDate(nextDate);
    setForm({
      ...createEmptyForm(),
      calendarId: fallback?.id ?? null,
      calendarTitle: fallback?.title ?? null,
      syncToSystemCalendar: !!fallback,
    });
  }

  function upsertSchedule(item: ScheduleItem) {
    setSchedules((current) => {
      const exists = current.some((entry) => entry.id === item.id);
      return sortSchedules(
        exists ? current.map((entry) => (entry.id === item.id ? item : entry)) : [...current, item]
      );
    });
  }

  function patchSchedule(id: string, patch: Partial<ScheduleItem>) {
    setSchedules((current) =>
      sortSchedules(current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    );
  }
  async function ensureCalendarReady() {
    if (Platform.OS === 'web') {
      Alert.alert('Web 端暂不支持系统日历。');
      return false;
    }

    if (!(await DeviceCalendar.isAvailableAsync())) {
      Alert.alert('当前设备不可用系统日历能力。');
      return false;
    }

    const permission = await DeviceCalendar.getCalendarPermissionsAsync();
    if (permission.status === 'granted') {
      return true;
    }

    const requested = await DeviceCalendar.requestCalendarPermissionsAsync();
    if (requested.status !== 'granted') {
      Alert.alert('没有获得日历权限', '请先在系统设置里允许应用访问系统日历。');
      return false;
    }

    return true;
  }

  async function loadCalendarsAndEvents(anchorDate: string) {
    const ready = await ensureCalendarReady();
    if (!ready) {
      return;
    }

    setLoadingCalendars(true);

    try {
      const calendars = await DeviceCalendar.getCalendarsAsync(DeviceCalendar.EntityTypes.EVENT);
      const normalized = calendars.map((item) => ({
        id: item.id,
        title: item.title,
        color: item.color,
        isPrimary: item.isPrimary ?? false,
        allowsModifications: item.allowsModifications,
      }));

      setDeviceCalendars(normalized);

      const fallback = pickDefaultCalendar(normalized.filter((item) => item.allowsModifications));
      setForm((current) => ({
        ...current,
        calendarId: current.calendarId ?? fallback?.id ?? null,
        calendarTitle: current.calendarTitle ?? fallback?.title ?? null,
        syncToSystemCalendar: fallback ? current.syncToSystemCalendar : false,
      }));

      await loadSystemEvents(anchorDate, normalized);
    } catch (error) {
      Alert.alert('读取系统日历失败', error instanceof Error ? error.message : '请稍后再试。');
    } finally {
      setLoadingCalendars(false);
    }
  }

  async function loadSystemEvents(
    anchorDate: string,
    calendarsParam: SystemCalendarOption[] = deviceCalendars
  ) {
    const ready = await ensureCalendarReady();
    if (!ready || !calendarsParam.length) {
      return;
    }

    setLoadingSystemEvents(true);

    try {
      const events = await DeviceCalendar.getEventsAsync(
        calendarsParam.map((item) => item.id),
        startOfMonth(anchorDate),
        endOfMonth(anchorDate)
      );

      setSystemEvents(
        events
          .map((item) => toDeviceEventItem(item, calendarsParam))
          .filter((item): item is DeviceEventItem => !!item)
      );
    } catch (error) {
      Alert.alert('获取系统日程失败', error instanceof Error ? error.message : '请稍后再试。');
    } finally {
      setLoadingSystemEvents(false);
    }
  }

  function buildPayload() {
    const existing = editingSchedule;
    const startTime = normalizeTimeValue(form.startTime, existing?.startTime ?? '09:00');
    const endTime = normalizeTimeValue(form.endTime, existing?.endTime ?? '10:00');

    if (!form.title.trim()) {
      Alert.alert('请填写事件名称。');
      return null;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      Alert.alert('结束时间必须晚于开始时间。');
      return null;
    }

    return {
      id: editingId ?? `${Date.now()}`,
      title: form.title.trim(),
      notes: form.notes.trim(),
      date: selectedDate,
      startTime,
      endTime,
      location: form.location.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      calendarId: form.calendarId,
      calendarTitle: form.calendarTitle,
      reminderMinutesBefore: form.reminderMinutesBefore,
      systemCalendarEventId: existing?.systemCalendarEventId ?? null,
      lastSyncedAt: existing?.lastSyncedAt ?? null,
    } satisfies ScheduleItem;
  }

  async function syncSchedule(item: ScheduleItem, previous?: ScheduleItem | null) {
    const ready = await ensureCalendarReady();
    if (!ready) {
      return false;
    }

    const calendars = writableCalendars.length
      ? writableCalendars
      : deviceCalendars.filter((entry) => entry.allowsModifications);
    const target =
      calendars.find((entry) => entry.id === item.calendarId) ?? pickDefaultCalendar(calendars);

    if (!target) {
      Alert.alert('没有可写入的系统日历。');
      return false;
    }

    setPendingActionId(item.id);

    try {
      let eventId = item.systemCalendarEventId ?? null;
      const calendarChanged =
        !!previous?.systemCalendarEventId &&
        !!previous.calendarId &&
        previous.calendarId !== target.id;

      if (calendarChanged && previous?.systemCalendarEventId) {
        await DeviceCalendar.deleteEventAsync(previous.systemCalendarEventId);
        eventId = null;
      }

      if (eventId) {
        await DeviceCalendar.updateEventAsync(eventId, buildEventDetails(item));
      } else {
        eventId = await DeviceCalendar.createEventAsync(target.id, buildEventDetails(item));
      }

      patchSchedule(item.id, {
        calendarId: target.id,
        calendarTitle: target.title,
        systemCalendarEventId: eventId,
        lastSyncedAt: new Date().toISOString(),
      });

      await loadSystemEvents(item.date);
      return eventId;
    } catch (error) {
      Alert.alert('同步失败', error instanceof Error ? error.message : '写入系统日历没有成功。');
      return false;
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleSubmit() {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    const previous = editingSchedule;
    upsertSchedule(payload);

    if (form.syncToSystemCalendar) {
      const synced = await syncSchedule(payload, previous);
      if (!synced) {
        return;
      }
    }

    resetForm(selectedDate);
  }

  async function openLocalEvent(item: ScheduleItem) {
    const eventId = item.systemCalendarEventId ?? (await syncSchedule(item, editingSchedule));
    if (!eventId) {
      return;
    }

    setPendingActionId(item.id);

    try {
      await DeviceCalendar.openEventInCalendarAsync({ id: eventId }, { allowsEditing: true });
    } catch (error) {
      Alert.alert('打开失败', error instanceof Error ? error.message : '无法打开系统日历事件。');
    } finally {
      setPendingActionId(null);
    }
  }

  async function openSystemEvent(item: DeviceEventItem) {
    setPendingActionId(item.id);

    try {
      await DeviceCalendar.openEventInCalendarAsync({ id: item.id }, { allowsEditing: true });
    } catch (error) {
      Alert.alert('打开失败', error instanceof Error ? error.message : '无法打开系统日历事件。');
    } finally {
      setPendingActionId(null);
    }
  }

  function editSchedule(item: ScheduleItem) {
    setEditingId(item.id);
    setSelectedDate(item.date);
    setMonthAnchor(item.date);
    setForm({
      title: item.title,
      notes: item.notes,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      calendarId: item.calendarId ?? form.calendarId,
      calendarTitle: item.calendarTitle ?? form.calendarTitle,
      reminderMinutesBefore: item.reminderMinutesBefore ?? 15,
      syncToSystemCalendar: !!item.systemCalendarEventId || !!item.calendarId,
    });
  }

  function deleteSchedule(item: ScheduleItem) {
    Alert.alert('删除事件', '确认删除这条本地事件吗？如果已经同步到系统日历，也会一起删除。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          setPendingActionId(item.id);

          try {
            if (item.systemCalendarEventId) {
              const ready = await ensureCalendarReady();
              if (ready) {
                await DeviceCalendar.deleteEventAsync(item.systemCalendarEventId);
                await loadSystemEvents(item.date);
              }
            }
          } finally {
            setSchedules((current) => current.filter((entry) => entry.id !== item.id));
            setPendingActionId(null);
            if (editingId === item.id) {
              resetForm(selectedDate);
            }
          }
        },
      },
    ]);
  }

  const markedDates = buildMarkedDates(schedules, systemEvents, selectedDate);
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-[#f5f3ff]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 28 }}>
        <View
          className={cn('mx-auto w-full max-w-6xl gap-4', isDesktop ? 'flex-row items-start' : '')}>
          <View className={cn('gap-4', isDesktop ? 'w-[48%]' : 'w-full')}>
            <Card className="overflow-hidden rounded-[34px] border-0 bg-white py-0 shadow-lg shadow-violet-200/60">
              <CardContent className="px-4 pb-5 pt-4">
                <View className="mb-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-3xl font-semibold text-slate-800">
                      {formatSelectedMonth(monthAnchor)}
                    </Text>
                    <Text className="text-sm text-slate-400">
                      {formatSelectedYear(monthAnchor)}
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-2xl border-slate-200 bg-white"
                      onPress={() => {
                        const anchor = new Date(`${monthAnchor}T00:00:00`);
                        anchor.setMonth(anchor.getMonth() - 1);
                        const next = toDateKey(anchor);
                        setMonthAnchor(next);
                        void loadSystemEvents(next);
                      }}>
                      <Text className="text-lg text-slate-500">{'<'}</Text>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-2xl border-slate-200 bg-white"
                      onPress={() => {
                        const anchor = new Date(`${monthAnchor}T00:00:00`);
                        anchor.setMonth(anchor.getMonth() + 1);
                        const next = toDateKey(anchor);
                        setMonthAnchor(next);
                        void loadSystemEvents(next);
                      }}>
                      <Text className="text-lg text-slate-500">{'>'}</Text>
                    </Button>
                  </View>
                </View>

                <Calendar
                  current={monthAnchor}
                  markingType="multi-dot"
                  markedDates={markedDates}
                  renderHeader={() => <View />}
                  hideArrows
                  enableSwipeMonths
                  onDayPress={(day) => {
                    setSelectedDate(day.dateString);
                    setMonthAnchor(day.dateString);
                  }}
                  onMonthChange={(month) => {
                    const next = `${month.year}-${String(month.month).padStart(2, '0')}-01`;
                    setMonthAnchor(next);
                    void loadSystemEvents(next);
                  }}
                  theme={{
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#94a3b8',
                    dayTextColor: '#1f2a44',
                    textDisabledColor: '#cbd5e1',
                    todayTextColor: '#7c3aed',
                    selectedDayTextColor: '#ffffff',
                    textDayFontSize: 18,
                    textDayHeaderFontSize: 13,
                    textDayFontWeight: '500',
                  }}
                  style={{ borderRadius: 28 }}
                />

                <View className="mt-4 flex-row flex-wrap gap-3 rounded-[24px] bg-violet-50 px-4 py-3">
                  <View className="rounded-full bg-white px-3 py-2">
                    <Text className="text-xs font-medium text-violet-600">
                      本月本地 {monthStats.localCount}
                    </Text>
                  </View>
                  <View className="rounded-full bg-white px-3 py-2">
                    <Text className="text-xs font-medium text-sky-600">
                      系统日历 {monthStats.systemCount}
                    </Text>
                  </View>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-3"
                    disabled={loadingCalendars || loadingSystemEvents}
                    onPress={() => void loadCalendarsAndEvents(monthAnchor)}>
                    {loadingCalendars || loadingSystemEvents ? (
                      <LoaderCircle size={14} color="#7c3aed" />
                    ) : (
                      <RefreshCw size={14} color="#7c3aed" />
                    )}
                    <Text className="text-violet-600">刷新系统日程</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>

            <Card className="rounded-[34px] border-0 bg-[#fbfaff] py-0 shadow-lg shadow-violet-100/70">
              <CardHeader className="px-5 pb-2 pt-5">
                <View className="flex-row items-center justify-between gap-3">
                  <View>
                    <CardTitle className="text-[20px] text-slate-800">
                      {formatDateLabel(selectedDate)}
                    </CardTitle>
                    <Text className="mt-1 text-sm text-slate-400">
                      本地事件和系统日历会一起显示在这里。
                    </Text>
                  </View>
                  <View className="rounded-full bg-violet-100 px-3 py-1">
                    <Text className="text-xs font-medium text-violet-700">
                      {selectedAgenda.length} 条
                    </Text>
                  </View>
                </View>
              </CardHeader>

              <CardContent className="gap-3 px-4 pb-5">
                {selectedAgenda.length ? (
                  selectedAgenda.map((item) => (
                    <AgendaCard
                      key={`${item.source}-${item.id}`}
                      item={item}
                      busy={pendingActionId === item.id}
                      onEdit={item.source === 'local' ? () => editSchedule(item) : undefined}
                      onDelete={item.source === 'local' ? () => deleteSchedule(item) : undefined}
                      onOpen={() =>
                        item.source === 'local'
                          ? void openLocalEvent(item)
                          : void openSystemEvent(item)
                      }
                    />
                  ))
                ) : (
                  <View className="rounded-[28px] border border-dashed border-violet-200 bg-white px-5 py-10">
                    <Text className="text-center text-base font-medium text-slate-600">
                      这一天还没有事件
                    </Text>
                    <Text className="mt-2 text-center text-sm leading-6 text-slate-400">
                      右侧创建一条新事件，或者点击刷新把系统日历里的安排同步过来。
                    </Text>
                  </View>
                )}
              </CardContent>
            </Card>
          </View>

          <View className={cn('gap-4', isDesktop ? 'flex-1' : 'w-full')}>
            <Card className="rounded-[34px] border-0 bg-white py-0 shadow-lg shadow-violet-200/60">
              <CardHeader className="px-5 pb-3 pt-6">
                <View className="items-center gap-2">
                  <Text className="text-3xl font-semibold text-slate-800">
                    {editingId ? 'Edit Event' : 'Add New Event'}
                  </Text>
                  <Text className="text-sm text-slate-400">{formatDateLabel(selectedDate)}</Text>
                </View>
              </CardHeader>

              <CardContent className="gap-4 px-5 pb-6">
                <Input
                  value={form.title}
                  onChangeText={(value) => updateForm('title', value)}
                  placeholder="Event name*"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-700"
                />

                <Textarea
                  value={form.notes}
                  onChangeText={(value) => updateForm('notes', value)}
                  placeholder="Type the note here..."
                  className="min-h-28 rounded-2xl border-slate-200 bg-slate-50 text-slate-700"
                />

                <Input
                  value={selectedDate}
                  editable={false}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-500"
                />

                <View className="flex-row gap-3">
                  <Input
                    value={form.startTime}
                    onChangeText={(value) => updateForm('startTime', value)}
                    placeholder="Start time"
                    className="h-12 flex-1 rounded-2xl border-slate-200 bg-slate-50 text-slate-700"
                  />
                  <Input
                    value={form.endTime}
                    onChangeText={(value) => updateForm('endTime', value)}
                    placeholder="End time"
                    className="h-12 flex-1 rounded-2xl border-slate-200 bg-slate-50 text-slate-700"
                  />
                </View>

                <Input
                  value={form.location}
                  onChangeText={(value) => updateForm('location', value)}
                  placeholder="Location"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-700"
                />

                <View className="flex-row items-center justify-between rounded-[24px] bg-slate-50 px-4 py-3">
                  <View className="flex-1 pr-4">
                    <Text className="text-base font-medium text-slate-700">同步到系统日历</Text>
                    <Text className="mt-1 text-xs leading-5 text-slate-400">
                      打开后创建时会写入系统日历，也能从左侧读取系统日程。
                    </Text>
                  </View>
                  <Switch
                    checked={form.syncToSystemCalendar}
                    onCheckedChange={(value) => updateForm('syncToSystemCalendar', !!value)}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-medium text-slate-700">提醒时间</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {REMINDER_OPTIONS.map((option) => (
                      <Button
                        key={option.label}
                        variant="secondary"
                        className={cn(
                          'rounded-2xl px-4 py-3',
                          form.reminderMinutesBefore === option.value
                            ? 'bg-violet-100'
                            : 'bg-slate-100'
                        )}
                        onPress={() => updateForm('reminderMinutesBefore', option.value)}>
                        <Text
                          className={cn(
                            'text-sm font-medium',
                            form.reminderMinutesBefore === option.value
                              ? 'text-violet-700'
                              : 'text-slate-500'
                          )}>
                          {option.label}
                        </Text>
                      </Button>
                    ))}
                  </View>
                </View>

                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-slate-700">选择系统日历</Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full px-2"
                      disabled={loadingCalendars}
                      onPress={() => void loadCalendarsAndEvents(monthAnchor)}>
                      {loadingCalendars ? (
                        <LoaderCircle size={14} color="#7c3aed" />
                      ) : (
                        <CalendarDays size={14} color="#7c3aed" />
                      )}
                      <Text className="text-violet-600">加载</Text>
                    </Button>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    {writableCalendars.length ? (
                      writableCalendars.map((calendar) => (
                        <Button
                          key={calendar.id}
                          variant="secondary"
                          className={cn(
                            'rounded-2xl px-4 py-3',
                            form.calendarId === calendar.id ? 'bg-violet-100' : 'bg-slate-100'
                          )}
                          onPress={() =>
                            setForm((current) => ({
                              ...current,
                              calendarId: calendar.id,
                              calendarTitle: calendar.title,
                            }))
                          }>
                          <View className="flex-row items-center gap-2">
                            <View
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: calendar.color || '#7c3aed' }}
                            />
                            <Text
                              className={cn(
                                'text-sm font-medium',
                                form.calendarId === calendar.id
                                  ? 'text-violet-700'
                                  : 'text-slate-500'
                              )}>
                              {calendar.title}
                            </Text>
                          </View>
                        </Button>
                      ))
                    ) : (
                      <View className="rounded-2xl bg-slate-100 px-4 py-3">
                        <Text className="text-sm text-slate-500">
                          先加载系统日历，再选择要写入的目标日历。
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-xs leading-5 text-slate-400">
                    已接入 {deviceCalendars.length} 个系统日历，可写入 {writableCalendars.length}{' '}
                    个。
                  </Text>
                </View>

                <View className="rounded-[24px] bg-violet-50 px-4 py-4">
                  <View className="flex-row items-center gap-2">
                    <Clock3 size={15} color="#7c3aed" />
                    <Text className="text-sm font-medium text-violet-700">系统同步能力</Text>
                  </View>
                  <Text className="mt-2 text-xs leading-6 text-slate-500">
                    页面会读取系统日历已有事件，并支持把新建事件同步到系统日历。同步后的事件可以直接从左侧列表打开到系统日历继续编辑。
                  </Text>
                </View>

                <Button
                  size="lg"
                  className="h-14 rounded-2xl bg-violet-600"
                  onPress={() => void handleSubmit()}>
                  {editingId ? (
                    <CheckCircle2 size={18} color="#ffffff" />
                  ) : (
                    <Plus size={18} color="#ffffff" />
                  )}
                  <Text>{editingId ? 'Update Event' : 'Create Event'}</Text>
                </Button>

                {editingId ? (
                  <Button
                    variant="ghost"
                    className="rounded-2xl"
                    onPress={() => resetForm(selectedDate)}>
                    <Text className="text-slate-500">取消编辑</Text>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
