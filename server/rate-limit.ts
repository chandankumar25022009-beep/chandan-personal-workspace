const attempts = new Map<string, { count: number; resetAt: number }>()
const windowMs = 15 * 60 * 1000
const maximumAttempts = 8
const maximumTrackedAddresses = 10_000

export function allowLoginAttempt(key: string, now = Date.now()) {
  for (const [attemptKey, value] of attempts) {
    if (value.resetAt <= now) attempts.delete(attemptKey)
  }
  const current = attempts.get(key)
  if (!current || current.resetAt <= now) {
    if (attempts.size >= maximumTrackedAddresses) {
      const oldestKey = attempts.keys().next().value
      if (oldestKey) attempts.delete(oldestKey)
    }
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }
  if (current.count >= maximumAttempts) {
    return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) }
  }
  current.count += 1
  return { allowed: true, retryAfter: 0 }
}
