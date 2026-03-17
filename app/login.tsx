import { Stack } from 'expo-router';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthShell } from '@/components/auth-shell';
import { ThemeToggle } from '@/components/themeToggle';
import { SignInForm } from '@/components/sign-in-form';

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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 32 }}>
        <View className="w-full max-w-sm gap-6 mx-auto">
          <SignInForm />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
