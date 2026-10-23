import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  ArrowLeft,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Video,
} from 'lucide-react';
import {
  TrueCoachLibraryExercise,
  ExercisePartnerSource,
} from '../data/trueCoachExerciseLibrary';

interface TrainerExerciseEditorViewProps {
  exercise: TrueCoachLibraryExercise;
  isNew?: boolean;
  onSave: (updated: TrueCoachLibraryExercise) => void;
  onCancel: () => void;
  onDelete?: (exerciseId: string) => void;
  onSelectPrev?: () => void;
  onSelectNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const PATTERN_OPTIONS = [
  '',
  'Squat',
  'Bend',
  'Push',
  'Pull',
  'Single Leg',
  'Core',
  'Locomotion',
  'Mobility',
  'Complex',
  'Lunge',
  'Rotation',
  'Carry',
];

const TYPE_OPTIONS = [
  '',
  'External Loading',
  'Bodyweight',
  'Explosiveness',
  'Stability',
  'Mobility',
  'Speed',
  'Endurance',
  'Isometric',
  'Breathwork',
];

const PLANE_OPTIONS = ['', 'Sagittal', 'Frontal', 'Transverse', 'Multiple'];

function parseVideoEmbed(url: string): {
  kind: 'vimeo' | 'youtube' | 'direct' | 'none';
  embedUrl: string;
} {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return { kind: 'none', embedUrl: '' };
  }

  // Check Vimeo
  const vimeoMatch =
    trimmed.match(/vimeo\.com\/(?:video\/|channels\/[^/]+\/|manage\/videos\/)?(\d+)/i) ||
    trimmed.match(/^(\d{7,11})$/);
  if (vimeoMatch?.[1]) {
    return {
      kind: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?badge=0&autopause=0&player_id=0&app_id=58479`,
    };
  }

  // Check YouTube
  let ytId = '';
  if (trimmed.includes('youtube.com/watch')) {
    try {
      const u = new URL(trimmed);
      ytId = u.searchParams.get('v') || '';
    } catch {
      const m = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      ytId = m?.[1] || '';
    }
  } else if (trimmed.includes('youtu.be/')) {
    ytId = trimmed.split('youtu.be/')[1]?.split(/[?#&]/)[0] || '';
  } else if (trimmed.includes('youtube.com/embed/') || trimmed.includes('youtube-nocookie.com/embed/')) {
    ytId = trimmed.split('/embed/')[1]?.split(/[?#&]/)[0] || '';
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    ytId = trimmed;
  }

  if (ytId) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`,
    };
  }

  // Check direct video or blob URL
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:video/') ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)
  ) {
    return { kind: 'direct', embedUrl: trimmed };
  }

  // Fallback: if user typed a partial URL or unknown host, still attempt iframe or fallback to default Vimeo demo
  return {
    kind: 'vimeo',
    embedUrl: 'https://player.vimeo.com/video/609364053?badge=0&autopause=0&player_id=0&app_id=58479',
  };
}

export const TrainerExerciseEditorView: React.FC<
  TrainerExerciseEditorViewProps
> = ({
  exercise,
  isNew = false,
  onSave,
  onCancel,
  onDelete,
  onSelectPrev,
  onSelectNext,
  hasPrev = false,
  hasNext = false,
}) => {
  const [name, setName] = useState(exercise.name);
  const [videoUrl, setVideoUrl] = useState(
    exercise.videoUrl || 'https://vimeo.com/609364053'
  );
  const [patterns, setPatterns] = useState(exercise.patterns || '');
  const [types, setTypes] = useState(exercise.types || '');
  const [primaryMuscles, setPrimaryMuscles] = useState(
    exercise.primaryMuscles || ''
  );
  const [planes, setPlanes] = useState(exercise.planes || '');
  const [instructions, setInstructions] = useState(
    exercise.instructions || ''
  );
  const [fromSource, setFromSource] = useState<ExercisePartnerSource>(
    exercise.from || 'pf'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(exercise.name);
    setVideoUrl(exercise.videoUrl || 'https://vimeo.com/609364053');
    setPatterns(exercise.patterns || '');
    setTypes(exercise.types || '');
    setPrimaryMuscles(exercise.primaryMuscles || '');
    setPlanes(exercise.planes || '');
    setInstructions(exercise.instructions || '');
    setFromSource(exercise.from || 'pf');
    setUploadedFileName(null);
    setSavedToast(false);
  }, [exercise]);

  const parsedVideo = parseVideoEmbed(videoUrl);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setVideoUrl(blobUrl);
    setUploadedFileName(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...exercise,
      name: name.trim(),
      videoUrl: videoUrl.trim() || 'https://vimeo.com/609364053',
      patterns: patterns.trim(),
      types: types.trim(),
      primaryMuscles: primaryMuscles.trim(),
      planes: planes.trim(),
      instructions: instructions.trim(),
      from: fromSource,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12">
      {/* Top Navigation & Header Row matching TrueCoach Edit Exercise screen */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer shrink-0"
            title="Back to Exercises"
            aria-label="Back to Exercises"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight truncate">
            {isNew ? 'Add exercise' : `Edit ${name || exercise.name}`}
          </h1>
        </div>

        {/* Prev / Next Exercise Stepper */}
        {!isNew && (hasPrev || hasNext) && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={onSelectPrev}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-neutral-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={onSelectNext}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-neutral-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main White Form Card (Exact TrueCoach Edit Exercise layout from Screenshot) */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-neutral-200/90 p-5 sm:p-8 shadow-2xs space-y-6"
      >
        {/* 1. Exercise name * */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-[13px] font-bold text-neutral-900">
            Exercise name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 1 leg balance to 3 way reach"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-400 outline-none transition-colors"
          />
        </div>

        {/* 2. Link to video * — OR — Upload video */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-[13px] font-bold text-neutral-900">
            Link to video <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              required
              value={uploadedFileName ? `Uploaded: ${uploadedFileName}` : videoUrl}
              onChange={(e) => {
                setUploadedFileName(null);
                setVideoUrl(e.target.value);
              }}
              placeholder="https://vimeo.com/609364053 or https://www.youtube.com/watch?v=..."
              className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-400 outline-none transition-colors"
            />

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 shrink-0 px-1 select-none">
              <span className="w-3 h-px bg-neutral-300" />
              <span>OR</span>
              <span className="w-3 h-px bg-neutral-300" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4 text-neutral-500" />
              <span>Upload video</span>
            </button>
          </div>
        </div>

        {/* 3. Full-Width Responsive 16:9 Video Player Preview */}
        <div className="w-full rounded-lg overflow-hidden bg-black aspect-video relative border border-neutral-200 shadow-xs">
          {parsedVideo.kind === 'vimeo' && (
            <iframe
              key={parsedVideo.embedUrl}
              src={parsedVideo.embedUrl}
              title={name || 'Exercise Video Demonstration'}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              allowFullScreen
            />
          )}

          {parsedVideo.kind === 'youtube' && (
            <iframe
              key={parsedVideo.embedUrl}
              src={parsedVideo.embedUrl}
              title={name || 'Exercise Video Demonstration'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}

          {parsedVideo.kind === 'direct' && (
            <video
              key={parsedVideo.embedUrl}
              src={parsedVideo.embedUrl}
              controls
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          )}

          {parsedVideo.kind === 'none' && (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-2 p-6 text-center">
              <Video className="w-10 h-10 text-amber-400/80" />
              <p className="text-sm font-semibold text-white">
                Paste a Vimeo or YouTube link above or upload a video file
              </p>
            </div>
          )}
        </div>

        {/* 4. Movement Taxonomy & Coaching Instructions (TrueCoach Exercise Metadata) */}
        <div className="pt-2 border-t border-neutral-200/80 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Patterns */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800">
                Patterns
              </label>
              <select
                value={patterns}
                onChange={(e) => setPatterns(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-amber-400 outline-none"
              >
                {PATTERN_OPTIONS.map((opt) => (
                  <option key={opt || 'none'} value={opt}>
                    {opt || 'Select pattern...'}
                  </option>
                ))}
                {patterns && !PATTERN_OPTIONS.includes(patterns) && (
                  <option value={patterns}>{patterns}</option>
                )}
              </select>
            </div>

            {/* Types */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800">
                Types
              </label>
              <select
                value={types}
                onChange={(e) => setTypes(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-amber-400 outline-none"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt || 'none'} value={opt}>
                    {opt || 'Select type...'}
                  </option>
                ))}
                {types && !TYPE_OPTIONS.includes(types) && (
                  <option value={types}>{types}</option>
                )}
              </select>
            </div>

            {/* Primary Muscles */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800">
                Primary Muscles
              </label>
              <input
                type="text"
                value={primaryMuscles}
                onChange={(e) => setPrimaryMuscles(e.target.value)}
                placeholder="e.g. Quadriceps, Glutes, Core"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-400 outline-none"
              />
            </div>

            {/* Planes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800">
                Planes
              </label>
              <select
                value={planes}
                onChange={(e) => setPlanes(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-amber-400 outline-none"
              >
                {PLANE_OPTIONS.map((opt) => (
                  <option key={opt || 'none'} value={opt}>
                    {opt || 'Select plane...'}
                  </option>
                ))}
                {planes && !PLANE_OPTIONS.includes(planes) && (
                  <option value={planes}>{planes}</option>
                )}
              </select>
            </div>
          </div>

          {/* Coaching Instructions / Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-800">
                Instructions & Coaching Cues
              </label>
              {videoUrl.startsWith('http') && (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  <span>Open source video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Add coaching instructions, setup cues, or tempo guidelines for your clients..."
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-400 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* 5. Footer Action Buttons */}
        <div className="pt-4 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isNew ? 'Create exercise' : 'Save changes'}</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {savedToast && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 pl-2">
                <Check className="w-4 h-4" />
                Saved to library
              </span>
            )}
          </div>

          {!isNew && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(exercise.id)}
              className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete exercise</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
