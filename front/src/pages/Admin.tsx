import { useContext, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { Team, User } from "../types/interfaces";
import useSocket from "../hook/useSocket";

export default function Admin() {
  const {
    room,
    teams,
    startGame,
    resetAllBuzzer,
    resetAllPoints,
    updateTeamPoint,
    isAdmin,
    setTeams,
  } = useContext(GameContext);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
  const { dispatch, subscribe, unSubscribe } = useSocket();

  useEffect(() => {
    subscribe("room:join", (socket, payload) => {
      setTeams(payload.room.teams ?? []);
    });

    subscribe("game:status", (socket, payload) => {
      setTeams(payload.room.teams ?? []);
    });

    return () => {
      unSubscribe("room:join");
      unSubscribe("game:status");
    };
  }, [setTeams, subscribe, unSubscribe]);

  return (
    <>
      <div className="grid grid-cols-2 h-dvh">
        <Users
          leaveTeam={(team) => setSelectedTeam(team)}
          isAdmin={isAdmin}
          teams={teams}
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
        <ul>
          {selectedTeam?.users.map((user: User) => {
            return <li onClick={() => {}}>{user.name}</li>;
          })}
        </ul>
        <Button
          label="Delete team"
          handleClick={() => {
            dispatch("room:leave");
          }}
        />
      </Modal>
    </>
  );
}
