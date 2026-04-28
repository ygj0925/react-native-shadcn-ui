import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const CONTENT_CONTAINER_STYLE = { flexGrow: 1 } as const;

export function AuthScreenContainer({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={['rgba(232,213,245,0.6)', 'rgba(240,224,247,0.3)', 'rgba(255,255,255,0)']}
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
