import type { PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export function AuthScreenContainer({ children }: PropsWithChildren) {
  return (
    <LinearGradient
      colors={['#eaf7ff', '#f6f0fc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1">
        <KeyboardAwareScrollView
          className="flex-1"
          bottomOffset={Platform.OS === 'ios' ? 24 : 16}
          extraKeyboardSpace={Platform.OS === 'ios' ? 24 : 12}
          disableScrollOnKeyboardHide
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 32,
          }}>
          <View className="w-full max-w-sm gap-6 mx-auto">{children}</View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
