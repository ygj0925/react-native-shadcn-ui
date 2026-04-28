import { Stack } from 'expo-router';
import { AuthScreenContainer } from '@/components/auth/auth-screen-container';
import { AuthGradientHeader } from '@/components/auth/auth-gradient-header';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignUpForm } from '@/components/auth/sign-up-form';

export default function RegisterScreen() {
  return (
    <AuthScreenContainer>
      <Stack.Screen options={{
        title: '',
        headerShown: true,
        headerShadowVisible: false,
        headerBackTitle: '',
        headerBackground: AuthGradientHeader,
      }} />
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
