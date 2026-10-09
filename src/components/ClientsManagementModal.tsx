import React, { useState } from 'react';
import { X, Search, UserPlus, Trash2, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { ClientProfile, ThemeMode } from '../types';

interface ClientsManagementModalProps {
  clients: ClientProfile[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onAddClient: (newClient: ClientProfile) => void;
  onDeleteClient: (id: string) => void;
  onClose: () => void;
  theme?: ThemeMode;
}

export const ClientsManagementModal: React.FC<ClientsManagementModalProps> = ({
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

  // New client form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');
  const [program, setProgram] = useState('Foundational Hypertrophy Block');

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.goal.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: ClientProfile = {
      id: `client-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@purefunction.fit`,
      membershipStatus: 'Active',
      goal: goal.trim() || 'General strength & joint longevity',
      coach: 'Marcus Vance, CSCS',
      currentProgram: program.trim() || 'General Conditioning & Hypertrophy',
      assessments: [
        {
          id: `ass-1-${Date.now()}`,
          name: 'Movement Screen Baseline',
          previousValue: 'Initial',
          currentValue: 'Assessed',
          targetValue: 'Optimal',
          unit: 'score',
          notes: 'New client baseline evaluation.',
          improved: true,
        },
      ],
      homework: [
        {
          id: `hw-1-${Date.now()}`,
          title: 'Post-workout mobility routine',
          frequency: '10 min daily',
          completedDays: 0,
          targetDays: 7,
        },
      ],
    };

    onAddClient(newClient);
    onSelectClient(newClient.id);
    setName('');
    setEmail('');
    setGoal('');
    setIsAdding(false);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] cursor-default transition-all duration-200 ${
          isDark
            ? 'bg-[#12151c]/95 border border-neutral-800 text-slate-100 backdrop-blur-xl'
            : 'bg-white/95 border border-neutral-200 text-neutral-900 backdrop-blur-xl'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-5 sm:px-6 py-4 flex items-center justify-between border-b ${
            isDark ? 'bg-[#161a23] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                Athlete Roster & Client Directory
              </h3>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                TrueCoach client management & active training programs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Search Bar */}
        <div
          className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row gap-3 items-center justify-between ${
            isDark ? 'bg-[#0f1218] border-neutral-800/80' : 'bg-neutral-100/60 border-neutral-200'
          }`}
        >
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search athlete by name, email or goal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none transition-all ${
                isDark
                  ? 'bg-[#161a22] border border-neutral-700 focus:border-amber-400 text-white placeholder-neutral-500'
                  : 'bg-white border border-neutral-300 focus:border-amber-500 text-neutral-900 placeholder-neutral-400 shadow-sm'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : '+ Add New Athlete'}</span>
          </button>
        </div>

        {/* Add Client Form Expansion */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className={`p-4 sm:p-5 border-b space-y-3 animate-in fade-in duration-150 ${
              isDark ? 'bg-[#181c26] border-neutral-800' : 'bg-amber-50/50 border-amber-200/60'
            }`}
          >
            <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              New Athlete Registration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs rounded-lg outline-none ${
                    isDark
                      ? 'bg-[#11141b] border border-neutral-700 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. jordan@athlete.fit"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs rounded-lg outline-none ${
                    isDark
                      ? 'bg-[#11141b] border border-neutral-700 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Primary Fitness Objective / Rehab Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hip flexor mobility & 400m sprint conditioning"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs rounded-lg outline-none ${
                    isDark
                      ? 'bg-[#11141b] border border-neutral-700 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-sm"
              >
                Register & Open
              </button>
            </div>
          </form>
        )}

        {/* Client Roster List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-neutral-800/60">
          {filteredClients.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No athletes found matching &quot;{search}&quot;.
            </div>
          ) : (
            filteredClients.map((client) => {
              const isSelected = client.id === selectedClientId;
              const initials = client.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={client.id}
                  className={`py-3.5 px-3 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? isDark
                        ? 'bg-[#181c26] border border-amber-400/40'
                        : 'bg-amber-50 border border-amber-300'
                      : isDark
                      ? 'hover:bg-[#151821]'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Athlete Avatar Initials */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-amber-400 text-black shadow-sm'
                          : isDark
                          ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                          : 'bg-neutral-200 text-neutral-800 border border-neutral-300'
                      }`}
                    >
                      {initials}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{client.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/30">
                            Active in Editor
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            client.membershipStatus === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                          }`}
                        >
                          {client.membershipStatus}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {client.goal}
                      </p>
                      <p className={`text-[11px] mt-0.5 font-mono ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        Program: {client.currentProgram}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectClient(client.id);
                        onClose();
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-black font-bold'
                          : isDark
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                          : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      <span>{isSelected ? 'Selected' : 'Load Program'}</span>
                    </button>

                    {clients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${client.name} from the active roster?`)) {
                            onDeleteClient(client.id);
                          }
                        }}
                        title="Remove Athlete"
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isDark
                            ? 'text-neutral-500 hover:text-red-400 hover:bg-red-950/40'
                            : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-[#161a22] border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-500'
          }`}
        >
          <span>Total Athletes on Roster: {clients.length}</span>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-black'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
