import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
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

type Item = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  value?: string;
  withChevron?: boolean;
  withToggle?: boolean;
};

type Section = {
  title: string;
  description?: string;
  items: Item[];
};

function getSections(): Section[] {
  return [
    {
      title: t('settings.account.title'),
      items: [
        { id: 'email', label: t('settings.account.email'), icon: Mail, value: 'rey@gmail.com' },
        { id: 'subscription', label: t('settings.account.subscription'), icon: SquarePlus, value: 'ChatGPT Plus' },
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

  return (
    <Pressable className="flex-row items-center px-4 py-2.5 active:bg-accent/50">
      <View className="items-center justify-center w-8 h-8 mr-3 rounded-md bg-muted">
        <Icon size={15} color="currentColor" strokeWidth={2} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-base">{item.label}</Text>
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
            <ChevronRight size={16} color="currentColor" strokeWidth={2} />
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
  const sections = getSections();

  const logout = () => {
    router.push('/login');
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className={cn('pt-2.5 pb-5', isCompact ? 'px-3' : 'px-4')}>
        <View className="gap-1 px-1 mb-4">
          <Text className={cn('font-semibold tracking-tight', isCompact ? 'text-2xl' : 'text-3xl')}>
            {t('settings.title')}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {t('settings.subtitle')}
          </Text>
        </View>

        <Card className="mb-3.5 overflow-hidden border-border bg-card py-0 shadow-sm shadow-black/5">
          <View className="px-4 pt-5 pb-4 bg-primary/10">
            <Pressable className="active:opacity-90">
              <View className="flex-row items-center">
                <View className="items-center justify-center border rounded-full shadow-sm h-14 w-14 border-primary/20 bg-primary shadow-black/5">
                  <Text className="text-lg font-semibold text-primary-foreground">RE</Text>
                </View>

                <View className="flex-1 gap-1 ml-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg font-semibold tracking-tight">Rey Zhang</Text>
                    <View className="rounded-full border border-primary/15 bg-primary px-2 py-0.5">
                      <Text className="text-xs font-medium text-primary-foreground">{t('settings.profile.plus')}</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-muted-foreground">{t('settings.profile.member_id', { id: '20240318' })}</Text>
                  <Text className="text-xs leading-4 text-muted-foreground">
                    {t('settings.profile.ai_points', { points: '1,286', growth: 92 })}
                  </Text>
                </View>

                <View className="items-center justify-center w-8 h-8 rounded-full bg-background/70">
                  <ChevronRight size={16} color="currentColor" strokeWidth={2} />
                </View>
              </View>
            </Pressable>

            <View className="mt-4 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5">
              <View className="flex-row items-center justify-between">
                <View className="gap-1">
                  <Text className="text-xs font-medium uppercase tracking-[0.8px] text-muted-foreground">
                    {t('settings.profile.membership')}
                  </Text>
                  <Text className="text-sm font-medium">{t('settings.profile.plan_name')}</Text>
                </View>
                <Text className="text-xs text-muted-foreground">{t('settings.profile.renews_in', { days: 28 })}</Text>
              </View>
            </View>
          </View>
        </Card>

        {sections.map((section) => (
          <View key={section.title} className="mb-3.5">
            <Card className="py-0 shadow-sm border-border bg-card shadow-black/5">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-base">{section.title}</CardTitle>
                {section.description ? (
                  <Text className="text-xs leading-4 text-muted-foreground">
                    {section.description}
                  </Text>
                ) : null}
              </CardHeader>

              <Separator />

              <CardContent className="px-0 py-0">
                {section.items.map((item, index) => (
                  <View key={item.id}>
                    <SettingsRow
                      item={item}
                      compact={isCompact}
                      toggleValue={hapticsEnabled}
                      onToggleChange={setHapticsEnabled}
                    />
                    {index < section.items.length - 1 ? (
                      <Separator className="mx-4 ml-[60px] w-auto" />
                    ) : null}
                  </View>
                ))}
              </CardContent>
            </Card>
          </View>
        ))}

        <Card className="py-0 shadow-sm border-border bg-card shadow-black/5">
          <CardContent className="px-4 py-3">
            <Button onPress={logout} variant="outline" className="justify-start w-full">
              <LogOut size={16} color="currentColor" strokeWidth={2} />
              <Text>{t('settings.logout')}</Text>
            </Button>
          </CardContent>
        </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
