import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

const MIMO_TP_BASE_URL =
  process.env.EXPO_PUBLIC_MIMO_TP_BASE_URL ??
  "https://token-plan-cn.xiaomimimo.com/v1";

const MIMO_TP_API_KEY =
  process.env.EXPO_PUBLIC_MIMO_TP_API_KEY ??
  "tp-crry1wbphs88mstr60fsxdkndmaehxipam78khv2fg65dovp";

const MIMO_MODEL =
  process.env.EXPO_PUBLIC_MIMO_MODEL ?? "mimo-v2.5-pro";

const mimo = createOpenAI({
  baseURL: MIMO_TP_BASE_URL,
  apiKey: MIMO_TP_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: mimo(MIMO_MODEL),
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
