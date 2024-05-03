import { FormEvent, useContext, useEffect, useState } from "react";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Modal from "../components/Modal";
import Button from "../components/Button";
import useSocket from "../hook/useSocket";
import { useNavigate, useParams } from "react-router-dom";
import { Room, Team, User } from "../types/interfaces";

export default function Lobby() {
  const { dispatch } = useSocket();
  const { isAdmin, room, setisGameStarted, setUser, setRoom } =
    useContext(GameContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { id } = useParams();

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
      roomId: id,
      userName,
      teamName: team.name,
      teamId: team.id,
    });
  };

  useEffect(() => {
    const handleStart = (payload: { room: Room }) => {
      const { room } = payload;
      setisGameStarted(room.hasStarted);
      navigate(`buzzer/${room.id}`);
    };

    const handleTeamsUpdate = (payload: { room: Room }) => {
      const { room } = payload;
      setRoom(room);
    };

    const handleUserUpdate = (payload: { user: User }) => {
      const { user } = payload;
      setUser(user);
    };
    subscribe("room:start", handleStart);

    subscribe("room:leave", handleTeamsUpdate);

    subscribe("room:join", handleTeamsUpdate);

    subscribe("room:user", handleUserUpdate);

    return () => {
      unSubscribe("room:start", handleStart);
      unSubscribe("room:leave", handleTeamsUpdate);
      unSubscribe("room:join", handleUserUpdate);
      unSubscribe("room:user", handleUserUpdate);
    };
  }, []);

  const handeTeamLeave = () => {
    dispatch("room:leave");
  };

  return (
    <>
      <div className="grid grid-cols-2 h-dvh p-5">
        <div className="flex flex-col">
          <Users
            isAdmin={isAdmin}
            joinTeam={joinOrCreateATeam}
            leaveTeam={handeTeamLeave}
          />
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
    </>
  );
}
