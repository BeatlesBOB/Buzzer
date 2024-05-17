import { useContext, useEffect, useMemo } from "react";
import useSocket from "../hook/useSocket";
import { GameContext } from "../contexts/GameContextProvider";
import useToasts from "../hook/useToasts";
import { Room, User } from "../types/interfaces";
import useStorage from "../hook/useStorage";
import { useNavigate } from "react-router-dom";

export default function Buzzer() {
  const { dispatch, subscribe, unSubscribe } = useSocket();
  const { room, user, setRoom, setUser } = useContext(GameContext);
  const { pushToast } = useToasts();
  const { getStorageData, setStorageData } = useStorage();
  const navigate = useNavigate();

  const isDisabled = useMemo(() => {
    return (
      room?.teams?.some((team) => {
        return team.hasBuzzed === true;
      }) || !room?.isStarted
    );
  }, [room]);

  useEffect(() => {
    dispatch("room:info", {
      room: getStorageData("room"),
      user: getStorageData("user"),
    });

    const handleRoomInfo = (payload: { room: Room; user: User }) => {
      const { room, user } = payload;

      if (!room || !user || !user.isAdmin) {
        return navigate("..");
      }

      setRoom(room);
      setUser(user);
      setStorageData("room", room.id);
      setStorageData("user", user.id);
    };
    subscribe("room:info", handleRoomInfo);

    return () => {
      unSubscribe("room:info", handleRoomInfo);
    };
  }, []);

  useEffect(() => {
    const handleTeamAnswer = (payload: { room: Room }) => {
      const { room } = payload;
      setRoom(room);
    };

    const handleError = (payload: { msg: string }) => {
      pushToast({
        title: "Whooops, nan mais on savait que ça pouvait pas être parfait",
        desc: payload.msg,
      });
    };

    subscribe("room:pause", handleTeamAnswer);
    subscribe("buzzer:notification", handleError);

    subscribe("game:answer", handleTeamAnswer);
    subscribe("game:status", handleTeamAnswer);

    return () => {
      subscribe("room:pause", handleTeamAnswer);
      unSubscribe("buzzer:notification", handleError);

      unSubscribe("game:answer", handleTeamAnswer);
      unSubscribe("game:status", handleTeamAnswer);
    };
  }, []);

  const handleAnswer = () => {
    dispatch("game:answer");
  };

  return (
    <button
      className="h-dvh w-dvw disabled:bg-gray-300 user-name"
      onClick={handleAnswer}
      disabled={isDisabled}
    >
      {user!.name}
    </button>
  );
}
