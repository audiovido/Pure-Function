import React, { useState } from 'react';
import { X, Plus, Dumbbell, Sparkles } from 'lucide-react';
import { Exercise, ThemeMode } from '../types';
import { EXERCISE_LIBRARY } from '../data/initialData';

interface AddExerciseModalProps {
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
  initialExercise?: Exercise | null;
  theme?: ThemeMode;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  onClose,
  onAdd,
  initialExercise,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [name, setName] = useState(initialExercise?.name || '');
  const [sets, setSets] = useState<number>(initialExercise?.sets || 3);
  const [reps, setReps] = useState(initialExercise?.reps || '8');
  const [intensity, setIntensity] = useState(
    initialExercise?.intensity || '35 lb'
  );
  const [rest, setRest] = useState(initialExercise?.rest || '90 sec');
  const [notes, setNotes] = useState(initialExercise?.notes || '');
  const [category, setCategory] = useState<Exercise['category']>(
    initialExercise?.category || 'Lower body'
  );

  const handleSelectTemplate = (template: (typeof EXERCISE_LIBRARY)[0]) => {
    setName(template.name);
    setSets(template.sets);
    setReps(template.reps);
    setIntensity(template.intensity);
    setRest(template.rest);
    setNotes(template.notes);
    setCategory(template.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newExercise: Exercise = {
      id: initialExercise?.id || `ex-${Date.now()}`,
      name: name.trim(),
      sets: Number(sets) || 3,
      reps: reps.trim() || '8',
      intensity: intensity.trim() || '35 lb',
      rest: rest.trim() || '90 sec',
      notes: notes.trim() || 'Maintain steady tempo.',
      category: category,
      completed: initialExercise?.completed || false,
      durationSeconds: 40,
      videoDurationText: '0:40',
      cues: [
        'Maintain stacked ribcage & neutral pelvis',
        'Controlled eccentric phase (3 seconds)',
        'Drive through midfoot',
      ],
    };

    onAdd(newExercise);
    onClose();
  };

  // Keyboard escape listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col cursor-default border ${
          isDark
            ? 'bg-[#14171e] border-neutral-800 text-slate-100'
            : 'bg-white border-neutral-200 text-neutral-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark
              ? 'bg-[#171b23] border-neutral-800'
              : 'bg-slate-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold">
              {initialExercise ? 'Edit Exercise Movement' : 'Add Movement to Session'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick template suggestions */}
        <div
          className={`px-5 pt-3 pb-2 border-b ${
            isDark
              ? 'bg-[#101318] border-neutral-800/60'
              : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="text-[11px] font-semibold text-neutral-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Select from Exercise Library:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pb-1 max-h-24 overflow-y-auto">
            {EXERCISE_LIBRARY.slice(0, 6).map((lib) => (
              <button
                key={lib.name}
                type="button"
                onClick={() => handleSelectTemplate(lib)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                  name === lib.name
                    ? 'bg-amber-400 text-black font-bold border-amber-400'
                    : isDark
                    ? 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:border-neutral-500'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                }`}
              >
                {lib.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-sm">
          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              }`}
            >
              Exercise Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Goblet squat, Bulgarian split squat"
              className={`w-full px-3.5 py-2 rounded-xl border outline-none transition-colors ${
                isDark
                  ? 'bg-[#0b0d12] border-neutral-700 focus:border-amber-400 text-white placeholder-neutral-500'
                  : 'bg-slate-50 border-neutral-300 focus:border-amber-400 text-neutral-900 placeholder-neutral-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Exercise['category'])
                }
                className={`w-full px-3.5 py-2 rounded-xl border outline-none cursor-pointer ${
                  isDark
                    ? 'bg-[#0b0d12] border-neutral-700 text-white'
                    : 'bg-slate-50 border-neutral-300 text-neutral-900'
                }`}
              >
                <option value="Lower body">Lower body</option>
                <option value="Upper body">Upper body</option>
                <option value="Core">Core</option>
                <option value="Mobility">Mobility</option>
                <option value="Conditioning">Conditioning</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                Sets
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                className={`w-full px-3.5 py-2 rounded-xl border outline-none ${
                  isDark
                    ? 'bg-[#0b0d12] border-neutral-700 focus:border-amber-400 text-white'
                    : 'bg-slate-50 border-neutral-300 focus:border-amber-400 text-neutral-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                Reps
              </label>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="8 or 10 / side"
                className={`w-full px-3 py-2 rounded-xl border outline-none text-xs ${
                  isDark
                    ? 'bg-[#0b0d12] border-neutral-700 focus:border-amber-400 text-white'
                    : 'bg-slate-50 border-neutral-300 focus:border-amber-400 text-neutral-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                Load / Intensity
              </label>
              <input
                type="text"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                placeholder="35 lb or RPE 8"
                className={`w-full px-3 py-2 rounded-xl border outline-none text-xs ${
                  isDark
                    ? 'bg-[#0b0d12] border-neutral-700 focus:border-amber-400 text-white'
                    : 'bg-slate-50 border-neutral-300 focus:border-amber-400 text-neutral-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                Rest
              </label>
              <input
                type="text"
                value={rest}
                onChange={(e) => setRest(e.target.value)}
                placeholder="90 sec"
                className={`w-full px-3 py-2 rounded-xl border outline-none text-xs ${
                  isDark
                    ? 'bg-[#0b0d12] border-neutral-700 focus:border-amber-400 text-white'
                    : 'bg-slate-50 border-neutral-300 focus:border-amber-400 text-neutral-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              }`}
            >
              Coach Notes / Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Keep ribs stacked, 3 second eccentric descent..."
              className={`w-full px-3.5 py-2 rounded-xl border outline-none text-xs resize-none ${
                isDark
                  ? 'bg-[#0b0d12] border-neutral-700 focus:border-amber-400 text-white placeholder-neutral-500'
                  : 'bg-slate-50 border-neutral-300 focus:border-amber-400 text-neutral-900 placeholder-neutral-400'
              }`}
            />
          </div>

          <div
            className={`flex items-center justify-end gap-2.5 pt-3 border-t ${
              isDark ? 'border-neutral-800' : 'border-neutral-200'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{initialExercise ? 'Save Changes' : 'Add to Workout'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
