import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { AI_MODELS } from '@/lib/ai/engine';
import { useSettingsStore } from '@/lib/store/settings';
import { cn } from '@/lib/utils';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AIModelSettingsScreen() {
  const router = useRouter();
  const aiModel = useSettingsStore((s) => s.aiModel);
  const setAIModel = useSettingsStore((s) => s.setAIModel);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'AI 模型',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 pt-4 pb-6 gap-5">
          <Text className="text-sm text-muted-foreground">
            选择 AI 对话默认使用的模型。不同模型在速度、成本和效果上有所差异。
          </Text>

          <Card className="py-0 border-border/60">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-[15px] font-semibold">可用模型</CardTitle>
            </CardHeader>
            <Separator className="opacity-50" />
            <CardContent className="px-0 py-1">
              {AI_MODELS.map((model, index) => {
                const selected = aiModel === model.value;
                return (
                  <View key={model.value}>
                    <Pressable
                      onPress={() => setAIModel(model.value)}
                      className="flex-row items-center px-5 py-3.5 active:bg-accent/50">
                      <View className="flex-1 gap-0.5">
                        <Text className="text-[15px] text-foreground">{model.label}</Text>
                        <Text className="text-xs text-muted-foreground">{model.provider}</Text>
                      </View>
                      {selected ? (
                        <View className="items-center justify-center w-6 h-6 rounded-full bg-primary">
                          <Check size={14} color="#fff" strokeWidth={2.5} />
                        </View>
                      ) : null}
                    </Pressable>
                    {index < AI_MODELS.length - 1 ? (
                      <Separator className="mx-5 opacity-30" />
                    ) : null}
                  </View>
                );
              })}
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
