import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { Exercise } from '../types';
import { ExerciseSummary, LoggedSet, WeightUnit } from '../utils/progress';
import { formatShortDateLabel } from './DateRangeCalendarModal';

interface Props {
  exercise: Exercise;
  summary: ExerciseSummary;
  defaultUnit: WeightUnit;
  onSave: (updates: Partial<Exercise>) => void;
}

const fmt = (l: LoggedSet) => `${l.weightText} × ${l.repsText}`;

/** Lets a client log weight + reps for an exercise and shows last result / personal record. */
export const ExerciseResultLogger: React.FC<Props> = ({
  exercise,
  summary,
  defaultUnit,
  onSave,
}) => {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(exercise.actualWeight ?? '');
  const [reps, setReps] = useState(exercise.actualReps ?? '');

  const logged = !!exercise.actualWeight || !!exercise.actualReps;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    let w = weight.trim();
    // a bare number gets the client's preferred unit
    if (w && /^\d+(\.\d+)?$/.test(w)) w = `${w} ${defaultUnit}`;
    const r = reps.trim();
    const setCount = (r.match(/\d+/g) || []).length;
    onSave({
      actualWeight: w || undefined,
      actualReps: r || undefined,
      actualSets: setCount > 1 ? setCount : exercise.sets,
      completed: true,
      completedAt: new Date().toISOString(),
    });
    setOpen(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-neutral-100 text-xs">
      {(summary.last || summary.pr) && (
        <div className="text-neutral-500 space-y-0.5 mb-2">
          {summary.last && (
            <div>
              Last time:{' '}
              <span className="font-semibold text-neutral-700">{fmt(summary.last)}</span>{' '}
              <span className="text-neutral-400">
                ({formatShortDateLabel(summary.last.date)})
              </span>
            </div>
          )}
          {summary.pr && (
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              PR:{' '}
              <span className="font-semibold text-neutral-700">{fmt(summary.pr)}</span>
            </div>
          )}
        </div>
      )}

      {!open && (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 truncate">
            {logged ? (
              <span className="font-semibold text-neutral-800">
                Logged: {exercise.actualWeight || '—'} × {exercise.actualReps || '—'}
              </span>
            ) : (
              <span className="text-neutral-400">No result logged</span>
            )}
            {summary.isNewPr && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-black font-bold">
                <Trophy className="w-3 h-3" /> New PR
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 px-3 py-1.5 rounded-full border border-neutral-200 hover:border-amber-400 font-semibold text-neutral-800 cursor-pointer"
          >
            {logged ? 'Edit' : 'Log result'}
          </button>
        </div>
      )}

      {open && (
        <form onSubmit={save} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Weight
              </span>
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={`135 ${defaultUnit}`}
                inputMode="decimal"
                autoFocus
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:border-amber-400 text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Reps (per set)
              </span>
              <input
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="8, 8, 7"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:border-amber-400 text-sm"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-full text-neutral-500 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-amber-400 text-black font-bold cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
