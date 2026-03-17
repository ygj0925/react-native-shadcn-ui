import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { type TextInput, View } from 'react-native';

export function SignInForm() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onSubmit() {
    router.push('/chat');
  }

  return (
    <View className="flex-col gap-6">
      <View className="gap-1">
        <CardTitle className="text-2xl tracking-tight text-center sm:text-left">
          Sign in
        </CardTitle>
        <CardDescription className="text-center sm:text-left">
          Use your email to access recent conversations and workspace shortcuts.
        </CardDescription>
      </View>
      <View className="gap-5">
        <View className="gap-2">
          <Label htmlFor="email">AD账号</Label>
          <Input
            id="email"
            placeholder="请输入AD账号"
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
            <Label htmlFor="password">Password</Label>
            <Button
              variant="link"
              size="sm"
              className="h-4 px-1 py-0 ml-auto web:h-fit sm:h-4"
              onPress={() => { }}>
              <Text className="font-normal leading-4">Forgot password?</Text>
            </Button>
          </View>
          <Input
            ref={passwordInputRef}
            id="password"
            value={password}
            onChangeText={setPassword}
            placeholder="请输入密码"
            secureTextEntry
            returnKeyType="send"
            onSubmitEditing={onSubmit}
          />
        </View>

        <Button
          className="w-full h-11"
          onPress={onSubmit}
          disabled={!email.trim() || !password.trim()}>
          <Text>Sign in</Text>
        </Button>
      </View>

      <Text className="text-sm text-center">
        Don't have an account?{' '}
        <Text
          className="text-sm font-medium underline"
          onPress={() => router.push('/register')}>
          Create one
        </Text>
      </Text>

      <View className="flex-row items-center">
        <Separator className="flex-1" />
        <Text className="px-4 text-sm text-muted-foreground">or continue with</Text>
        <Separator className="flex-1" />
      </View>

      <SocialConnections />

    </View>
  );
}
