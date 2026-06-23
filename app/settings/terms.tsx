import { Text } from '@/components/ui/text';
import { ArrowLeft } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: '服务条款',
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
            <Text className="text-lg font-semibold text-foreground">1. 服务说明</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              MindFlow 是一款个人效率管理应用，提供任务、笔记、日程、习惯追踪及 AI 辅助功能。部分高级功能需要订阅 Pro 计划。
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">2. 用户责任</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              你应对自己创建的内容负责。请勿使用 MindFlow 存储或传播违法违规信息。
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">3. 订阅与退款</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              Pro 订阅通过 Apple App Store 或 Google Play 处理。取消和退款需遵循对应平台的政策。
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">4. 服务变更</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              我们保留随时修改或终止服务的权利。重大变更会提前在应用内通知用户。
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">5. 联系我们</Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              如有任何问题，请通过应用内反馈入口或邮件联系支持团队。
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
