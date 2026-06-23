import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { PricingTable, type Plan } from './pricing-table';
import { useSubscription } from '@/hooks/useSubscription';
import { usePermission } from '@/hooks/usePermission';
import * as React from 'react';
import { View } from 'react-native';

type PaywallProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  reason?: string;
  compact?: boolean;
};

export function Paywall({
  open,
  onOpenChange,
  title = '升级以继续',
  description = '当前方案已达到使用上限，升级到 Pro 解锁全部功能。',
  reason,
  compact = false,
}: PaywallProps) {
  const { tier, offerings, isLoading, purchase, restore } = useSubscription();
  const [purchasing, setPurchasing] = React.useState(false);

  const handleSelectPlan = async (plan: Plan, pkg?: any) => {
    if (!pkg || plan === 'free' || plan === 'team') return;
    setPurchasing(true);
    try {
      await purchase(pkg);
      onOpenChange(false);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    await restore();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90%] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {reason ? reason : description}
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4 overflow-hidden">
          <PricingTable
            currentPlan={tier}
            offerings={offerings}
            onSelectPlan={handleSelectPlan}
            compact={compact}
          />

          {(purchasing || isLoading) ? (
            <View className="items-center py-2">
              <Text className="text-sm text-muted-foreground">处理中...</Text>
            </View>
          ) : null}
        </View>

        <DialogFooter>
          <Button variant="ghost" onPress={() => onOpenChange(false)} className="flex-1 rounded-xl">
            <Text className="text-sm text-foreground">稍后</Text>
          </Button>
          <Button variant="outline" onPress={handleRestore} className="flex-1 rounded-xl">
            <Text className="text-sm text-foreground">恢复购买</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function usePaywall() {
  const [open, setOpen] = React.useState(false);
  const [context, setContext] = React.useState<{ title?: string; description?: string; reason?: string }>({});

  const showPaywall = React.useCallback((overrides?: { title?: string; description?: string; reason?: string }) => {
    setContext(overrides ?? {});
    setOpen(true);
  }, []);

  const hidePaywall = React.useCallback(() => {
    setOpen(false);
  }, []);

  const PaywallComponent = React.useCallback(
    ({ compact }: { compact?: boolean }) => (
      <Paywall open={open} onOpenChange={setOpen} compact={compact} {...context} />
    ),
    [open, context]
  );

  return { showPaywall, hidePaywall, PaywallComponent, isOpen: open };
}
