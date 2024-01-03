import { useContext, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router-dom";
import { SocketContext } from "../contexts/SocketProvider";
import { GameContext } from "../contexts/GameProvider";
import { Team } from "../utils/interfaces";

export default function Room() {
  const { id } = useParams();
  const socket = useContext(SocketContext);
  const { room } = useContext(GameContext) || {};
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    socket.on("room:join", (payload) => {
      console.log(payload);
      setTeams(JSON.parse(payload.room).teams);
    });

    return () => {
      socket.off("room:join");
    };
  }, [socket]);

  const updateTeamPoint = (team: Team, point: number) => {
    socket.emit("game:status", { id: room?.id, name: team.name, point });
  };

  return (
    <div className="grid grid-cols-2  min-h-dvh">
      <ul className="flex flex-col gap-4 py-4 overflow-y-auto h-dvh">
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          teams.map((team: any) => {
            return (
              <li className="p-5 shadow-lg flex font-primary" key={team[0]}>
                <p className="capitalize  text-lg">{team[1].name}</p>
                <div className="fle ml-auto">
                  <input
                    type="number"
                    value={team[1].point}
                    onChange={(e) => {
                      updateTeamPoint(team[1], parseInt(e.target.value));
                    }}
                  />
                </div>
              </li>
            );
          })
        }
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
