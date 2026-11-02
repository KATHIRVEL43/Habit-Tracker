import React from 'react';
import { Table, BarChart3, Settings, Plus } from 'lucide-react';

export type ActiveTab = 'tracker' | 'analytics' | 'habits';

interface SheetTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAddHabit: () => void;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  activeTab,
  onTabChange,
  onAddHabit,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 bg-[#F1F3F4] border-t border-[#DADCE0] flex items-center px-4 justify-between z-20 select-none">
      {/* Spreadsheet Tabs */}
      <div className="flex items-center space-x-1 h-full pt-1">
        <button
          onClick={() => onTabChange('tracker')}
          className={`h-full px-4 text-xs font-medium flex items-center space-x-1.5 rounded-t transition border-t border-x ${
            activeTab === 'tracker'
              ? 'bg-white text-[#0F9D58] border-[#DADCE0] font-semibold border-t-2 border-t-[#0F9D58]'
              : 'text-[#5F6368] hover:bg-[#E8EAED] border-transparent'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Tracker Grid</span>
        </button>

        <button
          onClick={() => onTabChange('analytics')}
          className={`h-full px-4 text-xs font-medium flex items-center space-x-1.5 rounded-t transition border-t border-x ${
            activeTab === 'analytics'
              ? 'bg-white text-[#0F9D58] border-[#DADCE0] font-semibold border-t-2 border-t-[#0F9D58]'
              : 'text-[#5F6368] hover:bg-[#E8EAED] border-transparent'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics & Trends</span>
        </button>

        <button
          onClick={() => onTabChange('habits')}
          className={`h-full px-4 text-xs font-medium flex items-center space-x-1.5 rounded-t transition border-t border-x ${
            activeTab === 'habits'
              ? 'bg-white text-[#0F9D58] border-[#DADCE0] font-semibold border-t-2 border-t-[#0F9D58]'
              : 'text-[#5F6368] hover:bg-[#E8EAED] border-transparent'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Manage Habits</span>
        </button>
      </div>

      {/* Quick Add Tab Button */}
      <button
        onClick={onAddHabit}
        className="p-1 hover:bg-[#E8EAED] text-[#5F6368] rounded transition"
        title="Add new habit"
      >
        <Plus className="w-4 h-4" />
      </button>
    </footer>
  );
};
