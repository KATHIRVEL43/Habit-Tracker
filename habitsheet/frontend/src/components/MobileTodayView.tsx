import React from 'react';
import { Habit, MonthViewData } from '../types';
import { Check, Flame, Calendar } from 'lucide-react';
import { getDay } from 'date-fns';

interface MobileTodayViewProps {
  data: MonthViewData;
  onToggleLog: (habitId: string, completed: boolean) => void;
}

function getIsoWeekday(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export const MobileTodayView: React.FC<MobileTodayViewProps> = ({
  data,
  onToggleLog,
}) => {
  const { server_today, habits, logs, summaries } = data;
  const todayDateObj = new Date(`${server_today}T00:00:00`);
  const todayIsoDay = getIsoWeekday(getDay(todayDateObj));

  const scheduledToday = habits.filter((h) => h.active_days.includes(todayIsoDay));
  const completedCount = scheduledToday.filter((h) => logs[h.id]?.[server_today]).length;

  return (
    <div className="p-4 space-y-4 md:hidden">
      {/* Header Card */}
      <div className="bg-white rounded-lg border border-[#DADCE0] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 text-xs text-[#5F6368]">
            <Calendar className="w-3.5 h-3.5 text-[#0F9D58]" />
            <span className="font-semibold text-[#202124]">Today: {server_today}</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#0F9D58]">
            {completedCount} / {scheduledToday.length} Done
          </span>
        </div>
        <div className="w-full bg-[#E8EAED] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#0F9D58] h-full rounded-full transition-all duration-300"
            style={{
              width: `${scheduledToday.length > 0 ? (completedCount / scheduledToday.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Habit Cards */}
      <div className="space-y-2">
        {scheduledToday.map((habit) => {
          const isDone = Boolean(logs[habit.id]?.[server_today]);
          const summary = summaries[habit.id];

          return (
            <div
              key={habit.id}
              onClick={() => onToggleLog(habit.id, !isDone)}
              className={`p-3.5 rounded-lg border transition flex items-center justify-between cursor-pointer active:scale-98 ${
                isDone
                  ? 'bg-[#E6F4EA]/50 border-[#81C995]'
                  : 'bg-white border-[#DADCE0] hover:border-[#0F9D58]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{habit.emoji}</span>
                <div>
                  <h4 className="font-medium text-xs text-[#202124]">{habit.name}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-[#5F6368] mt-0.5">
                    <span>Goal: {habit.monthly_goal}d</span>
                    {summary?.current_streak ? (
                      <span className="flex items-center text-[#B06000] font-semibold">
                        <Flame className="w-3 h-3 text-[#F2994A] mr-0.5" />
                        {summary.current_streak}d streak
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Checkbox button */}
              <div
                className={`w-6 h-6 rounded flex items-center justify-center transition border ${
                  isDone
                    ? 'bg-[#0F9D58] border-[#0B7A43]'
                    : 'border-[#DADCE0] bg-white'
                }`}
              >
                {isDone && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
