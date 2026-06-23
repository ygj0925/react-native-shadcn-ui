import { supabase } from '@/lib/supabase';
import type { AIConversation, AIMessage } from '@/lib/supabase';

export async function createConversation(
  userId: string,
  title = '新对话',
  model = 'mimo-v2.5-pro',
  contextType: AIConversation['context_type'] = 'general',
  contextId: string | null = null
): Promise<AIConversation | null> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({
      user_id: userId,
      title,
      model,
      context_type: contextType,
      context_id: contextId,
    })
    .select()
    .single();

  if (error) {
    if (__DEV__) console.warn('[ai persistence] create conversation failed', error.message);
    return null;
  }
  return data;
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from('ai_conversations')
    .update({ title })
    .eq('id', id);

  if (error && __DEV__) {
    console.warn('[ai persistence] update title failed', error.message);
  }
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabase.from('ai_conversations').delete().eq('id', id);
  if (error && __DEV__) {
    console.warn('[ai persistence] delete conversation failed', error.message);
  }
}

export async function loadConversations(userId: string): Promise<AIConversation[]> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    if (__DEV__) console.warn('[ai persistence] load conversations failed', error.message);
    return [];
  }
  return data ?? [];
}

export async function loadMessages(conversationId: string): Promise<AIMessage[]> {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    if (__DEV__) console.warn('[ai persistence] load messages failed', error.message);
    return [];
  }
  return data ?? [];
}

export async function saveMessage(
  message: Omit<AIMessage, 'id' | 'created_at'>
): Promise<AIMessage | null> {
  const { data, error } = await supabase
    .from('ai_messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    if (__DEV__) console.warn('[ai persistence] save message failed', error.message);
    return null;
  }
  return data;
}

export async function saveMessages(
  messages: Omit<AIMessage, 'id' | 'created_at'>[]
): Promise<AIMessage[]> {
  if (messages.length === 0) return [];
  const { data, error } = await supabase
    .from('ai_messages')
    .insert(messages)
    .select();

  if (error) {
    if (__DEV__) console.warn('[ai persistence] save messages failed', error.message);
    return [];
  }
  return data ?? [];
}
