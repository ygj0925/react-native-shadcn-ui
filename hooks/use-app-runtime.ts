import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";

export function useAppRuntime() {
  return useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });
}
