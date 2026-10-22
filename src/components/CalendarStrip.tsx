import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
  Calendar,
} from 'lucide-react';
import { DayWorkout } from '../types';
import {
  getTodayDateString,
  getWeekDays,
  formatWeekRangeHeader,
  shiftDateByWeeks,
  shiftDateByMonths,
  getMonthCalendarData,
} from '../utils/dateUtils';

export interface CalendarStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  workouts: DayWorkout[];
  isDark: boolean;
  className?: string;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
  workouts,
  isDark,
  className = '',
}) => {
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('week');
  const todayStr = getTodayDateString();

  const [viewWeekDate, setViewWeekDate] = useState<string>(
    selectedDate || todayStr
  );

  useEffect(() => {
    if (selectedDate) {
      setViewWeekDate(selectedDate);
    }
  }, [selectedDate]);

  const weekDays = getWeekDays(viewWeekDate);
  const weekRangeTitle = formatWeekRangeHeader(weekDays);
  const monthData = getMonthCalendarData(viewWeekDate);

  const handlePrev = () => {
    if (calendarMode === 'week') {
      setViewWeekDate((prev) => shiftDateByWeeks(prev, -1));
    } else {
      setViewWeekDate((prev) => shiftDateByMonths(prev, -1));
    }
  };

  const handleNext = () => {
    if (calendarMode === 'week') {
      setViewWeekDate((prev) => shiftDateByWeeks(prev, 1));
    } else {
      setViewWeekDate((prev) => shiftDateByMonths(prev, 1));
    }
  };

  const handleGoToToday = () => {
    setViewWeekDate(todayStr);
    onSelectDate(todayStr);
  };

  return (
    <section className={`space-y-3 pb-1 ${className}`}>
      {/* Top Header: Date Range & Navigation on Left | Weekly / Monthly Switcher on Right */}
      <div className="flex items-center justify-between flex-wrap gap-2.5">
        {/* Left: Date title and Prev/Next controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarIcon className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold tracking-tight tabular-nums">
            {calendarMode === 'week' ? weekRangeTitle : monthData.monthTitle}
          </h3>

          <div className="flex items-center gap-0.5 ml-1">
            <button
              type="button"
              onClick={handlePrev}
              title={calendarMode === 'week' ? 'Previous Week' : 'Previous Month'}
              aria-label={calendarMode === 'week' ? 'Previous Week' : 'Previous Month'}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
                  : 'hover:bg-neutral-200 text-neutral-600 hover:text-black'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title={calendarMode === 'week' ? 'Next Week' : 'Next Month'}
              aria-label={calendarMode === 'week' ? 'Next Week' : 'Next Month'}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
                  : 'hover:bg-neutral-200 text-neutral-600 hover:text-black'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={handleGoToToday}
                className={`ml-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800/90 hover:bg-neutral-700 text-amber-400'
                    : 'bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800'
                }`}
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Right: Weekly View & Monthly View Toggle Buttons */}
        <div
          className={`inline-flex items-center p-1 rounded-xl border self-start sm:self-auto ${
            isDark
              ? 'bg-[#14171e] border-neutral-800'
              : 'bg-slate-100 border-neutral-300'
          }`}
        >
          <button
            type="button"
            onClick={() => setCalendarMode('week')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              calendarMode === 'week'
                ? 'bg-amber-400 text-black shadow-sm font-bold'
                : isDark
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Weekly View</span>
          </button>
          <button
            type="button"
            onClick={() => setCalendarMode('month')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              calendarMode === 'month'
                ? 'bg-amber-400 text-black shadow-sm font-bold'
                : isDark
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly View</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 7-Day Interactive Grid */}
      {calendarMode === 'week' && (
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-0.5">
          {weekDays.map((day) => {
            const isSelected = day.date === selectedDate;
            const isToday = day.isToday;
            const dayWorkout = workouts.find((w) => w.date === day.date);
            const exerciseCount = dayWorkout?.exercises?.length || 0;
            const hasExercises = exerciseCount > 0;
            const allCompleted =
              hasExercises &&
              (dayWorkout?.sessionCompleted ||
                dayWorkout?.exercises.every((e) => e.completed));

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => onSelectDate(day.date)}
                className={`py-2 px-1 sm:px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center relative min-h-[52px] sm:min-h-[58px] border ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-400 font-extrabold shadow-md scale-[1.02] ring-2 ring-amber-400/30'
                    : isToday
                    ? isDark
                      ? 'bg-[#181e2b] border-amber-400/80 text-white shadow-sm ring-1 ring-amber-400/40'
                      : 'bg-amber-50 border-amber-400 text-neutral-900 shadow-sm ring-1 ring-amber-400/50'
                    : isDark
                    ? 'bg-[#141822]/80 hover:bg-[#1b202c] border-neutral-800 text-neutral-300'
                    : 'bg-slate-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                <span
                  className={`text-[10px] sm:text-xs uppercase font-semibold leading-none ${
                    isToday && !isSelected ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  {day.dayOfWeek}
                </span>

                <span className="text-sm sm:text-base font-bold my-1 leading-none tabular-nums">
                  {day.dayNumber}
                </span>

                {/* Status Indicator */}
                <div className="h-1.5 flex items-center justify-center">
                  {hasExercises ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-black'
                          : allCompleted
                          ? 'bg-emerald-400'
                          : 'bg-amber-500'
                      }`}
                    />
                  ) : (
                    <span className="w-1.5 h-1.5 opacity-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Dynamic Month Calendar Grid */}
      {calendarMode === 'month' && (
        <div
          className={`p-3 sm:p-4 rounded-xl border space-y-2.5 ${
            isDark
              ? 'bg-[#12151c] border-neutral-800'
              : 'bg-slate-50 border-neutral-200'
          }`}
        >
          <div className="grid grid-cols-7 gap-1 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div
                key={i}
                className={`text-[10px] font-bold py-1 ${
                  isDark ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                {d}
              </div>
            ))}

            {Array.from({ length: monthData.leadBlanksCount }).map((_, i) => (
              <div key={`b-${i}`} className="p-1 min-h-[38px]" />
            ))}

            {monthData.days.map(({ dayNum, dateStr }) => {
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const dayWorkout = workouts.find((w) => w.date === dateStr);
              const hasWorkout =
                dayWorkout && dayWorkout.exercises && dayWorkout.exercises.length > 0;
              const allCompleted =
                hasWorkout &&
                (dayWorkout?.sessionCompleted ||
                  dayWorkout?.exercises.every((e) => e.completed));

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onSelectDate(dateStr)}
                  className={`p-1 rounded-lg text-xs font-semibold flex flex-col items-center justify-center min-h-[38px] transition-all cursor-pointer relative tabular-nums ${
                    isSelected
                      ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                      : isToday
                      ? isDark
                        ? 'bg-[#181d28] text-white border-2 border-amber-400'
                        : 'bg-amber-50 text-neutral-900 border-2 border-amber-400'
                      : hasWorkout
                      ? isDark
                        ? 'bg-[#181d28] text-white border border-amber-400/40'
                        : 'bg-amber-50 text-neutral-900 border border-amber-400/60'
                      : isDark
                      ? 'text-neutral-400 hover:bg-neutral-800'
                      : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-amber-400 mb-0.5" />
                  )}
                  <span>{dayNum}</span>
                  {hasWorkout && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected
                          ? 'bg-black'
                          : allCompleted
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
