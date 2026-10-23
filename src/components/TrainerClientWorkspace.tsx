import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Apple,
  Target,
  Utensils,
  TrendingUp,
  PlusSquare,
  ClipboardList,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Dumbbell,
  Search,
  Watch,
  UserCog,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Type,
  Keyboard,
  SlidersHorizontal,
  Plus,
  Bookmark,
  Copy,
  Move,
  Check,
  X,
  Trash2,
  Edit3,
  ClipboardPaste,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ClientProfile, Exercise } from '../types';
import { TRUECOACH_EXERCISE_LIBRARY } from '../data/trueCoachExerciseLibrary';

export type ClientSidebarTab =
  | 'workouts'
  | 'messages'
  | 'goals'
  | 'nutrition'
  | 'metrics'
  | 'notes'
  | 'documents'
  | 'skeleton'
  | 'pictures'
  | 'equipment'
  | 'exerciseSearch'
  | 'wearables'
  | 'settings'
  | 'billing';

export type WorkoutComplianceStatus = 'completed' | 'missed' | 'scheduled';

export interface TrueCoachPrescriptionItem {
  id: string;
  orderLabel: string; // e.g. 'A1', 'A2', 'B', 'C'
  name: string;
  note: string; // e.g. 'offset'
  sets: string; // e.g. '2-3'
  reps: string; // e.g. '5-10'
  weight: string; // e.g. '____'
  status: WorkoutComplianceStatus;
}

export interface TrueCoachDayWorkoutCard {
  id: string;
  dateIso: string; // YYYY-MM-DD
  title: string;
  status: WorkoutComplianceStatus;
  selected?: boolean;
  dayTag?: string;
  exercises: TrueCoachPrescriptionItem[];
}

interface TrainerClientWorkspaceProps {
  client: ClientProfile;
  allClients: ClientProfile[];
  onSelectClient: (clientId: string) => void;
  onBackToClients: () => void;
  onUpdateClient?: (clientId: string, updates: Partial<ClientProfile>) => void;
  onOpenVideo?: (exercise: Exercise) => void;
  initialTab?: ClientSidebarTab;
}

const INITIAL_OCT_2026_WORKOUTS: TrueCoachDayWorkoutCard[] = [
  {
    id: 'tc-wk-tue-20',
    dateIso: '2026-10-20',
    title: 'Workout',
    status: 'completed',
    exercises: [
      {
        id: 'tue-ex-1',
        orderLabel: 'A1',
        name: 'Barbell Side Bend',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'completed',
      },
      {
        id: 'tue-ex-2',
        orderLabel: 'A2',
        name: 'Quadruped Scapular Push-Up',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'completed',
      },
      {
        id: 'tue-ex-3',
        orderLabel: 'B',
        name: 'Behind the Neck Snatch Grip Push Press',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'completed',
      },
      {
        id: 'tue-ex-4',
        orderLabel: 'C',
        name: 'Hang Power Snatch',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'completed',
      },
      {
        id: 'tue-ex-5',
        orderLabel: 'D',
        name: 'Hang Power Clean',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'completed',
      },
      {
        id: 'tue-ex-6',
        orderLabel: 'E',
        name: 'Shiko & Sonkyo',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'completed',
      },
    ],
  },
  {
    id: 'tc-wk-thu-22',
    dateIso: '2026-10-22',
    title: 'Workout',
    status: 'missed',
    exercises: [
      {
        id: 'thu-ex-1',
        orderLabel: 'A1',
        name: 'Kneeling Dumbbell Zottman Curl',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'missed',
      },
      {
        id: 'thu-ex-2',
        orderLabel: 'A2',
        name: 'Plank to planche rocks',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'missed',
      },
      {
        id: 'thu-ex-3',
        orderLabel: 'B',
        name: 'L-Sit to Tuck Planche on Parallettes',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'missed',
      },
      {
        id: 'thu-ex-4',
        orderLabel: 'C',
        name: 'Power Clean to split jerk',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'missed',
      },
      {
        id: 'thu-ex-5',
        orderLabel: 'D1',
        name: 'Push Press',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'missed',
      },
      {
        id: 'thu-ex-6',
        orderLabel: 'D2',
        name: 'Kipping lat pull-down',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'missed',
      },
      {
        id: 'thu-ex-7',
        orderLabel: 'D3',
        name: 'Dragon flag',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'missed',
      },
    ],
  },
  {
    id: 'tc-wk-fri-23',
    dateIso: '2026-10-23',
    title: 'Workout',
    status: 'scheduled',
    exercises: [
      {
        id: 'fri-ex-1',
        orderLabel: 'A1',
        name: 'Single Leg Broad Jump',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'scheduled',
      },
      {
        id: 'fri-ex-2',
        orderLabel: 'A2',
        name: 'Single Leg plank',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'scheduled',
      },
      {
        id: 'fri-ex-3',
        orderLabel: 'B1',
        name: 'Snatch',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'scheduled',
      },
      {
        id: 'fri-ex-4',
        orderLabel: 'B2',
        name: 'Romanian Deadlift',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'scheduled',
      },
      {
        id: 'fri-ex-5',
        orderLabel: 'C1',
        name: 'Zercher Bulgarian Split squat',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'scheduled',
      },
      {
        id: 'fri-ex-6',
        orderLabel: 'C2',
        name: 'Landmine Sissy Squat',
        note: 'offset',
        sets: '2-3',
        reps: '5-10',
        weight: '____',
        status: 'scheduled',
      },
    ],
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getMondayOfWeek(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay(); // 0 = Sun, 1 = Mon
  const diff = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + diff);
  return dt;
}

function formatIso(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const TrainerClientWorkspace: React.FC<TrainerClientWorkspaceProps> = ({
  client,
  allClients,
  onSelectClient,
  onBackToClients,
  onUpdateClient,
  initialTab = 'workouts',
}) => {
  // Active tab in the secondary client sidebar
  const [activeTab, setActiveTab] = useState<ClientSidebarTab>(initialTab);
  // Collapsible secondary sidebar state (collapsed icon rail by default like screenshot, expandable via bottom arrow)
  const [isRailExpanded, setIsRailExpanded] = useState(false);
  // Client switcher dropdown in top avatar
  const [isClientSwitcherOpen, setIsClientSwitcherOpen] = useState(false);

  // Calendar reference date (defaults to Oct 23, 2026 as shown in screenshot)
  const TODAY_ISO = '2026-10-23';
  const [currentWeekDateIso, setCurrentWeekDateIso] = useState<string>('2026-10-23');
  const [calendarViewMode, setCalendarViewMode] = useState<'1week' | '2week' | 'skeleton'>('1week');
  const [isTodayDropdownOpen, setIsTodayDropdownOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [compactTextMode, setCompactTextMode] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'missed' | 'scheduled'>('all');
  const [showSundayColumn, setShowSundayColumn] = useState(true);

  // Per-client workouts state (seeded with the exact screenshot workouts)
  const [workoutsByClient, setWorkoutsByClient] = useState<
    Record<string, TrueCoachDayWorkoutCard[]>
  >(() => ({
    [client.id]: INITIAL_OCT_2026_WORKOUTS,
  }));

  const clientWorkouts = useMemo(() => {
    return workoutsByClient[client.id] || INITIAL_OCT_2026_WORKOUTS;
  }, [workoutsByClient, client.id]);

  const updateClientWorkouts = (
    updater: (prev: TrueCoachDayWorkoutCard[]) => TrueCoachDayWorkoutCard[]
  ) => {
    setWorkoutsByClient((prev) => {
      const current = prev[client.id] || INITIAL_OCT_2026_WORKOUTS;
      return {
        ...prev,
        [client.id]: updater(current),
      };
    });
  };

  // Clipboard for copying & pasting workouts between days
  const [copiedWorkout, setCopiedWorkout] = useState<TrueCoachDayWorkoutCard | null>(null);
  // Moving workout modal state
  const [movingWorkout, setMovingWorkout] = useState<TrueCoachDayWorkoutCard | null>(null);
  // Editing / Adding workout modal state
  const [editingWorkout, setEditingWorkout] = useState<TrueCoachDayWorkoutCard | null>(null);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [activeExercisePickerIndex, setActiveExercisePickerIndex] = useState<number | null>(null);

  // Day Bookmark/Note state
  const [dayFlags, setDayFlags] = useState<Record<string, string>>({
    '2026-10-23': 'Assessment Check-in',
  });
  const [flagModalDateIso, setFlagModalDateIso] = useState<string | null>(null);
  const [flagInputText, setFlagInputText] = useState('');

  // Interactive states for secondary client tabs (Goals, Nutrition, Metrics, Notes, Documents, Equipment, Pictures, Settings, Billing, Messages)
  const [clientGoals, setClientGoals] = useState([
    {
      id: 'g-1',
      title: 'Overhead Snatch Stability — 65 kg',
      category: 'Strength',
      targetDate: 'Nov 30, 2026',
      progress: 80,
      status: 'On Track',
    },
    {
      id: 'g-2',
      title: '100% Weekly Workout Compliance (4/4 Sessions)',
      category: 'Habit',
      targetDate: 'Oct 31, 2026',
      progress: 75,
      status: 'Active',
    },
    {
      id: 'g-3',
      title: 'Strict L-Sit Hold on Parallettes — 30s',
      category: 'Gymnastics',
      targetDate: 'Dec 15, 2026',
      progress: 60,
      status: 'On Track',
    },
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const [macroTargets, setMacroTargets] = useState({
    protein: 155,
    carbs: 230,
    fat: 65,
    calories: 2125,
  });

  const [clientMetrics, setClientMetrics] = useState([
    { id: 'm-1', name: 'Body Weight', value: '63.4', unit: 'kg', date: 'Oct 23, 2026', change: '-0.6 kg' },
    { id: 'm-2', name: 'Hang Power Snatch 1RM', value: '58.0', unit: 'kg', date: 'Oct 20, 2026', change: '+2.5 kg' },
    { id: 'm-3', name: 'Resting Heart Rate', value: '52', unit: 'bpm', date: 'Oct 23, 2026', change: '-2 bpm' },
    { id: 'm-4', name: 'Skeletal Muscle Mass', value: '28.9', unit: 'kg', date: 'Oct 18, 2026', change: '+0.4 kg' },
  ]);
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricVal, setNewMetricVal] = useState('');
  const [newMetricUnit, setNewMetricUnit] = useState('kg');

  const [coachNotes, setCoachNotes] = useState([
    {
      id: 'n-1',
      title: 'Shoulder Mobility & Overhead Position',
      category: 'Movement Note',
      content: 'Responds well to quadruped scapular push-ups and thoracic openers prior to snatch grip pressing.',
      updated: 'Oct 20, 2026',
    },
    {
      id: 'n-2',
      title: 'Left Ankle Dorsiflexion',
      category: 'Limitation',
      content: 'Use 0.5" heel lift or weightlifting shoes on deep Zercher & overhead squats.',
      updated: 'Oct 14, 2026',
    },
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');

  const [clientEquipment, setClientEquipment] = useState< string[]>([
    'Olympic Barbell (20kg / 15kg)',
    'Bumper Plates',
    'Dumbbells (5–40 kg)',
    'Parallettes',
    'Pull-Up Rig / Lat Pulldown',
    'Landmine Attachment',
    'Plyo Box',
    'Resistance Bands',
  ]);
  const [newEquipItem, setNewEquipItem] = useState('');

  const [chatHistory, setChatHistory] = useState([
    {
      id: 'msg-1',
      sender: 'client' as const,
      text: 'Finished Tuesday session! Behind the Neck Snatch Grip Push Press felt super solid.',
      time: 'Tue 6:14 PM',
    },
    {
      id: 'msg-2',
      sender: 'trainer' as const,
      text: 'Awesome work Alexa! Keep focus on active scapular upward rotation on Friday’s Snatch blocks.',
      time: 'Wed 9:05 AM',
    },
  ]);
  const [chatDraft, setChatDraft] = useState('');

  const [clientHistoryQuery, setClientHistoryQuery] = useState('');

  // Edit profile form state
  const [profileFirstName, setProfileFirstName] = useState(
    client.firstName || client.name.split(' ')[0] || 'Alexa'
  );
  const [profileLastName, setProfileLastName] = useState(
    client.lastName || client.name.split(' ').slice(1).join(' ') || 'Kolb'
  );
  const [profileEmail, setProfileEmail] = useState(client.email || 'alexa.kolb@purefunction.fit');
  const [profileType, setProfileType] = useState<'Remote' | 'Dual' | 'In-Person'>(
    client.clientType || 'Dual'
  );
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Build week days (Monday .. Sunday)
  const weekDays = useMemo(() => {
    const monday = getMondayOfWeek(currentWeekDateIso);
    const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const totalDays = showSundayColumn ? 7 : 6;
    const list = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatIso(d);
      list.push({
        iso,
        dayName: dayLabels[i],
        dayNumber: d.getDate(),
        isToday: iso === TODAY_ISO,
      });
    }
    return list;
  }, [currentWeekDateIso, showSundayColumn]);

  const currentMonthYearLabel = useMemo(() => {
    const [y, m, d] = currentWeekDateIso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentWeekDateIso]);

  const shiftWeek = (deltaDays: number) => {
    const [y, m, d] = currentWeekDateIso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + deltaDays);
    setCurrentWeekDateIso(formatIso(dt));
  };

  const handleOpenAddWorkoutForDay = (dateIso: string) => {
    const existing = clientWorkouts.find((w) => w.dateIso === dateIso);
    if (existing) {
      setEditingWorkout(JSON.parse(JSON.stringify(existing)));
      return;
    }
    setEditingWorkout({
      id: `tc-wk-${Date.now()}`,
      dateIso,
      title: 'Workout',
      status: 'scheduled',
      exercises: [
        {
          id: `ex-${Date.now()}-1`,
          orderLabel: 'A1',
          name: 'Barbell Side Bend',
          note: 'offset',
          sets: '2-3',
          reps: '5-10',
          weight: '____',
          status: 'scheduled',
        },
        {
          id: `ex-${Date.now()}-2`,
          orderLabel: 'A2',
          name: 'Single Leg plank',
          note: 'offset',
          sets: '2-3',
          reps: '5-10',
          weight: '____',
          status: 'scheduled',
        },
      ],
    });
  };

  const handleSaveEditingWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkout) return;
    updateClientWorkouts((prev) => {
      const exists = prev.some((w) => w.id === editingWorkout.id);
      if (exists) {
        return prev.map((w) => (w.id === editingWorkout.id ? editingWorkout : w));
      }
      return [...prev, editingWorkout];
    });
    setEditingWorkout(null);
    setActiveExercisePickerIndex(null);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    updateClientWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    if (editingWorkout?.id === workoutId) {
      setEditingWorkout(null);
    }
  };

  const handlePasteWorkoutToDate = (targetDateIso: string) => {
    if (!copiedWorkout) return;
    const cloned: TrueCoachDayWorkoutCard = {
      ...JSON.parse(JSON.stringify(copiedWorkout)),
      id: `tc-wk-${Date.now()}`,
      dateIso: targetDateIso,
      status: 'scheduled',
      exercises: copiedWorkout.exercises.map((ex, idx) => ({
        ...ex,
        id: `ex-${Date.now()}-${idx}`,
        status: 'scheduled',
      })),
    };
    updateClientWorkouts((prev) => {
      const filtered = prev.filter((w) => w.dateIso !== targetDateIso);
      return [...filtered, cloned];
    });
  };

  const handleMoveWorkoutToDate = (targetDateIso: string) => {
    if (!movingWorkout) return;
    updateClientWorkouts((prev) => {
      const withoutSource = prev.filter(
        (w) => w.id !== movingWorkout.id && w.dateIso !== targetDateIso
      );
      return [...withoutSource, { ...movingWorkout, dateIso: targetDateIso }];
    });
    setMovingWorkout(null);
  };

  const handleCycleExerciseStatus = (
    workoutId: string,
    exerciseId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const order: WorkoutComplianceStatus[] = ['scheduled', 'completed', 'missed'];
    updateClientWorkouts((prev) =>
      prev.map((w) => {
        if (w.id !== workoutId) return w;
        const nextExercises = w.exercises.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          const nextStatus = order[(order.indexOf(ex.status) + 1) % order.length];
          return { ...ex, status: nextStatus };
        });
        const allCompleted =
          nextExercises.length > 0 &&
          nextExercises.every((ex) => ex.status === 'completed');
        const anyMissed = nextExercises.some((ex) => ex.status === 'missed');
        const nextWorkoutStatus: WorkoutComplianceStatus = allCompleted
          ? 'completed'
          : anyMissed
          ? 'missed'
          : 'scheduled';
        return { ...w, exercises: nextExercises, status: nextWorkoutStatus };
      })
    );
  };

  const handleExportClientWorkoutsCsv = () => {
    const headers = ['Date', 'Workout Title', 'Status', 'Order', 'Exercise', 'Note', 'Sets', 'Reps', 'Weight'];
    const rows: string[][] = [];
    clientWorkouts.forEach((wk) => {
      wk.exercises.forEach((ex) => {
        rows.push([
          wk.dateIso,
          `"${wk.title}"`,
          wk.status,
          ex.orderLabel,
          `"${ex.name}"`,
          `"${ex.note}"`,
          `"${ex.sets}"`,
          `"${ex.reps}"`,
          `"${ex.weight}"`,
        ]);
      });
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.name.toLowerCase().replace(/\s+/g, '-')}-workouts.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLibrarySuggestions = useMemo(() => {
    const q = exerciseSearchQuery.trim().toLowerCase();
    if (!q) return TRUECOACH_EXERCISE_LIBRARY.slice(0, 25);
    return TRUECOACH_EXERCISE_LIBRARY.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.primaryMuscles.toLowerCase().includes(q) ||
        ex.patterns.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [exerciseSearchQuery]);

  // Client secondary sidebar navigation items (exact order and icons from TrueCoach screenshot)
  const sidebarMainItems: {
    id: ClientSidebarTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hasGreenDot?: boolean;
  }[] = [
    { id: 'workouts', label: 'Workouts', icon: Apple, hasGreenDot: true },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'metrics', label: 'Metrics', icon: TrendingUp },
    { id: 'notes', label: 'Limitations & Notes', icon: PlusSquare },
    { id: 'documents', label: 'Documents', icon: ClipboardList },
    { id: 'skeleton', label: 'Skeleton View', icon: CalendarIcon },
    { id: 'pictures', label: 'Progress Pictures', icon: ImageIcon },
    { id: 'equipment', label: 'Equipment', icon: Dumbbell },
    { id: 'exerciseSearch', label: 'Exercise History', icon: Search },
    { id: 'wearables', label: 'Wearables', icon: Watch, hasGreenDot: true },
  ];

  const sidebarBottomItems: {
    id: ClientSidebarTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'settings', label: 'Client Settings', icon: UserCog },
    { id: 'billing', label: 'Payment & Billing', icon: CreditCard },
  ];

  return (
    <div className="flex-1 min-h-0 flex w-full overflow-hidden bg-[#f4f5f7]">
      {/* =========================================================
          SECONDARY COLLAPSIBLE CLIENT SIDEBAR (TrueCoach Client Rail)
         ========================================================= */}
      <aside
        aria-label="Client navigation rail"
        className={`flex flex-col justify-between shrink-0 bg-[#252a36] text-neutral-300 border-r border-neutral-800/80 select-none transition-all duration-200 relative z-20 ${
          isRailExpanded ? 'w-[205px]' : 'w-[58px]'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {/* Top Client Initials Circle + Client Switcher */}
          <div className="pt-3 pb-2.5 px-2 flex flex-col items-center border-b border-white/10 relative">
            <button
              type="button"
              onClick={() => setIsClientSwitcherOpen((prev) => !prev)}
              className={`group flex items-center gap-2.5 rounded-xl p-1 transition-colors cursor-pointer ${
                isRailExpanded ? 'w-full px-2 hover:bg-white/5' : 'justify-center'
              }`}
              title={`${client.name} — Switch or view client`}
            >
              <div className="w-9 h-9 rounded-full bg-white text-[#181b22] font-black text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-amber-400/80">
                {getInitials(client.name)}
              </div>
              {isRailExpanded && (
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-extrabold text-white truncate">
                    {client.name}
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold truncate">
                    {client.clientType || 'Dual'} Client
                  </div>
                </div>
              )}
            </button>

            {/* Quick Client Switcher Popover */}
            {isClientSwitcherOpen && (
              <div className="fixed left-[215px] top-[64px] z-50 w-60 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 text-neutral-900">
                <div className="px-3.5 py-1.5 border-b border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                    Switch Client
                  </span>
                  <button
                    type="button"
                    onClick={onBackToClients}
                    className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    All Clients
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100">
                  {allClients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelectClient(c.id);
                        setIsClientSwitcherOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-neutral-50 cursor-pointer ${
                        c.id === client.id ? 'bg-amber-50/80 font-bold' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-[#252a36] text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {getInitials(c.name)}
                      </div>
                      <span className="text-xs truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Message Bubble Icon directly below Avatar */}
            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className={`mt-2.5 w-full py-2 flex items-center transition-colors cursor-pointer relative ${
                isRailExpanded ? 'px-3 gap-3 justify-start' : 'justify-center'
              } ${
                activeTab === 'messages'
                  ? 'text-white bg-white/10 font-bold border-r-[3px] border-amber-400'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Direct Messages"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              {isRailExpanded && <span className="text-xs truncate">Messages</span>}
            </button>
          </div>

          {/* Main 11 Client Feature Icons */}
          <div className="py-1.5 space-y-0.5 border-b border-white/10">
            {sidebarMainItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full py-2.5 flex items-center transition-all cursor-pointer relative ${
                    isRailExpanded ? 'px-3.5 gap-3 justify-start' : 'justify-center'
                  } ${
                    isActive
                      ? 'bg-[#1a1d26] text-white font-bold border-r-[3px] border-amber-400'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title={item.label}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className={`w-[17px] h-[17px] shrink-0 ${
                        isActive ? 'text-white' : 'text-neutral-400'
                      }`}
                    />
                    {item.hasGreenDot && (
                      <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#252a36]" />
                    )}
                  </div>
                  {isRailExpanded && (
                    <span className="text-xs truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom 2 Client Settings & Billing Icons */}
          <div className="py-1.5 space-y-0.5">
            {sidebarBottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full py-2.5 flex items-center transition-all cursor-pointer relative ${
                    isRailExpanded ? 'px-3.5 gap-3 justify-start' : 'justify-center'
                  } ${
                    isActive
                      ? 'bg-[#1a1d26] text-white font-bold border-r-[3px] border-amber-400'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-[17px] h-[17px] shrink-0 ${
                      isActive ? 'text-white' : 'text-neutral-400'
                    }`}
                  />
                  {isRailExpanded && (
                    <span className="text-xs truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Circular Expand / Collapse Button (Exact match to screenshot bottom arrow) */}
        <div className="p-3 flex items-center justify-center border-t border-white/10">
          <button
            type="button"
            onClick={() => setIsRailExpanded((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-white hover:bg-amber-400 text-[#1a1d26] flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            title={isRailExpanded ? 'Collapse client menu' : 'Expand client menu'}
            aria-label={isRailExpanded ? 'Collapse client menu' : 'Expand client menu'}
          >
            {isRailExpanded ? (
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN CLIENT WORKSPACE AREA
         ========================================================= */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-[#f4f5f7]">
        {/* ---------------------------------------------------------
            TAB 1: WORKOUTS WEEKLY CALENDAR (Screenshot Match)
           --------------------------------------------------------- */}
        {activeTab === 'workouts' && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Top Calendar Toolbar */}
            <div className="shrink-0 px-4 py-2.5 bg-[#f4f5f7] border-b border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
              {/* Left controls: Today dropdown, < >, Month Year */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="inline-flex rounded-md border border-neutral-300 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setCurrentWeekDateIso(TODAY_ISO)}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 rounded-l-md cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTodayDropdownOpen((prev) => !prev)}
                      className="px-2 py-1.5 border-l border-neutral-300 text-neutral-600 hover:bg-neutral-50 rounded-r-md cursor-pointer"
                      aria-label="Calendar view options"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isTodayDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-40 text-xs font-semibold text-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentWeekDateIso(TODAY_ISO);
                          setCalendarViewMode('1week');
                          setIsTodayDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-neutral-100 flex items-center justify-between cursor-pointer"
                      >
                        <span>Jump to Today (Oct 23)</span>
                        <span className="text-[10px] font-bold text-amber-600">T</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCalendarViewMode('1week');
                          setIsTodayDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left hover:bg-neutral-100 cursor-pointer ${
                          calendarViewMode === '1week' ? 'bg-amber-50 font-bold' : ''
                        }`}
                      >
                        1-Week Calendar View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('skeleton');
                          setIsTodayDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-neutral-100 cursor-pointer"
                      >
                        4-Week Skeleton View
                      </button>
                    </div>
                  )}
                </div>

                {/* Prev / Next Week Arrows */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => shiftWeek(-7)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                    title="Previous Week"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftWeek(7)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                    title="Next Week"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Clickable Month & Year Title with Interactive Calendar Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMonthPickerOpen((prev) => !prev)}
                    className="text-base sm:text-lg font-bold text-neutral-800 hover:text-black flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-neutral-200/50 transition-colors cursor-pointer"
                    title="Click to open calendar date picker"
                  >
                    <span>{currentMonthYearLabel}</span>
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  </button>

                  {isMonthPickerOpen && (
                    <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-3.5 z-40">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                        <span className="text-xs font-black text-neutral-900">
                          {currentMonthYearLabel}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => shiftWeek(-28)}
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-600 cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => shiftWeek(28)}
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-600 cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-neutral-400 mb-1">
                        <span>M</span>
                        <span>T</span>
                        <span>W</span>
                        <span>T</span>
                        <span>F</span>
                        <span>S</span>
                        <span>S</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {Array.from({ length: 31 }, (_, idx) => {
                          const dayNum = idx + 1;
                          const iso = `2026-10-${String(dayNum).padStart(2, '0')}`;
                          const hasWk = clientWorkouts.some((w) => w.dateIso === iso);
                          const isSelectedWeek = weekDays.some((wd) => wd.iso === iso);
                          return (
                            <button
                              key={dayNum}
                              type="button"
                              onClick={() => {
                                setCurrentWeekDateIso(iso);
                                setIsMonthPickerOpen(false);
                              }}
                              className={`h-7 rounded-lg text-xs font-bold flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                iso === TODAY_ISO
                                  ? 'bg-amber-400 text-black'
                                  : isSelectedWeek
                                  ? 'bg-neutral-900 text-white'
                                  : 'hover:bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              <span>{dayNum}</span>
                              {hasWk && (
                                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Copied workout indicator pill */}
                {copiedWorkout && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400 text-neutral-900 text-xs font-bold">
                    <span>Copied: {copiedWorkout.title}</span>
                    <button
                      type="button"
                      onClick={() => setCopiedWorkout(null)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Toolbar Icons: Export, Text Size (A), Keyboard Shortcuts, Filter Sliders */}
              <div className="flex items-center gap-1.5 relative">
                <button
                  type="button"
                  onClick={handleExportClientWorkoutsCsv}
                  className="p-2 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-200/70 transition-colors cursor-pointer"
                  title="Download / Export Workouts CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCompactTextMode((prev) => !prev)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    compactTextMode
                      ? 'bg-amber-400 text-black font-bold'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-200/70'
                  }`}
                  title="Toggle Compact / Full Exercise Details (A)"
                >
                  <Type className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsShortcutsModalOpen(true)}
                  className="p-2 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-200/70 transition-colors cursor-pointer"
                  title="Keyboard Shortcuts"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterPopoverOpen((prev) => !prev)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isFilterPopoverOpen || statusFilter !== 'all'
                      ? 'bg-amber-400 text-black'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-200/70'
                  }`}
                  title="Calendar Display & Compliance Filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {isFilterPopoverOpen && (
                  <div className="absolute right-0 top-10 w-60 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 z-40 space-y-3 text-xs">
                    <div className="font-black text-neutral-900 uppercase tracking-wider text-[11px]">
                      Filter Workouts
                    </div>
                    <div className="space-y-1">
                      {(
                        [
                          { id: 'all', label: 'All Workouts' },
                          { id: 'completed', label: 'Completed (Green)' },
                          { id: 'missed', label: 'Missed (Red)' },
                          { id: 'scheduled', label: 'Scheduled (Upcoming)' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setStatusFilter(opt.id)}
                          className={`w-full px-3 py-1.5 rounded-lg text-left font-semibold flex items-center justify-between cursor-pointer ${
                            statusFilter === opt.id
                              ? 'bg-amber-400 text-black font-bold'
                              : 'hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {statusFilter === opt.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <span className="font-semibold text-neutral-700">Show Sunday column</span>
                      <input
                        type="checkbox"
                        checked={showSundayColumn}
                        onChange={(e) => setShowSundayColumn(e.target.checked)}
                        className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Multi-Day Weekly Column Grid (MON 19 .. SAT 24 / SUN 25) */}
            <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto px-3 pb-4 pt-1">
              <div
                className="min-w-[920px] h-full grid gap-0 border border-neutral-300 rounded-t-lg bg-[#f4f5f7]"
                style={{
                  gridTemplateColumns: showSundayColumn
                    ? 'repeat(6, minmax(150px, 1fr)) minmax(90px, 0.55fr)'
                    : 'repeat(6, minmax(160px, 1fr))',
                }}
              >
                {weekDays.map((day) => {
                  const dayWorkouts = clientWorkouts.filter(
                    (w) =>
                      w.dateIso === day.iso &&
                      (statusFilter === 'all' || w.status === statusFilter)
                  );
                  const dayFlag = dayFlags[day.iso];

                  return (
                    <div
                      key={day.iso}
                      className={`flex flex-col min-h-[540px] border-r border-neutral-300 last:border-r-0 transition-colors ${
                        day.isToday
                          ? 'bg-white ring-2 ring-[#3b82f6] z-10'
                          : 'bg-[#f4f5f7]/70'
                      }`}
                    >
                      {/* Top Dark Day Name Header (MON, TUE, WED, THU, FRI, SAT, SUN) */}
                      <div className="bg-[#252a36] text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border-b border-neutral-700 flex items-center justify-between">
                        <span>{day.dayName}</span>
                        {dayFlag && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black truncate max-w-[90px]">
                            {dayFlag}
                          </span>
                        )}
                      </div>

                      {/* Sub-Header Bar with + icon, Bookmark icon, and Date Number */}
                      <div className="bg-[#e9ecef] px-2.5 py-1.5 border-b border-neutral-300 flex items-center justify-between text-neutral-600">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenAddWorkoutForDay(day.iso)}
                            className="p-0.5 rounded hover:bg-neutral-300/70 hover:text-black transition-colors cursor-pointer"
                            title={`Add or edit workout on ${day.dayName} ${day.dayNumber}`}
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFlagModalDateIso(day.iso);
                              setFlagInputText(dayFlags[day.iso] || '');
                            }}
                            className={`p-0.5 rounded hover:bg-neutral-300/70 transition-colors cursor-pointer ${
                              dayFlag ? 'text-amber-600' : 'hover:text-black'
                            }`}
                            title="Add day note / milestone bookmark"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          {copiedWorkout && (
                            <button
                              type="button"
                              onClick={() => handlePasteWorkoutToDate(day.iso)}
                              className="p-0.5 rounded bg-amber-400 text-black hover:bg-amber-300 transition-colors cursor-pointer"
                              title="Paste copied workout to this day"
                            >
                              <ClipboardPaste className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <span
                          className={`text-xs font-bold flex items-center justify-center ${
                            day.isToday
                              ? 'w-6 h-6 rounded-full bg-[#3b82f6] text-white shadow-2xs'
                              : 'text-neutral-600'
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                      </div>

                      {/* Day Column Content Area */}
                      <div className="flex-1 p-2 space-y-2.5">
                        {dayWorkouts.length === 0 ? (
                          <div
                            onClick={() => handleOpenAddWorkoutForDay(day.iso)}
                            className="h-full min-h-[180px] rounded-lg border border-transparent hover:border-dashed hover:border-neutral-300 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-neutral-400 text-xs gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Workout</span>
                          </div>
                        ) : (
                          dayWorkouts.map((workout) => {
                            const titleColorClass =
                              workout.status === 'completed'
                                ? 'text-emerald-600'
                                : workout.status === 'missed'
                                ? 'text-red-500'
                                : 'text-neutral-900';

                            return (
                              <div
                                key={workout.id}
                                onClick={() =>
                                  setEditingWorkout(JSON.parse(JSON.stringify(workout)))
                                }
                                className="bg-white rounded-md border border-neutral-200/90 shadow-2xs p-2.5 hover:border-amber-400 transition-all cursor-pointer"
                              >
                                {/* Workout Card Top Row: Checkbox, Colored Title, Copy & Move Icons */}
                                <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-neutral-100">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={workout.status === 'completed'}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        const nextStatus: WorkoutComplianceStatus = e.target
                                          .checked
                                          ? 'completed'
                                          : 'scheduled';
                                        updateClientWorkouts((prev) =>
                                          prev.map((w) =>
                                            w.id === workout.id
                                              ? {
                                                  ...w,
                                                  status: nextStatus,
                                                  exercises: w.exercises.map((ex) => ({
                                                    ...ex,
                                                    status: nextStatus,
                                                  })),
                                                }
                                              : w
                                          )
                                        );
                                      }}
                                      className="w-3.5 h-3.5 rounded border-neutral-300 accent-amber-400 cursor-pointer shrink-0"
                                    />
                                    <span
                                      className={`text-xs font-extrabold truncate ${titleColorClass}`}
                                    >
                                      {workout.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 text-neutral-400 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCopiedWorkout(workout);
                                      }}
                                      className="p-1 rounded hover:bg-neutral-100 hover:text-neutral-800 cursor-pointer"
                                      title="Copy Workout"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMovingWorkout(workout);
                                      }}
                                      className="p-1 rounded hover:bg-neutral-100 hover:text-neutral-800 cursor-pointer"
                                      title="Move Workout to another day"
                                    >
                                      <Move className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Vertical Timeline Exercise List */}
                                <div className="relative pl-4 space-y-3 before:content-[''] before:absolute before:left-[6px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-neutral-200">
                                  {workout.exercises.map((ex) => (
                                    <div key={ex.id} className="relative text-[11px] leading-snug">
                                      {/* Status Indicator Node on Timeline (✓ green, ✕ red, • dark) */}
                                      <button
                                        type="button"
                                        onClick={(e) =>
                                          handleCycleExerciseStatus(workout.id, ex.id, e)
                                        }
                                        title="Click to cycle exercise compliance (Scheduled → Completed → Missed)"
                                        className="absolute -left-4 top-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center cursor-pointer"
                                      >
                                        {ex.status === 'completed' && (
                                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                        )}
                                        {ex.status === 'missed' && (
                                          <X className="w-3 h-3 text-red-500 stroke-[3]" />
                                        )}
                                        {ex.status === 'scheduled' && (
                                          <span className="w-2 h-2 rounded-full bg-neutral-700" />
                                        )}
                                      </button>

                                      {/* Exercise Order + Name */}
                                      <div className="font-bold text-neutral-800 break-words">
                                        {ex.orderLabel}) {ex.name}
                                      </div>

                                      {/* Exercise Prescription Details */}
                                      {!compactTextMode && (
                                        <div className="text-neutral-500 space-y-0.5 mt-0.5 font-medium">
                                          {ex.note && <div>{ex.note}</div>}
                                          <div>Sets: {ex.sets}</div>
                                          <div>Reps: {ex.reps}</div>
                                          <div>Weight: {ex.weight}</div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 2: DIRECT MESSAGES WITH CLIENT
           --------------------------------------------------------- */}
        {activeTab === 'messages' && (
          <div className="flex-1 min-h-0 flex flex-col p-6 max-w-4xl mx-auto w-full">
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="px-6 py-4 bg-[#252a36] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center">
                    {getInitials(client.name)}
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold">{client.name}</h2>
                    <p className="text-[11px] text-neutral-300">Direct Coaching Channel</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('workouts')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                >
                  Back to Workouts
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#f8f9fa]">
                {chatHistory.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-md ${
                      m.sender === 'trainer' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.sender === 'trainer'
                          ? 'bg-amber-400 text-black font-semibold rounded-br-xs'
                          : 'bg-white border border-neutral-200 text-neutral-900 rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1 px-1">{m.time}</span>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatDraft.trim()) return;
                  setChatHistory((prev) => [
                    ...prev,
                    {
                      id: `msg-${Date.now()}`,
                      sender: 'trainer',
                      text: chatDraft.trim(),
                      time: 'Just now',
                    },
                  ]);
                  setChatDraft('');
                }}
                className="p-4 bg-white border-t border-neutral-200 flex items-center gap-2.5"
              >
                <input
                  type="text"
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder={`Message ${client.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-full border border-neutral-300 text-xs sm:text-sm outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 3: CLIENT GOALS
           --------------------------------------------------------- */}
        {activeTab === 'goals' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-neutral-900">
                    {client.name} — Goals
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Track performance milestones, strength targets, and consistency habits.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newGoalTitle.trim()) return;
                  setClientGoals((prev) => [
                    {
                      id: `g-${Date.now()}`,
                      title: newGoalTitle.trim(),
                      category: 'Performance',
                      targetDate: 'Dec 2026',
                      progress: 25,
                      status: 'Active',
                    },
                    ...prev,
                  ]);
                  setNewGoalTitle('');
                }}
                className="bg-white p-4 rounded-2xl border border-neutral-200/90 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="Add a new goal for this client (e.g. Back Squat 100kg)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer"
                >
                  + Add Goal
                </button>
              </form>

              <div className="space-y-3">
                {clientGoals.map((g) => (
                  <div
                    key={g.id}
                    className="bg-white rounded-2xl border border-neutral-200/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/25 text-neutral-900 font-bold text-[10px]">
                          {g.category}
                        </span>
                        <span className="text-xs text-neutral-400">Target: {g.targetDate}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-neutral-900">{g.title}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-36">
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span>Progress</span>
                          <span>{g.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${g.progress}%` }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setClientGoals((prev) =>
                            prev.map((item) =>
                              item.id === g.id
                                ? { ...item, progress: Math.min(100, item.progress + 10) }
                                : item
                            )
                          )
                        }
                        className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold cursor-pointer"
                      >
                        +10%
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 4: NUTRITION & MACROS
           --------------------------------------------------------- */}
        {activeTab === 'nutrition' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-xl font-black text-neutral-900">
                {client.name} — Nutrition & Macro Targets
              </h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(
                  [
                    { key: 'protein', label: 'Protein (g)', color: 'border-emerald-500' },
                    { key: 'carbs', label: 'Carbs (g)', color: 'border-amber-400' },
                    { key: 'fat', label: 'Fat (g)', color: 'border-blue-500' },
                    { key: 'calories', label: 'Daily kcal', color: 'border-neutral-900' },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.key}
                    className={`bg-white rounded-2xl p-4 border-t-4 ${item.color} shadow-2xs border border-neutral-200`}
                  >
                    <label className="block text-xs font-bold text-neutral-500 mb-1">
                      {item.label}
                    </label>
                    <input
                      type="number"
                      value={macroTargets[item.key]}
                      onChange={(e) =>
                        setMacroTargets((prev) => ({
                          ...prev,
                          [item.key]: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full text-xl font-black text-neutral-900 outline-none bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 5: METRICS
           --------------------------------------------------------- */}
        {activeTab === 'metrics' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-5">
              <h1 className="text-xl font-black text-neutral-900">
                {client.name} — Performance & Body Metrics
              </h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newMetricName.trim() || !newMetricVal.trim()) return;
                  setClientMetrics((prev) => [
                    {
                      id: `m-${Date.now()}`,
                      name: newMetricName.trim(),
                      value: newMetricVal.trim(),
                      unit: newMetricUnit,
                      date: 'Oct 23, 2026',
                      change: 'New',
                    },
                    ...prev,
                  ]);
                  setNewMetricName('');
                  setNewMetricVal('');
                }}
                className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-wrap items-center gap-3"
              >
                <input
                  type="text"
                  value={newMetricName}
                  onChange={(e) => setNewMetricName(e.target.value)}
                  placeholder="Metric name (e.g. Back Squat 1RM)"
                  className="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl border border-neutral-300 text-xs"
                />
                <input
                  type="text"
                  value={newMetricVal}
                  onChange={(e) => setNewMetricVal(e.target.value)}
                  placeholder="Value"
                  className="w-28 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs"
                />
                <input
                  type="text"
                  value={newMetricUnit}
                  onChange={(e) => setNewMetricUnit(e.target.value)}
                  placeholder="Unit"
                  className="w-20 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Log Metric
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clientMetrics.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl p-5 border border-neutral-200/90 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-500">{m.name}</div>
                      <div className="text-2xl font-black text-neutral-900 mt-0.5">
                        {m.value} <span className="text-sm font-bold text-neutral-500">{m.unit}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">Logged {m.date}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                      {m.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 6: LIMITATIONS & COACH NOTES
           --------------------------------------------------------- */}
        {activeTab === 'notes' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-5">
              <h1 className="text-xl font-black text-neutral-900">
                {client.name} — Injuries, Limitations & Coach Notes
              </h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newNoteTitle.trim()) return;
                  setCoachNotes((prev) => [
                    {
                      id: `n-${Date.now()}`,
                      title: newNoteTitle.trim(),
                      category: 'Coach Note',
                      content: newNoteBody.trim() || 'Recorded by coach.',
                      updated: 'Oct 23, 2026',
                    },
                    ...prev,
                  ]);
                  setNewNoteTitle('');
                  setNewNoteBody('');
                }}
                className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-3"
              >
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note or limitation title..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-bold"
                />
                <textarea
                  rows={2}
                  value={newNoteBody}
                  onChange={(e) => setNewNoteBody(e.target.value)}
                  placeholder="Details, movement modifications, or medical considerations..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Save Note
                </button>
              </form>

              <div className="space-y-3">
                {coachNotes.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white rounded-2xl p-5 border border-neutral-200/90 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-bold text-[10px]">
                        {n.category}
                      </span>
                      <span className="text-[11px] text-neutral-400">{n.updated}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-neutral-900">{n.title}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 7: DOCUMENTS
           --------------------------------------------------------- */}
        {activeTab === 'documents' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-xl font-black text-neutral-900">
                {client.name} — Shared Documents
              </h1>
              <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
                {[
                  { name: 'PAR-Q & Athletic Health Intake.pdf', date: 'Oct 01, 2026', status: 'Signed' },
                  { name: 'Pure Function Olympic Lifting Warmup Protocol.pdf', date: 'Oct 10, 2026', status: 'Shared' },
                  { name: 'Macro & Peri-Workout Fueling Guide.pdf', date: 'Oct 15, 2026', status: 'Shared' },
                ].map((doc) => (
                  <div
                    key={doc.name}
                    className="p-4 flex items-center justify-between hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="text-xs font-bold text-neutral-900">{doc.name}</div>
                        <div className="text-[11px] text-neutral-400">Updated {doc.date}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 8: SKELETON / 4-WEEK PROGRAM OVERVIEW
           --------------------------------------------------------- */}
        {activeTab === 'skeleton' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-neutral-900">
                    {client.name} — Skeleton Overview
                  </h1>
                  <p className="text-xs text-neutral-500">
                    High-level view of exercise structure across the week.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('workouts')}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Full Calendar View
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clientWorkouts.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => {
                      setActiveTab('workouts');
                      setEditingWorkout(JSON.parse(JSON.stringify(w)));
                    }}
                    className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-2 hover:border-amber-400 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-neutral-900">{w.dateIso}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          w.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : w.status === 'missed'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                    <div className="space-y-1 pt-1">
                      {w.exercises.map((ex) => (
                        <div key={ex.id} className="text-xs text-neutral-700 truncate">
                          <span className="font-bold">{ex.orderLabel})</span> {ex.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 9: PROGRESS PICTURES
           --------------------------------------------------------- */}
        {activeTab === 'pictures' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-xl font-black text-neutral-900">
                {client.name} — Progress Pictures
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Front Posture Check', 'Lateral Overhead Mobility', 'Posterior Scapular Symmetry'].map(
                  (pose, idx) => (
                    <div
                      key={pose}
                      className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col items-center justify-center text-center min-h-[210px]"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mb-3">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-neutral-900">{pose}</div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Check-in #{idx + 1} • Oct 2026
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 10: EQUIPMENT
           --------------------------------------------------------- */}
        {activeTab === 'equipment' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-5">
              <h1 className="text-xl font-black text-neutral-900">
                {client.name} — Available Training Equipment
              </h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newEquipItem.trim()) return;
                  setClientEquipment((prev) => [...prev, newEquipItem.trim()]);
                  setNewEquipItem('');
                }}
                className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={newEquipItem}
                  onChange={(e) => setNewEquipItem(e.target.value)}
                  placeholder="Add equipment (e.g. GHD Machine, Assault Bike)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  + Add Equipment
                </button>
              </form>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clientEquipment.map((eq) => (
                  <div
                    key={eq}
                    className="bg-white rounded-xl p-3.5 border border-neutral-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Dumbbell className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-neutral-800">{eq}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setClientEquipment((prev) => prev.filter((item) => item !== eq))
                      }
                      className="text-neutral-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 11: CLIENT EXERCISE HISTORY SEARCH
           --------------------------------------------------------- */}
        {activeTab === 'exerciseSearch' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-5">
              <h1 className="text-xl font-black text-neutral-900">
                {client.name} — Exercise History Lookup
              </h1>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center gap-3">
                <Search className="w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={clientHistoryQuery}
                  onChange={(e) => setClientHistoryQuery(e.target.value)}
                  placeholder="Search assigned exercises (e.g. Snatch, Push Press, Squat)..."
                  className="flex-1 text-xs sm:text-sm outline-none"
                />
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
                {clientWorkouts
                  .flatMap((w) =>
                    w.exercises.map((ex) => ({
                      ...ex,
                      dateIso: w.dateIso,
                    }))
                  )
                  .filter((item) =>
                    item.name.toLowerCase().includes(clientHistoryQuery.trim().toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={`${item.dateIso}-${item.id}`}
                      className="p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-extrabold text-neutral-900">
                          {item.orderLabel}) {item.name}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Sets: {item.sets} • Reps: {item.reps} • Note: {item.note}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-neutral-800">{item.dateIso}</div>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            item.status === 'completed'
                              ? 'text-emerald-600'
                              : item.status === 'missed'
                              ? 'text-red-500'
                              : 'text-neutral-500'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 12: WEARABLES & HEALTH SYNC
           --------------------------------------------------------- */}
        {activeTab === 'wearables' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-neutral-900">
                    {client.name} — Connected Wearables
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Live Apple Health, Garmin & Oura Ring readiness telemetry.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Synced Today
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Daily Steps', value: '11,420', sub: 'Goal: 10,000' },
                  { label: 'Sleep Duration', value: '7h 52m', sub: 'Efficiency: 91%' },
                  { label: 'HRV (rMSSD)', value: '78 ms', sub: 'Optimal Recovery' },
                  { label: 'Resting HR', value: '52 bpm', sub: '7d Avg: 53 bpm' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl p-4 border border-neutral-200"
                  >
                    <div className="text-xs font-bold text-neutral-500">{stat.label}</div>
                    <div className="text-xl font-black text-neutral-900 mt-1">{stat.value}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                      {stat.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 13: CLIENT SETTINGS / PROFILE EDITOR
           --------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fullName = `${profileFirstName.trim()} ${profileLastName.trim()}`.trim();
                onUpdateClient?.(client.id, {
                  name: fullName || client.name,
                  firstName: profileFirstName.trim(),
                  lastName: profileLastName.trim(),
                  email: profileEmail.trim(),
                  clientType: profileType,
                });
                setProfileSavedToast(true);
                setTimeout(() => setProfileSavedToast(false), 2500);
              }}
              className="max-w-2xl mx-auto bg-white rounded-3xl border border-neutral-200 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h1 className="text-lg font-black text-neutral-900">
                    Client Settings — {client.name}
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Configure client coaching mode, contact details, and profile preferences.
                  </p>
                </div>
                {profileSavedToast && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Saved!
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700">Client Type</label>
                <div className="grid grid-cols-3 gap-2 bg-neutral-100 p-1 rounded-xl">
                  {(['Remote', 'Dual', 'In-Person'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setProfileType(t)}
                      className={`py-2 rounded-lg text-xs font-bold cursor-pointer ${
                        profileType === t
                          ? 'bg-amber-400 text-black shadow-2xs'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">First Name</label>
                  <input
                    type="text"
                    value={profileFirstName}
                    onChange={(e) => setProfileFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">Last Name</label>
                  <input
                    type="text"
                    value={profileLastName}
                    onChange={(e) => setProfileLastName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------------
            TAB 14: CLIENT BILLING & SUBSCRIPTIONS
           --------------------------------------------------------- */}
        {activeTab === 'billing' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-neutral-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black text-neutral-900">
                    {client.name} — Billing & Subscription
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Manage recurring coaching packages and invoice history.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-black font-bold text-xs">
                  Active Plan
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#f4f5f7] flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-neutral-900">
                    Pure Function Dual Coaching — Monthly
                  </div>
                  <div className="text-xs text-neutral-500">Renews Nov 01, 2026</div>
                </div>
                <div className="text-lg font-black text-neutral-900">$249 / mo</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          MODAL 1: EDIT / ADD WORKOUT & EXERCISES (Connected to 380-Exercise Library)
         ========================================================= */}
      {editingWorkout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setEditingWorkout(null);
            setActiveExercisePickerIndex(null);
          }}
        >
          <form
            onSubmit={handleSaveEditingWorkout}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-[#252a36] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {client.name} • {editingWorkout.dateIso}
                </span>
                <h2 className="text-base font-extrabold">Workout Builder</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteWorkout(editingWorkout.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingWorkout(null);
                    setActiveExercisePickerIndex(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Workout Title
                  </label>
                  <input
                    type="text"
                    value={editingWorkout.title}
                    onChange={(e) =>
                      setEditingWorkout({ ...editingWorkout, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Compliance Status
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 p-1 rounded-xl">
                    {(
                      [
                        { id: 'scheduled', label: 'Scheduled' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'missed', label: 'Missed' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() =>
                          setEditingWorkout({
                            ...editingWorkout,
                            status: st.id,
                            exercises: editingWorkout.exercises.map((ex) => ({
                              ...ex,
                              status: st.id,
                            })),
                          })
                        }
                        className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          editingWorkout.status === st.id
                            ? st.id === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : st.id === 'missed'
                              ? 'bg-red-500 text-white'
                              : 'bg-amber-400 text-black'
                            : 'text-neutral-600'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
                    Exercises ({editingWorkout.exercises.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = editingWorkout.exercises.length + 1;
                      const defaultLetter = String.fromCharCode(64 + Math.min(26, nextIdx));
                      setEditingWorkout({
                        ...editingWorkout,
                        exercises: [
                          ...editingWorkout.exercises,
                          {
                            id: `ex-${Date.now()}`,
                            orderLabel: defaultLetter,
                            name: '10 Month Position Barbell Press',
                            note: 'offset',
                            sets: '2-3',
                            reps: '5-10',
                            weight: '____',
                            status: editingWorkout.status,
                          },
                        ],
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Exercise</span>
                  </button>
                </div>

                {editingWorkout.exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-2xl border border-neutral-200 bg-[#f9fafb] space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ex.orderLabel}
                        onChange={(e) => {
                          const next = [...editingWorkout.exercises];
                          next[idx] = { ...ex, orderLabel: e.target.value };
                          setEditingWorkout({ ...editingWorkout, exercises: next });
                        }}
                        className="w-14 px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-black text-center"
                        placeholder="A1"
                      />
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={ex.name}
                          onFocus={() => {
                            setActiveExercisePickerIndex(idx);
                            setExerciseSearchQuery(ex.name);
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExerciseSearchQuery(val);
                            setActiveExercisePickerIndex(idx);
                            const next = [...editingWorkout.exercises];
                            next[idx] = { ...ex, name: val };
                            setEditingWorkout({ ...editingWorkout, exercises: next });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-bold"
                          placeholder="Exercise name (search 380+ library exercises)..."
                        />

                        {activeExercisePickerIndex === idx && (
                          <div className="absolute left-0 right-0 mt-1 max-h-44 overflow-y-auto bg-white rounded-xl shadow-xl border border-neutral-200 z-30 divide-y divide-neutral-100">
                            {filteredLibrarySuggestions.map((libEx) => (
                              <button
                                key={libEx.id}
                                type="button"
                                onClick={() => {
                                  const next = [...editingWorkout.exercises];
                                  next[idx] = { ...ex, name: libEx.name };
                                  setEditingWorkout({ ...editingWorkout, exercises: next });
                                  setActiveExercisePickerIndex(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-amber-50 flex items-center justify-between cursor-pointer"
                              >
                                <span className="font-bold text-neutral-900">{libEx.name}</span>
                                <span className="text-[10px] text-neutral-400">
                                  {libEx.patterns || libEx.from.toUpperCase()}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const next = editingWorkout.exercises.filter((_, i) => i !== idx);
                          setEditingWorkout({ ...editingWorkout, exercises: next });
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                        title="Remove exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500">
                          Note
                        </label>
                        <input
                          type="text"
                          value={ex.note}
                          onChange={(e) => {
                            const next = [...editingWorkout.exercises];
                            next[idx] = { ...ex, note: e.target.value };
                            setEditingWorkout({ ...editingWorkout, exercises: next });
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-neutral-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500">
                          Sets
                        </label>
                        <input
                          type="text"
                          value={ex.sets}
                          onChange={(e) => {
                            const next = [...editingWorkout.exercises];
                            next[idx] = { ...ex, sets: e.target.value };
                            setEditingWorkout({ ...editingWorkout, exercises: next });
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-neutral-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500">
                          Reps
                        </label>
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={(e) => {
                            const next = [...editingWorkout.exercises];
                            next[idx] = { ...ex, reps: e.target.value };
                            setEditingWorkout({ ...editingWorkout, exercises: next });
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-neutral-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500">
                          Weight
                        </label>
                        <input
                          type="text"
                          value={ex.weight}
                          onChange={(e) => {
                            const next = [...editingWorkout.exercises];
                            next[idx] = { ...ex, weight: e.target.value };
                            setEditingWorkout({ ...editingWorkout, exercises: next });
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-neutral-300 bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditingWorkout(null);
                  setActiveExercisePickerIndex(null);
                }}
                className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold cursor-pointer"
              >
                Save Workout
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL 2: MOVE WORKOUT TO ANOTHER DAY
         ========================================================= */}
      {movingWorkout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setMovingWorkout(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="bg-amber-400 px-5 py-3.5 flex items-center justify-between text-black">
              <span className="font-extrabold text-sm">Move Workout to Day</span>
              <button
                type="button"
                onClick={() => setMovingWorkout(null)}
                className="p-1 rounded-full hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {weekDays.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => handleMoveWorkoutToDate(d.iso)}
                  className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between cursor-pointer ${
                    d.iso === movingWorkout.dateIso
                      ? 'bg-neutral-900 text-amber-400'
                      : 'bg-neutral-100 hover:bg-amber-400/30 text-neutral-800'
                  }`}
                >
                  <span>
                    {d.dayName} {d.dayNumber} ({d.iso})
                  </span>
                  {d.iso === movingWorkout.dateIso && <span>Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: DAY BOOKMARK / MILESTONE TAG
         ========================================================= */}
      {flagModalDateIso && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setFlagModalDateIso(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDayFlags((prev) => {
                const next = { ...prev };
                if (flagInputText.trim()) {
                  next[flagModalDateIso] = flagInputText.trim();
                } else {
                  delete next[flagModalDateIso];
                }
                return next;
              });
              setFlagModalDateIso(null);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="bg-amber-400 px-5 py-3.5 flex items-center justify-between text-black">
              <span className="font-extrabold text-sm">
                Day Note / Event ({flagModalDateIso})
              </span>
              <button
                type="button"
                onClick={() => setFlagModalDateIso(null)}
                className="p-1 rounded-full hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <input
                type="text"
                autoFocus
                value={flagInputText}
                onChange={(e) => setFlagInputText(e.target.value)}
                placeholder="e.g. Deload Day, Travel, 1RM Test..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm outline-none focus:border-amber-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFlagModalDateIso(null)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Save Tag
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL 4: KEYBOARD SHORTCUTS
         ========================================================= */}
      {isShortcutsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setIsShortcutsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="bg-[#252a36] text-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-extrabold text-sm">Calendar Keyboard Shortcuts</span>
              <button
                type="button"
                onClick={() => setIsShortcutsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2.5 text-xs">
              {[
                { key: 'Click Workout Card', desc: 'Open Workout Builder & Exercise Editor' },
                { key: 'Click ✓ / ✕ / •', desc: 'Cycle Exercise Compliance Status' },
                { key: 'Copy Icon', desc: 'Copy Workout to Clipboard for 1-Click Paste' },
                { key: 'Move Icon', desc: 'Move Workout to Another Day of the Week' },
                { key: 'A Button', desc: 'Toggle Compact vs Full Prescription Details' },
              ].map((sc) => (
                <div
                  key={sc.key}
                  className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-b-0"
                >
                  <span className="text-neutral-600">{sc.desc}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 font-bold text-neutral-900">
                    {sc.key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
