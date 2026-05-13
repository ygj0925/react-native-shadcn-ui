// @ts-nocheck
import { MessageRepository } from '@assistant-ui/core/dist/runtime/internal.js';

const original = MessageRepository.prototype.addOrUpdateMessage;

MessageRepository.prototype.addOrUpdateMessage = function (
  parentId: string | null,
  message: { id: string },
) {
  try {
    return original.call(this, parentId, message);
  } catch (e: any) {
    if (
      typeof e?.message === 'string' &&
      e.message.includes('MessageRepository')
    ) {
      if (!this.messages.has(message.id)) {
        return;
      }

      const existingItem = this.messages.get(message.id);
      if (existingItem) {
        existingItem.current = message;
        this._messages?.dirty?.();
      }

      if (__DEV__) {
        console.warn(
          '[patch-assistant-ui] Suppressed MessageRepository error:',
          e.message,
        );
      }
      return;
    }
    throw e;
  }
};
