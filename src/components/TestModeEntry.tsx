import React from 'react';
import { AuthAccount, ClientProfile } from '../types';
import { PureFunctionLogo } from './PureFunctionLogo';

interface TestModeEntryProps {
  accounts: AuthAccount[];
  clients: ClientProfile[];
  onEnter: (account: AuthAccount) => void;
}

/**
 * Shown instead of the login screen while the login is frozen (see isLoginFrozen).
 * One tap = signed in as the coach or as a client. No email, no password, no cloud.
 */
export function TestModeEntry({ accounts, clients, onEnter }: TestModeEntryProps) {
  const coach = accounts.find((a) => a.role === 'trainer');
  const clientAccounts = accounts.filter((a) => a.role === 'client');

  return (
    <div className="min-h-dvh bg-[#232328] text-white flex flex-col items-center px-5 py-10">
      <PureFunctionLogo theme="dark" className="h-10 mb-2" />
      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-8">
        Test mode · no login
      </p>

      <div className="w-full max-w-sm space-y-6">
        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
            Coach
          </h2>
          <button
            type="button"
            disabled={!coach}
            onClick={() => coach && onEnter(coach)}
            className="w-full rounded-xl bg-amber-400 text-black font-black py-4 text-base active:scale-[0.98] transition disabled:opacity-40"
          >
            Enter as Coach
          </button>
        </section>

        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
            Client
          </h2>
          <div className="space-y-2 max-h-[48dvh] overflow-y-auto pr-1">
            {clientAccounts.length === 0 && (
              <p className="text-sm text-neutral-400">No clients yet.</p>
            )}
            {clientAccounts.map((acc) => {
              const profile = clients.find((c) => c.id === acc.clientId);
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => onEnter(acc)}
                  className="w-full text-left rounded-xl border border-neutral-600 bg-neutral-800/60 px-4 py-3 active:scale-[0.98] transition"
                >
                  <span className="block font-bold text-sm">
                    {profile?.name ?? acc.displayName}
                  </span>
                  <span className="block text-[11px] text-neutral-400">
                    Enter as this client
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
