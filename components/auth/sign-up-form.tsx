import { SocialConnections } from '@/components/auth/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, TextInput, View } from 'react-native';

export function SignUpForm() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    if (!email.trim() || !password.trim()) return;

    try {
      setLoading(true);
      const { error } = await signUp(email.trim(), password.trim());
      if (error) {
        Alert.alert(t('auth.register'), error);
        return;
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert(t('auth.register'), e.message ?? t('auth.login_failed_desc'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-col gap-6">
      <Card className="py-0 shadow-sm border-border bg-card/95 shadow-black/5">
        <CardHeader className="gap-3 px-5 pt-5 pb-3">
          <CardTitle className="text-2xl tracking-tight text-center">{t('auth.register')}</CardTitle>
          <CardDescription className="text-center">
            {t('auth.register_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6 px-5 pb-5">
          <View className="gap-5">
            <View className="gap-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                placeholder={t('auth.email_placeholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>
            <View className="gap-2">
              <View className="flex-row items-center">
                <Label htmlFor="password">{t('auth.password')}</Label>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.create_password_placeholder')}
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
              />
            </View>
            <Button
              className="w-full h-11"
              onPress={onSubmit}
              disabled={loading || !email.trim() || !password.trim()}>
              <Text>{loading ? t('auth.signing_in') : t('auth.continue')}</Text>
            </Button>
          </View>
          <Text className="text-sm text-center">
            {t('auth.have_account')}{' '}
            <Text className="text-sm font-medium underline" onPress={() => router.push('/login')}>
              {t('auth.sign_in_link')}
            </Text>
          </Text>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">{t('auth.or_connect')}</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections />
        </CardContent>
      </Card>

      <Card className="py-0 shadow-none border-border bg-muted/35">
        <CardContent className="px-5 py-4">
          <Text className="text-sm leading-6 text-muted-foreground">
            {t('auth.register_footer')}
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
