import React from 'react';
import { Habit, MonthViewData } from '../types';
import { Check, Edit2, Trash2 } from 'lucide-react';

interface WeeklyMonthlyTablesProps {
  data: MonthViewData;
  weeklyHabits: Habit[];
  monthlyHabits: Habit[];
  onToggleWeek: (habitId: string, weekStr: string, completed: boolean) => void;
  onToggleMonthDone: (habitId: string, monthDoneStr: string, completed: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const WeeklyMonthlyTables: React.FC<WeeklyMonthlyTablesProps> = ({
  data,
  weeklyHabits,
  monthlyHabits,
  onToggleWeek,
  onToggleMonthDone,
  onEditHabit,
  onDeleteHabit,
}) => {
  const { month, logs } = data;
  const weeks = [1, 2, 3, 4, 5];

  return (
    <div className="w-full max-w-[1780px] mx-auto px-2 sm:px-4 lg:px-6 mb-12 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Weekly Habits (7 cols on desktop, full width on mobile) */}
        <div className="lg:col-span-7 bg-white border border-[#F1DEE7] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto scroll-smooth custom-scrollbar">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F1DEE7] text-[#8D2D5B] font-semibold text-[11px] bg-white">
                  <th className="sticky left-0 z-20 bg-white w-9 min-w-[36px] py-2.5 px-1.5 text-center font-mono border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                    #
                  </th>
                  <th className="sticky left-9 z-20 bg-white py-2.5 px-3 text-left font-medium w-48 sm:w-60 min-w-[170px] sm:min-w-[210px] border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                    Weekly Habits
                  </th>
                  {weeks.map((w) => (
                    <th key={w} className="w-14 min-w-[48px] py-2.5 px-1 text-center font-mono font-medium text-[11px]">
                      Week {w}
                    </th>
                  ))}
                  <th className="w-8 py-2.5 px-1 text-center" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9EDF3]">
                {weeklyHabits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-400 italic">
                      No weekly habits added yet.
                    </td>
                  </tr>
                ) : (
                  weeklyHabits.map((habit, idx) => {
                    const habitLogs = logs[habit.id] || {};

                    return (
                      <tr key={habit.id} className="hover:bg-[#FAF4F7]/60 group transition-colors">
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-[#FAF4F7] py-2 px-1.5 text-center font-mono text-[#8D2D5B]/70 font-semibold text-[11px] border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                          {idx + 1}
                        </td>
                        <td className="sticky left-9 z-10 bg-white group-hover:bg-[#FAF4F7] py-2 px-3 text-[#4A3540] font-medium text-[12px] truncate max-w-[180px] sm:max-w-[240px] border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]" title={habit.name}>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm select-none">{habit.emoji || '✨'}</span>
                            <span className="truncate">{habit.name}</span>
                          </div>
                        </td>

                        {weeks.map((w) => {
                          const weekStr = `${month}-W${w}`;
                          const isChecked = Boolean(habitLogs[weekStr]);

                          return (
                            <td key={w} className="py-1 px-1 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => onToggleWeek(habit.id, weekStr, !isChecked)}
                                className="w-5 h-5 mx-auto rounded-[2px] transition-all flex items-center justify-center cursor-pointer focus:outline-none hover:scale-105 active:scale-95"
                                style={{
                                  border: isChecked ? '1.5px solid #F3A8C7' : '1.5px solid #F3A8C7',
                                  backgroundColor: isChecked ? '#F3A8C7' : '#FFFFFF',
                                }}
                                title={`${habit.name} - Week ${w}`}
                              >
                                {isChecked && (
                                  <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                                )}
                              </button>
                            </td>
                          );
                        })}

                        <td className="py-2 px-1 text-center">
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Monthly Habits (5 cols on desktop, full width on mobile) */}
        <div className="lg:col-span-5 bg-white border border-[#F1DEE7] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto scroll-smooth custom-scrollbar">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F1DEE7] text-[#8D2D5B] font-semibold text-[11px] bg-white">
                  <th className="sticky left-0 z-20 bg-white w-9 min-w-[36px] py-2.5 px-1.5 text-center font-mono border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                    #
                  </th>
                  <th className="py-2.5 px-3 text-left font-medium min-w-[160px]">
                    Monthly Habits
                  </th>
                  <th className="w-20 py-2.5 px-1 text-center font-mono font-medium text-[11px]">
                    Done
                  </th>
                  <th className="w-8 py-2.5 px-1 text-center" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9EDF3]">
                {monthlyHabits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400 italic">
                      No monthly habits added yet.
                    </td>
                  </tr>
                ) : (
                  monthlyHabits.map((habit, idx) => {
                    const habitLogs = logs[habit.id] || {};
                    const monthDoneStr = `${month}-M`;
                    const isChecked = Boolean(habitLogs[monthDoneStr]);

                    return (
                      <tr key={habit.id} className="hover:bg-[#FAF4F7]/60 group transition-colors">
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-[#FAF4F7] py-2 px-1.5 text-center font-mono text-[#8D2D5B]/70 font-semibold text-[11px] border-r border-[#F7EDF2] shadow-[2px_0_3px_-2px_rgba(141,45,91,0.06)]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 text-[#4A3540] font-medium text-[12px] truncate max-w-[200px]" title={habit.name}>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm select-none">{habit.emoji || '🎯'}</span>
                            <span className="truncate">{habit.name}</span>
                          </div>
                        </td>

                        <td className="py-1 px-1 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => onToggleMonthDone(habit.id, monthDoneStr, !isChecked)}
                            className="w-5 h-5 mx-auto rounded-[2px] transition-all flex items-center justify-center cursor-pointer focus:outline-none hover:scale-105 active:scale-95"
                            style={{
                              border: isChecked ? '1.5px solid #F3A8C7' : '1.5px solid #F3A8C7',
                              backgroundColor: isChecked ? '#F3A8C7' : '#FFFFFF',
                            }}
                            title={`${habit.name} - Monthly Done`}
                          >
                            {isChecked && (
                              <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                            )}
                          </button>
                        </td>

                        <td className="py-2 px-1 text-center">
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
