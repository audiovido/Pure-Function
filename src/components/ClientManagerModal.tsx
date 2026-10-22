import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Search, UserPlus } from 'lucide-react';
import { ClientProfile, ThemeMode } from '../types';
import {
  DEFAULT_FMS_RECORDS,
  DEFAULT_MACRO_TARGETS,
  DEFAULT_PROGRAM_BLOCKS,
} from '../services/storageService';

interface ClientManagerModalProps {
  clients: ClientProfile[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onAddClient?: (newClient: ClientProfile) => void;
  onDeleteClient?: (clientId: string) => void;
  onClose: () => void;
  theme?: ThemeMode;
}

export const ClientManagerModal: React.FC<ClientManagerModalProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onAddClient,
  onDeleteClient,
  onClose,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New Client Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('28');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('client123');
  const [status, setStatus] = useState<'Active' | 'Deload' | 'Rehab'>('Active');
  const [goal, setGoal] = useState('');
  const [program, setProgram] = useState(
    'Lower Body Symmetry & Pelvic Control Block II'
  );

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.username || '').toLowerCase().includes(search.toLowerCase()) ||
      c.membershipStatus.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !onAddClient) return;

    const cleanSlug =
      username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') ||
      name
        .trim()
        .split(' ')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const clientId = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    const newClient: ClientProfile = {
      id: clientId,
      name: name.trim(),
      age: parseInt(age, 10) || 28,
      email: `${cleanSlug}@purefunction.fit`,
      username: cleanSlug,
      password: password.trim() || 'client123',
      membershipStatus: status,
      goal:
        goal.trim() ||
        'Hip mobility, core stability, and progressive strength development',
      coach: 'Marcus Vance, CSCS',
      currentProgram: program.trim() || 'Block I: Movement Foundation',
      assessments: [
        {
          id: `ass-${Date.now()}-1`,
          name: 'Hip Internal Rotation',
          previousValue: '24°',
          currentValue: '29°',
          targetValue: '35°',
          unit: 'degrees',
          notes: 'Initial baseline intake assessment.',
          improved: true,
        },
      ],
      homework: [
        {
          id: `hw-${Date.now()}-1`,
          title: '90/90 Diaphragmatic Breathing',
          frequency: '5 minutes daily',
          completedDays: 0,
          targetDays: 7,
        },
      ],
      macroTargets: DEFAULT_MACRO_TARGETS,
      fmsRecords: DEFAULT_FMS_RECORDS,
      programBlocks: DEFAULT_PROGRAM_BLOCKS,
    };

    onAddClient(newClient);
    setIsAdding(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all cursor-default border ${
          isDark
            ? 'bg-[#11141c]/95 border-neutral-800 text-slate-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-neutral-800/80' : 'border-neutral-200'
          }`}
        >
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight">
              Clients ({clients.length})
            </h3>
            <p
              className={`text-[11px] ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Select an athlete or add a new client with portal credentials
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onAddClient && (
              <button
                type="button"
                onClick={() => setIsAdding((prev) => !prev)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isAdding ? 'Back' : 'Add Client'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add New Client Form */}
        {isAdding ? (
          <form onSubmit={handleCreateClient} className="p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <UserPlus className="w-4 h-4" />
              <span>New Athlete Profile & Login Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold mb-1 text-neutral-400">
                  Athlete Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ryan Sterling"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!username) {
                      setUsername(
                        e.target.value
                          .split(' ')[0]
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '')
                      );
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isDark
                      ? 'bg-[#161a24] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1 text-neutral-400">
                  Age
                </label>
                <input
                  type="number"
                  min={12}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono tabular-nums outline-none ${
                    isDark
                      ? 'bg-[#161a24] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold mb-1 text-neutral-400">
                  Client Sign-In Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ryan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                    isDark
                      ? 'bg-[#161a24] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1 text-neutral-400">
                  Client Sign-In Password
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                    isDark
                      ? 'bg-[#161a24] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold mb-1 text-neutral-400">
                  Training Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as 'Active' | 'Deload' | 'Rehab')
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isDark
                      ? 'bg-[#161a24] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Deload">Deload</option>
                  <option value="Rehab">Rehab</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1 text-neutral-400">
                  Assigned Program Block
                </label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isDark
                      ? 'bg-[#161a24] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 text-neutral-400">
                Primary Goal / Biomechanical Focus
              </label>
              <input
                type="text"
                placeholder="e.g. Posterior chain strength & ankle dorsiflexion"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                  isDark
                    ? 'bg-[#161a24] border-neutral-700 text-white'
                    : 'bg-slate-50 border-neutral-300 text-neutral-900'
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer"
              >
                Create Athlete & Credentials
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Search Filter */}
            <div className="px-4 pt-3">
              <div className="relative">
                <Search
                  className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-neutral-500' : 'text-neutral-400'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search athletes by name, @username, or status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none ${
                    isDark
                      ? 'bg-[#161a24] border-neutral-800 focus:border-amber-400 text-white'
                      : 'bg-slate-50 border-neutral-200 focus:border-amber-500 text-neutral-900'
                  }`}
                />
              </div>
            </div>

            {/* Client List */}
            <div className="p-3 sm:p-4 space-y-2 max-h-[65vh] overflow-y-auto">
              {filteredClients.map((c) => {
                const isSelected = c.id === selectedClientId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectClient(c.id);
                      onClose();
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? isDark
                          ? 'bg-amber-400/10 border-amber-400/80 shadow-xs ring-1 ring-amber-400/30'
                          : 'bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400/30'
                        : isDark
                        ? 'bg-[#161a24]/80 border-neutral-800/80 hover:bg-[#1c2230] hover:border-neutral-700'
                        : 'bg-slate-50 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar Photo with Fallback */}
                      {c.avatarUrl ? (
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-neutral-700/60 shadow-xs"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        style={{ display: c.avatarUrl ? 'none' : 'flex' }}
                        className={`w-10 h-10 rounded-xl items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected
                            ? 'bg-amber-400 text-black shadow-xs'
                            : isDark
                            ? 'bg-neutral-800 text-amber-400 border border-neutral-700'
                            : 'bg-neutral-200 text-neutral-800 border border-neutral-300'
                        }`}
                      >
                        {c.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      {/* Name, Age, and Login Username */}
                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-bold truncate ${
                            isDark ? 'text-white' : 'text-neutral-900'
                          }`}
                        >
                          {c.name}
                        </h4>
                        <span
                          className={`text-xs block mt-0.5 ${
                            isDark ? 'text-neutral-400' : 'text-neutral-500'
                          }`}
                        >
                          Age: {c.age || 28} · {c.membershipStatus}
                          {c.username ? ` · @${c.username}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      {onDeleteClient && clients.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClient(c.id);
                          }}
                          title="Remove client from roster"
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDark
                              ? 'text-neutral-500 hover:text-red-400 hover:bg-neutral-800'
                              : 'text-neutral-400 hover:text-red-600 hover:bg-neutral-200'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
