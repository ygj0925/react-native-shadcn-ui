import { SignInForm } from '@/components/sign-in-form';
import { ThemeToggle } from '@/components/themeToggle';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  title: 'Login',
  headerShown: true,
  headerTransparent: false,
  headerRight: () => <ThemeToggle />,
};

export default function LoginScreen() {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-background">
      <Stack.Screen options={SCREEN_OPTIONS} />
      <KeyboardAwareScrollView
        bottomOffset={24}
        extraKeyboardSpace={32}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 32 }}>
        <View className="mx-auto w-full max-w-sm gap-6">
          <View className="gap-2 px-1">
            <Text className="text-3xl font-semibold tracking-tight">Welcome back</Text>
            <Text className="text-muted-foreground">
              The form now uses keyboard-aware scrolling so the focused field stays above the
              keyboard.
            </Text>
          </View>
          <SignInForm />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
