import { AddressInfo } from "net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { io as connect, Socket } from "socket.io-client";
import type { AckResponse, ClientToServerEvents, PublicRoom, ServerToClientEvents, Session } from "../../shared/protocol";
import { createApp } from "../src/app";
import { loadConfig } from "../src/config";

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

let server: ReturnType<typeof createApp>;
let url: string;
const clients: Client[] = [];

beforeAll(async () => {
  server = createApp({ ...loadConfig({}), rules: { answerTimeoutMs: 0, falseStartPenaltyMs: 500 } });
  await new Promise<void>((resolve) => server.httpServer.listen(0, resolve));
  url = `http://localhost:${(server.httpServer.address() as AddressInfo).port}`;
});

afterAll(async () => {
  clients.forEach((c) => c.disconnect());
  await server.stop();
});

const client = async () => {
  const socket: Client = connect(url, { transports: ["websocket"], forceNew: true });
  clients.push(socket);
  await new Promise((resolve) => socket.once("connect", () => resolve(null)));
  return socket;
};

const call = <T = null>(socket: Client, event: string, ...args: unknown[]): Promise<AckResponse<T>> =>
  (socket as any).timeout(2000).emitWithAck(event, ...args);

const data = <T>(res: AckResponse<T>): T => {
  if (!res.ok) throw new Error(res.error);
  return res.data;
};

const setupGame = async (teams: number) => {
  const admin = await client();
  const { room } = data(await call<{ session: Session; room: PublicRoom }>(admin, "room:create"));
  const players: Client[] = [];
  for (let i = 0; i < teams; i++) {
    const p = await client();
    data(await call(p, "team:create", { roomId: room.id, teamName: `team${i}`, playerName: `p${i}` }));
    players.push(p);
  }
  return { admin, room, players };
};

describe("socket", () => {
  it("10 équipes buzzent au même instant : un seul gagnant", async () => {
    const { admin, players } = await setupGame(10);
    data(await call(admin, "game:open"));

    const results = await Promise.all(players.map((p) => call(p, "buzzer:press")));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok).map((r) => !r.ok && r.error)).toEqual(Array(9).fill("TOO_LATE"));
  });

  it("un joueur ne peut pas lancer d'action admin", async () => {
    const { players } = await setupGame(1);
    expect(await call(players[0], "game:open")).toEqual({ ok: false, error: "NOT_ADMIN" });
  });

  it("l'état diffusé ne permet pas de récupérer la session admin", async () => {
    const admin = await client();
    const { session, room } = data(await call<{ session: Session; room: PublicRoom }>(admin, "room:create"));
    const watcher = await client();
    const { room: watched } = data(await call<{ room: PublicRoom }>(watcher, "room:watch", { roomId: room.id }));
    expect(JSON.stringify(watched)).not.toContain(session.token);
  });

  it("des payloads invalides ou un socket sans session ne font pas planter le serveur", async () => {
    const socket = await client();
    (socket as unknown as { emit: (e: string) => void }).emit("team:create"); // sans payload ni ack
    expect(await call(socket, "game:open")).toEqual({ ok: false, error: "SESSION_INVALID" });
    expect(await call(socket, "room:watch", null)).toEqual({ ok: false, error: "INVALID_PAYLOAD" });
    expect(await call(socket, "score:set", { teamId: 1, point: "abc" })).toEqual({ ok: false, error: "SESSION_INVALID" });
    expect((await call(socket, "room:create")).ok).toBe(true);
  });

  it("une session peut être reprise après reconnexion", async () => {
    const { room, players } = await setupGame(1);
    const other = await client();
    const { session } = data(await call<{ session: Session }>(other, "team:create", { roomId: room.id, teamName: "x", playerName: "y" }));
    other.disconnect();
    const again = await client();
    const resumed = data(await call<{ session: Session; room: PublicRoom }>(again, "session:resume", { token: session.token }));
    expect(resumed.session.playerId).toBe(session.playerId);
    expect(players).toHaveLength(1);
  });

  it("le spam est limité côté serveur", async () => {
    const { admin } = await setupGame(0);
    const results = await Promise.all(Array.from({ length: 40 }, () => call(admin, "score:reset")));
    expect(results.some((r) => !r.ok && r.error === "RATE_LIMITED")).toBe(true);
  });
});
