import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { Link, Stack } from 'expo-router';
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
    <Card className="min-w-[150px] flex-1 border-primary-foreground/10 bg-primary-foreground/10 py-0 shadow-none">
      <CardContent className="gap-1 px-4 py-4">
        <Text className="text-xs text-primary-foreground/75">{label}</Text>
        <Text className="text-3xl font-semibold tracking-tight text-primary-foreground">{value}</Text>
        <Text className="text-xs text-primary-foreground/75">{detail}</Text>
      </CardContent>
    </Card>
  );
}

export default function HomeScreen() {
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
      <ScrollView className="flex-1 bg-background">
        <Stack.Screen options={{ title: t('home.title'), headerTransparent: false }} />

        <View className="w-full max-w-6xl gap-4 px-4 pt-4 pb-7 mx-auto">
          <Card className="py-0 overflow-hidden border-0 shadow-sm bg-primary shadow-black/5">
            <CardContent className="gap-5 px-5 py-6">
              <View className="flex-row items-start justify-between gap-4">
                <View className="max-w-3xl gap-2">
                  <View className="self-start px-3 py-1 border rounded-full border-primary-foreground/20 bg-primary-foreground/10">
                    <Text className="text-xs font-medium uppercase tracking-[1.2px] text-primary-foreground/80">
                      {t('home.eyebrow')}
                    </Text>
                  </View>
                  <Text className="text-3xl font-semibold leading-tight text-primary-foreground">
                    {t('home.hero_title')}
                  </Text>
                  <Text className="leading-6 text-primary-foreground/80">
                    {t('home.hero_subtitle')}
                  </Text>
                </View>

                <View className="items-center justify-center w-12 h-12 rounded-2xl bg-primary-foreground/10">
                  <Sparkles size={20} color="currentColor" strokeWidth={2.2} />
                </View>
              </View>

              <View className="flex-row flex-wrap gap-3">
                <MetricCard label={t('home.metric_pending')} value="6" detail={t('home.metric_pending_detail')} />
                <MetricCard label={t('home.metric_meetings')} value="3" detail={t('home.metric_meetings_detail')} />
                <MetricCard label={t('home.metric_services')} value="12" detail={t('home.metric_services_detail')} />
              </View>
            </CardContent>
          </Card>

          <View className="gap-4">
            <View className="px-1">
              <Text className="text-lg font-semibold tracking-tight">{t('home.primary_title')}</Text>
              <Text className="text-sm text-muted-foreground">
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
                      className="min-w-[260px] flex-1 justify-start rounded-2xl border border-border bg-card px-0 py-0">
                      <Card className="w-full py-0 border-0 shadow-none">
                        <CardHeader className="gap-3 px-5 pt-5 pb-3">
                          <View className="items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
                            <Icon size={22} color="currentColor" strokeWidth={2} />
                          </View>
                          <View className="gap-1">
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                          </View>
                        </CardHeader>
                        <CardContent className="flex-row items-center justify-between px-5 pb-5">
                          <Text className="text-xs text-muted-foreground">{t('home.enter_hint')}</Text>
                          <ArrowRight size={18} color="currentColor" strokeWidth={2} />
                        </CardContent>
                      </Card>
                    </Button>
                  </Link>
                );
              })}
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4">
            <Card className="min-w-[280px] flex-1 py-0">
              <CardHeader className="px-5 pt-5 pb-2">
                <CardTitle>{t('home.todo_title')}</CardTitle>
                <CardDescription>{t('home.todo_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="gap-3 px-5 pb-5">
                {todoItems.map((item, index) => (
                  <View key={item.title}>
                    {index ? <Separator className="mb-3" /> : null}
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text className="font-medium">{item.title}</Text>
                        <Text className="text-xs text-muted-foreground">{item.meta}</Text>
                      </View>
                      <View className="rounded-full bg-muted px-3 py-1.5">
                        <Text className="text-xs text-muted-foreground">{item.tag}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>

            <Card className="min-w-[280px] flex-1 py-0">
              <CardHeader className="px-5 pt-5 pb-2">
                <CardTitle>{t('home.quick_title')}</CardTitle>
                <CardDescription>{t('home.quick_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="gap-3 px-5 pb-5">
                {quickServices.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <View key={item.title}>
                      {index ? <Separator className="mb-3" /> : null}
                      <View className="flex-row items-center gap-3">
                        <View className="items-center justify-center w-10 h-10 rounded-xl bg-muted">
                          <Icon size={18} color="currentColor" strokeWidth={2} />
                        </View>
                        <View className="flex-1 gap-0.5">
                          <Text className="font-medium">{item.title}</Text>
                          <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </CardContent>
            </Card>
          </View>

          <Card className="py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>{t('home.modules_title')}</CardTitle>
              <CardDescription>{t('home.modules_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="gap-4 px-5 pb-5">
              <View className="flex-row flex-wrap gap-4">
                {companyModules.map((item) => {
                  const Icon = item.icon;

                  return (
                    <View
                      key={item.title}
                      className="min-w-[220px] flex-1 rounded-2xl border border-border bg-muted/25 px-4 py-4">
                      <View className="gap-3">
                        <View className="items-center justify-center h-11 w-11 rounded-2xl bg-background">
                          <Icon size={20} color="currentColor" strokeWidth={2} />
                        </View>
                        <View className="gap-1">
                          <Text className="font-medium">{item.title}</Text>
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
