import { io, Socket } from "socket.io-client";
import type { Ack, AckResponse, ClientToServerEvents, ServerToClientEvents } from "../../../shared/protocol";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

type Params<E extends keyof ClientToServerEvents> = Parameters<ClientToServerEvents[E]>;
type Args<E extends keyof ClientToServerEvents> = Params<E> extends [...infer A, unknown] ? A : never;
type Data<E extends keyof ClientToServerEvents> = Params<E> extends [...unknown[], Ack<infer T>] ? T : never;

/**
 * Envoie une action et attend la réponse du serveur.
 * Hors connexion on refuse tout de suite : socket.io mettrait sinon l'action
 * en file et l'enverrait à la reconnexion (un buzz fantôme, par exemple).
 */
export const request = async <E extends keyof ClientToServerEvents>(
  event: E,
  ...args: Args<E>
): Promise<AckResponse<Data<E>>> => {
  if (!socket.connected) return { ok: false, error: "DISCONNECTED" };
  try {
    // Le typage générique de emitWithAck ne sait pas retirer l'ack d'une union d'événements.
    const emitter = socket.timeout(5000) as unknown as {
      emitWithAck: (event: E, ...args: Args<E>) => Promise<AckResponse<Data<E>>>;
    };
    return await emitter.emitWithAck(event, ...args);
  } catch {
    return { ok: false, error: "TIMEOUT" };
  }
};
