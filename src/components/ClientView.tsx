import React from 'react';
import { Play } from 'lucide-react';
import { ClientProfile, DayWorkout, Exercise, ThemeMode } from '../types';
import { getOrCreateDayWorkout } from '../utils/dateUtils';
import { CalendarStrip } from './CalendarStrip';

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
  const activeDayWorkout = getOrCreateDayWorkout(workouts, selectedDate);

  return (
    <div
      className={`w-full rounded-2xl transition-colors duration-200 shadow-xl overflow-hidden min-h-[580px] flex flex-col justify-between p-3.5 sm:p-6 md:p-7 border ${
        isDark
          ? 'bg-[#0f1117]/95 border-neutral-800/90 text-slate-100'
          : 'bg-white/95 border-neutral-200/90 text-neutral-900'
      }`}
    >
      <div className="space-y-5 sm:space-y-6">
        {/* Top Header: Client Profile (Clean without age/coach details) */}
        <section className="pt-1 pb-1">
          <div className="flex items-center gap-3">
            {client.avatarUrl ? (
              <img
                src={client.avatarUrl}
                alt={client.name}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shrink-0 border border-neutral-700/60 shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              style={{ display: client.avatarUrl ? 'none' : 'flex' }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400 text-black font-extrabold items-center justify-center text-sm shadow-sm shrink-0"
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
            </div>
          </div>
        </section>

        {/* Calendar Strip (Identical in both Trainer & Client views) */}
        <CalendarStrip
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          workouts={workouts}
          isDark={isDark}
        />

            {/* Selected Day Workout Section */}
            <section className="space-y-3">
              {/* Exercises List */}
              {activeDayWorkout.exercises.length > 0 ? (
                <div className="space-y-3">
                  {activeDayWorkout.exercises.map((exercise) => {
                    return (
                      <div
                        key={exercise.id}
                        className={`rounded-xl border transition-all p-3 sm:p-3.5 ${
                          isDark
                            ? 'bg-[#14171f]/80 border-neutral-800'
                            : 'bg-slate-50/80 border-neutral-200 shadow-xs'
                        }`}
                      >
                        {/* Top: Name & Yellow Play Video button */}
                        <div className="flex items-center justify-between gap-2.5">
                          <h4
                            className={`text-sm sm:text-base font-bold truncate ${
                              isDark ? 'text-white' : 'text-neutral-900'
                            }`}
                          >
                            {exercise.name}
                          </h4>

                          {/* Yellow Play Video Button */}
                          <button
                            type="button"
                            onClick={() => onOpenVideo(exercise)}
                            title="Watch video demo"
                            className="w-7 h-7 rounded-lg bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shrink-0 shadow-xs transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </button>
                        </div>

                        {/* Four metrics: Sets, Reps, Load, Rest - minimal, compact, space-saving */}
                        <div className="grid grid-cols-4 gap-2 mt-2.5 pt-2.5 border-t border-neutral-800/40 text-center">
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
                            <span className="text-xs sm:text-sm font-extrabold text-amber-500">
                              {exercise.sets || 3}
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
                              {exercise.reps || '8'}
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
                              {exercise.intensity || '35 lb'}
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
                              {exercise.rest || '60s'}
                            </span>
                          </div>
                        </div>
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
      </div>
    </div>
  );
};
