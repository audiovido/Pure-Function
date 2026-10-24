// Pure logic for the daily reminder email (no Deno/Node APIs, unit-tested with vitest).

export interface ReminderExercise {
  name: string;
  sets?: number;
  setsText?: string;
  reps?: string;
}

export interface ReminderDay {
  date: string;
  focus?: string | null;
  exercises: ReminderExercise[];
  sessionCompleted?: boolean;
}

export interface ReminderClient {
  id: string;
  name: string;
  email?: string;
  archived?: boolean;
  /** clients can opt out in their settings; undefined means opted in */
  emailDailyWorkout?: boolean;
}

export interface ReminderEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** YYYY-MM-DD for `now` in the given IANA time zone (the coach's local day). */
export function localDateKey(now: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function line(ex: ReminderExercise): string {
  const sets = ex.setsText || (ex.sets ? String(ex.sets) : '');
  const rx = [sets && `${sets} sets`, ex.reps && `${ex.reps} reps`].filter(Boolean).join(' × ');
  return rx ? `${ex.name} — ${rx}` : ex.name;
}

/** One email per active, opted-in client who has an unfinished workout today. */
export function buildReminderEmails(
  clients: ReminderClient[],
  workoutsToday: { client_id: string; data: ReminderDay }[],
  appUrl: string,
  coachName = 'Your coach'
): ReminderEmail[] {
  const byClient = new Map(workoutsToday.map((w) => [w.client_id, w.data]));
  const out: ReminderEmail[] = [];

  for (const c of clients) {
    if (c.archived || c.emailDailyWorkout === false || !c.email) continue;
    const day = byClient.get(c.id);
    if (!day || day.exercises.length === 0 || day.sessionCompleted) continue;

    const first = c.name.split(' ')[0] || c.name;
    const title = day.focus || 'Workout';
    const lines = day.exercises.map(line);

    out.push({
      to: c.email,
      subject: `Today's workout: ${title}`,
      text: [`Hi ${first},`, '', `Here's your workout for today — ${title}:`, ...lines.map((l) => `• ${l}`), '', `Open the app: ${appUrl}`, '', `— ${coachName}`].join('\n'),
      html: `<p>Hi ${escapeHtml(first)},</p><p>Here's your workout for today — <strong>${escapeHtml(title)}</strong>:</p><ul>${lines
        .map((l) => `<li>${escapeHtml(l)}</li>`)
        .join('')}</ul><p><a href="${escapeHtml(appUrl)}">Open the app</a></p><p>— ${escapeHtml(coachName)}</p>`,
    });
  }
  return out;
}
