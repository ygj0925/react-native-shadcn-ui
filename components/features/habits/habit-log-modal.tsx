import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { Habit, HabitLog } from '@/lib/store/habits';
import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';

type HabitLogModalProps = {
  visible: boolean;
  habit?: Habit;
  existingLog?: HabitLog;
  date?: string;
  onClose: () => void;
  onSave: (value: number, note: string) => void;
};

export function HabitLogModal({
  visible,
  habit,
  existingLog,
  date,
  onClose,
  onSave,
}: HabitLogModalProps) {
  const [value, setValue] = React.useState(String(existingLog?.value ?? 1));
  const [note, setNote] = React.useState(existingLog?.note ?? '');

  React.useEffect(() => {
    if (visible) {
      setValue(String(existingLog?.value ?? habit?.targetValue ?? 1));
      setNote(existingLog?.note ?? '');
    }
  }, [visible, existingLog, habit]);

  if (!habit) return null;

  const handleSave = () => {
    const num = parseInt(value, 10) || 0;
    onSave(Math.max(0, num), note.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50 px-6">
        <Pressable className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 gap-4">
          <View className="flex-row items-center gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: habit.color }}>
              <Text className="text-2xl">{habit.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
                {habit.name}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {date ?? '今天'} · 目标 {habit.targetValue} {habit.unit}
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">完成数值</Text>
            <Input
              value={value}
              onChangeText={setValue}
              keyboardType="number-pad"
              placeholder={`${habit.targetValue}`}
              className="h-12 rounded-xl border-border bg-muted text-foreground"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">备注（可选）</Text>
            <Input
              value={note}
              onChangeText={setNote}
              placeholder="添加备注..."
              className="h-12 rounded-xl border-border bg-muted text-foreground"
            />
          </View>

          <View className="flex-row gap-3 pt-1">
            <Button variant="outline" className="flex-1 rounded-xl" onPress={onClose}>
              <Text>取消</Text>
            </Button>
            <Button className="flex-1 rounded-xl bg-primary" onPress={handleSave}>
              <Text className="text-primary-foreground">保存</Text>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
