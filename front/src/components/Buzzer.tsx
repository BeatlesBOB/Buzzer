import { FormEvent, SyntheticEvent, useContext, useState } from "react";
import { SocketContext } from "../contexts/SocketContextProvider";
import { GameContext } from "../contexts/GameContextProvider";
import { useParams } from "react-router-dom";
import Users from "./Users";
import Modal from "../components/Modal";
import { Team } from "../utils/interfaces";

export default function Buzzer() {
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
    e.preventDefault()
    const formData = new FormData(e.currentTarget);
    joinOrCreateATeam(null, formData.get("teamName")?.toString())
  }

  return (
    <div className="grid grid-cols-[1fr_max-content_1fr]">
      <div className="h-dvh flex flex--col">
        <Users teams={teams} isAdmin={isAdmin} joinTeam={joinOrCreateATeam} />
        <div>
            <button
              onClick={() => setIsOpen(true)}
              className="font-primary font-regular underline">
              Create A team
            </button>
        </div>
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <form onSubmit={handleTeamCreation} className="flex flex-col gap-y-5 p-5">
          <input type="text" name="teamName" className="border-b-2" placeholder="Team Name"/>
          <button className="font-primary font-regular underline">
              Create
          </button>
        </form>
      </Modal>
    </div>
  );
}
