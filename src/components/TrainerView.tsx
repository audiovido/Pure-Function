import React, { useState } from 'react';
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
import { getOrCreateDayWorkout } from '../utils/dateUtils';
import { CalendarStrip } from './CalendarStrip';

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
    field: 'sets' | 'reps' | 'intensity' | 'rest' | 'notes';
  } | null>(null);
  const [tempValue, setTempValue] = useState('');

  const selectedClient =
    clients.find((c) => c.id === selectedClientId) || clients[0];

  const activeDayWorkout = getOrCreateDayWorkout(workouts, selectedDate);

  const handleSave = () => {
    onSaveSession();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2400);
  };

  const startEditing = (
    exercise: Exercise,
    field: 'sets' | 'reps' | 'intensity' | 'rest' | 'notes'
  ) => {
    setEditingField({ exerciseId: exercise.id, field });
    setTempValue(String(exercise[field] || ''));
  };

  const saveEditing = (exerciseId: string) => {
    if (editingField && onUpdateExerciseInline) {
      if (editingField.field === 'sets') {
        const num = parseInt(tempValue, 10);
        onUpdateExerciseInline(selectedDate, exerciseId, {
          sets: isNaN(num) || num < 1 ? 1 : num,
        });
      } else {
        onUpdateExerciseInline(selectedDate, exerciseId, {
          [editingField.field]: tempValue,
        });
      }
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
      {/* 1. CALENDAR STRIP: Top Date Section (Identical in both Trainer & Client views) */}
      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        workouts={workouts}
        isDark={isDark}
      />

      {/* 2. CLIENT BAR: Below the Calendar Strip */}
      <section className="pt-0.5 pb-1 border-b border-neutral-800/40">
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
      <section className="space-y-3">
        {/* Action Bar - Aligned perfectly to the left with balanced symmetry and spacing */}
        <div className="flex items-center justify-start py-0.5">
          <button
            type="button"
            onClick={onOpenLibrary}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Exercise</span>
          </button>
        </div>

        {/* Exercise Cards */}
        {activeDayWorkout?.exercises && activeDayWorkout.exercises.length > 0 ? (
          <div className="space-y-2.5">
            {activeDayWorkout.exercises.map((exercise, index) => {
              return (
                <div
                  key={exercise.id}
                  className={`rounded-xl border transition-all p-3 sm:p-3.5 relative ${
                    isDark
                      ? 'bg-[#141822]/80 hover:bg-[#171c28] border-neutral-800/90 shadow-sm'
                      : 'bg-slate-50/80 hover:bg-white border-neutral-200 shadow-xs'
                  }`}
                >
                  {/* Row 1: Exercise Name on Left, All Buttons (Play, Edit, Copy, Delete) on Right in ONE SINGLE LINE */}
                  <div className="flex items-center justify-between gap-2.5">
                    <h4
                      className={`text-sm sm:text-base font-bold leading-tight truncate min-w-0 ${
                        isDark ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      {exercise.name}
                    </h4>

                    {/* All action buttons on one neat horizontal line */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Real Video Demonstration Button: yellow button with black play icon */}
                      <button
                        type="button"
                        onClick={() => onOpenVideo(exercise)}
                        title="Watch video demo"
                        className="w-7 h-7 rounded-lg bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shrink-0 shadow-xs transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </button>

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

                  {/* Row 2: Four metrics boxes (Sets, Reps, Load, Rest) - identical to Client View styling */}
                  <div className="grid grid-cols-4 gap-2 mt-2.5 pt-2.5 border-t border-neutral-800/40 text-center">
                    {/* SETS */}
                    <div
                      onClick={() => startEditing(exercise, 'sets')}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                        isDark
                          ? 'bg-[#191d28] hover:bg-[#202534] border border-neutral-800 hover:border-amber-400/40'
                          : 'bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-amber-400/60 shadow-xs'
                      }`}
                      title="Click to edit sets"
                    >
                      <span
                        className={`text-[9px] uppercase font-bold block ${
                          isDark ? 'text-neutral-400' : 'text-neutral-500'
                        }`}
                      >
                        Sets
                      </span>
                      {editingField?.exerciseId === exercise.id &&
                      editingField?.field === 'sets' ? (
                        <input
                          autoFocus
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => saveEditing(exercise.id)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && saveEditing(exercise.id)
                          }
                          className="w-full text-xs sm:text-sm font-bold bg-transparent outline-none text-amber-500 text-center"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-extrabold text-amber-500 block">
                          {exercise.sets || 3}
                        </span>
                      )}
                    </div>

                    {/* REPS */}
                    <div
                      onClick={() => startEditing(exercise, 'reps')}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                        isDark
                          ? 'bg-[#191d28] hover:bg-[#202534] border border-neutral-800 hover:border-amber-400/40'
                          : 'bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-amber-400/60 shadow-xs'
                      }`}
                      title="Click to edit reps"
                    >
                      <span
                        className={`text-[9px] uppercase font-bold block ${
                          isDark ? 'text-neutral-400' : 'text-neutral-500'
                        }`}
                      >
                        Reps
                      </span>
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
                          className="w-full text-xs sm:text-sm font-bold bg-transparent outline-none text-amber-500 text-center"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-bold block text-inherit">
                          {exercise.reps || '8'}
                        </span>
                      )}
                    </div>

                    {/* INTENSITY / LOAD */}
                    <div
                      onClick={() => startEditing(exercise, 'intensity')}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                        isDark
                          ? 'bg-[#191d28] hover:bg-[#202534] border border-neutral-800 hover:border-amber-400/40'
                          : 'bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-amber-400/60 shadow-xs'
                      }`}
                      title="Click to edit load"
                    >
                      <span
                        className={`text-[9px] uppercase font-bold block ${
                          isDark ? 'text-neutral-400' : 'text-neutral-500'
                        }`}
                      >
                        Load
                      </span>
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
                          className="w-full text-xs sm:text-sm font-bold bg-transparent outline-none text-amber-500 text-center"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-bold block text-inherit">
                          {exercise.intensity || '35 lb'}
                        </span>
                      )}
                    </div>

                    {/* REST */}
                    <div
                      onClick={() => startEditing(exercise, 'rest')}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                        isDark
                          ? 'bg-[#191d28] hover:bg-[#202534] border border-neutral-800 hover:border-amber-400/40'
                          : 'bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-amber-400/60 shadow-xs'
                      }`}
                      title="Click to edit rest"
                    >
                      <span
                        className={`text-[9px] uppercase font-bold block ${
                          isDark ? 'text-neutral-400' : 'text-neutral-500'
                        }`}
                      >
                        Rest
                      </span>
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
                          className="w-full text-xs sm:text-sm font-bold bg-transparent outline-none text-amber-500 text-center"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-bold block text-inherit">
                          {exercise.rest || '60s'}
                        </span>
                      )}
                    </div>
                  </div>
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
