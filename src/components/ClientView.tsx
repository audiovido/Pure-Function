import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Camera,
  BarChart2,
  FileText,
  ChevronRight as ArrowRight,
  Check,
  Calendar,
  Layers,
  Dumbbell,
  Clock,
  Flame,
} from 'lucide-react';
import { ClientProfile, DayWorkout, Exercise, ThemeMode } from '../types';
import {
  getTodayDateString,
  getWeekDays,
  formatWeekRangeHeader,
  shiftDateByWeeks,
  getOrCreateDayWorkout,
} from '../utils/dateUtils';

interface ClientViewProps {
  client: ClientProfile;
  workouts: DayWorkout[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleExerciseDone: (date: string, exerciseId: string) => void;
  onOpenVideo: (exercise: Exercise) => void;
  onOpenAssessments: () => void;
  theme?: ThemeMode;
}

export const ClientView: React.FC<ClientViewProps> = ({
  client,
  workouts,
  selectedDate,
  onSelectDate,
  onToggleExerciseDone,
  onOpenVideo,
  onOpenAssessments,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<
    'My workouts' | 'My progress' | 'Homework'
  >('My workouts');
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
  const activeDayWorkout = getOrCreateDayWorkout(workouts, selectedDate);

  const handlePrevWeek = () => {
    setViewWeekDate((prev) => shiftDateByWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setViewWeekDate((prev) => shiftDateByWeeks(prev, 1));
  };

  const handleGoToToday = () => {
    setViewWeekDate(todayStr);
    onSelectDate(todayStr);
  };

  // 31 days for month calendar
  const leadBlanks = [null, null, null]; // Oct 1, 2026 starts on Thu
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div
      className={`w-full rounded-2xl transition-colors duration-200 shadow-xl overflow-hidden min-h-[580px] flex flex-col justify-between p-3.5 sm:p-6 md:p-7 border ${
        isDark
          ? 'bg-[#0f1117]/95 border-neutral-800/90 text-slate-100'
          : 'bg-white/95 border-neutral-200/90 text-neutral-900'
      }`}
    >
      <div className="space-y-5 sm:space-y-6">
        {/* Top Header: Client Name & Main Subtabs */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {client.avatarUrl ? (
                <img
                  src={client.avatarUrl}
                  alt={client.name}
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-neutral-700/60 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{ display: client.avatarUrl ? 'none' : 'flex' }}
                className="w-11 h-11 rounded-xl bg-amber-400 text-black font-extrabold items-center justify-center text-sm shadow-sm shrink-0"
              >
                {client.name
                  ?.split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'PF'}
              </div>
              <div>
                <h2
                  className={`text-xl sm:text-2xl font-black tracking-tight ${
                    isDark ? 'text-white' : 'text-neutral-900'
                  }`}
                >
                  {client.name}
                </h2>
                <div
                  className={`text-xs mt-0.5 ${
                    isDark ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  Age: {client.age || 28} · Coach: {client.coach || 'Marcus Vance, CSCS'}
                </div>
              </div>
            </div>

            {/* In-view Calendar Mode Switcher (Week / Month) */}
            <div
              className={`flex items-center p-1 rounded-xl border self-start sm:self-auto ${
                isDark
                  ? 'bg-[#14171e] border-neutral-800'
                  : 'bg-slate-100 border-neutral-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setCalendarMode('week')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  calendarMode === 'week'
                    ? 'bg-amber-400 text-black shadow-sm font-bold'
                    : isDark
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Week View</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarMode('month')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  calendarMode === 'month'
                    ? 'bg-amber-400 text-black shadow-sm font-bold'
                    : isDark
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Month Calendar</span>
              </button>
            </div>
          </div>

          <div
            className={`flex items-center gap-4 sm:gap-6 border-b ${
              isDark ? 'border-neutral-800' : 'border-neutral-200'
            }`}
          >
            <button
              onClick={() => setActiveTab('My workouts')}
              className={`pb-2.5 text-xs sm:text-sm font-bold tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === 'My workouts'
                  ? 'border-amber-400 text-amber-500'
                  : isDark
                  ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              My workouts
            </button>
            <button
              onClick={() => {
                setActiveTab('My progress');
                onOpenAssessments();
              }}
              className={`pb-2.5 text-xs sm:text-sm font-bold tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === 'My progress'
                  ? 'border-amber-400 text-amber-500'
                  : isDark
                  ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              My assessments & progress
            </button>
            <button
              onClick={() => setActiveTab('Homework')}
              className={`pb-2.5 text-xs sm:text-sm font-bold tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === 'Homework'
                  ? 'border-amber-400 text-amber-500'
                  : isDark
                  ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Daily homework
            </button>
          </div>
        </section>

        {/* Tab 1: Workouts View */}
        {activeTab === 'My workouts' && (
          <>
            {/* Mode A: 7-Day Week Switcher Styled Identical to Trainer View */}
            {calendarMode === 'week' && (
              <section className="space-y-2 pb-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {/* Week title & Navigation controls */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                      {weekRangeTitle}
                    </h3>

                    {/* Previous & Next week arrows */}
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        type="button"
                        onClick={handlePrevWeek}
                        title="Previous Week"
                        aria-label="Previous Week"
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
                        onClick={handleNextWeek}
                        title="Next Week"
                        aria-label="Next Week"
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
                            : 'hover:bg-neutral-200 text-neutral-600 hover:text-black'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 7-Day Interactive Grid: Compact, Perfectly Aligned, With Workout Dots */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-1">
                  {weekDays.map((day) => {
                    const isSelected = day.date === selectedDate;
                    const isToday = day.isToday;
                    const dayWorkout = workouts.find((w) => w.date === day.date);
                    const exerciseCount = dayWorkout?.exercises?.length || 0;
                    const hasExercises = exerciseCount > 0;

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

                        <span className="text-sm sm:text-base font-bold my-1 leading-none">
                          {day.dayNumber}
                        </span>

                        {/* Status Dot: subtle dot indicating workout scheduled on this day */}
                        <div className="h-1.5 flex items-center justify-center">
                          {hasExercises ? (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-black' : 'bg-amber-500'
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
              </section>
            )}

            {/* Mode B: 31-Day Month Calendar Grid */}
            {calendarMode === 'month' && (
              <section
                className={`p-3 sm:p-4 rounded-xl border space-y-3 ${
                  isDark
                    ? 'bg-[#12151c] border-neutral-800'
                    : 'bg-slate-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>October 2026</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGoToToday}
                      className="text-xs px-2 py-0.5 rounded font-bold bg-amber-400 text-black hover:bg-amber-300 cursor-pointer transition-colors"
                    >
                      Jump to Today
                    </button>
                    <span
                      className={`text-[11px] ${
                        isDark ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      Tap any day
                    </span>
                  </div>
                </div>

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

                  {leadBlanks.map((_, i) => (
                    <div key={`b-${i}`} className="p-1 min-h-[38px]" />
                  ))}

                  {daysInMonth.map((dayNum) => {
                    const dateStr = `2026-10-${String(dayNum).padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;
                    const dayWorkout = workouts.find((w) => w.date === dateStr);
                    const hasWorkout =
                      dayWorkout && dayWorkout.exercises.length > 0;

                    return (
                      <button
                        key={dayNum}
                        onClick={() => onSelectDate(dateStr)}
                        className={`p-1 rounded-lg text-xs font-semibold flex flex-col items-center justify-center min-h-[38px] transition-all cursor-pointer relative ${
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
                              isSelected ? 'bg-black' : 'bg-amber-400'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Selected Day Workout Section */}
            <section className="space-y-3">
              {/* Exercises List */}
              {activeDayWorkout.exercises.length > 0 ? (
                <div className="space-y-3">
                  {activeDayWorkout.exercises.map((exercise) => {
                    return (
                      <div
                        key={exercise.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                          exercise.completed
                            ? isDark
                              ? 'bg-[#121820]/60 border-neutral-800/60 opacity-80'
                              : 'bg-emerald-50/40 border-emerald-200'
                            : isDark
                            ? 'bg-[#14171f] border-neutral-800'
                            : 'bg-slate-50 border-neutral-200 shadow-sm'
                        }`}
                      >
                        {/* Top: Name, Play Video, Done Checkbox */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => onOpenVideo(exercise)}
                              className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center shrink-0 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
                              title="Watch real demonstration video"
                            >
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </button>

                            <div className="min-w-0">
                              <h4
                                className={`text-sm sm:text-base font-bold truncate ${
                                  exercise.completed
                                    ? isDark
                                      ? 'line-through text-neutral-400'
                                      : 'line-through text-neutral-500'
                                    : isDark
                                    ? 'text-white'
                                    : 'text-neutral-900'
                                }`}
                              >
                                {exercise.name}
                              </h4>
                              <button
                                type="button"
                                onClick={() => onOpenVideo(exercise)}
                                className="text-[11px] text-amber-500 hover:underline font-semibold cursor-pointer"
                              >
                                Watch Form Video & Cues
                              </button>
                            </div>
                          </div>

                          {/* Checkbox Done Button */}
                          <button
                            type="button"
                            onClick={() =>
                              onToggleExerciseDone(
                                activeDayWorkout.date,
                                exercise.id
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              exercise.completed
                                ? 'bg-emerald-500 text-black shadow-sm'
                                : isDark
                                ? 'bg-[#1d2230] text-neutral-300 hover:text-white border border-neutral-700'
                                : 'bg-white text-neutral-700 hover:text-black border border-neutral-300 shadow-sm'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{exercise.completed ? 'Done' : 'Mark Done'}</span>
                          </button>
                        </div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-neutral-800/40 text-center">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isDark ? 'bg-[#191d28]' : 'bg-white border border-neutral-200'
                            }`}
                          >
                            <span
                              className={`text-[9px] uppercase font-bold block ${
                                isDark ? 'text-neutral-400' : 'text-neutral-500'
                              }`}
                            >
                              Sets
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-amber-500">
                              {exercise.sets}
                            </span>
                          </div>

                          <div
                            className={`p-1.5 rounded-lg ${
                              isDark ? 'bg-[#191d28]' : 'bg-white border border-neutral-200'
                            }`}
                          >
                            <span
                              className={`text-[9px] uppercase font-bold block ${
                                isDark ? 'text-neutral-400' : 'text-neutral-500'
                              }`}
                            >
                              Reps
                            </span>
                            <span className="text-xs sm:text-sm font-bold">
                              {exercise.reps}
                            </span>
                          </div>

                          <div
                            className={`p-1.5 rounded-lg ${
                              isDark ? 'bg-[#191d28]' : 'bg-white border border-neutral-200'
                            }`}
                          >
                            <span
                              className={`text-[9px] uppercase font-bold block ${
                                isDark ? 'text-neutral-400' : 'text-neutral-500'
                              }`}
                            >
                              Load
                            </span>
                            <span className="text-xs sm:text-sm font-bold">
                              {exercise.intensity}
                            </span>
                          </div>

                          <div
                            className={`p-1.5 rounded-lg ${
                              isDark ? 'bg-[#191d28]' : 'bg-white border border-neutral-200'
                            }`}
                          >
                            <span
                              className={`text-[9px] uppercase font-bold block ${
                                isDark ? 'text-neutral-400' : 'text-neutral-500'
                              }`}
                            >
                              Rest
                            </span>
                            <span className="text-xs sm:text-sm font-bold">
                              {exercise.rest}
                            </span>
                          </div>
                        </div>

                        {exercise.notes && (
                          <p
                            className={`text-xs mt-2 text-left ${
                              isDark ? 'text-neutral-400' : 'text-neutral-600'
                            }`}
                          >
                            <span className="text-amber-500 font-semibold">
                              Coach Note:
                            </span>{' '}
                            {exercise.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={`text-center py-8 rounded-xl border border-dashed ${
                    isDark
                      ? 'border-neutral-800 text-neutral-500'
                      : 'border-neutral-300 text-neutral-400'
                  }`}
                >
                  <p className="text-xs sm:text-sm">
                    No scheduled exercises for this day. Enjoy your active recovery!
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {/* Tab 2: Homework Tab */}
        {activeTab === 'Homework' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold">
                Daily Recovery & Prescribed Homework
              </h3>
              <span className="text-xs text-amber-500 font-semibold">
                Phase 2 Prescription
              </span>
            </div>

            <div className="space-y-3">
              {client.homework.map((hw) => (
                <div
                  key={hw.id}
                  className={`p-4 rounded-xl border space-y-2 ${
                    isDark
                      ? 'bg-[#14171d] border-neutral-800'
                      : 'bg-slate-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{hw.title}</h4>
                    <span className="text-xs font-mono text-amber-500">
                      {hw.frequency}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between text-xs ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    <span>Adherence:</span>
                    <span className="font-semibold">
                      {hw.completedDays} / {hw.targetDays} days completed this week
                    </span>
                  </div>
                  <div
                    className={`w-full h-1.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-neutral-800' : 'bg-neutral-200'
                    }`}
                  >
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{
                        width: `${(hw.completedDays / hw.targetDays) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
