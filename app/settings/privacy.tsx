import { Text } from '@/components/ui/text';
import { ArrowLeft } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: '隐私政策',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1 px-5 py-6">
        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">1. 我们收集的信息</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              MindFlow 仅在本地设备上处理你的任务、笔记、日程和习惯数据。同步到云端的数据与你的账户关联，仅用于多设备同步和备份。
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">2. 数据存储</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              你的核心数据默认存储在本地 SQLite 数据库中。登录后，数据可选择同步到 Supabase 云服务。我们不会将数据出售给第三方。
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">3. AI 服务</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              AI 对话和洞察功能会将必要的上下文发送至你选择的 AI 提供商（如 OpenAI、Claude 等）。我们不会在服务器上保留这些请求内容。
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">4. 订阅与支付</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              订阅状态由 RevenueCat 处理。我们不会在你的设备上存储支付信息。
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">5. 账户删除</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              你可以在设置中删除账户，我们将从服务器清除与你关联的个人数据。
            </Text>
          </View>

          <Text className="text-xs text-muted-foreground/60 pt-4">
            最后更新：2026-06-23
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
