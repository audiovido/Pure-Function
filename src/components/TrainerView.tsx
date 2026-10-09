import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Calendar as CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ClipboardList,
  Activity,
  Layers,
  Sparkles,
  Minus,
  Clock,
  Dumbbell,
  Repeat,
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

interface TrainerViewProps {
  clients: ClientProfile[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onOpenClientManager: () => void;
  workouts: DayWorkout[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenVideo: (exercise: Exercise) => void;
  onAddExerciseClick?: () => void;
  onEditExerciseClick: (exercise: Exercise) => void;
  onUpdateExerciseInline?: (
    date: string,
    exerciseId: string,
    updates: Partial<Exercise>
  ) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onDuplicateExercise: (exercise: Exercise) => void;
  onSaveSession: () => void;
  onOpenAssessments: () => void;
  onOpenLibrary: () => void;
  onOpenPrograms: () => void;
  theme?: ThemeMode;
}

export const TrainerView: React.FC<TrainerViewProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onOpenClientManager,
  workouts,
  selectedDate,
  onSelectDate,
  onOpenVideo,
  onAddExerciseClick,
  onEditExerciseClick,
  onUpdateExerciseInline,
  onDeleteExercise,
  onDuplicateExercise,
  onSaveSession,
  onOpenAssessments,
  onOpenLibrary,
  onOpenPrograms,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [openMenuExerciseId, setOpenMenuExerciseId] = useState<string | null>(
    null
  );
  const [saveToast, setSaveToast] = useState(false);
  const [editingField, setEditingField] = useState<{
    exerciseId: string;
    field: 'reps' | 'intensity' | 'rest' | 'notes';
  } | null>(null);
  const [tempValue, setTempValue] = useState('');

  const selectedClient =
    clients.find((c) => c.id === selectedClientId) || clients[0];

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

  const handleSave = () => {
    onSaveSession();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2400);
  };

  const handleQuickSetChange = (exercise: Exercise, delta: number) => {
    const newSets = Math.max(1, (exercise.sets || 3) + delta);
    if (onUpdateExerciseInline) {
      onUpdateExerciseInline(selectedDate, exercise.id, { sets: newSets });
    }
  };

  const startEditing = (
    exercise: Exercise,
    field: 'reps' | 'intensity' | 'rest' | 'notes'
  ) => {
    setEditingField({ exerciseId: exercise.id, field });
    setTempValue(String(exercise[field] || ''));
  };

  const saveEditing = (exerciseId: string) => {
    if (editingField && onUpdateExerciseInline) {
      onUpdateExerciseInline(selectedDate, exerciseId, {
        [editingField.field]: tempValue,
      });
    }
    setEditingField(null);
  };

  return (
    <div
      className={`w-full rounded-2xl transition-colors duration-200 shadow-xl overflow-hidden flex flex-col gap-5 p-3.5 sm:p-6 md:p-7 border ${
        isDark
          ? 'bg-[#0f1117]/95 border-neutral-800/90 text-slate-100'
          : 'bg-white/95 border-neutral-200/90 text-neutral-900'
      }`}
    >
      {/* 1. INTERACTIVE WEEKLY CALENDAR STRIP (Directly Under Header) */}
      <section className="space-y-2 pb-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Week title & Navigation controls */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-500" />
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

      {/* 2. CLIENT BAR: Below the Calendar Strip */}
      <section className="pt-1 pb-2 border-b border-neutral-800/40">
        <div
          onClick={onOpenClientManager}
          className={`group flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
            isDark
              ? 'bg-[#141822]/90 hover:bg-[#191f2c] border-neutral-800 hover:border-amber-400/50 shadow-sm'
              : 'bg-slate-50/90 hover:bg-neutral-100 border-neutral-200 hover:border-amber-400/60 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Real Avatar Photo with Fallback */}
            {selectedClient?.avatarUrl ? (
              <img
                src={selectedClient.avatarUrl}
                alt={selectedClient.name}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shrink-0 border border-neutral-700/60 shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              style={{ display: selectedClient?.avatarUrl ? 'none' : 'flex' }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400 text-black font-extrabold items-center justify-center text-sm shadow-sm shrink-0"
            >
              {selectedClient?.name
                ?.split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'PF'}
            </div>

            {/* Name on line 1, Age on line 2 directly below it */}
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold truncate">
                {selectedClient?.name}
              </div>
              <div
                className={`text-xs mt-0.5 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                Age: {selectedClient?.age || 28}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-4 shrink-0">
            <span className="text-xs font-semibold text-amber-500 group-hover:underline">
              Clients ({clients.length})
            </span>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </section>

      {/* 3. SELECTED DAY PROGRAM DESIGNER */}
      <section className="space-y-4 pt-2">
        {/* Day Header & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
          <div>
            <h2 className="text-base sm:text-xl font-extrabold tracking-tight flex items-center gap-2 flex-wrap">
              <span>{activeDayWorkout.fullDayName}</span>
              {selectedDate === todayStr && (
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-black uppercase tracking-wider bg-amber-400 text-black shadow-sm">
                  Today
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onOpenLibrary}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exercise</span>
            </button>
          </div>
        </div>

        {/* Exercise Cards */}
        {activeDayWorkout?.exercises && activeDayWorkout.exercises.length > 0 ? (
          <div className="space-y-3">
            {activeDayWorkout.exercises.map((exercise, index) => {
              return (
                <div
                  key={exercise.id}
                  className={`rounded-2xl border transition-all p-3.5 sm:p-5 relative ${
                    isDark
                      ? 'bg-[#141822]/80 hover:bg-[#171c28] border-neutral-800/90 shadow-lg'
                      : 'bg-slate-50/80 hover:bg-white border-neutral-200 shadow-sm'
                  }`}
                >
                  {/* Row 1: Exercise Name + Video demo button inline to the left + Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
                      <h4
                        className={`text-sm sm:text-base font-bold leading-tight ${
                          isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        {exercise.name}
                      </h4>

                      {exercise.category && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            isDark
                              ? 'bg-neutral-800 text-neutral-400'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {exercise.category}
                        </span>
                      )}

                      {/* Real Video Demonstration Button Inline */}
                      <button
                        type="button"
                        onClick={() => onOpenVideo(exercise)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs text-amber-500 hover:text-amber-400 font-semibold cursor-pointer group bg-amber-400/10 hover:bg-amber-400/20 transition-colors"
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                          <Play className="w-2 h-2 fill-current ml-0.5" />
                        </div>
                        <span>Real Video Demo</span>
                      </button>
                    </div>

                    {/* Actions menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditExerciseClick(exercise)}
                        title="Edit movement details"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateExercise(exercise)}
                        title="Duplicate movement"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
                        }`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteExercise(exercise.id)}
                        title="Delete movement"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'text-neutral-400 hover:text-red-400 hover:bg-neutral-800'
                            : 'text-neutral-500 hover:text-red-600 hover:bg-neutral-200'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Coach Designer & Modifiers (Sets, Reps, Intensity, Rest) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 pt-3 border-t border-neutral-800/40">
                    {/* SETS with Large Thumb-Friendly Circular Steppers */}
                    <div
                      className={`p-2.5 sm:p-3 rounded-xl border flex flex-col justify-between ${
                        isDark
                          ? 'bg-[#181c26]/90 border-neutral-800'
                          : 'bg-white border-neutral-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            isDark ? 'text-neutral-400' : 'text-neutral-500'
                          }`}
                        >
                          Sets
                        </span>
                        {/* Circular Thumb Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickSetChange(exercise, -1)}
                            title="Decrease sets"
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs ${
                              isDark
                                ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 hover:text-white'
                                : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700 hover:text-black'
                            }`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickSetChange(exercise, 1)}
                            title="Increase sets"
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs ${
                              isDark
                                ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 hover:text-white'
                                : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700 hover:text-black'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg font-black text-amber-500 mt-1">
                        {exercise.sets || 3}
                      </span>
                    </div>

                    {/* REPS (Tap to edit with thumb-friendly affordance) */}
                    <div
                      onClick={() => startEditing(exercise, 'reps')}
                      className={`p-2.5 sm:p-3 rounded-xl border border-dashed transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-[#181c26]/90 border-neutral-700/80 hover:border-amber-400'
                          : 'bg-white border-neutral-300 hover:border-amber-500 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            isDark ? 'text-neutral-400' : 'text-neutral-500'
                          }`}
                        >
                          Reps
                        </span>
                        <Edit2 className="w-3 h-3 text-neutral-500 group-hover:text-amber-500 transition-colors" />
                      </div>
                      {editingField?.exerciseId === exercise.id &&
                      editingField?.field === 'reps' ? (
                        <input
                          autoFocus
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => saveEditing(exercise.id)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && saveEditing(exercise.id)
                          }
                          className="w-full text-sm font-bold bg-transparent outline-none text-amber-500 mt-1"
                        />
                      ) : (
                        <span className="text-sm sm:text-base font-bold mt-1 text-inherit">
                          {exercise.reps || '8'}
                        </span>
                      )}
                    </div>

                    {/* INTENSITY / LOAD (Tap to edit) */}
                    <div
                      onClick={() => startEditing(exercise, 'intensity')}
                      className={`p-2.5 sm:p-3 rounded-xl border border-dashed transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-[#181c26]/90 border-neutral-700/80 hover:border-amber-400'
                          : 'bg-white border-neutral-300 hover:border-amber-500 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            isDark ? 'text-neutral-400' : 'text-neutral-500'
                          }`}
                        >
                          Intensity / Load
                        </span>
                        <Edit2 className="w-3 h-3 text-neutral-500 group-hover:text-amber-500 transition-colors" />
                      </div>
                      {editingField?.exerciseId === exercise.id &&
                      editingField?.field === 'intensity' ? (
                        <input
                          autoFocus
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => saveEditing(exercise.id)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && saveEditing(exercise.id)
                          }
                          className="w-full text-sm font-bold bg-transparent outline-none text-amber-500 mt-1"
                        />
                      ) : (
                        <span className="text-sm sm:text-base font-bold mt-1 text-inherit">
                          {exercise.intensity || '35 lb'}
                        </span>
                      )}
                    </div>

                    {/* REST (Tap to edit) */}
                    <div
                      onClick={() => startEditing(exercise, 'rest')}
                      className={`p-2.5 sm:p-3 rounded-xl border border-dashed transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-[#181c26]/90 border-neutral-700/80 hover:border-amber-400'
                          : 'bg-white border-neutral-300 hover:border-amber-500 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            isDark ? 'text-neutral-400' : 'text-neutral-500'
                          }`}
                        >
                          Rest
                        </span>
                        <Edit2 className="w-3 h-3 text-neutral-500 group-hover:text-amber-500 transition-colors" />
                      </div>
                      {editingField?.exerciseId === exercise.id &&
                      editingField?.field === 'rest' ? (
                        <input
                          autoFocus
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => saveEditing(exercise.id)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && saveEditing(exercise.id)
                          }
                          className="w-full text-sm font-bold bg-transparent outline-none text-amber-500 mt-1"
                        />
                      ) : (
                        <span className="text-sm sm:text-base font-bold mt-1 text-inherit">
                          {exercise.rest || '60 sec'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes & Cues Row */}
                  {exercise.notes && (
                    <div
                      className={`mt-2.5 pt-2 border-t text-xs flex items-start gap-2 ${
                        isDark
                          ? 'border-neutral-800/40 text-neutral-400'
                          : 'border-neutral-200 text-neutral-600'
                      }`}
                    >
                      <span className="text-amber-500 font-semibold shrink-0">
                        Coach Note:
                      </span>
                      <span>{exercise.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`text-center py-12 rounded-2xl border border-dashed p-6 ${
              isDark
                ? 'border-neutral-800 bg-[#12151d]/50 text-neutral-400'
                : 'border-neutral-300 bg-slate-50/50 text-neutral-500'
            }`}
          >
            <Dumbbell className="w-8 h-8 text-neutral-500 mx-auto mb-2 opacity-50" />
            <h4 className="text-base font-bold">Rest / Unscheduled Day</h4>
            <p className="text-xs mt-1 max-w-sm mx-auto">
              No prescribed exercises for this date. Click below to add a movement
              or build from the movement library.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={onOpenLibrary}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Browse Movement Library</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-400 text-black px-4 py-2.5 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Workout session saved successfully!</span>
        </div>
      )}
    </div>
  );
};
