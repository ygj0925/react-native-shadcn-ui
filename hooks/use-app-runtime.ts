import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export function useAppRuntime() {
  return useChatRuntime({
    transport: new AssistantChatTransport({
      api: `${API_URL}/api/chat`,
    }),
  });
}