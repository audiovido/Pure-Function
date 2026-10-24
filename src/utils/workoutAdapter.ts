import type {
  TrueCoachDayWorkoutCard,
  TrueCoachPrescriptionItem,
  WorkoutComplianceStatus,
} from '../components/TrainerClientWorkspace';
import { DayWorkout, Exercise } from '../types';
import { getOrCreateDayWorkout, getTodayDateString } from './dateUtils';
import { TRUECOACH_EXERCISE_LIBRARY } from '../data/trueCoachExerciseLibrary';

/**
 * The trainer workspace edits "cards" (one per date, with prescription strings);
 * the rest of the app stores DayWorkout/Exercise. These two functions convert between
 * them without losing anything the workspace doesn't know about (video, client results...).
 */

const PLACEHOLDER_WEIGHT = '____';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function exerciseStatus(ex: Exercise): WorkoutComplianceStatus {
  if (ex.completed) return 'completed';
  if (ex.missed) return 'missed';
  return 'scheduled';
}

function dayStatus(day: DayWorkout, today: string): WorkoutComplianceStatus {
  const exs = day.exercises;
  if (exs.length > 0 && (day.sessionCompleted || exs.every((e) => e.completed))) {
    return 'completed';
  }
  if (exs.some((e) => e.missed)) return 'missed';
  if (exs.length > 0 && day.date < today) return 'missed';
  return 'scheduled';
}

export function cardsFromDays(
  days: DayWorkout[],
  today: string = getTodayDateString()
): TrueCoachDayWorkoutCard[] {
  return days
    .filter((d) => d.exercises.length > 0 || !!d.focus)
    .map((d) => ({
      id: `wk-${d.date}`,
      dateIso: d.date,
      title: d.focus || 'Workout',
      status: dayStatus(d, today),
      exercises: d.exercises.map<TrueCoachPrescriptionItem>((ex, i) => ({
        id: ex.id,
        orderLabel: ex.orderLabel ?? LETTERS[i % 26],
        name: ex.name,
        note: ex.notes ?? '',
        sets: ex.setsText ?? String(ex.sets),
        reps: ex.reps,
        weight: ex.intensity || PLACEHOLDER_WEIGHT,
        status: exerciseStatus(ex),
      })),
    }));
}

function findLibraryVideo(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  return TRUECOACH_EXERCISE_LIBRARY.find((l) => l.name.trim().toLowerCase() === key)
    ?.videoUrl;
}

function firstInt(text: string, fallback: number): number {
  const m = text.match(/\d+/);
  return m ? parseInt(m[0], 10) : fallback;
}

/** Apply the workspace's cards back onto the stored days (one workout per date). */
export function daysFromCards(
  cards: TrueCoachDayWorkoutCard[],
  prevDays: DayWorkout[]
): DayWorkout[] {
  const prevExercise = new Map<string, Exercise>();
  prevDays.forEach((d) => d.exercises.forEach((e) => prevExercise.set(e.id, e)));

  const cardDates = new Set<string>();
  const next: DayWorkout[] = [];

  for (const card of cards) {
    // one workout per date: later cards for the same date append their exercises
    const existingNext = next.find((d) => d.date === card.dateIso);
    const base = existingNext ?? getOrCreateDayWorkout(prevDays, card.dateIso);

    const exercises = card.exercises.map<Exercise>((item) => {
      const old = prevExercise.get(item.id);
      const weight = item.weight === PLACEHOLDER_WEIGHT ? '' : item.weight;
      const status = item.status;
      const merged: Exercise = {
        ...(old ?? {
          id: item.id,
          rest: '',
          videoUrl: findLibraryVideo(item.name),
        }),
        id: item.id,
        name: item.name,
        sets: firstInt(item.sets, old?.sets ?? 3),
        setsText: item.sets,
        reps: item.reps,
        intensity: weight,
        notes: item.note,
        orderLabel: item.orderLabel,
        completed: status === 'completed',
        missed: status === 'missed',
      };
      // renaming an exercise to a different one drops the old exercise's video
      if (old && old.name !== item.name) merged.videoUrl = findLibraryVideo(item.name);
      return merged;
    });

    const allExercises = existingNext ? [...existingNext.exercises, ...exercises] : exercises;
    const day: DayWorkout = {
      ...base,
      focus: existingNext ? existingNext.focus : card.title || 'Workout',
      exercises: allExercises,
      sessionCompleted:
        allExercises.length > 0 && allExercises.every((e) => e.completed)
          ? true
          : false,
    };
    cardDates.add(card.dateIso);
    if (existingNext) next[next.indexOf(existingNext)] = day;
    else next.push(day);
  }

  // dates that had a workout before but no card now were deleted/moved away
  for (const prev of prevDays) {
    if (cardDates.has(prev.date)) continue;
    if (prev.exercises.length === 0 && !prev.focus) {
      next.push(prev); // untouched empty placeholder
    } else {
      next.push({ ...prev, focus: null, exercises: [], sessionCompleted: false });
    }
  }

  return next.sort((a, b) => a.date.localeCompare(b.date));
}

