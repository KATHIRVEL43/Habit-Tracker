import React from 'react';
import { Habit, MonthViewData } from '../types';
import { DayCell } from './DayCell';
import { format, getDay } from 'date-fns';
import { Flame, Award, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface SheetGridProps {
  data: MonthViewData;
  onToggleLog: (habitId: string, completed: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// JavaScript getDay(): 0=Sun, 1=Mon, ..., 6=Sat
// Convert to ISO 0=Mon, 6=Sun
function getIsoWeekday(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export const SheetGrid: React.FC<SheetGridProps> = ({
  data,
  onToggleLog,
  onEditHabit,
  onDeleteHabit,
}) => {
  const { month, server_today, days_in_month, habits, logs, summaries } = data;
  const days = Array.from({ length: days_in_month }, (_, i) => i + 1);

  // Calculate daily completion counts across all habits
  const dailyCounts: Record<number, number> = {};
  days.forEach((d) => {
    const dStr = `${month}-${String(d).padStart(2, '0')}`;
    let count = 0;
    habits.forEach((h) => {
      if (logs[h.id]?.[dStr]) count++;
    });
    dailyCounts[d] = count;
  });

  return (
    <div className="w-full overflow-x-auto bg-white border border-[#DADCE0] shadow-sm rounded-xs select-none">
      <table className="w-full border-collapse text-[13px] font-sans">
        {/* Table Header Row 1: Spreadsheet Column Labels / Numbers */}
        <thead>
          <tr className="bg-[#F8F9FA] text-[#5F6368] font-medium border-b border-[#DADCE0]">
            {/* Sticky Col A Header */}
            <th className="sticky left-0 z-20 bg-[#F8F9FA] px-3 py-2 text-left font-semibold border-r border-[#DADCE0] w-[220px] min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <span>HABIT NAME</span>
                <span className="text-[11px] text-[#80868B] font-mono">A</span>
              </div>
            </th>

            {/* Sticky Col B Header */}
            <th className="sticky left-[220px] z-20 bg-[#F8F9FA] px-2 py-2 text-center font-semibold border-r border-[#DADCE0] w-[60px] min-w-[60px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col items-center">
                <span>GOAL</span>
                <span className="text-[10px] text-[#80868B] font-mono">B</span>
              </div>
            </th>

            {/* Days Columns 1..N */}
            {days.map((dayNum) => {
              const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
              const dateObj = new Date(`${dateStr}T00:00:00`);
              const isoDay = getIsoWeekday(getDay(dateObj));
              const isWeekend = isoDay >= 5;
              const isToday = dateStr === server_today;

              return (
                <th
                  key={dayNum}
                  className={`w-8 min-w-[32px] px-0.5 py-1 text-center font-mono border-r border-[#DADCE0] ${
                    isToday
                      ? 'bg-[#E6F4EA] text-[#0F9D58] font-bold border-b-2 border-b-[#0F9D58]'
                      : isWeekend
                      ? 'bg-[#F1F3F4] text-[#80868B]'
                      : 'text-[#5F6368]'
                  }`}
                  title={`${dateStr} (${WEEKDAY_NAMES[isoDay]})`}
                >
                  <div className="text-[11px] font-bold leading-tight">{dayNum}</div>
                  <div className="text-[9px] uppercase tracking-tighter opacity-80">
                    {WEEKDAY_NAMES[isoDay][0]}
                  </div>
                </th>
              );
            })}

            {/* Sticky / Summary Headers on Right */}
            <th className="px-3 py-2 text-center font-semibold border-r border-[#DADCE0] min-w-[70px] bg-[#F8F9FA]">
              DONE
            </th>
            <th className="px-3 py-2 text-center font-semibold border-r border-[#DADCE0] min-w-[90px] bg-[#F8F9FA]">
              PROGRESS
            </th>
            <th className="px-2 py-2 text-center font-semibold border-r border-[#DADCE0] min-w-[65px] bg-[#F8F9FA]" title="Current consecutive streak">
              <div className="flex items-center justify-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-[#F2994A]" />
                <span>STREAK</span>
              </div>
            </th>
            <th className="px-2 py-2 text-center font-semibold border-r border-[#DADCE0] min-w-[65px] bg-[#F8F9FA]" title="Best streak in history">
              <div className="flex items-center justify-center space-x-1">
                <Award className="w-3.5 h-3.5 text-[#0F9D58]" />
                <span>BEST</span>
              </div>
            </th>
            <th className="w-10 min-w-[40px] px-1 py-2 text-center bg-[#F8F9FA]" />
          </tr>
        </thead>

        {/* Table Body: Rows for each Habit */}
        <tbody>
          {habits.map((habit, rIdx) => {
            const summary = summaries[habit.id] || {
              completed_count: 0,
              goal: habit.monthly_goal,
              completion_rate: 0,
              current_streak: 0,
              best_streak: 0,
            };

            const habitLogs = logs[habit.id] || {};

            return (
              <tr 
                key={habit.id} 
                className="hover:bg-[#F8F9FA]/80 group transition-colors"
              >
                {/* Column A: Sticky Habit Name + Emoji + Color Dot */}
                <td className="sticky left-0 z-10 bg-white group-hover:bg-[#F8F9FA] px-3 py-1.5 border-r border-b border-[#DADCE0] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center space-x-2">
                    <span className="text-base select-none">{habit.emoji || '🎯'}</span>
                    <div 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color || '#0F9D58' }}
                    />
                    <span className="font-medium text-[#202124] truncate max-w-[140px]" title={habit.name}>
                      {habit.name}
                    </span>
                  </div>
                </td>

                {/* Column B: Monthly Goal */}
                <td className="sticky left-[220px] z-10 bg-white group-hover:bg-[#F8F9FA] px-2 py-1.5 text-center font-mono text-xs text-[#5F6368] border-r border-b border-[#DADCE0] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                  {habit.monthly_goal}
                </td>

                {/* Days 1..N Cells */}
                {days.map((dayNum) => {
                  const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
                  const dateObj = new Date(`${dateStr}T00:00:00`);
                  const isoDay = getIsoWeekday(getDay(dateObj));
                  const isScheduled = habit.active_days.includes(isoDay);
                  const isToday = dateStr === server_today;
                  const isPast = dateStr < server_today;
                  const isFuture = dateStr > server_today;
                  const isChecked = Boolean(habitLogs[dateStr]);

                  return (
                    <DayCell
                      key={dayNum}
                      habitId={habit.id}
                      dateStr={dateStr}
                      dayNumber={dayNum}
                      weekdayIndex={isoDay}
                      isToday={isToday}
                      isPast={isPast}
                      isFuture={isFuture}
                      isScheduled={isScheduled}
                      checked={isChecked}
                      habitColor={habit.color}
                      onToggle={onToggleLog}
                    />
                  );
                })}

                {/* Summary: Done */}
                <td className="px-2 py-1 text-center font-mono text-xs border-r border-b border-[#DADCE0] text-[#202124]">
                  <span className="font-semibold text-[#0F9D58]">{summary.completed_count}</span>
                  <span className="text-[#80868B]"> / {habit.monthly_goal}</span>
                </td>

                {/* Summary: Progress bar + % */}
                <td className="px-3 py-1 border-r border-b border-[#DADCE0]">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-[#E8EAED] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(summary.completion_rate, 100)}%`,
                          backgroundColor: habit.color || '#0F9D58',
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-[#3C4043] w-9 text-right">
                      {Math.round(summary.completion_rate)}%
                    </span>
                  </div>
                </td>

                {/* Summary: Current Streak */}
                <td className="px-2 py-1 text-center font-mono text-xs border-r border-b border-[#DADCE0]">
                  {summary.current_streak > 0 ? (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#FEF7E0] text-[#B06000] font-semibold text-[11px]">
                      <span>🔥</span>
                      <span>{summary.current_streak}d</span>
                    </span>
                  ) : (
                    <span className="text-[#BDC1C6]">—</span>
                  )}
                </td>

                {/* Summary: Best Streak */}
                <td className="px-2 py-1 text-center font-mono text-xs border-r border-b border-[#DADCE0]">
                  {summary.best_streak > 0 ? (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#E6F4EA] text-[#0B7A43] font-semibold text-[11px]">
                      <span>⭐</span>
                      <span>{summary.best_streak}d</span>
                    </span>
                  ) : (
                    <span className="text-[#BDC1C6]">—</span>
                  )}
                </td>

                {/* Row actions */}
                <td className="px-1 py-1 text-center border-b border-[#DADCE0]">
                  <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1 hover:bg-[#F1F3F4] text-[#5F6368] hover:text-[#0F9D58] rounded"
                      title="Edit habit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-1 hover:bg-[#FCE8E6] text-[#5F6368] hover:text-[#D93025] rounded"
                      title="Archive habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {/* Bottom Summary Row: =SUM(DAILY COMPLETIONS) */}
          <tr className="bg-[#F8F9FA] font-medium border-t-2 border-[#BDC1C6] text-[#3C4043]">
            <td className="sticky left-0 z-10 bg-[#F8F9FA] px-3 py-2 border-r border-b border-[#DADCE0] font-mono text-[11px] font-bold text-[#5F6368] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
              ∑ DAILY COMPLETED
            </td>
            <td className="sticky left-[220px] z-10 bg-[#F8F9FA] px-2 py-2 text-center font-mono text-[11px] text-[#80868B] border-r border-b border-[#DADCE0] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
              —
            </td>

            {/* Per-day completion sum */}
            {days.map((dayNum) => {
              const count = dailyCounts[dayNum] || 0;
              const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === server_today;

              return (
                <td
                  key={dayNum}
                  className={`text-center font-mono text-xs border-r border-b border-[#DADCE0] py-2 ${
                    isToday ? 'bg-[#E6F4EA] font-bold text-[#0F9D58]' : 'text-[#5F6368]'
                  }`}
                >
                  {count > 0 ? count : <span className="text-[#BDC1C6]">0</span>}
                </td>
              );
            })}

            {/* Overall total completions */}
            <td className="px-2 py-2 text-center font-mono text-xs font-bold text-[#0F9D58] border-r border-b border-[#DADCE0]">
              {Object.values(summaries).reduce((acc, s) => acc + s.completed_count, 0)}
            </td>

            {/* Overall average % */}
            <td className="px-2 py-2 text-center font-mono text-xs font-bold text-[#0F9D58] border-r border-b border-[#DADCE0]">
              {data.overall_progress}%
            </td>

            <td colSpan={3} className="border-b border-[#DADCE0]" />
          </tr>

          {/* Bottom Frequency Bar Row */}
          <tr className="bg-[#FFFFFF] border-b border-[#DADCE0]">
            <td className="sticky left-0 z-10 bg-white px-3 py-1.5 border-r border-b border-[#DADCE0] font-mono text-[10px] font-bold text-[#5F6368] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
              📊 FREQUENCY BARS
            </td>
            <td className="sticky left-[220px] z-10 bg-white px-2 py-1.5 text-center font-mono text-[10px] text-[#80868B] border-r border-b border-[#DADCE0] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
              —
            </td>

            {/* Per-day vertical frequency mini bars */}
            {days.map((dayNum) => {
              const count = dailyCounts[dayNum] || 0;
              const maxCount = Math.max(...Object.values(dailyCounts), 1);
              const heightPct = Math.max(Math.round((count / maxCount) * 100), count > 0 ? 18 : 0);
              const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === server_today;

              return (
                <td
                  key={dayNum}
                  className={`h-11 p-1 border-r border-b border-[#DADCE0] align-bottom ${
                    isToday ? 'bg-[#E6F4EA]/40' : ''
                  }`}
                  title={`Day ${dayNum}: ${count} completed`}
                >
                  <div className="w-full h-8 flex items-end justify-center">
                    {count > 0 ? (
                      <div
                        className={`w-3.5 rounded-xs transition-all duration-300 ${
                          isToday ? 'bg-[#0F9D58]' : 'bg-[#8FBF7F] hover:bg-[#78A868]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    ) : (
                      <div className="w-1.5 h-0.5 bg-[#DADCE0] rounded-full mb-0.5 opacity-60" />
                    )}
                  </div>
                </td>
              );
            })}

            <td colSpan={5} className="border-b border-[#DADCE0] bg-[#F8F9FA] px-2 text-[10px] text-[#80868B] font-mono align-middle">
              Daily Distribution
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
