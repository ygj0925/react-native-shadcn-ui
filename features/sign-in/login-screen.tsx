import { Stack } from 'expo-router';
import { AuthScreenContainer } from '@/components/auth-screen-container';
import { SignInForm } from '@/components/sign-in-form';

const SCREEN_OPTIONS = {
  title: '',
  headerShown: true,
  headerShadowVisible: false,
  headerTransparent: true,
  headerBackTitle: '',
  headerRight: undefined as any,
};

export default function LoginScreen() {
  return (
    <AuthScreenContainer>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SignInForm />
    </AuthScreenContainer>
  );
}
