import { useContext, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router-dom";
import { SocketContext } from "../contexts/SocketProvider";
import { Team } from "../utils/interfaces";

export default function Room() {
  const { id } = useParams();
  const socket = useContext(SocketContext);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    socket.on("room:join", (payload) => {
      setTeams(JSON.parse(payload.room).teams);
    });

    return () => {
      socket.off("room:join");
    };
  }, [socket]);

  return (
    <div className="grid grid-cols-2  min-h-dvh">
      <ul>
        {teams.map((team: Team) => {
          return <li key={team.id}>{team.name}</li>;
        })}
      </ul>
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="pointer-events-none font-primary font-black text-shadow text-9xl drop-shadow-3xl text-center text-white">
          Buzzer
        </h1>
        <QRCode value={id || ""} />
      </div>
    </div>
  );
}
