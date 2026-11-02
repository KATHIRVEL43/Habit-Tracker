import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { MonthViewData, Habit } from '../types';
import { AestheticHeader } from '../components/AestheticHeader';
import { TopAnalyticsCard } from '../components/TopAnalyticsCard';
import { DailyHabitsTable } from '../components/DailyHabitsTable';
import { WeeklyMonthlyTables } from '../components/WeeklyMonthlyTables';
import { HabitModal } from '../components/HabitModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const TrackerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState<string>(() => format(new Date(), 'yyyy-MM'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Fetch month data
  const { data, isLoading, error } = useQuery<MonthViewData>({
    queryKey: ['month-logs', currentMonth],
    queryFn: async () => {
      const res = await apiClient.get(`/logs?month=${currentMonth}`);
      return res.data;
    },
  });

  // Toggle log mutation (Supports daily, weekly, and monthly targets)
  const toggleMutation = useMutation({
    mutationFn: async ({ habitId, dateStr, completed }: { habitId: string; dateStr: string; completed: boolean }) => {
      const res = await apiClient.put('/logs/toggle', {
        habit_id: habitId,
        date: dateStr,
        completed,
      });
      return res.data;
    },
    onMutate: async ({ habitId, dateStr, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['month-logs', currentMonth] });
      const previousData = queryClient.getQueryData<MonthViewData>(['month-logs', currentMonth]);

      if (previousData) {
        queryClient.setQueryData<MonthViewData>(['month-logs', currentMonth], {
          ...previousData,
          logs: {
            ...previousData.logs,
            [habitId]: {
              ...(previousData.logs[habitId] || {}),
              [dateStr]: completed,
            },
          },
        });
      }
      return { previousData };
    },
    onError: (err: any, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['month-logs', currentMonth], context.previousData);
      }
      toast.error(err.response?.data?.detail || 'Could not toggle check.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['month-logs', currentMonth] });
    },
  });

  // Save habit mutation (Create or Update)
  const saveHabitMutation = useMutation({
    mutationFn: async (payload: Partial<Habit>) => {
      if (editingHabit) {
        await apiClient.patch(`/habits/${editingHabit.id}`, payload);
      } else {
        await apiClient.post('/habits', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['month-logs', currentMonth] });
      toast.success(editingHabit ? 'Habit updated!' : 'Habit added!');
      setIsModalOpen(false);
      setEditingHabit(null);
    },
    onError: () => {
      toast.error('Failed to save habit.');
    },
  });

  // Archive / Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      await apiClient.delete(`/habits/${habitId}?hard_delete=true`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['month-logs', currentMonth] });
      toast.success('Habit removed.');
    },
    onError: () => {
      toast.error('Failed to remove habit.');
    },
  });

  const handleToggle = (habitId: string, dateStr: string, completed: boolean) => {
    toggleMutation.mutate({ habitId, dateStr, completed });
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Delete this habit entry?')) {
      deleteHabitMutation.mutate(habitId);
    }
  };

  // Group habits by frequency category
  const allHabits = data?.habits || [];
  const dailyHabits = allHabits.filter((h) => !h.frequency || h.frequency === 'daily');
  const weeklyHabits = allHabits.filter((h) => h.frequency === 'weekly');
  const monthlyHabits = allHabits.filter((h) => h.frequency === 'monthly');

  return (
    <div className="min-h-screen bg-[#FAF4F7] flex flex-col select-none text-[#4A3540]">
      {/* Top Header */}
      <AestheticHeader
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsModalOpen(true);
        }}
        serverToday={data?.server_today || format(new Date(), 'yyyy-MM-dd')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="max-w-[1780px] mx-auto px-2 sm:px-4 lg:px-6 mt-8">
            <div className="bg-white border border-[#F1DEE7] rounded-md p-14 text-center shadow-xs">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-plum-700 border-t-transparent rounded-full mb-2" />
              <p className="text-xs text-plum-900/70 font-mono">Loading habit planner...</p>
            </div>
          </div>
        ) : error || !data ? (
          <div className="max-w-[1780px] mx-auto px-2 sm:px-4 lg:px-6 mt-8">
            <div className="bg-white border border-[#F1DEE7] rounded-md p-8 text-center text-xs text-red-600">
              Failed to load planner data. Please check MongoDB connection.
            </div>
          </div>
        ) : (
          <>
            {/* Top Row: Donut Chart ("Total Completed") & 0%-80% Area Curve (Image 1) */}
            <TopAnalyticsCard data={data} dailyHabits={dailyHabits} />

            {/* Main Row: Daily Habits Table (1..31, TOTAL, % COMPLETED bars, and Lavender bottom row with peak day) */}
            <DailyHabitsTable
              data={data}
              habits={dailyHabits}
              onToggleDay={handleToggle}
              onEditHabit={handleEditHabit}
              onDeleteHabit={handleDeleteHabit}
              onAddHabit={() => {
                setEditingHabit(null);
                setIsModalOpen(true);
              }}
            />

            {/* Bottom Row: Weekly Habits (Week 1..5) & Monthly Habits (Done) side-by-side (Image 2) */}
            <WeeklyMonthlyTables
              data={data}
              weeklyHabits={weeklyHabits}
              monthlyHabits={monthlyHabits}
              onToggleWeek={handleToggle}
              onToggleMonthDone={handleToggle}
              onEditHabit={handleEditHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          </>
        )}
      </main>

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        initialHabit={editingHabit}
        onSave={async (habitData) => {
          await saveHabitMutation.mutateAsync(habitData);
        }}
      />
    </div>
  );
};
