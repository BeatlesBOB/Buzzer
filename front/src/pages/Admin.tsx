import { useContext, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { Room, Team, User } from "../types/interfaces";
import useSocket from "../hook/useSocket";

export default function Admin() {
  const { room, isAdmin, setTeams } = useContext(GameContext);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
  const { dispatch, subscribe, unSubscribe } = useSocket();
  const [teamAnswer, setTeamAnswer] = useState<Team | undefined>(undefined);

  useEffect(() => {
    subscribe("room:join", (_socket, payload) => {
      setTeams(payload.room.teams ?? []);
    });

    subscribe("game:status", (_socket, payload) => {
      setTeams(payload.room.teams ?? []);
    });

    subscribe("room:leave", (_socket, payload) => {
      setTeams(payload.room.teams ?? []);
    });

    subscribe("game:answer", (_socket, payload) => {
      const { room }: { room: Room } = payload;
      const index = room.teams.findIndex((team: Team) => {
        team.hasBuzzed === true;
      });

      if (index !== -1) {
        setTeamAnswer(room.teams[index]);
        setIsOpen(true);
      }
    });

    return () => {
      unSubscribe("room:join");
      unSubscribe("game:status");
      unSubscribe("room:leave");
      unSubscribe("game:answer");
    };
  }, [setTeams, subscribe, unSubscribe]);

  const resetTeamBuzzer = (team: Team) => {
    dispatch("game:buzzer:reset:team", { id: room?.id, teamId: team.id });
  };

  const updateTeamPoint = (team: Team, point: number) => {
    dispatch("game:status", { id: room?.id, teamId: team.id, point });
  };

  const startGame = () => {
    dispatch("room:start", { id: room?.id });
  };

  const resetAllBuzzer = () => {
    dispatch("game:buzzer:reset", { id: room?.id });
  };

  const resetAllPoints = () => {
    dispatch("game:point:reset", { id: room?.id });
  };

  return (
    <>
      <div className="grid grid-cols-2 h-dvh">
        <Users
          resetTeamBuzzer={resetTeamBuzzer}
          leaveTeam={(team) => setSelectedTeam(team)}
          isAdmin={isAdmin}
          teams={room?.teams}
          updateTeamPoint={updateTeamPoint}
        />
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <h1 className="pointer-events-none font-primary font-black text-shadow text-9xl drop-shadow-3xl text-center text-white">
            Buzzer
          </h1>
          <QRCode value={room?.id || ""} />
          <div className="flex gap-2 wrap">
            <Button
              label="Reset tous les buzzer"
              handleClick={resetAllBuzzer}
            />
            <Button
              label="Reset tous les points"
              handleClick={resetAllPoints}
            />
            <Button label="Start" handleClick={startGame} />
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        {selectedTeam && (
          <>
            <ul>
              {selectedTeam?.users.map((user: User) => {
                return <li onClick={() => {}}>{user.name}</li>;
              })}
            </ul>
            <Button
              label="Delete team"
              handleClick={() => {
                dispatch("room:leave", { teamId: selectedTeam?.id });
              }}
            />
          </>
        )}
        {teamAnswer && (
          <>
            <h1>{teamAnswer.name}</h1>
            <h2>{teamAnswer.point}</h2>
          </>
        )}
      </Modal>
    </>
  );
}
