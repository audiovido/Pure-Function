import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  MessageSquare,
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
  Archive,
  HelpCircle,
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
import {
  getOrCreateDayWorkout,
  getTodayDateString,
  addDaysToKey,
} from '../utils/dateUtils';
import {
  DateRangeCalendarModal,
  SingleDateCalendarModal,
  formatDateRangeLabel,
  formatShortDateLabel,
} from './DateRangeCalendarModal';
import {
  DesktopPrimaryNav,
  TrainerDesktopWorkspace,
} from './TrainerDesktopWorkspace';

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
  onUpdateClient?: (clientId: string, updates: Partial<ClientProfile>) => void;
  onDeleteClient?: (clientId: string) => void;
  workouts: DayWorkout[];
  allClientWorkouts?: Record<string, DayWorkout[]>;
  onUpdateClientWorkouts?: (
    clientId: string,
    updater: (prev: DayWorkout[]) => DayWorkout[]
  ) => void;
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
  onDesktopSectionLabelChange?: (label: string) => void;
  theme?: ThemeMode;
}

type SubScreen =
  | 'none'
  | 'clientProfile'
  | 'editClient'
  | 'clientWorkouts'
  | 'workoutDetail'
  | 'directChat';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const ComplianceDonut: React.FC<{
  percentage: number;
  label: string;
  color: string;
}> = ({ percentage, label, color }) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
        <span
          className="text-base sm:text-lg font-extrabold"
          style={{ color }}
        >
          {clamped}%
        </span>
        <span className="text-[10px] font-medium text-neutral-500 mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
};

export const TrainerView: React.FC<TrainerViewProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onOpenClientManager,
  onUpdateClient,
  workouts,
  allClientWorkouts = {},
  onUpdateClientWorkouts,
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
  onDesktopSectionLabelChange,
}) => {
  const [internalTab, setInternalTab] = useState<TrainerBottomTab>('dashboard');
  const bottomTab = onBottomTabChange ? activeBottomTab : internalTab;
  const [desktopNav, setDesktopNav] = useState<DesktopPrimaryNav>('clients');

  const [subScreen, setSubScreen] = useState<SubScreen>('none');
  const [workoutsBackTarget, setWorkoutsBackTarget] = useState<
    'none' | 'clientProfile'
  >('none');
  const [chatBackTarget, setChatBackTarget] = useState<
    'none' | 'clientProfile' | 'clientWorkouts'
  >('none');

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

  // Edit Client Form states (matching IMG_3528, IMG_3529, IMG_3530)
  const [editType, setEditType] = useState<'Remote' | 'Dual' | 'In-Person'>(
    'Dual'
  );
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(true);
  const [editLocation, setEditLocation] = useState('Los Angeles');
  const [editTimezone, setEditTimezone] = useState('America / Los_Angeles');
  const [editHeightFt, setEditHeightFt] = useState('5');
  const [editHeightIn, setEditHeightIn] = useState('4');
  const [editWeight, setEditWeight] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('🇨🇦 +1');
  const [editPhone, setEditPhone] = useState('(702) 808-2102');
  const [editBirthday, setEditBirthday] = useState('12/15/1985');
  const [editUnitPreference, setEditUnitPreference] = useState<
    'Imperial / US' | 'Metric system'
  >('Imperial / US');
  const [editGender, setEditGender] = useState<
    'M' | 'F' | 'Non-binary' | 'Prefer not to say'
  >('F');
  const [editEmailDaily, setEditEmailDaily] = useState(false);
  const [editEmailMissed, setEditEmailMissed] = useState(false);

  const selectedClient =
    clients.find((c) => c.id === selectedClientId) || clients[0];

  const activeDayWorkout = getOrCreateDayWorkout(workouts, selectedDate);

  // Open Client Profile (IMG_3524)
  const openClientProfile = (clientId: string) => {
    onSelectClient(clientId);
    setSubScreen('clientProfile');
  };

  // Open Edit Client (IMG_3528, IMG_3529, IMG_3530)
  const openEditClientScreen = (client: ClientProfile) => {
    const nameParts = client.name.trim().split(' ');
    const defaultFirst = client.firstName ?? (nameParts[0] || '');
    const defaultLast =
      client.lastName ?? (nameParts.slice(1).join(' ') || '');

    setEditType(client.clientType || 'Dual');
    setEditFirstName(defaultFirst);
    setEditLastName(defaultLast);
    setEditEmail(client.email || '');
    setEditLocation(client.location ?? 'Los Angeles');
    setEditTimezone(client.timezone ?? 'America / Los_Angeles');
    setEditHeightFt(client.heightFt ?? '5');
    setEditHeightIn(client.heightIn ?? '4');
    setEditWeight(client.weightLbs ?? '');
    setEditCountryCode(client.countryCode ?? '🇨🇦 +1');
    setEditPhone(client.phone ?? '(702) 808-2102');
    setEditBirthday(client.birthday ?? '12/15/1985');
    setEditUnitPreference(client.unitPreference ?? 'Imperial / US');
    setEditGender(client.gender ?? 'F');
    setEditEmailDaily(client.emailDailyWorkout ?? false);
    setEditEmailMissed(client.emailMissedWorkouts ?? false);
    setShowAdditionalDetails(true);
    setSubScreen('editClient');
  };

  // Save edited client profile
  const handleSaveEditedClient = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedName =
      `${editFirstName.trim()} ${editLastName.trim()}`.trim() ||
      selectedClient.name;

    if (onUpdateClient) {
      onUpdateClient(selectedClient.id, {
        name: combinedName,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        clientType: editType,
        email: editEmail.trim() || selectedClient.email,
        location: editLocation.trim(),
        timezone: editTimezone,
        heightFt: editHeightFt,
        heightIn: editHeightIn,
        weightLbs: editWeight,
        countryCode: editCountryCode,
        phone: editPhone,
        birthday: editBirthday,
        unitPreference: editUnitPreference,
        gender: editGender,
        emailDailyWorkout: editEmailDaily,
        emailMissedWorkouts: editEmailMissed,
      });
    }
    setSubScreen('clientProfile');
  };

  // Open Client Workouts List
  const openClientWorkouts = (
    clientId: string,
    backTo: 'none' | 'clientProfile' = 'none'
  ) => {
    onSelectClient(clientId);
    setWorkoutsBackTarget(backTo);
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

  const openDirectChat = (
    clientId: string,
    backTo: 'none' | 'clientProfile' | 'clientWorkouts' = 'none'
  ) => {
    onSelectClient(clientId);
    setChatBackTarget(backTo);
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
    if (
      tab === 'clients' ||
      tab === 'activity' ||
      tab === 'messages' ||
      tab === 'account'
    ) {
      setDesktopNav(tab);
    }
    if (onDesktopSectionLabelChange) {
      const labelMap: Record<TrainerBottomTab, string> = {
        dashboard: 'Dashboard',
        clients: 'Clients',
        activity: 'Activity',
        messages: 'Messages',
        account: 'Account',
      };
      onDesktopSectionLabelChange(labelMap[tab]);
    }
    setSubScreen('none');
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleSelectDesktopNav = (nav: DesktopPrimaryNav) => {
    setDesktopNav(nav);
    setSubScreen('none');
    setShowSearch(false);
    setSearchQuery('');

    if (
      nav === 'clients' ||
      nav === 'activity' ||
      nav === 'messages' ||
      nav === 'account'
    ) {
      if (onBottomTabChange) {
        onBottomTabChange(nav);
      } else {
        setInternalTab(nav);
      }
    }

    if (onDesktopSectionLabelChange) {
      const desktopLabels: Record<DesktopPrimaryNav, string> = {
        clients: 'Clients',
        library: 'Library',
        programs: 'Programs',
        payments: 'Payments',
        referrals: 'Referrals',
        teams: 'Teams',
        marketing: 'Marketing',
        activity: 'Activity',
        messages: 'Messages',
        account: 'Account',
      };
      onDesktopSectionLabelChange(desktopLabels[nav]);
    }
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

  // Interactive Calendar Modals state
  const [dateRangeStart, setDateRangeStart] = useState<string>(() =>
    addDaysToKey(getTodayDateString(), -7)
  );
  const [dateRangeEnd, setDateRangeEnd] = useState<string>(() =>
    addDaysToKey(getTodayDateString(), 7)
  );
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] =
    useState<boolean>(false);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] =
    useState<boolean>(false);

  const workoutDatesList = React.useMemo(
    () => workouts.filter((d) => d.exercises.length > 0).map((d) => d.date),
    [workouts]
  );

  const clientWorkoutDays = React.useMemo(() => {
    const daysWithExercises = workouts.filter((d) => d.exercises.length > 0);
    const filtered = [...daysWithExercises]
      .filter((d) => d.date >= dateRangeStart && d.date <= dateRangeEnd)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (filtered.length === 0 && dateRangeStart) {
      return [getOrCreateDayWorkout(workouts, dateRangeStart)];
    }
    return filtered;
  }, [workouts, dateRangeStart, dateRangeEnd]);

  const getWorkoutStatus = (
    day: DayWorkout
  ): 'Completed' | 'Pending' | 'Missed' => {
    if (
      day.sessionCompleted ||
      (day.exercises.length > 0 && day.exercises.every((e) => e.completed))
    ) {
      return 'Completed';
    }
    if (day.date >= getTodayDateString()) {
      return 'Pending';
    }
    return 'Missed';
  };

  const formatFullDateLabel = (dateStr: string): string => {
    if (dateStr === getTodayDateString()) return 'Today';
    return formatShortDateLabel(dateStr);
  };

  // Compute dynamic compliance percentages for the selected client
  const complianceStats = React.useMemo(() => {
    const completedDaysCount = clientWorkoutDays.filter(
      (d) => getWorkoutStatus(d) === 'Completed'
    ).length;
    const totalRecent = Math.max(1, clientWorkoutDays.length);
    const dynamic7d =
      selectedClient.compliance7d ??
      (completedDaysCount > 0
        ? Math.min(100, Math.round((completedDaysCount / totalRecent) * 100) + 50)
        : 100);
    const dynamic30d = selectedClient.compliance30d ?? 55;
    const dynamic90d = selectedClient.compliance90d ?? 32;
    return {
      day7: dynamic7d,
      day30: dynamic30d,
      day90: dynamic90d,
    };
  }, [clientWorkoutDays, selectedClient]);

  const unreadActivityCount = React.useMemo(
    () =>
      Math.max(
        1,
        activityItems.filter((item) => !readActivityIds.includes(item.id)).length
      ),
    [activityItems, readActivityIds]
  );

  return (
    <div className="w-full max-w-2xl md:max-w-none mx-auto flex-1 min-h-0 flex flex-col bg-[#f4f5f7] rounded-3xl md:rounded-none overflow-hidden border border-neutral-200/90 md:border-0 shadow-sm md:shadow-none relative">
      <TrainerDesktopWorkspace
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={onSelectClient}
        onOpenClientProfile={(clientId) => openClientProfile(clientId)}
        onOpenClientWorkouts={(clientId) => openClientWorkouts(clientId, 'none')}
        onOpenDirectChat={(clientId) => openDirectChat(clientId, 'none')}
        onOpenEditClient={(client) => openEditClientScreen(client)}
        onOpenClientManager={onOpenClientManager}
        onUpdateClient={onUpdateClient}
        onOpenVideo={onOpenVideo}
        onAddExerciseClick={onAddExerciseClick}
        allClientWorkouts={allClientWorkouts}
        onUpdateClientWorkouts={onUpdateClientWorkouts}
        activeAccount={activeAccount}
        onSignOut={onSignOut}
        activeNav={desktopNav}
        onSelectNav={handleSelectDesktopNav}
        hasActiveSubScreen={subScreen !== 'none'}
        onClearSubScreen={() => setSubScreen('none')}
        unreadActivityCount={unreadActivityCount}
      >
        <div className="w-full md:max-w-3xl md:mx-auto md:my-4 flex-1 min-h-0 flex flex-col bg-[#f4f5f7] md:rounded-3xl md:border md:border-neutral-200/90 md:shadow-xs overflow-hidden">
      {/* =========================================================
          SUB-SCREEN A: CLIENT PROFILE (Inspired by IMG_3524)
         ========================================================= */}
      {subScreen === 'clientProfile' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          {/* Top Amber Navigation Bar (Locked at top) */}
          <div className="shrink-0 bg-amber-400 px-4 py-3.5 flex items-center justify-between text-black">
            <button
              type="button"
              onClick={() => setSubScreen('none')}
              className="p-1 -ml-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
              aria-label="Back to clients"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-black truncate">
              Client Profile
            </span>
            <div className="w-6 shrink-0" />
          </div>

          {/* Main Scrollable Profile Body (Client Identity Card scrolls naturally) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Soft Gray Client Introduction Card (Display-Only Avatar uploaded by Client) */}
              <div className="bg-[#e5e7eb] rounded-3xl p-4 sm:p-5 border border-neutral-300/80 shadow-2xs flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white border border-neutral-300/90 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {selectedClient.avatarUrl ? (
                    <img
                      src={selectedClient.avatarUrl}
                      alt={selectedClient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 64 64"
                      className="w-16 h-16 text-neutral-300 mt-3"
                      fill="currentColor"
                    >
                      <circle cx="32" cy="22" r="11" />
                      <path d="M12 58c0-11 9-19 20-19s20 8 20 19H12z" />
                    </svg>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-xs sm:text-sm italic font-semibold text-neutral-600 truncate">
                    {selectedClient.clientType || 'Dual'}
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight truncate">
                    {selectedClient.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 truncate">
                    {selectedClient.email}
                  </p>
                </div>
              </div>

              {/* Compliance Card with 3 Donut Rings (7 day, 30 day, 90 day) */}
              <div className="bg-white rounded-3xl p-5 shadow-2xs border border-neutral-200/70">
                <h3 className="text-center text-sm font-semibold text-neutral-800 mb-4">
                  Compliance
                </h3>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <ComplianceDonut
                    percentage={complianceStats.day7}
                    label="7 day"
                    color="#1f7a5a"
                  />
                  <ComplianceDonut
                    percentage={complianceStats.day30}
                    label="30 day"
                    color="#db5439"
                  />
                  <ComplianceDonut
                    percentage={complianceStats.day90}
                    label="90 day"
                    color="#b91c1c"
                  />
                </div>
              </div>

              {/* 3 Pill Action Buttons: Edit profile, Workouts, Message */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => openEditClientScreen(selectedClient)}
                  className="w-full py-3.5 px-5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-2xs flex items-center justify-center gap-2.5 text-neutral-900 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 stroke-[2] shrink-0" />
                  <span className="truncate">Edit profile</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openClientWorkouts(selectedClient.id, 'clientProfile')
                  }
                  className="w-full py-3.5 px-5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-2xs flex items-center justify-center gap-2.5 text-neutral-900 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                >
                  <Activity className="w-4 h-4 stroke-[2] shrink-0" />
                  <span className="truncate">Workouts</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openDirectChat(selectedClient.id, 'clientProfile')
                  }
                  className="w-full py-3.5 px-5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-2xs flex items-center justify-center gap-2.5 text-neutral-900 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2] shrink-0" />
                  <span className="truncate">Message</span>
                </button>
              </div>
            </div>

            {/* Bottom Archive Pill Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onUpdateClient) {
                    onUpdateClient(selectedClient.id, {
                      archived: !selectedClient.archived,
                    });
                  }
                }}
                className="w-full py-3.5 px-5 rounded-full bg-white hover:bg-red-50/50 border border-neutral-200/90 shadow-2xs flex items-center justify-center gap-2.5 text-red-600 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
              >
                <Archive className="w-4 h-4 stroke-[2] shrink-0" />
                <span className="truncate">
                  {selectedClient.archived ? 'Unarchive' : 'Archive'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-SCREEN B: EDIT CLIENT (Inspired by IMG_3528, 3529, 3530)
         ========================================================= */}
      {subScreen === 'editClient' && (
        <form
          onSubmit={handleSaveEditedClient}
          className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden"
        >
          {/* Top Amber Bar */}
          <div className="shrink-0 bg-amber-400 px-4 py-3.5 flex items-center justify-between text-black">
            <button
              type="button"
              onClick={() => setSubScreen('clientProfile')}
              className="p-1 -ml-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
              aria-label="Back to profile"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-black truncate">
              Edit Client
            </span>
            <div className="w-6 shrink-0" />
          </div>

          {/* Scrollable Form Fields */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-neutral-200/80">
            {/* Primary Info Section (IMG_3528) */}
            <div className="p-5 space-y-4">
              {/* Type Selector: Remote | Dual | In-Person */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-900">
                  Type
                </label>
                <div className="bg-neutral-200/90 p-1 rounded-xl grid grid-cols-3 gap-1">
                  {(['Remote', 'Dual', 'In-Person'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditType(t)}
                      className={`py-2 px-2 rounded-lg text-xs sm:text-sm transition-all cursor-pointer truncate ${
                        editType === t
                          ? 'bg-white text-black font-bold shadow-2xs'
                          : 'text-neutral-600 font-medium hover:text-black'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Type Helper Box */}
                <div className="bg-[#f1f2f5] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-neutral-700 leading-relaxed">
                  <HelpCircle className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                  <p className="min-w-0 break-words">
                    {editType === 'Dual' &&
                      'Dual clients train with you or on their own. You can enter their workout results or leave it up to them.'}
                    {editType === 'Remote' &&
                      'Remote clients train on their own and log their workout results directly in the app.'}
                    {editType === 'In-Person' &&
                      'In-Person clients train with you directly during scheduled coaching sessions.'}
                  </p>
                </div>
              </div>

              {/* First Name * */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-900">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-amber-400"
                />
              </div>

              {/* Last Name * */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-900">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-amber-400"
                />
              </div>

              {/* Email * */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-900">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#eceef1] text-sm text-neutral-800 outline-none focus:bg-white focus:border-amber-400"
                />
              </div>
            </div>

            {/* Additional details (optional) Section (IMG_3529 & IMG_3530) */}
            <div className="p-5 space-y-4">
              <button
                type="button"
                onClick={() => setShowAdditionalDetails((prev) => !prev)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-900 cursor-pointer"
              >
                {showAdditionalDetails ? (
                  <ChevronUp className="w-4 h-4 text-neutral-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-700" />
                )}
                <span>Additional details (optional)</span>
              </button>

              {showAdditionalDetails && (
                <div className="space-y-4 pt-1">
                  <div className="bg-[#f1f2f5] rounded-2xl p-3 flex items-center gap-2 text-xs text-neutral-700">
                    <HelpCircle className="w-4 h-4 text-neutral-800 shrink-0" />
                    <span className="truncate">
                      Your client can complete this info on their own.
                    </span>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-900">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="City"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Timezone */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-900">
                      Timezone
                    </label>
                    <div className="relative">
                      <select
                        value={editTimezone}
                        onChange={(e) => setEditTimezone(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 outline-none focus:border-amber-400"
                      >
                        <option value="America / Los_Angeles">
                          America / Los_Angeles
                        </option>
                        <option value="America / New_York">
                          America / New_York
                        </option>
                        <option value="Europe / London">Europe / London</option>
                        <option value="Asia / Tehran">Asia / Tehran</option>
                        <option value="Asia / Dubai">Asia / Dubai</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-600 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Height & Weight */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-neutral-900">
                        Height
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editHeightFt}
                          onChange={(e) => setEditHeightFt(e.target.value)}
                          placeholder="5"
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          value={editHeightIn}
                          onChange={(e) => setEditHeightIn(e.target.value)}
                          placeholder="4"
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-neutral-900">
                        Weight
                      </label>
                      <input
                        type="text"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        placeholder={
                          editUnitPreference === 'Metric system' ? 'kg' : 'lbs'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-900">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <select
                          value={editCountryCode}
                          onChange={(e) => setEditCountryCode(e.target.value)}
                          className="appearance-none pl-3 pr-7 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 outline-none focus:border-amber-400"
                        >
                          <option value="🇨🇦 +1">🇨🇦 +1</option>
                          <option value="🇺🇸 +1">🇺🇸 +1</option>
                          <option value="🇬🇧 +44">🇬🇧 +44</option>
                          <option value="🇦🇪 +971">🇦🇪 +971</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-600 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="(702) 808-2102"
                        className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Birthday */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-900">
                      Birthday
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editBirthday}
                        onChange={(e) => setEditBirthday(e.target.value)}
                        onClick={() => setIsBirthdayModalOpen(true)}
                        placeholder="MM/DD/YYYY"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-amber-400 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setIsBirthdayModalOpen(true)}
                        className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-700 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                        aria-label="Open birthday calendar"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Unit preference */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-900">
                      Unit preference
                    </label>
                    <div className="bg-neutral-200/90 p-1 rounded-xl grid grid-cols-2 gap-1">
                      {(['Imperial / US', 'Metric system'] as const).map(
                        (unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => setEditUnitPreference(unit)}
                            className={`py-2 px-2 rounded-lg text-xs sm:text-sm transition-all cursor-pointer truncate ${
                              editUnitPreference === unit
                                ? 'bg-white text-black font-bold shadow-2xs'
                                : 'text-neutral-600 font-medium hover:text-black'
                            }`}
                          >
                            {unit}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-900">
                      Gender
                    </label>
                    <div className="bg-neutral-200/90 p-1 rounded-xl flex items-center gap-1">
                      {(
                        ['M', 'F', 'Non-binary', 'Prefer not to say'] as const
                      ).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEditGender(g)}
                          className={`py-2 px-2.5 rounded-lg text-xs transition-all cursor-pointer truncate ${
                            g.length <= 2 ? 'w-11 shrink-0' : 'flex-1 min-w-0'
                          } ${
                            editGender === g
                              ? 'bg-white text-black font-bold shadow-2xs'
                              : 'text-neutral-600 font-medium hover:text-black'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email Notification Toggles (IMG_3530) */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={editEmailDaily}
                  onClick={() => setEditEmailDaily((prev) => !prev)}
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 flex items-center ${
                    editEmailDaily
                      ? 'bg-amber-400 justify-end'
                      : 'bg-neutral-400/80 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-xs block" />
                </button>
                <span className="text-sm text-neutral-800 truncate">
                  Email daily workout
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={editEmailMissed}
                  onClick={() => setEditEmailMissed((prev) => !prev)}
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 flex items-center ${
                    editEmailMissed
                      ? 'bg-amber-400 justify-end'
                      : 'bg-neutral-400/80 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-xs block" />
                </button>
                <span className="text-sm text-neutral-800 truncate">
                  Email missed workouts
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Save Client Pill Button */}
          <div className="shrink-0 p-4 bg-white border-t border-neutral-200/80">
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#e8eaed] hover:bg-amber-400 text-neutral-700 hover:text-black font-bold text-sm sm:text-base transition-colors cursor-pointer"
            >
              Save Client
            </button>
          </div>
        </form>
      )}

      {/* =========================================================
          SUB-SCREEN 1: DIRECT 1-ON-1 CHAT
         ========================================================= */}
      {subScreen === 'directChat' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <div className="shrink-0 bg-amber-400 px-4 py-3.5 flex items-center justify-between gap-2 text-black">
            <button
              type="button"
              onClick={() => setSubScreen(chatBackTarget)}
              className="p-1 -ml-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-neutral-900 font-bold text-xs flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                {selectedClient.avatarUrl ? (
                  <img
                    src={selectedClient.avatarUrl}
                    alt={selectedClient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(selectedClient.name)
                )}
              </div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-black truncate">
                {selectedClient.name}
              </span>
            </div>
            <div className="w-6 shrink-0" />
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
            className="shrink-0 bg-white border-t border-neutral-200 px-3.5 py-3 flex items-center gap-2.5"
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
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] relative overflow-hidden">
          <div className="shrink-0 bg-amber-400 px-4 py-3.5 flex items-center justify-between gap-2 text-black">
            <button
              type="button"
              onClick={() => setSubScreen(workoutsBackTarget)}
              className="p-1 -ml-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-neutral-900 font-bold text-xs flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                {selectedClient.avatarUrl ? (
                  <img
                    src={selectedClient.avatarUrl}
                    alt={selectedClient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(selectedClient.name)
                )}
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
              onClick={() =>
                openDirectChat(selectedClient.id, 'clientWorkouts')
              }
              className="p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
              aria-label="Message client"
            >
              <MessageCircle className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          <div className="shrink-0 bg-white p-3.5 border-b border-neutral-200/80">
            <button
              type="button"
              onClick={() => setIsDateRangeModalOpen(true)}
              className="w-full border border-neutral-200 hover:border-amber-400 rounded-full px-4 py-2.5 flex items-center justify-between bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-medium text-neutral-700 truncate">
                {formatDateRangeLabel(dateRangeStart, dateRangeEnd)}
              </span>
              <Calendar className="w-4 h-4 text-neutral-600 shrink-0" />
            </button>
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
            className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#252a36] hover:bg-[#1b1f29] text-amber-400 shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer z-20"
            title="Add Exercise"
            aria-label="Add Exercise"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* =========================================================
          SUB-SCREEN 3: WORKOUT DETAIL
         ========================================================= */}
      {subScreen === 'workoutDetail' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <div className="shrink-0 bg-amber-400 px-4 py-3.5 text-black">
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
                <div className="w-9 h-9 rounded-full bg-white text-neutral-900 font-bold text-xs flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                  {selectedClient.avatarUrl ? (
                    <img
                      src={selectedClient.avatarUrl}
                      alt={selectedClient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(selectedClient.name)
                  )}
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
                onClick={() =>
                  openDirectChat(selectedClient.id, 'clientWorkouts')
                }
                className="p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer shrink-0"
                aria-label="Chat"
              >
                <MessageCircle className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-4 space-y-3 overflow-y-auto">
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
                        {ex.actualWeight || ex.actualReps
                          ? ` · Logged ${ex.actualWeight || '—'} × ${ex.actualReps || '—'}`
                          : ''}
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
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <div className="shrink-0 px-5 py-3.5 flex items-center justify-center">
            <span className="text-xs font-bold text-neutral-500">
              Today&apos;s workouts
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-2.5">
            {clients
              .filter((c) => !c.archived)
              .map((client) => (
                <div
                  key={client.id}
                  onClick={() => openClientWorkouts(client.id, 'none')}
                  className="bg-white rounded-3xl px-4 py-3.5 border border-neutral-200/70 shadow-2xs flex items-center justify-between gap-3 hover:border-neutral-300 transition-colors cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
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
                      onClick={() => openDirectChat(client.id, 'none')}
                      className="w-9 h-9 rounded-full hover:bg-neutral-100 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Message"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openClientWorkouts(client.id, 'none')}
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
          MAIN TAB 2: CLIENTS ROSTER (Opens Client Profile on Click)
         ========================================================= */}
      {subScreen === 'none' && bottomTab === 'clients' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <div className="shrink-0 p-3.5 bg-white border-b border-neutral-200/80 flex items-center gap-2.5">
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

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5">
            {clients
              .filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((client) => (
                <div
                  key={client.id}
                  onClick={() => openClientProfile(client.id)}
                  className="bg-white rounded-3xl px-4 py-3.5 border border-neutral-200/70 shadow-2xs flex items-center justify-between gap-3 hover:border-neutral-300 transition-colors cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
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
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                        {client.name}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">
                        {client.clientType || 'Dual'} · {client.currentProgram}
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
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <div className="shrink-0 bg-amber-400 px-4 py-3 text-black space-y-2.5">
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

          <div className="p-4 space-y-2.5 flex-1 min-h-0 overflow-y-auto">
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
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <div className="shrink-0 bg-amber-400 px-4 py-3 text-black space-y-2.5">
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

          <div className="p-4 space-y-2.5 flex-1 min-h-0 overflow-y-auto">
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
                    onClick={() => openDirectChat(client.id, 'none')}
                    className="bg-white rounded-3xl px-4 py-3.5 border border-neutral-200/70 shadow-2xs flex items-center justify-between gap-3 hover:border-neutral-300 transition-colors cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
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
        <div className="flex-1 min-h-0 flex flex-col bg-[#f4f5f7] overflow-hidden">
          <div className="shrink-0 bg-amber-400 px-5 py-5 flex items-center gap-3.5 text-black">
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

          <div className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col justify-between space-y-5">
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
        </div>
      </TrainerDesktopWorkspace>

      {/* =========================================================
          BOTTOM NAVIGATION BAR (5 Minimal Tabs — Mobile Only, Locked at Bottom)
         ========================================================= */}
      <nav
        aria-label="Trainer bottom navigation"
        className="md:hidden shrink-0 bg-white border-t border-neutral-200 px-2 py-2 grid grid-cols-5 z-30"
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

      {/* Interactive Date Range Calendar Modal for Workouts */}
      <DateRangeCalendarModal
        isOpen={isDateRangeModalOpen}
        onClose={() => setIsDateRangeModalOpen(false)}
        startDate={dateRangeStart}
        endDate={dateRangeEnd}
        onApplyRange={(start, end) => {
          setDateRangeStart(start);
          setDateRangeEnd(end);
        }}
        workoutDates={workoutDatesList}
        onOpenSingleDay={(dateStr) => {
          setDateRangeStart(dateStr);
          setDateRangeEnd(dateStr);
          openWorkoutDetail(dateStr);
        }}
      />

      {/* Interactive Single Date Calendar Modal for Client Birthday */}
      <SingleDateCalendarModal
        isOpen={isBirthdayModalOpen}
        onClose={() => setIsBirthdayModalOpen(false)}
        initialValue={editBirthday}
        onSelectDate={(formatted) => setEditBirthday(formatted)}
        title="Select Birthday"
      />
    </div>
  );
};
