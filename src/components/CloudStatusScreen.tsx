import React from 'react';
import { PureFunctionLogo } from './PureFunctionLogo';

interface Props {
  error: boolean;
  onRetry: () => void;
  onSignOut: () => void;
}

/** Shown between sign-in and the first successful data load from the cloud. */
export const CloudStatusScreen: React.FC<Props> = ({ error, onRetry, onSignOut }) => (
  <div className="min-h-dvh flex flex-col items-center justify-center gap-5 bg-[#14171f] px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center">
    <PureFunctionLogo theme="dark" variant="badge" className="w-full max-w-[260px]" />
    {error ? (
      <>
        <p className="text-sm text-neutral-300 max-w-xs">
          We couldn't load your data. Check your internet connection and try again.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2 rounded-full bg-amber-400 text-black text-sm font-black cursor-pointer"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="px-5 py-2 rounded-full border border-neutral-600 text-neutral-200 text-sm font-bold cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </>
    ) : (
      <p role="status" className="text-sm text-neutral-400">
        Loading your data…
      </p>
    )}
  </div>
);
