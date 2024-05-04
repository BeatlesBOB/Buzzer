import { useContext, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { Room, Team, User } from "../types/interfaces";
import useSocket from "../hook/useSocket";
import Title from "../components/Title";

export default function Admin() {
  const { room, isAdmin, setRoom } = useContext(GameContext);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
  const { dispatch, subscribe, unSubscribe } = useSocket();
  const [teamAnswer, setTeamAnswer] = useState<Team | undefined>(undefined);

  useEffect(() => {
    const handleTeamsUpdate = (payload: { room: Room }) => {
      const { room } = payload;
      setRoom(room);
    };

    const handleAnswer = (payload: { team: Team }) => {
      const { team } = payload;
      setTeamAnswer(team);
      setIsOpen(true);
    };

    subscribe("room:join", handleTeamsUpdate);
    subscribe("room:start", handleTeamsUpdate);
    subscribe("game:status", handleTeamsUpdate);
    subscribe("room:leave", handleTeamsUpdate);
    subscribe("game:answer", handleAnswer);
    subscribe("room:pause", handleTeamsUpdate);

    return () => {
      unSubscribe("room:join", handleTeamsUpdate);
      unSubscribe("game:status", handleTeamsUpdate);
      unSubscribe("room:leave", handleTeamsUpdate);
      unSubscribe("room:start", handleTeamsUpdate);
      unSubscribe("room:pause", handleTeamsUpdate);
      unSubscribe("game:answer", handleAnswer);
    };
  }, []);

  const resetTeamBuzzer = (team: Team) => {
    dispatch("game:buzzer:reset:team", { team: team.id });
  };

  const updateTeamPoint = (team: Team, point: number) => {
    dispatch("game:point", { team: team.id, point });
  };

  const startGame = () => {
    dispatch("room:start");
  };

  const pauseGame = () => {
    dispatch("room:pause");
  };

  const resetAllBuzzer = () => {
    dispatch("game:buzzer:reset");
  };

  const resetAllPoints = () => {
    dispatch("game:point:reset");
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 h-dvh p-5">
        <Users
          resetTeamBuzzer={resetTeamBuzzer}
          leaveTeam={(team) => setSelectedTeam(team)}
          isAdmin={isAdmin}
          teams={room?.teams}
          updateTeamPoint={updateTeamPoint}
        />
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <Title />
          <QRCode value={room?.id || ""} />
          <div className="flex gap-2 flex-wrap justify-center">
            <div className="basis-full flex justify-center">
              <Button
                classes={
                  "bg-black px-10 text-white py-2.5 border border-black hover:bg-transparent hover:text-black"
                }
                label={room?.hasStarted ? "Pause" : "Start"}
                handleClick={room?.hasStarted ? pauseGame : startGame}
              />
            </div>

            <Button
              label="Reset tous les buzzer"
              handleClick={resetAllBuzzer}
            />
            <Button
              label="Reset tous les points"
              handleClick={resetAllPoints}
            />
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-5">
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
            <div className="flex flex-col gap-5">
              <h1 className="font-semibold text-lg">{teamAnswer.name}</h1>
              <h2 className="font-medium text-md">{teamAnswer.point}</h2>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
