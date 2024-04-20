import { FormEvent, useContext, useState } from "react";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Modal from "../components/Modal";
import Button from "../components/Button";

export default function Lobby() {
  const { isAdmin, joinOrCreateATeam } = useContext(GameContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleTeamCreation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    joinOrCreateATeam(formData.get("team")?.toString());
  };

  return (
    <div className="grid grid-cols-2 h-dvh p-5">
      <div className="flex flex-col">
        <Users isAdmin={isAdmin} leave={leave} />
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
  );
}
