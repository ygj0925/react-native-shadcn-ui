import { Link, Stack, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollView, Text, View } from 'react-native';
import { ThemeToggle } from '@/components/themeToggle';

const SCREEN_OPTIONS = {
  title: '登录页面',
  headerTransparent: true,
  headerShown: false,
  headerRight: () => <ThemeToggle />,
};

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-col items-center justify-center min-h-screen px-6 py-16 font-sans">
        <View className="relative z-10 flex-col items-center w-full max-w-md gap-6 text-center">
          {/* 404 数字 */}
          <View className="flex-row items-center gap-1 select-none" aria-label="404">
            <Text className="text-[7rem] md:text-[9rem] font-black leading-none tracking-tighter text-foreground">
              4
            </Text>
            <Text className="relative text-[7rem] md:text-[9rem] font-black leading-none tracking-tighter text-foreground">
              0
              <Text className="absolute inset-0 items-center justify-center">
                <Text className="w-3 h-3 rounded-full bg-primary dark:bg-primary" />
              </Text>
            </Text>
            <Text className="text-[7rem] md:text-[9rem] font-black leading-none tracking-tighter text-foreground">
              4
            </Text>
          </View>

          {/* 分隔线 */}
          <View className="flex-row items-center w-48 gap-3">
            <Separator className="flex-1" />
            <Text className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 flex-shrink-0" />
            <Separator className="flex-1" />
          </View>

          {/* 标题与描述 */}
          <View className="flex-col gap-2 justify-center items-center">
            <Text className="text-2xl font-bold tracking-tight text-foreground text-balance">
              页面未找到
            </Text>
            <Text className="text-sm leading-relaxed text-muted-foreground text-pretty">
              你访问的页面不存在，可能已被移动或删除。
            </Text>
            <Text className="text-sm leading-relaxed text-muted-foreground text-pretty">
              请检查链接是否正确，或返回主页。
            </Text>
          </View>

          {/* 操作按钮 */}
          <View className="flex-col items-center w-full gap-3 sm:flex-row sm:w-auto">
            <Button onPress={() => { router.push('/') }}>
              <Text className="text-base leading-relaxed text-white dark:text-black text-pretty">返回主页</Text>
            </Button>
          </View>
        </View>
      </View>
    </>

  );
}