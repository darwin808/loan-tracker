const attempts = new Map<string, number[]>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_ATTEMPTS = 5;

export function checkRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const timestamps = attempts.get(ip) ?? [];

  // Drop entries outside the window
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    return { allowed: false };
  }

  recent.push(now);
  attempts.set(ip, recent);
  return { allowed: true };
}
