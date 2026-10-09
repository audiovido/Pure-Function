/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_CLIENTS,
  INITIAL_OCTOBER_WORKOUTS,
  getClientInitialWorkouts,
} from './data/initialData';
import {
  getTodayDateString,
  getOrCreateDayWorkout,
} from './utils/dateUtils';
import {
  AppViewMode,
  ClientProfile,
  DayWorkout,
  Exercise,
  ThemeMode,
} from './types';
import { PureFunctionLogo } from './components/PureFunctionLogo';
import { TrainerView } from './components/TrainerView';
import { ClientView } from './components/ClientView';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AddExerciseModal } from './components/AddExerciseModal';
import { AssessmentsModal } from './components/AssessmentsModal';
import { LibraryModal } from './components/LibraryModal';
import { ProgramsModal } from './components/ProgramsModal';
import { ClientManagerModal } from './components/ClientManagerModal';
import {
  UserCheck,
  User,
  ClipboardCheck,
  Sun,
  Moon,
  Users,
} from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>('trainer');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('pure_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const [clients, setClients] = useState<ClientProfile[]>(INITIAL_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>('alex-morgan');

  // Maintain workouts per client so switching athletes displays their own real schedule
  const [clientWorkoutsMap, setClientWorkoutsMap] = useState<
    Record<string, DayWorkout[]>
  >(() => {
    const map: Record<string, DayWorkout[]> = {};
    INITIAL_CLIENTS.forEach((c) => {
      map[c.id] = getClientInitialWorkouts(c.id);
    });
    return map;
  });

  const workouts =
    clientWorkoutsMap[selectedClientId] || INITIAL_OCTOBER_WORKOUTS;

  const setWorkouts = (
    updater: DayWorkout[] | ((prev: DayWorkout[]) => DayWorkout[])
  ) => {
    setClientWorkoutsMap((prev) => {
      const current = prev[selectedClientId] || INITIAL_OCTOBER_WORKOUTS;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...prev,
        [selectedClientId]: next,
      };
    });
  };

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

  useEffect(() => {
    localStorage.setItem('pure_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentClient =
    clients.find((c) => c.id === selectedClientId) || clients[0];

  // Handler: Add client to roster
  const handleAddClient = (newClient: ClientProfile) => {
    setClients((prev) => [newClient, ...prev]);
    setSelectedClientId(newClient.id);
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

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? 'bg-[#090b0e] text-slate-100'
          : 'bg-[#f8f9fa] text-neutral-900'
      }`}
    >
      {/* 
        HEADER:
        1. Left: Pure Function logo
        2. Right: Trainer & Client buttons + Light/Night mode toggle nicely side-by-side
      */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-6 py-2 sm:py-2.5 transition-colors duration-200 ${
          isDark
            ? 'bg-[#0d0f14]/90 border-neutral-800/80 shadow-md'
            : 'bg-white/90 border-neutral-200 shadow-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between min-h-[38px] sm:min-h-[44px]">
          {/* Top-Left: Pure Function Logo */}
          <div className="flex items-center py-0.5">
            <PureFunctionLogo
              theme={theme}
              className="h-8 sm:h-9 md:h-10"
            />
          </div>

          {/* Top-Right: Trainer & Client Buttons + High-Contrast Mode Toggle Side-by-Side */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <nav
              aria-label="View selection"
              className="flex items-center gap-1.5 sm:gap-2"
            >
              {/* Trainer Squircle Button with Label */}
              <button
                type="button"
                onClick={() => setViewMode('trainer')}
                title="Trainer / Coach View"
                aria-label="Switch to Trainer View"
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 min-w-[46px] sm:min-w-[52px] rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  viewMode === 'trainer'
                    ? 'bg-amber-400 text-black shadow-md ring-1 ring-amber-400/50 font-black scale-[1.02]'
                    : isDark
                    ? 'bg-[#131720]/80 hover:bg-[#1b202c] text-neutral-400 hover:text-white border border-neutral-800/90'
                    : 'bg-slate-100 hover:bg-neutral-200 text-neutral-600 hover:text-black border border-neutral-300'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold tracking-tight uppercase leading-none mt-0.5">
                  Trainer
                </span>
              </button>

              {/* Client Squircle Button with Label */}
              <button
                type="button"
                onClick={() => setViewMode('client')}
                title="Client / Athlete View"
                aria-label="Switch to Client View"
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 min-w-[46px] sm:min-w-[52px] rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  viewMode === 'client'
                    ? 'bg-amber-400 text-black shadow-md ring-1 ring-amber-400/50 font-black scale-[1.02]'
                    : isDark
                    ? 'bg-[#131720]/80 hover:bg-[#1b202c] text-neutral-400 hover:text-white border border-neutral-800/90'
                    : 'bg-slate-100 hover:bg-neutral-200 text-neutral-600 hover:text-black border border-neutral-300'
                }`}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold tracking-tight uppercase leading-none mt-0.5">
                  Client
                </span>
              </button>
            </nav>

            {/* Light/Night Toggle with Slender Moon / Mustard Sun */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Night Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Night Mode'}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md border ${
                isDark
                  ? 'bg-[#d8dce2] hover:bg-[#ccd1d8] text-[#c88d00] border-neutral-300 hover:scale-105 ring-1 ring-neutral-400/30'
                  : 'bg-black text-[#c88d00] border-neutral-900 hover:scale-105 ring-1 ring-black/40'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#c88d00] text-[#c88d00]" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Slender delicate crescent moon */}
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    fill="#c88d00"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
        {/* View Mode 1: Trainer View (TrueCoach Model) */}
        {viewMode === 'trainer' && (
          <div className="space-y-4">
            <TrainerView
              clients={clients}
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
              onOpenClientManager={() => setIsClientManagerOpen(true)}
              workouts={workouts}
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
              onSaveSession={() => {}}
              onOpenAssessments={() => setIsAssessmentsOpen(true)}
              onOpenLibrary={() => setIsLibraryOpen(true)}
              onOpenPrograms={() => setIsProgramsOpen(true)}
              theme={theme}
            />
          </div>
        )}

        {/* View Mode 2: Client View */}
        {viewMode === 'client' && (
          <div className="space-y-4">
            <ClientView
              client={currentClient}
              workouts={workouts}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleExerciseDone={handleToggleExerciseDone}
              onOpenVideo={(ex) => setVideoExercise(ex)}
              onOpenAssessments={() => setIsAssessmentsOpen(true)}
              theme={theme}
            />
          </div>
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
