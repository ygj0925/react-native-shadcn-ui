import React, { useRef } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/themeToggle';
import { Text } from '@/components/ui/text';
import { SignInForm } from '@/components/sign-in-form';

const SCREEN_OPTIONS = {
  title: '登录页面',
  headerShown: true,
  headerTransparent: false,
  headerRight: () => <ThemeToggle />,
};

export default function LoginScreen() {
  const passwordRef = useRef<TextInput>(null);

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 bg-background">
      <Stack.Screen options={SCREEN_OPTIONS} />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
          paddingBottom: 60
        }}
        bottomOffset={60}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-sm mx-auto">

          <View className="mb-10">
            <Text className="mb-2 text-2xl font-bold text-center text-foreground sm:text-left">
              欢迎登录
            </Text>
            <Text className="text-center text-muted-foreground sm:text-left">
              请输入您的邮箱和密码以继续
            </Text>
          </View>

          <View className="flex-col gap-5">
            <View className="flex-col gap-2">
              <Text className="text-sm font-medium text-foreground">邮箱</Text>
              <TextInput
                className="h-12 px-4 border rounded-md border-border bg-background text-foreground"
                placeholder="m@example.com"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            {/* 这里保留了你之前贴的多个输入框用于测试滚动，只给最后一个绑 ref 测试 */}
            {[1, 2, 3, 4, 5, 6].map((item, index) => (
              <View key={index} className="flex-col gap-2">
                <Text className="text-sm font-medium text-foreground">密码 {item}</Text>
                <TextInput
                  ref={index === 5 ? passwordRef : null} // 只让最后一个获取 ref
                  className="h-12 px-4 border rounded-md border-border bg-background text-foreground"
                  placeholder="请输入密码"
                  placeholderTextColor="#888"
                  secureTextEntry
                  returnKeyType="done"
                />
              </View>
            ))}

            <TouchableOpacity
              activeOpacity={0.8}
              className="items-center justify-center w-full h-12 mt-4 rounded-md bg-primary"
              onPress={() => console.log('执行登录')}
            >
              <Text className="text-base font-semibold text-primary-foreground">
                登 录1
              </Text>
            </TouchableOpacity>

            <SignInForm />
          </View>

        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}