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
}

export interface DayWorkout {
  date: string; // e.g. "2026-10-08"
  dayOfWeek: string; // e.g. "Thu"
  dayNumber: number; // e.g. 8
  fullDayName: string; // e.g. "Thursday, October 8"
  focus: string | null; // e.g. "Lower body", "Upper body", "Conditioning", or null ("—")
  exercises: Exercise[];
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
}

export interface ClientProfile {
  id: string;
  name: string;
  age?: number;
  email: string;
  avatarUrl?: string;
  membershipStatus: 'Active' | 'Deload' | 'Rehab';
  goal: string;
  coach: string;
  currentProgram: string;
  assessments: AssessmentMetric[];
  homework: {
    id: string;
    title: string;
    frequency: string;
    completedDays: number;
    targetDays: number;
  }[];
}

export type AppViewMode = 'trainer' | 'client';
export type ThemeMode = 'dark' | 'light';
