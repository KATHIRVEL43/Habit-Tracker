import React from 'react';
import { Habit, MonthViewData } from '../types';
import { Check, Edit2, Trash2, Calendar } from 'lucide-react';

interface DailyHabitsTableProps {
  data: MonthViewData;
  habits: Habit[];
  onToggleDay: (habitId: string, dateStr: string, completed: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onAddHabit: () => void;
}

export const DailyHabitsTable: React.FC<DailyHabitsTableProps> = ({
  data,
  habits,
  onToggleDay,
  onEditHabit,
  onDeleteHabit,
}) => {
  const { month, days_in_month, logs, server_today } = data;
  const days = Array.from({ length: days_in_month }, (_, i) => i + 1);

  // Check if selected month is current month, and identify today's day number
  const isCurrentMonth = server_today && server_today.startsWith(month);
  const todayDayNum = isCurrentMonth ? parseInt(server_today.split('-')[2], 10) : -1;

  // Calculate total counts for each day
  const dailySums: Record<number, number> = {};
  let maxDailyCount = 0;
  let peakDay = -1;

  days.forEach((dayNum) => {
    const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
    let dayCount = 0;
    habits.forEach((h) => {
      if (logs[h.id]?.[dateStr]) {
        dayCount++;
      }
    });
    dailySums[dayNum] = dayCount;
    if (dayCount > maxDailyCount) {
      maxDailyCount = dayCount;
      peakDay = dayNum;
    }
  });

  return (
    <div className="w-full max-w-[1780px] mx-auto px-2 sm:px-4 lg:px-6 mb-6 select-none">
      {/* Mobile scroll hint for Realme P1 and phones */}
      <div className="flex sm:hidden items-center justify-between text-[11px] text-plum-700 font-medium px-1 mb-1.5 opacity-90">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-plum-600" />
          <span>Today is Day {todayDayNum > 0 ? todayDayNum : 'N/A'} (Highlighted)</span>
        </span>
        <span className="text-[10px] text-plum-500 font-mono">← Swipe table →</span>
      </div>

      <div className="bg-white border border-[#F1DEE7] rounded-lg shadow-sm overflow-hidden">
        {/* Table scroll container with smooth touch scrolling */}
        <div className="overflow-x-auto scroll-smooth custom-scrollbar">
          <table className="w-full border-collapse text-xs">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-[#F1DEE7] text-[#8D2D5B] font-semibold text-[11px] bg-white">
                {/* Sticky Col 1: # */}
                <th className="sticky left-0 z-20 bg-white py-2.5 px-1.5 text-center font-mono w-9 min-w-[36px] border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                  #
                </th>

                {/* Sticky Col 2: Habit Name */}
                <th className="sticky left-9 z-20 bg-white py-2.5 px-3 text-left font-medium w-48 sm:w-60 min-w-[170px] sm:min-w-[210px] border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                  Daily Habits
                </th>

                {/* Day numbers 1..31 with Today Highlight */}
                {days.map((d) => {
                  const isToday = d === todayDayNum;

                  return (
                    <th
                      key={d}
                      className={`py-2 px-0 text-center font-mono text-[11px] transition-colors ${
                        isToday
                          ? 'w-9 min-w-[36px] bg-plum-100/70 border-x-2 border-x-plum-500 text-plum-900 font-bold relative'
                          : 'w-7 sm:w-8 min-w-[28px] sm:min-w-[32px] font-medium text-[#8D2D5B]/80'
                      }`}
                    >
                      {isToday ? (
                        <div className="flex flex-col items-center justify-center">
                          <span className="bg-plum-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-2xs">
                            {d}
                          </span>
                          <span className="text-[8px] uppercase tracking-tighter text-plum-800 font-bold -mt-0.5">
                            Today
                          </span>
                        </div>
                      ) : (
                        <span>{d}</span>
                      )}
                    </th>
                  );
                })}

                {/* Summary columns */}
                <th className="w-12 sm:w-14 py-2.5 px-1 text-center font-mono text-[10px] tracking-wider uppercase border-l border-[#F7EDF2]">
                  TOTAL
                </th>
                <th className="w-32 sm:w-44 min-w-[120px] sm:min-w-[150px] py-2.5 px-3 text-left font-medium text-[10px] tracking-wider uppercase">
                  % COMPLETED
                </th>
                <th className="w-8 py-2.5 px-1 text-center" />
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-[#F9EDF3]">
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={days_in_month + 5} className="text-center py-10 text-gray-400 italic">
                    No daily habits added yet. Click "+ Add Habit" above to create one.
                  </td>
                </tr>
              ) : (
                habits.map((habit, index) => {
                  const habitLogs = logs[habit.id] || {};
                  
                  // Count completed days
                  let completedCount = 0;
                  days.forEach((d) => {
                    const dateStr = `${month}-${String(d).padStart(2, '0')}`;
                    if (habitLogs[dateStr]) completedCount++;
                  });

                  const pct = Math.round((completedCount / days_in_month) * 100);

                  return (
                    <tr
                      key={habit.id}
                      className="hover:bg-[#FAF4F7]/60 group transition-colors"
                    >
                      {/* Sticky Col 1: Row Index # */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-[#FAF4F7] py-2.5 px-1.5 text-center font-mono text-[#8D2D5B]/70 font-semibold text-[11px] border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                        {index + 1}
                      </td>

                      {/* Sticky Col 2: Habit Name */}
                      <td className="sticky left-9 z-10 bg-white group-hover:bg-[#FAF4F7] py-2.5 px-3 text-[#4A3540] font-medium text-[12px] truncate max-w-[180px] sm:max-w-[240px] border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]" title={habit.name}>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm select-none">{habit.emoji || '🌸'}</span>
                          <span className="truncate">{habit.name}</span>
                        </div>
                      </td>

                      {/* Day Checkboxes 1..31 with Today Highlight */}
                      {days.map((d) => {
                        const dateStr = `${month}-${String(d).padStart(2, '0')}`;
                        const isChecked = Boolean(habitLogs[dateStr]);
                        const isToday = d === todayDayNum;

                        return (
                          <td
                            key={d}
                            className={`py-1 px-0 text-center align-middle transition-colors ${
                              isToday
                                ? 'bg-plum-50/70 border-x-2 border-x-plum-400'
                                : ''
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onToggleDay(habit.id, dateStr, !isChecked)}
                              className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mx-auto rounded-[2px] transition-all flex items-center justify-center cursor-pointer focus:outline-none ${
                                isToday
                                  ? 'ring-2 ring-plum-600 ring-offset-1 shadow-xs scale-105'
                                  : 'hover:scale-105 active:scale-95'
                              }`}
                              style={{
                                border: isChecked 
                                  ? '1.5px solid #F3A8C7' 
                                  : isToday 
                                  ? '2px solid #8D2D5B' 
                                  : '1.5px solid #F3A8C7',
                                backgroundColor: isChecked 
                                  ? '#F3A8C7' 
                                  : isToday 
                                  ? '#FFF7FB' 
                                  : '#FFFFFF',
                              }}
                              title={`${habit.name} - Day ${d}${isToday ? ' (TODAY)' : ''}: ${isChecked ? 'Completed' : 'Click to check'}`}
                            >
                              {isChecked && (
                                <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* TOTAL count */}
                      <td className="py-2.5 px-1 text-center font-mono font-bold text-plum-900 text-[11px] border-l border-[#F7EDF2]">
                        {completedCount}
                      </td>

                      {/* % COMPLETED horizontal plum bar */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-[#F5E8EE] h-3.5 rounded-[2px] overflow-hidden">
                            <div
                              className="bg-[#8D2D5B] h-full rounded-[2px] transition-all duration-300"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="w-7 text-right font-mono text-[10px] text-plum-900 font-semibold">
                            {pct}%
                          </span>
                        </div>
                      </td>

                      {/* Edit / Delete actions */}
                      <td className="py-2.5 px-1 text-center">
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditHabit(habit)}
                            className="p-1 text-plum-600 hover:text-plum-800 rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteHabit(habit.id)}
                            className="p-1 text-red-500 hover:text-red-700 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Bottom Lavender Summary Row matching Image 1 */}
              <tr className="bg-[#DFD2E6] text-plum-950 font-bold text-[11px]">
                {/* Sticky Col 1 & 2 in footer */}
                <td className="sticky left-0 z-10 bg-[#DFD2E6] py-2 px-1.5 text-center border-r border-[#D3C3DB] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                  #
                </td>
                <td className="sticky left-9 z-10 bg-[#DFD2E6] py-2 px-3 uppercase text-[10px] tracking-wider text-plum-900 border-r border-[#D3C3DB] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                  Daily Total
                </td>

                {/* Daily integer totals with Today Highlight & Peak Highlight */}
                {days.map((d) => {
                  const count = dailySums[d] || 0;
                  const isPeak = d === peakDay && maxDailyCount > 0;
                  const isToday = d === todayDayNum;

                  return (
                    <td
                      key={d}
                      className={`py-1.5 px-0 text-center font-mono text-[11px] transition-colors ${
                        isPeak
                          ? 'bg-[#8D2D5B] text-white font-extrabold shadow-sm'
                          : isToday
                          ? 'bg-plum-300 text-plum-950 font-extrabold border-x-2 border-x-plum-600'
                          : 'text-plum-950'
                      }`}
                      title={`Day ${d}${isToday ? ' (TODAY)' : ''}: ${count} habits completed`}
                    >
                      {count}
                    </td>
                  );
                })}

                {/* Overall total sum */}
                <td className="py-2 px-1 text-center font-mono font-bold bg-[#DFD2E6] text-plum-950 border-l border-[#D3C3DB]">
                  {Object.values(dailySums).reduce((a, b) => a + b, 0)}
                </td>

                <td colSpan={2} className="bg-[#DFD2E6]" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
