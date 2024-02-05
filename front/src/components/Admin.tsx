import { useContext, useEffect } from "react";
import QRCode from "react-qr-code";
import { SocketContext } from "../contexts/SocketProvider";
import { GameContext } from "../contexts/GameProvider";
import { Team } from "../utils/interfaces";
import Users from "./Users";

export default function Admin() {
  const socket = useContext(SocketContext);
  const { room, isAdmin, setTeams, teams } = useContext(GameContext) || {};

  useEffect(() => {
    socket.on("room:join", (payload) => {
      setTeams?.(JSON.parse(payload.room).teams);
    });

    socket.on("game:status", (payload) => {
      setTeams?.(JSON.parse(payload.room).teams);
    });

    return () => {
      socket.off("room:join");
      socket.off("game:status");
    };
  }, [setTeams, socket]);

  const updateTeamPoint = (team: Team, point: number) => {
    socket.emit("game:status", { id: room?.id, teamId: team.id, point });
  };

  const resetBuzzer = () => {
    socket.emit("game:buzzer:reset", { id: room?.id });
  };

  const resetTeamBuzzer = (team: Team) => {
    socket.emit("game:buzzer:reset:team", { id: room?.id, teamId: team.id });
  };

  const resetPoint = () => {
    socket.emit("game:point:reset", { id: room?.id });
  };

  return (
    <div className="grid grid-cols-2  min-h-dvh">
      <Users
        teams={teams}
        resetTeamBuzzer={resetTeamBuzzer}
        updateTeamPoint={updateTeamPoint}
        isAdmin={isAdmin}
      />
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="pointer-events-none font-primary font-black text-shadow text-9xl drop-shadow-3xl text-center text-white">
          Buzzer
        </h1>
        <QRCode value={room?.id || ""} />
        <div className="flex gap-2 wrap">
          <button
            onClick={resetBuzzer}
            className="font-primary font-regular underline"
          >
            Reset tout les buzzer
          </button>

          <button
            onClick={resetPoint}
            className="font-primary font-regular underline"
          >
            Reset tout les points
          </button>
        </div>
      </div>
    </div>
  );
}
