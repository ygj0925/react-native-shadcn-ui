import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import { cn } from '@/lib/utils';

const CONTENT_CONTAINER_STYLE = { flexGrow: 1 } as const;

export function AuthScreenContainer({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={cn('flex-1', isDark ? 'bg-background' : 'bg-white')}>
      <LinearGradient
        colors={isDark
          ? ['rgba(109,40,217,0.15)', 'rgba(30,27,75,0.1)', 'rgba(0,0,0,0)']
          : ['rgba(139,92,246,0.15)', 'rgba(167,139,250,0.08)', 'rgba(255,255,255,0)']
        }
        locations={[0, 0.3, 0.6]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <KeyboardAwareScrollView
        className="flex-1"
        bottomOffset={Platform.OS === 'ios' ? 40 : 24}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <View
          className="flex-grow px-4 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          <View className="w-full max-w-sm gap-6 mx-auto">{children}</View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
