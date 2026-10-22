export type IntensityLevel = string;

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  intensity: string;
  rest: string;
  notes: string;
  completed?: boolean;
  category?: 'Lower body' | 'Upper body' | 'Core' | 'Mobility' | 'Conditioning';
  durationSeconds?: number;
  videoDurationText?: string;
  videoUrl?: string;
  youtubeId?: string;
  cues?: string[];
  targetMuscles?: string[];
  // TrueCoach Client Result Logging fields
  actualSets?: number;
  actualReps?: string;
  actualWeight?: string;
  rpe?: string;
  clientNotes?: string;
  completedAt?: string;
}

export interface DayWorkout {
  date: string; // e.g. "2026-10-08"
  dayOfWeek: string; // e.g. "Thu"
  dayNumber: number; // e.g. 8
  fullDayName: string; // e.g. "Thursday, October 8"
  focus: string | null; // e.g. "Lower body", "Upper body", "Conditioning", or null ("—")
  exercises: Exercise[];
  // Session-level TrueCoach notes & completion summary
  coachNotes?: string;
  sessionCompleted?: boolean;
  sessionDurationMinutes?: number;
  sessionRpe?: number;
  clientSessionFeedback?: string;
}

export interface AssessmentMetric {
  id: string;
  name: string;
  previousValue: string;
  currentValue: string;
  targetValue: string;
  unit: string;
  notes: string;
  improved: boolean;
  category?: 'Mobility' | 'Strength 1RM' | 'Body Comp' | 'Endurance';
  updatedAt?: string;
}

export interface FmsScreenItem {
  id: string;
  test: string;
  score: number;
  prevScore: number;
  status: 'Cleared' | 'In Progress' | 'Maintaining' | 'Needs Focus';
}

export interface ProgramBlock {
  id: string;
  title: string;
  duration: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  focus: string;
  active: boolean;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterLiters: number;
}

export interface DailyNutritionEntry {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterLiters: number;
  completedHabitIds: string[];
  notes?: string;
}

export interface DirectMessage {
  id: string;
  clientId: string;
  senderRole: 'trainer' | 'client';
  senderName: string;
  text: string;
  timestamp: string;
  videoUrl?: string;
  exerciseTag?: string;
  isBroadcast?: boolean;
}

export interface ClientHomework {
  id: string;
  title: string;
  frequency: string;
  completedDays: number;
  targetDays: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  age?: number;
  email: string;
  username?: string;
  password?: string;
  avatarUrl?: string;
  membershipStatus: 'Active' | 'Deload' | 'Rehab';
  goal: string;
  coach: string;
  currentProgram: string;
  assessments: AssessmentMetric[];
  homework: ClientHomework[];
  macroTargets?: MacroTargets;
  fmsRecords?: FmsScreenItem[];
  programBlocks?: ProgramBlock[];
}

export interface AuthAccount {
  id: string;
  username: string;
  password: string;
  role: 'trainer' | 'client';
  displayName: string;
  email: string;
  clientId?: string;
  title?: string;
}

export type AppViewMode = 'trainer' | 'client';
export type ThemeMode = 'dark' | 'light';
export type WorkspaceSection = 'workouts' | 'nutrition' | 'messages' | 'progress' | 'clients';
