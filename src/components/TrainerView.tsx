import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Activity,
  Users,
  BarChart2,
  UserCircle,
  Calendar,
  Check,
  Plus,
  Edit2,
  Search,
  Camera,
  Mic,
  ArrowUp,
  Trash2,
  Play,
} from 'lucide-react';
import {
  AuthAccount,
  ClientHomework,
  ClientProfile,
  DailyNutritionEntry,
  DayWorkout,
  DirectMessage,
  Exercise,
  MacroTargets,
  ThemeMode,
} from '../types';
import { getOrCreateDayWorkout } from '../utils/dateUtils';

export type TrainerBottomTab =
  | 'dashboard'
  | 'clients'
  | 'activity'
  | 'messages'
  | 'account';

interface TrainerViewProps {
  clients: ClientProfile[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onOpenClientManager: () => void;
  workouts: DayWorkout[];
  allClientWorkouts?: Record<string, DayWorkout[]>;
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
  dailyNutrition?: DailyNutritionEntry;
  onUpdateDailyNutrition?: (updated: DailyNutritionEntry) => void;
  onUpdateMacroTargets?: (targets: MacroTargets) => void;
  onUpdateHomework?: (homework: ClientHomework[]) => void;
  messages?: DirectMessage[];
  allClientMessages?: Record<string, DirectMessage[]>;
  onSendMessage?: (
    text: string,
    options?: {
      videoUrl?: string;
      exerciseTag?: string;
      broadcastAll?: boolean;
    }
  ) => void;
  activeAccount?: AuthAccount | null;
  onSignOut?: () => void;
  activeBottomTab?: TrainerBottomTab;
  onBottomTabChange?: (tab: TrainerBottomTab) => void;
  theme?: ThemeMode;
}

type SubScreen = 'none' | 'clientWorkouts' | 'workoutDetail' | 'directChat';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const TrainerView: React.FC<TrainerViewProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onOpenClientManager,
  workouts,
  allClientWorkouts = {},
  selectedDate,
  onSelectDate,
  onOpenVideo,
  onAddExerciseClick,
  onEditExerciseClick,
  onUpdateExerciseInline,
  onDeleteExercise,
  onOpenLibrary,
  messages = [],
  allClientMessages = {},
  onSendMessage,
  activeAccount,
  onSignOut,
  activeBottomTab = 'dashboard',
  onBottomTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<TrainerBottomTab>('dashboard');
  const bottomTab = onBottomTabChange ? activeBottomTab : internalTab;

  const [subScreen, setSubScreen] = useState<SubScreen>('none');

  // Filter & Search states for Activity / Messages / Clients
  const [activityFilter, setActivityFilter] = useState<'all' | 'unread'>('all');
  const [messagesFilter, setMessagesFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [readActivityIds, setReadActivityIds] = useState<string[]>([]);
  const [readMessageClientIds, setReadMessageClientIds] = useState<string[]>(
    []
  );

  // Workout Detail states
  const [isEditWorkoutMode, setIsEditWorkoutMode] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [workoutComment, setWorkoutComment] = useState('');

  // Direct Chat input state
  const [chatText, setChatText] = useState('');

  const selectedClient =
    clients.find((c) => c.id === selectedClientId) || clients[0];

  const activeDayWorkout = getOrCreateDayWorkout(workouts, selectedDate);

  const openClientWorkouts = (clientId: string) => {
    onSelectClient(clientId);
    setSubScreen('clientWorkouts');
    setIsEditWorkoutMode(false);
    setIsCommentOpen(false);
  };

  const openWorkoutDetail = (date: string) => {
    onSelectDate(date);
    setSubScreen('workoutDetail');
    setIsEditWorkoutMode(false);
    setIsCommentOpen(false);
  };

  const openDirectChat = (clientId: string) => {
    onSelectClient(clientId);
    setReadMessageClientIds((prev) =>
      prev.includes(clientId) ? prev : [...prev, clientId]
    );
    setSubScreen('directChat');
  };

  const handleSelectBottomTab = (tab: TrainerBottomTab) => {
    if (onBottomTabChange) {
      onBottomTabChange(tab);
    } else {
      setInternalTab(tab);
    }
    setSubScreen('none');
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !onSendMessage) return;
    onSendMessage(chatText.trim());
    setChatText('');
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

  const activityItems = React.useMemo(() => {
    const items: {
      id: string;
      clientId: string;
      clientName: string;
      workoutTitle: string;
      date: string;
      timeAgo: string;
    }[] = [];

    const timeLabels = ['2h', '1d', '2d', '4d', '4d', '6d', '1w', '1w'];
    let idx = 0;

    clients.forEach((client) => {
      const clientDays = allClientWorkouts[client.id] || [];
      clientDays
        .filter((d) => d.exercises.length > 0)
        .slice(0, 2)
        .forEach((day) => {
          items.push({
            id: `act-${client.id}-${day.date}`,
            clientId: client.id,
            clientName: client.name,
            workoutTitle: day.focus || 'Workout',
            date: day.date,
            timeAgo: timeLabels[idx % timeLabels.length],
          });
          idx++;
        });
    });

    return items;
  }, [clients, allClientWorkouts]);

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

  return (
    <div className="w-full max-w-2xl mx-auto min-h-[calc(100vh-120px)] flex flex-col bg-[#f4f5f7] rounded-3xl overflow-hidden border border-neutral-200/90 shadow-sm relative pb-20">
      {/* =========================================================
          SUB-SCREEN 1: DIRECT 1-ON-1 CHAT
         ========================================================= */}
      {subScreen === 'directChat' && (
        <div className="flex-1 flex flex-col bg-[#f4f5f7] min-h-[540px]">
          <div className="bg-amber-400 px-4 py-3.5 flex items-center justify-between gap-2 text-black">
            <button
              type="button"
              onClick={() => setSubScreen('none')}
              className="p-1 -ml-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-neutral-900 font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {getInitials(selectedClient.name)}
              </div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-black truncate">
                {selectedClient.name}
              </span>
            </div>
            <div className="w-6 shrink-0" />
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-center">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center py-10">
                <p className="text-neutral-400 font-bold text-sm">
                  No messages
                </p>
              </div>
            ) : (
              <div className="space-y-3 my-auto">
                {messages.map((msg) => {
                  const isCoach = msg.senderRole === 'trainer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isCoach ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm break-words ${
                          isCoach
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
            className="bg-white border-t border-neutral-200 px-3.5 py-3 flex items-center gap-2.5"
          >
            <button
              type="button"
              onClick={() => {
                if (onSendMessage) {
                  onSendMessage('Video shared.');
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
          SUB-SCREEN 2: CLIENT WORKOUTS LIST
         ========================================================= */}
      {subScreen === 'clientWorkouts' && (
        <div className="flex-1 flex flex-col bg-[#f4f5f7] relative">
          <div className="bg-amber-400 px-4 py-3.5 flex items-center justify-between gap-2 text-black">
            <button
              type="button"
              onClick={() => setSubScreen('none')}
              className="p-1 -ml-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-neutral-900 font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {getInitials(selectedClient.name)}
              </div>
              <div className="min-w-0 text-left">
                <div className="font-bold text-sm sm:text-base tracking-tight text-black truncate">
                  {selectedClient.name}
                </div>
                <div className="text-[11px] font-medium text-neutral-900/80 truncate">
                  Workouts
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openDirectChat(selectedClient.id)}
              className="p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
              aria-label="Message client"
            >
              <MessageCircle className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          <div className="bg-white p-3.5 border-b border-neutral-200/80">
            <div className="border border-neutral-200 rounded-full px-4 py-2.5 flex items-center justify-between bg-white">
              <span className="text-xs sm:text-sm font-medium text-neutral-700 truncate">
                Oct 15 - Oct 22, 2026
              </span>
              <Calendar className="w-4 h-4 text-neutral-600 shrink-0" />
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
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
                    onClick={() => openWorkoutDetail(day.date)}
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

          <button
            type="button"
            onClick={() => {
              if (onAddExerciseClick) onAddExerciseClick();
            }}
            className="fixed sm:absolute bottom-24 right-6 w-12 h-12 rounded-full bg-[#252a36] hover:bg-[#1b1f29] text-amber-400 shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer z-20"
            title="Add Exercise"
            aria-label="Add Exercise"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* =========================================================
          SUB-SCREEN 3: WORKOUT DETAIL (No A/B Badges, Clean Cards)
         ========================================================= */}
      {subScreen === 'workoutDetail' && (
        <div className="flex-1 flex flex-col bg-[#f4f5f7]">
          <div className="bg-amber-400 px-4 py-3.5 text-black">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSubScreen('clientWorkouts')}
                className="p-1 -ml-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
                aria-label="Back"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
              </button>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white text-neutral-900 font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  {getInitials(selectedClient.name)}
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-bold text-sm sm:text-base text-black truncate">
                    {selectedClient.name}
                  </div>
                  <div className="text-[11px] font-medium text-neutral-900/80 truncate">
                    {activeDayWorkout.focus || 'Workout'} ·{' '}
                    {getWorkoutStatus(activeDayWorkout)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openDirectChat(selectedClient.id)}
                className="p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
                aria-label="Chat"
              >
                <MessageCircle className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {activeDayWorkout.exercises.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-neutral-200/70 my-6">
                <p className="text-sm text-neutral-500 mb-3">No exercises</p>
                <button
                  type="button"
                  onClick={() => onAddExerciseClick && onAddExerciseClick()}
                  className="px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-bold cursor-pointer"
                >
                  + Add Exercise
                </button>
              </div>
            ) : (
              activeDayWorkout.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-white rounded-3xl p-4 shadow-2xs border border-neutral-200/60 flex items-center justify-between gap-3 overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateExerciseInline &&
                        onUpdateExerciseInline(selectedDate, ex.id, {
                          completed: !ex.completed,
                        })
                      }
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        ex.completed
                          ? 'bg-amber-400 text-black'
                          : 'bg-neutral-200/80 text-neutral-400 hover:bg-neutral-300'
                      }`}
                      title="Toggle completed"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
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
                        {ex.actualWeight ? ` · ${ex.actualWeight}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditExerciseClick(ex)}
                      className="w-9 h-9 text-neutral-600 hover:text-black rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {isEditWorkoutMode && (
                      <button
                        type="button"
                        onClick={() => onDeleteExercise(ex.id)}
                        className="w-9 h-9 text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

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

          <div className="bg-white border-t border-neutral-200/80 p-3.5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsCommentOpen((prev) => !prev)}
              className="py-2.5 px-4 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold text-xs sm:text-sm transition-colors cursor-pointer truncate"
            >
              Add Comment
            </button>
            <button
              type="button"
              onClick={() => {
                if (onAddExerciseClick) {
                  onAddExerciseClick();
                } else {
                  setIsEditWorkoutMode((prev) => !prev);
                }
              }}
              className="py-2.5 px-4 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold text-xs sm:text-sm transition-colors cursor-pointer truncate"
            >
              Edit Workout
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN TAB 1: DASHBOARD
         ========================================================= */}
      {subScreen === 'none' && bottomTab === 'dashboard' && (
        <div className="flex-1 flex flex-col bg-[#f4f5f7]">
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="w-6" />
            <span className="text-xs font-bold text-neutral-500">
              Today&apos;s workouts
            </span>
            <button
              type="button"
              onClick={onOpenClientManager}
              className="p-1 rounded-full text-neutral-600 hover:text-black transition-colors cursor-pointer"
              title="Clients"
            >
              <Users className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          <div className="px-4 space-y-2.5">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => openClientWorkouts(client.id)}
                className="bg-white rounded-3xl px-4 py-3.5 border border-neutral-200/70 shadow-2xs flex items-center justify-between gap-3 hover:border-neutral-300 transition-colors cursor-pointer overflow-hidden"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(client.name)}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                    {client.name}
                  </span>
                </div>

                <div
                  className="flex items-center gap-2 text-neutral-400 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => openDirectChat(client.id)}
                    className="w-9 h-9 rounded-full hover:bg-neutral-100 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
                    title="Message"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openClientWorkouts(client.id)}
                    className="w-9 h-9 rounded-full hover:bg-neutral-100 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
                    title="Workouts"
                  >
                    <Activity className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN TAB 2: CLIENTS ROSTER
         ========================================================= */}
      {subScreen === 'none' && bottomTab === 'clients' && (
        <div className="flex-1 flex flex-col bg-[#f4f5f7]">
          <div className="p-3.5 bg-white border-b border-neutral-200/80 flex items-center gap-2.5">
            <div className="flex-1 min-w-0 flex items-center gap-2.5 bg-[#f4f5f7] px-3.5 py-2.5 rounded-full">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-xs sm:text-sm text-neutral-900 outline-none w-full min-w-0"
              />
            </div>
            <button
              type="button"
              onClick={onOpenClientManager}
              className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Add Client"
            >
              <Plus className="w-5 h-5 stroke-[2.4]" />
            </button>
          </div>

          <div className="p-4 space-y-2.5">
            {clients
              .filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((client) => (
                <div
                  key={client.id}
                  onClick={() => openClientWorkouts(client.id)}
                  className="bg-white rounded-3xl px-4 py-3.5 border border-neutral-200/70 shadow-2xs flex items-center justify-between gap-3 hover:border-neutral-300 transition-colors cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(client.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                        {client.name}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">
                        {client.currentProgram}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN TAB 3: CLIENT ACTIVITY
         ========================================================= */}
      {subScreen === 'none' && bottomTab === 'activity' && (
        <div className="flex-1 flex flex-col bg-[#f4f5f7]">
          <div className="bg-amber-400 px-4 py-3 text-black space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-black/15 p-0.5 rounded-full grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActivityFilter('all')}
                  className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    activityFilter === 'all'
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'text-neutral-900/80'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActivityFilter('unread')}
                  className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    activityFilter === 'unread'
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'text-neutral-900/80'
                  }`}
                >
                  Unread
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowSearch((prev) => !prev)}
                className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer shrink-0"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-black" />
              </button>
            </div>
            {showSearch && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3.5 py-2 rounded-full bg-white text-xs text-neutral-900 outline-none"
              />
            )}
          </div>

          <div className="p-4 space-y-2.5 flex-1">
            {activityItems
              .filter((item) => {
                if (
                  activityFilter === 'unread' &&
                  readActivityIds.includes(item.id)
                ) {
                  return false;
                }
                if (
                  searchQuery.trim() &&
                  !item.clientName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                ) {
                  return false;
                }
                return true;
              })
              .map((item) => {
                const isRead = readActivityIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setReadActivityIds((prev) =>
                        prev.includes(item.id) ? prev : [...prev, item.id]
                      );
                      onSelectClient(item.clientId);
                      openWorkoutDetail(item.date);
                    }}
                    className="bg-white rounded-3xl px-4 py-3.5 border border-neutral-200/70 shadow-2xs flex items-center justify-between gap-3 hover:border-neutral-300 transition-colors cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(item.clientName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-neutral-900 truncate">
                          <span className="font-bold">{item.clientName}</span> ·{' '}
                          <span className="font-medium">
                            {item.workoutTitle}
                          </span>
                        </p>
                        <span className="text-[11px] text-neutral-500 block mt-0.5">
                          {item.timeAgo}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReadActivityIds((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((id) => id !== item.id)
                            : [...prev, item.id]
                        );
                      }}
                      className={`w-3.5 h-3.5 rounded-full border shrink-0 cursor-pointer ${
                        isRead
                          ? 'border-neutral-300 bg-transparent'
                          : 'border-amber-500 bg-amber-400'
                      }`}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN TAB 4: MESSAGES
         ========================================================= */}
      {subScreen === 'none' && bottomTab === 'messages' && (
        <div className="flex-1 flex flex-col bg-[#f4f5f7]">
          <div className="bg-amber-400 px-4 py-3 text-black space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-black/15 p-0.5 rounded-full grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMessagesFilter('all')}
                  className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    messagesFilter === 'all'
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'text-neutral-900/80'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setMessagesFilter('unread')}
                  className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    messagesFilter === 'unread'
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'text-neutral-900/80'
                  }`}
                >
                  Unread
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowSearch((prev) => !prev)}
                className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer shrink-0"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-black" />
              </button>
            </div>
            {showSearch && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3.5 py-2 rounded-full bg-white text-xs text-neutral-900 outline-none"
              />
            )}
          </div>

          <div className="p-4 space-y-2.5 flex-1">
            {clients
              .filter((client) => {
                if (
                  messagesFilter === 'unread' &&
                  readMessageClientIds.includes(client.id)
                ) {
                  return false;
                }
                if (
                  searchQuery.trim() &&
                  !client.name.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                  return false;
                }
                return true;
              })
              .map((client) => {
                const thread = allClientMessages[client.id] || [];
                const lastMsg =
                  thread.length > 0 ? thread[thread.length - 1] : null;

                return (
                  <div
                    key={client.id}
                    onClick={() => openDirectChat(client.id)}
                    className="bg-white rounded-3xl px-4 py-3.5 border border-neutral-200/70 shadow-2xs flex items-center justify-between gap-3 hover:border-neutral-300 transition-colors cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(client.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm sm:text-base text-neutral-900 truncate">
                          {client.name}
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {lastMsg ? lastMsg.text : 'No messages'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN TAB 5: ACCOUNT
         ========================================================= */}
      {subScreen === 'none' && bottomTab === 'account' && (
        <div className="flex-1 flex flex-col bg-[#f4f5f7]">
          <div className="bg-amber-400 px-5 py-5 flex items-center gap-3.5 text-black">
            <div className="w-14 h-14 rounded-full bg-white text-neutral-900 font-black text-base flex items-center justify-center shadow-sm shrink-0">
              {getInitials(activeAccount?.displayName || 'Marcus Vance')}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold text-lg text-black tracking-tight truncate">
                {activeAccount?.displayName || 'Marcus Vance'}
              </h2>
              <p className="text-xs font-medium text-neutral-900/80 mt-0.5 truncate">
                {clients.length} Clients
              </p>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-5">
            <div className="bg-white rounded-3xl shadow-2xs border border-neutral-200/70 divide-y divide-neutral-200/70 overflow-hidden">
              {[
                {
                  label: 'Manage Clients',
                  action: onOpenClientManager,
                },
                {
                  label: 'Exercise Library',
                  action: onOpenLibrary,
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
          BOTTOM NAVIGATION BAR (5 Minimal Tabs)
         ========================================================= */}
      <nav
        aria-label="Trainer bottom navigation"
        className="fixed sm:absolute bottom-0 inset-x-0 bg-white border-t border-neutral-200 px-2 py-2 grid grid-cols-5 z-30"
      >
        <button
          type="button"
          onClick={() => handleSelectBottomTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors min-w-0 ${
            bottomTab === 'dashboard'
              ? 'text-neutral-900 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <BarChart2 className="w-5 h-5 stroke-[2] shrink-0" />
          <span className="text-[10px] truncate max-w-full">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectBottomTab('clients')}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors min-w-0 ${
            bottomTab === 'clients'
              ? 'text-neutral-900 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Users className="w-5 h-5 stroke-[2] shrink-0" />
          <span className="text-[10px] truncate max-w-full">Clients</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectBottomTab('activity')}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors min-w-0 ${
            bottomTab === 'activity'
              ? 'text-neutral-900 font-bold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Activity className="w-5 h-5 stroke-[2] shrink-0" />
          <span className="text-[10px] truncate max-w-full">Activity</span>
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
