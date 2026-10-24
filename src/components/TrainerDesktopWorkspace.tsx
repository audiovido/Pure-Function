import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Share2,
  Building2,
  Filter,
  Bell,
  MessageSquare,
  Search,
  Plus,
  Settings,
  Download,
  MoreHorizontal,
  Check,
  Gift,
  Send,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Play,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  AuthAccount,
  ClientProfile,
  DayWorkout,
  Exercise,
} from '../types';
import {
  ExercisePartnerSource,
  TRUECOACH_EXERCISE_LIBRARY,
  TrueCoachLibraryExercise,
} from '../data/trueCoachExerciseLibrary';
import {
  TrainerClientWorkspace,
  ClientSidebarTab,
} from './TrainerClientWorkspace';
import { TrainerExerciseEditorView } from './TrainerExerciseEditorView';
import {
  getTodayDateString,
  addDaysToKey,
  parseDateKey,
} from '../utils/dateUtils';
import { isDayCompleted } from '../utils/progress';

function formatDueLabel(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export type DesktopPrimaryNav =
  | 'clients'
  | 'library'
  | 'programs'
  | 'payments'
  | 'referrals'
  | 'teams'
  | 'marketing'
  | 'activity'
  | 'messages'
  | 'account';

export type LibrarySubTab =
  | 'exercises'
  | 'warmups'
  | 'cooldowns'
  | 'metricSets'
  | 'documents';

export type PaymentsSubTab =
  | 'dashboard'
  | 'products'
  | 'subscriptions'
  | 'oneTimePayments';

export type MarketingSubTab = 'publicProfile' | 'leads';

interface TrainerDesktopWorkspaceProps {
  clients: ClientProfile[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onOpenClientProfile: (clientId: string) => void;
  onOpenClientWorkouts: (clientId: string) => void;
  onOpenDirectChat: (clientId: string) => void;
  onOpenEditClient: (client: ClientProfile) => void;
  onOpenClientManager: () => void;
  onUpdateClient?: (clientId: string, updates: Partial<ClientProfile>) => void;
  onOpenVideo: (exercise: Exercise) => void;
  onAddExerciseClick?: () => void;
  allClientWorkouts?: Record<string, DayWorkout[]>;
  onUpdateClientWorkouts?: (
    clientId: string,
    updater: (prev: DayWorkout[]) => DayWorkout[]
  ) => void;
  activeAccount?: AuthAccount | null;
  onSignOut?: () => void;
  activeNav: DesktopPrimaryNav;
  onSelectNav: (nav: DesktopPrimaryNav) => void;
  hasActiveSubScreen: boolean;
  onClearSubScreen: () => void;
  unreadActivityCount?: number;
  children?: React.ReactNode;
}

interface RosterRowMeta {
  dueLabel: string;
  dueType: 'orange' | 'red' | 'slate' | 'yellow';
  c7: number | null;
  c30: number | null;
  c90: number | null;
  group?: string;
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

const PureFunctionCircleBadge: React.FC<{ size?: 'sm' | 'md' }> = ({
  size = 'md',
}) => (
  <div
    className={`${
      size === 'sm' ? 'w-7 h-7 text-[6px]' : 'w-8 h-8 text-[6.5px]'
    } rounded-full bg-[#181b22] border border-amber-400/50 flex flex-col items-center justify-center leading-none font-black tracking-tighter select-none shrink-0 shadow-2xs`}
  >
    <span className="text-white">PURE</span>
    <span className="text-amber-400 mt-0.5">FUNCTION</span>
  </div>
);

const ExerciseFromBadge: React.FC<{ from: ExercisePartnerSource }> = ({
  from,
}) => {
  if (from === 'sa') {
    return (
      <div
        title="Stretch Affect"
        className="w-8 h-6 rounded bg-[#1d4ed8] text-white font-black text-[9px] tracking-tight flex items-center justify-center leading-none select-none shrink-0"
      >
        SA
      </div>
    );
  }
  if (from === 'ca') {
    return (
      <div
        title="Central Athlete"
        className="w-8 h-6 rounded bg-[#181b22] border border-amber-400/60 text-amber-400 font-black text-[9px] tracking-tight flex items-center justify-center leading-none select-none shrink-0"
      >
        CA
      </div>
    );
  }
  if (from === 'ko8') {
    return (
      <div
        title="KO8"
        className="w-8 h-6 rounded bg-neutral-900 text-white font-black text-[9px] tracking-tight flex items-center justify-center leading-none select-none shrink-0"
      >
        KO8
      </div>
    );
  }
  if (from === 'usaw') {
    return (
      <div
        title="USA Weightlifting"
        className="px-1.5 h-6 rounded bg-[#b91c1c] text-white font-black text-[8px] tracking-tight flex items-center justify-center leading-none select-none shrink-0"
      >
        USAW
      </div>
    );
  }
  if (from === 'issa') {
    return (
      <div
        title="ISSA"
        className="px-1.5 h-6 rounded bg-[#0f172a] text-amber-400 font-black text-[8px] tracking-tight flex items-center justify-center leading-none select-none shrink-0"
      >
        ISSA
      </div>
    );
  }
  if (from === 'restoic') {
    return (
      <div
        title="Restoic"
        className="w-8 h-6 rounded bg-neutral-700 text-white font-black text-[8px] tracking-tight flex items-center justify-center leading-none select-none shrink-0"
      >
        RST
      </div>
    );
  }
  return <PureFunctionCircleBadge size="sm" />;
};

export const TrainerDesktopWorkspace: React.FC<
  TrainerDesktopWorkspaceProps
> = ({
  clients,
  onSelectClient,
  onOpenClientProfile,
  onOpenClientWorkouts,
  onOpenDirectChat,
  onOpenEditClient,
  onOpenClientManager,
  onUpdateClient,
  onOpenVideo,
  ActiveNavProp,
  ...rest
}: TrainerDesktopWorkspaceProps & { ActiveNavProp?: DesktopPrimaryNav }) => {
  const {
    activeNav,
    onSelectNav,
    hasActiveSubScreen,
    onClearSubScreen,
    unreadActivityCount = 1,
    allClientWorkouts,
    onUpdateClientWorkouts,
    children,
  } = rest;

  // Sub-navigation states
  const [librarySubTab, setLibrarySubTab] =
    useState<LibrarySubTab>('exercises');
  const [paymentsSubTab, setPaymentsSubTab] =
    useState<PaymentsSubTab>('dashboard');
  const [marketingSubTab, setMarketingSubTab] =
    useState<MarketingSubTab>('publicProfile');
  const [selectedCoachId, setSelectedCoachId] = useState<string>('hamoon');

  // Clients & Teams states
  const [clientsTab, setClientsTab] = useState<'active' | 'archived' | 'leads'>(
    'active'
  );
  const [teamsTab, setTeamsTab] = useState<'active' | 'archived'>('active');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [clientGroupsMap, setClientGroupsMap] = useState<
    Record<string, string>
  >({});
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
  const [desktopClientId, setDesktopClientId] = useState<string | null>(null);
  const [desktopClientInitialTab, setDesktopClientInitialTab] =
    useState<ClientSidebarTab>('workouts');
  const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<string[]>([
    'Morning Group',
    'Strength & Mobility',
    'In-Person Studio',
  ]);
  const [newGroupName, setNewGroupName] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Library -> Exercises state
  const [partnerToggles, setPartnerToggles] = useState<Record<string, boolean>>(
    {
      'Central Athlete': true,
      USAW: true,
      KO8: true,
      Restoic: true,
      ISSA: true,
      'Stretch Affect': true,
    }
  );
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exercisePatternFilter, setExercisePatternFilter] = useState('');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState('');
  const [exercisePlaneFilter, setExercisePlaneFilter] = useState('');
  const [selectedLibraryExerciseId, setSelectedLibraryExerciseId] = useState<
    string | null
  >(null);
  const [isCreatingLibraryExercise, setIsCreatingLibraryExercise] =
    useState(false);
  const [libraryExercises, setLibraryExercises] = useState<
    TrueCoachLibraryExercise[]
  >(TRUECOACH_EXERCISE_LIBRARY);

  // Library -> Warmups state (Exact rows from Screenshot 3)
  const [warmupsList, setWarmupsList] = useState<
    { id: string; name: string; instructions: string }[]
  >([
    {
      id: 'wm-1',
      name: 'Dynamic Warmup 1.0',
      instructions:
        'High knee tuck High knee run Hurdler stretch Butt kick run Figure 4 Straight leg march Walkin...',
    },
    {
      id: 'wm-2',
      name: 'Dynamic warmup 2.0',
      instructions:
        'Low lateral shuffle Karaoke quick step Heel to toe walk Heel walk Toe walk Fire hydrants Mon...',
    },
    {
      id: 'wm-3',
      name: 'General Warmup',
      instructions:
        '3 sets (increase effort each set): Row 1:00 Air Bike 1:00 Run 1:00 THEN 3 sets of: 10 forward/b...',
    },
    {
      id: 'wm-4',
      name: 'Ski',
      instructions: 'Ski 500',
    },
    {
      id: 'wm-5',
      name: 'Squat Prep',
      instructions:
        '3 sets not for time: 10 Reverse Hypers 5 Cossack Squat/side :30 hollow body hold 10 lateral bande...',
    },
  ]);

  // Library -> Cooldowns state
  const [cooldownsList, setCooldownsList] = useState<
    { id: string; name: string; instructions: string }[]
  >([
    {
      id: 'cd-1',
      name: '90/90 Parasympathetic Downregulation',
      instructions:
        '5 minutes supine 90/90 nasal breathing: 4s inhale, 6s exhale, 2s pause.',
    },
    {
      id: 'cd-2',
      name: 'Lower Body Decompression',
      instructions:
        'Couch stretch 90s/side, pigeon glute stretch 90s/side, supine hamstring floss 10 reps/side.',
    },
  ]);

  // Library -> Metric Sets state (Exact rows from Screenshot 4)
  const [metricSetsList, setMetricSetsList] = useState<
    {
      id: string;
      name: string;
      description: string;
      metricsCount: number;
      assignmentsCount: number;
    }[]
  >([
    {
      id: 'ms-1',
      name: 'Barbell Exercises',
      description: '',
      metricsCount: 5,
      assignmentsCount: 7,
    },
    {
      id: 'ms-2',
      name: 'Cable Exercises',
      description: '',
      metricsCount: 3,
      assignmentsCount: 7,
    },
    {
      id: 'ms-3',
      name: 'Calisthenics',
      description: '',
      metricsCount: 2,
      assignmentsCount: 3,
    },
    {
      id: 'ms-4',
      name: 'Dumbbell Exercises',
      description: '',
      metricsCount: 5,
      assignmentsCount: 12,
    },
    {
      id: 'ms-5',
      name: 'Hex Bar',
      description: '',
      metricsCount: 1,
      assignmentsCount: 0,
    },
    {
      id: 'ms-6',
      name: 'KBOX flywheel',
      description: '',
      metricsCount: 5,
      assignmentsCount: 14,
    },
    {
      id: 'ms-7',
      name: 'Landmine Exercises',
      description: '',
      metricsCount: 1,
      assignmentsCount: 1,
    },
    {
      id: 'ms-8',
      name: 'Leg press',
      description: '',
      metricsCount: 1,
      assignmentsCount: 20,
    },
    {
      id: 'ms-9',
      name: 'Olympic Lifts',
      description: '',
      metricsCount: 8,
      assignmentsCount: 11,
    },
    {
      id: 'ms-10',
      name: 'Progress report',
      description: '',
      metricsCount: 3,
      assignmentsCount: 20,
    },
  ]);

  // Library -> Documents state
  const [documentsList, setDocumentsList] = useState<
    { id: string; name: string; sharedWith: string; updated: string }[]
  >([
    {
      id: 'doc-1',
      name: 'Pure Function Welcome & Movement Guide.pdf',
      sharedWith: 'All Clients',
      updated: 'Oct 15, 2026',
    },
    {
      id: 'doc-2',
      name: 'Daily Nutrition & Hydration Protocol.pdf',
      sharedWith: '18 Clients',
      updated: 'Oct 10, 2026',
    },
  ]);

  // Programs state (Exact rows from Screenshot 5)
  const [programSearch, setProgramSearch] = useState('');
  const [programsList, setProgramsList] = useState<
    {
      id: string;
      days: number;
      name: string;
      description?: string;
      activeClients: number;
      tags: string[];
    }[]
  >([
    {
      id: 'prog-1',
      days: 5,
      name: 'Beginner Olympic Lifts - JL',
      activeClients: 0,
      tags: [],
    },
    {
      id: 'prog-2',
      days: 26,
      name: 'Beginners program - DD',
      description:
        'Learn breathing, rib cage position, pelvic control, core engagement.',
      activeClients: 0,
      tags: [],
    },
    {
      id: 'prog-3',
      days: 1,
      name: 'Core and stability',
      description:
        'Class is tailored to strengthen core by working on anti-movements such as anti-rotation and an...',
      activeClients: 0,
      tags: [],
    },
    {
      id: 'prog-4',
      days: 22,
      name: 'Core & Stability- DD',
      description:
        'This class is designed to strengthen the core and improve full body stability for better lifting per...',
      activeClients: 0,
      tags: [],
    },
    {
      id: 'prog-5',
      days: 5,
      name: 'Engine - JL',
      activeClients: 0,
      tags: [],
    },
  ]);
  const [assigningProgramId, setAssigningProgramId] = useState<string | null>(
    null
  );

  // Add Item Modal State (for Warmup / Cooldown / Metric Set / Program / Exercise)
  const [quickModalType, setQuickModalType] = useState<
    | null
    | 'exercise'
    | 'warmup'
    | 'cooldown'
    | 'metricSet'
    | 'document'
    | 'program'
  >(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickDays, setQuickDays] = useState('12');

  // Payments state (Screenshot 6)
  const [stripeAccountType, setStripeAccountType] = useState<
    'individual' | 'organization'
  >('individual');
  const [stripeConnected, setStripeConnected] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Teams Coaches state (Screenshot 7)
  const [coachesList, setCoachesList] = useState<
    {
      id: string;
      name: string;
      isOwner?: boolean;
      clientsCount: number;
      role: string;
      c7?: number;
      c30?: number;
      c90?: number;
      usePureFunctionBadge?: boolean;
    }[]
  >([
    {
      id: 'hamoon',
      name: 'Hamoon Hosseinpour',
      isOwner: true,
      clientsCount: 46,
      role: 'Admin',
      c7: 100,
      c30: 42,
      c90: 42,
      usePureFunctionBadge: true,
    },
    {
      id: 'joshua',
      name: 'Joshua Larson',
      clientsCount: 4,
      role: 'Admin',
      c7: 100,
      c30: 100,
      c90: 100,
    },
    {
      id: 'johana',
      name: 'Johana Hernandez',
      clientsCount: 0,
      role: 'Admin',
    },
  ]);
  const [isAddCoachOpen, setIsAddCoachOpen] = useState(false);
  const [newCoachName, setNewCoachName] = useState('');

  // Marketing -> Public Profile state (Screenshot 8)
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);
  const [isProfileLive, setIsProfileLive] = useState(true);
  const [businessName, setBusinessName] = useState('purefunction inc');
  const [profileSlug, setProfileSlug] = useState('pure-function');
  const [publicEmail, setPublicEmail] = useState(
    'purefunctionfitness@gmail.com'
  );
  const [publicPhone, setPublicPhone] = useState('8188509180');
  const [publicAbout, setPublicAbout] = useState(
    'Nestled in the heart of Woodland Hills, Pure Function Fitness Center is more than just a boutique fitness studio. We help you move better and get stronger'
  );
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [savedBannerMsg, setSavedBannerMsg] = useState<string | null>(null);

  // Build combined display roster (Screenshot 1 & 7 rows + real app clients)
  const combinedRoster = useMemo(() => {
    const map = new Map<
      string,
      { client: ClientProfile; meta: RosterRowMeta }
    >();

    // Only real clients, with "due" computed from their actual workouts
    const today = getTodayDateString();
    clients.forEach((c) => {
      const days = allClientWorkouts?.[c.id] ?? [];
      const scheduled = days.filter((d) => d.exercises.length > 0);
      const nextDue = scheduled
        .filter((d) => d.date >= today && !isDayCompleted(d))
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      const overdue = scheduled
        .filter((d) => d.date < today && d.date >= addDaysToKey(today, -7) && !isDayCompleted(d))
        .sort((a, b) => b.date.localeCompare(a.date))[0];

      let dueLabel = 'None set';
      let dueType: 'orange' | 'red' | 'slate' | 'yellow' = 'slate';
      if (overdue) {
        dueLabel = formatDueLabel(overdue.date);
        dueType = 'red';
      } else if (nextDue) {
        dueLabel = nextDue.date === today ? 'Today' : formatDueLabel(nextDue.date);
        dueType = nextDue.date === today ? 'orange' : 'yellow';
      }

      map.set(c.id, {
        client: c,
        meta: {
          dueLabel,
          dueType,
          c7: c.compliance7d ?? null,
          c30: c.compliance30d ?? null,
          c90: c.compliance90d ?? null,
          group: clientGroupsMap[c.id],
        },
      });
    });

    return Array.from(map.values());
  }, [clients, clientGroupsMap, allClientWorkouts]);

  const filteredRoster = useMemo(() => {
    return combinedRoster.filter(({ client, meta }) => {
      const isArchived = Boolean(client.archived);
      if (activeNav === 'clients') {
        if (clientsTab === 'active' && isArchived) return false;
        if (clientsTab === 'archived' && !isArchived) return false;
        if (clientsTab === 'leads') return false;
      } else if (activeNav === 'teams') {
        if (teamsTab === 'active' && isArchived) return false;
        if (teamsTab === 'archived' && !isArchived) return false;
        if (selectedCoachId === 'johana') return false;
      }

      if (clientSearch.trim()) {
        const q = clientSearch.toLowerCase();
        const matchName = client.name.toLowerCase().includes(q);
        const matchGroup = (meta.group || '').toLowerCase().includes(q);
        return matchName || matchGroup;
      }
      return true;
    });
  }, [
    combinedRoster,
    activeNav,
    clientsTab,
    teamsTab,
    selectedCoachId,
    clientSearch,
  ]);

  const activeCoach =
    coachesList.find((c) => c.id === selectedCoachId) || coachesList[0];

  const handleExportClientsCsv = () => {
    const headers = ['Name', 'Email', 'Due', '7d %', '30d %', '90d %', 'Group'];
    const rows = combinedRoster.map(({ client, meta }) => [
      `"${client.name}"`,
      `"${client.email}"`,
      `"${meta.dueLabel}"`,
      meta.c7 ?? '',
      meta.c30 ?? '',
      meta.c90 ?? '',
      `"${meta.group || ''}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pure-function-clients.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveQuickModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    if (quickModalType === 'exercise') {
      setLibraryExercises((prev) => [
        {
          id: `lib-ex-${Date.now()}`,
          name: quickTitle.trim(),
          patterns: quickDesc.trim() || 'Core',
          types: 'External Loading',
          primaryMuscles: 'Full Body',
          planes: 'Sagittal',
          from: 'pf',
          videoUrl: 'https://vimeo.com/609364053',
          instructions:
            quickDesc.trim() ||
            'Maintain neutral spine and controlled tempo throughout each repetition.',
        },
        ...prev,
      ]);
    } else if (quickModalType === 'warmup') {
      setWarmupsList((prev) => [
        ...prev,
        {
          id: `wm-${Date.now()}`,
          name: quickTitle.trim(),
          instructions: quickDesc.trim() || '2 sets of dynamic preparation.',
        },
      ]);
    } else if (quickModalType === 'cooldown') {
      setCooldownsList((prev) => [
        ...prev,
        {
          id: `cd-${Date.now()}`,
          name: quickTitle.trim(),
          instructions: quickDesc.trim() || '5 minutes nasal recovery breathing.',
        },
      ]);
    } else if (quickModalType === 'metricSet') {
      setMetricSetsList((prev) => [
        ...prev,
        {
          id: `ms-${Date.now()}`,
          name: quickTitle.trim(),
          description: quickDesc.trim(),
          metricsCount: 3,
          assignmentsCount: 1,
        },
      ]);
    } else if (quickModalType === 'document') {
      setDocumentsList((prev) => [
        ...prev,
        {
          id: `doc-${Date.now()}`,
          name: quickTitle.trim(),
          sharedWith: 'All Clients',
          updated: 'Today',
        },
      ]);
    } else if (quickModalType === 'program') {
      setProgramsList((prev) => [
        {
          id: `prog-${Date.now()}`,
          days: parseInt(quickDays, 10) || 12,
          name: quickTitle.trim(),
          description: quickDesc.trim() || undefined,
          activeClients: 0,
          tags: [],
        },
        ...prev,
      ]);
    }

    setQuickTitle('');
    setQuickDesc('');
    setQuickModalType(null);
  };

  const getComplianceColorClass = (val: number) => {
    if (val >= 80) return 'text-emerald-600 font-bold';
    if (val >= 50) return 'text-amber-600 font-bold';
    return 'text-red-500 font-bold';
  };

  const renderClientsTable = () => (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-visible">
      {/* Table Header */}
      <div className="bg-[#252a36] text-white px-4 py-3 rounded-t-2xl grid grid-cols-12 items-center gap-3 text-xs font-bold">
        <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={
              filteredRoster.length > 0 &&
              selectedRowIds.length === filteredRoster.length
            }
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRowIds(filteredRoster.map((r) => r.client.id));
              } else {
                setSelectedRowIds([]);
              }
            }}
            className="w-4 h-4 rounded border-neutral-500 accent-amber-400 cursor-pointer"
          />
          <span className="flex items-center gap-1">
            Name
            <span className="text-[10px] text-amber-400">▲</span>
          </span>
        </div>
        <div className="col-span-3 sm:col-span-2">Due</div>
        <div className="hidden sm:block sm:col-span-3">Compliance rate</div>
        <div className="col-span-4 sm:col-span-3">Groups</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-neutral-200/80">
        {filteredRoster.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            No clients found.
          </div>
        ) : (
          filteredRoster.map(({ client, meta }) => {
            const isChecked = selectedRowIds.includes(client.id);
            const assignedGroup = clientGroupsMap[client.id];

            return (
              <div
                key={client.id}
                onClick={() => {
                  onSelectClient(client.id);
                  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                    setDesktopClientInitialTab('workouts');
                    setDesktopClientId(client.id);
                  } else {
                    onOpenClientProfile(client.id);
                  }
                }}
                className="px-4 py-3 grid grid-cols-12 items-center gap-3 hover:bg-neutral-50/90 transition-colors cursor-pointer relative"
              >
                {/* Name & Avatar */}
                <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => {
                      setSelectedRowIds((prev) =>
                        prev.includes(client.id)
                          ? prev.filter((id) => id !== client.id)
                          : [...prev, client.id]
                      );
                    }}
                    className="w-4 h-4 rounded border-neutral-300 accent-amber-400 cursor-pointer shrink-0"
                  />
                  <div className="w-9 h-9 rounded-full bg-[#252a36] text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
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
                  <span className="font-bold text-sm text-neutral-900 truncate hover:text-amber-600 transition-colors">
                    {client.name}
                  </span>
                </div>

                {/* Due Badge */}
                <div className="col-span-3 sm:col-span-2 flex items-center">
                  {meta.dueType === 'orange' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-bold text-[11px] whitespace-nowrap">
                      {meta.dueLabel}
                    </span>
                  )}
                  {meta.dueType === 'red' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold text-[11px] whitespace-nowrap">
                      {meta.dueLabel}
                    </span>
                  )}
                  {meta.dueType === 'slate' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-bold text-[11px] whitespace-nowrap">
                      {meta.dueLabel}
                    </span>
                  )}
                  {meta.dueType === 'yellow' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-neutral-900 font-bold text-[11px] whitespace-nowrap flex items-center gap-1">
                      <span>{meta.dueLabel}</span>
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Compliance Rate (7d, 30d, 90d) */}
                <div className="hidden sm:flex sm:col-span-3 items-center gap-5 text-xs tabular-nums">
                  {meta.c7 !== null ? (
                    <>
                      <span className={getComplianceColorClass(meta.c7)}>
                        {meta.c7}%
                      </span>
                      <span
                        className={getComplianceColorClass(meta.c30 ?? 50)}
                      >
                        {meta.c30}%
                      </span>
                      <span
                        className={getComplianceColorClass(meta.c90 ?? 30)}
                      >
                        {meta.c90}%
                      </span>
                    </>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </div>

                {/* Groups & Row Actions */}
                <div
                  className="col-span-4 sm:col-span-3 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const nextGroup =
                        assignedGroup === availableGroups[0]
                          ? availableGroups[1]
                          : availableGroups[0];
                      setClientGroupsMap((prev) => ({
                        ...prev,
                        [client.id]: assignedGroup ? '' : nextGroup,
                      }));
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer truncate ${
                      assignedGroup
                        ? 'border-amber-400 bg-amber-50 text-neutral-900'
                        : 'border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {assignedGroup ? assignedGroup : '+ Add to group'}
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuRowId((prev) =>
                          prev === client.id ? null : client.id
                        )
                      }
                      className="w-8 h-8 rounded-lg border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 cursor-pointer"
                      aria-label="Client actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {openMenuRowId === client.id && (
                      <div className="absolute right-0 top-9 z-30 w-40 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 text-xs font-semibold text-neutral-800">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuRowId(null);
                            onSelectClient(client.id);
                            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                              setDesktopClientInitialTab('workouts');
                              setDesktopClientId(client.id);
                            } else {
                              onOpenClientProfile(client.id);
                            }
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-neutral-100 cursor-pointer"
                        >
                          Client Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuRowId(null);
                            onSelectClient(client.id);
                            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                              setDesktopClientInitialTab('workouts');
                              setDesktopClientId(client.id);
                            } else {
                              onOpenClientWorkouts(client.id);
                            }
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-neutral-100 cursor-pointer"
                        >
                          Workouts
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuRowId(null);
                            onSelectClient(client.id);
                            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                              setDesktopClientInitialTab('messages');
                              setDesktopClientId(client.id);
                            } else {
                              onOpenDirectChat(client.id);
                            }
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-neutral-100 cursor-pointer"
                        >
                          Message
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuRowId(null);
                            onSelectClient(client.id);
                            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                              setDesktopClientInitialTab('settings');
                              setDesktopClientId(client.id);
                            } else {
                              onOpenEditClient(client);
                            }
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-neutral-100 cursor-pointer"
                        >
                          Edit Client
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const desktopActiveClient = useMemo(() => {
    if (!desktopClientId) return null;
    return (
      combinedRoster.find((r) => r.client.id === desktopClientId)?.client ||
      combinedRoster[0]?.client ||
      null
    );
  }, [desktopClientId, combinedRoster]);

  // Determine whether a secondary sub-sidebar should be open
  const showSecondarySidebar =
    !hasActiveSubScreen &&
    !desktopActiveClient &&
    (activeNav === 'library' ||
      activeNav === 'payments' ||
      activeNav === 'teams' ||
      activeNav === 'marketing');

  return (
    <div className="flex-1 min-h-0 flex w-full overflow-hidden bg-[#f4f5f7]">
      {/* =========================================================
          1. PRIMARY LEFT SIDEBAR (Starts directly from Clients, NO top icon)
         ========================================================= */}
      <aside
        aria-label="Trainer primary sidebar"
        className="hidden md:flex flex-col justify-between w-[156px] lg:w-[172px] shrink-0 bg-[#1a1d26] text-neutral-300 border-r border-neutral-800/80 select-none z-30"
      >
        {/* Top Navigation Items — Starts Directly from Clients */}
        <div className="pt-4 space-y-0.5">
          {(
            [
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'library', label: 'Library', icon: BookOpen },
              { id: 'programs', label: 'Programs', icon: Calendar },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'referrals', label: 'Referrals', icon: Share2 },
              { id: 'teams', label: 'Teams', icon: Building2 },
              { id: 'marketing', label: 'Marketing', icon: Filter },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setDesktopClientId(null);
                  onClearSubScreen();
                  onSelectNav(item.id);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left text-xs lg:text-[13px] transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-white/[0.07] text-white font-bold border-r-[3px] border-amber-400'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.03] font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-amber-400' : 'text-neutral-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Utility Icon (Pure Function Profile Badge) */}
        <div className="pb-4 pt-3 border-t border-white/10 flex flex-col items-center gap-3.5">
          <button
            type="button"
            onClick={() => {
              setDesktopClientId(null);
              onClearSubScreen();
              onSelectNav('account');
            }}
            className={`relative rounded-full p-0.5 transition-transform hover:scale-105 cursor-pointer ${
              activeNav === 'account' ? 'ring-2 ring-amber-400' : ''
            }`}
            title="Account"
            aria-label="Account"
          >
            <PureFunctionCircleBadge size="md" />
          </button>
        </div>
      </aside>

      {/* =========================================================
          2. SECONDARY SUB-SIDEBAR (For Library, Payments, Teams, Marketing)
         ========================================================= */}
      {showSecondarySidebar && (
        <aside
          aria-label="Secondary section navigation"
          className="hidden md:flex flex-col w-[185px] lg:w-[215px] shrink-0 bg-[#232733] text-neutral-200 border-r border-neutral-800/60 select-none overflow-y-auto"
        >
          {/* LIBRARY SUB-MENU (Screenshots 2, 3, 4) */}
          {activeNav === 'library' && (
            <div className="flex flex-col">
              {(
                [
                  { id: 'exercises', label: 'Exercises' },
                  { id: 'warmups', label: 'Warmups' },
                  { id: 'cooldowns', label: 'Cooldowns' },
                  { id: 'metricSets', label: 'Metric Sets' },
                  { id: 'documents', label: 'Documents' },
                ] as const
              ).map((sub) => {
                const isActive = librarySubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setLibrarySubTab(sub.id);
                      setSelectedLibraryExerciseId(null);
                      setIsCreatingLibraryExercise(false);
                    }}
                    className={`w-full px-5 py-3.5 text-left text-xs lg:text-[13px] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#181b24] text-white font-bold border-r-[3px] border-amber-400'
                        : 'text-neutral-300 hover:text-white hover:bg-white/[0.04] font-medium'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* PAYMENTS SUB-MENU (Screenshot 6) */}
          {activeNav === 'payments' && (
            <div className="flex flex-col">
              {(
                [
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'products', label: 'Products' },
                  { id: 'subscriptions', label: 'Subscriptions' },
                  {
                    id: 'oneTimePayments',
                    label: 'One-Time Payments',
                    isNew: true,
                  },
                ] as const
              ).map((sub) => {
                const isActive = paymentsSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setPaymentsSubTab(sub.id)}
                    className={`w-full px-5 py-3.5 text-left text-xs lg:text-[13px] flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#181b24] text-white font-bold border-r-[3px] border-amber-400'
                        : 'text-neutral-300 hover:text-white hover:bg-white/[0.04] font-medium'
                    }`}
                  >
                    <span className="truncate">{sub.label}</span>
                    {'isNew' in sub && sub.isNew && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black font-black text-[10px] shrink-0">
                        New
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TEAMS SUB-MENU (Screenshot 7) */}
          {activeNav === 'teams' && (
            <div className="flex flex-col divide-y divide-white/10">
              {coachesList.map((coach) => {
                const isActive = selectedCoachId === coach.id;
                return (
                  <button
                    key={coach.id}
                    type="button"
                    onClick={() => setSelectedCoachId(coach.id)}
                    className={`w-full p-4 text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#181b24] border-r-[3px] border-amber-400'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {coach.usePureFunctionBadge ? (
                        <PureFunctionCircleBadge size="sm" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/15 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                          {getInitials(coach.name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-white leading-snug">
                          {coach.name}
                        </div>
                        {coach.isOwner && (
                          <div className="text-[11px] font-semibold text-neutral-300 mt-0.5">
                            (Owner)
                          </div>
                        )}
                        <div className="text-[11px] text-neutral-400 mt-1">
                          <span className="font-bold text-white">
                            {coach.clientsCount} clients
                          </span>{' '}
                          | {coach.role}
                        </div>
                      </div>
                    </div>

                    {coach.c7 !== undefined && (
                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] tabular-nums">
                        <span className="text-neutral-300 font-semibold">
                          Compliance:
                        </span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-emerald-400">{coach.c7}%</span>
                          <span
                            className={
                              (coach.c30 ?? 0) >= 80
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }
                          >
                            {coach.c30}%
                          </span>
                          <span
                            className={
                              (coach.c90 ?? 0) >= 80
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }
                          >
                            {coach.c90}%
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* MARKETING SUB-MENU (Screenshot 8) */}
          {activeNav === 'marketing' && (
            <div className="flex flex-col">
              {(
                [
                  { id: 'publicProfile', label: 'Public Profile' },
                  { id: 'leads', label: 'Leads' },
                ] as const
              ).map((sub) => {
                const isActive = marketingSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setMarketingSubTab(sub.id)}
                    className={`w-full px-5 py-3.5 text-left text-xs lg:text-[13px] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#181b24] text-white font-bold border-r-[3px] border-amber-400'
                        : 'text-neutral-300 hover:text-white hover:bg-white/[0.04] font-medium'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      )}

      {/* =========================================================
          3. MAIN WORKSPACE CONTENT AREA
         ========================================================= */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {/* Mobile screens OR active Client sub-screen / utility tab (Activity, Messages, Account) */}
        <div
          className={`flex-1 min-h-0 flex-col overflow-hidden ${
            hasActiveSubScreen ||
            activeNav === 'activity' ||
            activeNav === 'messages' ||
            activeNav === 'account'
              ? 'flex'
              : 'flex md:hidden'
          }`}
        >
          {children}
        </div>

        {/* Desktop Active Client Workspace (Screenshot: /coach/clients/alexa-kolb/workouts) */}
        {!hasActiveSubScreen &&
          desktopActiveClient &&
          activeNav !== 'activity' &&
          activeNav !== 'messages' &&
          activeNav !== 'account' && (
            <div className="hidden md:flex flex-1 min-h-0 flex-col overflow-hidden">
              <TrainerClientWorkspace
                key={`${desktopActiveClient.id}-${desktopClientInitialTab}`}
                client={desktopActiveClient}
                allClients={combinedRoster.map((r) => r.client)}
                onSelectClient={(cid) => {
                  onSelectClient(cid);
                  setDesktopClientId(cid);
                }}
                onBackToClients={() => setDesktopClientId(null)}
                onUpdateClient={onUpdateClient}
                onOpenVideo={onOpenVideo}
                initialTab={desktopClientInitialTab}
                workouts={allClientWorkouts?.[desktopActiveClient.id]}
                onUpdateWorkouts={onUpdateClientWorkouts}
              />
            </div>
          )}

        {/* Desktop primary workspace screens (Clients, Library, Programs, Payments, Referrals, Teams, Marketing) */}
        {!hasActiveSubScreen &&
          !desktopActiveClient &&
          activeNav !== 'activity' &&
          activeNav !== 'messages' &&
          activeNav !== 'account' && (
            <div className="hidden md:flex flex-1 min-h-0 flex-col overflow-hidden">
            {/* ---------------------------------------------------------
                DESKTOP SCREEN 1: CLIENTS (Screenshot 1)
               --------------------------------------------------------- */}
            {activeNav === 'clients' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto space-y-5">
                  {/* Top Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                      Clients
                    </h1>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={onOpenClientManager}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add client</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsManageGroupsOpen(true)}
                        className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-neutral-600" />
                        <span>Manage groups</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportClientsCsv}
                        className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-neutral-600" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  {/* Active / Archived / Leads Tabs */}
                  <div className="flex items-center gap-6 border-b border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setClientsTab('active')}
                      className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                        clientsTab === 'active'
                          ? 'border-amber-400 text-neutral-900'
                          : 'border-transparent text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <span>Active</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#252a36] text-amber-400 text-[11px] font-black tabular-nums">
                        {combinedRoster.filter((r) => !r.client.archived).length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClientsTab('archived')}
                      className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                        clientsTab === 'archived'
                          ? 'border-amber-400 text-neutral-900'
                          : 'border-transparent text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      Archived
                    </button>

                    <button
                      type="button"
                      onClick={() => setClientsTab('leads')}
                      className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                        clientsTab === 'leads'
                          ? 'border-amber-400 text-neutral-900'
                          : 'border-transparent text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <span>Leads</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold">
                        0
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                        New
                      </span>
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="bg-white rounded-xl border border-neutral-300/90 px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs">
                    <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search clients and groups"
                      className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                    />
                  </div>

                  {/* Clients Table */}
                  {renderClientsTable()}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------
                DESKTOP SCREEN 2: LIBRARY (Screenshots 2, 3, 4)
               --------------------------------------------------------- */}
            {activeNav === 'library' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto space-y-5">
                  {/* Mobile Sub-Tab Switcher (visible only if viewed on narrow screen) */}
                  <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1">
                    {(
                      [
                        { id: 'exercises', label: 'Exercises' },
                        { id: 'warmups', label: 'Warmups' },
                        { id: 'cooldowns', label: 'Cooldowns' },
                        { id: 'metricSets', label: 'Metric Sets' },
                        { id: 'documents', label: 'Documents' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setLibrarySubTab(t.id);
                          setSelectedLibraryExerciseId(null);
                          setIsCreatingLibraryExercise(false);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer ${
                          librarySubTab === t.id
                            ? 'bg-amber-400 text-black'
                            : 'bg-white text-neutral-700 border border-neutral-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* SUB-TAB 1: EXERCISES (Screenshot 2 & Edit Exercise Screen) */}
                  {librarySubTab === 'exercises' && (() => {
                    const filteredExercises = libraryExercises.filter((ex) => {
                      if (
                        ex.from === 'ca' &&
                        !partnerToggles['Central Athlete']
                      )
                        return false;
                      if (ex.from === 'usaw' && !partnerToggles['USAW'])
                        return false;
                      if (ex.from === 'ko8' && !partnerToggles['KO8'])
                        return false;
                      if (ex.from === 'restoic' && !partnerToggles['Restoic'])
                        return false;
                      if (ex.from === 'issa' && !partnerToggles['ISSA'])
                        return false;
                      if (
                        ex.from === 'sa' &&
                        !partnerToggles['Stretch Affect']
                      )
                        return false;

                      if (
                        exercisePatternFilter &&
                        ex.patterns.toLowerCase() !==
                          exercisePatternFilter.toLowerCase()
                      ) {
                        return false;
                      }
                      if (
                        exerciseTypeFilter &&
                        ex.types.toLowerCase() !==
                          exerciseTypeFilter.toLowerCase()
                      ) {
                        return false;
                      }
                      if (
                        exercisePlaneFilter &&
                        ex.planes.toLowerCase() !==
                          exercisePlaneFilter.toLowerCase()
                      ) {
                        return false;
                      }

                      const q = exerciseSearch.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        ex.name.toLowerCase().includes(q) ||
                        ex.patterns.toLowerCase().includes(q) ||
                        ex.types.toLowerCase().includes(q) ||
                        ex.primaryMuscles.toLowerCase().includes(q) ||
                        ex.planes.toLowerCase().includes(q)
                      );
                    });

                    const selectedExerciseIndex = selectedLibraryExerciseId
                      ? filteredExercises.findIndex(
                          (item) => item.id === selectedLibraryExerciseId
                        )
                      : -1;
                    const activeExerciseObj =
                      selectedExerciseIndex >= 0
                        ? filteredExercises[selectedExerciseIndex]
                        : selectedLibraryExerciseId
                        ? libraryExercises.find(
                            (item) => item.id === selectedLibraryExerciseId
                          ) || null
                        : null;

                    if (isCreatingLibraryExercise) {
                      const blankExercise: TrueCoachLibraryExercise = {
                        id: `tc-ex-custom-${Date.now()}`,
                        name: '',
                        patterns: 'Squat',
                        types: 'External Loading',
                        primaryMuscles: 'Quadriceps, Glutes',
                        planes: 'Sagittal',
                        from: 'pf',
                        videoUrl: 'https://vimeo.com/609364053',
                        instructions: '',
                      };
                      return (
                        <TrainerExerciseEditorView
                          exercise={blankExercise}
                          isNew
                          onSave={(created) => {
                            setLibraryExercises((prev) => [created, ...prev]);
                            setIsCreatingLibraryExercise(false);
                            setSelectedLibraryExerciseId(created.id);
                          }}
                          onCancel={() => setIsCreatingLibraryExercise(false)}
                        />
                      );
                    }

                    if (activeExerciseObj) {
                      return (
                        <TrainerExerciseEditorView
                          key={activeExerciseObj.id}
                          exercise={activeExerciseObj}
                          onSave={(updated) => {
                            setLibraryExercises((prev) =>
                              prev.map((item) =>
                                item.id === updated.id ? updated : item
                              )
                            );
                          }}
                          onCancel={() => setSelectedLibraryExerciseId(null)}
                          onDelete={(delId) => {
                            setLibraryExercises((prev) =>
                              prev.filter((item) => item.id !== delId)
                            );
                            setSelectedLibraryExerciseId(null);
                          }}
                          hasPrev={selectedExerciseIndex > 0}
                          hasNext={
                            selectedExerciseIndex >= 0 &&
                            selectedExerciseIndex < filteredExercises.length - 1
                          }
                          onSelectPrev={() => {
                            if (selectedExerciseIndex > 0) {
                              setSelectedLibraryExerciseId(
                                filteredExercises[selectedExerciseIndex - 1].id
                              );
                            }
                          }}
                          onSelectNext={() => {
                            if (
                              selectedExerciseIndex >= 0 &&
                              selectedExerciseIndex <
                                filteredExercises.length - 1
                            ) {
                              setSelectedLibraryExerciseId(
                                filteredExercises[selectedExerciseIndex + 1].id
                              );
                            }
                          }}
                        />
                      );
                    }

                    return (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                                Exercises
                              </h1>
                              <span className="text-xs font-bold text-neutral-500 tabular-nums">
                                ({filteredExercises.length} movements)
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                              Use the exercise library to{' '}
                              <button
                                type="button"
                                onClick={() => setIsCreatingLibraryExercise(true)}
                                className="text-amber-600 hover:underline font-bold cursor-pointer"
                              >
                                add demo videos
                              </button>{' '}
                              for your clients.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsCreatingLibraryExercise(true)}
                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Add exercise</span>
                          </button>
                        </div>

                        {/* Include partner videos box */}
                        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs space-y-3">
                          <h2 className="text-xs sm:text-sm font-bold text-neutral-900">
                            Include partner videos
                          </h2>
                          <div className="space-y-2.5">
                            {[
                              { name: 'Central Athlete', specialOffer: false },
                              { name: 'USAW', specialOffer: true },
                              { name: 'KO8', specialOffer: true },
                              { name: 'Restoic', specialOffer: true },
                              { name: 'ISSA', specialOffer: true },
                              { name: 'Stretch Affect', specialOffer: false },
                            ].map((partner) => {
                              const enabled =
                                partnerToggles[partner.name] ?? true;
                              return (
                                <div
                                  key={partner.name}
                                  className="flex items-center gap-3"
                                >
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={enabled}
                                    onClick={() =>
                                      setPartnerToggles((prev) => ({
                                        ...prev,
                                        [partner.name]: !enabled,
                                      }))
                                    }
                                    className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                                      enabled
                                        ? 'bg-amber-400 justify-end'
                                        : 'bg-neutral-300 justify-start'
                                    }`}
                                  >
                                    <span className="w-5 h-5 rounded-full bg-white shadow-2xs flex items-center justify-center">
                                      {enabled && (
                                        <Check className="w-3 h-3 text-black stroke-[3]" />
                                      )}
                                    </span>
                                  </button>
                                  <span className="text-xs sm:text-sm font-semibold text-neutral-800">
                                    {partner.name}
                                  </span>
                                  {partner.specialOffer && (
                                    <span className="px-2.5 py-0.5 rounded-lg bg-[#252a36] text-amber-400 text-[11px] font-bold flex items-center gap-1">
                                      <Gift className="w-3 h-3" />
                                      <span>Special Offer</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Search exercises & Quick Taxonomy Filters */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <div className="flex-1 bg-white rounded-xl border border-neutral-300/90 px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs">
                            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={exerciseSearch}
                              onChange={(e) => setExerciseSearch(e.target.value)}
                              placeholder="Search exercises by name, muscle, pattern, or keywords"
                              className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                            />
                            {exerciseSearch && (
                              <button
                                type="button"
                                onClick={() => setExerciseSearch('')}
                                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                                aria-label="Clear search"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            <select
                              value={exercisePatternFilter}
                              onChange={(e) =>
                                setExercisePatternFilter(e.target.value)
                              }
                              aria-label="Filter by pattern"
                              className="rounded-xl border border-neutral-300/90 bg-white px-3 py-2.5 text-xs font-bold text-neutral-700 shadow-2xs outline-none focus:border-amber-400 cursor-pointer"
                            >
                              <option value="">All Patterns</option>
                              <option value="Squat">Squat</option>
                              <option value="Bend">Bend / Hinge</option>
                              <option value="Push">Push</option>
                              <option value="Pull">Pull</option>
                              <option value="Single Leg">Single Leg</option>
                              <option value="Core">Core</option>
                              <option value="Mobility">Mobility</option>
                              <option value="Locomotion">Locomotion</option>
                              <option value="Complex">Complex</option>
                            </select>

                            <select
                              value={exerciseTypeFilter}
                              onChange={(e) =>
                                setExerciseTypeFilter(e.target.value)
                              }
                              aria-label="Filter by type"
                              className="rounded-xl border border-neutral-300/90 bg-white px-3 py-2.5 text-xs font-bold text-neutral-700 shadow-2xs outline-none focus:border-amber-400 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="External Loading">
                                External Loading
                              </option>
                              <option value="Bodyweight">Bodyweight</option>
                              <option value="Explosiveness">
                                Explosiveness
                              </option>
                              <option value="Stability">Stability</option>
                              <option value="Mobility">Mobility</option>
                              <option value="Speed">Speed</option>
                            </select>

                            <select
                              value={exercisePlaneFilter}
                              onChange={(e) =>
                                setExercisePlaneFilter(e.target.value)
                              }
                              aria-label="Filter by plane"
                              className="rounded-xl border border-neutral-300/90 bg-white px-3 py-2.5 text-xs font-bold text-neutral-700 shadow-2xs outline-none focus:border-amber-400 cursor-pointer"
                            >
                              <option value="">All Planes</option>
                              <option value="Sagittal">Sagittal</option>
                              <option value="Frontal">Frontal</option>
                              <option value="Transverse">Transverse</option>
                              <option value="Multiple">Multiple</option>
                            </select>
                          </div>
                        </div>

                        {/* Exercises Table */}
                        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                          <div className="bg-[#252a36] text-white px-4 py-3 grid grid-cols-12 items-center gap-3 text-xs font-bold">
                            <div className="col-span-5">Exercise name</div>
                            <div className="col-span-2 hidden sm:block">
                              Patterns
                            </div>
                            <div className="col-span-1 hidden sm:block">
                              Types
                            </div>
                            <div className="col-span-2 hidden sm:block">
                              Primary Muscles
                            </div>
                            <div className="col-span-1 hidden sm:block">
                              Planes
                            </div>
                            <div className="col-span-7 sm:col-span-1 text-right">
                              From
                            </div>
                          </div>

                          <div className="divide-y divide-neutral-200/80">
                            {filteredExercises.map((ex) => (
                              <div
                                key={ex.id}
                                onClick={() =>
                                  setSelectedLibraryExerciseId(ex.id)
                                }
                                className="px-4 py-3.5 grid grid-cols-12 items-center gap-3 hover:bg-neutral-50 transition-colors cursor-pointer group"
                              >
                                <div className="col-span-8 sm:col-span-5 font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-amber-600 transition-colors flex items-center gap-2">
                                  <span>{ex.name}</span>
                                  <Play className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-500 shrink-0 transition-colors" />
                                </div>
                                <div className="col-span-2 hidden sm:block text-xs text-neutral-500">
                                  {ex.patterns}
                                </div>
                                <div className="col-span-1 hidden sm:block text-xs text-neutral-500">
                                  {ex.types}
                                </div>
                                <div className="col-span-2 hidden sm:block text-xs text-neutral-500">
                                  {ex.primaryMuscles}
                                </div>
                                <div className="col-span-1 hidden sm:block text-xs text-neutral-500">
                                  {ex.planes}
                                </div>
                                <div className="col-span-4 sm:col-span-1 flex justify-end">
                                  <ExerciseFromBadge from={ex.from} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* SUB-TAB 2: WARMUPS (Screenshot 3) */}
                  {librarySubTab === 'warmups' && (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                            Warmups
                          </h1>
                          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                            Use the warmup library to create commonly used
                            warmup protocols.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setQuickModalType('warmup')}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Add warmup</span>
                        </button>
                      </div>

                      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                        <div className="bg-[#252a36] text-white px-4 py-3 grid grid-cols-12 items-center gap-3 text-xs font-bold">
                          <div className="col-span-4">Name</div>
                          <div className="col-span-7">Instructions</div>
                          <div className="col-span-1 text-right">From</div>
                        </div>

                        <div className="divide-y divide-neutral-200/80">
                          {warmupsList.map((wm) => (
                            <div
                              key={wm.id}
                              className="px-4 py-4 grid grid-cols-12 items-start gap-3 hover:bg-neutral-50 transition-colors"
                            >
                              <div className="col-span-4 font-bold text-xs sm:text-sm text-neutral-900">
                                {wm.name}
                              </div>
                              <div className="col-span-7 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                                {wm.instructions}
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <PureFunctionCircleBadge size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* SUB-TAB 3: COOLDOWNS */}
                  {librarySubTab === 'cooldowns' && (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                            Cooldowns
                          </h1>
                          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                            Use the cooldown library to create commonly used
                            cooldown protocols.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setQuickModalType('cooldown')}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Add cooldown</span>
                        </button>
                      </div>

                      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                        <div className="bg-[#252a36] text-white px-4 py-3 grid grid-cols-12 items-center gap-3 text-xs font-bold">
                          <div className="col-span-4">Name</div>
                          <div className="col-span-7">Instructions</div>
                          <div className="col-span-1 text-right">From</div>
                        </div>

                        <div className="divide-y divide-neutral-200/80">
                          {cooldownsList.map((cd) => (
                            <div
                              key={cd.id}
                              className="px-4 py-4 grid grid-cols-12 items-start gap-3 hover:bg-neutral-50 transition-colors"
                            >
                              <div className="col-span-4 font-bold text-xs sm:text-sm text-neutral-900">
                                {cd.name}
                              </div>
                              <div className="col-span-7 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                                {cd.instructions}
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <PureFunctionCircleBadge size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* SUB-TAB 4: METRIC SETS (Screenshot 4) */}
                  {librarySubTab === 'metricSets' && (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                            Metric sets
                          </h1>
                          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                            Create sets of metrics to quickly assign to clients.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setQuickModalType('metricSet')}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Add a metric set</span>
                        </button>
                      </div>

                      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                        <div className="bg-[#252a36] text-white px-4 py-3 grid grid-cols-12 items-center gap-3 text-xs font-bold">
                          <div className="col-span-4">Name</div>
                          <div className="col-span-3">Description</div>
                          <div className="col-span-2"># Metrics</div>
                          <div className="col-span-2"># Assignments</div>
                          <div className="col-span-1 text-right">From</div>
                        </div>

                        <div className="divide-y divide-neutral-200/80">
                          {metricSetsList.map((ms) => (
                            <div
                              key={ms.id}
                              className="px-4 py-3.5 grid grid-cols-12 items-center gap-3 hover:bg-neutral-50 transition-colors"
                            >
                              <div className="col-span-4 font-bold text-xs sm:text-sm text-neutral-900">
                                {ms.name}
                              </div>
                              <div className="col-span-3 text-xs text-neutral-500">
                                {ms.description}
                              </div>
                              <div className="col-span-2 text-xs sm:text-sm font-semibold text-neutral-800 tabular-nums">
                                {ms.metricsCount}
                              </div>
                              <div className="col-span-2 text-xs sm:text-sm font-semibold text-neutral-800 tabular-nums">
                                {ms.assignmentsCount}
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <PureFunctionCircleBadge size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* SUB-TAB 5: DOCUMENTS */}
                  {librarySubTab === 'documents' && (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                            Documents
                          </h1>
                          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                            Upload and manage documents to share with your
                            clients.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setQuickModalType('document')}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Add document</span>
                        </button>
                      </div>

                      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                        <div className="bg-[#252a36] text-white px-4 py-3 grid grid-cols-12 items-center gap-3 text-xs font-bold">
                          <div className="col-span-6">Name</div>
                          <div className="col-span-3">Shared with</div>
                          <div className="col-span-2">Updated</div>
                          <div className="col-span-1 text-right">From</div>
                        </div>

                        <div className="divide-y divide-neutral-200/80">
                          {documentsList.map((doc) => (
                            <div
                              key={doc.id}
                              className="px-4 py-3.5 grid grid-cols-12 items-center gap-3 hover:bg-neutral-50 transition-colors"
                            >
                              <div className="col-span-6 font-bold text-xs sm:text-sm text-neutral-900 truncate">
                                {doc.name}
                              </div>
                              <div className="col-span-3 text-xs text-neutral-600">
                                {doc.sharedWith}
                              </div>
                              <div className="col-span-2 text-xs text-neutral-500">
                                {doc.updated}
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <PureFunctionCircleBadge size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------
                DESKTOP SCREEN 3: PROGRAMS (Screenshot 5)
               --------------------------------------------------------- */}
            {activeNav === 'programs' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                      Programs
                    </h1>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setQuickModalType('program')}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Create program</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsManageGroupsOpen(true)}
                        className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-neutral-600" />
                        <span>Manage tags</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Filters Row */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white rounded-xl border border-neutral-300/90 px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs">
                      <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input
                        type="text"
                        value={programSearch}
                        onChange={(e) => setProgramSearch(e.target.value)}
                        placeholder="Search"
                        className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setProgramSearch('')}
                      className="px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-neutral-600" />
                      <span>Filters</span>
                    </button>
                  </div>

                  {/* Programs Table */}
                  <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                    <div className="bg-[#252a36] text-white px-4 py-3 grid grid-cols-12 items-center gap-3 text-xs font-bold">
                      <div className="col-span-2 sm:col-span-1">Days</div>
                      <div className="col-span-5 sm:col-span-6 flex items-center gap-1">
                        <span>Name</span>
                        <span className="text-[10px] text-amber-400">▲</span>
                      </div>
                      <div className="col-span-2">Active</div>
                      <div className="col-span-1">From</div>
                      <div className="col-span-2 text-right" />
                    </div>

                    <div className="divide-y divide-neutral-200/80">
                      {programsList
                        .filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(programSearch.toLowerCase())
                        )
                        .map((prog) => (
                          <div
                            key={prog.id}
                            className="px-4 py-4 grid grid-cols-12 items-center gap-3 hover:bg-neutral-50 transition-colors"
                          >
                            {/* Calendar Days Badge */}
                            <div className="col-span-2 sm:col-span-1">
                              <div className="w-9 h-9 rounded-lg border-2 border-neutral-800 bg-white flex flex-col items-center justify-center leading-none">
                                <div className="w-full h-2 bg-neutral-800" />
                                <span className="text-xs font-black text-neutral-900 py-0.5 tabular-nums">
                                  {prog.days}
                                </span>
                              </div>
                            </div>

                            {/* Program Name, Description & + Add tags */}
                            <div className="col-span-5 sm:col-span-6 space-y-1 min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                                {prog.name}
                              </div>
                              {prog.description && (
                                <p className="text-xs text-neutral-600 truncate">
                                  {prog.description}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                                {prog.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="px-2 py-0.5 rounded-full bg-amber-100 text-neutral-900 text-[10px] font-bold"
                                  >
                                    {t}
                                  </span>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProgramsList((prev) =>
                                      prev.map((item) =>
                                        item.id === prog.id &&
                                        !item.tags.includes('Strength')
                                          ? {
                                              ...item,
                                              tags: [...item.tags, 'Strength'],
                                            }
                                          : item
                                      )
                                    );
                                  }}
                                  className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add tags</span>
                                </button>
                              </div>
                            </div>

                            {/* Active Clients Count */}
                            <div className="col-span-2 text-xs sm:text-sm font-semibold text-neutral-800 tabular-nums">
                              {prog.activeClients} clients
                            </div>

                            {/* From Badge */}
                            <div className="col-span-1">
                              <PureFunctionCircleBadge size="sm" />
                            </div>

                            {/* Assign to client & ... */}
                            <div className="col-span-2 flex items-center justify-end gap-1.5 relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setAssigningProgramId((prev) =>
                                    prev === prog.id ? null : prog.id
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-amber-400 hover:border-amber-400 text-neutral-900 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <Send className="w-3 h-3" />
                                <span>Assign to client</span>
                              </button>

                              {assigningProgramId === prog.id && (
                                <div className="absolute right-0 top-10 z-30 w-52 bg-white rounded-xl shadow-xl border border-neutral-200 p-2 space-y-1">
                                  <div className="text-[11px] font-bold text-neutral-500 px-2 py-1">
                                    Select client:
                                  </div>
                                  {clients.slice(0, 5).map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => {
                                        if (onUpdateClient) {
                                          onUpdateClient(c.id, {
                                            currentProgram: prog.name,
                                          });
                                        }
                                        setProgramsList((prev) =>
                                          prev.map((p) =>
                                            p.id === prog.id
                                              ? {
                                                  ...p,
                                                  activeClients:
                                                    p.activeClients + 1,
                                                }
                                              : p
                                          )
                                        );
                                        setAssigningProgramId(null);
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold text-neutral-800 hover:bg-amber-100 cursor-pointer truncate"
                                    >
                                      {c.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------
                DESKTOP SCREEN 4: PAYMENTS (Screenshot 6)
               --------------------------------------------------------- */}
            {activeNav === 'payments' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Stripe Connect Setup Card */}
                  <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      <div className="w-16 h-16 rounded-full bg-[#252a36] text-amber-400 font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">
                        S
                      </div>

                      <div className="flex-1 space-y-4 w-full">
                        <div>
                          <div className="text-xs font-bold text-neutral-500">
                            Step 1
                          </div>
                          <h1 className="text-lg sm:text-xl font-black text-neutral-900 mt-0.5">
                            Connect a Stripe account
                          </h1>
                          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                            We&apos;ve partnered with Stripe for fast, secure
                            payments. Create an account in a few quick steps to
                            get started.
                          </p>
                        </div>

                        <hr className="border-neutral-200" />

                        <div className="space-y-2.5">
                          <h2 className="text-xs sm:text-sm font-bold text-neutral-900">
                            Select an account type
                          </h2>

                          <label className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-800 cursor-pointer">
                            <input
                              type="radio"
                              name="stripeAccountType"
                              checked={stripeAccountType === 'individual'}
                              onChange={() =>
                                setStripeAccountType('individual')
                              }
                              className="w-4 h-4 accent-amber-400 cursor-pointer"
                            />
                            <span>
                              <strong className="font-bold">Individual</strong>{' '}
                              - requires Social Security Number (SSN)
                            </span>
                          </label>

                          <label className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-800 cursor-pointer">
                            <input
                              type="radio"
                              name="stripeAccountType"
                              checked={stripeAccountType === 'organization'}
                              onChange={() =>
                                setStripeAccountType('organization')
                              }
                              className="w-4 h-4 accent-amber-400 cursor-pointer"
                            />
                            <span>
                              <strong className="font-bold">
                                Organization
                              </strong>{' '}
                              - requires Employer Identification Number (EIN)
                            </span>
                          </label>
                        </div>

                        <div className="bg-[#252a36] text-white rounded-xl px-4 py-3.5 flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                          <Info className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            Only available for AU, CA, UK, and US-based
                            businesses.
                          </span>
                        </div>

                        <div className="pt-1 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setStripeConnected(true)}
                            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
                          >
                            {stripeConnected
                              ? 'Connected with Stripe'
                              : "Let's get started"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Frequently asked questions */}
                  <div className="space-y-3">
                    <h2 className="text-base sm:text-lg font-black text-neutral-900">
                      Frequently asked questions
                    </h2>

                    <div className="space-y-2">
                      {[
                        {
                          q: 'Which countries are supported?',
                          a: 'Payments are supported for businesses operating in the United States, Canada, the United Kingdom, and Australia.',
                        },
                        {
                          q: 'What payment types can I accept?',
                          a: 'You can accept all major credit and debit cards, Apple Pay, Google Pay, and recurring subscriptions.',
                        },
                        {
                          q: 'Are there any added fees?',
                          a: 'Standard Stripe processing rates apply with zero hidden platform markups.',
                        },
                        {
                          q: 'When do I receive payouts?',
                          a: 'Payouts are deposited directly into your linked bank account on a rolling 2-business-day schedule.',
                        },
                        {
                          q: 'Will I be PCI compliant?',
                          a: 'Yes. All payment data is tokenized and processed directly through Stripe PCI-DSS Level 1 infrastructure.',
                        },
                      ].map((faq, idx) => {
                        const isOpen = openFaqIdx === idx;
                        return (
                          <div
                            key={faq.q}
                            className="bg-white rounded-xl border border-neutral-200/80 px-4 py-3"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenFaqIdx(isOpen ? null : idx)
                              }
                              className="w-full flex items-center gap-2 text-left text-xs sm:text-sm font-bold text-neutral-900 cursor-pointer"
                            >
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4 text-neutral-600 shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
                              )}
                              <span>{faq.q}</span>
                            </button>
                            {isOpen && (
                              <p className="text-xs text-neutral-600 mt-2 pl-6 leading-relaxed">
                                {faq.a}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------
                DESKTOP SCREEN 5: REFERRALS
               --------------------------------------------------------- */}
            {activeNav === 'referrals' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-5">
                  <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                    Referrals
                  </h1>

                  <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-2xs space-y-4">
                    <h2 className="text-base font-bold text-neutral-900">
                      Share Pure Function
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600">
                      Invite coaches or athletes using your unique referral
                      link.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://app.truecoach.co/refer/pure-function"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-[#f4f5f7] text-xs sm:text-sm text-neutral-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            'https://app.truecoach.co/refer/pure-function'
                          );
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm cursor-pointer shrink-0"
                      >
                        {copiedUrl ? 'Copied' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------
                DESKTOP SCREEN 6: TEAMS (Screenshot 7)
               --------------------------------------------------------- */}
            {activeNav === 'teams' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                        Teams
                      </h1>
                      <p className="text-xs sm:text-sm font-semibold text-neutral-700 mt-1">
                        {activeCoach.name}&apos;s clients
                      </p>
                      <p className="text-xs font-bold text-neutral-500 mt-0.5">
                        {coachesList.length} Coaches | 50 Clients
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsAddCoachOpen(true)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add coach</span>
                      </button>
                      <button
                        type="button"
                        onClick={onOpenClientManager}
                        className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.2]" />
                        <span>Add client</span>
                      </button>
                    </div>
                  </div>

                  {/* Active / Archived Tabs */}
                  <div className="flex items-center gap-6 border-b border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setTeamsTab('active')}
                      className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                        teamsTab === 'active'
                          ? 'border-amber-400 text-neutral-900'
                          : 'border-transparent text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <span>Active</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#252a36] text-amber-400 text-[11px] font-black tabular-nums">
                        {activeCoach.clientsCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTeamsTab('archived')}
                      className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                        teamsTab === 'archived'
                          ? 'border-amber-400 text-neutral-900'
                          : 'border-transparent text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      Archived
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="bg-white rounded-xl border border-neutral-300/90 px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs">
                    <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search clients and groups"
                      className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                    />
                  </div>

                  {/* Shared Clients Roster Table */}
                  {renderClientsTable()}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------
                DESKTOP SCREEN 7: MARKETING (Screenshot 8)
               --------------------------------------------------------- */}
            {activeNav === 'marketing' && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                {marketingSubTab === 'publicProfile' ? (
                  <div className="space-y-6 pb-10">
                    {/* Top Live Profile Banner */}
                    <div className="bg-[#252a36] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-700">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs sm:text-sm font-bold">
                            {isProfileLive
                              ? 'This profile is live now!'
                              : 'This profile is currently unpublished.'}
                          </div>
                          <div className="text-xs text-neutral-300 mt-0.5">
                            Do you want to update your profile information?
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsProfileLive((prev) => !prev)}
                          className="px-3.5 py-2 rounded-xl bg-[#181b22] hover:bg-black text-red-400 font-bold text-xs border border-neutral-700 transition-colors cursor-pointer"
                        >
                          {isProfileLive ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSavedBannerMsg(
                              `Previewing ${businessName} (${profileSlug})`
                            )
                          }
                          className="px-3.5 py-2 rounded-xl border border-neutral-500 hover:bg-white/10 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSavedBannerMsg('Profile updated.');
                            setTimeout(() => setSavedBannerMsg(null), 2500);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors cursor-pointer"
                        >
                          Update
                        </button>
                      </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
                      {savedBannerMsg && (
                        <div className="bg-amber-100 border border-amber-300 text-neutral-900 px-4 py-2.5 rounded-xl text-xs font-bold">
                          {savedBannerMsg}
                        </div>
                      )}

                      <div>
                        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                          Public Profile
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                          Create your public profile to showcase it on social
                          media platforms and leverage it to attract prospective
                          leads.
                        </p>
                      </div>

                      {/* Basic Information Card */}
                      <div className="bg-white rounded-2xl border border-neutral-200/90 border-t-4 border-t-amber-400 shadow-2xs overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setIsBasicInfoOpen((prev) => !prev)}
                          className="w-full px-6 py-4 flex items-center justify-between border-b border-neutral-200 text-left cursor-pointer"
                        >
                          <span className="text-sm sm:text-base font-black text-neutral-900">
                            Basic Information
                          </span>
                          {isBasicInfoOpen ? (
                            <ChevronUp className="w-5 h-5 text-neutral-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-neutral-600" />
                          )}
                        </button>

                        {isBasicInfoOpen && (
                          <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              {/* Business Name */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-neutral-700">
                                  Business Name{' '}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={businessName}
                                  onChange={(e) =>
                                    setBusinessName(e.target.value)
                                  }
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-[#f4f5f7] focus:bg-white text-xs sm:text-sm text-neutral-900 outline-none focus:border-amber-400"
                                />
                              </div>

                              {/* Profile URL */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-neutral-700">
                                  Profile URL
                                </label>
                                <div className="flex items-center rounded-xl border border-neutral-300 bg-[#f4f5f7] px-3 py-2 text-xs sm:text-sm">
                                  <span className="text-neutral-500 truncate select-none">
                                    app.truecoach.co/coach-profile/
                                  </span>
                                  <input
                                    type="text"
                                    value={profileSlug}
                                    onChange={(e) =>
                                      setProfileSlug(e.target.value)
                                    }
                                    className="flex-1 min-w-0 bg-transparent font-semibold text-neutral-900 outline-none ml-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard?.writeText(
                                        `https://app.truecoach.co/coach-profile/${profileSlug}`
                                      );
                                      setCopiedUrl(true);
                                      setTimeout(
                                        () => setCopiedUrl(false),
                                        2000
                                      );
                                    }}
                                    className="text-neutral-600 hover:text-black ml-2 cursor-pointer shrink-0"
                                    title="Copy Profile URL"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Public Email */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-neutral-700">
                                  Public Email
                                </label>
                                <input
                                  type="email"
                                  value={publicEmail}
                                  onChange={(e) =>
                                    setPublicEmail(e.target.value)
                                  }
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-[#f4f5f7] focus:bg-white text-xs sm:text-sm text-neutral-900 outline-none focus:border-amber-400"
                                />
                              </div>

                              {/* Public Phone */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-neutral-700">
                                  Public Phone
                                </label>
                                <input
                                  type="text"
                                  value={publicPhone}
                                  onChange={(e) =>
                                    setPublicPhone(e.target.value)
                                  }
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-[#f4f5f7] focus:bg-white text-xs sm:text-sm text-neutral-900 outline-none focus:border-amber-400"
                                />
                              </div>
                            </div>

                            {/* About */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-neutral-700">
                                About
                              </label>
                              <textarea
                                rows={3}
                                value={publicAbout}
                                onChange={(e) => setPublicAbout(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-[#f4f5f7] focus:bg-white text-xs sm:text-sm text-neutral-900 outline-none focus:border-amber-400 leading-relaxed"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
                    <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                      Leads
                    </h1>
                    <div className="bg-white rounded-2xl border border-neutral-200/90 p-10 text-center text-sm text-neutral-500">
                      No leads yet. Share your Public Profile URL to capture
                      prospective clients.
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          )}
      </div>

      {/* =========================================================
          QUICK ADD MODAL (For Exercises, Warmups, Cooldowns, Metric Sets, Programs)
         ========================================================= */}
      {quickModalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setQuickModalType(null)}
        >
          <form
            onSubmit={handleSaveQuickModal}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="bg-amber-400 px-5 py-3.5 flex items-center justify-between text-black">
              <span className="font-extrabold text-sm sm:text-base">
                {quickModalType === 'exercise' && 'Add Exercise'}
                {quickModalType === 'warmup' && 'Add Warmup'}
                {quickModalType === 'cooldown' && 'Add Cooldown'}
                {quickModalType === 'metricSet' && 'Add Metric Set'}
                {quickModalType === 'document' && 'Add Document'}
                {quickModalType === 'program' && 'Create Program'}
              </span>
              <button
                type="button"
                onClick={() => setQuickModalType(null)}
                className="p-1 rounded-full hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-amber-400"
                />
              </div>

              {quickModalType === 'program' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quickDays}
                    onChange={(e) => setQuickDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  {quickModalType === 'warmup' || quickModalType === 'cooldown'
                    ? 'Instructions'
                    : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickModalType(null)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Manage Groups / Tags Modal */}
      {isManageGroupsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setIsManageGroupsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="bg-amber-400 px-5 py-3.5 flex items-center justify-between text-black">
              <span className="font-extrabold text-sm">Manage Groups</span>
              <button
                type="button"
                onClick={() => setIsManageGroupsOpen(false)}
                className="p-1 rounded-full hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-1.5">
                {availableGroups.map((g) => (
                  <div
                    key={g}
                    className="px-3.5 py-2 rounded-xl bg-[#f4f5f7] text-xs font-bold text-neutral-800 flex items-center justify-between"
                  >
                    <span>{g}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name..."
                  className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 text-xs outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newGroupName.trim()) {
                      setAvailableGroups((prev) => [
                        ...prev,
                        newGroupName.trim(),
                      ]);
                      setNewGroupName('');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Coach Modal (for Teams) */}
      {isAddCoachOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setIsAddCoachOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="bg-amber-400 px-5 py-3.5 flex items-center justify-between text-black">
              <span className="font-extrabold text-sm">Add Coach</span>
              <button
                type="button"
                onClick={() => setIsAddCoachOpen(false)}
                className="p-1 rounded-full hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <input
                type="text"
                value={newCoachName}
                onChange={(e) => setNewCoachName(e.target.value)}
                placeholder="Coach full name..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm outline-none focus:border-amber-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCoachOpen(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newCoachName.trim()) {
                      const id = `coach-${Date.now()}`;
                      setCoachesList((prev) => [
                        ...prev,
                        {
                          id,
                          name: newCoachName.trim(),
                          clientsCount: 0,
                          role: 'Admin',
                        },
                      ]);
                      setSelectedCoachId(id);
                      setNewCoachName('');
                      setIsAddCoachOpen(false);
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Add Coach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
