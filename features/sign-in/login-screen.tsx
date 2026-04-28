import { Stack } from 'expo-router';
import { AuthScreenContainer } from '@/components/auth/auth-screen-container';
import { AuthGradientHeader } from '@/components/auth/auth-gradient-header';
import { SignInForm } from '@/components/auth/sign-in-form';

export default function LoginScreen() {
  return (
    <AuthScreenContainer>
      <Stack.Screen options={{
        title: '',
        headerShown: true,
        headerShadowVisible: false,
        headerBackTitle: '',
        headerBackground: AuthGradientHeader,
      }} />
      <SignInForm />
    </AuthScreenContainer>
  );
}
