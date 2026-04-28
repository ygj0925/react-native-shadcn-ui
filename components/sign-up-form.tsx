import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { TextInput, View } from 'react-native';

export function SignUpForm() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onSubmit() {
    router.push('/login');
  }

  return (
    <View className="flex-col gap-6">
      <Card className="py-0 shadow-sm border-border bg-card/95 shadow-black/5">
        <CardHeader className="gap-3 px-5 pt-5 pb-3">
          <CardTitle className="text-2xl tracking-tight text-center">Register</CardTitle>
          <CardDescription className="text-center">
            Start with the essentials and keep the setup flow lightweight.
          </CardDescription>
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
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
              />
            </View>
            <Button
              className="w-full h-11"
              onPress={onSubmit}
              disabled={!email.trim() || !password.trim()}>
              <Text>Continue</Text>
            </Button>
          </View>
          <Text className="text-sm text-center">
            Already have an account?{' '}
            <Text className="text-sm font-medium underline" onPress={() => router.push('/login')}>
              Sign in
            </Text>
          </Text>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">or connect with</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections />
        </CardContent>
      </Card>

      <Card className="py-0 shadow-none border-border bg-muted/35">
        <CardContent className="px-5 py-4">
          <Text className="text-sm leading-6 text-muted-foreground">
            This currently loops back to sign-in so the rest of the interface stays demo-ready while
            authentication is still being polished.
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
