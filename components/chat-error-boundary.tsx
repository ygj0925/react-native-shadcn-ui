import * as React from 'react';

type Props = {
  onReset: () => void;
  children: React.ReactNode;
};

type State = { hasError: boolean };

export class ChatErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State | null {
    if (error.message?.includes('MessageRepository')) {
      return { hasError: true };
    }
    return null;
  }

  componentDidCatch(error: Error) {
    if (!error.message?.includes('MessageRepository')) {
      throw error;
    }
    if (__DEV__) {
      console.warn('[ChatErrorBoundary] assistant-ui MessageRepository error caught, resetting chat:', error.message);
    }
    setTimeout(() => {
      this.setState({ hasError: false });
      this.props.onReset();
    }, 0);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
