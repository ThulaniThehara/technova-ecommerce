// Tiny in-memory limiter for failed login attempts. Honest limitation: on serverless hosting
// each instance has its own memory, so this slows brute force down rather than stopping it.
// A production system would use a shared store (Redis/Upstash).

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

const failures = new Map<string, { count: number; resetAt: number }>();

export function isLimited(key: string): boolean {
  const entry = failures.get(key);
  if (!entry) return false;
  if (entry.resetAt < Date.now()) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(key: string) {
  const now = Date.now();
  const entry = failures.get(key);
  if (!entry || entry.resetAt < now) failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
  // keep the map from growing forever
  if (failures.size > 5000) for (const [k, v] of failures) if (v.resetAt < now) failures.delete(k);
}

export function clearFailures(key: string) {
  failures.delete(key);
}
