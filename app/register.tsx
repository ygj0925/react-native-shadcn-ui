import { SignUpForm } from '@/components/sign-up-form';
import { ScrollView, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements'
import { ThemeToggle } from '@/components/themeToggle';
import { Stack } from 'expo-router';

const SCREEN_OPTIONS = {
  title: '注册页面',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};
export default function SignUpScreen() {
  const headerHeight = useHeaderHeight()

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: headerHeight,
        }}
        contentContainerClassName="sm:flex-1 items-center justify-start p-4 py-8 sm:py-4 sm:p-6 mt-safe"
        keyboardDismissMode="interactive">
        <View className="w-full max-w-sm">
          <SignUpForm />
        </View>
      </ScrollView>
    </>

  );
}