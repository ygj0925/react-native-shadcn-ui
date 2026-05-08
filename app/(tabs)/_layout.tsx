import { BlurSurface } from '@/components/blur-surface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { Slot, Tabs, usePathname, useRouter } from 'expo-router';
import { Menu, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedAnimated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type NavName = 'index' | 'about' | 'home' | 'love' | 'my';

type NavItem = {
  name: NavName;
  title: string;
  href: string;
  description: string;
  icon: (focused: boolean, color: string, size?: number) => React.ReactNode;
};

function getNavItems(): NavItem[] {
  return [
    {
      name: 'index',
      title: t('nav.chats'),
      href: '/',
      description: t('nav.chats_desc'),
      icon: (focused, color, size = 22) =>
        focused ? (
          <Ionicons name="chatbubbles" size={size} color={color} />
        ) : (
          <Ionicons name="chatbubbles-outline" size={size} color={color} />
        ),
    },
    {
      name: 'about',
      title: t('nav.schedule'),
      href: '/about',
      description: t('nav.schedule_desc'),
      icon: (focused, color, size = 22) =>
        focused ? (
          <FontAwesome5 name="calendar-alt" size={size - 2} color={color} />
        ) : (
          <Feather name="calendar" size={size} color={color} />
        ),
    },
    {
      name: 'home',
      title: t('nav.workspace'),
      href: '/home',
      description: t('nav.workspace_desc'),
      icon: (focused, color, size = 22) =>
        focused ? (
          <MaterialCommunityIcons name="creation" size={size} color={color} />
        ) : (
          <MaterialCommunityIcons name="creation-outline" size={size} color={color} />
        ),
    },
    {
      name: 'love',
      title: t('nav.favorites'),
      href: '/love',
      description: t('nav.favorites_desc'),
      icon: (focused, color, size = 22) =>
        focused ? (
          <Ionicons name="heart" size={size} color={color} />
        ) : (
          <Ionicons name="heart-outline" size={size} color={color} />
        ),
    },
    {
      name: 'my',
      title: t('nav.profile'),
      href: '/my',
      description: t('nav.profile_desc'),
      icon: (focused, color, size = 22) =>
        focused ? (
          <Ionicons name="person" size={size} color={color} />
        ) : (
          <Ionicons name="person-outline" size={size} color={color} />
        ),
    },
  ];
}

const SidebarContent = React.memo(function SidebarContent({
  currentPath,
  tint,
  topInset,
  onNavigate,
  onClose,
  largeScreen,
  navItems,
}: {
  currentPath: string;
  tint: (typeof THEME)['light'];
  topInset: number;
  onNavigate: (href: string) => void;
  onClose?: () => void;
  largeScreen: boolean;
  navItems: NavItem[];
}) {
  return (
    <Card className="h-full py-0 border-r rounded-none border-border bg-card">
      <CardHeader className="gap-3 px-4 pb-3" style={{ paddingTop: topInset + 10 }}>
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <CardTitle className="text-lg">{t('nav.navigation')}</CardTitle>
            <Text className="text-sm text-muted-foreground">{t('nav.navigation_subtitle')}</Text>
          </View>

          {!largeScreen ? (
            <Button variant="ghost" size="icon" onPress={onClose}>
              <X size={18} color={tint.foreground} strokeWidth={2} />
            </Button>
          ) : null}
        </View>
      </CardHeader>

      <Separator />

      <ScrollView className="flex-1 p-3">
        <View className="gap-2">
          {navItems.map((item) => {
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
                    {item.icon(active, active ? tint.primaryForeground : tint.mutedForeground, 18)}
                  </View>

                  <View className="flex-1 gap-1">
                    <Text className="text-sm font-medium" numberOfLines={1}>
                      {item.title}
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
          {t('nav.ipad_hint')}
        </Text>
      </CardContent>
    </Card>
  );
});

function AnimatedTabItem({
  focused,
  onPress,
  onLongPress,
  icon,
  label,
}: {
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (focused) {
      scale.value = 0.85;
      scale.value = withSpring(1.08, {
        damping: 12,
        stiffness: 300,
        mass: 0.4,
      });
    } else {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 250,
      });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center py-1.5">
      <ReanimatedAnimated.View style={[animatedStyle, { alignItems: 'center', gap: 2 }]} className="items-center gap-0.5">
        {icon}
        <Text
          className={cn(
            'text-[11px] leading-none',
            focused ? 'font-semibold text-primary' : 'text-muted-foreground'
          )}>
          {label}
        </Text>
      </ReanimatedAnimated.View>
    </Pressable>
  );
}

function CustomTabBar({
  state,
  descriptors,
  navigation,
  tint,
}: BottomTabBarProps & { tint: (typeof THEME)['light'] }) {
  const insets = useSafeAreaInsets();
  return (
    <BlurSurface
      className="border-t border-border"
      style={{ paddingBottom: insets.bottom }}>
      <View className="flex-row items-center h-14">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const icon = options.tabBarIcon?.({
            focused,
            color: focused ? tint.primary : tint.mutedForeground,
            size: 22,
          });

          return (
            <AnimatedTabItem
              key={route.key}
              focused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
              icon={icon}
              label={label}
            />
          );
        })}
      </View>
    </BlurSurface>
  );
}

function MobileTabs({ tint, navItems }: { tint: (typeof THEME)['light']; navItems: NavItem[] }) {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} tint={tint} />}
      screenOptions={{
        headerShown: false,
      }}>
      {navItems.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.title,
            tabBarIcon: ({ focused, color }) => item.icon(focused, color),
          }}
        />
      ))}
    </Tabs>
  );
}

function LargeScreenShell({ tint, navItems }: { tint: (typeof THEME)['light']; navItems: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [sidebarVisible, setSidebarVisible] = React.useState(true);
  const progress = React.useRef(new Animated.Value(1)).current;
  const currentPath = pathname === '/index' ? '/' : pathname;
  const pageTitles = React.useMemo(
    () => navItems.reduce((acc, item) => {
      acc[item.href] = item.title;
      return acc;
    }, {} as Record<string, string>),
    [navItems]
  );
  const currentTitle = pageTitles[currentPath] ?? t('nav.workspace');
  const sidebarWidth = Math.min(Math.max(width * 0.22, 220), 260);

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

  const navigate = React.useCallback(
    (href: string) => {
      router.push(href as never);
    },
    [router]
  );

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
            tint={tint}
            topInset={insets.top}
            onNavigate={navigate}
            largeScreen
            navItems={navItems}
          />
        </Animated.View>
      </Animated.View>

      <View className="flex-1 bg-background">
        <View
          className="flex-row items-center justify-between h-16 px-4 border-b border-border bg-background"
          style={{ paddingTop: insets.top, height: 64 + insets.top }}>
          <View className="flex-row items-center gap-3">
            <Button variant="ghost" size="icon" onPress={onMenuPress}>
              {sidebarVisible ? (
                <X size={18} color={tint.foreground} strokeWidth={2} />
              ) : (
                <Menu size={18} color={tint.foreground} strokeWidth={2} />
              )}
            </Button>
            <View className="gap-0.5">
              <Text className="text-xs font-medium text-muted-foreground">{t('nav.workspace')}</Text>
              <Text className="text-lg font-semibold tracking-tight">{currentTitle}</Text>
            </View>
          </View>

          <Text className="text-sm text-muted-foreground">{t('nav.ipad_layout')}</Text>
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
  const tint = THEME[colorScheme ?? 'light'];
  const navItems = React.useMemo(() => getNavItems(), []);

  // On web with static rendering, useWindowDimensions returns 0 during SSG
  // (no window object in Node.js). This causes MobileTabs to flash before
  // hydration resolves the real width. Defer layout until after mount on web.
  const [layoutReady, setLayoutReady] = React.useState(Platform.OS !== 'web');

  React.useEffect(() => {
    if (!layoutReady) setLayoutReady(true);
  }, []);

  const isLargeScreen = width >= 768;

  if (!layoutReady) {
    return <SafeAreaView edges={['left', 'right']} className="flex-1 bg-background" />;
  }

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-background">
      {isLargeScreen ? <LargeScreenShell tint={tint} navItems={navItems} /> : <MobileTabs tint={tint} navItems={navItems} />}
    </SafeAreaView>
  );
}
