import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  LogOut, 
  Clock,
  CheckCircle2,
  BarChart2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format, parse, addMonths, subMonths } from 'date-fns';

interface FormulaBarHeaderProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  onOpenNewHabit: () => void;
  overallProgress: number;
  serverToday: string;
  showCharts?: boolean;
  onToggleCharts?: () => void;
}

export const FormulaBarHeader: React.FC<FormulaBarHeaderProps> = ({
  currentMonth,
  onMonthChange,
  onOpenNewHabit,
  overallProgress,
  serverToday,
  showCharts,
  onToggleCharts,
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
    <header className="bg-white border-b border-[#DADCE0] shadow-sm select-none sticky top-0 z-30">
      {/* Top Menu / Branding Row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#E8EAED]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#0F9D58] flex items-center justify-center text-white shadow-sm">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#202124] tracking-tight leading-tight">Habit Tracker</h1>
            <p className="text-[11px] text-[#5F6368] font-medium">Daily Consistency & Frequency Ledger</p>
          </div>
        </div>

        {/* Action Controls & User Menu */}
        <div className="flex items-center space-x-2.5">
          {onToggleCharts && (
            <button
              onClick={onToggleCharts}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded border transition ${
                showCharts
                  ? 'bg-[#E6F4EA] border-[#0F9D58] text-[#0B7A43]'
                  : 'bg-white border-[#DADCE0] text-[#5F6368] hover:bg-[#F8F9FA]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#0F9D58]" />
              <span className="hidden sm:inline">{showCharts ? 'Hide Visual Charts' : 'Charts & Frequency'}</span>
            </button>
          )}

          <button
            onClick={onOpenNewHabit}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0F9D58] hover:bg-[#0B7A43] text-white text-xs font-medium rounded shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>

          <div className="h-5 w-[1px] bg-[#DADCE0]" />

          {/* User profile button */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-[#F1F3F4] transition"
              title="Account settings"
            >
              <div className="w-7 h-7 rounded-full bg-[#E6F4EA] border border-[#0F9D58] flex items-center justify-center text-[#0F9D58] font-bold text-xs">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#DADCE0] py-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#F1F3F4]">
                  <p className="font-semibold text-[#202124]">{user?.name}</p>
                  <p className="text-[#5F6368] truncate">{user?.email}</p>
                  <div className="flex items-center space-x-1 text-[11px] text-[#0F9D58] mt-1">
                    <Clock className="w-3 h-3" />
                    <span>TZ: {user?.timezone || 'Asia/Kolkata'}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 hover:bg-[#FCE8E6] text-[#D93025] flex items-center space-x-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formula Bar & Navigation Row */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#F8F9FA] gap-4">
        {/* Month Selector Bar */}
        <div className="flex items-center space-x-1 bg-white border border-[#DADCE0] rounded px-1.5 py-1 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-[#F1F3F4] rounded text-[#5F6368] hover:text-[#202124] transition"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-1.5 px-2 text-xs font-semibold text-[#202124] min-w-[125px] justify-center">
            <CalendarIcon className="w-3.5 h-3.5 text-[#0F9D58]" />
            <span>{monthDisplay}</span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-[#F1F3F4] rounded text-[#5F6368] hover:text-[#202124] transition"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGoToday}
            className="ml-2 px-2 py-0.5 bg-[#F1F3F4] hover:bg-[#E8EAED] text-[11px] font-medium text-[#3C4043] rounded transition"
          >
            Today
          </button>
        </div>

        {/* Formula Bar Mock (Excel/Sheets fx bar) */}
        <div className="flex-1 hidden md:flex items-center bg-white border border-[#DADCE0] rounded px-3 py-1 shadow-2xs">
          <span className="text-[#5F6368] font-bold text-xs italic mr-3 font-mono">fx</span>
          <div className="text-[12px] font-mono text-[#3C4043] truncate">
            =SUMPRODUCT(COMPLETED_CELLS) / TOTAL_SCHEDULED_DAYS &nbsp;&nbsp;→&nbsp;&nbsp; 
            <span className="font-semibold text-[#0F9D58]">{overallProgress}% Progress</span>
          </div>
        </div>

        {/* Overall Completion Metric */}
        <div className="flex items-center space-x-2 bg-white border border-[#DADCE0] rounded px-2.5 py-1 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#0F9D58]" />
          <div className="text-xs">
            <span className="text-[#5F6368]">Month Avg: </span>
            <span className="font-bold text-[#0F9D58]">{overallProgress}%</span>
          </div>
        </div>
      </div>
    </header>
  );
};
