import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Habit } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => Promise<void>;
  initialHabit?: Habit | null;
}

const EMOJI_OPTIONS = ['🌸', '💧', '📖', '🏃', '🧘', '🥗', '💻', '✍️', '🍎', '💊', '🛌', '👟', '✨', '🧹', '💰', '🧺'];
const FREQUENCY_OPTIONS: { id: 'daily' | 'weekly' | 'monthly'; label: string; desc: string }[] = [
  { id: 'daily', label: 'Daily Habit', desc: 'Tracked on days 1–31 of the month' },
  { id: 'weekly', label: 'Weekly Habit', desc: 'Tracked across Weeks 1–5' },
  { id: 'monthly', label: 'Monthly Habit', desc: 'Tracked once per month' },
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌸');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [monthlyGoal, setMonthlyGoal] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name);
      setEmoji(initialHabit.emoji || '🌸');
      setFrequency(initialHabit.frequency || 'daily');
      setMonthlyGoal(initialHabit.monthly_goal || 20);
    } else {
      setName('');
      setEmoji('🌸');
      setFrequency('daily');
      setMonthlyGoal(20);
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        emoji,
        frequency,
        color: '#8D2D5B',
        monthly_goal: Number(monthlyGoal),
        active_days: [0, 1, 2, 3, 4, 5, 6],
      });
      onClose();
    } catch {
      // handled by caller
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs select-none">
      <div className="bg-white rounded-lg shadow-xl border border-[#F1DEE7] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F7EDF2] bg-[#FAF4F7]">
          <h2 className="font-semibold text-sm text-plum-900">
            {initialHabit ? 'Edit Habit' : 'New Habit Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-plum-100/50 text-plum-700 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Frequency Type Selector */}
          <div>
            <label className="block font-medium text-plum-950 mb-1.5">
              Habit Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCY_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id)}
                  className={`py-2 px-2 rounded border text-center transition ${
                    frequency === f.id
                      ? 'bg-plum-700 border-plum-700 text-white font-semibold'
                      : 'bg-white border-[#F1DEE7] text-plum-900 hover:bg-plum-50'
                  }`}
                >
                  <span className="block text-[11px] font-medium">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Habit Name + Emoji */}
          <div>
            <label className="block font-medium text-plum-950 mb-1.5">
              Habit Name & Emoji
            </label>
            <div className="flex space-x-2">
              <span className="text-xl p-2 bg-plum-50 rounded border border-[#F1DEE7] block cursor-default">
                {emoji}
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Morning Yoga / Read 20 Pages"
                className="flex-1 px-3 py-2 border border-[#F1DEE7] rounded focus:outline-none focus:border-plum-600 focus:ring-1 focus:ring-plum-600"
              />
            </div>

            {/* Quick Emoji Selection */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`p-1 text-sm rounded border transition ${
                    emoji === e ? 'bg-plum-100 border-plum-600' : 'hover:bg-plum-50 border-transparent'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Target (For Daily Habits) */}
          {frequency === 'daily' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-plum-950">Monthly Goal (Days)</label>
                <span className="font-mono font-bold text-plum-700">{monthlyGoal} days / month</span>
              </div>
              <input
                type="range"
                min={1}
                max={31}
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                className="w-full accent-plum-700 cursor-pointer"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#F7EDF2]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-gray-500 hover:bg-plum-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-1.5 rounded bg-plum-700 hover:bg-plum-800 text-white font-semibold transition disabled:opacity-50 shadow-2xs"
            >
              {isSubmitting ? 'Saving...' : initialHabit ? 'Save Changes' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
