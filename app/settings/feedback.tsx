import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ArrowLeft, Send } from 'lucide-react-native';
import * as React from 'react';
import { Linking, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';

const SUPPORT_EMAIL = 'support@mindflow.app';

export default function FeedbackScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [message, setMessage] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const handleSend = async () => {
    const subject = encodeURIComponent('MindFlow 用户反馈');
    const body = encodeURIComponent(message);
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      setSent(true);
      setMessage('');
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: '反馈',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1 px-5 py-6">
        <View className="gap-4">
          <Text className="text-sm text-muted-foreground">
            遇到 bug 或有功能建议？请告诉我们，我们会尽快处理。
          </Text>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="请描述你的问题或建议..."
            placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
            multiline
            textAlignVertical="top"
            className="min-h-[160px] rounded-xl border border-border bg-card p-4 text-sm text-foreground"
          />

          <Button
            onPress={handleSend}
            disabled={message.trim().length === 0}
            className="rounded-xl">
            <Send size={16} className="text-primary-foreground" strokeWidth={2} />
            <Text className="font-medium text-primary-foreground">发送反馈</Text>
          </Button>

          {sent ? (
            <Text className="text-center text-xs text-muted-foreground">
              已打开邮件客户端，发送后我们会尽快查看。
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
