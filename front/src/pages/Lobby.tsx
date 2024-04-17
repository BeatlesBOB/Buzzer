import { FormEvent, useContext, useState } from "react";
import { SocketContext } from "../contexts/SocketContextProvider";
import { GameContext } from "../contexts/GameContextProvider";
import { useParams } from "react-router-dom";
import Users from "../components/Users";
import Modal from "../components/Modal";
import { Team } from "../utils/interfaces";
import Button from "../components/Button";

export default function Lobby() {
  const socket = useContext(SocketContext);
  const { isAdmin, teams } = useContext(GameContext) || {};
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const joinOrCreateATeam = (
    team: Team | null = null,
    name: string | null = null
  ) => {
    socket.emit("room:join", { id, teamId: team?.id, name });
  };

  const handleTeamCreation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    joinOrCreateATeam(null, formData.get("teamName")?.toString());
  };

  return (
    <div className="grid grid-cols-2   h-dvh p-5">
      <div className="flex flex-col">
        <Users teams={teams} isAdmin={isAdmin} joinTeam={joinOrCreateATeam} />
        <div>
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
            name="teamName"
            className="border-b-2"
            placeholder="Team Name"
          />
          <Button label="Create" />
        </form>
      </Modal>
    </div>
  );
}
