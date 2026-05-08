import { SocialConnections } from '@/components/auth/social-connections';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { t } from '@/lib/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, type TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod/v4';
import { login } from '@/api/services/auth'
import Ionicons from '@expo/vector-icons/Ionicons';

const schema = z.object({
  username: z
    .string()
    .min(1, t('auth.ad_account_required')),
  password: z
    .string()
    .min(1, t('auth.password_required')),
});

type FormValues = z.infer<typeof schema>;

export function SignInForm() {
  const router = useRouter();
  const passwordInputRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);
      const data = await login(values);
      console.log('====================================');
      console.log(data, 'data');
      console.log('====================================');
      // router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert(t('auth.login_failed'), e.message ?? t('auth.login_failed_desc'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-col gap-6">
      <View className="gap-1">
        <CardTitle className="text-2xl tracking-tight text-center">{t('auth.sign_in')}</CardTitle>
        <CardDescription className="text-center">
          {t('auth.sign_in_desc')}
        </CardDescription>
      </View>
      <View className="gap-5">
        <View className="gap-2">
          <Label htmlFor="username">{t('auth.ad_account')}</Label>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder={t('auth.ad_account_placeholder')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                returnKeyType="next"
                autoCapitalize="none"
                autoComplete="username"
              />
            )}
          />
          {errors.username && (
            <Text className="text-sm text-destructive">{errors.username.message}</Text>
          )}
        </View>

        <View className="gap-2">
          <View className="flex-row items-center">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Button
              variant="link"
              size="sm"
              className="h-4 px-1 py-0 ml-auto web:h-fit sm:h-4"
              onPress={() => {
                Alert.alert(t('auth.forgot_title'), t('auth.forgot_desc'));
              }}>
              <Text className="font-normal leading-4">{t('auth.forgot')}</Text>
            </Button>
          </View>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={passwordInputRef}
                placeholder={t('auth.password_placeholder')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                autoComplete="password"
                endAdornment={
                  <Pressable className='ml-1' onPress={() => setShowPassword((prev) => !prev)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#888"
                    />
                  </Pressable>
                }
              />
            )}
          />
          {errors.password && (
            <Text className="text-sm text-destructive">{errors.password.message}</Text>
          )}
        </View>

        <Button
          className="w-full h-11"
          onPress={handleSubmit(onSubmit)}
          disabled={loading}>
          <Text>{loading ? t('auth.signing_in') : t('auth.sign_in')}</Text>
        </Button>
      </View>

      <Text className="text-sm text-center">
        {t('auth.no_account')}{' '}
        <Text
          className="text-sm font-medium underline"
          onPress={() => router.push('/register')}>
          {t('auth.create_one')}
        </Text>
      </Text>

      <View className="flex-row items-center">
        <Separator className="flex-1" />
        <Text className="px-4 text-sm text-muted-foreground">{t('auth.or_continue')}</Text>
        <Separator className="flex-1" />
      </View>

      <SocialConnections />
    </View>
  );
}
