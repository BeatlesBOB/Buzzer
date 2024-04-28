import { FormEvent, useContext, useEffect, useState } from "react";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Modal from "../components/Modal";
import Button from "../components/Button";
import useSocket from "../hook/useSocket";
import { Navigate } from "react-router-dom";
import { Team } from "../types/interfaces";

export default function Lobby() {
  const { dispatch } = useSocket();
  const { isAdmin, room, setisGameStarted, isGameStarted } =
    useContext(GameContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { subscribe, unSubscribe } = useSocket();

  const handleTeamCreation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    joinOrCreateATeam(
      { name: formData.get("team")?.toString() },
      formData.get("user")?.toString()
    );
  };

  const joinOrCreateATeam = (
    team: Partial<Team>,
    userName: string | null = null
  ) => {
    dispatch("room:join", {
      userName,
      teamName: team.name,
      teamId: team.id,
    });
  };

  useEffect(() => {
    subscribe("room:start", (_socket, payload) => {
      setisGameStarted(payload.isStarted);
    });

    return () => {
      unSubscribe("room:start");
    };
  }, [setisGameStarted, subscribe, unSubscribe]);

  return (
    <>
      <div className="grid grid-cols-2 h-dvh p-5">
        <div className="flex flex-col">
          <Users isAdmin={isAdmin} joinTeam={joinOrCreateATeam} leaveTeam={} />
          <div className="mt-auto">
            <Button handleClick={() => setIsOpen(true)} label="Create A team" />
          </div>
        </div>
        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
          <form
            onSubmit={handleTeamCreation}
            className="flex flex-col gap-y-5 p-5"
          >
            <input
              type="text"
              name="team"
              className="border-b-2"
              placeholder="Team Name"
              required
            />
            <input
              type="text"
              name="user"
              className="border-b-2"
              placeholder="User Name"
              required
            />
            <Button label="Create" />
          </form>
        </Modal>
      </div>
      {isGameStarted && <Navigate to={`room:${room?.id}`} />}
    </>
  );
}
