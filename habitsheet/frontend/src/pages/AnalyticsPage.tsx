import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { AnalyticsSummary, HeatmapItem, StreakLeaderboardItem } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Flame, Award, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2026);

  const { data: summary, isLoading: isSummaryLoading } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/summary');
      return res.data;
    },
  });

  const { data: heatmapData = [] } = useQuery<HeatmapItem[]>({
    queryKey: ['analytics-heatmap', selectedYear],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/heatmap?year=${selectedYear}`);
      return res.data;
    },
  });

  const { data: leaderboard = [] } = useQuery<StreakLeaderboardItem[]>({
    queryKey: ['analytics-streaks'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/streaks');
      return res.data;
    },
  });

  if (isSummaryLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-xs text-[#5F6368] font-mono animate-pulse">
          Loading spreadsheet analytics...
        </div>
      </div>
    );
  }

  // Color mapping for heatmap levels
  const levelColors = ['#EBEDF0', '#C6E48B', '#7BC96F', '#239A3B', '#196127'];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-20 select-none">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Today Completion */}
        <div className="bg-white rounded border border-[#DADCE0] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#5F6368] text-xs mb-1">
            <span>TODAY COMPLETIONS</span>
            <CheckCircle2 className="w-4 h-4 text-[#0F9D58]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-[#202124]">
              {summary?.today_completed || 0}
            </span>
            <span className="text-xs text-[#5F6368]">/ {summary?.today_scheduled || 0} habits</span>
          </div>
          <div className="text-[11px] text-[#0F9D58] font-medium mt-2">
            {summary?.today_completion_pct || 0}% completed today
          </div>
        </div>

        {/* Month Completion */}
        <div className="bg-white rounded border border-[#DADCE0] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#5F6368] text-xs mb-1">
            <span>MONTH PROGRESS</span>
            <TrendingUp className="w-4 h-4 text-[#0F9D58]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-[#0F9D58]">
              {summary?.month_completion_pct || 0}%
            </span>
          </div>
          <div className="text-[11px] text-[#5F6368] font-medium mt-2">
            {summary?.month_completions || 0} / {summary?.total_goals || 0} target check-ins
          </div>
        </div>

        {/* Best Streak Habit */}
        <div className="bg-white rounded border border-[#DADCE0] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#5F6368] text-xs mb-1">
            <span>TOP CURRENT STREAK</span>
            <Flame className="w-4 h-4 text-[#F2994A]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-[#B06000]">
              {summary?.best_streak_days || 0}d
            </span>
          </div>
          <div className="text-[11px] text-[#5F6368] truncate mt-2 font-medium">
            Habit: <span className="font-semibold text-[#202124]">{summary?.best_streak_habit}</span>
          </div>
        </div>

        {/* Total Active Habits */}
        <div className="bg-white rounded border border-[#DADCE0] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#5F6368] text-xs mb-1">
            <span>TOTAL HABITS</span>
            <Award className="w-4 h-4 text-[#0F9D58]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-[#202124]">
              {summary?.total_habits || 0}
            </span>
            <span className="text-xs text-[#5F6368]">active rows</span>
          </div>
          <div className="text-[11px] text-[#0F9D58] font-medium mt-2">
            Organized in workbook
          </div>
        </div>
      </div>

      {/* Completion Activity Chart (Recharts) */}
      <div className="bg-white rounded border border-[#DADCE0] p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm text-[#202124]">Habit Completion Velocity</h3>
            <p className="text-xs text-[#5F6368]">Daily completed habits across this period</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={heatmapData.slice(-30)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sheetGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F9D58" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0F9D58" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EAED" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: '#5F6368' }}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis tick={{ fontSize: 10, fill: '#5F6368' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#DADCE0', 
                  borderRadius: '4px',
                  fontSize: '12px' 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#0F9D58" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#sheetGreen)" 
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streaks Leaderboard */}
      <div className="bg-white rounded border border-[#DADCE0] shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#DADCE0] bg-[#F8F9FA]">
          <h3 className="font-semibold text-sm text-[#202124]">Habit Streak Leaderboard</h3>
          <p className="text-xs text-[#5F6368]">Consecutive active days without missing</p>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-[#F8F9FA] text-[#5F6368] font-medium border-b border-[#DADCE0]">
            <tr>
              <th className="px-4 py-2 font-semibold">HABIT</th>
              <th className="px-4 py-2 font-semibold text-center">CURRENT STREAK</th>
              <th className="px-4 py-2 font-semibold text-center">BEST RECORD</th>
              <th className="px-4 py-2 font-semibold text-center">ALL-TIME CHECKS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EAED]">
            {leaderboard.map((item) => (
              <tr key={item.id} className="hover:bg-[#F8F9FA]">
                <td className="px-4 py-2.5 font-medium text-[#202124] flex items-center space-x-2">
                  <span className="text-base">{item.emoji}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </td>
                <td className="px-4 py-2.5 text-center font-mono">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#FEF7E0] text-[#B06000] font-bold">
                    <span>🔥</span>
                    <span>{item.current_streak} days</span>
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center font-mono text-[#0B7A43] font-bold">
                  ⭐ {item.best_streak} days
                </td>
                <td className="px-4 py-2.5 text-center font-mono text-[#5F6368]">
                  {item.total_completed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
