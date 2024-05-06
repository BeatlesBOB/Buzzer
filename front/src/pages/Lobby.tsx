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
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();

  const navigate = useNavigate();
  const { id } = useParams();

  const { subscribe, unSubscribe } = useSocket();

  const handleTeamCreation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    joinOrCreateATeam(
      {
        name: formData.get("teamName")?.toString(),
        id: formData.get("teamId")?.toString(),
      },
      formData.get("user")?.toString()
    );
    setIsOpen(false);
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
      navigate(`../buzzer/${room.id}`);
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

  useEffect(() => {
    dispatch("room:lobby", { lobby: id });
  }, []);

  const handeTeamLeave = () => {
    dispatch("room:leave");
    navigate("../");
  };

  const homePath = () => {
    let path = `/`;
    if (confirm("Tu veux vraiment revenir en arrière ?")) {
      navigate(path);
    }
  };

  const handleTeamJoin = (team: Team) => {
    setSelectedTeam(team);
    setIsOpen(true);
  };

  return (
    <>
      <div className="h-dvh p-5">
        <div className="flex flex-col h-full">
          <Users
            teams={room?.teams}
            isAdmin={isAdmin}
            joinTeam={handleTeamJoin}
            leaveTeam={handeTeamLeave}
          />
          <div className="mt-auto py-5 flex gap-5">
            <Button
              type="primary"
              handleClick={() => setIsOpen(true)}
              label="Crée ton équipe"
            />
            <Button type="primary" label="Retour" handleClick={homePath} />
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <form
          onSubmit={handleTeamCreation}
          className="flex flex-col gap-y-5 p-5"
        >
          <input
            type="text"
            className="border-b-2"
            placeholder="Nom d'équipe"
            {...(selectedTeam !== undefined
              ? {
                  value: selectedTeam.id,
                  name: "teamId",
                  readOnly: true,
                  hidden: true,
                }
              : {
                  name: "teamName",
                })}
            required
          />
          <input
            type="text"
            name="user"
            className="border-b-2"
            placeholder="Ton pti nom"
            required
          />
          <Button type="primary" label="Lezzzz Go" />
        </form>
      </Modal>
    </>
  );
}
