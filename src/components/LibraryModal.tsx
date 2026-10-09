import React, { useState } from 'react';
import { X, Search, Dumbbell, Play, Filter, Check } from 'lucide-react';
import { EXERCISE_LIBRARY } from '../data/initialData';
import { Exercise, ThemeMode } from '../types';

interface LibraryModalProps {
  onClose: () => void;
  onSelectExercise?: (exercise: (typeof EXERCISE_LIBRARY)[0]) => void;
  onPreviewVideo?: (exercise: Exercise) => void;
  theme?: ThemeMode;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  onClose,
  onSelectExercise,
  onPreviewVideo,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Lower body',
    'Upper body',
    'Core',
    'Mobility',
    'Conditioning',
  ];

  const filtered = EXERCISE_LIBRARY.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] transition-all cursor-default border ${
          isDark
            ? 'bg-[#12151c]/95 border-neutral-800 text-slate-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark
              ? 'bg-[#161a22] border-neutral-800'
              : 'bg-slate-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                Movement Library & Demonstration Vault
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                Biomechanically validated movements with real video guides & cues
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close library modal"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div
          className={`p-4 sm:p-6 border-b flex flex-col sm:flex-row gap-3 items-center justify-between ${
            isDark
              ? 'bg-[#101318] border-neutral-800/80'
              : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="relative w-full sm:w-80">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            />
            <input
              type="text"
              placeholder="Search exercise, muscle, or cues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none transition-all ${
                isDark
                  ? 'bg-[#171b23] border border-neutral-700/80 focus:border-amber-400 text-white placeholder-neutral-500'
                  : 'bg-white border border-neutral-300 focus:border-amber-400 text-neutral-900 placeholder-neutral-400'
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <Filter
              className={`w-3.5 h-3.5 mr-1 shrink-0 ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black font-bold shadow-sm'
                    : isDark
                    ? 'bg-[#181c24] text-neutral-400 hover:text-white border border-neutral-800'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 group ${
                isDark
                  ? 'bg-[#151922] border-neutral-800/80 hover:border-amber-400/40 hover:bg-[#1a202c]'
                  : 'bg-slate-50 border-neutral-200 hover:border-amber-400/60 hover:bg-white shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <h4 className="font-bold text-sm group-hover:text-amber-500 transition-colors">
                    {item.name}
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 ${
                      isDark
                        ? 'bg-neutral-800 text-neutral-300'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <p
                  className={`text-xs mb-2.5 ${
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  }`}
                >
                  {item.notes}
                </p>

                {item.cues && (
                  <div
                    className={`space-y-1 p-2.5 rounded-lg border mb-2 ${
                      isDark
                        ? 'bg-[#101318] border-neutral-800/70'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                      Coaching Checkpoints:
                    </span>
                    <ul
                      className={`text-[11px] space-y-0.5 ${
                        isDark ? 'text-neutral-300' : 'text-neutral-700'
                      }`}
                    >
                      {item.cues.map((cue, cIdx) => (
                        <li key={cIdx} className="truncate">
                          · {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div
                className={`flex items-center justify-between pt-2.5 border-t ${
                  isDark ? 'border-neutral-800' : 'border-neutral-200'
                }`}
              >
                <div
                  className={`text-[11px] font-mono ${
                    isDark ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  {item.sets} sets × {item.reps} · {item.intensity}
                </div>

                <div className="flex items-center gap-2">
                  {onPreviewVideo && (
                    <button
                      type="button"
                      onClick={() =>
                        onPreviewVideo({
                          ...item,
                          id: `preview-${idx}`,
                          completed: false,
                        })
                      }
                      className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                        isDark
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                          : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                      }`}
                      title="Watch Real Video Demonstration"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-amber-500" />
                      <span>Video</span>
                    </button>
                  )}
                  {onSelectExercise && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectExercise(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                    >
                      <span>+ Add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex justify-end ${
            isDark
              ? 'bg-[#161a22] border-neutral-800'
              : 'bg-slate-50 border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
