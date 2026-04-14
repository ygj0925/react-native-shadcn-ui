import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
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
import { Pressable, ScrollView, Switch, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const sections: Section[] = [
  {
    title: 'Account',
    items: [
      { id: 'email', label: 'Email', icon: Mail, value: 'rey@gmail.com' },
      { id: 'subscription', label: 'Subscription', icon: SquarePlus, value: 'ChatGPT Plus' },
      { id: 'restore', label: 'Restore purchases', icon: RefreshCw },
      { id: 'data', label: 'Data Controls', icon: Shield, withChevron: true },
      { id: 'archive', label: 'Archived Chats', icon: Archive, withChevron: true },
      { id: 'custom', label: 'Custom instructions', icon: BookLock, value: 'On', withChevron: true },
    ],
  },
  {
    title: 'App',
    items: [
      { id: 'theme', label: 'Color Scheme', icon: Palette, value: 'System', withChevron: true },
      { id: 'haptics', label: 'Haptic Feedback', icon: WalletCards, withToggle: true },
    ],
  },
  {
    title: 'Speech',
    description:
      "For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.",
    items: [
      { id: 'voice', label: 'Voice', icon: Volume2, value: 'Breeze', withChevron: true },
      { id: 'language', label: 'Main Language', icon: Globe, value: 'Auto-Detect', withChevron: true },
    ],
  },
  {
    title: 'About',
    items: [
      { id: 'help', label: 'Help Center', icon: CircleHelp },
      { id: 'terms', label: 'Terms of Use', icon: FileText },
      { id: 'privacy', label: 'Privacy Policy', icon: Shield },
      { id: 'version', label: 'ChatGPT for iOS', icon: UserRoundCog, value: '1.2024.136' },
    ],
  },
];

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
        <Text className="text-[15px]">{item.label}</Text>
        {showValueBelowLabel ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {item.value}
          </Text>
        ) : null}
      </View>

      {item.withToggle ? (
        <Switch
          trackColor={{ false: '#d7d7db', true: '#22c55e' }}
          thumbColor="#ffffff"
          ios_backgroundColor="#d7d7db"
          value={toggleValue}
          onValueChange={onToggleChange}
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
  const horizontalPadding = isCompact ? 12 : 16;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 10,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="gap-1 px-1 mb-4">
          <Text className={cn('font-semibold tracking-tight', isCompact ? 'text-[24px]' : 'text-[28px]')}>
            Settings
          </Text>
          <Text className="text-xs text-muted-foreground">
            Manage your account, app preferences, and voice experience.
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
                      <Text className="text-[10px] font-medium text-primary-foreground">PLUS</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-muted-foreground">Member ID: 20240318</Text>
                  <Text className="text-xs leading-4 text-muted-foreground">
                    AI points 1,286 | Growth value 92
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
                    Membership
                  </Text>
                  <Text className="text-sm font-medium">ChatGPT Plus Annual Plan</Text>
                </View>
                <Text className="text-xs text-muted-foreground">Renews in 28 days</Text>
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
            <Button variant="outline" className="justify-start w-full">
              <LogOut size={16} color="currentColor" strokeWidth={2} />
              <Text>Logout</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
