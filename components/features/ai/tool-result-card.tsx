import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Check, Loader2, Search, X } from 'lucide-react-native';
import { View } from 'react-native';
import type { ToolCallMessagePartProps } from '@assistant-ui/react-native';

function StatusIcon({ status, success }: { status: string; success?: boolean }) {
  if (status === 'in_progress' || status === 'running') {
    return (
      <View className="h-5 w-5 items-center justify-center rounded-full bg-primary/10">
        <Loader2 size={12} className="text-primary" strokeWidth={2.5} />
      </View>
    );
  }
  if (success === false) {
    return (
      <View className="h-5 w-5 items-center justify-center rounded-full bg-destructive/10">
        <X size={12} className="text-destructive" strokeWidth={2.5} />
      </View>
    );
  }
  return (
    <View className="h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
      <Check size={12} className="text-emerald-500" strokeWidth={2.5} />
    </View>
  );
}

function formatResult(toolName: string, result?: Record<string, any>): string {
  if (!result) return '';

  switch (toolName) {
    case 'create_task':
      return `已创建任务：${result.title ?? ''}`;
    case 'create_note':
      return `已创建笔记：${result.title ?? ''}`;
    case 'create_calendar_event':
      return `已创建日程：${result.title ?? ''}`;
    case 'log_habit':
      return result.message ?? '习惯打卡已记录';
    case 'search_notes':
      return `找到 ${(result.notes ?? []).length} 条笔记`;
    case 'get_schedule':
      return `${result.date ?? '今天'}：${(result.events ?? []).length} 个事件 · ${(result.tasks ?? []).length} 个任务`;
    case 'get_habit_stats':
      return `连续 ${result.current_streak ?? 0} 天 · 完成率 ${result.completion_rate ?? 0}% · 共 ${result.total_logs ?? 0} 条记录`;
    case 'generate_report':
      return result.summary ?? '';
    case 'create_event_from_text':
      return result.success ? `已创建日程：${result.title}` : result.message ?? '解析失败';
    default:
      return JSON.stringify(result);
  }
}

function toolLabel(toolName: string): string {
  const map: Record<string, string> = {
    create_task: '创建任务',
    create_note: '创建笔记',
    create_calendar_event: '创建日程',
    log_habit: '习惯打卡',
    search_notes: '搜索笔记',
    get_schedule: '查询日程',
    get_habit_stats: '习惯统计',
    generate_report: '生成报告',
    create_event_from_text: '创建日程',
  };
  return map[toolName] ?? toolName;
}

export function ToolResultCard(props: ToolCallMessagePartProps) {
  const { toolName, args, status, result } = props;
  const statusType = status?.type ?? 'complete';
  const isRunning = statusType === 'running' || statusType === 'requires-action';
  const resultObj = result as Record<string, any> | undefined;
  const success = resultObj?.success !== false;
  const label = toolLabel(toolName);
  const resultText = formatResult(toolName, resultObj);

  return (
    <View
      className={cn(
        'my-1.5 rounded-xl border bg-card p-3 shadow-sm',
        isRunning ? 'border-primary/30' : success ? 'border-border' : 'border-destructive/30'
      )}>
      <View className="flex-row items-center gap-2.5">
        <StatusIcon status={statusType} success={success} />
        <Text className="flex-1 text-[13px] font-semibold text-foreground" numberOfLines={1}>
          {label}
        </Text>
        {isRunning && (
          <Text className="text-[11px] text-primary">执行中…</Text>
        )}
      </View>

      {resultText ? (
        <Text className="mt-2 text-xs leading-5 text-muted-foreground" numberOfLines={3}>
          {resultText}
        </Text>
      ) : (
        <Text className="mt-2 text-xs leading-5 text-muted-foreground" numberOfLines={2}>
          {JSON.stringify(args)}
        </Text>
      )}
    </View>
  );
}
