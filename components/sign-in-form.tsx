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
      <Card className="border-border bg-card/95 py-0 shadow-lg shadow-black/5">
        <CardHeader className="gap-3 px-5 pb-3 pt-5">
          <View className="gap-1">
            <CardTitle className="text-center text-2xl tracking-tight sm:text-left">
              Sign in
            </CardTitle>
            <CardDescription className="text-center sm:text-left">
              Use your email to access recent conversations and workspace shortcuts.
            </CardDescription>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <View className="rounded-full bg-muted px-3 py-1.5">
              <Text className="text-xs text-muted-foreground">Fast access</Text>
            </View>
            <View className="rounded-full bg-muted px-3 py-1.5">
              <Text className="text-xs text-muted-foreground">Cleaner hierarchy</Text>
            </View>
          </View>
        </CardHeader>
        <CardContent className="gap-6 px-5 pb-5">
          <View className="gap-5">
            <View className="gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@company.com"
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
                  className="ml-auto h-4 px-1 py-0 web:h-fit sm:h-4"
                  onPress={() => {}}>
                  <Text className="font-normal leading-4">Forgot password?</Text>
                </Button>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
              />
            </View>

            <Button
              className="h-11 w-full"
              onPress={onSubmit}
              disabled={!email.trim() || !password.trim()}>
              <Text>Sign in</Text>
            </Button>
          </View>

          <Text className="text-center text-sm">
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
        </CardContent>
      </Card>

      <Card className="border-border bg-muted/35 py-0 shadow-none">
        <CardContent className="px-5 py-4">
          <Text className="text-sm leading-6 text-muted-foreground">
            This screen already routes into the chat workspace, so you can preview the signed-in
            experience immediately.
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
