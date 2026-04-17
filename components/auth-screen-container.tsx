import type { PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

const CONTENT_CONTAINER_STYLE = { flexGrow: 1 } as const;

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
        contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <View className="flex-grow px-4 pt-6 pb-8">
          <View className="w-full max-w-sm gap-6 mx-auto">{children}</View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
