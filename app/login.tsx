import { SignInForm } from '@/components/sign-in-form';
import { ScrollView, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements'
import { ThemeToggle } from '@/components/themeToggle';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  title: '登录页面',
  headerShown: true,
  headerTransparent: false,
  headerRight: () => <ThemeToggle />,
};
export default function SignUpScreen() {
  const headerHeight = useHeaderHeight()

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} className="flex-1">
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className='flex-1'>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="p-4 py-8"
          keyboardDismissMode="interactive">
          <View className="w-full max-w-sm">
            <SignInForm />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}