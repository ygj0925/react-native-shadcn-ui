import { Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { AuthScreenContainer } from '@/components/auth-screen-container';
import { SignInForm } from '@/components/sign-in-form';
import { View } from 'react-native';

export default function LoginScreen() {
  const headerHeight = useHeaderHeight();

  return (
    <AuthScreenContainer>
      <Stack.Screen options={{
        title: '',
        headerShown: true,
        headerShadowVisible: false,
        headerTransparent: true,
        headerBackTitle: '',
      }} />
      <View style={{ paddingTop: headerHeight }}>
        <SignInForm />
      </View>
    </AuthScreenContainer>
  );
}
