import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  type FeedbackAdapter,
} from "@assistant-ui/react-native";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DirectChatTransport, ToolLoopAgent, tool, jsonSchema } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { useMemo, useRef } from "react";
import { Platform } from "react-native";

const baseURL =
  Platform.OS === "web"
    ? "/mimo-api"
    : process.env.EXPO_PUBLIC_MIMO_BASE_URL ||
      "https://api.xiaomimimo.com/v1";

const apiKey =
  process.env.EXPO_PUBLIC_MIMO_API_KEY ||
  "sk-cv7i164o0szeuwem9irk4pnte7mpt422rweh43zbmgp5t8pw";

const customFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  headers.delete("authorization");
  headers.set("api-key", apiKey);
  return fetch(input, { ...init, headers });
};

const openai = createOpenAI({
  baseURL,
  apiKey,
  name: "mimo",
  fetch: customFetch,
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

const interactiveTools = {
  show_select: tool({
    description:
      "展示一个下拉选择框让用户从多个选项中选择一个。当需要用户做单选决策时使用此工具。",
    inputSchema: jsonSchema({
      type: "object",
      properties: {
        title: { type: "string", description: "选择框的标题" },
        options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string", description: "显示给用户的选项文本" },
              value: { type: "string", description: "选项的值" },
            },
            required: ["label", "value"],
          },
          description: "可供选择的选项列表",
        },
      },
      required: ["title", "options"],
    }),
    outputSchema: jsonSchema({
      type: "object",
      properties: {
        value: { type: "string", description: "用户选择的值" },
        label: { type: "string", description: "用户选择的标签" },
      },
      required: ["value"],
    }),
  }),
  show_confirm: tool({
    description:
      "展示一个确认对话框让用户确认或取消操作。当需要用户做是/否决策时使用此工具。",
    inputSchema: jsonSchema({
      type: "object",
      properties: {
        title: { type: "string", description: "确认框的标题" },
        message: { type: "string", description: "确认框的详细描述信息" },
      },
      required: ["title", "message"],
    }),
    outputSchema: jsonSchema({
      type: "object",
      properties: {
        confirmed: { type: "boolean", description: "用户是否确认" },
      },
      required: ["confirmed"],
    }),
  }),
  show_multi_select: tool({
    description:
      "展示一个多选列表让用户选择多个选项。当需要用户从列表中勾选多项时使用此工具。",
    inputSchema: jsonSchema({
      type: "object",
      properties: {
        title: { type: "string", description: "多选框的标题" },
        options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string", description: "显示给用户的选项文本" },
              value: { type: "string", description: "选项的值" },
            },
            required: ["label", "value"],
          },
          description: "可供选择的选项列表",
        },
      },
      required: ["title", "options"],
    }),
    outputSchema: jsonSchema({
      type: "object",
      properties: {
        values: {
          type: "array",
          items: { type: "string" },
          description: "用户选择的值列表",
        },
      },
      required: ["values"],
    }),
  }),
};

export function useAppRuntime(modelId: string = "mimo-v2.5-pro") {
  // Keep modelId in a ref so prepareCall always reads the latest value
  // without the transport needing to be recreated.
  const modelIdRef = useRef(modelId);
  modelIdRef.current = modelId;

  // Create transport and adapters exactly once (empty deps).
  // Model switching works via the ref inside prepareCall.
  const { transport, adapters } = useMemo(() => {
    const agent = new ToolLoopAgent({
      model: openai.chat(modelIdRef.current),
      tools: interactiveTools,
      // prepareCall receives the full baseCallArgs (including prompt/messages)
      // and must return them spread — returning only { model } would wipe prompt.
      prepareCall: (args) => ({
        ...args,
        model: openai.chat(modelIdRef.current),
      }),
    });

    return {
      transport: new DirectChatTransport({ agent }),
      adapters: {
        attachments: new CompositeAttachmentAdapter([
          new SimpleImageAttachmentAdapter(),
          new SimpleTextAttachmentAdapter(),
        ]),
        feedback: feedbackAdapter,
      },
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return useChatRuntime({ transport, adapters });
}

const feedbackAdapter: FeedbackAdapter = {
  submit: ({ message, type }) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[assistant-ui feedback]", type, message.id);
    }
  },
};
