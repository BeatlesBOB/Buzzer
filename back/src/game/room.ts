import type { PublicRoom } from "../../../shared/protocol";
import { Buzz, GameError, GameRules, Player, Room, Team } from "./types";

// Transitions de la partie. Aucune entrée/sortie ici (ni socket, ni timer) :
// chaque fonction valide puis modifie la room, ou lève une GameError.
// Node exécute un handler à la fois, donc chaque transition est atomique.

export const createRoom = (id: string): Room => ({
  id,
  phase: "lobby",
  round: 0,
  teams: [],
  buzz: null,
  penalties: new Map(),
});

export const MAX_TEAMS = 30;
export const MAX_PLAYERS_PER_TEAM = 15;

const canJoin = (room: Room) => room.phase === "lobby" || room.phase === "paused";

export const findTeam = (room: Room, teamId: string): Team => {
  const team = room.teams.find((t) => t.id === teamId);
  if (!team) throw new GameError("TEAM_NOT_FOUND");
  return team;
};

export const findPlayer = (room: Room, playerId: string): { team: Team; player: Player } => {
  for (const team of room.teams) {
    const player = team.players.find((p) => p.id === playerId);
    if (player) return { team, player };
  }
  throw new GameError("PLAYER_NOT_FOUND");
};

export const addTeam = (room: Room, team: Omit<Team, "players" | "point" | "locked">, player: Player) => {
  if (!canJoin(room)) throw new GameError("GAME_RUNNING");
  if (room.teams.length >= MAX_TEAMS) throw new GameError("ROOM_FULL");
  room.teams.push({ ...team, point: 0, locked: false, players: [{ ...player, teamId: team.id }] });
};

export const addPlayer = (room: Room, teamId: string, player: Player) => {
  if (!canJoin(room)) throw new GameError("GAME_RUNNING");
  const team = findTeam(room, teamId);
  if (team.players.length >= MAX_PLAYERS_PER_TEAM) throw new GameError("ROOM_FULL");
  team.players.push({ ...player, teamId });
};

/** Retire les joueurs donnés ; supprime les équipes vidées. Retourne les joueurs retirés. */
const removePlayers = (room: Room, predicate: (p: Player, t: Team) => boolean): Player[] => {
  const removed: Player[] = [];
  for (const team of room.teams) {
    team.players = team.players.filter((p) => {
      if (!predicate(p, team)) return true;
      removed.push(p);
      room.penalties.delete(p.id);
      return false;
    });
  }
  room.teams = room.teams.filter((t) => t.players.length > 0);

  // Si celui qui avait la main est parti, on rend la main aux autres.
  if (room.buzz && removed.some((p) => p.id === room.buzz!.playerId)) {
    openBuzzer(room);
  }
  return removed;
};

export const removePlayer = (room: Room, playerId: string): Player => {
  findPlayer(room, playerId);
  return removePlayers(room, (p) => p.id === playerId)[0];
};

export const removeTeam = (room: Room, teamId: string): Player[] => {
  findTeam(room, teamId);
  return removePlayers(room, (_p, t) => t.id === teamId);
};

const openBuzzer = (room: Room) => {
  room.phase = "open";
  room.round += 1;
  room.buzz = null;
};

/** Démarre la partie ou rouvre le buzzer après une pause. */
export const open = (room: Room) => {
  if (!canJoin(room)) throw new GameError("GAME_RUNNING");
  openBuzzer(room);
};

export const pause = (room: Room) => {
  if (room.phase !== "open" && room.phase !== "locked") throw new GameError("GAME_NOT_RUNNING");
  room.phase = "paused";
  room.buzz = null;
};

export const press = (room: Room, playerId: string, now: number, rules: GameRules): Buzz => {
  const { team } = findPlayer(room, playerId);
  if (room.phase === "lobby") throw new GameError("GAME_NOT_RUNNING");

  const penalize = (code: "FALSE_START" | "TOO_LATE" | "PENALIZED") => {
    // Chaque appui prolonge la pénalité : spammer ne sert qu'à rester bloqué.
    room.penalties.set(playerId, now + rules.falseStartPenaltyMs);
    return new GameError(code, rules.falseStartPenaltyMs);
  };

  if (now < (room.penalties.get(playerId) ?? 0)) throw penalize("PENALIZED");
  if (room.phase === "paused") throw penalize("FALSE_START");
  if (room.phase === "locked") throw penalize("TOO_LATE");
  if (team.locked) throw new GameError("TEAM_LOCKED");

  room.phase = "locked";
  room.buzz = {
    round: room.round,
    teamId: team.id,
    playerId,
    at: now,
    expiresAt: rules.answerTimeoutMs > 0 ? now + rules.answerTimeoutMs : null,
  };
  return room.buzz;
};

const requireBuzz = (room: Room): Buzz => {
  if (room.phase !== "locked" || !room.buzz) throw new GameError("NO_BUZZ");
  return room.buzz;
};

export const release = (room: Room) => {
  requireBuzz(room);
  openBuzzer(room);
};

export const judge = (room: Room, correct: boolean) => {
  const buzz = requireBuzz(room);
  const team = findTeam(room, buzz.teamId);
  if (correct) {
    team.point += 1;
    room.teams.forEach((t) => (t.locked = false));
    room.phase = "paused";
    room.buzz = null;
  } else {
    team.locked = true;
    openBuzzer(room);
  }
};

/** Appelé par le timer de réponse ; ignoré si la main a déjà changé. */
export const expireBuzz = (room: Room, round: number): boolean => {
  if (room.phase !== "locked" || room.buzz?.round !== round) return false;
  openBuzzer(room);
  return true;
};

export const resetBuzzers = (room: Room) => {
  room.teams.forEach((t) => (t.locked = false));
  if (room.phase === "locked") openBuzzer(room);
};

export const setTeamLocked = (room: Room, teamId: string, locked: boolean) => {
  findTeam(room, teamId).locked = locked;
};

export const setScore = (room: Room, teamId: string, point: number) => {
  findTeam(room, teamId).point = point;
};

export const resetScores = (room: Room) => {
  room.teams.forEach((t) => (t.point = 0));
};

export const toPublicRoom = (room: Room, isConnected: (playerId: string) => boolean, now: number): PublicRoom => ({
  id: room.id,
  phase: room.phase,
  round: room.round,
  buzz: room.buzz && { ...room.buzz },
  serverTime: now,
  teams: room.teams.map((t) => ({
    id: t.id,
    name: t.name,
    point: t.point,
    locked: t.locked,
    players: t.players.map((p) => ({ id: p.id, name: p.name, teamId: p.teamId, connected: isConnected(p.id) })),
  })),
});
