import React from 'react';
import { Lock, Check } from 'lucide-react';

interface DayCellProps {
  habitId: string;
  dateStr: string;
  dayNumber: number;
  weekdayIndex: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isScheduled: boolean;
  checked: boolean;
  habitColor: string;
  onToggle: (habitId: string, completed: boolean) => void;
}

export const DayCell: React.FC<DayCellProps> = ({
  habitId,
  dateStr,
  dayNumber,
  weekdayIndex,
  isToday,
  isPast,
  isFuture,
  isScheduled,
  checked,
  habitColor,
  onToggle,
}) => {
  // Case 1: Habit is not scheduled on this day of week (off day)
  if (!isScheduled) {
    return (
      <td 
        className="w-8 min-w-[32px] h-8 text-center border-r border-b border-[#DADCE0] bg-[#F8F9FA] text-[#BDC1C6] text-xs font-mono select-none"
        title={`Rest day — not scheduled for ${dateStr}`}
      >
        —
      </td>
    );
  }

  // Case 2: Today (Interactive!)
  if (isToday) {
    return (
      <td 
        className="w-8 min-w-[32px] h-8 p-0 text-center border-r border-b border-[#DADCE0] bg-[#E6F4EA]/40 transition hover:bg-[#E6F4EA]/70 relative"
        title={`Today: ${dateStr} (Click to toggle)`}
      >
        <button
          type="button"
          onClick={() => onToggle(habitId, !checked)}
          className="w-full h-full flex items-center justify-center cursor-pointer focus:outline-none group"
        >
          <div 
            className={`w-4 h-4 rounded-xs border transition-all flex items-center justify-center ${
              checked 
                ? 'bg-[#0F9D58] border-[#0B7A43] shadow-2xs' 
                : 'border-[#0F9D58] bg-white group-hover:border-[#0B7A43] group-hover:scale-105'
            }`}
          >
            {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
          </div>
        </button>
        {/* Subtle active indicator dot */}
        <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-[#0F9D58]" />
      </td>
    );
  }

  // Case 3: Past day (Locked Read-Only)
  if (isPast) {
    return (
      <td 
        className="w-8 min-w-[32px] h-8 p-0 text-center border-r border-b border-[#DADCE0] bg-white hover:bg-[#F8F9FA] cursor-not-allowed group relative"
        title={`Locked: ${dateStr} — past records cannot be changed`}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div 
            className={`w-4 h-4 rounded-xs border flex items-center justify-center ${
              checked 
                ? 'bg-[#A8DAB5] border-[#81C995]' 
                : 'border-[#E0E0E0] bg-[#FAFAFA]'
            }`}
          >
            {checked ? (
              <Check className="w-3 h-3 text-white stroke-[2.5]" />
            ) : (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Lock className="w-2.5 h-2.5 text-[#9AA0A6]" />
              </span>
            )}
          </div>
        </div>
      </td>
    );
  }

  // Case 4: Future day (Locked Hatched)
  return (
    <td 
      className="w-8 min-w-[32px] h-8 p-0 text-center border-r border-b border-[#DADCE0] future-hatch cursor-not-allowed select-none"
      title={`Future date: ${dateStr} — locked until today`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-xs border border-dashed border-[#DADCE0] opacity-40" />
      </div>
    </td>
  );
};
