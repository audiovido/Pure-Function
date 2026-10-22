import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AuthAccount, ClientProfile, ThemeMode } from '../types';
import { PureFunctionLogo } from './PureFunctionLogo';

interface AuthScreenProps {
  accounts: AuthAccount[];
  clients: ClientProfile[];
  onAuthenticated: (account: AuthAccount) => void;
  onRegisterAccount?: (
    newAccount: AuthAccount,
    newClientProfile?: ClientProfile
  ) => void;
  theme: ThemeMode;
  onToggleTheme?: () => void;
}

/**
 * Larger, Sleek 3D Obsidian-Black Glass Icon for Trainer (Coaching Tactical Board & Check)
 */
const BlackGlassTrainerIcon: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    className="w-12 h-12 shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.28)]"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="trainerBoardBody"
        x1="10"
        y1="6"
        x2="38"
        y2="42"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#3F3F46" stopOpacity="0.96" />
        <stop offset="45%" stopColor="#18181B" stopOpacity="0.94" />
        <stop offset="100%" stopColor="#09090B" stopOpacity="0.98" />
      </linearGradient>
      <linearGradient
        id="trainerBoardRim"
        x1="10"
        y1="6"
        x2="38"
        y2="42"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#71717A" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient
        id="trainerGlassGloss"
        x1="12"
        y1="9"
        x2="30"
        y2="25"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <linearGradient
        id="trainerGoldStroke"
        x1="15"
        y1="18"
        x2="33"
        y2="34"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>

    {/* 3D Back Shadow Layer */}
    <rect
      x="11"
      y="9"
      width="26"
      height="32"
      rx="7"
      fill="#000000"
      fillOpacity="0.25"
      transform="translate(1.5, 2)"
    />

    {/* Frosted Obsidian Glass Board */}
    <rect
      x="11"
      y="9"
      width="26"
      height="32"
      rx="7"
      fill="url(#trainerBoardBody)"
      stroke="url(#trainerBoardRim)"
      strokeWidth="1.5"
    />

    {/* Top Glass Reflection */}
    <path
      d="M12.5 16C12.5 12.9624 14.9624 10.5 18 10.5H30C33.0376 10.5 35.5 12.9624 35.5 16V20C28 22.8 20 23.2 12.5 20.5V16Z"
      fill="url(#trainerGlassGloss)"
    />

    {/* Top Gold/Obsidian Clamp */}
    <rect
      x="17.5"
      y="6"
      width="13"
      height="5.5"
      rx="2.75"
      fill="#18181B"
      stroke="#FBBF24"
      strokeWidth="1.4"
    />

    {/* Tactical Coaching Lines & Gold Checkmark */}
    <path
      d="M17 19H25"
      stroke="#A1A1AA"
      strokeOpacity="0.65"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M17.5 28.5L22 33L31 23.5"
      stroke="url(#trainerGoldStroke)"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Larger, Sleek 3D Gold-Yellow Glass Icon for Client (3D Pro Hex Dumbbell)
 */
const YellowGlassClientIcon: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    className="w-12 h-12 shrink-0 drop-shadow-[0_6px_14px_rgba(251,191,36,0.38)]"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="clientGoldPlate"
        x1="6"
        y1="10"
        x2="42"
        y2="38"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.98" />
        <stop offset="38%" stopColor="#FDE047" stopOpacity="0.95" />
        <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#B45309" stopOpacity="0.98" />
      </linearGradient>
      <linearGradient
        id="clientGoldRim"
        x1="6"
        y1="10"
        x2="42"
        y2="38"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="55%" stopColor="#FEF08A" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#D97706" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient
        id="clientBarGrip"
        x1="16"
        y1="21"
        x2="32"
        y2="27"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FEF9C3" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
    </defs>

    {/* Rotated -30 deg for a dynamic, modern 3D athletic look */}
    <g transform="rotate(-28 24 24)">
      {/* 3D Depth Shadow */}
      <g opacity="0.28" transform="translate(1, 2)">
        <rect x="14" y="21.5" width="20" height="5" rx="2" fill="#F59E0B" />
        <rect x="8.5" y="13" width="6.5" height="22" rx="3.2" fill="#F59E0B" />
        <rect x="33" y="13" width="6.5" height="22" rx="3.2" fill="#F59E0B" />
        <rect x="4.5" y="16.5" width="4.5" height="15" rx="2.2" fill="#F59E0B" />
        <rect x="39" y="16.5" width="4.5" height="15" rx="2.2" fill="#F59E0B" />
      </g>

      {/* Center Knurled Glass Handle */}
      <rect
        x="14"
        y="21.5"
        width="20"
        height="5"
        rx="2"
        fill="url(#clientBarGrip)"
        stroke="#FFFFFF"
        strokeOpacity="0.75"
        strokeWidth="1"
      />

      {/* Outer Left Weight Plate */}
      <rect
        x="4.5"
        y="16.5"
        width="4.8"
        height="15"
        rx="2.4"
        fill="url(#clientGoldPlate)"
        stroke="url(#clientGoldRim)"
        strokeWidth="1.2"
      />
      {/* Inner Left Weight Plate */}
      <rect
        x="9"
        y="12.5"
        width="6.8"
        height="23"
        rx="3.4"
        fill="url(#clientGoldPlate)"
        stroke="url(#clientGoldRim)"
        strokeWidth="1.35"
      />
      {/* Specular Glass Highlight on Left Plate */}
      <path
        d="M11.2 15.2V23"
        stroke="#FFFFFF"
        strokeOpacity="0.85"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Outer Right Weight Plate */}
      <rect
        x="38.7"
        y="16.5"
        width="4.8"
        height="15"
        rx="2.4"
        fill="url(#clientGoldPlate)"
        stroke="url(#clientGoldRim)"
        strokeWidth="1.2"
      />
      {/* Inner Right Weight Plate */}
      <rect
        x="32.2"
        y="12.5"
        width="6.8"
        height="23"
        rx="3.4"
        fill="url(#clientGoldPlate)"
        stroke="url(#clientGoldRim)"
        strokeWidth="1.35"
      />
      {/* Specular Glass Highlight on Right Plate */}
      <path
        d="M34.4 15.2V23"
        stroke="#FFFFFF"
        strokeOpacity="0.85"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({
  accounts,
  clients,
  onAuthenticated,
}) => {
  // Always visible from the start (defaults to 'trainer')
  const [selectedRole, setSelectedRole] = useState<'trainer' | 'client'>(
    'trainer'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const role = selectedRole;
    const trimmedUser = username.trim().toLowerCase();

    const matchedAccount = accounts.find(
      (acc) =>
        acc.role === role &&
        (acc.username.toLowerCase() === trimmedUser ||
          acc.email.toLowerCase() === trimmedUser)
    );

    if (matchedAccount) {
      onAuthenticated(matchedAccount);
      return;
    }

    if (role === 'trainer') {
      const defaultTrainer = accounts.find((acc) => acc.role === 'trainer') || {
        id: 'trainer-marcus',
        username: trimmedUser || 'marcus',
        password: password || 'coach123',
        role: 'trainer',
        displayName: username.trim() || 'Marcus Vance, CSCS',
        email: 'marcus.vance@purefunction.fit',
      };
      onAuthenticated(defaultTrainer);
    } else {
      const firstClient = clients[0];
      const defaultClient = accounts.find((acc) => acc.role === 'client') || {
        id: `user-${firstClient?.id || 'alex-morgan'}`,
        username: trimmedUser || 'alex',
        password: password || 'client123',
        role: 'client',
        displayName: firstClient?.name || 'Alex Morgan',
        email: firstClient?.email || 'alex@purefunction.fit',
        clientId: firstClient?.id || 'alex-morgan',
      };
      onAuthenticated(defaultClient);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-neutral-900">
      {/* Header: Soft Charcoal-Gray & Black gradient with subtle gray sheen & shadow (matching Client tile) */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#2b303c] via-[#1d212b] to-[#14171f] border-b border-neutral-700/70 px-4 sm:px-6 py-2.5 shadow-[0_6px_18px_-4px_rgba(20,23,31,0.28),inset_0_1px_1px_rgba(255,255,255,0.14)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between min-h-[42px] sm:min-h-[48px]">
          <PureFunctionLogo theme="dark" className="h-9 sm:h-11 md:h-12" />
        </div>
      </header>

      {/* Symmetrical Centered Portal on Pure White Background */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 bg-white">
        {/* Shared width container so Left/Right of the 2 squares align 100% flush with the Username/Password card below */}
        <div className="w-full max-w-[320px] flex flex-col items-stretch gap-4">
          {/* Side-by-Side (Left & Right) True 1:1 Squares Aligned Flush with Form */}
          <div className="grid grid-cols-2 gap-3.5 w-full">
            {/* Left Square: TRAINER / SIGN IN */}
            <button
              type="button"
              onClick={() => setSelectedRole('trainer')}
              className={`relative w-full aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2.5 p-3 transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-black ${
                selectedRole === 'trainer'
                  ? 'border-amber-300 shadow-[0_8px_18px_-6px_rgba(245,158,11,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.75)] scale-[1.01]'
                  : 'border-amber-300/60 opacity-80 hover:opacity-100 shadow-[0_4px_10px_-4px_rgba(245,158,11,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.55)]'
              }`}
            >
              <BlackGlassTrainerIcon />
              <div className="relative z-10 flex flex-col items-center leading-none">
                <span className="text-[13px] font-black tracking-wider uppercase text-black">
                  Trainer
                </span>
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-black/80 mt-1">
                  Sign In
                </span>
              </div>
            </button>

            {/* Right Square: CLIENT / SIGN IN */}
            <button
              type="button"
              onClick={() => setSelectedRole('client')}
              className={`relative w-full aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2.5 p-3 transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-to-b from-[#323846] via-[#202531] to-[#151821] text-amber-400 ${
                selectedRole === 'client'
                  ? 'border-neutral-600/80 shadow-[0_8px_18px_-6px_rgba(21,24,33,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.2)] scale-[1.01]'
                  : 'border-neutral-700/60 opacity-85 hover:opacity-100 shadow-[0_4px_10px_-4px_rgba(21,24,33,0.22),inset_0_1px_1.5px_rgba(255,255,255,0.14)]'
              }`}
            >
              <YellowGlassClientIcon />
              <div className="relative z-10 flex flex-col items-center leading-none">
                <span className="text-[13px] font-black tracking-wider uppercase text-amber-400">
                  Client
                </span>
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-300/85 mt-1">
                  Sign In
                </span>
              </div>
            </button>
          </div>

          {/* Flush-Aligned Username & Password Form (Clean Liquid Silver-Gray Card without extra inner lines/halos) */}
          <form
            onSubmit={handleSignIn}
            className="w-full p-5 rounded-2xl border border-slate-300/80 bg-gradient-to-b from-[#f3f5f8] via-[#e4e8f0] to-[#d5dbe6] shadow-[0_10px_24px_-8px_rgba(71,85,105,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.9)] space-y-4 transition-all"
          >
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5 text-slate-600">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-label="Username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300/80 bg-white text-neutral-900 text-xs sm:text-sm outline-none transition-all focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5 text-slate-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300/80 bg-white text-neutral-900 text-xs sm:text-sm outline-none transition-all focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border ${
                selectedRole === 'trainer'
                  ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-black border-amber-300 shadow-[0_6px_14px_-4px_rgba(245,158,11,0.32),inset_0_1px_1.5px_rgba(255,255,255,0.75)]'
                  : 'bg-gradient-to-b from-[#323846] via-[#202531] to-[#151821] hover:from-[#3a4152] hover:via-[#262c3a] hover:to-[#1a1e29] text-amber-400 border-neutral-600/80 shadow-[0_6px_14px_-4px_rgba(21,24,33,0.32),inset_0_1px_1.5px_rgba(255,255,255,0.18)]'
              }`}
            >
              <span>
                Sign In ({selectedRole === 'trainer' ? 'Trainer' : 'Client'})
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
