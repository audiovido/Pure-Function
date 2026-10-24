import { DayWorkout } from '../types';

/* ---------- Compliance ---------- */

export function isDayCompleted(day: DayWorkout): boolean {
  return (
    !!day.sessionCompleted ||
    (day.exercises.length > 0 && day.exercises.every((e) => e.completed))
  );
}

function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
    dt.getDate()
  ).padStart(2, '0')}`;
}

/**
 * % of scheduled workout days completed in the last `windowDays` days (including today).
 * Today only counts if already completed (it isn't "missed" yet). Returns null when
 * nothing was scheduled in the window.
 */
export function getCompliance(
  workouts: DayWorkout[],
  today: string,
  windowDays: number
): number | null {
  const start = addDays(today, -(windowDays - 1));
  let scheduled = 0;
  let done = 0;
  for (const day of workouts) {
    if (day.exercises.length === 0) continue;
    if (day.date < start || day.date > today) continue;
    const completed = isDayCompleted(day);
    if (day.date === today && !completed) continue;
    scheduled += 1;
    if (completed) done += 1;
  }
  return scheduled === 0 ? null : Math.round((done / scheduled) * 100);
}

/* ---------- Exercise history & personal records ---------- */

export type WeightUnit = 'lb' | 'kg';

export interface LoggedSet {
  date: string;
  exerciseId: string;
  name: string;
  weight: number;
  unit: WeightUnit;
  reps: number;
  /** estimated 1RM in lb, used only for ranking */
  score: number;
  /** what the client typed, for display */
  weightText: string;
  repsText: string;
}

export function parseWeight(
  text?: string
): { value: number; unit: WeightUnit } | null {
  if (!text) return null;
  const m = text.match(/(\d+(?:\.\d+)?)\s*(kgs?|lbs?|pounds?)?/i);
  if (!m) return null;
  const value = parseFloat(m[1]);
  if (!isFinite(value) || value <= 0) return null;
  const unit: WeightUnit = m[2] && m[2].toLowerCase().startsWith('k') ? 'kg' : 'lb';
  return { value, unit };
}

/** "8" -> 8, "8, 8, 7" -> 8 (best set). */
export function parseReps(text?: string): number | null {
  if (!text) return null;
  const nums = (text.match(/\d+/g) || []).map(Number).filter((n) => n > 0);
  return nums.length ? Math.max(...nums) : null;
}

export function normalizeExerciseName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Epley estimated one-rep max, expressed in lb so kg and lb logs can be ranked together. */
export function estimateOneRepMaxLb(weight: number, unit: WeightUnit, reps: number): number {
  const lb = unit === 'kg' ? weight * 2.20462 : weight;
  return reps <= 1 ? lb : lb * (1 + reps / 30);
}

/** All logged sets per exercise name (normalized), oldest first. */
export function buildExerciseHistory(
  workouts: DayWorkout[]
): Map<string, LoggedSet[]> {
  const map = new Map<string, LoggedSet[]>();
  for (const day of workouts) {
    for (const ex of day.exercises) {
      const w = parseWeight(ex.actualWeight);
      const reps = parseReps(ex.actualReps);
      if (!w || !reps) continue;
      const entry: LoggedSet = {
        date: day.date,
        exerciseId: ex.id,
        name: ex.name,
        weight: w.value,
        unit: w.unit,
        reps,
        score: estimateOneRepMaxLb(w.value, w.unit, reps),
        weightText: ex.actualWeight!.trim(),
        repsText: ex.actualReps!.trim(),
      };
      const key = normalizeExerciseName(ex.name);
      const list = map.get(key);
      if (list) list.push(entry);
      else map.set(key, [entry]);
    }
  }
  for (const list of map.values()) list.sort((a, b) => a.date.localeCompare(b.date));
  return map;
}

export interface ExerciseSummary {
  /** most recent log strictly before `beforeDate` */
  last?: LoggedSet;
  /** best log (by estimated 1RM) of all logs, including `beforeDate` itself */
  pr?: LoggedSet;
  /** true when the log on `beforeDate` is the PR and beats every earlier log */
  isNewPr: boolean;
}

export function getExerciseSummary(
  history: Map<string, LoggedSet[]>,
  name: string,
  beforeDate: string
): ExerciseSummary {
  const list = history.get(normalizeExerciseName(name)) ?? [];
  const earlier = list.filter((l) => l.date < beforeDate);
  const today = list.filter((l) => l.date === beforeDate);
  const last = earlier[earlier.length - 1];

  const best = (arr: LoggedSet[]) =>
    arr.reduce<LoggedSet | undefined>((b, l) => (!b || l.score > b.score ? l : b), undefined);

  const pr = best(list);
  const earlierBest = best(earlier);
  const todayBest = best(today);
  const isNewPr = !!todayBest && !!earlierBest && todayBest.score > earlierBest.score;

  return { last, pr, isNewPr };
}
