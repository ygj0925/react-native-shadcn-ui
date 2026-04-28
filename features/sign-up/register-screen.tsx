import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { AuthScreenContainer } from '@/components/auth-screen-container';
import { AuthShell } from '@/components/auth-shell';
import { SignUpForm } from '@/components/sign-up-form';
import { ThemeToggle } from '@/components/themeToggle';

const SCREEN_OPTIONS = {
  title: 'Register',
  headerShown: true,
  headerShadowVisible: false,
  headerLargeTitle: Platform.OS === 'ios',
  headerRight: () => <ThemeToggle />,
};

export default function RegisterScreen() {
  return (
    <AuthScreenContainer>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <AuthShell
        eyebrow="New here"
        title="Create your account"
        description="Set up your profile once, then move between chat, schedules, and favorites without friction."
        footer="This stays as a polished demo flow for now, so we can improve the visuals before wiring real authentication.">
        <SignUpForm />
      </AuthShell>
    </AuthScreenContainer>
  );
}
