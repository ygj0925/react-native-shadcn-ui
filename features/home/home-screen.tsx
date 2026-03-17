import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
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

const SCREEN_OPTIONS = {
  title: 'Workspace',
  headerTransparent: false,
};

const PRIMARY_ACTIONS = [
  {
    title: '提交审批',
    description: '请假、报销、采购和用印统一入口',
    href: '/chat',
    icon: ClipboardCheck,
  },
  {
    title: '会议与日程',
    description: '查看今天安排、会议室和拜访计划',
    href: '/about',
    icon: CalendarDays,
  },
  {
    title: '内部问答助手',
    description: '快速查制度、流程、模板和常见问题',
    href: '/chat',
    icon: MessageSquareText,
  },
  {
    title: '公告与制度',
    description: '查看最新通知、制度更新和安全提醒',
    href: '/love',
    icon: FileText,
  },
];

const QUICK_SERVICES = [
  { title: '报销进度', subtitle: '2 笔待财务处理', icon: ReceiptText },
  { title: '工单支持', subtitle: 'IT / 行政 / 人事服务台', icon: Headphones },
  { title: '合同审阅', subtitle: '法务模板与流程入口', icon: ScanSearch },
  { title: '组织通讯录', subtitle: '快速查找同事和部门', icon: Users },
];

const TODO_ITEMS = [
  {
    title: '预算追加申请',
    meta: '今天 14:00 前提交',
    tag: '待处理',
  },
  {
    title: '周会材料确认',
    meta: '市场中心 · 16:30',
    tag: '会议',
  },
  {
    title: '完成信息安全学习',
    meta: '还剩 1 章',
    tag: '学习',
  },
];

const COMPANY_MODULES = [
  {
    title: '人事服务',
    description: '考勤、假期、入转调离、绩效记录',
    icon: BriefcaseBusiness,
  },
  {
    title: '流程中心',
    description: '审批流、流程模板、常用表单收藏',
    icon: ShieldCheck,
  },
  {
    title: '风险提醒',
    description: '制度更新、权限异常、合同到期预警',
    icon: CircleAlert,
  },
];

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="min-w-[150px] flex-1 border-white/10 bg-white/10 py-0 shadow-none">
      <CardContent className="gap-1 px-4 py-4">
        <Text className="text-xs text-emerald-50/75">{label}</Text>
        <Text className="text-3xl font-semibold tracking-tight text-white">{value}</Text>
        <Text className="text-xs text-emerald-50/75">{detail}</Text>
      </CardContent>
    </Card>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 }}>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <View className="w-full max-w-6xl gap-4 mx-auto">
        <Card className="py-0 overflow-hidden border-0 shadow-xl bg-emerald-950 shadow-emerald-950/20">
          <CardContent className="gap-5 px-5 py-6">
            <View className="flex-row items-start justify-between gap-4">
              <View className="max-w-3xl gap-2">
                <View className="self-start px-3 py-1 border rounded-full border-white/15 bg-white/10">
                  <Text className="text-xs font-medium uppercase tracking-[1.2px] text-emerald-50/80">
                    Employee workspace
                  </Text>
                </View>
                <Text className="text-3xl font-semibold leading-tight text-white">
                  让员工少找入口，多完成工作
                </Text>
                <Text className="leading-6 text-emerald-50/80">
                  首页聚合审批、公告、会议、报销、服务台和 AI
                  问答，让企业内部常用功能都能在两步内到达。
                </Text>
              </View>

              <View className="items-center justify-center hidden w-12 h-12 rounded-2xl bg-white/10 lg:flex">
                <Sparkles size={20} color="#ffffff" strokeWidth={2.2} />
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <MetricCard label="待处理事项" value="6" detail="审批、学习、会议材料" />
              <MetricCard label="今日会议" value="3" detail="下次会议 10:30 开始" />
              <MetricCard label="可用服务" value="12" detail="人事、IT、行政、法务等" />
            </View>
          </CardContent>
        </Card>

        <View className="gap-4">
          <View className="px-1">
            <Text className="text-lg font-semibold tracking-tight">高频入口</Text>
            <Text className="text-sm text-muted-foreground">
              先放员工每天最常点击的四类能力，减少层级跳转。
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-4">
            {PRIMARY_ACTIONS.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.title} href={item.href as never} asChild>
                  <Button
                    variant="ghost"
                    className="min-w-[260px] flex-1 justify-start rounded-2xl border border-border bg-card px-0 py-0">
                    <Card className="w-full py-0 border-0 shadow-none">
                      <CardHeader className="gap-3 px-5 pt-5 pb-3">
                        <View className="items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10">
                          <Icon size={22} color="currentColor" strokeWidth={2} />
                        </View>
                        <View className="gap-1">
                          <CardTitle>{item.title}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </View>
                      </CardHeader>
                      <CardContent className="flex-row items-center justify-between px-5 pb-5">
                        <Text className="text-xs text-muted-foreground">一键进入常用流程</Text>
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
              <CardTitle>我的待办</CardTitle>
              <CardDescription>把员工最关心的个人动作放在首页第一屏。</CardDescription>
            </CardHeader>
            <CardContent className="gap-3 px-5 pb-5">
              {TODO_ITEMS.map((item, index) => (
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
              <CardTitle>快捷服务</CardTitle>
              <CardDescription>把员工经常“找不到”的支持能力做成平铺入口。</CardDescription>
            </CardHeader>
            <CardContent className="gap-3 px-5 pb-5">
              {QUICK_SERVICES.map((item, index) => {
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
            <CardTitle>建议加入的企业首页功能</CardTitle>
            <CardDescription>
              这些模块适合后续继续接入真实公司系统，会显著提升员工使用效率。
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 px-5 pb-5">
            <View className="flex-row flex-wrap gap-4">
              {COMPANY_MODULES.map((item) => {
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
  );
}
