import { Text } from '@/components/ui/text';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  if (isConnected !== false) return null;

  return (
    <View className="flex-row items-center justify-center gap-2 px-4 py-2 bg-destructive/10">
      <WifiOff size={14} className="text-destructive" strokeWidth={2} />
      <Text className="text-xs font-medium text-destructive">当前处于离线状态，数据将在联网后同步</Text>
    </View>
  );
}
