import { useContext, useEffect } from "react";
import QRCode from "react-qr-code";
import { SocketContext } from "../contexts/SocketContextProvider";
import { GameContext } from "../contexts/GameContextProvider";
import { Team } from "../utils/interfaces";
import Users from "../components/Users";
import Button from "../components/Button";

export default function Admin() {
  const socket = useContext(SocketContext);
  const { room, isAdmin, setTeams, teams } = useContext(GameContext) || {};

  useEffect(() => {
    socket.on("room:join", (payload) => {
      setTeams?.(parseTeams(JSON.parse(payload.room).teams) ?? []);
    });

    socket.on("game:status", (payload) => {
      setTeams?.(parseTeams(JSON.parse(payload.room).teams) ?? []);
    });

    return () => {
      socket.off("room:join");
      socket.off("game:status");
    };
  }, [setTeams, socket]);

  const parseTeams = (data: [[id: string, team: Team]]): Team[] => {
    return data.map((teamMap) => {
      return teamMap[1];
    });
  };

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
          <Button label="Reset tous les buzzer" handleClick={resetBuzzer} />
          <Button label="Reset tous les points" handleClick={resetPoint} />
        </div>
      </div>
    </div>
  );
}
