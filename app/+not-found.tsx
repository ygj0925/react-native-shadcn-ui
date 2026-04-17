import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/themeToggle';

const SCREEN_OPTIONS = {
  title: 'Not Found',
  headerShown: true,
  headerShadowVisible: false,
  headerRight: () => <ThemeToggle />,
};

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center bg-background px-6 py-16">
        <View className="w-full max-w-md items-center gap-6">
          <View className="flex-row items-end gap-1">
            <Text className="text-7xl font-black leading-none tracking-tighter text-foreground">
              4
            </Text>
            <View className="relative items-center justify-center">
              <Text className="text-7xl font-black leading-none tracking-tighter text-foreground">
                0
              </Text>
              <View className="absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 h-3 w-3 rounded-full bg-primary" />
            </View>
            <Text className="text-7xl font-black leading-none tracking-tighter text-foreground">
              4
            </Text>
          </View>

          <View className="flex-row items-center w-48 gap-3">
            <Separator className="flex-1" />
            <View className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
            <Separator className="flex-1" />
          </View>

          <View className="gap-2 items-center">
            <Text className="text-2xl font-semibold tracking-tight text-foreground">
              Page not found
            </Text>
            <Text className="text-center text-sm leading-relaxed text-muted-foreground">
              The page you're looking for doesn't exist — it may have been moved or deleted.
            </Text>
          </View>

          <Button className="w-full" onPress={() => router.push('/')}>
            <Text>Return home</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
