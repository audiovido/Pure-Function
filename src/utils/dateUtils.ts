import { DayWorkout } from '../types';

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object or YYYY-MM-DD string to local YYYY-MM-DD
 */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a local Date object safely without UTC timezone shift
 */
export function parseDateKey(str: string): Date {
  const parts = str.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
  return new Date();
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
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

export interface CalendarDayInfo {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Mon, Tue...
  dayNumber: number; // 9
  monthName: string; // October
  year: number; // 2026
  fullDayName: string; // Friday, October 9, 2026
  isToday: boolean;
}

/**
 * Returns the 7 days of the week containing the given date (Monday to Sunday)
 */
export function getWeekDays(referenceDateStr: string): CalendarDayInfo[] {
  const ref = parseDateKey(referenceDateStr);
  const dayIndex = ref.getDay(); // 0 is Sunday, 1 is Monday...
  // Calculate difference to Monday (Monday = 1). If Sunday (0), difference is -6
  const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;

  const monday = new Date(ref);
  monday.setDate(ref.getDate() + diffToMonday);

  const todayStr = getTodayDateString();
  const result: CalendarDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    const dateKey = formatDateKey(current);
    const dayOfWeek = SHORT_DAYS[current.getDay()];
    const fullDayOfWeek = FULL_DAYS[current.getDay()];
    const dayNumber = current.getDate();
    const monthName = MONTH_NAMES[current.getMonth()];
    const year = current.getFullYear();

    result.push({
      date: dateKey,
      dayOfWeek,
      dayNumber,
      monthName,
      year,
      fullDayName: `${fullDayOfWeek}, ${monthName} ${dayNumber}, ${year}`,
      isToday: dateKey === todayStr,
    });
  }

  return result;
}

/**
 * Returns formatted title for a week, e.g. "October 5 – 11, 2026"
 */
export function formatWeekRangeHeader(days: CalendarDayInfo[]): string {
  if (days.length === 0) return '';
  const first = days[0];
  const last = days[days.length - 1];

  if (first.monthName === last.monthName && first.year === last.year) {
    return `${first.monthName} ${first.dayNumber} – ${last.dayNumber}, ${first.year}`;
  }

  if (first.year === last.year) {
    return `${first.monthName} ${first.dayNumber} – ${last.monthName} ${last.dayNumber}, ${first.year}`;
  }

  return `${first.monthName} ${first.dayNumber}, ${first.year} – ${last.monthName} ${last.dayNumber}, ${last.year}`;
}

/**
 * Shifts a date by a number of weeks (+1 for next week, -1 for previous week)
 */
export function shiftDateByWeeks(dateStr: string, weeksDelta: number): string {
  const d = parseDateKey(dateStr);
  d.setDate(d.getDate() + weeksDelta * 7);
  return formatDateKey(d);
}

/**
 * Creates or retrieves a DayWorkout object for a given date
 */
export function getOrCreateDayWorkout(
  existingWorkouts: DayWorkout[],
  dateStr: string
): DayWorkout {
  const found = existingWorkouts.find((w) => w.date === dateStr);
  if (found) return found;

  const d = parseDateKey(dateStr);
  const dayOfWeek = SHORT_DAYS[d.getDay()];
  const fullDay = FULL_DAYS[d.getDay()];
  const monthName = MONTH_NAMES[d.getMonth()];

  return {
    date: dateStr,
    dayOfWeek,
    dayNumber: d.getDate(),
    fullDayName: `${fullDay}, ${monthName} ${d.getDate()}, ${d.getFullYear()}`,
    focus: null,
    exercises: [],
  };
}
