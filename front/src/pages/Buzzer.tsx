import { useContext, useEffect, useMemo } from "react";
import useSocket from "../hook/useSocket";
import { GameContext } from "../contexts/GameContextProvider";
import useToasts from "../hook/useToasts";

export default function Buzzer() {
  const { dispatch, subscribe, unSubscribe } = useSocket();
  const { room, setTeams } = useContext(GameContext);
  const { pushToast } = useToasts();

  const isDisabled = useMemo(() => {
    return room?.teams?.some((team) => {
      return team.hasBuzzed === true;
    });
  }, [room]);

  useEffect(() => {
    subscribe("game:answer", (_socket, payload) => {
      const { room } = payload;
      setTeams(room.teams);
    });

    subscribe("buzzer:notification", (_socket, payload) => {
      pushToast({
        title: "Whooops nan mon on savais que ça pouvais pas etre parfait",
        desc: payload,
      });
    });

    return () => {
      unSubscribe("game:answer");
      unSubscribe("buzzer:notification");
    };
  }, [pushToast, setTeams, subscribe, unSubscribe]);

  const handleAnswer = () => {
    dispatch("game:answer");
  };

  return (
    <button
      className="h-dvh w-dvw"
      onClick={handleAnswer}
      disabled={isDisabled}
    ></button>
  );
}
