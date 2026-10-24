import { describe, it, expect, vi } from 'vitest';
import { attachRealtime, isSameData, stableStringify } from '../cloudSync';

describe('stableStringify / isSameData', () => {
  it('ignores key order (jsonb reorders keys)', () => {
    expect(isSameData({ a: 1, b: { c: 2, d: [1, { y: 1, x: 2 }] } }, { b: { d: [1, { x: 2, y: 1 }], c: 2 }, a: 1 })).toBe(true);
  });
  it('detects real differences and ignores undefined fields', () => {
    expect(isSameData({ a: 1 }, { a: 2 })).toBe(false);
    expect(isSameData({ a: 1, b: undefined }, { a: 1 })).toBe(true);
    expect(stableStringify([1, 'x', null])).toBe('[1,"x",null]');
  });
});

function fakeClient() {
  const handlers: Record<string, (p: any) => void> = {};
  const channel = {
    on: vi.fn((_t: string, f: { table: string }, cb: (p: any) => void) => {
      handlers[f.table] = cb;
      return channel;
    }),
    subscribe: vi.fn(),
  };
  const client = { channel: vi.fn(() => channel), removeChannel: vi.fn() };
  return { client, channel, handlers };
}

describe('attachRealtime', () => {
  it('routes message and workout rows to the right handlers', () => {
    const { client, handlers, channel } = fakeClient();
    const onMessage = vi.fn();
    const onWorkout = vi.fn();
    attachRealtime(client as any, { onMessage, onWorkout });
    expect(channel.subscribe).toHaveBeenCalled();

    handlers.messages({ eventType: 'INSERT', new: { id: 'm1', client_id: 'c1', data: { id: 'm1', text: 'hi' } } });
    expect(onMessage).toHaveBeenCalledWith('c1', { id: 'm1', text: 'hi' });

    handlers.workouts({ eventType: 'UPDATE', new: { client_id: 'c1', date: '2026-10-24', data: { date: '2026-10-24', exercises: [] } } });
    expect(onWorkout).toHaveBeenCalledWith('c1', { date: '2026-10-24', exercises: [] });
  });

  it('ignores deletes and unsubscribes cleanly', () => {
    const { client, handlers, channel } = fakeClient();
    const onMessage = vi.fn();
    const off = attachRealtime(client as any, { onMessage, onWorkout: vi.fn() });
    handlers.messages({ eventType: 'DELETE', old: { id: 'm1' } });
    expect(onMessage).not.toHaveBeenCalled();
    off();
    expect(client.removeChannel).toHaveBeenCalledWith(channel);
  });

  it('is a no-op without a client (demo mode)', () => {
    expect(() => attachRealtime(null, { onMessage: vi.fn(), onWorkout: vi.fn() })()).not.toThrow();
  });
});
