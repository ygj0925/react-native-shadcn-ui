import { SignUpForm } from '@/components/sign-up-form';
import { AuthScreenContainer } from '@/components/auth-screen-container';
import { AuthShell } from '@/components/auth-shell';
import { ThemeToggle } from '@/components/themeToggle';
import { Stack } from 'expo-router';

const SCREEN_OPTIONS = {
  title: 'Register',
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
    <AuthScreenContainer>
      <Stack.Screen options={REGISTER_SCREEN_OPTIONS} />
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
