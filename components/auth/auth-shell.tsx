import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { ReactNode } from 'react';
import { View } from 'react-native';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer?: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, footer, children }: AuthShellProps) {
  return (
    <View className="gap-6">
      <Card className="overflow-hidden border-0 bg-primary py-0 shadow-sm">
        <CardContent className="px-5 py-6">
          <View className="relative overflow-hidden rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-6">
            <View className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-primary-foreground/10" />
            <View className="absolute -bottom-8 -left-6 h-20 w-20 rounded-full bg-primary-foreground/5" />

            <View className="gap-3">
              <View className="self-start rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1">
                <Text className="text-xs font-medium uppercase tracking-widest text-primary-foreground/80">
                  {eyebrow}
                </Text>
              </View>
              <View className="gap-2">
                <Text className="text-2xl font-semibold tracking-tight text-primary-foreground">
                  {title}
                </Text>
                <Text className="leading-6 text-primary-foreground/80">{description}</Text>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>

      <View className="gap-4">
        {children}
        {footer ? (
          <Text className="px-1 text-xs leading-5 text-muted-foreground">{footer}</Text>
        ) : null}
      </View>
    </View>
  );
}
