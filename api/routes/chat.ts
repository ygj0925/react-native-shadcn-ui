import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

const mimo = createOpenAI({
  baseURL: process.env.EXPO_PUBLIC_MIMO_TP_BASE_URL,
  apiKey: process.env.EXPO_PUBLIC_MIMO_TP_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: mimo(process.env.EXPO_PUBLIC_MIMO_MODEL ?? "mimo-v2.5-pro"),
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
