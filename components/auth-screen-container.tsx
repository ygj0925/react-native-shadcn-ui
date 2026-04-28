import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const CONTENT_CONTAINER_STYLE = { flexGrow: 1 } as const;

export function AuthScreenContainer({ children }: PropsWithChildren) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <Svg
        style={StyleSheet.absoluteFill}
        width={width}
        height={height}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="bgGradient" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#e8d5f5" stopOpacity="0.6" />
            <Stop offset="0.3" stopColor="#f0e0f7" stopOpacity="0.3" />
            <Stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#bgGradient)" />
      </Svg>
      <KeyboardAwareScrollView
        className="flex-1"
        bottomOffset={Platform.OS === 'ios' ? 40 : 24}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <View
          className="flex-grow px-4 pt-6"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          <View className="w-full max-w-sm gap-6 mx-auto">{children}</View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
