import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { getItem, setItem } from '@/lib/storage';
import { cn } from '@/lib/utils';
import * as DeviceCalendar from 'expo-calendar';
import { Calendar } from 'react-native-calendars';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Link2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Alert, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

type ScheduleItem = {
  id: string;
  title: string;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
  systemCalendarEventId?: string | null;
  lastSyncedAt?: string | null;
};

type ScheduleForm = {
  title: string;
  notes: string;
  startTime: string;
  endTime: string;
  location: string;
};

const STORAGE_KEY = 'about-schedules';

function createEmptyForm(): ScheduleForm {
  return {
    title: '',
    notes: '',
    startTime: '',
    endTime: '',
    location: '',
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
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(parsed);
}

function formatDateTimeLabel(value?: string | null) {
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
  const dotsByDate = schedules.reduce<
    Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }>
  >((accumulator, item) => {
    accumulator[item.date] = {
      ...(accumulator[item.date] ?? {}),
      marked: true,
      dotColor: item.systemCalendarEventId ? '#0f766e' : '#f59e0b',
    };
    return accumulator;
  }, {});

  return {
    ...dotsByDate,
    [selectedDate]: {
      ...(dotsByDate[selectedDate] ?? {}),
      selected: true,
      selectedColor: '#0f766e',
    },
  };
}

function normalizeTimeValue(value: string, fallback: string) {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);

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

function buildSystemEventDetails(item: ScheduleItem) {
  return {
    title: item.title,
    notes: item.notes || undefined,
    location: item.location || undefined,
    startDate: combineDateAndTime(item.date, item.startTime),
    endDate: combineDateAndTime(item.date, item.endTime),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

  React.useEffect(() => {
    const storedSchedules = getItem<ScheduleItem[]>(STORAGE_KEY) ?? [];
    setSchedules(sortSchedules(storedSchedules));
  }, []);

  React.useEffect(() => {
    void setItem(STORAGE_KEY, schedules);
  }, [schedules]);

  const selectedSchedules = React.useMemo(
    () =>
      schedules
        .filter((item) => item.date === selectedDate)
        .sort((left, right) => left.startTime.localeCompare(right.startTime)),
    [schedules, selectedDate]
  );

  const upcomingSchedules = React.useMemo(
    () =>
      schedules
        .filter((item) => item.date >= today)
        .sort((left, right) => {
          if (left.date === right.date) {
            return left.startTime.localeCompare(right.startTime);
          }
          return left.date.localeCompare(right.date);
        })
        .slice(0, 6),
    [schedules, today]
  );

  const markedDates = React.useMemo(
    () => buildMarkedDates(schedules, selectedDate),
    [schedules, selectedDate]
  );

  const editingSchedule = React.useMemo(
    () => schedules.find((item) => item.id === editingId) ?? null,
    [editingId, schedules]
  );

  function resetForm(nextDate = selectedDate) {
    setEditingId(null);
    setSelectedDate(nextDate);
    setForm(createEmptyForm());
  }

  function updateForm<K extends keyof ScheduleForm>(key: K, value: ScheduleForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function upsertSchedule(item: ScheduleItem) {
    setSchedules((current) => {
      const exists = current.some((entry) => entry.id === item.id);
      return sortSchedules(exists ? current.map((entry) => (entry.id === item.id ? item : entry)) : [...current, item]);
    });
  }

  function patchSchedule(id: string, patch: Partial<ScheduleItem>) {
    setSchedules((current) =>
      sortSchedules(current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    );
  }

  function removeSchedule(id: string) {
    setSchedules((current) => current.filter((item) => item.id !== id));
  }

  function buildPayload() {
    const existing = editingSchedule;
    const normalizedStartTime = normalizeTimeValue(form.startTime, existing?.startTime ?? '09:00');
    const normalizedEndTime = normalizeTimeValue(form.endTime, existing?.endTime ?? '10:00');

    if (!form.title.trim()) {
      Alert.alert('请填写日程标题');
      return null;
    }

    if (timeToMinutes(normalizedEndTime) <= timeToMinutes(normalizedStartTime)) {
      Alert.alert('结束时间需要晚于开始时间');
      return null;
    }

    return {
      id: editingId ?? `${Date.now()}`,
      title: form.title.trim(),
      notes: form.notes.trim(),
      date: selectedDate,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      location: form.location.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      systemCalendarEventId: existing?.systemCalendarEventId ?? null,
      lastSyncedAt: existing?.lastSyncedAt ?? null,
    } satisfies ScheduleItem;
  }

  async function ensureCalendarReady() {
    if (Platform.OS === 'web') {
      Alert.alert('当前平台不支持系统日历同步', '请在 iPhone 或 iPad 真机上使用这个功能。');
      return false;
    }

    const available = await DeviceCalendar.isAvailableAsync();
    if (!available) {
      Alert.alert('系统日历不可用');
      return false;
    }

    const permission = await DeviceCalendar.getCalendarPermissionsAsync();
    if (permission.status === 'granted') {
      return true;
    }

    const requested = await DeviceCalendar.requestCalendarPermissionsAsync();
    if (requested.status !== 'granted') {
      Alert.alert('没有获得日历权限', '请在系统设置里允许访问日历后再试。');
      return false;
    }

    return true;
  }

  async function syncWithSystemDialog(item: ScheduleItem) {
    const ready = await ensureCalendarReady();
    if (!ready) {
      return;
    }

    setPendingActionId(item.id);

    try {
      if (item.systemCalendarEventId) {
        await DeviceCalendar.updateEventAsync(item.systemCalendarEventId, buildSystemEventDetails(item));
        patchSchedule(item.id, { lastSyncedAt: new Date().toISOString() });
        Alert.alert('系统日历已更新');
        return;
      }

      const result = await DeviceCalendar.createEventInCalendarAsync(buildSystemEventDetails(item));

      if ((result.action === 'saved' || result.action === 'done') && result.id) {
        patchSchedule(item.id, {
          systemCalendarEventId: result.id,
          lastSyncedAt: new Date().toISOString(),
        });
        Alert.alert('已同步到系统日历');
        return;
      }

      if (result.action === 'done' && Platform.OS === 'android') {
        patchSchedule(item.id, { lastSyncedAt: new Date().toISOString() });
        Alert.alert('系统日历页面已打开', 'Android 无法返回事件 ID，如已保存请在系统日历中确认。');
      }
    } catch (error) {
      Alert.alert('同步失败', error instanceof Error ? error.message : '系统日历操作没有成功完成。');
    } finally {
      setPendingActionId(null);
    }
  }

  async function openInSystemCalendar(item: ScheduleItem) {
    if (!item.systemCalendarEventId) {
      await syncWithSystemDialog(item);
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
      Alert.alert('打开失败', error instanceof Error ? error.message : '无法打开系统日历中的这条事件。');
    } finally {
      setPendingActionId(null);
    }
  }

  async function deleteScheduleAndSystemEvent(item: ScheduleItem) {
    setPendingActionId(item.id);

    try {
      if (item.systemCalendarEventId) {
        const ready = await ensureCalendarReady();
        if (ready) {
          await DeviceCalendar.deleteEventAsync(item.systemCalendarEventId);
        }
      }
    } catch (error) {
      Alert.alert(
        '系统日历删除失败',
        error instanceof Error ? error.message : '本地日程仍会删除，你可以稍后去系统日历手动确认。'
      );
    } finally {
      removeSchedule(item.id);
      if (editingId === item.id) {
        resetForm(selectedDate);
      }
      setPendingActionId(null);
    }
  }

  async function handleSubmit(syncAfterSave: boolean) {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    upsertSchedule(payload);

    if (payload.systemCalendarEventId) {
      await syncWithSystemDialog(payload);
    } else if (syncAfterSave) {
      await syncWithSystemDialog(payload);
    }

    resetForm(selectedDate);
  }

  function onEdit(item: ScheduleItem) {
    setEditingId(item.id);
    setSelectedDate(item.date);
    setForm({
      title: item.title,
      notes: item.notes,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
    });
  }

  function onDelete(item: ScheduleItem) {
    Alert.alert(
      '删除日程',
      item.systemCalendarEventId ? '这条日程已经同步到系统日历，确认本地和系统一起删除吗？' : '确认删除这条日程吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            void deleteScheduleAndSystemEvent(item);
          },
        },
      ]
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      <View className="mx-auto w-full max-w-7xl gap-4">
        <Card className="overflow-hidden border-0 bg-teal-950 py-0 shadow-xl shadow-teal-950/20">
          <CardContent className="px-5 py-5">
            <View className="gap-2">
              <Text className="text-sm font-medium text-teal-100/80">日程管理</Text>
              <Text className="text-3xl font-semibold text-white">把勘察、拜访和待办集中到一个页面</Text>
              <Text className="text-sm leading-6 text-teal-50/85">
                页面里继续用日历管理本地日程，同时支持同步到 iPad 系统日历，方便提醒和跨设备查看。
              </Text>
            </View>
          </CardContent>
        </Card>

        <View className={cn('gap-4', isWideLayout ? 'flex-row items-start' : '')}>
          <View className={cn('gap-4', isWideLayout ? 'w-[42%]' : 'w-full')}>
            <Card className="py-0">
              <CardHeader className="px-4 pb-3 pt-4">
                <View className="flex-row items-center gap-2">
                  <CalendarDays size={18} color="#0f766e" />
                  <View className="flex-1 gap-1">
                    <CardTitle className="text-lg">日历选择</CardTitle>
                    <CardDescription>点选日期后查看、安排或同步当天日程</CardDescription>
                  </View>
                </View>
              </CardHeader>
              <CardContent className="px-2 pb-3">
                <Calendar
                  current={selectedDate}
                  markedDates={markedDates}
                  onDayPress={(day) => setSelectedDate(day.dateString)}
                  theme={{
                    calendarBackground: colorScheme === 'dark' ? '#09090b' : '#ffffff',
                    monthTextColor: colorScheme === 'dark' ? '#fafafa' : '#111827',
                    dayTextColor: colorScheme === 'dark' ? '#f4f4f5' : '#111827',
                    textDisabledColor: colorScheme === 'dark' ? '#52525b' : '#9ca3af',
                    arrowColor: '#0f766e',
                    todayTextColor: '#0f766e',
                    selectedDayTextColor: '#ffffff',
                    textMonthFontWeight: '700',
                    textDayHeaderFontWeight: '600',
                  }}
                  enableSwipeMonths
                  style={{ borderRadius: 18 }}
                />
              </CardContent>
            </Card>

            <Card className="py-0">
              <CardHeader className="px-4 pb-3 pt-4">
                <CardTitle className="text-lg">近期日程</CardTitle>
                <CardDescription>优先处理接下来要安排的事项</CardDescription>
              </CardHeader>
              <CardContent className="gap-3 px-4 pb-4">
                {upcomingSchedules.length ? (
                  upcomingSchedules.map((item) => {
                    const busy = pendingActionId === item.id;

                    return (
                      <Pressable
                        key={item.id}
                        className="rounded-2xl border border-border bg-muted/40 px-4 py-3 active:bg-muted"
                        onPress={() => onEdit(item)}>
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1 gap-1">
                            <Text className="text-sm font-semibold">{item.title}</Text>
                            <Text className="text-xs text-muted-foreground">
                              {formatDateLabel(item.date)} · {item.startTime} - {item.endTime}
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                              {item.systemCalendarEventId ? '已同步系统日历' : '仅本地保存'}
                            </Text>
                          </View>
                          <View className="flex-row gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={busy}
                              onPress={() => {
                                void openInSystemCalendar(item);
                              }}>
                              <ExternalLink size={16} color="#0f766e" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={busy}
                              onPress={() => onDelete(item)}>
                              <Trash2 size={16} color="#ef4444" />
                            </Button>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })
                ) : (
                  <Text className="text-sm text-muted-foreground">
                    还没有未来日程，先从右侧表单创建第一条吧。
                  </Text>
                )}
              </CardContent>
            </Card>
          </View>

          <View className={cn('gap-4', isWideLayout ? 'flex-1' : 'w-full')}>
            <Card className="py-0">
              <CardHeader className="px-4 pb-3 pt-4">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="gap-1">
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
                  <View className="flex-row items-center gap-2">
                    <Link2 size={16} color="#0f766e" />
                    <Text className="text-sm font-medium text-foreground">系统日历同步</Text>
                  </View>
                  <Text className="text-xs leading-5 text-muted-foreground">
                    添加并同步会直接调用系统日历创建或更新事件。已经同步过的日程，保存后也会自动更新系统日历。
                  </Text>
                  {editingSchedule?.systemCalendarEventId ? (
                    <Text className="text-xs text-muted-foreground">
                      最近同步：{formatDateTimeLabel(editingSchedule.lastSyncedAt)}
                    </Text>
                  ) : null}
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium">日程标题</Text>
                  <Input
                    value={form.title}
                    onChangeText={(value) => updateForm('title', value)}
                    placeholder="例如：现场勘察、客户拜访、方案复盘"
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
                    placeholder="项目现场 / 会议室 / 线上会议"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium">备注</Text>
                  <Textarea
                    value={form.notes}
                    onChangeText={(value) => updateForm('notes', value)}
                    placeholder="记录目标、准备事项、参与人员或现场情况"
                    className="min-h-28"
                  />
                </View>

                <View className="flex-row flex-wrap gap-3">
                  <Button
                    onPress={() => {
                      void handleSubmit(false);
                    }}>
                    <Plus size={16} color="#ffffff" />
                    <Text>{editingSchedule?.systemCalendarEventId ? '保存并更新同步' : '添加日程'}</Text>
                  </Button>

                  <Button
                    variant="outline"
                    onPress={() => {
                      void handleSubmit(true);
                    }}>
                    {editingSchedule?.systemCalendarEventId ? (
                      <RefreshCw size={16} color={isDark ? '#f4f4f5' : '#0f172a'} />
                    ) : (
                      <CheckCircle2 size={16} color={isDark ? '#f4f4f5' : '#0f172a'} />
                    )}
                    <Text>{editingSchedule?.systemCalendarEventId ? '重新同步系统日历' : '添加并同步'}</Text>
                  </Button>

                  <Button variant="outline" onPress={() => resetForm(today)}>
                    <Text>清空表单</Text>
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
                  selectedSchedules.map((item, index) => {
                    const busy = pendingActionId === item.id;

                    return (
                      <View key={item.id}>
                        {index ? <Separator className="mb-3" /> : null}
                        <View className="rounded-2xl bg-muted/35 px-4 py-4">
                          <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1 gap-2">
                              <View className="flex-row flex-wrap items-center gap-2">
                                <Text className="text-base font-semibold">{item.title}</Text>
                                <View
                                  className={cn(
                                    'rounded-full px-2.5 py-1',
                                    item.systemCalendarEventId ? 'bg-teal-600/15' : 'bg-amber-500/15'
                                  )}>
                                  <Text
                                    className={cn(
                                      'text-[11px] font-medium',
                                      item.systemCalendarEventId ? 'text-teal-700 dark:text-teal-300' : 'text-amber-700 dark:text-amber-300'
                                    )}>
                                    {item.systemCalendarEventId ? '系统已同步' : '仅本地'}
                                  </Text>
                                </View>
                              </View>

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

                              {item.notes ? (
                                <Text className="text-sm leading-6 text-muted-foreground">{item.notes}</Text>
                              ) : (
                                <Text className="text-sm text-muted-foreground">暂无备注</Text>
                              )}

                              <Text className="text-xs text-muted-foreground">
                                最近同步：{formatDateTimeLabel(item.lastSyncedAt)}
                              </Text>
                            </View>

                            <View className="flex-row gap-2">
                              <Button variant="outline" size="icon" onPress={() => onEdit(item)}>
                                <Pencil size={16} color={isDark ? '#f4f4f5' : '#0f172a'} />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={busy}
                                onPress={() => {
                                  void openInSystemCalendar(item);
                                }}>
                                <ExternalLink size={16} color="#0f766e" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={busy}
                                onPress={() => onDelete(item)}>
                                <Trash2 size={16} color="#ef4444" />
                              </Button>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })
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
  );
}
