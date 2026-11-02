import React from 'react';
import { MonthViewData } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { 
  TrendingUp, 
  Flame, 
  BarChart2, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import { getDay } from 'date-fns';

interface FrequencyChartsDashboardProps {
  data: MonthViewData;
}

const WEEKDAYS = [
  { name: 'Mon', index: 0 },
  { name: 'Tue', index: 1 },
  { name: 'Wed', index: 2 },
  { name: 'Thu', index: 3 },
  { name: 'Fri', index: 4 },
  { name: 'Sat', index: 5 },
  { name: 'Sun', index: 6 },
];

function getIsoWeekday(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export const FrequencyChartsDashboard: React.FC<FrequencyChartsDashboardProps> = ({ data }) => {
  const { month, server_today, days_in_month, habits, logs, summaries, overall_progress } = data;

  const days = Array.from({ length: days_in_month }, (_, i) => i + 1);

  // 1. Daily Progress data for Recharts Area Curve
  const dailyChartData = days.map((dayNum) => {
    const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
    let completedCount = 0;
    let scheduledCount = 0;

    const dateObj = new Date(`${dateStr}T00:00:00`);
    const isoDay = getIsoWeekday(getDay(dateObj));

    habits.forEach((h) => {
      if (h.active_days.includes(isoDay)) {
        scheduledCount++;
        if (logs[h.id]?.[dateStr]) {
          completedCount++;
        }
      }
    });

    return {
      day: dayNum,
      date: dateStr,
      completed: completedCount,
      scheduled: scheduledCount,
      isToday: dateStr === server_today,
      isPast: dateStr <= server_today,
    };
  });

  // 2. Weekday Frequency Calculation (Mon - Sun adherence pattern)
  const weekdayFrequency = WEEKDAYS.map((w) => {
    let completed = 0;
    let scheduled = 0;

    days.forEach((dayNum) => {
      const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
      const dateObj = new Date(`${dateStr}T00:00:00`);
      const isoDay = getIsoWeekday(getDay(dateObj));

      if (isoDay === w.index) {
        habits.forEach((h) => {
          if (h.active_days.includes(isoDay)) {
            scheduled++;
            if (logs[h.id]?.[dateStr]) {
              completed++;
            }
          }
        });
      }
    });

    const frequencyPct = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    return {
      day: w.name,
      frequency: frequencyPct,
      completed,
      scheduled,
    };
  });

  // 3. Today's progress calculation
  const todayDateObj = new Date(`${server_today}T00:00:00`);
  const todayIsoDay = getIsoWeekday(getDay(todayDateObj));
  const scheduledToday = habits.filter((h) => h.active_days.includes(todayIsoDay));
  const completedToday = scheduledToday.filter((h) => logs[h.id]?.[server_today]).length;
  const todayPct = scheduledToday.length > 0 
    ? Math.round((completedToday / scheduledToday.length) * 100) 
    : 0;

  // 4. Weekly Frequency Breakdown (Week 1..Week 5)
  const weekBuckets = [
    { label: 'Week 1', days: days.filter((d) => d >= 1 && d <= 7) },
    { label: 'Week 2', days: days.filter((d) => d >= 8 && d <= 14) },
    { label: 'Week 3', days: days.filter((d) => d >= 15 && d <= 21) },
    { label: 'Week 4', days: days.filter((d) => d >= 22 && d <= 28) },
    { label: 'Week 5', days: days.filter((d) => d >= 29) },
  ].filter((wb) => wb.days.length > 0);

  const weeklyStats = weekBuckets.map((wb) => {
    let done = 0;
    let total = 0;
    wb.days.forEach((d) => {
      const dStr = `${month}-${String(d).padStart(2, '0')}`;
      const dObj = new Date(`${dStr}T00:00:00`);
      const iso = getIsoWeekday(getDay(dObj));
      habits.forEach((h) => {
        if (h.active_days.includes(iso)) {
          total++;
          if (logs[h.id]?.[dStr]) done++;
        }
      });
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { label: wb.label, pct, done, total };
  });

  // 5. Circular Donut Constants
  const donutR = 36;
  const donutCirc = 2 * Math.PI * donutR;
  const monthDonutOffset = donutCirc - (Math.min(overall_progress, 100) / 100) * donutCirc;
  const todayDonutOffset = donutCirc - (Math.min(todayPct, 100) / 100) * donutCirc;

  // 6. Top consistent habits sorted by current streak / completion rate
  const sortedHabits = [...habits].sort((a, b) => {
    const sumA = summaries[a.id]?.current_streak || 0;
    const sumB = summaries[b.id]?.current_streak || 0;
    return sumB - sumA;
  }).slice(0, 4);

  return (
    <div className="space-y-3 mb-4 select-none">
      {/* Top 3-Column Chart Header Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column (3 cols): Progress Gauges & Quick Stats */}
        <div className="lg:col-span-3 bg-white border border-[#DADCE0] rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E8EAED] pb-2 mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#202124] tracking-tight">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D58]" />
              <span className="uppercase text-[11px] tracking-wider text-[#5F6368]">Monthly Gauges</span>
            </div>
            <span className="text-[10px] font-mono text-[#0F9D58] bg-[#E6F4EA] px-1.5 py-0.5 rounded font-semibold">
              Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            {/* Monthly Avg Donut */}
            <div className="flex flex-col items-center p-2 rounded bg-[#F8F9FA] border border-[#E8EAED]">
              <div className="relative w-18 h-18 my-1 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r={donutR} fill="transparent" stroke="#E6EBE4" strokeWidth="8" />
                  <circle
                    cx="45"
                    cy="45"
                    r={donutR}
                    fill="transparent"
                    stroke="#0F9D58"
                    strokeWidth="8"
                    strokeDasharray={donutCirc}
                    strokeDashoffset={monthDonutOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs font-bold font-mono text-[#202124]">{Math.round(overall_progress)}%</span>
                </div>
              </div>
              <span className="text-[10px] font-medium text-[#5F6368] uppercase tracking-tight mt-1">Month Rate</span>
            </div>

            {/* Today Donut */}
            <div className="flex flex-col items-center p-2 rounded bg-[#F8F9FA] border border-[#E8EAED]">
              <div className="relative w-18 h-18 my-1 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r={donutR} fill="transparent" stroke="#E6EBE4" strokeWidth="8" />
                  <circle
                    cx="45"
                    cy="45"
                    r={donutR}
                    fill="transparent"
                    stroke="#4F7F5A"
                    strokeWidth="8"
                    strokeDasharray={donutCirc}
                    strokeDashoffset={todayDonutOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs font-bold font-mono text-[#202124]">{todayPct}%</span>
                </div>
              </div>
              <span className="text-[10px] font-medium text-[#5F6368] uppercase tracking-tight mt-1">Today</span>
            </div>
          </div>

          <div className="text-[11px] text-[#5F6368] border-t border-[#E8EAED] pt-2 flex items-center justify-between">
            <span>Scheduled Today:</span>
            <span className="font-mono font-bold text-[#202124]">{completedToday} / {scheduledToday.length} Done</span>
          </div>
        </div>

        {/* Center Column (6 cols): Daily Completion Velocity Area Curve */}
        <div className="lg:col-span-6 bg-white border border-[#DADCE0] rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-[#0F9D58]" />
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#5F6368]">
                Daily Completion Velocity (Days 1 – {days_in_month})
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#5F6368]">
              Completed habits / day
            </span>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F9D58" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#8FBF7F" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#ECEFF1" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 9, fill: '#5F6368' }}
                  interval={2}
                />
                <YAxis 
                  tick={{ fontSize: 9, fill: '#5F6368' }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#DADCE0] shadow-md p-2 rounded text-[11px]">
                          <p className="font-bold text-[#202124]">Day {d.day} ({d.date})</p>
                          <p className="text-[#0F9D58] font-semibold">{d.completed} of {d.scheduled} habits completed</p>
                          {d.isToday && <p className="text-[#B06000] font-medium">★ Today</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#0F9D58" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#velocityFill)" 
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (3 cols): Day-of-Week Frequency Pattern */}
        <div className="lg:col-span-3 bg-white border border-[#DADCE0] rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E8EAED] pb-2 mb-2">
            <div className="flex items-center space-x-1.5">
              <BarChart2 className="w-4 h-4 text-[#0F9D58]" />
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#5F6368]">
                Weekday Frequency
              </span>
            </div>
            <span className="text-[10px] text-[#5F6368]">Adherence %</span>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayFrequency} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#ECEFF1" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#5F6368' }} />
                <YAxis tick={{ fontSize: 9, fill: '#5F6368' }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Frequency']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#DADCE0',
                    fontSize: '11px',
                    borderRadius: '4px',
                  }}
                />
                <Bar dataKey="frequency" radius={[2, 2, 0, 0]}>
                  {weekdayFrequency.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.frequency >= 75 ? '#0F9D58' : entry.frequency >= 50 ? '#8FBF7F' : '#BAC4B8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Frequency Cards & Weekly Distribution Pill */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Weekly Breakdown (6 cols) */}
        <div className="md:col-span-7 bg-white border border-[#DADCE0] rounded-xs p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              Weekly Progress Frequency
            </span>
            <span className="text-[10px] text-[#80868B]">Completion by 7-day blocks</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {weeklyStats.map((w, idx) => (
              <div key={idx} className="bg-[#F8F9FA] border border-[#E8EAED] rounded p-2 text-center">
                <span className="text-[10px] text-[#5F6368] font-medium block">{w.label}</span>
                <span className="text-xs font-bold font-mono text-[#0F9D58] block my-0.5">{w.pct}%</span>
                <div className="w-full bg-[#E0E0E0] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0F9D58] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(w.pct, 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-[#80868B] font-mono mt-1 block">{w.done}/{w.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Habits Streak Leaders (5 cols) */}
        <div className="md:col-span-5 bg-white border border-[#DADCE0] rounded-xs p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              Top Streak Consistency
            </span>
            <span className="text-[10px] text-[#80868B]">Consecutive active days</span>
          </div>

          <div className="space-y-1.5">
            {sortedHabits.map((habit) => {
              const sum = summaries[habit.id];
              return (
                <div key={habit.id} className="flex items-center justify-between text-xs py-0.5 border-b border-[#F1F3F4] last:border-none">
                  <div className="flex items-center space-x-1.5 truncate max-w-[170px]">
                    <span className="text-sm">{habit.emoji}</span>
                    <span className="font-medium text-[#202124] truncate">{habit.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] text-[#5F6368]">
                      {sum?.completed_count || 0}/{habit.monthly_goal}d
                    </span>
                    <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-[#FEF7E0] text-[#B06000] font-mono text-[10px] font-bold">
                      <Flame className="w-2.5 h-2.5 text-[#F2994A]" />
                      <span>{sum?.current_streak || 0}d</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
