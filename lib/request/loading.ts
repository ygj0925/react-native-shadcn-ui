import type { LoadingHandler } from './types';

let loadingCount = 0;
let handler: LoadingHandler = { show: () => {}, hide: () => {} };

export function setupLoading(h: LoadingHandler): void {
  handler = h;
}

export function showLoading(): void {
  if (loadingCount === 0) {
    handler.show();
  }
  loadingCount++;
}

export function hideLoading(): void {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    handler.hide();
  }
}
