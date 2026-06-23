import { generateText } from 'ai';
import { createChatModel, DEFAULT_MODEL } from './engine';
import type { Note } from '@/lib/store/notes';

function parseJson<T>(text: string): T | null {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const cleaned = (match ? match[1] : text).trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

function noteContext(note: Note): string {
  return `标题：${note.title}\n内容：${note.plainText || note.content}`;
}

export async function summarizeNote(
  note: Note,
  modelId: string = DEFAULT_MODEL
): Promise<string> {
  const { text } = await generateText({
    model: createChatModel(modelId),
    system:
      '你是一位高效的笔记助手。请用一句话总结下面的笔记，只输出总结内容，不要解释。',
    prompt: noteContext(note),
  });
  return text.trim();
}

export async function classifyNote(
  note: Note,
  modelId: string = DEFAULT_MODEL
): Promise<'personal' | 'work' | 'idea'> {
  const { text } = await generateText({
    model: createChatModel(modelId),
    system:
      '请判断这篇笔记最可能属于哪个分类，只输出 JSON：{"category": "personal|work|idea"}。不要输出其他内容。',
    prompt: noteContext(note),
  });
  const parsed = parseJson<{ category?: string }>(text);
  const category = parsed?.category ?? '';
  if (category === 'personal' || category === 'work' || category === 'idea') {
    return category;
  }
  return 'personal';
}

export async function extractTags(
  note: Note,
  modelId: string = DEFAULT_MODEL
): Promise<string[]> {
  const { text } = await generateText({
    model: createChatModel(modelId),
    system:
      '请从这篇笔记中提取 3-5 个关键词标签，只输出 JSON：{"tags": ["tag1", "tag2"]}。不要输出其他内容。',
    prompt: noteContext(note),
  });
  const parsed = parseJson<{ tags?: string[] }>(text);
  return (parsed?.tags ?? []).map((t) => t.trim()).filter(Boolean);
}

export type ExtractedTodo = {
  title: string;
  due_date?: string;
};

export async function extractTodos(
  note: Note,
  modelId: string = DEFAULT_MODEL
): Promise<ExtractedTodo[]> {
  const { text } = await generateText({
    model: createChatModel(modelId),
    system:
      '请从这篇笔记中提取所有待办事项，只输出 JSON：{"todos": [{"title": "...", "due_date": "YYYY-MM-DD"}]}。due_date 可选。不要输出其他内容。',
    prompt: noteContext(note),
  });
  const parsed = parseJson<{ todos?: ExtractedTodo[] }>(text);
  return (parsed?.todos ?? []).filter((t) => t.title?.trim());
}

export type ParsedEvent = {
  title: string;
  start_time: string;
  end_time: string;
};

export async function parseEventFromText(
  text: string,
  modelId: string = DEFAULT_MODEL
): Promise<ParsedEvent | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { text: result } = await generateText({
    model: createChatModel(modelId),
    system:
      `今天是 ${today}。请将用户的自然语言转换为日历事件 JSON：` +
      '{"title": "会议", "start_time": "ISO-8601", "end_time": "ISO-8601"}。' +
      '如果无法解析，输出 {"event": null}。不要输出其他内容。',
    prompt: text,
  });
  const parsed = parseJson<{ event?: ParsedEvent | null }>(result);
  return parsed?.event ?? null;
}
