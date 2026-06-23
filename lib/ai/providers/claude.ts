import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { Platform } from 'react-native';

export const CLAUDE_MODELS = [
  { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-latest' },
  { label: 'Claude 3 Opus', value: 'claude-3-opus-latest' },
  { label: 'Claude 3 Haiku', value: 'claude-3-haiku-latest' },
] as const;

export type ClaudeModelValue = (typeof CLAUDE_MODELS)[number]['value'];

export const CLAUDE_MODEL_VALUES = CLAUDE_MODELS.map((m) => m.value);

// Claude's native API is not OpenAI-compatible. This adapter assumes an
// OpenAI-compatible proxy/bridge (e.g., OpenRouter or a self-hosted converter).
// Configure EXPO_PUBLIC_CLAUDE_BASE_URL to point at that proxy.
const baseURL =
  Platform.OS === 'web'
    ? '/claude-api'
    : process.env.EXPO_PUBLIC_CLAUDE_BASE_URL || '';

const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export function createClaudeProvider() {
  const provider = createOpenAI({
    baseURL,
    apiKey,
    name: 'claude',
  });

  return {
    name: 'claude' as const,
    chat: (modelId: string): LanguageModel => provider.chat(modelId),
  };
}
