import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleAlert,
  ClipboardCheck,
  FileText,
  Headphones,
  MessageSquareText,
  ReceiptText,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-white/15 px-5 py-4 backdrop-blur-sm">
      <Text className="text-xs font-medium text-white/70 tracking-wide uppercase">{label}</Text>
      <Text className="text-3xl font-bold tracking-tight text-white mt-1.5">{value}</Text>
      <Text className="text-xs text-white/60 mt-1">{detail}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primaryActions = [
    { title: t('home.primary.approval_title'), description: t('home.primary.approval_desc'), href: '/chat', icon: ClipboardCheck },
    { title: t('home.primary.meeting_title'), description: t('home.primary.meeting_desc'), href: '/about', icon: CalendarDays },
    { title: t('home.primary.qa_title'), description: t('home.primary.qa_desc'), href: '/chat', icon: MessageSquareText },
    { title: t('home.primary.announce_title'), description: t('home.primary.announce_desc'), href: '/love', icon: FileText },
  ];

  const quickServices = [
    { title: t('home.quick.reimburse_title'), subtitle: t('home.quick.reimburse_subtitle'), icon: ReceiptText },
    { title: t('home.quick.ticket_title'), subtitle: t('home.quick.ticket_subtitle'), icon: Headphones },
    { title: t('home.quick.contract_title'), subtitle: t('home.quick.contract_subtitle'), icon: ScanSearch },
    { title: t('home.quick.directory_title'), subtitle: t('home.quick.directory_subtitle'), icon: Users },
  ];

  const todoItems = [
    { title: t('home.todo.budget_title'), meta: t('home.todo.budget_meta'), tag: t('home.todo.budget_tag') },
    { title: t('home.todo.weekly_title'), meta: t('home.todo.weekly_meta'), tag: t('home.todo.weekly_tag') },
    { title: t('home.todo.security_title'), meta: t('home.todo.security_meta'), tag: t('home.todo.security_tag') },
  ];

  const companyModules = [
    { title: t('home.modules.hr_title'), description: t('home.modules.hr_desc'), icon: BriefcaseBusiness },
    { title: t('home.modules.process_title'), description: t('home.modules.process_desc'), icon: ShieldCheck },
    { title: t('home.modules.risk_title'), description: t('home.modules.risk_desc'), icon: CircleAlert },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Stack.Screen options={{ title: t('home.title'), headerTransparent: false }} />

        <View className="w-full max-w-6xl mx-auto px-5 pt-6 gap-8">
          {/* ─── Hero Section ─── */}
          <View className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-xl shadow-primary/20">
            <View className="px-6 py-8 gap-6">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 gap-3 pr-4">
                  <View className="self-start px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20">
                    <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-white/90">
                      {t('home.eyebrow')}
                    </Text>
                  </View>
                  <Text className="text-[28px] font-bold leading-tight text-white tracking-tight">
                    {t('home.hero_title')}
                  </Text>
                  <Text className="text-[15px] leading-6 text-white/80">
                    {t('home.hero_subtitle')}
                  </Text>
                </View>
                <View className="items-center justify-center w-14 h-14 rounded-2xl bg-white/15 border border-white/10">
                  <Sparkles size={24} color="white" strokeWidth={2} />
                </View>
              </View>

              <View className="flex-row gap-3">
                <MetricCard label={t('home.metric_pending')} value="6" detail={t('home.metric_pending_detail')} />
                <MetricCard label={t('home.metric_meetings')} value="3" detail={t('home.metric_meetings_detail')} />
                <MetricCard label={t('home.metric_services')} value="12" detail={t('home.metric_services_detail')} />
              </View>
            </View>
          </View>

          {/* ─── Primary Actions ─── */}
          <View className="gap-5">
            <View className="px-1">
              <Text className="text-xl font-bold tracking-tight text-foreground">
                {t('home.primary_title')}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                {t('home.primary_subtitle')}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-4">
              {primaryActions.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.title} href={item.href as never} asChild>
                    <Button
                      variant="ghost"
                      className="min-w-[280px] flex-1 justify-start rounded-2xl border border-border/60 bg-card px-0 py-0"
                    >
                      <Card variant="ghost" className="w-full py-0 border-0">
                        <CardHeader className="gap-4 px-5 pt-5 pb-3">
                          <View className={cn(
                            'items-center justify-center w-12 h-12 rounded-2xl',
                            isDark ? 'bg-primary/15' : 'bg-primary/8'
                          )}>
                            <Icon size={22} className="text-primary" strokeWidth={1.8} />
                          </View>
                          <View className="gap-1.5">
                            <CardTitle className="text-[15px]">{item.title}</CardTitle>
                            <CardDescription className="text-[13px] leading-5">{item.description}</CardDescription>
                          </View>
                        </CardHeader>
                        <CardContent className="flex-row items-center justify-between px-5 pb-5">
                          <Text className="text-xs font-medium text-muted-foreground">{t('home.enter_hint')}</Text>
                          <ArrowRight size={16} className="text-muted-foreground/60" strokeWidth={2} />
                        </CardContent>
                      </Card>
                    </Button>
                  </Link>
                );
              })}
            </View>
          </View>

          {/* ─── Todo & Quick Services ─── */}
          <View className="flex-row flex-wrap gap-5">
            {/* Todo */}
            <Card className="min-w-[300px] flex-1 py-0 border-border/60">
              <CardHeader className="px-6 pt-6 pb-3">
                <CardTitle className="text-base">{t('home.todo_title')}</CardTitle>
                <CardDescription className="text-[13px]">{t('home.todo_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="gap-0 px-6 pb-6">
                {todoItems.map((item, index) => (
                  <View key={item.title}>
                    {index > 0 && <Separator className="my-3.5" />}
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1 gap-1">
                        <Text className="text-[15px] font-medium text-foreground">{item.title}</Text>
                        <Text className="text-xs text-muted-foreground">{item.meta}</Text>
                      </View>
                      <View className={cn(
                        'rounded-full px-3 py-1.5',
                        isDark ? 'bg-white/8' : 'bg-black/4'
                      )}>
                        <Text className="text-xs font-medium text-muted-foreground">{item.tag}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Quick Services */}
            <Card className="min-w-[300px] flex-1 py-0 border-border/60">
              <CardHeader className="px-6 pt-6 pb-3">
                <CardTitle className="text-base">{t('home.quick_title')}</CardTitle>
                <CardDescription className="text-[13px]">{t('home.quick_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="gap-0 px-6 pb-6">
                {quickServices.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <View key={item.title}>
                      {index > 0 && <Separator className="my-3.5" />}
                      <View className="flex-row items-center gap-4">
                        <View className={cn(
                          'items-center justify-center w-11 h-11 rounded-xl',
                          isDark ? 'bg-white/8' : 'bg-black/4'
                        )}>
                          <Icon size={18} className="text-muted-foreground" strokeWidth={1.8} />
                        </View>
                        <View className="flex-1 gap-0.5">
                          <Text className="text-[15px] font-medium text-foreground">{item.title}</Text>
                          <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </CardContent>
            </Card>
          </View>

          {/* ─── Company Modules ─── */}
          <Card className="py-0 border-border/60">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-base">{t('home.modules_title')}</CardTitle>
              <CardDescription className="text-[13px]">{t('home.modules_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="gap-4 px-6 pb-6">
              <View className="flex-row flex-wrap gap-4">
                {companyModules.map((item) => {
                  const Icon = item.icon;
                  return (
                    <View
                      key={item.title}
                      className={cn(
                        'min-w-[240px] flex-1 rounded-2xl border px-5 py-5',
                        isDark ? 'border-white/8 bg-white/4' : 'border-black/5 bg-black/2'
                      )}
                    >
                      <View className="gap-4">
                        <View className={cn(
                          'items-center justify-center h-12 w-12 rounded-2xl',
                          isDark ? 'bg-white/8' : 'bg-black/4'
                        )}>
                          <Icon size={20} className="text-muted-foreground" strokeWidth={1.8} />
                        </View>
                        <View className="gap-1.5">
                          <Text className="text-[15px] font-semibold text-foreground">{item.title}</Text>
                          <Text className="text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
