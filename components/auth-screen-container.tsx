import type { PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AuthScreenContainer({ children }: PropsWithChildren) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-background">
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
        <View className="mx-auto w-full max-w-sm gap-6">{children}</View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
