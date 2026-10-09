import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Camera,
  Activity,
  Calendar,
  Plus,
  Check,
} from 'lucide-react';
import { ClientProfile, ThemeMode } from '../types';

interface AssessmentsModalProps {
  client: ClientProfile;
  onClose: () => void;
  onUpdateAssessments?: (
    updatedAssessments: ClientProfile['assessments']
  ) => void;
  theme?: ThemeMode;
}

export const AssessmentsModal: React.FC<AssessmentsModalProps> = ({
  client,
  onClose,
  onUpdateAssessments,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'metrics' | 'photos' | 'movement'>(
    'metrics'
  );
  const [newMetricName, setNewMetricName] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetricName.trim()) return;

    const newAssessment = {
      id: `ass-${Date.now()}`,
      name: newMetricName.trim(),
      previousValue: 'Baseline recorded',
      currentValue: newCurrent.trim() || '30°',
      targetValue: 'Optimal',
      unit: 'degrees',
      notes: newNotes.trim() || 'Assessed during dynamic warm-up.',
      improved: true,
    };

    if (onUpdateAssessments) {
      onUpdateAssessments([...client.assessments, newAssessment]);
    }
    setIsAdding(false);
    setNewMetricName('');
    setNewCurrent('');
    setNewNotes('');
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
        className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default border ${
          isDark
            ? 'bg-[#13161c]/95 border-neutral-800 text-slate-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-2xl'
        }`}
      >
        {/* Top Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark
              ? 'bg-[#161a22] border-neutral-800'
              : 'bg-slate-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                Physical Assessments & Biomechanical Progress
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                {client.name} · Coach: {client.coach}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assessments modal"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div
          className={`flex items-center gap-4 px-6 pt-3 border-b ${
            isDark
              ? 'bg-[#101318] border-neutral-800/80'
              : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`pb-2.5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === 'metrics'
                ? 'border-amber-400 text-amber-500 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Mobility & Range of Motion
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`pb-2.5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'border-amber-400 text-amber-500 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Posture & Assessment Photos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('movement')}
            className={`pb-2.5 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === 'movement'
                ? 'border-amber-400 text-amber-500 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Movement Screen History
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Joint Mobility Benchmarks</h4>
                  <p
                    className={`text-xs ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    Objective measurements from goniometer and functional screening
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(!isAdding)}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Metric</span>
                </button>
              </div>

              {isAdding && (
                <form
                  onSubmit={handleAddMetric}
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark
                      ? 'bg-[#181c25] border-neutral-700'
                      : 'bg-slate-50 border-neutral-300'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Joint/Metric name (e.g. Ankle Dorsiflexion)"
                      value={newMetricName}
                      onChange={(e) => setNewMetricName(e.target.value)}
                      className={`px-3 py-2 text-xs rounded-lg border outline-none ${
                        isDark
                          ? 'bg-[#10131a] border-neutral-700 text-white'
                          : 'bg-white border-neutral-300 text-neutral-900'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Current Measurement (e.g. 14 cm or 35°)"
                      value={newCurrent}
                      onChange={(e) => setNewCurrent(e.target.value)}
                      className={`px-3 py-2 text-xs rounded-lg border outline-none ${
                        isDark
                          ? 'bg-[#10131a] border-neutral-700 text-white'
                          : 'bg-white border-neutral-300 text-neutral-900'
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Coach Notes / Clinical Impression"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark
                        ? 'bg-[#10131a] border-neutral-700 text-white'
                        : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-400 text-black font-bold text-xs rounded-lg"
                    >
                      Save Metric
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 gap-3">
                {client.assessments.map((metric) => (
                  <div
                    key={metric.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-[#151922] border-neutral-800'
                        : 'bg-slate-50 border-neutral-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{metric.name}</span>
                        {metric.improved && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Improved</span>
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          isDark ? 'text-neutral-400' : 'text-neutral-500'
                        }`}
                      >
                        {metric.notes}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                      <div>
                        <span
                          className={`block text-[10px] ${
                            isDark ? 'text-neutral-500' : 'text-neutral-400'
                          }`}
                        >
                          Baseline:
                        </span>
                        <span
                          className={
                            isDark ? 'text-neutral-300' : 'text-neutral-600'
                          }
                        >
                          {metric.previousValue}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`block text-[10px] ${
                            isDark ? 'text-neutral-500' : 'text-neutral-400'
                          }`}
                        >
                          Current:
                        </span>
                        <span className="font-bold text-amber-500 text-sm">
                          {metric.currentValue}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`block text-[10px] ${
                            isDark ? 'text-neutral-500' : 'text-neutral-400'
                          }`}
                        >
                          Goal:
                        </span>
                        <span
                          className={
                            isDark ? 'text-neutral-400' : 'text-neutral-500'
                          }
                        >
                          {metric.targetValue}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Structural Alignment Analysis</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-3 ${
                    isDark
                      ? 'bg-[#171b23] border-neutral-800'
                      : 'bg-slate-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Sagittal Plane Squat</span>
                    <span className="text-[10px] text-amber-500 font-mono font-semibold">
                      Pelvis & Spine
                    </span>
                  </div>
                  <div
                    className={`aspect-4/3 rounded-lg border p-3 flex items-center justify-center text-center ${
                      isDark
                        ? 'bg-[#0e1117] border-neutral-800'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <Camera className="w-7 h-7 text-neutral-400 mx-auto" />
                      <div className="text-xs font-medium">Photo Set Verified</div>
                      <div className="text-[11px] text-neutral-500">
                        Torso angle matching tibial inclination cleanly at depth.
                      </div>
                    </div>
                  </div>
                  <p
                    className={`text-xs ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    Pelvic wink eliminated through 105° of active hip flexion.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border flex flex-col gap-3 ${
                    isDark
                      ? 'bg-[#171b23] border-neutral-800'
                      : 'bg-slate-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">
                      Single-Leg Pelvic Balance
                    </span>
                    <span className="text-[10px] text-amber-500 font-mono font-semibold">
                      Trendelenburg Screen
                    </span>
                  </div>
                  <div
                    className={`aspect-4/3 rounded-lg border p-3 flex items-center justify-center text-center ${
                      isDark
                        ? 'bg-[#0e1117] border-neutral-800'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <Camera className="w-7 h-7 text-neutral-400 mx-auto" />
                      <div className="text-xs font-medium">Photo Set Verified</div>
                      <div className="text-[11px] text-neutral-500">
                        Glute medius firing symmetry improved from 65% to 92%
                      </div>
                    </div>
                  </div>
                  <p
                    className={`text-xs ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    Left hip drop on single leg stance stabilized.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movement' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold">
                Functional Movement Screen (FMS) Record
              </h4>
              <div
                className={`rounded-xl border overflow-hidden divide-y ${
                  isDark
                    ? 'bg-[#171b23] border-neutral-800 divide-neutral-800'
                    : 'bg-white border-neutral-200 divide-neutral-200 shadow-sm'
                }`}
              >
                {[
                  {
                    test: 'Deep Overhead Squat',
                    score: '3 / 3',
                    prev: '2 / 3',
                    status: 'Cleared',
                  },
                  {
                    test: 'Hurdle Step (L / R)',
                    score: '2 / 3',
                    prev: '2 / 3',
                    status: 'In Progress',
                  },
                  {
                    test: 'Inline Lunge (L / R)',
                    score: '3 / 3',
                    prev: '2 / 3',
                    status: 'Cleared',
                  },
                  {
                    test: 'Active Straight Leg Raise',
                    score: '3 / 3',
                    prev: '2 / 3',
                    status: 'Cleared',
                  },
                  {
                    test: 'Rotary Stability',
                    score: '2 / 3',
                    prev: '2 / 3',
                    status: 'Maintaining',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex items-center justify-between text-xs"
                  >
                    <div className="font-semibold">{item.test}</div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-mono ${
                          isDark ? 'text-neutral-400' : 'text-neutral-500'
                        }`}
                      >
                        Prev: {item.prev}
                      </span>
                      <span className="font-bold font-mono text-amber-500">
                        {item.score}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isDark
                            ? 'bg-neutral-800 text-neutral-300'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex justify-end ${
            isDark
              ? 'bg-[#161a22] border-neutral-800'
              : 'bg-slate-50 border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
