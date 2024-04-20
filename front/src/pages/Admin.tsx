import { useContext, useEffect } from "react";
import QRCode from "react-qr-code";
import { SocketContext } from "../contexts/SocketContextProvider";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Button from "../components/Button";
import { parseTeams } from "../utils/utils";

export default function Admin() {
  const socket = useContext(SocketContext);
  const { room, setTeams } = useContext(GameContext);

  // useEffect(() => {
  //   socket.on("room:join", (payload) => {
  //     setTeams?.(parseTeams(JSON.parse(payload.room).teams) ?? []);
  //   });

  //   socket.on("game:status", (payload) => {
  //     setTeams?.(parseTeams(JSON.parse(payload.room).teams) ?? []);
  //   });

  //   return () => {
  //     socket.off("room:join");
  //     socket.off("game:status");
  //   };
  // }, [setTeams, socket]);

  return (
    <div className="grid grid-cols-2 h-dvh">
      <Users />
      <div className="flex flex-col items-center justify-center gap-6 h-full">
        <h1 className="pointer-events-none font-primary font-black text-shadow text-9xl drop-shadow-3xl text-center text-white">
          Buzzer
        </h1>
        <QRCode value={room?.id || ""} />
        <div className="flex gap-2 wrap">
          <Button label="Reset tous les buzzer" handleClick={resetAllBuzzer} />
          <Button label="Reset tous les points" handleClick={resetAllPoints} />
          <Button label="Start" handleClick={startGame} />
        </div>
      </div>
    </div>
  );
}
