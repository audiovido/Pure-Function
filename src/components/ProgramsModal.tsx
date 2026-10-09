import React from 'react';
import { X, Calendar, Layers, CheckCircle } from 'lucide-react';
import { ClientProfile, ThemeMode } from '../types';

interface ProgramsModalProps {
  client: ClientProfile;
  onClose: () => void;
  theme?: ThemeMode;
}

export const ProgramsModal: React.FC<ProgramsModalProps> = ({
  client,
  onClose,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const blocks = [
    {
      title: 'Block I: Pelvic Alignment & Soft Tissue Reset',
      duration: 'Weeks 1–4',
      status: 'Completed',
      focus:
        'Acetabular glide, 90/90 breathing, ribcage stacking, unloaded hinge pattern.',
      active: false,
    },
    {
      title: 'Block II: Lower Body Symmetry & Pelvic Control',
      duration: 'Weeks 5–8 (Current Block)',
      status: 'In Progress',
      focus:
        'Goblet squat progression, single-leg RDL balance, anti-rotation core, glute medius activation.',
      active: true,
    },
    {
      title: 'Block III: Multi-Planar Strength & Dynamic Loading',
      duration: 'Weeks 9–12',
      status: 'Upcoming',
      focus:
        'Barbell front squat, lateral lunges, reactive plyometrics, heavier deadlift variations.',
      active: false,
    },
  ];

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
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col cursor-default border ${
          isDark
            ? 'bg-[#13161c]/95 border-neutral-800 text-slate-100'
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
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                Periodization & Long-term Programs
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                {client.name} · {client.currentProgram}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close programs modal"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            12-Week Periodized Block Progression
          </div>

          <div className="space-y-3">
            {blocks.map((block, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  block.active
                    ? isDark
                      ? 'bg-[#181c26] border-amber-400/70 shadow-lg'
                      : 'bg-amber-50/80 border-amber-400 shadow-sm'
                    : isDark
                    ? 'bg-[#151820] border-neutral-800/80'
                    : 'bg-slate-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{block.title}</span>
                    {block.active && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-mono ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {block.duration}
                  </span>
                </div>
                <p
                  className={`text-xs ${
                    isDark ? 'text-neutral-300' : 'text-neutral-600'
                  }`}
                >
                  {block.focus}
                </p>
              </div>
            ))}
          </div>
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
            className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
