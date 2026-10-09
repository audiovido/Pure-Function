import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Video, CheckCircle2, ExternalLink, Edit3, Save } from 'lucide-react';
import { Exercise, ThemeMode } from '../types';

interface VideoPlayerModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onUpdateExerciseVideo?: (exerciseId: string, youtubeId: string) => void;
  theme?: ThemeMode;
}

// Fallback high-definition curated coaching videos for fitness & bodybuilding exercises
const DEFAULT_VIDEO_MAP: Record<string, string> = {
  'goblet': 'MeIiIdhvXT4',
  'single-leg': 'iH4Q5dYpB1E',
  'single leg': 'iH4Q5dYpB1E',
  'rdl': 'JCXUYuzwNrM',
  'romanian': 'JCXUYuzwNrM',
  '90/90': 'r6Zf4GZ0E0Q',
  'breathing': 'r6Zf4GZ0E0Q',
  'bulgarian': '2C-uNgKwPLE',
  'split squat': '2C-uNgKwPLE',
  'bench': 'VmB1G1K7v94',
  'incline': '8iPEnn-ltC8',
  'overhead': '2yjwXTZQDDI',
  'landmine': 'yJ1iYgNl2rE',
  'pull-up': 'eGo4IYlbE5g',
  'pulldown': 'CAwf7n6Luuc',
  'row': 'H75im9fAUMc',
  'push-up': 'IODxDxX7oi4',
  'plank': 'K2VljzCC16g',
  'dead bug': 'g_BYB0R-4Ws',
  'pallof': 'AH_QZLm_0-s',
  'kettlebell': 'YSxHifyI608',
  'lunge': 'L8fvypPrzzs',
  'stretch': '2fBf_yB4xQc',
  'squat': 'bEv6CCg2BC8',
};

function getYouTubeIdForExercise(exercise: Exercise): string {
  if (exercise.youtubeId) return exercise.youtubeId;
  const lower = exercise.name.toLowerCase();
  for (const [key, id] of Object.entries(DEFAULT_VIDEO_MAP)) {
    if (lower.includes(key)) return id;
  }
  return 'MeIiIdhvXT4'; // default high-quality demonstration
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  exercise,
  onClose,
  onUpdateExerciseVideo,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'video' | 'cues' | 'edit'>('video');
  const [customYtId, setCustomYtId] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (exercise) {
      setCustomYtId(exercise.youtubeId || getYouTubeIdForExercise(exercise));
    }
  }, [exercise]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!exercise) return null;

  const currentYtId = customYtId || getYouTubeIdForExercise(exercise);

  const handleSaveCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customYtId.trim()) return;

    // extract ID if user pasted full YouTube URL
    let cleanId = customYtId.trim();
    if (cleanId.includes('v=')) {
      cleanId = cleanId.split('v=')[1]?.split('&')[0] || cleanId;
    } else if (cleanId.includes('youtu.be/')) {
      cleanId = cleanId.split('youtu.be/')[1]?.split('?')[0] || cleanId;
    } else if (cleanId.includes('embed/')) {
      cleanId = cleanId.split('embed/')[1]?.split('?')[0] || cleanId;
    }

    setCustomYtId(cleanId);
    if (onUpdateExerciseVideo) {
      onUpdateExerciseVideo(exercise.id, cleanId);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setActiveTab('video');
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-default ${
          isDark
            ? 'bg-[#12151c] border border-neutral-800 text-slate-100'
            : 'bg-white border border-neutral-200 text-neutral-900 shadow-xl'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'bg-[#161a23] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                {exercise.name}
              </h3>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Real Form Demonstration & Coaching Checkpoints
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div
          className={`flex items-center gap-3 px-5 pt-2 border-b text-xs font-semibold ${
            isDark ? 'bg-[#0f1218] border-neutral-800/80' : 'bg-neutral-100/60 border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'border-amber-400 text-amber-500 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-white'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>HD Demonstration Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cues')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cues'
                ? 'border-amber-400 text-amber-500 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-white'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Coaching Checkpoints & Biomechanics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-amber-400 text-amber-500 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-white'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Coach Custom Video URL</span>
          </button>
        </div>

        {/* Content: Video Tab */}
        {activeTab === 'video' && (
          <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${currentYtId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
              title={`${exercise.name} Demonstration`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Content: Coaching Cues Tab */}
        {activeTab === 'cues' && (
          <div className={`p-5 sm:p-6 space-y-4 max-h-[380px] overflow-y-auto ${isDark ? 'bg-[#0f1218]' : 'bg-neutral-50'}`}>
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Execution Prescription for {exercise.name}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#161a22] border-neutral-800' : 'bg-white border-neutral-200'}`}>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Sets</span>
                  <span className="font-bold font-mono text-sm">{exercise.sets}</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#161a22] border-neutral-800' : 'bg-white border-neutral-200'}`}>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Reps</span>
                  <span className="font-bold font-mono text-sm">{exercise.reps}</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#161a22] border-neutral-800' : 'bg-white border-neutral-200'}`}>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Intensity</span>
                  <span className="font-bold font-mono text-sm">{exercise.intensity}</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#161a22] border-neutral-800' : 'bg-white border-neutral-200'}`}>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Rest</span>
                  <span className="font-bold font-mono text-sm">{exercise.rest}</span>
                </div>
              </div>
            </div>

            {exercise.notes && (
              <div className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-[#161a22] border-neutral-800' : 'bg-white border-neutral-200'}`}>
                <span className="font-semibold text-amber-500 block mb-0.5">Trainer Prescription Note:</span>
                <p className={isDark ? 'text-neutral-300' : 'text-neutral-700'}>{exercise.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Key Biomechanical Form Checkpoints
              </h5>
              <ul className="space-y-2 text-xs">
                {(exercise.cues || [
                  'Maintain neutral spine through entire range of motion',
                  'Controlled eccentric phase (tempo 3-0-1-0)',
                  'Drive through ground contact points without lateral knee collapse',
                  'Exhale on concentric exertion phase',
                ]).map((cue, idx) => (
                  <li
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                      isDark ? 'bg-[#14171e] border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Content: Edit Custom Video Tab */}
        {activeTab === 'edit' && (
          <form
            onSubmit={handleSaveCustomVideo}
            className={`p-5 sm:p-6 space-y-4 ${isDark ? 'bg-[#0f1218]' : 'bg-neutral-50'}`}
          >
            <div>
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                Custom Video Demonstration Link
              </h4>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Paste any YouTube URL or Video ID to override this demonstration with your gym&apos;s own video.
              </p>
            </div>

            <div className="space-y-2">
              <label className={`block text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                YouTube Video ID or Full Link:
              </label>
              <input
                type="text"
                value={customYtId}
                onChange={(e) => setCustomYtId(e.target.value)}
                placeholder="e.g. MeIiIdhvXT4 or https://youtu.be/..."
                className={`w-full px-3.5 py-2 text-xs rounded-xl font-mono outline-none ${
                  isDark
                    ? 'bg-[#161a22] border border-neutral-700 focus:border-amber-400 text-white'
                    : 'bg-white border border-neutral-300 focus:border-amber-500 text-neutral-900 shadow-sm'
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`https://www.youtube.com/watch?v=${currentYtId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaved ? 'Saved!' : 'Save Video Link'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-[#161a23] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>
            Category: {exercise.category || 'Strength'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                : 'bg-neutral-200 hover:bg-neutral-300 text-black'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
