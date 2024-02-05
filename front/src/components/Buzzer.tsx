import { useContext, useEffect } from "react";
import { SocketContext } from "../contexts/SocketProvider";
import { GameContext } from "../contexts/GameProvider";
import { useParams } from "react-router-dom";

export default function Buzzer() {
  const socket = useContext(SocketContext);
  const { room } = useContext(GameContext) || {};
  const { id } = useParams();
  useEffect(() => {}, []);

  const joinOrCreateATeam = (teamId: string | null = null, name: string) => {
    socket.emit("room:join", { id, teamId, name });
  };

  return <div>
    
  </div>;
}
