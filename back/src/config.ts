import type { GameRules } from "./game/types";

export interface Config {
  port: number;
  corsOrigins: string[];
  rules: GameRules;
  /** Supprime une room restée sans aucune connexion pendant ce délai. */
  roomTtlMs: number;
  adminUi: { username: string; password: string } | null;
}

const int = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => ({
  port: int(env.PORT ?? env.APP_PORT, 3000),
  corsOrigins: (env.FRONTEND_URL ?? "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  rules: {
    answerTimeoutMs: int(env.ANSWER_TIMEOUT_MS ?? env.TIMEOUT_ANSWER, 15000),
    falseStartPenaltyMs: int(env.FALSE_START_PENALTY_MS, 1500),
  },
  roomTtlMs: int(env.ROOM_TTL_MS, 30 * 60 * 1000),
  adminUi:
    env.ADMIN_UI_USERNAME && env.ADMIN_UI_PASSWORD
      ? { username: env.ADMIN_UI_USERNAME, password: env.ADMIN_UI_PASSWORD }
      : null,
});
