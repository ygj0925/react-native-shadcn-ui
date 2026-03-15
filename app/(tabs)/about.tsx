import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { getItem, setItem } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Calendar } from 'react-native-calendars';
import { CalendarDays, Clock3, MapPin, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Alert, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

type ScheduleItem = {
  id: string;
  title: string;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
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

function formatDateLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(parsed);
}

function buildMarkedDates(schedules: ScheduleItem[], selectedDate: string) {
  const dotsByDate = schedules.reduce<Record<string, { marked?: boolean; dotColor?: string }>>(
    (accumulator, item) => {
      accumulator[item.date] = {
        ...(accumulator[item.date] ?? {}),
        marked: true,
        dotColor: '#0f766e',
      };
      return accumulator;
    },
    {}
  );

  return {
    ...dotsByDate,
    [selectedDate]: {
      ...(dotsByDate[selectedDate] ?? {}),
      selected: true,
      selectedColor: '#0f766e',
      disableTouchEvent: true,
    },
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

  React.useEffect(() => {
    const storedSchedules = getItem<ScheduleItem[]>(STORAGE_KEY) ?? [];
    const normalizedSchedules = storedSchedules.sort((left, right) => {
      if (left.date === right.date) {
        return left.startTime.localeCompare(right.startTime);
      }
      return left.date.localeCompare(right.date);
    });

    setSchedules(normalizedSchedules);
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

  function resetForm(nextDate = selectedDate) {
    setEditingId(null);
    setSelectedDate(nextDate);
    setForm(createEmptyForm());
  }

  function updateForm<K extends keyof ScheduleForm>(key: K, value: ScheduleForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSave() {
    if (!form.title.trim()) {
      Alert.alert('请填写日程标题');
      return;
    }

    const payload: ScheduleItem = {
      id: editingId ?? `${Date.now()}`,
      title: form.title.trim(),
      notes: form.notes.trim(),
      date: selectedDate,
      startTime: form.startTime.trim() || '09:00',
      endTime: form.endTime.trim() || '10:00',
      location: form.location.trim(),
      createdAt: editingId
        ? schedules.find((item) => item.id === editingId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    setSchedules((current) => {
      const nextSchedules = editingId
        ? current.map((item) => (item.id === editingId ? payload : item))
        : [...current, payload];

      return nextSchedules.sort((left, right) => {
        if (left.date === right.date) {
          return left.startTime.localeCompare(right.startTime);
        }
        return left.date.localeCompare(right.date);
      });
    });

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

  function onDelete(id: string) {
    Alert.alert('删除日程', '确认删除这条日程吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          setSchedules((current) => current.filter((item) => item.id !== id));
          if (editingId === id) {
            resetForm(selectedDate);
          }
        },
      },
    ]);
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
                用左侧日历选日期，右侧快速新建和维护日程。当前数据会保存在本地，下次打开还能继续用。
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
                    <CardDescription>点选日期后查看或安排当天日程</CardDescription>
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
                <CardDescription>快速浏览接下来要处理的事项</CardDescription>
              </CardHeader>
              <CardContent className="gap-3 px-4 pb-4">
                {upcomingSchedules.length ? (
                  upcomingSchedules.map((item) => (
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
                          {item.location ? (
                            <Text className="text-xs text-muted-foreground">{item.location}</Text>
                          ) : null}
                        </View>
                        <Button variant="ghost" size="icon" onPress={() => onDelete(item.id)}>
                          <Trash2 size={16} color="#ef4444" />
                        </Button>
                      </View>
                    </Pressable>
                  ))
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
                    <CardTitle className="text-lg">
                      {editingId ? '修改日程' : '新建日程'}
                    </CardTitle>
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
                  <Button onPress={onSave}>
                    <Plus size={16} color="#ffffff" />
                    <Text>{editingId ? '保存修改' : '添加日程'}</Text>
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
                            {item.notes ? (
                              <Text className="text-sm leading-6 text-muted-foreground">
                                {item.notes}
                              </Text>
                            ) : (
                              <Text className="text-sm text-muted-foreground">暂无备注</Text>
                            )}
                          </View>

                          <View className="flex-row gap-2">
                            <Button variant="outline" size="icon" onPress={() => onEdit(item)}>
                              <Pencil size={16} color={isDark ? '#f4f4f5' : '#0f172a'} />
                            </Button>
                            <Button variant="ghost" size="icon" onPress={() => onDelete(item.id)}>
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
                      这一天还没有安排。先在上方填写内容，再点“添加日程”即可。
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
