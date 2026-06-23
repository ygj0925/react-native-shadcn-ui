import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { Platform } from 'react-native';

export const MIMO_MODELS = [
  { label: 'MiMo-V2.5-Pro', value: 'mimo-v2.5-pro' },
  { label: 'MiMo-V2.5', value: 'mimo-v2.5' },
  { label: 'MiMo-V2.5-TTS-VoiceClone', value: 'mimo-v2.5-tts-voiceclone' },
  { label: 'MiMo-V2.5-TTS-VoiceDesign', value: 'mimo-v2.5-tts-voicedesign' },
  { label: 'MiMo-V2.5-TTS', value: 'mimo-v2.5-tts' },
  { label: 'MiMo-V2-Pro', value: 'mimo-v2-pro' },
  { label: 'MiMo-V2-Omni', value: 'mimo-v2-omni' },
  { label: 'MiMo-V2-TTS', value: 'mimo-v2-tts' },
] as const;

export type MiMoModelValue = (typeof MIMO_MODELS)[number]['value'];

export const MIMO_MODEL_VALUES = MIMO_MODELS.map((m) => m.value);

const baseURL =
  Platform.OS === 'web'
    ? '/mimo-api'
    : process.env.EXPO_PUBLIC_MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1';

const apiKey =
  process.env.EXPO_PUBLIC_MIMO_API_KEY || '';

const reasoningCache = new Map<string, string>();

function captureReasoningFromStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let reasoning = '';
  const toolCallIds: string[] = [];
  let buffer = '';

  (async () => {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop()!;

        for (const line of lines) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
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
        msg.role === 'assistant' &&
        msg.tool_calls?.length > 0 &&
        !('reasoning_content' in msg)
      ) {
        for (const tc of msg.tool_calls) {
          const cached = reasoningCache.get(tc.id);
          if (cached !== undefined) {
            msg.reasoning_content = cached;
            reasoningCache.delete(tc.id);
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

const mimoFetch: typeof fetch = async (input, init) => {
  const headers = new Headers(init?.headers);
  headers.delete('authorization');
  headers.set('api-key', apiKey);

  let body = init?.body;
  if (body && typeof body === 'string') {
    body = injectReasoningContent(body);
  }

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(input, { ...init, headers, body });

      if (!res.ok && res.status >= 500 && attempt < MAX_RETRIES) {
        res.body?.cancel();
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }

      if (
        res.ok &&
        res.body &&
        res.headers.get('content-type')?.includes('text/event-stream')
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

  throw lastError ?? new Error('Request failed after retries');
};

export function createMimoProvider() {
  const provider = createOpenAI({
    baseURL,
    apiKey,
    name: 'mimo',
    fetch: mimoFetch,
  });

  return {
    name: 'mimo' as const,
    chat: (modelId: string): LanguageModel => provider.chat(modelId),
  };
}
