import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { getItem, setItem } from '@/lib/storage';
import { cn } from '@/lib/utils';
import * as DeviceCalendar from 'expo-calendar';
import {
  BellRing,
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
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Alert, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

type SystemCalendarOption = {
  id: string;
  title: string;
  color?: string;
  isPrimary?: boolean;
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

type ScheduleForm = {
  title: string;
  notes: string;
  startTime: string;
  endTime: string;
  location: string;
  calendarId: string | null;
  calendarTitle: string | null;
  reminderMinutesBefore: number | null;
};

const STORAGE_KEY = 'about-schedules';

const REMINDER_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: '不提醒', value: null },
  { label: '提前15分钟', value: 15 },
  { label: '提前30分钟', value: 30 },
  { label: '提前1小时', value: 60 },
];

function createEmptyForm(): ScheduleForm {
  return {
    title: '',
    notes: '',
    startTime: '',
    endTime: '',
    location: '',
    calendarId: null,
    calendarTitle: null,
    reminderMinutesBefore: 15,
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

function buildMarkedDates(schedules: ScheduleItem[], selectedDate: string) {
  const dates = schedules.reduce<Record<string, { marked?: boolean; dotColor?: string }>>(
    (accumulator, item) => {
      accumulator[item.date] = {
        marked: true,
        dotColor: item.systemCalendarEventId ? '#0f766e' : '#f59e0b',
      };
      return accumulator;
    },
    {}
  );

  return {
    ...dates,
    [selectedDate]: {
      ...(dates[selectedDate] ?? {}),
      selected: true,
      selectedColor: '#0f766e',
    },
  };
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

export default function AboutScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 1024;
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [form, setForm] = React.useState<ScheduleForm>(createEmptyForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [schedules, setSchedules] = React.useState<ScheduleItem[]>([]);
  const [pendingActionId, setPendingActionId] = React.useState<string | null>(null);
  const [deviceCalendars, setDeviceCalendars] = React.useState<SystemCalendarOption[]>([]);
  const [loadingCalendars, setLoadingCalendars] = React.useState(false);

  React.useEffect(() => {
    setSchedules(sortSchedules(getItem<ScheduleItem[]>(STORAGE_KEY) ?? []));
  }, []);

  React.useEffect(() => {
    void setItem(STORAGE_KEY, schedules);
  }, [schedules]);

  const editingSchedule = React.useMemo(
    () => schedules.find((item) => item.id === editingId) ?? null,
    [editingId, schedules]
  );

  const selectedSchedules = React.useMemo(
    () => schedules.filter((item) => item.date === selectedDate),
    [schedules, selectedDate]
  );

  const upcomingSchedules = React.useMemo(
    () => schedules.filter((item) => item.date >= today).slice(0, 6),
    [schedules, today]
  );

  function resetForm(nextDate = selectedDate) {
    setEditingId(null);
    setSelectedDate(nextDate);
    setForm((current) => ({
      ...createEmptyForm(),
      calendarId: current.calendarId,
      calendarTitle: current.calendarTitle,
    }));
  }

  function updateForm<K extends keyof ScheduleForm>(key: K, value: ScheduleForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
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
      Alert.alert('当前平台不支持系统日历同步');
      return false;
    }

    if (!(await DeviceCalendar.isAvailableAsync())) {
      Alert.alert('系统日历不可用');
      return false;
    }

    const permission = await DeviceCalendar.getCalendarPermissionsAsync();
    if (permission.status === 'granted') {
      return true;
    }

    const requested = await DeviceCalendar.requestCalendarPermissionsAsync();
    if (requested.status !== 'granted') {
      Alert.alert('没有获得日历权限', '请先在系统设置中允许访问日历。');
      return false;
    }

    return true;
  }

  async function loadCalendars() {
    const ready = await ensureCalendarReady();
    if (!ready) {
      return [];
    }

    setLoadingCalendars(true);

    try {
      const calendars = await DeviceCalendar.getCalendarsAsync(DeviceCalendar.EntityTypes.EVENT);
      const writable = calendars
        .filter((item) => item.allowsModifications)
        .map((item) => ({
          id: item.id,
          title: item.title,
          color: item.color,
          isPrimary: item.isPrimary ?? false,
        }));

      setDeviceCalendars(writable);

      if (!form.calendarId) {
        const fallback = pickDefaultCalendar(writable);
        if (fallback) {
          setForm((current) => ({
            ...current,
            calendarId: fallback.id,
            calendarTitle: fallback.title,
          }));
        }
      }

      return writable;
    } catch (error) {
      Alert.alert('读取系统日历失败', error instanceof Error ? error.message : '请稍后再试。');
      return [];
    } finally {
      setLoadingCalendars(false);
    }
  }

  function buildPayload() {
    const existing = editingSchedule;
    const startTime = normalizeTimeValue(form.startTime, existing?.startTime ?? '09:00');
    const endTime = normalizeTimeValue(form.endTime, existing?.endTime ?? '10:00');

    if (!form.title.trim()) {
      Alert.alert('请填写日程标题');
      return null;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      Alert.alert('结束时间需要晚于开始时间');
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

    setPendingActionId(item.id);

    try {
      const calendars = deviceCalendars.length ? deviceCalendars : await loadCalendars();
      const target =
        calendars.find((entry) => entry.id === item.calendarId) ?? pickDefaultCalendar(calendars);

      if (!target) {
        Alert.alert('没有可写的系统日历');
        return false;
      }

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

      return true;
    } catch (error) {
      Alert.alert('同步失败', error instanceof Error ? error.message : '系统日历操作没有成功完成。');
      return false;
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleSubmit(syncAfterSave: boolean) {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    const previous = editingSchedule;
    upsertSchedule(payload);

    if (payload.systemCalendarEventId || syncAfterSave) {
      const synced = await syncSchedule(payload, previous);
      if (!synced && syncAfterSave) {
        return;
      }
    }

    resetForm(selectedDate);
  }

  async function openInSystemCalendar(item: ScheduleItem) {
    if (!item.systemCalendarEventId) {
      await syncSchedule(item, editingSchedule);
      return;
    }

    const ready = await ensureCalendarReady();
    if (!ready) {
      return;
    }

    setPendingActionId(item.id);

    try {
      await DeviceCalendar.openEventInCalendarAsync(
        { id: item.systemCalendarEventId },
        { allowsEditing: true }
      );
    } catch (error) {
      Alert.alert('打开失败', error instanceof Error ? error.message : '无法打开系统日历事件。');
    } finally {
      setPendingActionId(null);
    }
  }

  function editSchedule(item: ScheduleItem) {
    setEditingId(item.id);
    setSelectedDate(item.date);
    setForm({
      title: item.title,
      notes: item.notes,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      calendarId: item.calendarId ?? form.calendarId,
      calendarTitle: item.calendarTitle ?? form.calendarTitle,
      reminderMinutesBefore: item.reminderMinutesBefore ?? 15,
    });
  }

  function deleteSchedule(item: ScheduleItem) {
    Alert.alert('删除日程', '确认删除这条日程吗？', [
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

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
        <View className="mx-auto w-full max-w-7xl gap-4">
          <Card className="overflow-hidden border-0 bg-teal-950 py-0 shadow-xl shadow-teal-950/20">
            <CardContent className="px-5 py-5">
              <View className="gap-2">
                <Text className="text-sm font-medium text-teal-100/80">日程管理</Text>
                <Text className="text-3xl font-semibold text-white">把勘察、拜访和待办集中到一个页面</Text>
                <Text className="text-sm leading-6 text-teal-50/85">
                  支持本地日程、系统日历同步、提前提醒和日历选择。
                </Text>
              </View>
            </CardContent>
          </Card>

          <View className={cn('gap-4', isWideLayout ? 'flex-row items-start' : '')}>
            <View className={cn('gap-4', isWideLayout ? 'w-[42%]' : 'w-full')}>
              <Card className="py-0">
                <CardHeader className="px-4 pb-3 pt-4">
                  <CardTitle className="text-lg">日历选择</CardTitle>
                  <CardDescription>点日期查看或安排当天日程</CardDescription>
                </CardHeader>
                <CardContent className="px-2 pb-3">
                  <Calendar
                    current={selectedDate}
                    markedDates={buildMarkedDates(schedules, selectedDate)}
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    theme={{
                      calendarBackground: colorScheme === 'dark' ? '#09090b' : '#ffffff',
                      monthTextColor: colorScheme === 'dark' ? '#fafafa' : '#111827',
                      dayTextColor: colorScheme === 'dark' ? '#f4f4f5' : '#111827',
                      textDisabledColor: colorScheme === 'dark' ? '#52525b' : '#9ca3af',
                      arrowColor: '#0f766e',
                      todayTextColor: '#0f766e',
                      selectedDayTextColor: '#ffffff',
                    }}
                    enableSwipeMonths
                    style={{ borderRadius: 18 }}
                  />
                </CardContent>
              </Card>

            <Card className="py-0">
              <CardHeader className="px-4 pb-3 pt-4">
                <CardTitle className="text-lg">近期日程</CardTitle>
                <CardDescription>快速处理下一步安排</CardDescription>
              </CardHeader>
              <CardContent className="gap-3 px-4 pb-4">
                {upcomingSchedules.length ? (
                  upcomingSchedules.map((item) => (
                    <Pressable
                      key={item.id}
                      className="rounded-2xl border border-border bg-muted/40 px-4 py-3 active:bg-muted"
                      onPress={() => editSchedule(item)}>
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1 gap-1">
                          <Text className="text-sm font-semibold">{item.title}</Text>
                          <Text className="text-xs text-muted-foreground">
                            {formatDateLabel(item.date)} · {item.startTime} - {item.endTime}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {item.calendarTitle
                              ? `${item.calendarTitle} · 提前 ${item.reminderMinutesBefore ?? 0} 分钟`
                              : '仅本地保存'}
                          </Text>
                        </View>
                        <View className="flex-row gap-1">
                          <Button variant="ghost" size="icon" onPress={() => void openInSystemCalendar(item)}>
                            <ExternalLink size={16} color="#0f766e" />
                          </Button>
                          <Button variant="ghost" size="icon" onPress={() => deleteSchedule(item)}>
                            <Trash2 size={16} color="#ef4444" />
                          </Button>
                        </View>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <Text className="text-sm text-muted-foreground">还没有未来日程，先创建第一条吧。</Text>
                )}
              </CardContent>
            </Card>
          </View>

          <View className={cn('gap-4', isWideLayout ? 'flex-1' : 'w-full')}>
            <Card className="py-0">
              <CardHeader className="px-4 pb-3 pt-4">
                <View className="flex-row items-center justify-between gap-3">
                  <View>
                    <CardTitle className="text-lg">{editingId ? '修改日程' : '新建日程'}</CardTitle>
                    <CardDescription>{formatDateLabel(selectedDate)}</CardDescription>
                  </View>
                  {editingId ? (
                    <Button variant="outline" size="sm" onPress={() => resetForm(selectedDate)}>
                      <Text>取消编辑</Text>
                    </Button>
                  ) : null}
                </View>
              </CardHeader>
              <CardContent className="gap-3 px-4 pb-4">
                <View className="gap-2 rounded-2xl bg-muted/40 px-4 py-3">
                  <Text className="text-sm font-medium">系统日历同步</Text>
                  <Text className="text-xs text-muted-foreground">
                    先加载系统日历，再选择同步目标和提醒时间。
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingCalendars}
                    onPress={() => void loadCalendars()}>
                    {loadingCalendars ? (
                      <LoaderCircle size={14} color={isDark ? '#f4f4f5' : '#0f172a'} />
                    ) : (
                      <CalendarDays size={14} color={isDark ? '#f4f4f5' : '#0f172a'} />
                    )}
                    <Text>{deviceCalendars.length ? '刷新系统日历' : '加载系统日历'}</Text>
                  </Button>
                  <Text className="text-xs text-muted-foreground">
                    当前：{form.calendarTitle ?? '未选择系统日历'}
                  </Text>
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium">日程标题</Text>
                  <Input
                    value={form.title}
                    onChangeText={(value) => updateForm('title', value)}
                    placeholder="例如：现场勘察"
                  />
                </View>

                <View className={cn('gap-3', width >= 640 ? 'flex-row' : '')}>
                  <View className="flex-1 gap-2">
                    <Text className="text-sm font-medium">开始时间</Text>
                    <Input
                      value={form.startTime}
                      onChangeText={(value) => updateForm('startTime', value)}
                      placeholder="09:00"
                    />
                  </View>
                  <View className="flex-1 gap-2">
                    <Text className="text-sm font-medium">结束时间</Text>
                    <Input
                      value={form.endTime}
                      onChangeText={(value) => updateForm('endTime', value)}
                      placeholder="10:30"
                    />
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium">地点</Text>
                  <Input
                    value={form.location}
                    onChangeText={(value) => updateForm('location', value)}
                    placeholder="项目现场 / 会议室"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium">备注</Text>
                  <Textarea
                    value={form.notes}
                    onChangeText={(value) => updateForm('notes', value)}
                    className="min-h-28"
                  />
                </View>

                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <BellRing size={16} color="#0f766e" />
                    <Text className="text-sm font-medium">提醒时间</Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {REMINDER_OPTIONS.map((option) => (
                      <Pressable
                        key={option.label}
                        className={cn(
                          'rounded-full border px-3 py-2',
                          form.reminderMinutesBefore === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background'
                        )}
                        onPress={() => updateForm('reminderMinutesBefore', option.value)}>
                        <Text className="text-xs">{option.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <CalendarDays size={16} color="#0f766e" />
                    <Text className="text-sm font-medium">同步到哪个系统日历</Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {deviceCalendars.length ? (
                      deviceCalendars.map((calendar) => (
                        <Pressable
                          key={calendar.id}
                          className={cn(
                            'rounded-full border px-3 py-2',
                            form.calendarId === calendar.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-background'
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
                              style={{ backgroundColor: calendar.color || '#0f766e' }}
                            />
                            <Text className="text-xs">{calendar.title}</Text>
                          </View>
                        </Pressable>
                      ))
                    ) : (
                      <Text className="text-xs text-muted-foreground">
                        先点击“加载系统日历”再选择。
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-3">
                  <Button onPress={() => void handleSubmit(false)}>
                    <Plus size={16} color="#ffffff" />
                    <Text>{editingSchedule?.systemCalendarEventId ? '保存并更新同步' : '添加日程'}</Text>
                  </Button>
                  <Button variant="outline" onPress={() => void handleSubmit(true)}>
                    {editingSchedule?.systemCalendarEventId ? (
                      <RefreshCw size={16} color={isDark ? '#f4f4f5' : '#0f172a'} />
                    ) : (
                      <CheckCircle2 size={16} color={isDark ? '#f4f4f5' : '#0f172a'} />
                    )}
                    <Text>{editingSchedule?.systemCalendarEventId ? '重新同步系统日历' : '添加并同步'}</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>

            <Card className="py-0">
              <CardHeader className="px-4 pb-3 pt-4">
                <CardTitle className="text-lg">查看日程</CardTitle>
                <CardDescription>{formatDateLabel(selectedDate)} 的安排</CardDescription>
              </CardHeader>
              <CardContent className="gap-3 px-4 pb-4">
                {selectedSchedules.length ? (
                  selectedSchedules.map((item, index) => (
                    <View key={item.id}>
                      {index ? <Separator className="mb-3" /> : null}
                      <View className="rounded-2xl bg-muted/35 px-4 py-4">
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1 gap-2">
                            <Text className="text-base font-semibold">{item.title}</Text>
                            <View className="flex-row flex-wrap gap-3">
                              <View className="flex-row items-center gap-1.5">
                                <Clock3 size={14} color="#0f766e" />
                                <Text className="text-xs text-muted-foreground">
                                  {item.startTime} - {item.endTime}
                                </Text>
                              </View>
                              {item.location ? (
                                <View className="flex-row items-center gap-1.5">
                                  <MapPin size={14} color="#0f766e" />
                                  <Text className="text-xs text-muted-foreground">{item.location}</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text className="text-xs text-muted-foreground">
                              {item.calendarTitle
                                ? `同步日历：${item.calendarTitle} · 提前 ${item.reminderMinutesBefore ?? 0} 分钟`
                                : '还没有同步到系统日历'}
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                              最近同步：{formatSyncLabel(item.lastSyncedAt)}
                            </Text>
                            {item.notes ? (
                              <Text className="text-sm text-muted-foreground">{item.notes}</Text>
                            ) : null}
                          </View>
                          <View className="flex-row gap-2">
                            <Button variant="outline" size="icon" onPress={() => editSchedule(item)}>
                              <Pencil size={16} color={isDark ? '#f4f4f5' : '#0f172a'} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={pendingActionId === item.id}
                              onPress={() => void openInSystemCalendar(item)}>
                              <ExternalLink size={16} color="#0f766e" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={pendingActionId === item.id}
                              onPress={() => deleteSchedule(item)}>
                              <Trash2 size={16} color="#ef4444" />
                            </Button>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="rounded-2xl border border-dashed border-border px-4 py-10">
                    <Text className="text-center text-sm text-muted-foreground">
                      这一天还没有安排。先在上方填写内容，再点“添加日程”或“添加并同步”即可。
                    </Text>
                  </View>
                )}
              </CardContent>
            </Card>
          </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
