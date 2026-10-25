import React, { useState } from 'react';
import { PureFunctionLogo } from './PureFunctionLogo';

interface QuickEntryProps {
  /** Signs in as the shared test client; resolves to an error message, or nothing on success */
  onClient: () => Promise<string | undefined>;
  /** Opens the normal email/password login (the coach signs in once per device) */
  onCoach: () => void;
}

/** One-tap entry shown at the start while quick login is on (see isQuickLoginOn). */
export function QuickEntry({ onClient, onCoach }: QuickEntryProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enterAsClient = async () => {
    setBusy(true);
    setError(null);
    const err = await onClient();
    if (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#232328] text-white flex flex-col items-center px-5 py-10">
      <PureFunctionLogo theme="dark" className="h-10 mb-2" />
      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-8">
        Quick login · testing
      </p>

      <div className="w-full max-w-sm space-y-3">
        <button
          type="button"
          disabled={busy}
          onClick={enterAsClient}
          className="w-full rounded-xl bg-amber-400 text-black font-black py-4 text-base active:scale-[0.98] transition disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Enter as Client'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCoach}
          className="w-full rounded-xl border border-neutral-600 bg-neutral-800/60 font-bold py-4 text-base active:scale-[0.98] transition disabled:opacity-50"
        >
          Coach login
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-300 pt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
