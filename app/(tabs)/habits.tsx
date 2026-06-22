import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Flame } from 'lucide-react-native';

export default function HabitsScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <View className="w-20 h-20 items-center justify-center rounded-3xl bg-primary/10">
          <Flame size={36} className="text-primary" strokeWidth={1.5} />
        </View>
        <Text className="text-xl font-bold text-foreground">习惯追踪</Text>
        <Text className="text-sm text-muted-foreground text-center leading-6">
          养成好习惯，每天进步一点点{'\n'}即将上线...
        </Text>
      </View>
    </SafeAreaView>
  );
}
