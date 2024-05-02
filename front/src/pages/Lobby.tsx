import { FormEvent, useContext, useEffect, useState } from "react";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Modal from "../components/Modal";
import Button from "../components/Button";
import useSocket from "../hook/useSocket";
import { Navigate, useNavigate } from "react-router-dom";
import { Team } from "../types/interfaces";

export default function Lobby() {
  const { dispatch } = useSocket();
  const { isAdmin, room, setisGameStarted, isGameStarted, setTeams, setUser } =
    useContext(GameContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

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
      const { room } = payload;
      setisGameStarted(room.isStarted);
      navigate(`room/${room.id}`);
    });

    subscribe("room:leave", (_socket, payload) => {
      const { room } = payload;
      setTeams(room.teams ?? []);
    });

    subscribe("room:join", (_socket, payload) => {
      const { room } = payload;
      setTeams(room.teams ?? []);
    });

    subscribe("room:user", (_socket, payload) => {
      const { user } = payload;
      setUser(user);
    });

    return () => {
      unSubscribe("room:start");
      unSubscribe("room:leave");
      unSubscribe("room:join");
    };
  }, [
    navigate,
    room?.id,
    setTeams,
    setUser,
    setisGameStarted,
    subscribe,
    unSubscribe,
  ]);

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
      {isGameStarted && <Navigate to={`buzzer/${room?.id}`} />}
    </>
  );
}
