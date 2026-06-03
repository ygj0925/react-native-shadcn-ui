import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ArrowRight, CalendarDays, Heart, MessageCircle, Sparkles } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Stack.Screen options={{ title: t('main.title'), headerTransparent: false }} />
        <View className="w-full max-w-5xl mx-auto px-5 pt-6 gap-8">
          {/* ─── Hero Section ─── */}
          <View className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-xl shadow-primary/20">
            <View className="px-6 py-8 gap-6">
              <View className="gap-4">
                <View className="self-start px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20">
                  <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-white/90">
                    {t('main.eyebrow')}
                  </Text>
                </View>
                <View className="gap-2">
                  <Text className="text-[28px] font-bold tracking-tight text-white leading-tight">
                    {t('main.hero_title')}
                  </Text>
                  <Text className="text-[15px] leading-6 text-white/80 max-w-lg">
                    {t('main.hero_subtitle')}
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-3">
                <Link href="/chat" asChild>
                  <Button variant="secondary" className="rounded-xl">
                    <Sparkles size={16} className="text-secondary-foreground" strokeWidth={2} />
                    <Text className="font-medium">{t('main.start_chatting')}</Text>
                  </Button>
                </Link>
                <Link href="/chat" asChild>
                  <Button variant="glass" className="rounded-xl border-white/20">
                    <Text className="text-white font-medium">{t('main.open_auth')}</Text>
                  </Button>
                </Link>
              </View>
            </View>
          </View>

          {/* ─── Stats Cards ─── */}
          <View className="flex-row gap-4">
            <Card className="flex-1 py-0 border-border/60">
              <CardContent className="gap-1.5 px-5 py-5">
                <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('main.active_spaces')}</Text>
                <Text className="text-3xl font-bold tracking-tight text-foreground">4</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {t('main.active_spaces_detail')}
                </Text>
              </CardContent>
            </Card>
            <Card className="flex-1 py-0 border-border/60">
              <CardContent className="gap-1.5 px-5 py-5">
                <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('main.primary_intent')}</Text>
                <Text className="text-2xl font-bold tracking-tight text-foreground">{t('main.primary_intent_value')}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {t('main.primary_intent_detail')}
                </Text>
              </CardContent>
            </Card>
          </View>

          {/* ─── Quick Links ─── */}
          <View className="gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href as never} asChild>
                  <Card variant="ghost" className="w-full py-0 border border-border/60">
                    <CardHeader className="flex-row items-center justify-between px-5 py-5">
                      <View className="flex-row items-center gap-4">
                        <View className={cn(
                          'items-center justify-center h-12 w-12 rounded-2xl',
                          isDark ? 'bg-primary/15' : 'bg-primary/8'
                        )}>
                          <Icon size={20} className="text-primary" strokeWidth={1.8} />
                        </View>
                        <View className="gap-1">
                          <CardTitle className="text-[15px]">{item.title}</CardTitle>
                          <CardDescription className="text-[13px]">{item.description}</CardDescription>
                        </View>
                      </View>
                      <ArrowRight size={18} className="text-muted-foreground/60" strokeWidth={2} />
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
