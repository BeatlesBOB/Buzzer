// Contrat socket.io partagé entre le front et le back.
// Fichier de déclarations uniquement (.d.ts) : il n'est jamais compilé,
// on l'importe avec `import type` des deux côtés.

/**
 * Phase de la partie :
 * - lobby  : les équipes se forment, le buzzer n'existe pas encore
 * - open   : le buzzer est ouvert, le premier qui appuie gagne
 * - locked : quelqu'un a buzzé, plus personne ne peut buzzer
 * - paused : buzzer fermé (question en cours de lecture…) — appuyer = faux départ
 */
export type Phase = "lobby" | "open" | "locked" | "paused";

export type Role = "admin" | "player";

export interface PublicPlayer {
  id: string;
  name: string;
  teamId: string;
  connected: boolean;
}

export interface PublicTeam {
  id: string;
  name: string;
  point: number;
  /** Équipe bloquée par l'admin (mauvaise réponse…) : ne peut plus buzzer. */
  locked: boolean;
  players: PublicPlayer[];
}

export interface PublicBuzz {
  round: number;
  teamId: string;
  playerId: string;
  /** Timestamp serveur du buzz. */
  at: number;
  /** Timestamp serveur de réouverture automatique, null si désactivée. */
  expiresAt: number | null;
}

export interface PublicRoom {
  id: string;
  phase: Phase;
  /** Incrémenté à chaque ouverture du buzzer. */
  round: number;
  teams: PublicTeam[];
  buzz: PublicBuzz | null;
  /** Heure serveur au moment de l'envoi, pour corriger le décalage d'horloge client. */
  serverTime: number;
}

/** Ce que le client garde en sessionStorage pour se reconnecter. Le token ne doit jamais être diffusé. */
export interface Session {
  token: string;
  roomId: string;
  role: Role;
  /** Id public du joueur (null pour l'admin). */
  playerId: string | null;
}

export type ErrorCode =
  | "INVALID_PAYLOAD"
  | "RATE_LIMITED"
  | "INTERNAL"
  | "ROOM_NOT_FOUND"
  | "SESSION_INVALID"
  | "NOT_ADMIN"
  | "NOT_PLAYER"
  | "ALREADY_IN_TEAM"
  | "TEAM_NOT_FOUND"
  | "PLAYER_NOT_FOUND"
  | "GAME_RUNNING"
  | "GAME_NOT_RUNNING"
  | "NO_BUZZ"
  | "TEAM_LOCKED"
  | "FALSE_START"
  | "PENALIZED"
  | "TOO_LATE"
  | "ROOM_FULL"
  // Côté client uniquement
  | "DISCONNECTED"
  | "TIMEOUT";

export type AckResponse<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: ErrorCode; /** Durée de pénalité restante, en ms. */ retryInMs?: number };

export type Ack<T = null> = (res: AckResponse<T>) => void;

export interface ClientToServerEvents {
  // Session
  "room:create": (ack: Ack<{ session: Session; room: PublicRoom }>) => void;
  "session:resume": (p: { token: string }, ack: Ack<{ session: Session; room: PublicRoom }>) => void;
  /** Rejoindre une room en spectateur (lobby) pour recevoir son état. */
  "room:watch": (p: { roomId: string }, ack: Ack<{ room: PublicRoom }>) => void;

  // Joueur
  "team:create": (p: { roomId: string; teamName: string; playerName: string }, ack: Ack<{ session: Session }>) => void;
  "team:join": (p: { roomId: string; teamId: string; playerName: string }, ack: Ack<{ session: Session }>) => void;
  "team:leave": (ack: Ack) => void;
  "buzzer:press": (ack: Ack) => void;

  // Admin
  "room:close": (ack: Ack) => void;
  "game:open": (ack: Ack) => void;
  "game:pause": (ack: Ack) => void;
  /** Juger la réponse en cours. correct: +1 point et pause ; faux: équipe bloquée et réouverture. */
  "buzzer:judge": (p: { correct: boolean }, ack: Ack) => void;
  /** Rouvre le buzzer sans juger. */
  "buzzer:release": (ack: Ack) => void;
  /** Débloque toutes les équipes et rouvre le buzzer si quelqu'un avait buzzé. */
  "buzzer:reset": (ack: Ack) => void;
  "team:lock": (p: { teamId: string; locked: boolean }, ack: Ack) => void;
  "team:kick": (p: { teamId: string }, ack: Ack) => void;
  "player:kick": (p: { playerId: string }, ack: Ack) => void;
  "score:set": (p: { teamId: string; point: number }, ack: Ack) => void;
  "score:reset": (ack: Ack) => void;
}

export interface ServerToClientEvents {
  "room:state": (room: PublicRoom) => void;
  /** Événement ponctuel (son côté admin) ; l'état complet arrive via room:state. */
  "buzzer:buzzed": (p: { teamName: string; playerName: string }) => void;
  /** La session de ce client n'est plus valide (exclu, room fermée). */
  "session:revoked": (p: { reason: "kicked" | "room_closed" }) => void;
}
