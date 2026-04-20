import { getItem, setItem, removeItem } from '@/lib/storage';
import type { TokenPair } from './types';

const TOKEN_KEY = 'auth_tokens';

export function getTokens(): TokenPair | null {
  return getItem<TokenPair>(TOKEN_KEY);
}

export function setTokens(tokens: TokenPair): void {
  setItem(TOKEN_KEY, tokens);
}

export function clearTokens(): void {
  removeItem(TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return getTokens()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getTokens()?.refreshToken ?? null;
}
