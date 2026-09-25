import type { ErrorCode } from "../../../shared/protocol";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_PAYLOAD: "Données invalides (nom vide ou trop long ?)",
  RATE_LIMITED: "Doucement, tu spammes",
  INTERNAL: "Y'a couille dans le potage",
  ROOM_NOT_FOUND: "Pas de room Bolosse",
  SESSION_INVALID: "Session perdue, reconnecte-toi",
  NOT_ADMIN: "T'es pas le boss de la room !",
  NOT_PLAYER: "Faut être dans une équipe",
  ALREADY_IN_TEAM: "T'es déjà dans une équipe",
  TEAM_NOT_FOUND: "Pas de team Bolosse",
  PLAYER_NOT_FOUND: "Utilisateur perdu 👀",
  GAME_RUNNING: "Trop tard, ça a déjà commencé",
  GAME_NOT_RUNNING: "La game n'a pas commencé, tu vas te calmer direct",
  NO_BUZZ: "Personne n'a buzzé",
  TEAM_LOCKED: "Ton équipe est bloquée pour cette question",
  FALSE_START: "Faux départ !",
  PENALIZED: "Pénalité : arrête de spammer",
  TOO_LATE: "Trop tard, quelqu'un a déjà buzzé",
  ROOM_FULL: "C'est complet, désolé",
  DISCONNECTED: "Pas connecté au serveur",
  TIMEOUT: "Le serveur ne répond pas",
};

export const ERROR_TITLE = "Whooops, nan mais on savait que ça pouvait pas être parfait";
