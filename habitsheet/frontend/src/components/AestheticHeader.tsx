import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  LogOut, 
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format, parse, addMonths, subMonths } from 'date-fns';

interface AestheticHeaderProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  onOpenNewHabit: () => void;
  serverToday: string;
}

export const AestheticHeader: React.FC<AestheticHeaderProps> = ({
  currentMonth,
  onMonthChange,
  onOpenNewHabit,
  serverToday,
}) => {
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dateObj = parse(currentMonth, 'yyyy-MM', new Date());
  const monthDisplay = format(dateObj, 'MMMM yyyy');

  const handlePrevMonth = () => {
    const prev = subMonths(dateObj, 1);
    onMonthChange(format(prev, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const next = addMonths(dateObj, 1);
    onMonthChange(format(next, 'yyyy-MM'));
  };

  const handleGoToday = () => {
    onMonthChange(serverToday.substring(0, 7));
  };

  return (
    <header className="w-full max-w-[1780px] mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4 pb-3 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
      {/* Cursive Handwriting Title matching reference Image 1 */}
      <div className="flex items-center space-x-3">
        <h1 className="font-cursive text-4xl sm:text-5xl font-bold text-plum-700 tracking-wide drop-shadow-2xs">
          Habit Tracker
        </h1>
      </div>

      {/* Controls & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Month Picker with arrow buttons */}
        <div className="flex items-center space-x-1 bg-white border border-[#F1DEE7] rounded-md px-2 py-1 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-plum-50 rounded text-plum-700 transition"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-1.5 px-2 text-xs font-semibold text-plum-900 min-w-[120px] justify-center">
            <CalendarIcon className="w-3.5 h-3.5 text-plum-600" />
            <span>{monthDisplay}</span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-plum-50 rounded text-plum-700 transition"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGoToday}
            className="ml-1.5 px-2 py-0.5 bg-plum-50 hover:bg-plum-100 text-[11px] font-medium text-plum-700 rounded transition"
          >
            Today
          </button>
        </div>

        {/* Add Habit Button */}
        <button
          onClick={onOpenNewHabit}
          className="flex items-center space-x-1 px-3.5 py-1.5 bg-plum-700 hover:bg-plum-800 text-white text-xs font-semibold rounded-md shadow-2xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Habit</span>
        </button>

        {/* User avatar menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-plum-100/50 transition"
            title="Account"
          >
            <div className="w-8 h-8 rounded-full bg-plum-100 border border-plum-300 flex items-center justify-center text-plum-800 font-bold text-xs shadow-2xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#F1DEE7] py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[#F7EDF2]">
                <p className="font-semibold text-plum-900">{user?.name}</p>
                <p className="text-gray-500 truncate text-[11px]">{user?.email}</p>
                <div className="flex items-center space-x-1 text-[10px] text-plum-600 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>TZ: {user?.timezone || 'Asia/Kolkata'}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
