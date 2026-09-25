import { useEffect, useRef } from "react";
import type { ServerToClientEvents } from "../../../shared/protocol";
import { socket } from "../lib/socket";

/** Écoute un événement serveur le temps de vie du composant, avec toujours le dernier handler. */
export default function useSocketEvent<E extends keyof ServerToClientEvents>(event: E, handler: ServerToClientEvents[E]) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = ((...args: Parameters<ServerToClientEvents[E]>) =>
      (handlerRef.current as (...a: typeof args) => void)(...args)) as ServerToClientEvents[E];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event, listener as any);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.off(event, listener as any);
    };
  }, [event]);
}
