import React, { useState } from 'react';
import {
  X,
  Search,
  UserPlus,
  Trash2,
  Check,
  User,
  Shield,
  Activity,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ClientProfile, ThemeMode } from '../types';

interface ClientManagerModalProps {
  clients: ClientProfile[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onAddClient: (newClient: ClientProfile) => void;
  onDeleteClient: (clientId: string) => void;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'add'>('roster');

  // New Client Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');
  const [program, setProgram] = useState('');
  const [membershipStatus, setMembershipStatus] = useState<
    'Active' | 'Deload' | 'Rehab'
  >('Active');

  // Filter clients
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: ClientProfile = {
      id: `client-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@purefunction.fit`,
      membershipStatus,
      goal: goal.trim() || 'Strength & Biomechanical Optimization',
      coach: 'Marcus Vance, CSCS',
      currentProgram:
        program.trim() || 'Custom Periodized Block I (Pure Function)',
      assessments: [
        {
          id: `ass-initial-1`,
          name: 'Hip Internal Rotation',
          previousValue: 'Baseline',
          currentValue: '28°',
          targetValue: '35°',
          unit: 'degrees',
          notes: 'Initial functional screen.',
          improved: true,
        },
        {
          id: `ass-initial-2`,
          name: 'Thoracic Extension',
          previousValue: 'Baseline',
          currentValue: '20°',
          targetValue: '30°',
          unit: 'degrees',
          notes: 'Ribcage and spine mobility baseline.',
          improved: true,
        },
      ],
      homework: [
        {
          id: `hw-initial-1`,
          title: '90/90 Breathing & Positional Reset',
          frequency: '5 min daily',
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
    setProgram('');
    setActiveTab('roster');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all cursor-default ${
          isDark
            ? 'bg-[#12151c]/95 border border-neutral-800 text-slate-100'
            : 'bg-white/95 border border-neutral-200 text-neutral-900 shadow-2xl'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${
            isDark
              ? 'bg-[#161a22] border-neutral-800'
              : 'bg-slate-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight flex items-center gap-2">
                <span>TrueCoach Client Roster</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isDark
                      ? 'bg-neutral-800 text-amber-400'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {clients.length} Clients
                </span>
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                Search, switch, add, or manage active athlete profiles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close client manager"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Roster vs Add Client */}
        <div
          className={`flex items-center gap-2 px-5 sm:px-6 pt-3 border-b text-xs font-semibold ${
            isDark
              ? 'bg-[#0f1218] border-neutral-800/80'
              : 'bg-neutral-100/70 border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'roster'
                ? 'border-amber-400 text-amber-500 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-white'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Search & Select Client</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-amber-400 text-amber-500 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-white'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add New Client</span>
          </button>
        </div>

        {/* Tab 1: Client Roster with Search */}
        {activeTab === 'roster' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search athlete by name, email, or training goal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-[#181c26] border border-neutral-700/80 focus:border-amber-400 text-white placeholder-neutral-500'
                    : 'bg-white border border-neutral-300 focus:border-amber-400 text-neutral-900 placeholder-neutral-400 shadow-sm'
                }`}
              />
            </div>

            {/* Client List */}
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <div
                  className={`text-center py-8 rounded-xl border border-dashed ${
                    isDark
                      ? 'border-neutral-800 text-neutral-500'
                      : 'border-neutral-300 text-neutral-400'
                  }`}
                >
                  <p className="text-sm">No client matches your search.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="mt-2 text-xs text-amber-500 hover:underline font-semibold"
                  >
                    + Add a new client with this name
                  </button>
                </div>
              ) : (
                filteredClients.map((c) => {
                  const isSelected = c.id === selectedClientId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectClient(c.id);
                        onClose();
                      }}
                      className={`group p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? isDark
                            ? 'bg-amber-400/10 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                            : 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400/30'
                          : isDark
                          ? 'bg-[#151922] border-neutral-800/80 hover:bg-[#1b202c] hover:border-neutral-700'
                          : 'bg-slate-50/80 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar Image with Fallback */}
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.name}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shrink-0 border border-neutral-700/60 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          style={{ display: c.avatarUrl ? 'none' : 'flex' }}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl items-center justify-center font-bold text-sm shrink-0 ${
                            isSelected
                              ? 'bg-amber-400 text-black shadow-sm'
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

                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`text-sm font-bold truncate ${
                                isDark ? 'text-white' : 'text-neutral-900'
                              }`}
                            >
                              {c.name}
                            </h4>
                            <span
                              className={`text-xs ${
                                isDark ? 'text-neutral-400' : 'text-neutral-500'
                              }`}
                            >
                              · Age: {c.age || 28}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                                c.membershipStatus === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : c.membershipStatus === 'Deload'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              }`}
                            >
                              {c.membershipStatus}
                            </span>
                          </div>

                          <p
                            className={`text-xs truncate ${
                              isDark ? 'text-neutral-400' : 'text-neutral-500'
                            }`}
                          >
                            {c.currentProgram}
                          </p>
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isDark ? 'text-neutral-500' : 'text-neutral-400'
                            }`}
                          >
                            Goal: {c.goal}
                          </p>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && (
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-400/10 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        )}

                        {clients.length > 1 && (
                          <button
                            type="button"
                            title="Remove client from roster"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  `Are you sure you want to remove ${c.name} from the active roster?`
                                )
                              ) {
                                onDeleteClient(c.id);
                              }
                            }}
                            className={`p-1.5 rounded-lg opacity-60 group-hover:opacity-100 transition-colors ${
                              isDark
                                ? 'text-neutral-500 hover:text-red-400 hover:bg-neutral-800'
                                : 'text-neutral-400 hover:text-red-600 hover:bg-neutral-200'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Add New Client */}
        {activeTab === 'add' && (
          <form
            onSubmit={handleCreateClient}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          >
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                }`}
              >
                Client Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-[#181c26] border border-neutral-700/80 focus:border-amber-400 text-white placeholder-neutral-500'
                    : 'bg-white border border-neutral-300 focus:border-amber-400 text-neutral-900 placeholder-neutral-400'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                }`}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="jordan.miller@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-[#181c26] border border-neutral-700/80 focus:border-amber-400 text-white placeholder-neutral-500'
                    : 'bg-white border border-neutral-300 focus:border-amber-400 text-neutral-900 placeholder-neutral-400'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                }`}
              >
                Primary Focus / Injury Rehab / Goal
              </label>
              <input
                type="text"
                placeholder="e.g. Scapular upward rotation & deadlift mechanics"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-[#181c26] border border-neutral-700/80 focus:border-amber-400 text-white placeholder-neutral-500'
                    : 'bg-white border border-neutral-300 focus:border-amber-400 text-neutral-900 placeholder-neutral-400'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    isDark ? 'text-neutral-300' : 'text-neutral-700'
                  }`}
                >
                  Current Program
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strength Block I"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl outline-none transition-all ${
                    isDark
                      ? 'bg-[#181c26] border border-neutral-700/80 focus:border-amber-400 text-white placeholder-neutral-500'
                      : 'bg-white border border-neutral-300 focus:border-amber-400 text-neutral-900 placeholder-neutral-400'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    isDark ? 'text-neutral-300' : 'text-neutral-700'
                  }`}
                >
                  Status
                </label>
                <select
                  value={membershipStatus}
                  onChange={(e) =>
                    setMembershipStatus(
                      e.target.value as 'Active' | 'Deload' | 'Rehab'
                    )
                  }
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl outline-none cursor-pointer transition-all ${
                    isDark
                      ? 'bg-[#181c26] border border-neutral-700/80 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-900'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Deload">Deload</option>
                  <option value="Rehab">Rehab</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create & Activate Client</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div
          className={`px-5 sm:px-6 py-3 border-t flex items-center justify-between text-xs ${
            isDark
              ? 'bg-[#141720] border-neutral-800 text-neutral-400'
              : 'bg-slate-50 border-neutral-200 text-neutral-500'
          }`}
        >
          <span>TrueCoach Engine · Pure Function</span>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-500 hover:underline font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
