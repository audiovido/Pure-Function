import React, { useState } from 'react';
import { ChevronDown, Play, Check } from 'lucide-react';
import { PureFunctionLogo } from './PureFunctionLogo';
import { ClientProfile, DayWorkout, Exercise } from '../types';

interface ClientMonthCalendarProps {
  clients: ClientProfile[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  workouts: DayWorkout[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenVideo: (exercise: Exercise) => void;
  onToggleExerciseDone: (date: string, exerciseId: string) => void;
}

export const ClientMonthCalendar: React.FC<ClientMonthCalendarProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  workouts,
  selectedDate,
  onSelectDate,
  onOpenVideo,
  onToggleExerciseDone,
}) => {
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const activeDayWorkout =
    workouts.find((w) => w.date === selectedDate) ||
    workouts.find((w) => w.dayNumber === 8) ||
    workouts[7];

  // October 2026 starts on Thursday (day 1 is Thu).
  // Mon, Tue, Wed before Oct 1 are empty leading cells (3 blank cells).
  const leadBlanks = [null, null, null]; // Mon, Tue, Wed
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="w-full bg-[#0d0f13] text-slate-100 rounded-2xl border border-neutral-800 shadow-2xl p-3.5 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6">
      {/* Top Bar matching Image 2 Left: PURE FUNCTION | Alex Morgan ⌄ */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3.5 sm:pb-4 gap-2">
        <PureFunctionLogo variant="full" />

        {/* Client selector dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white px-3 py-2 rounded-lg bg-[#14171e] border border-neutral-800 transition-colors cursor-pointer"
          >
            <span className="truncate max-w-[120px] sm:max-w-none">{selectedClient.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          </button>

          {clientDropdownOpen && (
            <div className="absolute right-0 top-11 z-30 w-48 rounded-xl bg-[#161a23] border border-neutral-700 shadow-2xl py-1 text-xs text-neutral-200">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectClient(c.id);
                    setClientDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors flex items-center justify-between cursor-pointer ${
                    c.id === selectedClientId ? 'text-amber-400 font-bold' : ''
                  }`}
                >
                  <span>{c.name}</span>
                  {c.id === selectedClientId && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Month Header */}
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
          October 2026
        </h2>
      </div>

      {/* 7-Column Calendar Grid: Optimized for mobile */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center select-none">
        {/* Day name headers: Mon, Tue, Wed, Thu, Fri, Sat, Sun */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
          <div
            key={dayName}
            className="text-[10px] sm:text-xs font-semibold text-neutral-400 py-1"
          >
            {dayName}
          </div>
        ))}

        {/* 3 leading empty slots for October 2026 (Mon, Tue, Wed) */}
        {leadBlanks.map((_, i) => (
          <div
            key={`blank-${i}`}
            className="rounded-xl border border-transparent min-h-[46px] sm:min-h-[64px]"
          />
        ))}

        {/* 31 days of October */}
        {daysInMonth.map((dayNum) => {
          const dateStr = `2026-10-${dayNum < 10 ? '0' : ''}${dayNum}`;
          const dayData = workouts.find((w) => w.dayNumber === dayNum);
          const isSelected = selectedDate === dateStr || (!selectedDate && dayNum === 8);
          const hasWorkout = dayData && dayData.focus;

          return (
            <button
              key={dayNum}
              onClick={() => onSelectDate(dateStr)}
              className={`rounded-xl flex flex-col items-center justify-center p-1 sm:p-2 transition-all cursor-pointer min-h-[46px] sm:min-h-[64px] relative ${
                isSelected
                  ? 'border-2 border-amber-400 bg-[#161a22] shadow-lg shadow-amber-400/10'
                  : hasWorkout
                  ? 'border border-neutral-700/80 bg-[#14171d] hover:border-neutral-500'
                  : 'border border-neutral-800/60 bg-[#111318] hover:bg-[#161820] text-neutral-400'
              }`}
            >
              <span
                className={`text-xs sm:text-sm font-bold font-mono ${
                  isSelected ? 'text-amber-400' : 'text-white'
                }`}
              >
                {dayNum}
              </span>

              {/* Day focus tag: Clean on mobile */}
              {dayData?.focus && (
                <>
                  <span
                    className={`hidden sm:inline text-[9px] font-medium leading-tight mt-0.5 truncate max-w-full px-1 ${
                      isSelected ? 'text-amber-300 font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    {dayData.focus}
                  </span>
                  <span
                    className={`sm:hidden w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-amber-400' : 'bg-neutral-500'
                    }`}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Workout Section matching Image 2 */}
      <section className="space-y-3 sm:space-y-4 pt-4 border-t border-neutral-800">
        <div>
          <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">
            {activeDayWorkout.fullDayName}
          </h3>
          {activeDayWorkout.focus && (
            <p className="text-xs text-amber-400/90 mt-0.5 font-medium">
              {activeDayWorkout.focus}
            </p>
          )}
        </div>

        {/* Exercise Cards */}
        <div className="space-y-3">
          {activeDayWorkout.exercises.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#14171d] border border-neutral-800 text-neutral-400 text-xs">
              No active resistance exercises scheduled for this day.
            </div>
          ) : (
            activeDayWorkout.exercises.map((exercise) => {
              const isDone = !!exercise.completed;
              return (
                <div
                  key={exercise.id}
                  className={`p-3.5 sm:p-5 rounded-xl bg-[#14171d] border transition-all flex flex-col gap-3 group ${
                    isDone
                      ? 'border-emerald-500/40 bg-[#12161b]'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Top Line: Name + Play Button + Done Checkbox */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm sm:text-base font-bold transition-all ${
                          isDone ? 'text-neutral-400 line-through decoration-neutral-500' : 'text-white'
                        }`}
                      >
                        {exercise.name}
                      </h4>
                      {/* Play button opens video */}
                      <button
                        onClick={() => onOpenVideo(exercise)}
                        className="w-6 h-6 rounded-full border border-neutral-500 hover:border-amber-400 text-neutral-300 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer group-hover:scale-105"
                        title="Watch demonstration video"
                        aria-label={`Watch video demonstration for ${exercise.name}`}
                      >
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </button>
                    </div>

                    {/* Checkbox: [ ] Done */}
                    <button
                      type="button"
                      onClick={() =>
                        onToggleExerciseDone(activeDayWorkout.date, exercise.id)
                      }
                      className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-neutral-800/60 transition-colors cursor-pointer select-none"
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-amber-400 border-amber-400 text-black shadow-sm'
                            : 'border-neutral-600 bg-neutral-900 hover:border-neutral-400'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs font-semibold ${isDone ? 'text-amber-400' : 'text-neutral-300'}`}>
                        Done
                      </span>
                    </button>
                  </div>

                  {/* Exercise Stats Columns: 4 clean columns */}
                  <div className="grid grid-cols-4 gap-2 pt-0.5 text-xs bg-[#101318] p-2.5 rounded-lg border border-neutral-800/60">
                    <div>
                      <span className="block text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                        Sets
                      </span>
                      <span className="font-bold text-neutral-200 font-mono text-xs sm:text-sm">
                        {exercise.sets}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                        Reps
                      </span>
                      <span className="font-bold text-neutral-200 font-mono text-xs sm:text-sm">
                        {exercise.reps}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                        Intensity
                      </span>
                      <span className="font-bold text-neutral-200 font-mono text-xs sm:text-sm truncate">
                        {exercise.intensity}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                        Rest
                      </span>
                      <span className="font-bold text-neutral-200 font-mono text-xs sm:text-sm">
                        {exercise.rest}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {exercise.notes && (
                    <div className="text-[11px] sm:text-xs text-neutral-300 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-neutral-500 font-semibold shrink-0">Notes:</span>
                      <span>{exercise.notes}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
