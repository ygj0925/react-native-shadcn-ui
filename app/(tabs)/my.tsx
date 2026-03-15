import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
  Archive,
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
    <Pressable className="flex-row items-center px-4 py-3 active:bg-accent/50">
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon size={16} color="currentColor" strokeWidth={2} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-base">{item.label}</Text>
        {showValueBelowLabel ? (
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
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
            <Text className="max-w-[140px] text-right text-sm text-muted-foreground" numberOfLines={1}>
              {item.value}
            </Text>
          ) : null}
          {item.withChevron ? <Text className="text-lg text-muted-foreground">{'>'}</Text> : null}
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
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 12,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="mb-6 gap-2 px-1">
          <Text className={cn('font-semibold tracking-tight', isCompact ? 'text-[28px]' : 'text-3xl')}>
            Settings
          </Text>
          <Text className="text-sm text-muted-foreground">
            Manage your account, app preferences, and voice experience.
          </Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} className="mb-5">
            <Card className="border-border bg-card py-0 shadow-sm shadow-black/5">
              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="text-lg">{section.title}</CardTitle>
                {section.description ? (
                  <Text className="text-sm leading-5 text-muted-foreground">
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
                    {index < section.items.length - 1 ? <Separator className="ml-16" /> : null}
                  </View>
                ))}
              </CardContent>
            </Card>
          </View>
        ))}

        <Card className="border-border bg-card py-0 shadow-sm shadow-black/5">
          <CardContent className="px-4 py-4">
            <Button variant="outline" className="w-full justify-start">
              <LogOut size={16} color="currentColor" strokeWidth={2} />
              <Text>Logout</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
