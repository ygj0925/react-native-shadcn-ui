import '@/lib/patch-assistant-ui';
import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { onAuthStateChange } from '@/lib/supabase';
import { useDataSync } from '@/hooks/useDataSync';
import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN && !__DEV__) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: false,
  });
}

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const initAuth = useAuthStore((s) => s.initAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  useDataSync();

  // Initialize auth and listen for changes
  useEffect(() => {
    let mounted = true;

    initAuth().then(() => {
      if (mounted) SplashScreen.hideAsync();
    });

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        refreshProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <KeyboardProvider statusBarTranslucent navigationBarTranslucent preserveEdgeToEdge>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <SafeAreaProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="chat" />
          </Stack>
          <PortalHost />
        </SafeAreaProvider>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
