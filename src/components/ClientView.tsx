import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Calendar,
  Check,
  Play,
  Dumbbell,
  Flame,
  UserCircle,
  Camera,
  Mic,
  ArrowUp,
  ClipboardCheck,
} from 'lucide-react';
import {
  ClientHomework,
  ClientProfile,
  DailyNutritionEntry,
  DayWorkout,
  DirectMessage,
  Exercise,
  ThemeMode,
} from '../types';
import { getOrCreateDayWorkout } from '../utils/dateUtils';

export type ClientBottomTab =
  | 'today'
  | 'workouts'
  | 'habits'
  | 'messages'
  | 'account';

interface ClientViewProps {
  client: ClientProfile;
  workouts: DayWorkout[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleExerciseDone: (date: string, exerciseId: string) => void;
  onLogExerciseResult?: (
    date: string,
    exerciseId: string,
    updates: Partial<Exercise>
  ) => void;
  onCompleteSession?: (
    date: string,
    summary: {
      sessionCompleted: boolean;
      sessionDurationMinutes?: number;
      sessionRpe?: number;
      clientSessionFeedback?: string;
    }
  ) => void;
  onOpenVideo: (exercise: Exercise) => void;
  onOpenAssessments: () => void;
  dailyNutrition?: DailyNutritionEntry;
  onUpdateDailyNutrition?: (updated: DailyNutritionEntry) => void;
  onUpdateHomework?: (homework: ClientHomework[]) => void;
  onUpdateClientAvatar?: (avatarUrl: string) => void;
  messages?: DirectMessage[];
  onSendMessage?: (
    text: string,
    options?: { videoUrl?: string; exerciseTag?: string }
  ) => void;
  onSignOut?: () => void;
  activeBottomTab?: ClientBottomTab;
  onBottomTabChange?: (tab: ClientBottomTab) => void;
  theme?: ThemeMode;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const ClientView: React.FC<ClientViewProps> = ({
  client,
  workouts,
  selectedDate,
  onSelectDate,
  onToggleExerciseDone,
  onCompleteSession,
  onOpenVideo,
  dailyNutrition,
  onUpdateDailyNutrition,
  onUpdateHomework,
  onUpdateClientAvatar,
  messages = [],
  onSendMessage,
  onSignOut,
  activeBottomTab = 'today',
  onBottomTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<ClientBottomTab>('today');
  const bottomTab = onBottomTabChange ? activeBottomTab : internalTab;

  const [openedFromSchedule, setOpenedFromSchedule] = useState(false);

  // Workout comment box
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [workoutComment, setWorkoutComment] = useState('');

  // Chat input state
  const [chatText, setChatText] = useState('');

  // Hidden file input for client profile photo upload
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateClientAvatar) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;

      // Resize/compress to 256x256 square so it stores cleanly in localStorage
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onUpdateClientAvatar(compressedDataUrl);
        } else {
          onUpdateClientAvatar(result);
        }
      };
      img.onerror = () => {
        onUpdateClientAvatar(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const activeDayWorkout = getOrCreateDayWorkout(workouts, selectedDate);

  const handleSelectBottomTab = (tab: ClientBottomTab) => {
    if (onBottomTabChange) {
      onBottomTabChange(tab);
    } else {
      setInternalTab(tab);
    }
    setOpenedFromSchedule(false);
    setIsCommentOpen(false);
  };

  const clientWorkoutDays = React.useMemo(() => {
    const daysWithExercises = workouts.filter((d) => d.exercises.length > 0);
    return [...daysWithExercises]
      .filter((d) => d.date >= '2026-10-15' && d.date <= '2026-10-25')
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [workouts]);

  const getWorkoutStatus = (
    day: DayWorkout
  ): 'Completed' | 'Pending' | 'Missed' => {
    if (
      day.sessionCompleted ||
      (day.exercises.length > 0 && day.exercises.every((e) => e.completed))
    ) {
      return 'Completed';
    }
    if (day.date >= '2026-10-21') {
      return 'Pending';
    }
    return 'Missed';
  };

  const formatFullDateLabel = (dateStr: string): string => {
    if (dateStr === '2026-10-21') return 'Today';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const dayNum = parseInt(parts[2], 10);
    return `Oct ${dayNum}, ${parts[0]}`;
  };

  const handleCompleteWorkout = () => {
    const isCurrentlyCompleted =
      getWorkoutStatus(activeDayWorkout) === 'Completed';
    if (onCompleteSession) {
      onCompleteSession(selectedDate, {
        sessionCompleted: !isCurrentlyCompleted,
        sessionDurationMinutes: 45,
        sessionRpe: 8,
      });
    } else {
      activeDayWorkout.exercises.forEach((ex) => {
        if (ex.completed === isCurrentlyCompleted) {
          onToggleExerciseDone(selectedDate, ex.id);
        }
      });
    }
  };

  const handleSaveWorkoutComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutComment.trim()) return;
    if (onSendMessage) {
      onSendMessage(workoutComment.trim());
    }
    setWorkoutComment('');
    setIsCommentOpen(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !onSendMessage) return;
    onSendMessage(chatText.trim());
    setChatText('');
  };

  const toggleHabitCompleted = (habitId: string) => {
    if (!onUpdateHomework) return;
    const updated = client.homework.map((h) => {
      if (h.id !== habitId) return h;
      const isDone = h.completedDays >= h.targetDays;
      return {
        ...h,
        completedDays: isDone
          ? Math.max(0, h.targetDays - 1)
          : h.targetDays,
      };
    });
    onUpdateHomework(updated);
  };

  const isWorkoutCompleted = getWorkoutStatus(activeDayWorkout) === 'Completed';

  return (
    <div className="w-full max-w-2xl mx-auto flex-1 min-h-0 flex flex-col bg-[#f4f5f7] rounded-3xl overflow-hidden border border-neutral-200/90 shadow-sm relative">
      {/* =========================================================
          TAB 1: TODAY'S WORKOUT (Read-Only Trainer Prescription)
         ========================================================= */}
      {bottomTab === 'today' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          {/* Top Amber Bar with Clean Circular White Avatar */}
          <div className="bg-amber-400 px-4 py-3.5 text-black shrink-0">
            <div className="flex items-center justify-between gap-2">
              {openedFromSchedule ? (
                <button
                  type="button"
                  onClick={() => handleSelectBottomTab('workouts')}
                  className="p-1 -ml-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
                </button>
              ) : (
                <div className="w-6 shrink-0" />
              )}

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white text-neutral-900 font-bold text-xs flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                  {client.avatarUrl ? (
                    <img
                      src={client.avatarUrl}
                      alt={client.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(client.name)
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-bold text-sm sm:text-base text-black truncate">
                    {client.name}
                  </div>
                  <div className="text-[11px] font-medium text-neutral-900/80 truncate">
                    {activeDayWorkout.focus || 'Workout'} ·{' '}
                    {getWorkoutStatus(activeDayWorkout)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectBottomTab('messages')}
                className="p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
                aria-label="Messages"
              >
                <MessageCircle className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Clean Exercise Cards (Strictly What Trainer Assigned — No Edit Button) */}
          <div className="flex-1 min-h-0 p-4 space-y-3 overflow-y-auto">
            {activeDayWorkout.exercises.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-neutral-200/70 my-6">
                <p className="text-sm font-medium text-neutral-500">
                  Rest Day
                </p>
              </div>
            ) : (
              activeDayWorkout.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-white rounded-3xl p-4 shadow-2xs border border-neutral-200/60 overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        onToggleExerciseDone(selectedDate, ex.id)
                      }
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        ex.completed
                          ? 'bg-amber-400 text-black'
                          : 'bg-neutral-200/80 text-neutral-400 hover:bg-neutral-300'
                      }`}
                      title="Complete"
                    >
                      <Check className="w-4 h-4 stroke-[2.6]" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onOpenVideo(ex)}
                        className="w-full font-bold text-sm sm:text-base text-neutral-900 hover:text-amber-600 transition-colors text-left flex items-center gap-1.5 cursor-pointer min-w-0"
                      >
                        <span className="truncate">{ex.name}</span>
                        <Play className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      </button>
                      <div className="text-xs text-neutral-500 mt-0.5 truncate">
                        {ex.sets} sets × {ex.reps}
                        {ex.intensity ? ` · ${ex.intensity}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Minimal Comment Input */}
            {isCommentOpen && (
              <form
                onSubmit={handleSaveWorkoutComment}
                className="bg-white rounded-3xl p-3.5 border border-neutral-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={workoutComment}
                  onChange={(e) => setWorkoutComment(e.target.value)}
                  placeholder="Add comment..."
                  autoFocus
                  className="flex-1 min-w-0 px-3.5 py-2 rounded-full border border-neutral-200 text-xs outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-bold cursor-pointer shrink-0"
                >
                  Send
                </button>
              </form>
            )}
          </div>

          {/* Bottom Action Pills — Flush at the bottom right above the navigation bar */}
          <div className="mt-auto shrink-0 bg-white border-t border-neutral-200/80 p-3.5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsCommentOpen((prev) => !prev)}
              className="py-2.5 px-4 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold text-xs sm:text-sm transition-colors cursor-pointer truncate"
            >
              Add Comment
            </button>
            <button
              type="button"
              onClick={handleCompleteWorkout}
              className={`py-2.5 px-4 rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer truncate ${
                isWorkoutCompleted
                  ? 'bg-amber-400 text-black'
                  : 'bg-[#252a36] hover:bg-[#1b1f29] text-amber-400'
              }`}
            >
              {isWorkoutCompleted ? 'Completed' : 'Finish Workout'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: WORKOUTS SCHEDULE
         ========================================================= */}
      {bottomTab === 'workouts' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <div className="bg-white p-3.5 border-b border-neutral-200/80 shrink-0">
            <div className="border border-neutral-200 rounded-full px-4 py-2.5 flex items-center justify-between bg-white">
              <span className="text-xs sm:text-sm font-medium text-neutral-700 truncate">
                Oct 15 - Oct 22, 2026
              </span>
              <Calendar className="w-4 h-4 text-neutral-600 shrink-0" />
            </div>
          </div>

          <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto">
            {clientWorkoutDays.map((day) => {
              const status = getWorkoutStatus(day);
              const isCompleted = status === 'Completed';
              return (
                <div key={day.date} className="space-y-2">
                  <div className="text-center text-xs font-bold text-neutral-500">
                    {formatFullDateLabel(day.date)}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDate(day.date);
                      setOpenedFromSchedule(true);
                      if (onBottomTabChange) {
                        onBottomTabChange('today');
                      } else {
                        setInternalTab('today');
                      }
                    }}
                    className="w-full bg-white rounded-3xl p-4 shadow-2xs border border-neutral-200/60 flex items-center justify-between gap-3 hover:border-neutral-300 transition-all cursor-pointer text-left overflow-hidden"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-amber-400 text-black'
                            : 'bg-neutral-200/80 text-neutral-400'
                        }`}
                      >
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm sm:text-base text-neutral-900 truncate">
                          {day.focus || 'Workout'}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5 truncate">
                          {status}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-300 stroke-[2.2] shrink-0" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: DAILY HABITS & NUTRITION
         ========================================================= */}
      {bottomTab === 'habits' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] p-4 space-y-5 overflow-y-auto">
          <div className="space-y-2">
            <div className="text-center text-xs font-bold text-neutral-500">
              Daily Habits
            </div>
            <div className="bg-white rounded-3xl shadow-2xs border border-neutral-200/70 divide-y divide-neutral-200/70 overflow-hidden">
              {client.homework.map((habit) => {
                const isHabitDone = habit.completedDays >= habit.targetDays;
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => toggleHabitCompleted(habit.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-neutral-50 transition-colors cursor-pointer overflow-hidden"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-neutral-900 truncate">
                        {habit.title}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5 truncate">
                        {habit.completedDays}/{habit.targetDays} days
                      </div>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isHabitDone
                          ? 'bg-amber-400 text-black'
                          : 'bg-neutral-200/80 text-neutral-400'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-center text-xs font-bold text-neutral-500">
              Nutrition
            </div>
            <div className="bg-white rounded-3xl p-4 shadow-2xs border border-neutral-200/70 space-y-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-[#f4f5f7] overflow-hidden">
                  <div className="text-[10px] font-bold uppercase text-neutral-500 truncate">
                    Calories
                  </div>
                  <div className="text-sm sm:text-base font-black text-neutral-900 mt-0.5 truncate">
                    {dailyNutrition?.calories ??
                      client.macroTargets?.calories ??
                      2400}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#f4f5f7] overflow-hidden">
                  <div className="text-[10px] font-bold uppercase text-neutral-500 truncate">
                    Protein
                  </div>
                  <div className="text-sm sm:text-base font-black text-neutral-900 mt-0.5 truncate">
                    {dailyNutrition?.protein ??
                      client.macroTargets?.protein ??
                      180}
                    g
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#f4f5f7] overflow-hidden">
                  <div className="text-[10px] font-bold uppercase text-neutral-500 truncate">
                    Carbs
                  </div>
                  <div className="text-sm sm:text-base font-black text-neutral-900 mt-0.5 truncate">
                    {dailyNutrition?.carbs ?? client.macroTargets?.carbs ?? 240}
                    g
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#f4f5f7] overflow-hidden">
                  <div className="text-[10px] font-bold uppercase text-neutral-500 truncate">
                    Fat
                  </div>
                  <div className="text-sm sm:text-base font-black text-neutral-900 mt-0.5 truncate">
                    {dailyNutrition?.fat ?? client.macroTargets?.fat ?? 70}g
                  </div>
                </div>
              </div>

              {dailyNutrition && onUpdateDailyNutrition && (
                <button
                  type="button"
                  onClick={() => {
                    const isCompleted = dailyNutrition.notes === 'Completed';
                    onUpdateDailyNutrition({
                      ...dailyNutrition,
                      notes: isCompleted ? '' : 'Completed',
                    });
                  }}
                  className={`w-full py-2.5 rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer truncate ${
                    dailyNutrition.notes === 'Completed'
                      ? 'bg-amber-400 text-black'
                      : 'bg-[#252a36] text-amber-400'
                  }`}
                >
                  {dailyNutrition.notes === 'Completed'
                    ? 'Completed'
                    : 'Complete Nutrition'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: DIRECT CHAT WITH COACH
         ========================================================= */}
      {bottomTab === 'messages' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <div className="bg-amber-400 px-4 py-3.5 flex items-center justify-center text-black shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-neutral-900 font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {getInitials(client.coach || 'Coach')}
              </div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-black truncate">
                {client.coach}
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-4 overflow-y-auto flex flex-col justify-center">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center py-10">
                <p className="text-neutral-400 font-bold text-sm">
                  No messages
                </p>
              </div>
            ) : (
              <div className="space-y-3 my-auto">
                {messages.map((msg) => {
                  const isMe = msg.senderRole === 'client';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm break-words ${
                          isMe
                            ? 'bg-[#252a36] text-amber-400 rounded-br-xs'
                            : 'bg-white text-neutral-900 border border-neutral-200/80 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        <p className="leading-relaxed break-words">
                          {msg.text}
                        </p>
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSendChat}
            className="mt-auto shrink-0 bg-white border-t border-neutral-200 px-3.5 py-3 flex items-center gap-2.5"
          >
            <button
              type="button"
              onClick={() => {
                if (onSendMessage) {
                  onSendMessage('Video uploaded.');
                }
              }}
              className="text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
              title="Attach video"
            >
              <Camera className="w-5 h-5 stroke-[1.8]" />
            </button>
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
              title="Voice"
            >
              <Mic className="w-5 h-5 stroke-[1.8]" />
            </button>
            <div className="flex-1 min-w-0 flex items-center bg-[#f2f4f7] rounded-full px-3.5 py-2">
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Message..."
                className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-500 outline-none"
              />
              <button
                type="submit"
                className="w-7 h-7 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                aria-label="Send"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          TAB 5: CLIENT ACCOUNT (Client Can Upload Their Profile Photo Here)
         ========================================================= */}
      {bottomTab === 'account' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <input
            ref={avatarFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            className="hidden"
          />

          {/* Top Amber Profile Banner with Uploadable Circular Avatar */}
          <div className="bg-amber-400 px-5 py-5 flex items-center gap-3.5 text-black shrink-0">
            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              className="relative w-16 h-16 rounded-full bg-white border border-neutral-300/80 text-neutral-900 font-black text-base flex items-center justify-center shadow-sm shrink-0 cursor-pointer group"
              title="Upload profile photo"
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                {client.avatarUrl ? (
                  <img
                    src={client.avatarUrl}
                    alt={client.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    viewBox="0 0 64 64"
                    className="w-12 h-12 text-neutral-300 mt-2"
                    fill="currentColor"
                  >
                    <circle cx="32" cy="22" r="11" />
                    <path d="M12 58c0-11 9-19 20-19s20 8 20 19H12z" />
                  </svg>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#252a36] text-amber-400 flex items-center justify-center shadow-xs border-2 border-white">
                <Camera className="w-3 h-3 stroke-[2.2]" />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold text-lg text-black tracking-tight truncate">
                {client.name}
              </h2>
              <p className="text-xs font-medium text-neutral-900/80 truncate mt-0.5">
                {client.currentProgram}
              </p>
            </div>
          </div>

          {/* Minimal Navigation Rows */}
          <div className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col justify-between space-y-5">
            <div className="bg-white rounded-3xl shadow-2xs border border-neutral-200/70 divide-y divide-neutral-200/70 overflow-hidden">
              {[
                {
                  label: 'Today',
                  action: () => handleSelectBottomTab('today'),
                },
                {
                  label: 'Workouts',
                  action: () => handleSelectBottomTab('workouts'),
                },
                {
                  label: 'Daily Habits',
                  action: () => handleSelectBottomTab('habits'),
                },
                {
                  label: 'Messages',
                  action: () => handleSelectBottomTab('messages'),
                },
              ].map((row) => (
                <button
                  key={row.label}
                  type="button"
                  onClick={row.action}
                  className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-sm text-neutral-900 truncate">
                    {row.label}
                  </span>
                  <ChevronRight className="w-5 h-5 text-neutral-400 stroke-[2.2] shrink-0" />
                </button>
              ))}
            </div>

            {onSignOut && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full py-3 rounded-full bg-[#252a36] hover:bg-[#1b1f29] text-amber-400 font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          BOTTOM NAVIGATION BAR (5 Minimal Client Tabs)
         ========================================================= */}
      <nav
        aria-label="Client bottom navigation"
        className="shrink-0 bg-white border-t border-neutral-200 px-2 py-2 grid grid-cols-5 z-30"
      >
        <button
          type="button"
          onClick={() => handleSelectBottomTab('today')}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors min-w-0 ${
            bottomTab === 'today'
              ? 'text-neutral-900 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Dumbbell className="w-5 h-5 stroke-[2] shrink-0" />
          <span className="text-[10px] truncate max-w-full">Today</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectBottomTab('workouts')}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors min-w-0 ${
            bottomTab === 'workouts'
              ? 'text-neutral-900 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <ClipboardCheck className="w-5 h-5 stroke-[2] shrink-0" />
          <span className="text-[10px] truncate max-w-full">Workouts</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectBottomTab('habits')}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors min-w-0 ${
            bottomTab === 'habits'
              ? 'text-neutral-900 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Flame className="w-5 h-5 stroke-[2] shrink-0" />
          <span className="text-[10px] truncate max-w-full">Habits</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectBottomTab('messages')}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors min-w-0 ${
            bottomTab === 'messages'
              ? 'text-neutral-900 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <MessageCircle className="w-5 h-5 stroke-[2] shrink-0" />
          <span className="text-[10px] truncate max-w-full">Messages</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectBottomTab('account')}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors min-w-0 ${
            bottomTab === 'account'
              ? 'text-neutral-900 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <UserCircle className="w-5 h-5 stroke-[2] shrink-0" />
          <span className="text-[10px] truncate max-w-full">Account</span>
        </button>
      </nav>
    </div>
  );
};
