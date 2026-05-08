import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { Link, Stack } from 'expo-router';
import { ArrowRight, CalendarDays, Heart, MessageCircle, Sparkles } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const quickLinks = [
    {
      href: '/chat',
      title: t('main.links.chat_title'),
      description: t('main.links.chat_desc'),
      icon: MessageCircle,
    },
    {
      href: '/about',
      title: t('main.links.schedule_title'),
      description: t('main.links.schedule_desc'),
      icon: CalendarDays,
    },
    {
      href: '/love',
      title: t('main.links.favorites_title'),
      description: t('main.links.favorites_desc'),
      icon: Heart,
    },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background">
        <Stack.Screen options={{ title: t('main.title'), headerTransparent: false }} />
        <View className="w-full max-w-5xl gap-4 px-4 pt-4 mx-auto pb-7">
          <Card className="py-0 overflow-hidden border-0 shadow-sm bg-primary shadow-black/5">
            <CardContent className="px-5 py-6">
              <View className="gap-5">
                <View className="self-start px-3 py-1 border rounded-full border-primary-foreground/20 bg-primary-foreground/10">
                  <Text className="text-xs font-medium uppercase tracking-[1.2px] text-primary-foreground/80">
                    {t('main.eyebrow')}
                  </Text>
                </View>
                <View className="gap-2">
                  <Text className="text-3xl font-semibold tracking-tight text-primary-foreground">
                    {t('main.hero_title')}
                  </Text>
                  <Text className="max-w-2xl leading-6 text-primary-foreground/80">
                    {t('main.hero_subtitle')}
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-3">
                  <Link href="/chat" asChild>
                    <Button variant="secondary">
                      <Sparkles size={16} color="currentColor" strokeWidth={2.3} />
                      <Text>{t('main.start_chatting')}</Text>
                    </Button>
                  </Link>
                  <Link href="/assisant" asChild>
                    <Button variant="outline" className="border-primary-foreground/20 bg-primary-foreground/10">
                      <Text className="text-primary-foreground">{t('main.open_auth')}</Text>
                    </Button>
                  </Link>
                </View>
              </View>
            </CardContent>
          </Card>

          <View className="flex-row flex-wrap gap-4">
            <Card className="min-w-[160px] flex-1 py-0">
              <CardContent className="gap-1 px-5 py-5">
                <Text className="text-sm text-muted-foreground">{t('main.active_spaces')}</Text>
                <Text className="text-3xl font-semibold tracking-tight">4</Text>
                <Text className="text-sm text-muted-foreground">
                  {t('main.active_spaces_detail')}
                </Text>
              </CardContent>
            </Card>
            <Card className="min-w-[160px] flex-1 py-0">
              <CardContent className="gap-1 px-5 py-5">
                <Text className="text-sm text-muted-foreground">{t('main.primary_intent')}</Text>
                <Text className="text-2xl font-semibold tracking-tight">{t('main.primary_intent_value')}</Text>
                <Text className="text-sm text-muted-foreground">
                  {t('main.primary_intent_detail')}
                </Text>
              </CardContent>
            </Card>
          </View>

          <View className="gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href as never} asChild>
                  <Card className="w-full py-0 border-0 shadow-none">
                    <CardHeader className="flex-row items-center justify-between px-5 pt-5 pb-2">
                      <View className="flex-row items-center gap-3">
                        <View className="items-center justify-center h-11 w-11 rounded-2xl bg-primary/10">
                          <Icon size={20} color="currentColor" strokeWidth={2} />
                        </View>
                        <View className="gap-1">
                          <CardTitle>{item.title}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </View>
                      </View>
                      <ArrowRight size={18} color="currentColor" strokeWidth={2} />
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
}
