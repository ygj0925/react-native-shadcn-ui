import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { useColorScheme } from 'nativewind';
import {
  Archive,
  ChevronRight,
  CircleHelp,
  FileText,
  Globe,
  LogOut,
  Mail,
  Palette,
  RefreshCw,
  Settings,
  Shield,
  SquarePlus,
  UserRoundCog,
  Volume2,
  WalletCards,
  BookLock,
} from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '@/lib/store/subscription';

type Item = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  value?: string;
  withChevron?: boolean;
  withToggle?: boolean;
  onPress?: () => void;
};

type Section = {
  title: string;
  description?: string;
  items: Item[];
};

function getSections(tier: string, router: ReturnType<typeof useRouter>): Section[] {
  const tierLabel = tier === 'pro' ? 'MindFlow Pro' : tier === 'team' ? 'MindFlow Team' : '免费版';
  return [
    {
      title: t('settings.account.title'),
      items: [
        { id: 'settings', label: '设置', icon: Settings, value: '全部设置', withChevron: true, onPress: () => router.push('/settings' as any) },
        { id: 'email', label: t('settings.account.email'), icon: Mail, value: 'rey@gmail.com' },
        { id: 'subscription', label: t('settings.account.subscription'), icon: SquarePlus, value: tierLabel, withChevron: true, onPress: () => router.push('/settings/subscription' as any) },
        { id: 'restore', label: t('settings.account.restore_purchases'), icon: RefreshCw },
        { id: 'data', label: t('settings.account.data_controls'), icon: Shield, withChevron: true },
        { id: 'archive', label: t('settings.account.archived_chats'), icon: Archive, withChevron: true },
        { id: 'custom', label: t('settings.account.custom_instructions'), icon: BookLock, value: t('settings.account.on'), withChevron: true },
      ],
    },
    {
      title: t('settings.app.title'),
      items: [
        { id: 'theme', label: t('settings.app.color_scheme'), icon: Palette, value: t('settings.theme.system'), withChevron: true },
        { id: 'haptics', label: t('settings.app.haptic_feedback'), icon: WalletCards, withToggle: true },
      ],
    },
    {
      title: t('settings.speech.title'),
      description: t('settings.speech.description'),
      items: [
        { id: 'voice', label: t('settings.speech.voice'), icon: Volume2, value: 'Breeze', withChevron: true },
        { id: 'language', label: t('settings.speech.main_language'), icon: Globe, value: t('settings.speech.auto_detect'), withChevron: true },
      ],
    },
    {
      title: t('settings.about_section.title'),
      items: [
        { id: 'help', label: t('settings.about_section.help_center'), icon: CircleHelp },
        { id: 'terms', label: t('settings.about_section.terms_of_use'), icon: FileText },
        { id: 'privacy', label: t('settings.about_section.privacy_policy'), icon: Shield },
        { id: 'version', label: t('settings.about_section.app_version_label'), icon: UserRoundCog, value: '1.2024.136' },
      ],
    },
  ];
}

function SettingsRow({
  item,
  compact,
  toggleValue,
  onToggleChange,
}: {
  item: Item;
  compact: boolean;
  toggleValue: boolean;
  onToggleChange: (value: boolean) => void;
}) {
  const Icon = item.icon;
  const showValueBelowLabel = compact && !!item.value && !item.withToggle;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable onPress={item.onPress} className="flex-row items-center px-5 py-3.5 active:bg-accent/50">
      <View className={cn(
        'items-center justify-center w-9 h-9 mr-4 rounded-xl',
        isDark ? 'bg-white/8' : 'bg-black/4'
      )}>
        <Icon size={16} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={1.8} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] text-foreground">{item.label}</Text>
        {showValueBelowLabel ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {item.value}
          </Text>
        ) : null}
      </View>

      {item.withToggle ? (
        <Switch
          checked={toggleValue}
          onCheckedChange={onToggleChange}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {!showValueBelowLabel && item.value ? (
            <Text className="max-w-[140px] text-right text-xs text-muted-foreground" numberOfLines={1}>
              {item.value}
            </Text>
          ) : null}
          {item.withChevron ? (
            <ChevronRight size={16} className="text-muted-foreground/50" strokeWidth={2} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

export default function MyScreen() {
  const { width } = useWindowDimensions();
  const [hapticsEnabled, setHapticsEnabled] = React.useState(true);
  const isCompact = width < 390;
  const router = useRouter();
  const tier = useSubscriptionStore((s) => s.tier);
  const sections = getSections(tier, router);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const logout = () => {
    router.push('/login');
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className={cn('pt-4 pb-6', isCompact ? 'px-4' : 'px-5')}>
          {/* ─── Page Title ─── */}
          <View className="gap-1 px-1 mb-6">
            <Text className={cn('font-bold tracking-tight', isCompact ? 'text-2xl' : 'text-[28px]')}>
              {t('settings.title')}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {t('settings.subtitle')}
            </Text>
          </View>

          {/* ─── Profile Card ─── */}
          <Card className="mb-5 overflow-hidden border-border/60 bg-card py-0">
            <View className={cn('px-5 pt-6 pb-5', isDark ? 'bg-primary/15' : 'bg-primary/8')}>
              <Pressable className="active:opacity-95">
                <View className="flex-row items-center gap-4">
                  <View className="items-center justify-center border-[2px] rounded-full shadow-sm h-16 w-16 border-primary/30 bg-primary">
                    <Text className="text-xl font-bold text-primary-foreground">RE</Text>
                  </View>

                  <View className="flex-1 gap-1.5">
                    <View className="flex-row items-center gap-2.5">
                      <Text className="text-lg font-bold tracking-tight text-foreground">Rey Zhang</Text>
                      <View className={cn(
                        'rounded-full px-2.5 py-0.5',
                        isDark ? 'bg-white/12 border border-white/15' : 'bg-primary/12 border border-primary/15'
                      )}>
                        <Text className="text-xs font-semibold text-primary">{t('settings.profile.plus')}</Text>
                      </View>
                    </View>
                    <Text className="text-xs text-muted-foreground">{t('settings.profile.member_id', { id: '20240318' })}</Text>
                    <Text className="text-xs leading-4 text-muted-foreground">
                      {t('settings.profile.ai_points', { points: '1,286', growth: 92 })}
                    </Text>
                  </View>

                  <View className={cn(
                    'items-center justify-center w-9 h-9 rounded-full',
                    isDark ? 'bg-white/8' : 'bg-black/5'
                  )}>
                    <ChevronRight size={16} className="text-muted-foreground" strokeWidth={2} />
                  </View>
                </View>
              </Pressable>

              {/* Membership Badge */}
              <View className={cn(
                'mt-5 rounded-2xl border px-4 py-3.5',
                isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white/60'
              )}>
                <View className="flex-row items-center justify-between">
                  <View className="gap-1">
                    <Text className="text-[10px] font-semibold uppercase tracking-[1px] text-muted-foreground">
                      {t('settings.profile.membership')}
                    </Text>
                    <Text className="text-sm font-semibold text-foreground">{t('settings.profile.plan_name')}</Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">{t('settings.profile.renews_in', { days: 28 })}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* ─── Settings Sections ─── */}
          {sections.map((section) => (
            <View key={section.title} className="mb-5">
              <Card className="py-0 border-border/60">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-[15px] font-semibold">{section.title}</CardTitle>
                  {section.description ? (
                    <Text className="text-xs leading-4 text-muted-foreground mt-0.5">
                      {section.description}
                    </Text>
                  ) : null}
                </CardHeader>

                <Separator className="opacity-50" />

                <CardContent className="px-0 py-1">
                  {section.items.map((item, index) => (
                    <View key={item.id}>
                      <SettingsRow
                        item={item}
                        compact={isCompact}
                        toggleValue={hapticsEnabled}
                        onToggleChange={setHapticsEnabled}
                      />
                      {index < section.items.length - 1 ? (
                        <Separator className="mx-5 ml-[68px] opacity-30" />
                      ) : null}
                    </View>
                  ))}
                </CardContent>
              </Card>
            </View>
          ))}

          {/* ─── Logout Button ─── */}
          <Card className="py-0 border-border/60">
            <CardContent className="px-4 py-4">
              <Button onPress={logout} variant="outline" className="justify-start w-full rounded-xl">
                <LogOut size={16} className="text-muted-foreground" strokeWidth={2} />
                <Text className="font-medium">{t('settings.logout')}</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
