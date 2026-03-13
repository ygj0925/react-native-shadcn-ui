import React from 'react';
import { 
  View, 
  TextInput, 
  ScrollView, 
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
// ⚠️ 注意：这里是从 keyboard-controller 导入，而不是 react-native 原生导入
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export default function FixedBottomInputScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight(); 

  return (
    // 外层容器：占满屏幕，不能用 SafeAreaView 的 bottom
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: '评论11' }} />

      {/* 使用基于原生驱动的 KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // iOS 需要 padding 模式，Android 因为你 app.json 配置了 resize，所以传 undefined 避免冲突
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        {/* 聊天内容/评论滚动区 */}
        <ScrollView 
          className="flex-1 px-4"
          keyboardDismissMode="interactive" 
        >
          {/* 填充一些内容让它可以滚动 */}
          <View style={{ height: 1000 }} /> 
        </ScrollView>

        {/* 底部固定输入框 */}
        <View
          className="bg-card px-4 pt-3 border-t border-border"
          style={{
            // 兼容 iPhone 底部小黑条
            paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 12,
          }}
        >
          <TextInput
            className="h-12 px-4 mb-2 bg-background border border-border rounded-full text-foreground"
            placeholder="说点什么..."
            placeholderTextColor="#888"
            returnKeyType="send"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}