import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { ClientProfile, ThemeMode } from '../types';

interface ClientsManagementModalProps {
  clients: ClientProfile[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onAddClient?: (newClient: ClientProfile) => void;
  onDeleteClient?: (id: string) => void;
  onClose: () => void;
  theme?: ThemeMode;
}

export const ClientsManagementModal: React.FC<ClientsManagementModalProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onClose,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all cursor-default border ${
          isDark
            ? 'bg-[#11141c]/95 border-neutral-800 text-slate-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Minimal Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-neutral-800/80' : 'border-neutral-200'
          }`}
        >
          <h3 className="text-sm sm:text-base font-bold tracking-tight">
            Clients
          </h3>
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

        {/* Client List (Only Avatar, Name, Age) */}
        <div className="p-3 sm:p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {clients.map((c) => {
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
                  {c.avatarUrl ? (
                    <img
                      src={c.avatarUrl}
                      alt={c.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-neutral-700/60 shadow-xs"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
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
                      Age: {c.age || 28}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
