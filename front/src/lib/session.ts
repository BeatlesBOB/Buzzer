import type { Session } from "../../../shared/protocol";

// sessionStorage : survit au rechargement, et chaque onglet peut jouer un rôle différent.
const KEY = "buzzer:session";

export const loadSession = (): Session | null => {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    return value && typeof value.token === "string" ? value : null;
  } catch {
    return null;
  }
};

export const saveSession = (session: Session | null) => {
  try {
    if (session) sessionStorage.setItem(KEY, JSON.stringify(session));
    else sessionStorage.removeItem(KEY);
  } catch {
    // stockage indisponible (navigation privée…) : on garde la session en mémoire seulement
  }
};
