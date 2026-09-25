import { randomBytes, randomUUID } from "crypto";
import type { Role, Session } from "../../shared/protocol";
import { createRoom } from "./game/room";
import { GameError, Room } from "./game/types";

interface SessionRecord {
  roomId: string;
  role: Role;
  playerId: string | null;
}

export const newId = () => randomUUID();

/** Garde-fou mémoire : un client ne peut pas créer des rooms à l'infini. */
export const MAX_ROOMS = 500;

const newToken = () => randomBytes(24).toString("base64url");

/** État en mémoire du serveur : rooms et sessions (token secret -> identité). */
export class Store {
  readonly rooms = new Map<string, Room>();
  private readonly sessions = new Map<string, SessionRecord>();

  createRoom(): { room: Room; session: Session } {
    if (this.rooms.size >= MAX_ROOMS) throw new GameError("ROOM_FULL");
    const token = newToken();
    const room = createRoom(newId());
    this.rooms.set(room.id, room);
    this.sessions.set(token, { roomId: room.id, role: "admin", playerId: null });
    return { room, session: { token, roomId: room.id, role: "admin", playerId: null } };
  }

  requireRoom(roomId: unknown): Room {
    const room = typeof roomId === "string" ? this.rooms.get(roomId) : undefined;
    if (!room) throw new GameError("ROOM_NOT_FOUND");
    return room;
  }

  /** Crée l'identité d'un nouveau joueur ; le joueur reste à ajouter dans la room. */
  createPlayerSession(roomId: string): Session {
    const token = newToken();
    const playerId = newId();
    this.sessions.set(token, { roomId, role: "player", playerId });
    return { token, roomId, role: "player", playerId };
  }

  resolve(token: unknown): { room: Room; session: Session } {
    const record = typeof token === "string" ? this.sessions.get(token) : undefined;
    const room = record && this.rooms.get(record.roomId);
    if (!record || !room) throw new GameError("SESSION_INVALID");
    return { room, session: { token: token as string, ...record } };
  }

  resolveOrNull(token: unknown) {
    try {
      return this.resolve(token);
    } catch {
      return null;
    }
  }

  revoke(token: string) {
    this.sessions.delete(token);
  }

  deleteRoom(room: Room) {
    this.rooms.delete(room.id);
    for (const [token, record] of this.sessions) {
      if (record.roomId === room.id) this.sessions.delete(token);
    }
  }
}
