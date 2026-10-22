import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Check,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  ClientHomework,
  ClientProfile,
  DailyNutritionEntry,
  MacroTargets,
  ThemeMode,
} from '../types';
import { DEFAULT_MACRO_TARGETS } from '../services/storageService';

interface NutritionHabitsPanelProps {
  client: ClientProfile;
  selectedDate: string;
  mode: 'trainer' | 'client';
  dailyEntry: DailyNutritionEntry;
  onUpdateDailyEntry: (updated: DailyNutritionEntry) => void;
  onUpdateMacroTargets?: (targets: MacroTargets) => void;
  onUpdateHomework?: (homework: ClientHomework[]) => void;
  theme?: ThemeMode;
}

export const NutritionHabitsPanel: React.FC<NutritionHabitsPanelProps> = ({
  client,
  selectedDate,
  mode,
  dailyEntry,
  onUpdateDailyEntry,
  onUpdateMacroTargets,
  onUpdateHomework,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const targets = client.macroTargets || DEFAULT_MACRO_TARGETS;

  // Trainer Macro Targets editing state
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [targetCal, setTargetCal] = useState(String(targets.calories));
  const [targetPro, setTargetPro] = useState(String(targets.protein));
  const [targetCarb, setTargetCarb] = useState(String(targets.carbs));
  const [targetFat, setTargetFat] = useState(String(targets.fat));
  const [targetWater, setTargetWater] = useState(String(targets.waterLiters));

  // Trainer Add Habit state
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('Daily');
  const [newHabitTargetDays, setNewHabitTargetDays] = useState('7');

  const [savedToast, setSavedToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 2200);
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateMacroTargets) return;
    onUpdateMacroTargets({
      calories: Math.max(800, parseInt(targetCal, 10) || 2400),
      protein: Math.max(30, parseInt(targetPro, 10) || 180),
      carbs: Math.max(20, parseInt(targetCarb, 10) || 240),
      fat: Math.max(20, parseInt(targetFat, 10) || 75),
      waterLiters: Math.max(1, parseFloat(targetWater) || 3.2),
    });
    setIsEditingTargets(false);
    showToast('Macro targets updated for ' + client.name);
  };

  const handleMacroLogChange = (
    field: 'calories' | 'protein' | 'carbs' | 'fat' | 'waterLiters',
    value: string
  ) => {
    const num =
      field === 'waterLiters'
        ? Math.max(0, parseFloat(value) || 0)
        : Math.max(0, parseInt(value, 10) || 0);
    onUpdateDailyEntry({
      ...dailyEntry,
      date: selectedDate,
      [field]: num,
    });
  };

  const handleToggleHabitToday = (habitId: string) => {
    const completedIds = dailyEntry.completedHabitIds || [];
    const isDone = completedIds.includes(habitId);
    const nextIds = isDone
      ? completedIds.filter((id) => id !== habitId)
      : [...completedIds, habitId];

    onUpdateDailyEntry({
      ...dailyEntry,
      date: selectedDate,
      completedHabitIds: nextIds,
    });

    if (onUpdateHomework) {
      const updatedHw = (client.homework || []).map((hw) => {
        if (hw.id !== habitId) return hw;
        const delta = isDone ? -1 : 1;
        return {
          ...hw,
          completedDays: Math.min(
            hw.targetDays,
            Math.max(0, hw.completedDays + delta)
          ),
        };
      });
      onUpdateHomework(updatedHw);
    }
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim() || !onUpdateHomework) return;
    const newHw: ClientHomework = {
      id: `hw-${Date.now()}`,
      title: newHabitTitle.trim(),
      frequency: newHabitFreq.trim() || 'Daily',
      completedDays: 0,
      targetDays: Math.max(1, Math.min(7, parseInt(newHabitTargetDays, 10) || 7)),
    };
    onUpdateHomework([...(client.homework || []), newHw]);
    setNewHabitTitle('');
    setIsAddingHabit(false);
    showToast('New habit assigned to ' + client.name);
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!onUpdateHomework) return;
    onUpdateHomework((client.homework || []).filter((h) => h.id !== habitId));
  };

  const macroCards = [
    {
      key: 'calories' as const,
      label: 'Calories',
      unit: 'kcal',
      actual: dailyEntry.calories || 0,
      target: targets.calories,
    },
    {
      key: 'protein' as const,
      label: 'Protein',
      unit: 'g',
      actual: dailyEntry.protein || 0,
      target: targets.protein,
    },
    {
      key: 'carbs' as const,
      label: 'Carbs',
      unit: 'g',
      actual: dailyEntry.carbs || 0,
      target: targets.carbs,
    },
    {
      key: 'fat' as const,
      label: 'Fat',
      unit: 'g',
      actual: dailyEntry.fat || 0,
      target: targets.fat,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Section 1: Daily Macronutrients & Hydration */}
      <section
        className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
          isDark
            ? 'bg-[#141822]/90 border-neutral-800'
            : 'bg-slate-50/90 border-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">
                Daily Nutrition & Macro Targets
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                {client.name} · Date: {selectedDate}
              </p>
            </div>
          </div>

          {mode === 'trainer' && (
            <button
              type="button"
              onClick={() => {
                setTargetCal(String(targets.calories));
                setTargetPro(String(targets.protein));
                setTargetCarb(String(targets.carbs));
                setTargetFat(String(targets.fat));
                setTargetWater(String(targets.waterLiters));
                setIsEditingTargets((prev) => !prev);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingTargets ? 'Cancel' : 'Edit Macro Targets'}</span>
            </button>
          )}
        </div>

        {/* Trainer Edit Targets Form */}
        {mode === 'trainer' && isEditingTargets && (
          <form
            onSubmit={handleSaveTargets}
            className={`p-4 rounded-xl border space-y-3 ${
              isDark
                ? 'bg-[#191e2b] border-neutral-700'
                : 'bg-white border-neutral-300'
            }`}
          >
            <div className="text-xs font-bold text-amber-500">
              Prescribe Daily Macro & Hydration Goals
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  value={targetCal}
                  onChange={(e) => setTargetCal(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums outline-none ${
                    isDark
                      ? 'bg-[#11141d] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={targetPro}
                  onChange={(e) => setTargetPro(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums outline-none ${
                    isDark
                      ? 'bg-[#11141d] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={targetCarb}
                  onChange={(e) => setTargetCarb(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums outline-none ${
                    isDark
                      ? 'bg-[#11141d] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={targetFat}
                  onChange={(e) => setTargetFat(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums outline-none ${
                    isDark
                      ? 'bg-[#11141d] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  Water (L)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWater}
                  onChange={(e) => setTargetWater(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums outline-none ${
                    isDark
                      ? 'bg-[#11141d] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Targets</span>
              </button>
            </div>
          </form>
        )}

        {/* 4 Macro Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {macroCards.map((item) => {
            const pct = Math.min(
              100,
              Math.round((item.actual / Math.max(1, item.target)) * 100)
            );
            return (
              <div
                key={item.key}
                className={`p-3 rounded-xl border space-y-2 ${
                  isDark
                    ? 'bg-[#191d28] border-neutral-800'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-bold ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-amber-500 font-bold">
                    {pct}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-1 font-mono tabular-nums">
                  {mode === 'client' ? (
                    <input
                      type="number"
                      min={0}
                      value={item.actual}
                      onChange={(e) =>
                        handleMacroLogChange(item.key, e.target.value)
                      }
                      aria-label={`Log ${item.label}`}
                      className={`w-20 px-2 py-1 rounded-lg border text-sm font-extrabold outline-none ${
                        isDark
                          ? 'bg-[#11141c] border-neutral-700 focus:border-amber-400 text-white'
                          : 'bg-slate-50 border-neutral-300 focus:border-amber-500 text-neutral-900'
                      }`}
                    />
                  ) : (
                    <span className="text-base sm:text-lg font-extrabold">
                      {item.actual}
                    </span>
                  )}
                  <span
                    className={`text-xs ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    / {item.target} {item.unit}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isDark ? 'bg-neutral-800' : 'bg-neutral-200'
                  }`}
                >
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all ${
                      pct >= 90 && pct <= 110
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Hydration Strip */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
            isDark
              ? 'bg-[#191d28] border-neutral-800'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Droplets className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Daily Hydration: </span>
              <span className="font-mono tabular-nums font-bold text-amber-500">
                {(dailyEntry.waterLiters || 0).toFixed(2)} L
              </span>
              <span
                className={`font-mono tabular-nums ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                {' '}
                / {targets.waterLiters.toFixed(1)} L Target
              </span>
            </div>
          </div>

          {mode === 'client' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleMacroLogChange(
                    'waterLiters',
                    String(
                      Math.max(0, (dailyEntry.waterLiters || 0) - 0.25).toFixed(2)
                    )
                  )
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    : 'bg-slate-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                }`}
              >
                -0.25L
              </button>
              <button
                type="button"
                onClick={() =>
                  handleMacroLogChange(
                    'waterLiters',
                    String(((dailyEntry.waterLiters || 0) + 0.25).toFixed(2))
                  )
                }
                className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black cursor-pointer"
              >
                +0.25L Water
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Daily Habits & Mobility Homework Tracker */}
      <section
        className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
          isDark
            ? 'bg-[#141822]/90 border-neutral-800'
            : 'bg-slate-50/90 border-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold leading-tight">
              Daily Lifestyle Habits & Mobility Homework
            </h3>
            <p
              className={`text-xs ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              {mode === 'trainer'
                ? 'Assign daily habits and monitor weekly client compliance streaks'
                : 'Check off your completed daily habits and corrective homework'}
            </p>
          </div>

          {mode === 'trainer' && (
            <button
              type="button"
              onClick={() => setIsAddingHabit((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Habit</span>
            </button>
          )}
        </div>

        {/* Add Habit Form for Coach */}
        {mode === 'trainer' && isAddingHabit && (
          <form
            onSubmit={handleAddHabit}
            className={`p-3.5 rounded-xl border space-y-3 ${
              isDark
                ? 'bg-[#191e2b] border-neutral-700'
                : 'bg-white border-neutral-300'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Habit title (e.g. 10,000 Steps or 90/90 Breathing)"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className={`sm:col-span-2 px-3 py-2 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-[#11141d] border-neutral-700 text-white'
                    : 'bg-slate-50 border-neutral-300 text-neutral-900'
                }`}
              />
              <input
                type="text"
                placeholder="Frequency (e.g. 5 mins daily)"
                value={newHabitFreq}
                onChange={(e) => setNewHabitFreq(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-[#11141d] border-neutral-700 text-white'
                    : 'bg-slate-50 border-neutral-300 text-neutral-900'
                }`}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400">Weekly Goal (Days):</span>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={newHabitTargetDays}
                  onChange={(e) => setNewHabitTargetDays(e.target.value)}
                  className={`w-14 px-2 py-1 rounded-lg border text-xs font-mono tabular-nums text-center outline-none ${
                    isDark
                      ? 'bg-[#11141d] border-neutral-700 text-white'
                      : 'bg-slate-50 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingHabit(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer"
                >
                  Assign Habit
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Habits List */}
        <div className="space-y-2.5">
          {(client.homework || []).map((habit) => {
            const isCheckedToday = (dailyEntry.completedHabitIds || []).includes(
              habit.id
            );
            const adherencePct = Math.min(
              100,
              Math.round(
                (habit.completedDays / Math.max(1, habit.targetDays)) * 100
              )
            );

            return (
              <div
                key={habit.id}
                className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isCheckedToday
                    ? isDark
                      ? 'bg-[#192220] border-emerald-500/40'
                      : 'bg-emerald-50/70 border-emerald-300'
                    : isDark
                    ? 'bg-[#191d28] border-neutral-800'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleHabitToday(habit.id)}
                    title={
                      isCheckedToday ? 'Completed today' : 'Mark habit completed'
                    }
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                      isCheckedToday
                        ? 'bg-amber-400 border-amber-400 text-black font-bold'
                        : isDark
                        ? 'bg-[#12151e] border-neutral-700 hover:border-amber-400'
                        : 'bg-slate-100 border-neutral-300 hover:border-amber-500'
                    }`}
                  >
                    {isCheckedToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold truncate">
                      {habit.title}
                    </div>
                    <div
                      className={`text-[11px] ${
                        isDark ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      {habit.frequency} · Weekly streak:{' '}
                      <span className="font-mono tabular-nums font-bold text-amber-500">
                        {habit.completedDays}/{habit.targetDays} days
                      </span>{' '}
                      ({adherencePct}%)
                    </div>
                  </div>
                </div>

                {mode === 'trainer' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteHabit(habit.id)}
                    title="Remove habit"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark
                        ? 'text-neutral-400 hover:text-red-400 hover:bg-neutral-800'
                        : 'text-neutral-500 hover:text-red-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-400 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedToast}</span>
        </div>
      )}
    </div>
  );
};
