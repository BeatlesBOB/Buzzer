import { useEffect, useState } from "react";

/** Date.now() rafraîchi toutes les `intervalMs` tant que `active` est vrai. */
export default function useNow(active: boolean, intervalMs = 100) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
  return now;
}
