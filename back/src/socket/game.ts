import { Server, Socket } from "socket.io";
import type {
  AckResponse,
  ClientToServerEvents,
  ServerToClientEvents,
  Session,
} from "../../../shared/protocol";
import type { Config } from "../config";
import * as game from "../game/room";
import { GameError, Player, Room } from "../game/types";
import { newId, Store } from "../store";
import { createRateLimiter } from "./rateLimit";
import { bool, integer, payload, text } from "./validate";

interface SocketData {
  /** Token de la session attachée à ce socket (admin ou joueur). */
  token?: string;
  /** Room dont ce socket reçoit l'état (session ou spectateur). */
  roomId?: string;
}

export type GameServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

const playerChannel = (playerId: string) => `player:${playerId}`;
const adminChannel = (roomId: string) => `admin:${roomId}`;

/** Branche la logique de jeu sur un serveur socket.io. Retourne une fonction d'arrêt. */
export const attachGame = (io: GameServer, store: Store, config: Config) => {
  const answerTimers = new Map<string, { round: number; timeout: NodeJS.Timeout }>();
  const emptySince = new Map<string, number>();

  const isConnected = (playerId: string) =>
    (io.sockets.adapter.rooms.get(playerChannel(playerId))?.size ?? 0) > 0;

  const toPublic = (room: Room) => game.toPublicRoom(room, isConnected, Date.now());

  /** Un seul timer de réponse par room, lié au round : un vieux timer ne peut plus rouvrir un nouveau buzz. */
  const syncAnswerTimer = (room: Room) => {
    const current = answerTimers.get(room.id);
    const buzz = room.phase === "locked" ? room.buzz : null;
    if (current && current.round === buzz?.round) return;
    if (current) {
      clearTimeout(current.timeout);
      answerTimers.delete(room.id);
    }
    if (!buzz?.expiresAt) return;

    const { round } = buzz;
    const timeout = setTimeout(() => {
      answerTimers.delete(room.id);
      if (store.rooms.get(room.id) === room && game.expireBuzz(room, round)) broadcast(room);
    }, Math.max(0, buzz.expiresAt - Date.now()));
    answerTimers.set(room.id, { round, timeout });
  };

  const broadcast = (room: Room) => {
    syncAnswerTimer(room);
    io.to(room.id).emit("room:state", toPublic(room));
  };

  const revokePlayers = (players: Player[], reason: "kicked" | "room_closed", except?: string) => {
    for (const player of players) {
      store.revoke(player.token);
      const channel = playerChannel(player.id);
      (except ? io.to(channel).except(except) : io.to(channel)).emit("session:revoked", { reason });
      io.in(channel).socketsLeave(channel);
    }
  };

  const closeRoom = (room: Room) => {
    const players = room.teams.flatMap((t) => t.players);
    store.deleteRoom(room);
    clearTimeout(answerTimers.get(room.id)?.timeout);
    answerTimers.delete(room.id);
    emptySince.delete(room.id);
    revokePlayers(players, "room_closed");
    io.to(room.id).emit("session:revoked", { reason: "room_closed" });
    io.in(room.id).socketsLeave([room.id, adminChannel(room.id)]);
  };

  const detach = (socket: GameSocket) => {
    for (const channel of socket.rooms) if (channel !== socket.id) socket.leave(channel);
    socket.data = {};
  };

  const attach = (socket: GameSocket, session: Session) => {
    detach(socket);
    socket.data = { token: session.token, roomId: session.roomId };
    socket.join(session.roomId);
    socket.join(session.playerId ? playerChannel(session.playerId) : adminChannel(session.roomId));
  };

  const requireSession = (socket: GameSocket) => store.resolve(socket.data.token);

  const requireAdmin = (socket: GameSocket) => {
    const { room, session } = requireSession(socket);
    if (session.role !== "admin") throw new GameError("NOT_ADMIN");
    return room;
  };

  const requirePlayer = (socket: GameSocket) => {
    const { room, session } = requireSession(socket);
    if (session.role !== "player" || !session.playerId) throw new GameError("NOT_PLAYER");
    return { room, session, ...game.findPlayer(room, session.playerId) };
  };

  /** Crée la session d'un joueur puis l'ajoute à la room ; annule la session si l'ajout échoue. */
  const joinAsPlayer = (socket: GameSocket, room: Room, add: (player: Player) => void) => {
    const current = socket.data.token ? store.resolveOrNull(socket.data.token) : null;
    if (current?.room === room) throw new GameError("ALREADY_IN_TEAM");

    const session = store.createPlayerSession(room.id);
    try {
      add({ id: session.playerId!, name: "", teamId: "", token: session.token });
    } catch (error) {
      store.revoke(session.token);
      throw error;
    }
    attach(socket, session);
    broadcast(room);
    return { session };
  };

  io.on("connection", (socket: GameSocket) => {
    const allow = createRateLimiter(20, 10);

    // Un client qui spamme ne peut pas saturer le serveur : les événements en trop sont ignorés.
    socket.use((packet, next) => {
      if (allow()) return next();
      const ack = packet[packet.length - 1];
      if (typeof ack === "function") ack({ ok: false, error: "RATE_LIMITED" } satisfies AckResponse);
    });

    /** Enregistre un handler : toute exception devient une réponse d'erreur, jamais un crash du process. */
    const on = (event: keyof ClientToServerEvents, handler: (p: unknown) => unknown) => {
      (socket as unknown as Socket).on(event, (...args: unknown[]) => {
        const ack = typeof args[args.length - 1] === "function" ? (args.pop() as (r: AckResponse<unknown>) => void) : undefined;
        try {
          const data = handler(args[0]);
          ack?.({ ok: true, data: data ?? null });
        } catch (error) {
          if (error instanceof GameError) {
            ack?.({ ok: false, error: error.code, retryInMs: error.retryInMs });
          } else {
            console.error(`[${event}]`, error);
            ack?.({ ok: false, error: "INTERNAL" });
          }
        }
      });
    };

    // SESSION

    on("room:create", () => {
      const { room, session } = store.createRoom();
      attach(socket, session);
      return { session, room: toPublic(room) };
    });

    on("session:resume", (p) => {
      const { room, session } = store.resolve(payload(p).token);
      if (session.playerId && !room.teams.some((t) => t.players.some((pl) => pl.id === session.playerId))) {
        store.revoke(session.token);
        throw new GameError("SESSION_INVALID");
      }
      attach(socket, session);
      broadcast(room);
      return { session, room: toPublic(room) };
    });

    on("room:watch", (p) => {
      const room = store.requireRoom(payload(p).roomId);
      detach(socket);
      socket.data = { roomId: room.id };
      socket.join(room.id);
      return { room: toPublic(room) };
    });

    // JOUEUR

    on("team:create", (p) => {
      const { roomId, teamName, playerName } = payload(p);
      const room = store.requireRoom(roomId);
      const team = { id: newId(), name: text(teamName) };
      const name = text(playerName);
      return joinAsPlayer(socket, room, (player) => game.addTeam(room, team, { ...player, name }));
    });

    on("team:join", (p) => {
      const { roomId, teamId, playerName } = payload(p);
      const room = store.requireRoom(roomId);
      const name = text(playerName);
      return joinAsPlayer(socket, room, (player) => game.addPlayer(room, text(teamId, 64), { ...player, name }));
    });

    on("team:leave", () => {
      const { room, player } = requirePlayer(socket);
      game.removePlayer(room, player.id);
      revokePlayers([player], "kicked", socket.id);
      socket.data = { roomId: room.id };
      broadcast(room);
    });

    on("buzzer:press", () => {
      const { room, team, player } = requirePlayer(socket);
      game.press(room, player.id, Date.now(), config.rules);
      broadcast(room);
      io.to(room.id).emit("buzzer:buzzed", { teamName: team.name, playerName: player.name });
    });

    // ADMIN

    const admin = (event: keyof ClientToServerEvents, action: (room: Room, p: unknown) => void) =>
      on(event, (p) => {
        const room = requireAdmin(socket);
        action(room, p);
        if (store.rooms.has(room.id)) broadcast(room);
      });

    admin("room:close", (room) => closeRoom(room));
    admin("game:open", (room) => game.open(room));
    admin("game:pause", (room) => game.pause(room));
    admin("buzzer:judge", (room, p) => game.judge(room, bool(payload(p).correct)));
    admin("buzzer:release", (room) => game.release(room));
    admin("buzzer:reset", (room) => game.resetBuzzers(room));
    admin("team:lock", (room, p) => {
      const { teamId, locked } = payload(p);
      game.setTeamLocked(room, text(teamId, 64), bool(locked));
    });
    admin("team:kick", (room, p) => {
      revokePlayers(game.removeTeam(room, text(payload(p).teamId, 64)), "kicked");
    });
    admin("player:kick", (room, p) => {
      revokePlayers([game.removePlayer(room, text(payload(p).playerId, 64))], "kicked");
    });
    admin("score:set", (room, p) => {
      const { teamId, point } = payload(p);
      game.setScore(room, text(teamId, 64), integer(point, -9999, 9999));
    });
    admin("score:reset", (room) => game.resetScores(room));

    socket.on("disconnect", () => {
      const room = socket.data.roomId ? store.rooms.get(socket.data.roomId) : undefined;
      if (room) broadcast(room); // met à jour les indicateurs "connecté"
    });
  });

  // Nettoyage des rooms abandonnées (sinon la mémoire ne fait que grossir).
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const room of store.rooms.values()) {
      if ((io.sockets.adapter.rooms.get(room.id)?.size ?? 0) > 0) {
        emptySince.delete(room.id);
        continue;
      }
      const since = emptySince.get(room.id) ?? now;
      emptySince.set(room.id, since);
      if (now - since >= config.roomTtlMs) closeRoom(room);
    }
  }, 60_000);
  sweep.unref();

  return () => {
    clearInterval(sweep);
    answerTimers.forEach(({ timeout }) => clearTimeout(timeout));
    answerTimers.clear();
  };
};
