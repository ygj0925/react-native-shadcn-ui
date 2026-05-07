import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useMemo } from "react";
import { Platform } from "react-native";
import type { ChatTransport } from "ai";
import type { UIMessage } from "ai";

const baseURL =
  Platform.OS === "web"
    ? "/mimo-tp"
    : process.env.EXPO_PUBLIC_MIMO_TP_BASE_URL ||
      "https://token-plan-cn.xiaomimimo.com/v1";

const apiKey =
  process.env.EXPO_PUBLIC_MIMO_TP_API_KEY ||
  "tp-crry1wbphs88mstr60fsxdkndmaehxipam78khv2fg65dovp";

export const MIMO_MODELS = [
  "MiMo-V2.5-Pro",
  "MiMo-V2.5",
  "MiMo-V2.5-TTS-VoiceClone",
  "MiMo-V2.5-TTS-VoiceDesign",
  "MiMo-V2.5-TTS",
  "MiMo-V2-Pro",
  "MiMo-V2-Omni",
  "MiMo-V2-TTS",
] as const;

export type MiMoModel = (typeof MIMO_MODELS)[number];

function convertMessages(messages: UIMessage[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("\n"),
    }));
}

class MiMoChatTransport implements ChatTransport<UIMessage> {
  private modelId: string;

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  async sendMessages({
    messages,
    abortSignal,
  }: {
    trigger: "submit-message" | "regenerate-message";
    chatId: string;
    messageId: string | undefined;
    messages: UIMessage[];
    abortSignal: AbortSignal | undefined;
  }) {
    const body = {
      model: this.modelId,
      messages: convertMessages(messages),
      stream: true,
    };

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "error" as const, errorText });
          controller.close();
        },
      });
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let textId = `text-${Date.now()}`;
    let started = false;

    return new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            if (started) {
              controller.enqueue({ type: "text-end" as const, id: textId });
            }
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              if (started) {
                controller.enqueue({ type: "text-end" as const, id: textId });
              }
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              if (!delta) continue;

              const content = delta.content || "";
              if (content) {
                if (!started) {
                  controller.enqueue({ type: "text-start" as const, id: textId });
                  started = true;
                }
                controller.enqueue({
                  type: "text-delta" as const,
                  id: textId,
                  delta: content,
                });
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      },
    });
  }

  async reconnectToStream() {
    return null;
  }
}

export function useAppRuntime(modelId: MiMoModel = "MiMo-V2.5-Pro") {
  const transport = useMemo(() => new MiMoChatTransport(modelId), [modelId]);
  return useChatRuntime({ transport });
}
