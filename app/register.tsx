import { SignUpForm } from '@/components/sign-up-form';
import { AuthShell } from '@/components/auth-shell';
import { View } from 'react-native';
import { ThemeToggle } from '@/components/themeToggle';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const SCREEN_OPTIONS = {
  title: '注册页面',
  headerShown: true,
  headerTransparent: false,
  headerRight: () => <ThemeToggle />,
};
const REGISTER_SCREEN_OPTIONS = {
  ...SCREEN_OPTIONS,
  title: 'Register',
};
export default function SignUpScreen() {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-background">
      <Stack.Screen options={REGISTER_SCREEN_OPTIONS} />
      <KeyboardAwareScrollView
        bottomOffset={24}
        extraKeyboardSpace={32}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 32 }}>
        <View className="mx-auto w-full max-w-sm gap-6">
          <AuthShell
            eyebrow="New here"
            title="Create your account"
            description="Set up your profile once, then move between chat, schedules, and favorites without friction."
            footer="This stays as a polished demo flow for now, so we can improve the visuals before wiring real authentication.">
            <SignUpForm />
          </AuthShell>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
