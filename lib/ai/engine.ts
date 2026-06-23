import type { LanguageModel } from 'ai';
import {
  createMimoProvider,
  MIMO_MODELS,
  MIMO_MODEL_VALUES,
} from './providers/mimo';
import {
  createOpenAIProvider,
  OPENAI_MODELS,
  OPENAI_MODEL_VALUES,
} from './providers/openai';
import {
  createClaudeProvider,
  CLAUDE_MODELS,
  CLAUDE_MODEL_VALUES,
} from './providers/claude';

export const AI_MODELS = [
  ...MIMO_MODELS.map((m) => ({ ...m, provider: 'mimo' as const })),
  ...OPENAI_MODELS.map((m) => ({ ...m, provider: 'openai' as const })),
  ...CLAUDE_MODELS.map((m) => ({ ...m, provider: 'claude' as const })),
];

export type AIModelValue = (typeof AI_MODELS)[number]['value'];
export type AIProviderName = (typeof AI_MODELS)[number]['provider'];

export const DEFAULT_MODEL: AIModelValue = 'mimo-v2.5-pro';

// ─── Provider registry ─────────────────────────────────────────────────────

const providers = {
  mimo: createMimoProvider(),
  openai: createOpenAIProvider(),
  claude: createClaudeProvider(),
};

export function getProviderForModel(modelId: string): AIProviderName {
  if (MIMO_MODEL_VALUES.includes(modelId as any)) return 'mimo';
  if (OPENAI_MODEL_VALUES.includes(modelId as any)) return 'openai';
  if (CLAUDE_MODEL_VALUES.includes(modelId as any)) return 'claude';
  return 'mimo';
}

export function createChatModel(modelId: string = DEFAULT_MODEL): LanguageModel {
  const providerName = getProviderForModel(modelId);
  return providers[providerName].chat(modelId);
}

// ─── Simple routing helpers (non-streaming / streaming) ─────────────────────

export async function* streamChat(
  modelId: string,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
): AsyncGenerator<string> {
  const model = createChatModel(modelId);
  const { streamText } = await import('ai');
  const { textStream } = await streamText({
    model,
    messages,
  });

  for await (const chunk of textStream) {
    yield chunk;
  }
}

export async function chat(
  modelId: string,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
): Promise<string> {
  const model = createChatModel(modelId);
  const { generateText } = await import('ai');
  const { text } = await generateText({
    model,
    messages,
  });
  return text;
}
