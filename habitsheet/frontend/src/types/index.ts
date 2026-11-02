export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  theme: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  monthly_goal: number;
  color: string;
  emoji: string;
  active_days: number[]; // 0=Mon, 1=Tue, ..., 6=Sun
  order: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitMonthSummary {
  habit_id: string;
  completed_count: number;
  goal: number;
  completion_rate: number;
  current_streak: number;
  best_streak: number;
}

export interface MonthViewData {
  month: string;
  server_today: string;
  days_in_month: number;
  habits: Habit[];
  logs: Record<string, Record<string, boolean>>; // habit_id -> { "YYYY-MM-DD": boolean }
  summaries: Record<string, HabitMonthSummary>;
  overall_progress: number;
}

export interface AnalyticsSummary {
  total_habits: number;
  today_scheduled: number;
  today_completed: number;
  today_completion_pct: number;
  month_completions: number;
  total_goals: number;
  month_completion_pct: number;
  best_streak_habit: string;
  best_streak_days: number;
}

export interface HeatmapItem {
  date: string;
  count: number;
  total_habits: number;
  level: number;
}

export interface StreakLeaderboardItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  current_streak: number;
  best_streak: number;
  total_completed: number;
}
