import React from 'react';
import { MonthViewData, Habit } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface TopAnalyticsCardProps {
  data: MonthViewData;
  dailyHabits: Habit[];
}

export const TopAnalyticsCard: React.FC<TopAnalyticsCardProps> = ({ data, dailyHabits }) => {
  const { month, days_in_month, logs } = data;
  const days = Array.from({ length: days_in_month }, (_, i) => i + 1);

  // Calculate completion percentage for each day (0% to 100%)
  const dailyChartData = days.map((dayNum) => {
    const dateStr = `${month}-${String(dayNum).padStart(2, '0')}`;
    let count = 0;
    dailyHabits.forEach((h) => {
      if (logs[h.id]?.[dateStr]) {
        count++;
      }
    });

    const totalPossible = Math.max(dailyHabits.length, 1);
    const pct = Math.round((count / totalPossible) * 100);

    return {
      day: dayNum,
      date: dateStr,
      pct: pct,
      count: count,
      total: dailyHabits.length,
    };
  });

  // Calculate overall Total Completed % across the entire month
  let totalChecks = 0;
  const totalSlots = dailyHabits.length * days_in_month;
  dailyChartData.forEach((d) => {
    totalChecks += d.count;
  });

  const overallPercent = totalSlots > 0 ? ((totalChecks / totalSlots) * 100).toFixed(2) : '0.00';

  // Circular Donut constants
  const donutR = 48;
  const donutCirc = 2 * Math.PI * donutR;
  const numPct = parseFloat(overallPercent);
  const donutOffset = donutCirc - (Math.min(numPct, 100) / 100) * donutCirc;

  return (
    <div className="w-full max-w-[1780px] mx-auto px-2 sm:px-4 lg:px-6 mb-5 select-none">
      <div className="bg-white border border-[#F1DEE7] rounded-lg shadow-sm p-4 sm:p-5 lg:p-6 flex flex-col md:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
        {/* Left: Circular Donut Chart */}
        <div className="w-full md:w-56 lg:w-72 flex flex-col items-center justify-center py-1 sm:py-2 flex-shrink-0">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Lavender Track Ring */}
              <circle
                cx="60"
                cy="60"
                r={donutR}
                fill="transparent"
                stroke="#D7C7E1"
                strokeWidth="14"
              />
              {/* Dark Plum Progress Arc */}
              <circle
                cx="60"
                cy="60"
                r={donutR}
                fill="transparent"
                stroke="#8D2D5B"
                strokeWidth="14"
                strokeDasharray={donutCirc}
                strokeDashoffset={donutOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-sans text-plum-900 tracking-tight">
                {overallPercent}%
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-plum-600/80 -mt-0.5">
                Total Completed
              </span>
            </div>
          </div>
        </div>

        {/* Right: Area Curve Chart with 0.00% to 80.00% Y-Axis & Pink Dots */}
        <div className="flex-1 w-full h-40 sm:h-48 lg:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyChartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FDE6EF" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#FFF5F9" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2E1EB" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 9, fill: '#8D2D5B' }}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: '#F2E1EB' }}
              />
              <YAxis 
                domain={[0, 80]}
                ticks={[0, 20, 40, 60, 80]}
                tickFormatter={(val) => `${val.toFixed(2)}%`}
                tick={{ fontSize: 8, fill: '#8D2D5B' }}
                tickLine={false}
                axisLine={false}
                width={45}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-white border border-[#F1DEE7] shadow-md p-2 rounded text-[11px]">
                        <p className="font-bold text-plum-900">Day {item.day}</p>
                        <p className="text-[#EE78A7] font-semibold">{item.pct}% Completed</p>
                        <p className="text-gray-500 text-[10px]">{item.count} of {item.total} habits checked</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="pct"
                stroke="#EE78A7"
                strokeWidth={2}
                fill="url(#pinkGradient)"
                dot={{ stroke: '#EE78A7', fill: '#EE78A7', r: 2.5 }}
                activeDot={{ stroke: '#8D2D5B', strokeWidth: 2, fill: '#EE78A7', r: 4.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
