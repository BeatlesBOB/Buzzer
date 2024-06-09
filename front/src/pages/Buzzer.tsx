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
      team: getStorageData("team"),
    });

    const handleRoomInfo = (payload: { room: Room; user: User }) => {
      const { room, user } = payload;

      if (!room || !user) {
        return navigate("..");
      }

      setRoom(room);
      setUser(user);

      dispatch("room:join", { room: room.id });

      setStorageData("room", room.id);
      setStorageData("user", user.id);
      setStorageData("team", user.team);
    };
    subscribe("room:info", handleRoomInfo);

    return () => {
      unSubscribe("room:info", handleRoomInfo);
    };
  }, []);

  useEffect(() => {
    const handleTeamAnswer = (payload: { room: Room; timer: string }) => {
      const { room } = payload;
      setRoom(room);
    };

    const handleError = (payload: { msg: string }) => {
      pushToast({
        title: "Whooops, nan mais on savait que ça pouvait pas être parfait",
        desc: payload.msg,
      });
    };
    const handleRoomUpdate = (payload: { room: Room }) => {
      const { room } = payload;
      setRoom(room);
    };

    subscribe("game:pause", handleTeamAnswer);
    subscribe("game:start", handleTeamAnswer);
    subscribe("buzzer:notification", handleError);

    subscribe("game:answer", handleTeamAnswer);
    subscribe("game:answer:reset", handleRoomUpdate);
    subscribe("game:answer:reset:all", handleRoomUpdate);

    return () => {
      unSubscribe("game:start", handleTeamAnswer);
      unSubscribe("game:pause", handleTeamAnswer);
      unSubscribe("buzzer:notification", handleError);

      unSubscribe("game:answer", handleTeamAnswer);
      unSubscribe("game:answer:reset", handleRoomUpdate);
      unSubscribe("game:answer:reset:all", handleRoomUpdate);
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
      {user?.name}
    </button>
  );
}
