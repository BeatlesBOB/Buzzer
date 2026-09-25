import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicRoom, Session } from "../../../shared/protocol";
import { GameContext, type GameContextValue } from "./gameContextValue";
import useSocketEvent from "../hook/useSocketEvent";
import useToasts from "../hook/useToasts";
import { ERROR_TITLE } from "../lib/errors";
import { loadSession, saveSession } from "../lib/session";
import { request, socket } from "../lib/socket";

/**
 * Seul endroit qui écoute l'état de la partie. Les pages lisent le contexte
 * et envoient des actions via `request`, sans gérer d'abonnements.
 */
export default function GameProvider({ children }: { children: ReactNode }) {
  const { pushToast } = useToasts();
  const [connected, setConnected] = useState(socket.connected);
  const [readyRoomId, setReadyRoomId] = useState<string | null>(null);
  const [session, setSessionState] = useState<Session | null>(loadSession);
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [clockOffset, setClockOffset] = useState(0);

  const sessionRef = useRef(session);
  const watchedRef = useRef<string | null>(null);

  const setSession = useCallback((next: Session | null) => {
    sessionRef.current = next;
    saveSession(next);
    setSessionState(next);
  }, []);

  const applyRoom = useCallback((next: PublicRoom) => {
    setRoom(next);
    setClockOffset(next.serverTime - Date.now());
  }, []);

  /** Rattache le socket à sa session (ou à la room regardée) après chaque (re)connexion. */
  const restore = useCallback(async () => {
    const target = sessionRef.current?.roomId ?? watchedRef.current;
    const current = sessionRef.current;
    if (current) {
      const res = await request("session:resume", { token: current.token });
      if (res.ok) {
        setSession(res.data.session);
        applyRoom(res.data.room);
      } else if (res.error === "SESSION_INVALID" || res.error === "ROOM_NOT_FOUND") {
        watchedRef.current = current.roomId;
        setSession(null);
      }
    }
    if (!sessionRef.current && watchedRef.current) {
      const res = await request("room:watch", { roomId: watchedRef.current });
      if (res.ok) applyRoom(res.data.room);
      else setRoom(null);
    }
    if (target === (sessionRef.current?.roomId ?? watchedRef.current)) setReadyRoomId(target);
  }, [applyRoom, setSession]);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      restore();
    };
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) onConnect();
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [restore]);

  useSocketEvent("room:state", (next) => {
    if (next.id === (sessionRef.current?.roomId ?? watchedRef.current)) applyRoom(next);
  });

  useSocketEvent("session:revoked", ({ reason }) => {
    watchedRef.current = reason === "room_closed" ? null : sessionRef.current?.roomId ?? null;
    setSession(null);
    if (reason === "room_closed") setRoom(null);
    pushToast({
      title: ERROR_TITLE,
      desc: reason === "room_closed" ? "La partie a été fermée" : "Tu t'es fait sortir de l'équipe",
    });
  });

  const startSession = useCallback(
    (next: Session, nextRoom?: PublicRoom) => {
      watchedRef.current = next.roomId;
      setSession(next);
      if (nextRoom) applyRoom(nextRoom);
    },
    [applyRoom, setSession]
  );

  const watch = useCallback(
    (roomId: string) => {
      if (sessionRef.current?.roomId === roomId) return;
      // Aller dans le lobby d'une autre partie = quitter la précédente
      if (sessionRef.current) setSession(null);
      watchedRef.current = roomId;
      setRoom(null);
      setReadyRoomId(null);
      if (socket.connected) restore();
    },
    [restore, setSession]
  );

  const forgetSession = useCallback(() => {
    watchedRef.current = sessionRef.current?.roomId ?? watchedRef.current;
    setSession(null);
  }, [setSession]);

  const leave = useCallback(() => {
    watchedRef.current = null;
    setSession(null);
    setRoom(null);
    setReadyRoomId(null);
  }, [setSession]);

  const value = useMemo<GameContextValue>(() => {
    const myTeam = room?.teams.find((t) => t.players.some((p) => p.id === session?.playerId)) ?? null;
    const me = myTeam?.players.find((p) => p.id === session?.playerId) ?? null;
    return { connected, readyRoomId, session, room, clockOffset, me, myTeam, startSession, watch, forgetSession, leave };
  }, [connected, readyRoomId, session, room, clockOffset, startSession, watch, forgetSession, leave]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
