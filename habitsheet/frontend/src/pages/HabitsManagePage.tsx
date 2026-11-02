import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Habit } from '../types';
import { HabitModal } from '../components/HabitModal';
import { Plus, Edit2, Trash2, Archive, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const WEEKDAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const HabitsManagePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ['habits-manage'],
    queryFn: async () => {
      const res = await apiClient.get('/habits');
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<Habit>) => {
      if (editingHabit) {
        await apiClient.patch(`/habits/${editingHabit.id}`, payload);
      } else {
        await apiClient.post('/habits', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits-manage'] });
      queryClient.invalidateQueries({ queryKey: ['month-logs'] });
      toast.success(editingHabit ? 'Habit updated!' : 'Habit created!');
      setIsModalOpen(false);
      setEditingHabit(null);
    },
    onError: () => {
      toast.error('Failed to save habit.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (habitId: string) => {
      await apiClient.delete(`/habits/${habitId}?hard_delete=true`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits-manage'] });
      queryClient.invalidateQueries({ queryKey: ['month-logs'] });
      toast.success('Habit deleted.');
    },
    onError: () => {
      toast.error('Failed to delete habit.');
    },
  });

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4 pb-20 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#202124]">Manage Habit Rows</h2>
          <p className="text-xs text-[#5F6368]">Configure targets, active schedule days, and colors</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0F9D58] hover:bg-[#0B7A43] text-white text-xs font-medium rounded shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habits Table */}
      <div className="bg-white rounded border border-[#DADCE0] shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F8F9FA] text-[#5F6368] font-medium border-b border-[#DADCE0]">
            <tr>
              <th className="px-4 py-2 font-semibold">NAME & EMOJI</th>
              <th className="px-4 py-2 font-semibold text-center">MONTHLY GOAL</th>
              <th className="px-4 py-2 font-semibold">ACTIVE SCHEDULE</th>
              <th className="px-4 py-2 font-semibold text-center">COLOR</th>
              <th className="px-4 py-2 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EAED]">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[#5F6368]">
                  Loading habits...
                </td>
              </tr>
            ) : habits.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[#5F6368]">
                  No active habits found. Click "+ New Habit" to create your first row.
                </td>
              </tr>
            ) : (
              habits.map((habit) => (
                <tr key={habit.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3 font-medium text-[#202124] flex items-center space-x-2">
                    <span className="text-xl">{habit.emoji}</span>
                    <span>{habit.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-semibold text-[#0F9D58]">
                    {habit.monthly_goal} days
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-1">
                      {WEEKDAY_NAMES.map((name, idx) => {
                        const active = habit.active_days.includes(idx);
                        return (
                          <span
                            key={idx}
                            className={`w-5 h-5 rounded-xs flex items-center justify-center text-[10px] font-bold ${
                              active
                                ? 'bg-[#0F9D58] text-white'
                                : 'bg-[#F1F3F4] text-[#BDC1C6]'
                            }`}
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div
                      className="w-4 h-4 rounded-full mx-auto"
                      style={{ backgroundColor: habit.color }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEdit(habit)}
                        className="p-1 hover:bg-[#F1F3F4] text-[#5F6368] hover:text-[#0F9D58] rounded transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
                            deleteMutation.mutate(habit.id);
                          }
                        }}
                        className="p-1 hover:bg-[#FCE8E6] text-[#5F6368] hover:text-[#D93025] rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        initialHabit={editingHabit}
        onSave={async (data) => {
          await saveMutation.mutateAsync(data);
        }}
      />
    </div>
  );
};
