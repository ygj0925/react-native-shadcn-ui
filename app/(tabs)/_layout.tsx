import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { Slot, Tabs, usePathname, useRouter } from 'expo-router';
import { Menu, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Animated, Easing, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

type NavItem = {
  name: 'index' | 'about' | 'home' | 'love' | 'my';
  title: string;
  href: string;
  description: string;
  icon: (focused: boolean, color: string) => React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    name: 'index',
    title: 'Chats',
    href: '/',
    description: 'Recent conversations and prompts',
    icon: (focused, color) =>
      focused ? (
        <Ionicons name="chatbox-ellipses" size={20} color={color} />
      ) : (
        <Ionicons name="chatbox-ellipses-outline" size={20} color={color} />
      ),
  },
  {
    name: 'about',
    title: '日程',
    href: '/about',
    description: 'Manage schedules and calendar sync',
    icon: (focused, color) =>
      focused ? (
        <FontAwesome5 name="calendar-alt" size={18} color={color} />
      ) : (
        <Feather name="calendar" size={20} color={color} />
      ),
  },
  {
    name: 'home',
    title: 'Workspace',
    href: '/home',
    description: 'Employee homepage and company services',
    icon: (focused, color) =>
      focused ? (
        <MaterialCommunityIcons name="creation" size={20} color={color} />
      ) : (
        <MaterialCommunityIcons name="creation-outline" size={20} color={color} />
      ),
  },
  {
    name: 'love',
    title: 'Favorites',
    href: '/love',
    description: 'Saved chats and highlights',
    icon: (focused, color) =>
      focused ? (
        <MaterialCommunityIcons name="clover" size={20} color={color} />
      ) : (
        <MaterialCommunityIcons name="clover-outline" size={20} color={color} />
      ),
  },
  {
    name: 'my',
    title: 'My',
    href: '/my',
    description: 'Profile, settings, and account',
    icon: (focused, color) =>
      focused ? (
        <FontAwesome5 name="user-alt" size={20} color={color} />
      ) : (
        <FontAwesome5 name="user" size={20} color={color} />
      ),
  },
];

const NAV_TITLE_OVERRIDES: Partial<Record<NavItem['name'], string>> = {
  about: 'Schedule',
};

const PAGE_TITLES: Record<string, string> = {
  '/': 'Chats',
  '/about': '日程',
  '/home': 'Workspace',
  '/love': 'Favorites',
  '/my': 'My',
};

const PAGE_TITLE_OVERRIDES: Record<string, string> = {
  '/about': 'Schedule',
};

const SidebarContent = React.memo(function SidebarContent({
  currentPath,
  iconColor,
  topInset,
  onNavigate,
  onClose,
  largeScreen,
}: {
  currentPath: string;
  iconColor: string;
  topInset: number;
  onNavigate: (href: string) => void;
  onClose?: () => void;
  largeScreen: boolean;
}) {
  return (
    <Card className="h-full py-0 border-r rounded-none shadow-2xl border-border bg-card shadow-black/10">
      <CardHeader className="gap-3 px-4 pb-3" style={{ paddingTop: topInset + 10 }}>
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <CardTitle className="text-lg">Navigation</CardTitle>
            <Text className="text-sm text-muted-foreground">Move across your core pages</Text>
          </View>

          {!largeScreen ? (
            <Button variant="ghost" size="icon" onPress={onClose}>
              <X size={18} color="currentColor" strokeWidth={2} />
            </Button>
          ) : null}
        </View>
      </CardHeader>

      <Separator />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 12 }}>
        <View className="gap-2">
          {NAV_ITEMS.map((item) => {
            const active = currentPath === item.href;

            return (
              <Pressable
                key={item.name}
                className={cn(
                  'rounded-xl border px-3 py-2.5',
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background active:bg-accent'
                )}
                onPress={() => onNavigate(item.href)}>
                <View className="flex-row items-start gap-3">
                  <View
                    className={cn(
                      'mt-0.5 h-8 w-8 items-center justify-center rounded-lg',
                      active ? 'bg-primary' : 'bg-muted'
                    )}>
                    {item.icon(active, active ? '#ffffff' : iconColor)}
                  </View>

                  <View className="flex-1 gap-1">
                    <Text className="text-sm font-medium" numberOfLines={1}>
                      {NAV_TITLE_OVERRIDES[item.name] ?? item.title}
                    </Text>
                    <Text className="text-xs leading-4 text-muted-foreground" numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Separator />

      <CardContent className="px-4 py-3">
        <Text className="text-xs text-muted-foreground">
          iPad keeps this navigation pinned by default, and you can collapse it from the header.
        </Text>
      </CardContent>
    </Card>
  );
}

function MobileTabs({ iconColor }: { iconColor: string }) {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        tabBarPosition: 'bottom',
        tabBarLabelPosition: 'below-icon',
        tabBarItemStyle: {
          paddingVertical: 4,
          flex: 1,
        },
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 6,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          elevation: 0,
          shadowOpacity: 0,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}>
      {NAV_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: NAV_TITLE_OVERRIDES[item.name] ?? item.title,
            tabBarIcon: ({ focused }) => item.icon(focused, iconColor),
          }}
        />
      ))}
    </Tabs>
  );
}

function LargeScreenShell({ iconColor }: { iconColor: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const progress = React.useRef(new Animated.Value(1)).current;
  const currentPath = pathname === '/index' ? '/' : pathname;
  const currentTitle = PAGE_TITLE_OVERRIDES[currentPath] ?? PAGE_TITLES[currentPath] ?? 'Workspace';
  const sidebarWidth = Math.min(Math.max(width * 0.22, 220), 260);

  const hideSplash = React.useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: sidebarVisible ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, sidebarVisible]);

  const animatedSidebarWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sidebarWidth],
  });

  const animatedSidebarOpacity = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0.65, 1],
  });

  const animatedSidebarTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 0],
  });

  const navigate = React.useCallback((href: string) => {
    router.push(href as never);
  }, [router]);

  const onMenuPress = React.useCallback(() => {
    setSidebarVisible((current) => !current);
  }, []);

  return (
    <View className="flex-row flex-1 bg-background">
      <Animated.View
        style={{ width: animatedSidebarWidth, overflow: 'hidden' }}
        pointerEvents={sidebarVisible ? 'auto' : 'none'}>
        <Animated.View
          style={{
            width: sidebarWidth,
            flex: 1,
            opacity: animatedSidebarOpacity,
            transform: [{ translateX: animatedSidebarTranslate }],
          }}>
          <SidebarContent
            currentPath={currentPath}
            iconColor={iconColor}
            topInset={insets.top}
            onNavigate={navigate}
            largeScreen
          />
        </Animated.View>
      </Animated.View>

      <View className="flex-1 bg-background">
        <View
          className="flex-row items-center justify-between px-4 border-b border-border bg-background"
          style={{ height: 64 + insets.top, paddingTop: insets.top }}>
          <View className="flex-row items-center gap-3">
            <Button variant="ghost" size="icon" onPress={onMenuPress}>
              {sidebarVisible ? (
                <X size={18} color="currentColor" strokeWidth={2} />
              ) : (
                <Menu size={18} color="currentColor" strokeWidth={2} />
              )}
            </Button>
            <View className="gap-0.5">
              <Text className="text-xs font-medium text-muted-foreground">Workspace</Text>
              <Text className="text-lg font-semibold tracking-tight">{currentTitle}</Text>
            </View>
          </View>

          <Text className="text-sm text-muted-foreground">iPad Layout</Text>
        </View>

        <View className="flex-1">
          <Slot />
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-background">
      {isLargeScreen ? (
        <LargeScreenShell iconColor={iconColor} />
      ) : (
        <MobileTabs iconColor={iconColor} />
      )}
    </SafeAreaView>
  );
}
