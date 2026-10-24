import { describe, it, expect } from 'vitest';
import { buildReminderEmails, localDateKey } from './logic';

const day = (exs: string[], o = {}) => ({ date: '2026-10-24', focus: 'Lower body', exercises: exs.map((name) => ({ name, sets: 3, reps: '8' })), ...o });

describe('daily reminder emails', () => {
  const clients = [
    { id: 'a', name: 'Ana Lopez', email: 'ana@x.com' },
    { id: 'b', name: 'Ben', email: 'ben@x.com', emailDailyWorkout: false },
    { id: 'c', name: 'Cat', email: 'cat@x.com', archived: true },
    { id: 'd', name: 'Dan', email: 'dan@x.com' },
    { id: 'e', name: 'Eve', email: 'eve@x.com' },
    { id: 'f', name: 'Fay <script>', email: 'fay@x.com' },
  ];
  const workouts = [
    { client_id: 'a', data: day(['Back Squat', 'Plank']) },
    { client_id: 'b', data: day(['Row']) },
    { client_id: 'c', data: day(['Row']) },
    { client_id: 'd', data: day(['Row'], { sessionCompleted: true }) },
    // e has no workout today
    { client_id: 'f', data: day(['Press']) },
  ];
  const emails = buildReminderEmails(clients, workouts, 'https://app.example', 'Coach Sam');

  it('only emails active, opted-in clients with an unfinished workout today', () => {
    expect(emails.map((e) => e.to)).toEqual(['ana@x.com', 'fay@x.com']);
  });
  it('lists the exercises and links to the app', () => {
    expect(emails[0].subject).toBe("Today's workout: Lower body");
    expect(emails[0].text).toContain('Hi Ana,');
    expect(emails[0].text).toContain('• Back Squat — 3 sets × 8 reps');
    expect(emails[0].text).toContain('https://app.example');
    expect(emails[0].text).toContain('— Coach Sam');
  });
  it('escapes HTML from user-entered names', () => {
    expect(emails[1].html).not.toContain('<script>');
  });
  it('uses the coach time zone for "today"', () => {
    const t = new Date('2026-10-25T02:00:00Z'); // still Oct 24 in New York
    expect(localDateKey(t, 'America/New_York')).toBe('2026-10-24');
    expect(localDateKey(t, 'Asia/Tehran')).toBe('2026-10-25');
  });
});
