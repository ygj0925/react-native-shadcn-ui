import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DirectChatTransport, ToolLoopAgent } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { useMemo } from "react";
import { Platform } from "react-native";

const baseURL =
  Platform.OS === "web"
    ? "/mimo-tp"
    : process.env.EXPO_PUBLIC_MIMO_TP_BASE_URL ||
      "https://token-plan-cn.xiaomimimo.com/v1";

const apiKey =
  process.env.EXPO_PUBLIC_MIMO_TP_API_KEY ||
  "tp-crry1wbphs88mstr60fsxdkndmaehxipam78khv2fg65dovp";

const openai = createOpenAI({
  baseURL,
  apiKey,
  name: "mimo-tp",
});

export const MIMO_MODELS = [
  { label: "MiMo-V2.5-Pro", value: "mimo-v2.5-pro" },
  { label: "MiMo-V2.5", value: "mimo-v2.5" },
  { label: "MiMo-V2.5-TTS-VoiceClone", value: "mimo-v2.5-tts-voiceclone" },
  { label: "MiMo-V2.5-TTS-VoiceDesign", value: "mimo-v2.5-tts-voicedesign" },
  { label: "MiMo-V2.5-TTS", value: "mimo-v2.5-tts" },
  { label: "MiMo-V2-Pro", value: "mimo-v2-pro" },
  { label: "MiMo-V2-Omni", value: "mimo-v2-omni" },
  { label: "MiMo-V2-TTS", value: "mimo-v2-tts" },
] as const;

export type MiMoModelValue = (typeof MIMO_MODELS)[number]["value"];

export function useAppRuntime(modelId: string = "mimo-v2.5-pro") {
  const transport = useMemo(() => {
    const agent = new ToolLoopAgent({
      model: openai.chat(modelId),
    });
    return new DirectChatTransport({ agent });
  }, [modelId]);

  return useChatRuntime({ transport });
}
