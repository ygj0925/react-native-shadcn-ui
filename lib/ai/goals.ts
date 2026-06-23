import { generateText } from 'ai';
import { createChatModel, DEFAULT_MODEL } from './engine';

function parseJson<T>(text: string): T | null {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const cleaned = (match ? match[1] : text).trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

export type BreakdownResult = {
  title: string;
  description?: string;
}[];

export async function breakdownGoal(
  title: string,
  description?: string,
  modelId: string = DEFAULT_MODEL
): Promise<BreakdownResult> {
  const context = [
    `目标：${title}`,
    description ? `描述：${description}` : '',
    '',
    '请将这个目标拆解为 3-6 个可执行的关键结果或子目标。',
    '只输出 JSON：{"key_results": [{"title": "...", "description": "..."}]}',
    '不要输出其他内容。',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const { text } = await generateText({
      model: createChatModel(modelId),
      system:
        '你是一位目标管理专家。帮助用户把大目标拆解成具体、可衡量、可执行的关键结果。只输出 JSON。',
      prompt: context,
    });

    const parsed = parseJson<{ key_results?: Array<{ title?: string; description?: string }> }>(text);
    return (parsed?.key_results ?? [])
      .filter((item) => item.title?.trim())
      .map((item) => ({
        title: item.title!.trim(),
        description: item.description?.trim(),
      }));
  } catch {
    return [];
  }
}
