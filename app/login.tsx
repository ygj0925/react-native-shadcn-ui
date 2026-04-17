import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { AuthScreenContainer } from '@/components/auth-screen-container';
import { ThemeToggle } from '@/components/themeToggle';
import { SignInForm } from '@/components/sign-in-form';

const SCREEN_OPTIONS = {
  title: 'Sign in',
  headerShown: true,
  headerShadowVisible: false,
  headerLargeTitle: Platform.OS === 'ios',
  headerRight: () => <ThemeToggle />,
};

export default function LoginScreen() {
  return (
    <AuthScreenContainer>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SignInForm />
    </AuthScreenContainer>
  );
}
