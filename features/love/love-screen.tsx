import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { Link, Stack } from 'expo-router';
import { Heart, MessageCircle, Star } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoveScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background">
        <Stack.Screen options={{ title: t('love.title'), headerTransparent: false }} />
        <View className="items-center gap-8 px-4 pt-16 pb-8">
          <View className="items-center justify-center h-20 w-20 rounded-3xl bg-primary/10">
            <Heart size={36} color="currentColor" strokeWidth={1.5} />
          </View>

          <View className="items-center gap-2">
            <Text className="text-2xl font-semibold tracking-tight">{t('love.empty_title')}</Text>
            <Text className="max-w-xs text-sm leading-6 text-center text-muted-foreground">
              {t('love.empty_subtitle')}
            </Text>
          </View>

          <View className="w-full max-w-sm gap-3">
            <Card className="py-0 border-border bg-card shadow-sm shadow-black/5">
              <CardContent className="flex-row items-center gap-3 px-4 py-4">
                <View className="items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                  <Star size={18} color="currentColor" strokeWidth={2} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-medium">{t('love.starred_title')}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {t('love.starred_subtitle')}
                  </Text>
                </View>
              </CardContent>
            </Card>

            <Card className="py-0 border-border bg-card shadow-sm shadow-black/5">
              <CardContent className="flex-row items-center gap-3 px-4 py-4">
                <View className="items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                  <MessageCircle size={18} color="currentColor" strokeWidth={2} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-medium">{t('love.saved_title')}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {t('love.saved_subtitle')}
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>

          <Link href="/chat" asChild>
            <Button className="w-full max-w-sm">
              <Text>{t('love.start_chat')}</Text>
            </Button>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
