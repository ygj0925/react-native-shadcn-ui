import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/store/auth';
import { useSubscriptionStore } from '@/lib/store/subscription';
import { cn } from '@/lib/utils';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bot,
  ChevronRight,
  Database,
  FileText,
  Languages,
  LogOut,
  MessageSquare,
  Palette,
  Shield,
  Sparkles,
  SquarePlus,
  Trash2,
  User,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Item = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  value?: string;
  withChevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
};

type Section = {
  title: string;
  items: Item[];
};

function SettingsRow({ item, isDark }: { item: Item; isDark: boolean }) {
  const Icon = item.icon;
  return (
    <Pressable
      onPress={item.onPress}
      className="flex-row items-center px-5 py-3.5 active:bg-accent/50">
      <View
        className={cn(
          'items-center justify-center w-9 h-9 mr-4 rounded-xl',
          isDark ? 'bg-white/8' : 'bg-black/4'
        )}>
        <Icon size={16} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={1.8} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className={cn('text-[15px]', item.destructive ? 'text-destructive' : 'text-foreground')}>
          {item.label}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {item.value ? (
          <Text className="max-w-[140px] text-right text-xs text-muted-foreground" numberOfLines={1}>
            {item.value}
          </Text>
        ) : null}
        {item.withChevron ? (
          <ChevronRight size={16} className="text-muted-foreground/50" strokeWidth={2} />
        ) : null}
      </View>
    </Pressable>
  );
}

export default function SettingsIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const tier = useSubscriptionStore((s) => s.tier);
  const aiUsageThisMonth = useSubscriptionStore((s) => s.aiUsageThisMonth);

  const tierLabel = tier === 'pro' ? 'Pro' : tier === 'team' ? 'Team' : '免费版';

  const handleDeleteAccount = () => {
    Alert.alert(
      '删除账户',
      '此操作将永久删除你的所有数据，且无法恢复。确定继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const sections: Section[] = [
    {
      title: '账户',
      items: [
        {
          id: 'profile',
          label: '个人资料',
          icon: User,
          value: profile?.display_name ?? user?.email ?? '未登录',
          withChevron: true,
          onPress: () => router.push('/settings/profile' as any),
        },
        {
          id: 'subscription',
          label: '订阅管理',
          icon: SquarePlus,
          value: tierLabel,
          withChevron: true,
          onPress: () => router.push('/settings/subscription' as any),
        },
        {
          id: 'ai-usage',
          label: 'AI 用量',
          icon: Sparkles,
          value: `${aiUsageThisMonth} 次 / 本月`,
          withChevron: true,
          onPress: () => router.push('/settings/subscription' as any),
        },
      ],
    },
    {
      title: '应用',
      items: [
        {
          id: 'ai-model',
          label: 'AI 模型',
          icon: Bot,
          value: '默认',
          withChevron: true,
          onPress: () => router.push('/settings/ai-model' as any),
        },
        {
          id: 'theme',
          label: '主题',
          icon: Palette,
          value: isDark ? '深色' : '浅色',
          withChevron: true,
        },
        {
          id: 'language',
          label: '语言',
          icon: Languages,
          value: '中文',
          withChevron: true,
        },
      ],
    },
    {
      title: '数据与法律',
      items: [
        {
          id: 'data',
          label: '数据管理',
          icon: Database,
          value: '导出 / 导入',
          withChevron: true,
          onPress: () => router.push('/settings/data' as any),
        },
        {
          id: 'privacy',
          label: '隐私政策',
          icon: Shield,
          withChevron: true,
          onPress: () => router.push('/settings/privacy' as any),
        },
        {
          id: 'terms',
          label: '服务条款',
          icon: FileText,
          withChevron: true,
          onPress: () => router.push('/settings/terms' as any),
        },
        {
          id: 'feedback',
          label: '意见反馈',
          icon: MessageSquare,
          withChevron: true,
          onPress: () => router.push('/settings/feedback' as any),
        },
      ],
    },
    {
      title: '危险操作',
      items: [
        {
          id: 'delete-account',
          label: '删除账户',
          icon: Trash2,
          destructive: true,
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: '设置',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 pt-4 pb-6 gap-5">
          {sections.map((section, sectionIndex) => (
            <Card key={section.title} className="py-0 border-border/60">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-[15px] font-semibold">{section.title}</CardTitle>
              </CardHeader>

              <Separator className="opacity-50" />

              <CardContent className="px-0 py-1">
                {section.items.map((item, index) => (
                  <View key={item.id}>
                    <SettingsRow item={item} isDark={isDark} />
                    {index < section.items.length - 1 ? (
                      <Separator className="mx-5 ml-[68px] opacity-30" />
                    ) : null}
                  </View>
                ))}
              </CardContent>
            </Card>
          ))}

          <Button
            onPress={() => signOut().then(() => router.replace('/login' as any))}
            variant="outline"
            className="w-full rounded-xl">
            <LogOut size={16} className="text-muted-foreground" strokeWidth={2} />
            <Text className="font-medium text-foreground">退出登录</Text>
          </Button>

          <Text className="text-xs text-center text-muted-foreground">
            MindFlow v1.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
