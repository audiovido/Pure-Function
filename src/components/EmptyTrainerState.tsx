import React from 'react';
import { UserPlus, LogOut } from 'lucide-react';
import { PureFunctionLogo } from './PureFunctionLogo';

interface Props {
  trainerName: string;
  onAddClient: () => void;
  onSignOut: () => void;
}

/** Shown to a trainer who has no clients yet (fresh cloud account). */
export const EmptyTrainerState: React.FC<Props> = ({
  trainerName,
  onAddClient,
  onSignOut,
}) => (
  <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans">
    <header className="bg-gradient-to-b from-[#2b303c] to-[#14171f] px-4 py-2 flex items-center justify-between">
      <PureFunctionLogo theme="dark" className="h-8" />
      <button
        type="button"
        onClick={onSignOut}
        className="flex items-center gap-1.5 text-amber-400 text-xs font-bold cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </header>

    <main className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-xl font-black">Welcome{trainerName ? `, ${trainerName}` : ''}</h1>
        <p className="text-sm text-neutral-600">
          You have no clients yet. Add your first client with their email address — when they
          sign up with that same email, they will see the programs you build for them.
        </p>
        <button
          type="button"
          onClick={onAddClient}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-black text-sm font-black cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add your first client
        </button>
      </div>
    </main>
  </div>
);
