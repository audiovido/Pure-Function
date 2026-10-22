import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  Check,
} from 'lucide-react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function formatShortDateLabel(dateStr: string): string {
  if (dateStr === '2026-10-21') return 'Today';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10) || 2026;
  const monthIdx = Math.max(0, Math.min(11, (parseInt(parts[1], 10) || 10) - 1));
  const dayNum = parseInt(parts[2], 10) || 1;
  return `${SHORT_MONTH_NAMES[monthIdx]} ${dayNum}, ${year}`;
}

export function formatDateRangeLabel(startDate: string, endDate: string): string {
  const parseParts = (d: string) => {
    const [y, m, day] = d.split('-').map((n) => parseInt(n, 10));
    return {
      year: y || 2026,
      monthIdx: Math.max(0, Math.min(11, (m || 10) - 1)),
      day: day || 1,
    };
  };

  const s = parseParts(startDate);
  const e = parseParts(endDate);

  if (startDate === endDate) {
    return `${SHORT_MONTH_NAMES[s.monthIdx]} ${s.day}, ${s.year}`;
  }

  if (s.year === e.year) {
    return `${SHORT_MONTH_NAMES[s.monthIdx]} ${s.day} - ${SHORT_MONTH_NAMES[e.monthIdx]} ${e.day}, ${s.year}`;
  }

  return `${SHORT_MONTH_NAMES[s.monthIdx]} ${s.day}, ${s.year} - ${SHORT_MONTH_NAMES[e.monthIdx]} ${e.day}, ${e.year}`;
}

function toIsoDate(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

interface DateRangeCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onApplyRange: (startDate: string, endDate: string) => void;
  workoutDates?: string[];
  onOpenSingleDay?: (dateStr: string) => void;
  title?: string;
}

export const DateRangeCalendarModal: React.FC<DateRangeCalendarModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onApplyRange,
  workoutDates = [],
  onOpenSingleDay,
  title = 'Select Dates',
}) => {
  const initialYearMonth = useMemo(() => {
    const parts = (startDate || '2026-10-15').split('-');
    const y = parseInt(parts[0], 10) || 2026;
    const m = (parseInt(parts[1], 10) || 10) - 1;
    return { year: y, month: m };
  }, [startDate]);

  const [viewYear, setViewYear] = useState<number>(initialYearMonth.year);
  const [viewMonth, setViewMonth] = useState<number>(initialYearMonth.month);
  const [draftStart, setDraftStart] = useState<string>(startDate);
  const [draftEnd, setDraftEnd] = useState<string>(endDate);
  const [selectingStep, setSelectingStep] = useState<'start' | 'end'>('start');

  useEffect(() => {
    if (isOpen) {
      setDraftStart(startDate);
      setDraftEnd(endDate);
      setSelectingStep('start');
      const parts = (startDate || '2026-10-15').split('-');
      const y = parseInt(parts[0], 10) || 2026;
      const m = (parseInt(parts[1], 10) || 10) - 1;
      setViewYear(y);
      setViewMonth(m);
    }
  }, [isOpen, startDate, endDate]);

  const workoutDatesSet = useMemo(() => new Set(workoutDates), [workoutDates]);

  if (!isOpen) return null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dayNum: number) => {
    const clickedIso = toIsoDate(viewYear, viewMonth, dayNum);

    if (selectingStep === 'start') {
      setDraftStart(clickedIso);
      setDraftEnd(clickedIso);
      setSelectingStep('end');
    } else {
      if (clickedIso < draftStart) {
        setDraftEnd(draftStart);
        setDraftStart(clickedIso);
      } else {
        setDraftEnd(clickedIso);
      }
      setSelectingStep('start');
    }
  };

  const handleApply = () => {
    onApplyRange(draftStart, draftEnd);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Amber Header */}
        <div className="bg-amber-400 px-4 py-3.5 flex items-center justify-between text-black">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="w-4 h-4 stroke-[2.2] shrink-0" />
            <span className="font-extrabold text-sm sm:text-base tracking-tight truncate">
              {title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close calendar"
          >
            <X className="w-4 h-4 stroke-[2.4]" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Month & Year Navigation Bar */}
          <div className="flex items-center justify-between bg-[#f4f5f7] rounded-2xl px-3 py-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
            </button>

            <span className="font-extrabold text-xs sm:text-sm text-neutral-900">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-[11px] font-bold text-neutral-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
              const iso = toIsoDate(viewYear, viewMonth, dayNum);
              const isStart = iso === draftStart;
              const isEnd = iso === draftEnd;
              const isInRange = iso > draftStart && iso < draftEnd;
              const isToday = iso === '2026-10-21';
              const hasWorkout = workoutDatesSet.has(iso);

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleDayClick(dayNum)}
                  className={`relative h-9 w-full flex flex-col items-center justify-center text-xs transition-all cursor-pointer ${
                    isStart || isEnd
                      ? 'bg-amber-400 text-black font-black rounded-full shadow-2xs'
                      : isInRange
                      ? 'bg-amber-100/90 text-neutral-900 font-bold rounded-lg'
                      : isToday
                      ? 'border border-amber-400 text-neutral-900 font-bold rounded-full'
                      : 'text-neutral-800 hover:bg-neutral-100 rounded-full font-medium'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasWorkout && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isStart || isEnd ? 'bg-black' : 'bg-amber-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Range Summary & Action Footer */}
          <div className="pt-2 border-t border-neutral-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
              <span className="font-medium">Selected:</span>
              <span className="font-bold text-neutral-900">
                {formatDateRangeLabel(draftStart, draftEnd)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {draftStart === draftEnd && onOpenSingleDay && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenSingleDay(draftStart);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs transition-colors cursor-pointer truncate"
                >
                  Open Workout
                </button>
              )}
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#252a36] hover:bg-[#1b1f29] text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Apply Dates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SingleDateCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: string;
  onSelectDate: (formattedDate: string, isoDate: string) => void;
  title?: string;
}

export const SingleDateCalendarModal: React.FC<SingleDateCalendarModalProps> = ({
  isOpen,
  onClose,
  initialValue = '',
  onSelectDate,
  title = 'Select Date',
}) => {
  const parsedInitial = useMemo(() => {
    if (initialValue) {
      const slashParts = initialValue.split('/');
      if (slashParts.length === 3) {
        const m = parseInt(slashParts[0], 10) - 1;
        const d = parseInt(slashParts[1], 10);
        const y = parseInt(slashParts[2], 10);
        if (!isNaN(m) && !isNaN(y) && y > 1920 && m >= 0 && m <= 11) {
          return { year: y, month: m, day: d || 1 };
        }
      }
    }
    return { year: 1996, month: 9, day: 15 };
  }, [initialValue]);

  const [viewYear, setViewYear] = useState<number>(parsedInitial.year);
  const [viewMonth, setViewMonth] = useState<number>(parsedInitial.month);

  useEffect(() => {
    if (isOpen) {
      setViewYear(parsedInitial.year);
      setViewMonth(parsedInitial.month);
    }
  }, [isOpen, parsedInitial]);

  if (!isOpen) return null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePickDay = (dayNum: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    const formatted = `${mm}/${dd}/${viewYear}`;
    const iso = toIsoDate(viewYear, viewMonth, dayNum);
    onSelectDate(formatted, iso);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Amber Header */}
        <div className="bg-amber-400 px-4 py-3.5 flex items-center justify-between text-black">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="w-4 h-4 stroke-[2.2] shrink-0" />
            <span className="font-extrabold text-sm sm:text-base tracking-tight truncate">
              {title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close calendar"
          >
            <X className="w-4 h-4 stroke-[2.4]" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Month & Year Selectors */}
          <div className="flex items-center justify-between bg-[#f4f5f7] rounded-2xl px-3 py-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-transparent font-extrabold text-xs sm:text-sm text-neutral-900 outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-transparent font-extrabold text-xs sm:text-sm text-neutral-900 outline-none cursor-pointer"
              >
                {Array.from({ length: 85 }, (_, i) => 2026 - i).map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-[11px] font-bold text-neutral-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(dayNum).padStart(2, '0');
              const isSelected = initialValue === `${mm}/${dd}/${viewYear}`;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handlePickDay(dayNum)}
                  className={`h-9 w-full flex items-center justify-center text-xs transition-all cursor-pointer rounded-full ${
                    isSelected
                      ? 'bg-amber-400 text-black font-black shadow-2xs'
                      : 'text-neutral-800 hover:bg-amber-100 font-medium'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
