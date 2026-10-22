import {
  AuthAccount,
  ClientProfile,
  DailyNutritionEntry,
  DayWorkout,
  DirectMessage,
  FmsScreenItem,
  MacroTargets,
  ProgramBlock,
} from '../types';
import {
  INITIAL_CLIENTS,
  getClientInitialWorkouts,
} from '../data/initialData';
import { getTodayDateString } from '../utils/dateUtils';

const STORAGE_KEYS = {
  ACCOUNTS: 'pf_tc_accounts_v2',
  SESSION: 'pf_tc_active_session_v2',
  CLIENTS: 'pf_tc_clients_v2',
  WORKOUTS_MAP: 'pf_tc_workouts_map_v2',
  NUTRITION_MAP: 'pf_tc_nutrition_map_v2',
  MESSAGES_MAP: 'pf_tc_messages_map_v2',
};

export const DEFAULT_FMS_RECORDS: FmsScreenItem[] = [
  {
    id: 'fms-1',
    test: 'Deep Overhead Squat',
    score: 3,
    prevScore: 2,
    status: 'Cleared',
  },
  {
    id: 'fms-2',
    test: 'Hurdle Step (L / R)',
    score: 2,
    prevScore: 2,
    status: 'In Progress',
  },
  {
    id: 'fms-3',
    test: 'Inline Lunge (L / R)',
    score: 3,
    prevScore: 2,
    status: 'Cleared',
  },
  {
    id: 'fms-4',
    test: 'Active Straight Leg Raise',
    score: 3,
    prevScore: 2,
    status: 'Cleared',
  },
  {
    id: 'fms-5',
    test: 'Rotary Stability',
    score: 2,
    prevScore: 2,
    status: 'Maintaining',
  },
];

export const DEFAULT_PROGRAM_BLOCKS: ProgramBlock[] = [
  {
    id: 'blk-1',
    title: 'Block I: Pelvic Alignment & Soft Tissue Reset',
    duration: 'Weeks 1–4',
    status: 'Completed',
    focus:
      'Acetabular glide, 90/90 breathing, ribcage stacking, unloaded hinge pattern.',
    active: false,
  },
  {
    id: 'blk-2',
    title: 'Block II: Lower Body Symmetry & Pelvic Control',
    duration: 'Weeks 5–8 (Current Block)',
    status: 'In Progress',
    focus:
      'Goblet squat progression, single-leg RDL balance, anti-rotation core, glute medius activation.',
    active: true,
  },
  {
    id: 'blk-3',
    title: 'Block III: Multi-Planar Strength & Dynamic Loading',
    duration: 'Weeks 9–12',
    status: 'Upcoming',
    focus:
      'Barbell front squat, lateral lunges, reactive plyometrics, heavier deadlift variations.',
    active: false,
  },
];

export const DEFAULT_MACRO_TARGETS: MacroTargets = {
  calories: 2450,
  protein: 185,
  carbs: 250,
  fat: 75,
  waterLiters: 3.5,
};

function getClientDefaultUsername(client: ClientProfile): string {
  if (client.username) return client.username;
  return client.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getInitialEnrichedClients(): ClientProfile[] {
  return INITIAL_CLIENTS.map((c, index) => {
    const username = getClientDefaultUsername(c);
    return {
      ...c,
      avatarUrl: c.avatarUrl?.startsWith('data:image/')
        ? c.avatarUrl
        : undefined,
      username,
      password: c.password || 'client123',
      macroTargets: c.macroTargets || {
        calories: 2200 + (index % 4) * 150,
        protein: 165 + (index % 4) * 15,
        carbs: 220 + (index % 4) * 20,
        fat: 70 + (index % 3) * 5,
        waterLiters: 3.2,
      },
      fmsRecords: c.fmsRecords || DEFAULT_FMS_RECORDS,
      programBlocks: c.programBlocks || DEFAULT_PROGRAM_BLOCKS,
      homework:
        c.homework && c.homework.length > 0
          ? c.homework
          : [
              {
                id: `hw-${c.id}-1`,
                title: '90/90 Diaphragmatic Breathing',
                frequency: '5 minutes daily',
                completedDays: 5,
                targetDays: 7,
              },
              {
                id: `hw-${c.id}-2`,
                title: 'Hip Capsule & Thoracic Opener',
                frequency: '2 sets × 60s / side',
                completedDays: 4,
                targetDays: 5,
              },
              {
                id: `hw-${c.id}-3`,
                title: '8+ Hours Sleep & 3.2L Hydration',
                frequency: 'Daily lifestyle habit',
                completedDays: 6,
                targetDays: 7,
              },
            ],
      assessments:
        c.assessments && c.assessments.length > 0
          ? c.assessments
          : [
              {
                id: `ass-${c.id}-1`,
                name: 'Hip Internal Rotation',
                previousValue: '22°',
                currentValue: '31°',
                targetValue: '35°',
                unit: 'degrees',
                category: 'Mobility',
                notes: 'Clean pelvic alignment through mid-stance.',
                improved: true,
              },
              {
                id: `ass-${c.id}-2`,
                name: 'Estimated Trap-Bar / RDL 5RM',
                previousValue: '155 lb',
                currentValue: '185 lb',
                targetValue: '215 lb',
                unit: 'lb',
                category: 'Strength 1RM',
                notes: 'Crisp lockout with zero lumbar rounding.',
                improved: true,
              },
            ],
    };
  });
}

export function getInitialAuthAccounts(clients: ClientProfile[]): AuthAccount[] {
  const trainerAccounts: AuthAccount[] = [
    {
      id: 'trainer-marcus',
      username: 'marcus',
      password: 'coach123',
      role: 'trainer',
      displayName: 'Marcus Vance, CSCS',
      email: 'marcus.vance@purefunction.fit',
      title: 'Head Biomechanics & Performance Coach',
    },
    {
      id: 'trainer-admin',
      username: 'coach',
      password: 'coach123',
      role: 'trainer',
      displayName: 'Marcus Vance, CSCS',
      email: 'coach@purefunction.fit',
      title: 'Lead Strength & Conditioning Coach',
    },
  ];

  const clientAccounts: AuthAccount[] = clients.map((client) => ({
    id: `user-${client.id}`,
    username: getClientDefaultUsername(client),
    password: client.password || 'client123',
    role: 'client' as const,
    displayName: client.name,
    email: client.email,
    clientId: client.id,
  }));

  return [...trainerAccounts, ...clientAccounts];
}

export function loadClients(): ClientProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: ClientProfile) => ({
          ...c,
          avatarUrl: c.avatarUrl?.startsWith('data:image/')
            ? c.avatarUrl
            : undefined,
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load clients from storage', e);
  }
  const initial = getInitialEnrichedClients();
  saveClients(initial);
  return initial;
}

export function saveClients(clients: ClientProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients', e);
  }
}

export function loadAccounts(clients: ClientProfile[]): AuthAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load accounts', e);
  }
  const initial = getInitialAuthAccounts(clients);
  saveAccounts(initial);
  return initial;
}

export function saveAccounts(accounts: AuthAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts', e);
  }
}

export function loadActiveSession(): AuthAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (raw) {
      return JSON.parse(raw) as AuthAccount;
    }
  } catch (e) {
    console.error('Failed to load active session', e);
  }
  return null;
}

export function saveActiveSession(account: AuthAccount | null): void {
  try {
    if (!account) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(account));
    }
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export function loadWorkoutsMap(
  clients: ClientProfile[]
): Record<string, DayWorkout[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUTS_MAP);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Failed to load workouts map', e);
  }
  const initial: Record<string, DayWorkout[]> = {};
  clients.forEach((c) => {
    initial[c.id] = getClientInitialWorkouts(c.id);
  });
  saveWorkoutsMap(initial);
  return initial;
}

export function saveWorkoutsMap(map: Record<string, DayWorkout[]>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS_MAP, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save workouts map', e);
  }
}

export function loadNutritionMap(
  clients: ClientProfile[]
): Record<string, Record<string, DailyNutritionEntry>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NUTRITION_MAP);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Failed to load nutrition map', e);
  }
  const today = getTodayDateString();
  const initial: Record<string, Record<string, DailyNutritionEntry>> = {};
  clients.forEach((c) => {
    const targets = c.macroTargets || DEFAULT_MACRO_TARGETS;
    initial[c.id] = {
      [today]: {
        date: today,
        calories: Math.round(targets.calories * 0.78),
        protein: Math.round(targets.protein * 0.82),
        carbs: Math.round(targets.carbs * 0.75),
        fat: Math.round(targets.fat * 0.8),
        waterLiters: 2.5,
        completedHabitIds: c.homework?.[0] ? [c.homework[0].id] : [],
        notes: 'Pre-workout meal 90 mins prior to session.',
      },
    };
  });
  saveNutritionMap(initial);
  return initial;
}

export function saveNutritionMap(
  map: Record<string, Record<string, DailyNutritionEntry>>
): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NUTRITION_MAP, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save nutrition map', e);
  }
}

export function loadMessagesMap(
  clients: ClientProfile[]
): Record<string, DirectMessage[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES_MAP);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Failed to load messages map', e);
  }
  const initial: Record<string, DirectMessage[]> = {};
  clients.forEach((c) => {
    initial[c.id] = [
      {
        id: `msg-${c.id}-1`,
        clientId: c.id,
        senderRole: 'trainer',
        senderName: c.coach || 'Marcus Vance, CSCS',
        text: `Welcome to Block II, ${
          c.name.split(' ')[0]
        }. Focus on the 3-second eccentric tempo on your primary lower-body movements this week and log your working loads after each set.`,
        timestamp: 'Yesterday · 6:15 PM',
      },
      {
        id: `msg-${c.id}-2`,
        clientId: c.id,
        senderRole: 'client',
        senderName: c.name,
        text: 'Sounds good Coach! Warm-up breathing drill made a huge difference on hip depth during Monday’s session.',
        timestamp: 'Yesterday · 7:02 PM',
        exerciseTag: '90/90 breathing',
      },
    ];
  });
  saveMessagesMap(initial);
  return initial;
}

export function saveMessagesMap(map: Record<string, DirectMessage[]>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES_MAP, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save messages map', e);
  }
}
