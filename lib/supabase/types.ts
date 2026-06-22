export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SubscriptionTier = 'free' | 'pro' | 'team';
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type GoalType = 'okr' | 'milestone' | 'custom';
export type GoalStatus = 'not_started' | 'in_progress' | 'achieved' | 'abandoned';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type AIContextType = 'general' | 'note' | 'task' | 'calendar' | 'habit' | 'goal';
export type AIRole = 'user' | 'assistant' | 'system' | 'tool';
export type InsightType = 'weekly_report' | 'monthly_report' | 'efficiency' | 'habit_correlation';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          subscription_tier: SubscriptionTier;
          ai_credits_remaining: number;
          ai_credits_reset_at: string;
          timezone: string;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          ai_credits_remaining?: number;
          ai_credits_reset_at?: string;
          timezone?: string;
          language?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          ai_credits_remaining?: number;
          ai_credits_reset_at?: string;
          timezone?: string;
          language?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: Json;
          plain_text: string;
          category: string;
          tags: string[];
          is_pinned: boolean;
          is_archived: boolean;
          ai_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          content?: Json;
          plain_text?: string;
          category?: string;
          tags?: string[];
          is_pinned?: boolean;
          is_archived?: boolean;
          ai_summary?: string | null;
        };
        Update: {
          title?: string;
          content?: Json;
          plain_text?: string;
          category?: string;
          tags?: string[];
          is_pinned?: boolean;
          is_archived?: boolean;
          ai_summary?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          due_time: string | null;
          calendar_event_id: string | null;
          note_id: string | null;
          goal_id: string | null;
          recurrence: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          due_time?: string | null;
          calendar_event_id?: string | null;
          note_id?: string | null;
          goal_id?: string | null;
          recurrence?: string;
          completed_at?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          due_time?: string | null;
          calendar_event_id?: string | null;
          note_id?: string | null;
          goal_id?: string | null;
          recurrence?: string;
          completed_at?: string | null;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          location: string;
          start_time: string;
          end_time: string;
          is_all_day: boolean;
          recurrence: Json;
          reminder_minutes: number;
          color: string;
          external_calendar_id: string | null;
          task_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          location?: string;
          start_time: string;
          end_time: string;
          is_all_day?: boolean;
          recurrence?: Json;
          reminder_minutes?: number;
          color?: string;
          external_calendar_id?: string | null;
          task_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          location?: string;
          start_time?: string;
          end_time?: string;
          is_all_day?: boolean;
          recurrence?: Json;
          reminder_minutes?: number;
          color?: string;
          external_calendar_id?: string | null;
          task_id?: string | null;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          frequency: HabitFrequency;
          frequency_days: number[];
          target_value: number;
          unit: string;
          reminder_time: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          color?: string;
          frequency?: HabitFrequency;
          frequency_days?: number[];
          target_value?: number;
          unit?: string;
          reminder_time?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          icon?: string;
          color?: string;
          frequency?: HabitFrequency;
          frequency_days?: number[];
          target_value?: number;
          unit?: string;
          reminder_time?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          value: number;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date?: string;
          value?: number;
          note?: string;
        };
        Update: {
          value?: number;
          note?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          parent_id: string | null;
          type: GoalType;
          status: GoalStatus;
          target_date: string | null;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          parent_id?: string | null;
          type?: GoalType;
          status?: GoalStatus;
          target_date?: string | null;
          progress?: number;
        };
        Update: {
          title?: string;
          description?: string;
          parent_id?: string | null;
          type?: GoalType;
          status?: GoalStatus;
          target_date?: string | null;
          progress?: number;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          model: string;
          context_type: AIContextType;
          context_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          model?: string;
          context_type?: AIContextType;
          context_id?: string | null;
        };
        Update: {
          title?: string;
          model?: string;
          context_type?: AIContextType;
          context_id?: string | null;
        };
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: AIRole;
          content: string;
          tool_calls: Json;
          tool_result: Json;
          tokens_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: AIRole;
          content: string;
          tool_calls?: Json;
          tool_result?: Json;
          tokens_used?: number;
        };
        Update: {
          content?: string;
          tool_calls?: Json;
          tool_result?: Json;
          tokens_used?: number;
        };
      };
      user_insights: {
        Row: {
          id: string;
          user_id: string;
          type: InsightType;
          period_start: string;
          period_end: string;
          data: Json;
          summary: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: InsightType;
          period_start: string;
          period_end: string;
          data?: Json;
          summary?: string;
        };
        Update: {
          data?: Json;
          summary?: string;
        };
      };
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type AIConversation = Database['public']['Tables']['ai_conversations']['Row'];
export type AIMessage = Database['public']['Tables']['ai_messages']['Row'];
export type UserInsight = Database['public']['Tables']['user_insights']['Row'];
