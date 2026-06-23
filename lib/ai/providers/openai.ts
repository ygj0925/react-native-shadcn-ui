import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { Platform } from 'react-native';

export const OPENAI_MODELS = [
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'GPT-4o-mini', value: 'gpt-4o-mini' },
  { label: 'GPT-4-turbo', value: 'gpt-4-turbo' },
] as const;

export type OpenAIModelValue = (typeof OPENAI_MODELS)[number]['value'];

export const OPENAI_MODEL_VALUES = OPENAI_MODELS.map((m) => m.value);

const baseURL =
  Platform.OS === 'web'
    ? '/openai-api'
    : process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export function createOpenAIProvider() {
  const provider = createOpenAI({
    baseURL,
    apiKey,
    name: 'openai',
  });

  return {
    name: 'openai' as const,
    chat: (modelId: string): LanguageModel => provider.chat(modelId),
  };
}
