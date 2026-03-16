import { SignUpForm } from '@/components/sign-up-form';
import { ScrollView, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements'
import { ThemeToggle } from '@/components/themeToggle';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const SCREEN_OPTIONS = {
  title: '注册页面',
  headerShown: true,
  headerTransparent: false,
  headerRight: () => <ThemeToggle />,
};
export default function SignUpScreen() {
  const headerHeight = useHeaderHeight()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-background">
      <Stack.Screen options={SCREEN_OPTIONS} />
      <KeyboardAwareScrollView
        bottomOffset={24}
        extraKeyboardSpace={32}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 32 }}>
        <View className="mx-auto w-full max-w-sm gap-6">
          <SignUpForm />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}