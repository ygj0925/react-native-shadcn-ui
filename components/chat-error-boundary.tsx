import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

const MAX_RETRIES = 3;
const RETRY_COOLDOWN_MS = 2000;

type Props = {
  onReset: () => void;
  children: React.ReactNode;
};

type State = { hasError: boolean; retryCount: number; exhausted: boolean };

export class ChatErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, retryCount: 0, exhausted: false };

  static getDerivedStateFromError(error: Error): Partial<State> | null {
    if (error.message?.includes('MessageRepository')) {
      return { hasError: true };
    }
    return null;
  }

  componentDidCatch(error: Error) {
    if (!error.message?.includes('MessageRepository')) {
      throw error;
    }

    const nextCount = this.state.retryCount + 1;

    if (nextCount > MAX_RETRIES) {
      this.setState({ exhausted: true });
      return;
    }

    if (__DEV__) {
      console.warn(
        `[ChatErrorBoundary] MessageRepository error (attempt ${nextCount}/${MAX_RETRIES}):`,
        error.message,
      );
    }

    setTimeout(() => {
      this.setState({ hasError: false, retryCount: nextCount });
      this.props.onReset();
    }, RETRY_COOLDOWN_MS);
  }

  private handleManualRetry = () => {
    this.setState({ hasError: false, retryCount: 0, exhausted: false });
    this.props.onReset();
  };

  render() {
    if (this.state.exhausted) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-6 gap-4">
          <Text className="text-base font-medium text-foreground">
            聊天加载失败
          </Text>
          <Text className="text-sm text-muted-foreground text-center">
            多次尝试恢复未成功，请点击重试。
          </Text>
          <Pressable
            onPress={this.handleManualRetry}
            className="px-5 py-2.5 rounded-lg bg-primary active:opacity-85">
            <Text className="text-sm font-medium text-primary-foreground">
              重试
            </Text>
          </Pressable>
        </View>
      );
    }

    if (this.state.hasError) return null;
    return this.props.children;
  }
}
