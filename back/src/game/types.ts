import type { ErrorCode, Phase } from "../../../shared/protocol";

// État interne : jamais envoyé tel quel au client (voir toPublicRoom).

export interface Player {
  id: string;
  name: string;
  teamId: string;
  token: string;
}

export interface Team {
  id: string;
  name: string;
  point: number;
  locked: boolean;
  players: Player[];
}

export interface Buzz {
  round: number;
  teamId: string;
  playerId: string;
  at: number;
  expiresAt: number | null;
}

export interface Room {
  id: string;
  phase: Phase;
  round: number;
  teams: Team[];
  buzz: Buzz | null;
  /** playerId -> timestamp jusqu'auquel le joueur ne peut plus buzzer. */
  penalties: Map<string, number>;
}

export interface GameRules {
  /** Durée de réponse avant réouverture automatique ; 0 = jamais. */
  answerTimeoutMs: number;
  /** Pénalité appliquée à chaque appui quand le buzzer est fermé. */
  falseStartPenaltyMs: number;
}

export class GameError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly retryInMs?: number
  ) {
    super(code);
  }
}
