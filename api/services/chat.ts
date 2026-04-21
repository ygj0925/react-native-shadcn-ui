import { get, post, del } from '@/lib/request';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}

export async function getConversations(params?: {
  page?: number;
  pageSize?: number;
}) {
  const res = await get<{ list: Conversation[]; total: number }>(
    '/chat/conversations',
    params,
  );
  return res.data;
}

export async function getMessages(conversationId: string) {
  const res = await get<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
  );
  return res.data;
}

export async function sendMessage(conversationId: string, content: string) {
  const res = await post<ChatMessage>(
    `/chat/conversations/${conversationId}/messages`,
    { content },
  );
  return res.data;
}

export async function createConversation(title?: string) {
  const res = await post<Conversation>('/chat/conversations', { title });
  return res.data;
}

export async function deleteConversation(conversationId: string) {
  await del(`/chat/conversations/${conversationId}`);
}
