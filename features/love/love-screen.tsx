import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Heart, MessageCircle, Star } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoveScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Stack.Screen options={{ title: t('love.title'), headerTransparent: false }} />
        <View className="items-center gap-10 px-6 pt-20 pb-10">
          <View className={cn(
            'items-center justify-center h-24 w-24 rounded-3xl shadow-lg',
            isDark ? 'bg-primary/15 shadow-primary/10' : 'bg-primary/8 shadow-primary/5'
          )}>
            <Heart size={40} className="text-primary" strokeWidth={1.5} />
          </View>

          <View className="items-center gap-3">
            <Text className="text-[26px] font-bold tracking-tight text-foreground">{t('love.empty_title')}</Text>
            <Text className="max-w-xs text-[15px] leading-6 text-center text-muted-foreground">
              {t('love.empty_subtitle')}
            </Text>
          </View>

          <View className="w-full max-w-sm gap-4">
            <Card className="py-0 border-border/60 bg-card">
              <CardContent className="flex-row items-center gap-4 px-5 py-5">
                <View className={cn(
                  'items-center justify-center h-11 w-11 rounded-xl',
                  isDark ? 'bg-primary/15' : 'bg-primary/8'
                )}>
                  <Star size={18} className="text-primary" strokeWidth={1.8} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-[15px] font-semibold text-foreground">{t('love.starred_title')}</Text>
                  <Text className="text-xs text-muted-foreground leading-4">
                    {t('love.starred_subtitle')}
                  </Text>
                </View>
              </CardContent>
            </Card>

            <Card className="py-0 border-border/60 bg-card">
              <CardContent className="flex-row items-center gap-4 px-5 py-5">
                <View className={cn(
                  'items-center justify-center h-11 w-11 rounded-xl',
                  isDark ? 'bg-primary/15' : 'bg-primary/8'
                )}>
                  <MessageCircle size={18} className="text-primary" strokeWidth={1.8} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-[15px] font-semibold text-foreground">{t('love.saved_title')}</Text>
                  <Text className="text-xs text-muted-foreground leading-4">
                    {t('love.saved_subtitle')}
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>

          <Link href="/chat" asChild>
            <Button className="w-full max-w-sm rounded-xl h-12">
              <Text className="font-semibold">{t('love.start_chat')}</Text>
            </Button>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
