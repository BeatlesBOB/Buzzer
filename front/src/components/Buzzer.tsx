import { useContext, useEffect } from "react";
import { SocketContext } from "../contexts/SocketProvider";
import { GameContext } from "../contexts/GameProvider";
import { useParams } from "react-router-dom";
import Users from "./Users";
import { Team } from "../utils/interfaces";

export default function Buzzer() {
  const socket = useContext(SocketContext);
  const { isAdmin, teams } = useContext(GameContext) || {};
  const { id } = useParams();
  useEffect(() => {}, []);

  const joinOrCreateATeam = (
    team: Team | null = null,
    name: string | null = null
  ) => {
    socket.emit("room:join", { id, teamId: team?.id, name });
  };

  return (
    <div className="grid grid-cols-[1fr_max-content_1fr]">
      <Users teams={teams} isAdmin={isAdmin} joinTeam={joinOrCreateATeam} />
    </div>
  );
}
