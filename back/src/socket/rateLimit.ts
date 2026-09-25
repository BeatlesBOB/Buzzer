/** Token bucket : `capacity` événements en rafale, rechargé de `perSecond` par seconde. */
export const createRateLimiter = (capacity: number, perSecond: number, now = Date.now) => {
  let tokens = capacity;
  let last = now();
  return () => {
    const t = now();
    tokens = Math.min(capacity, tokens + ((t - last) / 1000) * perSecond);
    last = t;
    if (tokens < 1) return false;
    tokens -= 1;
    return true;
  };
};
