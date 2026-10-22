import React, { useState } from 'react';
import { X, Layers, Plus, Check, Trash2 } from 'lucide-react';
import { ClientProfile, ProgramBlock, ThemeMode } from '../types';
import { DEFAULT_PROGRAM_BLOCKS } from '../services/storageService';

interface ProgramsModalProps {
  client: ClientProfile;
  onClose: () => void;
  onUpdatePrograms?: (
    blocks: ProgramBlock[],
    activeProgramTitle: string
  ) => void;
  theme?: ThemeMode;
}

export const ProgramsModal: React.FC<ProgramsModalProps> = ({
  client,
  onClose,
  onUpdatePrograms,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const blocks = client.programBlocks || DEFAULT_PROGRAM_BLOCKS;

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('Weeks 9–12');
  const [focus, setFocus] = useState('');

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

  const handleSetActive = (blockId: string) => {
    if (!onUpdatePrograms) return;
    const nextBlocks = blocks.map((b) => ({
      ...b,
      active: b.id === blockId,
      status:
        b.id === blockId
          ? ('In Progress' as const)
          : b.status === 'In Progress'
          ? ('Completed' as const)
          : b.status,
    }));
    const activeBlock = nextBlocks.find((b) => b.active);
    onUpdatePrograms(
      nextBlocks,
      activeBlock ? activeBlock.title : client.currentProgram
    );
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !onUpdatePrograms) return;
    const newBlock: ProgramBlock = {
      id: `blk-${Date.now()}`,
      title: title.trim(),
      duration: duration.trim() || '4 Weeks',
      status: 'Upcoming',
      focus:
        focus.trim() ||
        'Progressive overload, movement symmetry, and joint resilience.',
      active: false,
    };
    onUpdatePrograms([...blocks, newBlock], client.currentProgram);
    setTitle('');
    setFocus('');
    setIsAdding(false);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!onUpdatePrograms || blocks.length <= 1) return;
    const remaining = blocks.filter((b) => b.id !== blockId);
    if (!remaining.some((b) => b.active)) {
      remaining[0].active = true;
      remaining[0].status = 'In Progress';
    }
    const activeBlock = remaining.find((b) => b.active);
    onUpdatePrograms(
      remaining,
      activeBlock ? activeBlock.title : client.currentProgram
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default border ${
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
                Periodization & Training Blocks
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
          <div className="flex items-center gap-2">
            {onUpdatePrograms && (
              <button
                type="button"
                onClick={() => setIsAdding((prev) => !prev)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Block</span>
              </button>
            )}
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {isAdding && (
            <form
              onSubmit={handleAddBlock}
              className={`p-4 rounded-xl border space-y-3 ${
                isDark
                  ? 'bg-[#181c26] border-neutral-700'
                  : 'bg-slate-50 border-neutral-300'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="Block title (e.g. Block IV: Peak Power)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`sm:col-span-2 px-3 py-2 rounded-lg border text-xs outline-none ${
                    isDark
                      ? 'bg-[#11141c] border-neutral-700 text-white'
                      : 'bg-white border-neutral-300 text-neutral-900'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. Weeks 13–16)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={`px-3 py-2 rounded-lg border text-xs outline-none ${
                    isDark
                      ? 'bg-[#11141c] border-neutral-700 text-white'
                      : 'bg-white border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <input
                type="text"
                placeholder="Primary biomechanical & strength focus..."
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-[#11141c] border-neutral-700 text-white'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Save Block
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {blocks.map((block) => (
              <div
                key={block.id}
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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{block.title}</span>
                    {block.active && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-mono ${
                        isDark ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      {block.duration}
                    </span>
                    {onUpdatePrograms && !block.active && (
                      <button
                        type="button"
                        onClick={() => handleSetActive(block.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                          isDark
                            ? 'bg-neutral-800 hover:bg-amber-400 hover:text-black border-neutral-700 text-neutral-300'
                            : 'bg-white hover:bg-amber-400 border-neutral-300 text-neutral-700'
                        }`}
                      >
                        Set Active
                      </button>
                    )}
                    {onUpdatePrograms && blocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1 rounded-lg text-neutral-500 hover:text-red-400 cursor-pointer"
                        title="Remove block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
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
