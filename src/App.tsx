/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_OCTOBER_WORKOUTS,
  getClientInitialWorkouts,
} from './data/initialData';
import {
  getTodayDateString,
  getOrCreateDayWorkout,
} from './utils/dateUtils';
import {
  AppViewMode,
  AuthAccount,
  ClientHomework,
  ClientProfile,
  DailyNutritionEntry,
  DayWorkout,
  DirectMessage,
  Exercise,
  MacroTargets,
  ProgramBlock,
  ThemeMode,
} from './types';
import {
  saveActiveSession,
  loadAccounts,
  saveAccounts,
  loadClients,
  saveClients,
  loadWorkoutsMap,
  saveWorkoutsMap,
  loadNutritionMap,
  saveNutritionMap,
  loadMessagesMap,
  saveMessagesMap,
} from './services/storageService';
import {
  pushClients,
  pushWorkouts,
  pushNutrition,
  pushMessages,
  pullAll,
} from './services/cloudSync';
import { getCurrentAccount, signOutCloud } from './services/authService';
import { isSupabaseConfigured } from './services/supabaseClient';
import { PureFunctionLogo } from './components/PureFunctionLogo';
import { AuthScreen } from './components/AuthScreen';
import { TrainerView, TrainerBottomTab } from './components/TrainerView';
import { ClientView, ClientBottomTab } from './components/ClientView';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AddExerciseModal } from './components/AddExerciseModal';
import { AssessmentsModal } from './components/AssessmentsModal';
import { LibraryModal } from './components/LibraryModal';
import { ProgramsModal } from './components/ProgramsModal';
import { ClientManagerModal } from './components/ClientManagerModal';

export default function App() {
  const [theme] = useState<ThemeMode>('light');

  const [clients, setClients] = useState<ClientProfile[]>(() => loadClients());
  const [accounts, setAccounts] = useState<AuthAccount[]>(() =>
    loadAccounts(loadClients())
  );

  // Always start on the Trainer Sign In / Client Sign In screen on page load or reload
  const [activeAccount, setActiveAccount] = useState<AuthAccount | null>(null);

  // Initial 1.5s Splash Screen state (large centered logo -> fast fade-out)
  // true once cloud data has been pulled after login; gates uploads so stale local data never overwrites the cloud
  const [cloudReady, setCloudReady] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isSplashFading, setIsSplashFading] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<AppViewMode>('trainer');

  const [trainerBottomTab, setTrainerBottomTab] =
    useState<TrainerBottomTab>('dashboard');
  const [trainerDesktopSectionLabel, setTrainerDesktopSectionLabel] =
    useState<string>('Clients');
  const [clientBottomTab, setClientBottomTab] =
    useState<ClientBottomTab>('today');

  const [selectedClientId, setSelectedClientId] =
    useState<string>('alex-morgan');

  // Persistent maps per client
  const [clientWorkoutsMap, setClientWorkoutsMap] = useState<
    Record<string, DayWorkout[]>
  >(() => loadWorkoutsMap(loadClients()));

  const [nutritionMap, setNutritionMap] = useState<
    Record<string, Record<string, DailyNutritionEntry>>
  >(() => loadNutritionMap(loadClients()));

  const [messagesMap, setMessagesMap] = useState<
    Record<string, DirectMessage[]>
  >(() => loadMessagesMap(loadClients()));

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getTodayDateString()
  );

  // Modals state
  const [videoExercise, setVideoExercise] = useState<Exercise | null>(null);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState<boolean>(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isAssessmentsOpen, setIsAssessmentsOpen] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState<boolean>(false);
  const [isClientManagerOpen, setIsClientManagerOpen] = useState<boolean>(false);

  // 1.5s Splash Screen timer -> fast 300ms fade-out into Sign-In page
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsSplashFading(true);
    }, 1500);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Sync theme to localStorage
  useEffect(() => {
    localStorage.setItem('pure_theme', theme);
  }, [theme]);

  // Sync persistent stores to localStorage
  useEffect(() => {
    saveClients(clients);
    if (!isSupabaseConfigured || !cloudReady) return;
    const t = setTimeout(() => { pushClients(clients); }, 1500); // debounced cloud sync
    return () => clearTimeout(t);
  }, [clients, cloudReady]);

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveWorkoutsMap(clientWorkoutsMap);
    if (!isSupabaseConfigured || !cloudReady) return;
    const t = setTimeout(() => { pushWorkouts(clientWorkoutsMap); }, 1500); // debounced cloud sync
    return () => clearTimeout(t);
  }, [clientWorkoutsMap, cloudReady]);

  useEffect(() => {
    saveNutritionMap(nutritionMap);
    if (!isSupabaseConfigured || !cloudReady) return;
    const t = setTimeout(() => { pushNutrition(nutritionMap); }, 1500); // debounced cloud sync
    return () => clearTimeout(t);
  }, [nutritionMap, cloudReady]);

  useEffect(() => {
    saveMessagesMap(messagesMap);
    if (!isSupabaseConfigured || !cloudReady) return;
    const t = setTimeout(() => { pushMessages(messagesMap); }, 1500); // debounced cloud sync
    return () => clearTimeout(t);
  }, [messagesMap, cloudReady]);

  // Pull the latest data from Supabase (RLS limits clients to their own rows)
  const hydrateFromCloud = async () => {
    const snap = await pullAll();
    if (snap && snap.clients.length > 0) {
      const ids = snap.clients.map((c) => c.id);
      const fill = <T,>(src: Record<string, T>, empty: () => T) =>
        Object.fromEntries(ids.map((id) => [id, src[id] ?? empty()]));
      setClients(snap.clients);
      setClientWorkoutsMap(fill(snap.workouts, () => []));
      setNutritionMap(fill(snap.nutrition, () => ({})));
      setMessagesMap(fill(snap.messages, () => []));
    }
    setCloudReady(true);
  };

  // Sign In Handler
  const handleAuthenticated = (account: AuthAccount) => {
    setActiveAccount(account);
    saveActiveSession(account);
    if (isSupabaseConfigured) void hydrateFromCloud();

    if (account.role === 'client') {
      setViewMode('client');
      setClientBottomTab('today');
      if (account.clientId) {
        setSelectedClientId(account.clientId);
      }
    } else {
      setViewMode('trainer');
      setTrainerBottomTab('dashboard');
    }
  };

  // Register New Account (Trainer or Client)
  const handleRegisterAccount = (
    newAccount: AuthAccount,
    newClientProfile?: ClientProfile
  ) => {
    setAccounts((prev) => [...prev, newAccount]);

    if (newClientProfile) {
      setClients((prev) => [newClientProfile, ...prev]);
      setClientWorkoutsMap((prev) => ({
        ...prev,
        [newClientProfile.id]: getClientInitialWorkouts(newClientProfile.id),
      }));
    }

    handleAuthenticated(newAccount);
  };

  // Sign Out Handler
  const handleSignOut = () => {
    setActiveAccount(null);
    saveActiveSession(null);
    setCloudReady(false);
    void signOutCloud();
  };

  // Cloud mode: restore an existing Supabase session on page load
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getCurrentAccount().then((acc) => {
      if (acc) handleAuthenticated(acc);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveClientId =
    activeAccount?.role === 'client' && activeAccount.clientId
      ? activeAccount.clientId
      : selectedClientId;

  const currentClient =
    clients.find((c) => c.id === effectiveClientId) || clients[0];

  const workouts =
    clientWorkoutsMap[effectiveClientId] || INITIAL_OCTOBER_WORKOUTS;

  const setWorkouts = (
    updater: DayWorkout[] | ((prev: DayWorkout[]) => DayWorkout[])
  ) => {
    setClientWorkoutsMap((prev) => {
      const current = prev[effectiveClientId] || INITIAL_OCTOBER_WORKOUTS;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...prev,
        [effectiveClientId]: next,
      };
    });
  };

  const clientNutritionForDate =
    nutritionMap[effectiveClientId]?.[selectedDate];
  const clientMessages = messagesMap[effectiveClientId] || [];

  // Handler: Add client to roster (and create matching Client login account)
  const handleAddClient = (newClient: ClientProfile) => {
    setClients((prev) => [newClient, ...prev]);
    setClientWorkoutsMap((prev) => ({
      ...prev,
      [newClient.id]: getClientInitialWorkouts(newClient.id),
    }));
    setSelectedClientId(newClient.id);

    if (newClient.username) {
      const normalizedUsername = newClient.username.toLowerCase();
      setAccounts((prev) => {
        if (
          prev.some((a) => a.username.toLowerCase() === normalizedUsername)
        ) {
          return prev;
        }
        const newAccount: AuthAccount = {
          id: `user-${newClient.id}`,
          username: normalizedUsername,
          password: newClient.password || 'client123',
          role: 'client',
          displayName: newClient.name,
          email: newClient.email,
          clientId: newClient.id,
          title: newClient.goal,
        };
        return [...prev, newAccount];
      });
    }
  };

  // Handler: Update existing client profile
  const handleUpdateClient = (
    clientId: string,
    updates: Partial<ClientProfile>
  ) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c))
    );
  };

  // Handler: Delete client from roster
  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => {
      const remaining = prev.filter((c) => c.id !== clientId);
      if (selectedClientId === clientId && remaining.length > 0) {
        setSelectedClientId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Handler: Toggle exercise completion
  const handleToggleExerciseDone = (date: string, exerciseId: string) => {
    setWorkouts((prev) =>
      prev.map((day) => {
        if (day.date === date) {
          return {
            ...day,
            exercises: day.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
            ),
          };
        }
        return day;
      })
    );
  };

  // Handler: Client logs actual weight, reps, sets, RPE, notes for an exercise
  const handleLogExerciseResult = (
    date: string,
    exerciseId: string,
    updates: Partial<Exercise>
  ) => {
    setWorkouts((prev) =>
      prev.map((day) => {
        if (day.date === date) {
          return {
            ...day,
            exercises: day.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, ...updates } : ex
            ),
          };
        }
        return day;
      })
    );
  };

  // Handler: Client completes daily workout session check-in
  const handleCompleteSession = (
    date: string,
    summary: {
      sessionCompleted: boolean;
      sessionDurationMinutes?: number;
      sessionRpe?: number;
      clientSessionFeedback?: string;
    }
  ) => {
    setWorkouts((prev) =>
      prev.map((day) => {
        if (day.date === date) {
          return {
            ...day,
            ...summary,
            exercises: summary.sessionCompleted
              ? day.exercises.map((ex) => ({ ...ex, completed: true }))
              : day.exercises,
          };
        }
        return day;
      })
    );
  };

  // Handler: Add new exercise to currently selected date
  const handleAddExercise = (newExercise: Exercise) => {
    setWorkouts((prev) => {
      const exists = prev.some((d) => d.date === selectedDate);
      if (!exists) {
        const newDay = getOrCreateDayWorkout(prev, selectedDate);
        return [
          ...prev,
          {
            ...newDay,
            exercises: [newExercise],
            focus: newExercise.category || 'Strength',
          },
        ];
      }
      return prev.map((day) => {
        if (day.date === selectedDate) {
          const exExists = day.exercises.some((e) => e.id === newExercise.id);
          const updatedExercises = exExists
            ? day.exercises.map((e) =>
                e.id === newExercise.id ? newExercise : e
              )
            : [...day.exercises, newExercise];
          return {
            ...day,
            exercises: updatedExercises,
            focus: day.focus || newExercise.category || 'Strength',
          };
        }
        return day;
      });
    });
    setEditingExercise(null);
  };

  // Handler: Inline update for sets, reps, intensity, rest, notes
  const handleUpdateExerciseInline = (
    date: string,
    exerciseId: string,
    updates: Partial<Exercise>
  ) => {
    setWorkouts((prev) =>
      prev.map((day) => {
        if (day.date === date) {
          return {
            ...day,
            exercises: day.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, ...updates } : ex
            ),
          };
        }
        return day;
      })
    );
  };

  // Handler: Delete exercise from selected date
  const handleDeleteExercise = (exerciseId: string) => {
    setWorkouts((prev) =>
      prev.map((day) => {
        if (day.date === selectedDate) {
          return {
            ...day,
            exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
          };
        }
        return day;
      })
    );
  };

  // Handler: Duplicate exercise
  const handleDuplicateExercise = (exercise: Exercise) => {
    const duplicated: Exercise = {
      ...exercise,
      id: `ex-copy-${Date.now()}`,
      name: `${exercise.name} (Copy)`,
    };
    handleAddExercise(duplicated);
  };

  // Handler: Update Daily Nutrition Log
  const handleUpdateDailyNutrition = (entry: DailyNutritionEntry) => {
    setNutritionMap((prev) => ({
      ...prev,
      [effectiveClientId]: {
        ...(prev[effectiveClientId] || {}),
        [entry.date]: entry,
      },
    }));
  };

  // Handler: Coach updates Macro Targets
  const handleUpdateMacroTargets = (targets: MacroTargets) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === effectiveClientId ? { ...c, macroTargets: targets } : c
      )
    );
  };

  // Handler: Update Daily Homework Habits
  const handleUpdateHomework = (homework: ClientHomework[]) => {
    setClients((prev) =>
      prev.map((c) => (c.id === effectiveClientId ? { ...c, homework } : c))
    );
  };

  // Handler: Send Direct Message (or Broadcast to all clients)
  const handleSendMessage = (
    text: string,
    options?: {
      videoUrl?: string;
      exerciseTag?: string;
      broadcastAll?: boolean;
    }
  ) => {
    const senderRole = activeAccount?.role === 'client' ? 'client' : viewMode;
    const senderName =
      senderRole === 'trainer'
        ? activeAccount?.displayName || currentClient.coach
        : currentClient.name;

    const timestampLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (options?.broadcastAll && senderRole === 'trainer') {
      setMessagesMap((prev) => {
        const next = { ...prev };
        clients.forEach((c) => {
          const msg: DirectMessage = {
            id: `msg-${Date.now()}-${c.id}`,
            clientId: c.id,
            senderRole: 'trainer',
            senderName,
            text,
            timestamp: `Today · ${timestampLabel}`,
            exerciseTag: options.exerciseTag,
            videoUrl: options.videoUrl,
            isBroadcast: true,
          };
          next[c.id] = [...(next[c.id] || []), msg];
        });
        return next;
      });
      return;
    }

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      clientId: effectiveClientId,
      senderRole,
      senderName,
      text,
      timestamp: `Today · ${timestampLabel}`,
      exerciseTag: options?.exerciseTag,
      videoUrl: options?.videoUrl,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [effectiveClientId]: [...(prev[effectiveClientId] || []), newMsg],
    }));
  };

  // Handler: Update Periodized Programs
  const handleUpdatePrograms = (
    updatedBlocks: ProgramBlock[],
    activeProgramTitle: string
  ) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === effectiveClientId
          ? {
              ...c,
              programBlocks: updatedBlocks,
              currentProgram: activeProgramTitle || c.currentProgram,
            }
          : c
      )
    );
  };

  // If not signed in, show the dedicated TrueCoach Role-Based Sign-In Screen first
  // (with the 1.5s large centered logo splash screen fading out on initial load)
  if (!activeAccount) {
    return (
      <>
        {showSplash && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[#232328] px-8 transition-all duration-300 ease-out ${
              isSplashFading
                ? 'opacity-0 scale-[1.03] pointer-events-none'
                : 'opacity-100 scale-100'
            }`}
          >
            <PureFunctionLogo
              theme="dark"
              variant="badge"
              className="w-full max-w-[340px] sm:max-w-[460px] md:max-w-[540px]"
            />
          </div>
        )}
        <AuthScreen
          accounts={accounts}
          clients={clients}
          onAuthenticated={handleAuthenticated}
          onRegisterAccount={handleRegisterAccount}
          theme={theme}
        />
      </>
    );
  }

  const isDark = theme === 'dark';
  const isTrainerAccount = activeAccount.role === 'trainer';

  const sectionTitleMap: Record<TrainerBottomTab, string> = {
    dashboard: 'Dashboard',
    clients: 'Clients',
    activity: 'Activity',
    messages: 'Messages',
    account: 'Account',
  };

  const clientSectionTitleMap: Record<ClientBottomTab, string> = {
    today: 'Today',
    workouts: 'Workouts',
    habits: 'Habits',
    messages: 'Messages',
    account: 'Account',
  };

  const activeHeaderTitle =
    isTrainerAccount && viewMode === 'trainer'
      ? sectionTitleMap[trainerBottomTab]
      : clientSectionTitleMap[clientBottomTab];

  const isTrainerMode = isTrainerAccount && viewMode === 'trainer';

  return (
    <div
      className={`h-dvh overflow-hidden flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? 'bg-[#090b0e] text-slate-100'
          : 'bg-white text-neutral-900'
      }`}
    >
      {/* 
        HEADER:
        Locked at the top of the viewport, with Pure Function logo centered in the frame,
        and a Yellow box on the right with centered Black text showing the current section
      */}
      <header className="shrink-0 sticky top-0 z-40 overflow-hidden bg-gradient-to-b from-[#2b303c] via-[#1d212b] to-[#14171f] border-b border-neutral-700/70 px-3 sm:px-6 py-1.5 sm:py-2 shadow-[0_6px_18px_-4px_rgba(20,23,31,0.28),inset_0_1px_1px_rgba(255,255,255,0.14)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent" />
        <div
          className={`relative z-10 mx-auto grid grid-cols-3 items-center min-h-[34px] sm:min-h-[38px] ${
            isTrainerMode ? 'max-w-6xl md:max-w-none' : 'max-w-6xl'
          }`}
        >
          {/* Left Spacer to keep Center Logo dead-center in the frame */}
          <div aria-hidden="true" />

          {/* Center: Pure Function Logo in White & Yellow */}
          <div className="flex items-center justify-center">
            <PureFunctionLogo
              theme="dark"
              className="h-7 sm:h-8 md:h-9"
            />
          </div>

          {/* Right: Yellow Box with Centered Black Font showing current section */}
          <div className="flex items-center justify-end">
            <div className="px-3 sm:px-3.5 py-1 min-w-[92px] sm:min-w-[112px] rounded-lg bg-amber-400 text-black font-black text-[11px] sm:text-xs tracking-tight flex items-center justify-center text-center shadow-sm">
              {isTrainerMode ? (
                <>
                  <span className="md:hidden">{activeHeaderTitle}</span>
                  <span className="hidden md:inline">
                    {trainerDesktopSectionLabel}
                  </span>
                </>
              ) : (
                activeHeaderTitle
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area (Constrained to remaining viewport height so bottom footer stays locked) */}
      <main
        className={`flex-1 min-h-0 mx-auto w-full flex flex-col overflow-hidden ${
          isTrainerMode
            ? 'p-2 sm:p-4 md:p-0 max-w-6xl md:max-w-none'
            : 'p-2 sm:p-4 max-w-6xl'
        }`}
      >
        {/* View Mode 1: Trainer View (TrueCoach Minimal Model) */}
        {isTrainerAccount && viewMode === 'trainer' && (
          <TrainerView
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            onOpenClientManager={() => setIsClientManagerOpen(true)}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            workouts={workouts}
            allClientWorkouts={clientWorkoutsMap}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenVideo={(ex) => setVideoExercise(ex)}
            onAddExerciseClick={() => {
              setEditingExercise(null);
              setIsAddExerciseOpen(true);
            }}
            onEditExerciseClick={(ex) => {
              setEditingExercise(ex);
              setIsAddExerciseOpen(true);
            }}
            onUpdateExerciseInline={handleUpdateExerciseInline}
            onDeleteExercise={handleDeleteExercise}
            onDuplicateExercise={handleDuplicateExercise}
            onSaveSession={() => {
              saveWorkoutsMap(clientWorkoutsMap);
              saveClients(clients);
            }}
            onOpenAssessments={() => setIsAssessmentsOpen(true)}
            onOpenLibrary={() => setIsLibraryOpen(true)}
            onOpenPrograms={() => setIsProgramsOpen(true)}
            dailyNutrition={clientNutritionForDate}
            onUpdateDailyNutrition={handleUpdateDailyNutrition}
            onUpdateMacroTargets={handleUpdateMacroTargets}
            onUpdateHomework={handleUpdateHomework}
            messages={clientMessages}
            allClientMessages={messagesMap}
            onSendMessage={handleSendMessage}
            activeAccount={activeAccount}
            onSignOut={handleSignOut}
            activeBottomTab={trainerBottomTab}
            onBottomTabChange={setTrainerBottomTab}
            onDesktopSectionLabelChange={setTrainerDesktopSectionLabel}
            theme={theme}
          />
        )}

        {/* View Mode 2: Client View (TrueCoach Athlete Minimal Model) */}
        {(!isTrainerAccount || viewMode === 'client') && (
          <ClientView
            client={currentClient}
            workouts={workouts}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onToggleExerciseDone={handleToggleExerciseDone}
            onLogExerciseResult={handleLogExerciseResult}
            onCompleteSession={handleCompleteSession}
            onOpenVideo={(ex) => setVideoExercise(ex)}
            onOpenAssessments={() => setIsAssessmentsOpen(true)}
            dailyNutrition={clientNutritionForDate}
            onUpdateDailyNutrition={handleUpdateDailyNutrition}
            onUpdateHomework={handleUpdateHomework}
            onUpdateClientAvatar={(avatarUrl) =>
              handleUpdateClient(currentClient.id, { avatarUrl })
            }
            messages={clientMessages}
            onSendMessage={handleSendMessage}
            onSignOut={handleSignOut}
            activeBottomTab={clientBottomTab}
            onBottomTabChange={setClientBottomTab}
            theme={theme}
          />
        )}
      </main>

      {/* Modals with Full Theme Support & Real Video Demonstration */}
      {/* 1. Real Video Player Modal (YouTube Demonstration) */}
      {videoExercise && (
        <VideoPlayerModal
          exercise={videoExercise}
          onClose={() => setVideoExercise(null)}
          theme={theme}
        />
      )}

      {/* 2. Add / Edit Exercise Modal */}
      {isAddExerciseOpen && (
        <AddExerciseModal
          onClose={() => {
            setIsAddExerciseOpen(false);
            setEditingExercise(null);
          }}
          onAdd={handleAddExercise}
          initialExercise={editingExercise}
          theme={theme}
        />
      )}

      {/* 3. Physical Assessments & Progress Modal */}
      {isAssessmentsOpen && (
        <AssessmentsModal
          client={currentClient}
          onClose={() => setIsAssessmentsOpen(false)}
          onUpdateAssessments={(updated) => {
            setClients((prev) =>
              prev.map((c) =>
                c.id === currentClient.id ? { ...c, assessments: updated } : c
              )
            );
          }}
          theme={theme}
        />
      )}

      {/* 4. Movement Library & Demonstration Vault Modal */}
      {isLibraryOpen && (
        <LibraryModal
          onClose={() => setIsLibraryOpen(false)}
          onSelectExercise={(selectedTemplate) => {
            handleAddExercise({
              ...selectedTemplate,
              id: `ex-${Date.now()}`,
              completed: false,
            });
            setIsLibraryOpen(false);
          }}
          onPreviewVideo={(previewEx) => setVideoExercise(previewEx)}
          theme={theme}
        />
      )}

      {/* 5. Periodized Programs Modal */}
      {isProgramsOpen && (
        <ProgramsModal
          client={currentClient}
          onClose={() => setIsProgramsOpen(false)}
          onUpdatePrograms={handleUpdatePrograms}
          theme={theme}
        />
      )}

      {/* 6. TrueCoach Client Manager Modal (Search, Add, Delete Clients) */}
      {isClientManagerOpen && (
        <ClientManagerModal
          clients={clients}
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
          onAddClient={handleAddClient}
          onDeleteClient={handleDeleteClient}
          onClose={() => setIsClientManagerOpen(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
