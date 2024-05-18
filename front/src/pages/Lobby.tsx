import { FormEvent, useContext, useEffect, useState } from "react";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Modal from "../components/Modal";
import Button from "../components/Button";
import useSocket from "../hook/useSocket";
import { useNavigate, useParams } from "react-router-dom";
import { Room, Team, User } from "../types/interfaces";
import useStorage from "../hook/useStorage";

export default function Lobby() {
  const { dispatch } = useSocket();
  const navigate = useNavigate();
  const { id } = useParams();
  const { room, setUser, setRoom, user } = useContext(GameContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
  const { setStorageData, getStorageData, clearStorageData } = useStorage();
  const { subscribe, unSubscribe } = useSocket();

  useEffect(() => {
    dispatch("room:info", {
      room: getStorageData("room"),
      user: getStorageData("user"),
      team: getStorageData("team"),
    });

    const handleRoomInfo = (payload: { room: Room; user: User }) => {
      const { room, user } = payload;

      if (!room) {
        clearStorageData();
        return navigate("..");
      }

      setRoom(room);
      setUser(user);
      setStorageData("room", room.id);
      setStorageData("user", user?.id);
      setStorageData("team", user?.team);
    };
    subscribe("room:info", handleRoomInfo);

    return () => {
      unSubscribe("room:info", handleRoomInfo);
    };
  }, []);

  useEffect(() => {
    const handleGameStart = (payload: { room: Room }) => {
      const { room } = payload;
      navigate(`../buzzer/${room.id}`);
    };

    const handleRoomUpdate = (payload: { room: Room }) => {
      const { room } = payload;
      console.log(room);
      if (!room) {
        clearStorageData();
        navigate("..");
      }
      setStorageData("room", room.id);

      setRoom(room);
    };

    const handleUserUpdate = (payload: { user: User }) => {
      const { user } = payload;
      setStorageData("user", user?.id);
      setStorageData("team", user?.team);
      setUser(user);
    };

    dispatch("room:join", { room: id });
    subscribe("game:start", handleGameStart);

    subscribe("room:join", handleRoomUpdate);
    subscribe("room:leave", handleRoomUpdate);

    subscribe("team:create", handleRoomUpdate);
    subscribe("team:join", handleRoomUpdate);
    subscribe("team:leave", handleRoomUpdate);

    subscribe("user:info", handleUserUpdate);
    return () => {
      unSubscribe("game:start", handleGameStart);

      unSubscribe("room:join", handleRoomUpdate);
      unSubscribe("room:leave", handleRoomUpdate);

      unSubscribe("team:create", handleRoomUpdate);
      unSubscribe("team:join", handleRoomUpdate);
      unSubscribe("team:leave", handleRoomUpdate);
      unSubscribe("user:info", handleUserUpdate);
    };
  }, []);

  const handleTeamCreation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    dispatch("team:create", {
      userName: formData.get("userName")?.toString(),
      teamName: formData.get("teamName")?.toString(),
    });
    setIsOpen(false);
  };

  const handleTeamJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    dispatch("team:join", {
      userName: formData.get("userName")?.toString(),
      teamId: formData.get("teamId")?.toString(),
    });
    setIsOpen(false);
  };

  const handeTeamLeave = () => {
    dispatch("team:leave");
  };

  const handleBackHome = () => {
    if (confirm("Tu veux vraiment revenir en arrière ?")) {
      navigate("/");
    }
  };

  return (
    <>
      <div className="h-dvh p-5">
        <div className="flex flex-col h-full">
          <Users
            teams={room?.teams}
            isAdmin={user?.isAdmin}
            joinTeam={(team) => {
              setSelectedTeam(team);
              setIsOpen(true);
            }}
            leaveTeam={handeTeamLeave}
          />
          <div className="mt-auto py-5 flex gap-5">
            <Button
              type="primary"
              handleClick={() => setIsOpen(true)}
              label="Crée ton équipe"
            />
            <Button
              type="primary"
              label="Retour"
              handleClick={handleBackHome}
            />
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <form
          onSubmit={selectedTeam ? handleTeamJoin : handleTeamCreation}
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
            name="userName"
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
