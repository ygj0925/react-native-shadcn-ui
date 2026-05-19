import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  type FeedbackAdapter,
} from "@assistant-ui/react-native";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import {
  DirectChatTransport,
  ToolLoopAgent,
  tool,
  jsonSchema,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
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

const reasoningCache = new Map<string, string>();

function captureReasoningFromStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let reasoning = "";
  const toolCallIds: string[] = [];
  let buffer = "";

  (async () => {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const data = JSON.parse(line.slice(6));
            const delta = data.choices?.[0]?.delta;
            if (!delta) continue;
            if (delta.reasoning_content) reasoning += delta.reasoning_content;
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (tc.id) toolCallIds.push(tc.id);
              }
            }
          } catch {}
        }
      }

      for (const id of toolCallIds) {
        reasoningCache.set(id, reasoning);
      }
    } catch {} finally {
      reader.releaseLock();
    }
  })();
}

function injectReasoningContent(body: string): string {
  try {
    const parsed = JSON.parse(body);
    if (!parsed.messages) return body;

    let modified = false;
    for (const msg of parsed.messages) {
      if (
        msg.role === "assistant" &&
        msg.tool_calls?.length > 0 &&
        !("reasoning_content" in msg)
      ) {
        for (const tc of msg.tool_calls) {
          const cached = reasoningCache.get(tc.id);
          if (cached !== undefined) {
            msg.reasoning_content = cached;
            modified = true;
            break;
          }
        }
      }
    }

    return modified ? JSON.stringify(parsed) : body;
  } catch {
    return body;
  }
}

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1000;

const customFetch: typeof fetch = async (input, init) => {
  const headers = new Headers(init?.headers);
  headers.delete("authorization");
  headers.set("api-key", apiKey);

  if (init?.body && typeof init.body === "string") {
    init = { ...init, body: injectReasoningContent(init.body) };
  }

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(input, { ...init, headers });

      if (!res.ok && res.status >= 500 && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }

      if (
        res.ok &&
        res.body &&
        res.headers.get("content-type")?.includes("text/event-stream")
      ) {
        const [main, shadow] = res.body.tee();
        captureReasoningFromStream(shadow);
        return new Response(main, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Request failed after retries");
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

  return useChatRuntime({
    transport,
    adapters,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
}

const feedbackAdapter: FeedbackAdapter = {
  submit: ({ message, type }) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[assistant-ui feedback]", type, message.id);
    }
  },
};
