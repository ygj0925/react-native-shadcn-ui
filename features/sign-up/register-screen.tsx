import { Stack } from 'expo-router';
import { AuthScreenContainer } from '@/components/auth/auth-screen-container';
import { AuthGradientHeader } from '@/components/auth/auth-gradient-header';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { t } from '@/lib/i18n';

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
        eyebrow={t('auth.register_eyebrow')}
        title={t('auth.register_title')}
        description={t('auth.register_description')}
        footer={t('auth.register_shell_footer')}>
        <SignUpForm />
      </AuthShell>
    </AuthScreenContainer>
  );
}
