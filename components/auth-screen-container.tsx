import type { PropsWithChildren } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const CONTENT_CONTAINER_STYLE = { flexGrow: 1 } as const;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function AuthScreenContainer({ children }: PropsWithChildren) {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-white">
      <Svg
        style={StyleSheet.absoluteFill}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="bgGradient" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#e8d5f5" stopOpacity="0.6" />
            <Stop offset="0.3" stopColor="#f0e0f7" stopOpacity="0.3" />
            <Stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#bgGradient)" />
      </Svg>
      <KeyboardAwareScrollView
        className="flex-1"
        bottomOffset={Platform.OS === 'ios' ? 24 : 16}
        extraKeyboardSpace={Platform.OS === 'ios' ? 24 : 12}
        disableScrollOnKeyboardHide
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <View className="flex-grow px-4 pt-6 pb-8">
          <View className="w-full max-w-sm gap-6 mx-auto">{children}</View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
