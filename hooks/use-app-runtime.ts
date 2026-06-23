import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  type FeedbackAdapter,
} from '@assistant-ui/react-native';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import {
  DirectChatTransport,
  ToolLoopAgent,
  tool,
  jsonSchema,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { useMemo, useRef } from 'react';
import { createChatModel, AI_MODELS, DEFAULT_MODEL } from '@/lib/ai/engine';
import { dataTools } from '@/lib/ai/tools';
import { buildUserContext } from '@/lib/ai/context';

export { AI_MODELS, DEFAULT_MODEL };

const interactiveTools = {
  show_select: tool({
    description:
      '展示一个下拉选择框让用户从多个选项中选择一个。当需要用户做单选决策时使用此工具。',
    inputSchema: jsonSchema({
      type: 'object',
      properties: {
        title: { type: 'string', description: '选择框的标题' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: '显示给用户的选项文本' },
              value: { type: 'string', description: '选项的值' },
            },
            required: ['label', 'value'],
          },
          description: '可供选择的选项列表',
        },
      },
      required: ['title', 'options'],
    }),
    outputSchema: jsonSchema({
      type: 'object',
      properties: {
        value: { type: 'string', description: '用户选择的值' },
        label: { type: 'string', description: '用户选择的标签' },
      },
      required: ['value'],
    }),
  }),
  show_confirm: tool({
    description:
      '展示一个确认对话框让用户确认或取消操作。当需要用户做是/否决策时使用此工具。',
    inputSchema: jsonSchema({
      type: 'object',
      properties: {
        title: { type: 'string', description: '确认框的标题' },
        message: { type: 'string', description: '确认框的详细描述信息' },
      },
      required: ['title', 'message'],
    }),
    outputSchema: jsonSchema({
      type: 'object',
      properties: {
        confirmed: { type: 'boolean', description: '用户是否确认' },
      },
      required: ['confirmed'],
    }),
  }),
  show_multi_select: tool({
    description:
      '展示一个多选列表让用户选择多个选项。当需要用户从列表中勾选多项时使用此工具。',
    inputSchema: jsonSchema({
      type: 'object',
      properties: {
        title: { type: 'string', description: '多选框的标题' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: '显示给用户的选项文本' },
              value: { type: 'string', description: '选项的值' },
            },
            required: ['label', 'value'],
          },
          description: '可供选择的选项列表',
        },
      },
      required: ['title', 'options'],
    }),
    outputSchema: jsonSchema({
      type: 'object',
      properties: {
        values: {
          type: 'array',
          items: { type: 'string' },
          description: '用户选择的值列表',
        },
      },
      required: ['values'],
    }),
  }),
};

const SYSTEM_PROMPT = `你是 MindFlow AI，用户的个人效率助手。
你可以访问并操作用户的本地任务、笔记、日程和习惯数据。
优先使用工具完成用户的请求，并在完成后给出简洁的确认。
如果没有合适的数据工具，直接回答用户问题。`;

export function useAppRuntime(modelId: string = DEFAULT_MODEL) {
  const modelIdRef = useRef(modelId);
  modelIdRef.current = modelId;

  const { transport, adapters } = useMemo(() => {
    const agent = new ToolLoopAgent({
      model: createChatModel(modelIdRef.current),
      tools: { ...interactiveTools, ...dataTools },
      prepareCall: (args) => {
        const context = buildUserContext();
        const messages = [
          { role: 'system' as const, content: `${SYSTEM_PROMPT}\n\n当前上下文:\n${context}` },
          ...(args.messages?.filter((m: any) => m.role !== 'system') ?? []),
        ];
        return {
          ...args,
          model: createChatModel(modelIdRef.current),
          messages,
        };
      },
    });

    return {
      transport: new DirectChatTransport({ agent }),
      adapters: {
        attachments: new CompositeAttachmentAdapter([
          new SimpleImageAttachmentAdapter(),
          new SimpleTextAttachmentAdapter(),
        ]),
        feedback: feedbackAdapter,
      },
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return useChatRuntime({
    transport,
    adapters,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
}

const feedbackAdapter: FeedbackAdapter = {
  submit: ({ message, type }) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[assistant-ui feedback]', type, message.id);
    }
  },
};
