import { useContext, useEffect, useMemo } from "react";
import useSocket from "../hook/useSocket";
import { GameContext } from "../contexts/GameContextProvider";
import useToasts from "../hook/useToasts";
import { Room } from "../types/interfaces";

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
    const handleTeamAnswer = (payload: { room: Room }) => {
      const { room } = payload;
      setTeams(room.teams);
    };

    const handleError = (payload: string) => {
      pushToast({
        title: "Whooops nan mon on savais que ça pouvais pas etre parfait",
        desc: payload,
      });
    };

    subscribe("game:answer", handleTeamAnswer);

    subscribe("buzzer:notification", handleError);

    return () => {
      unSubscribe("game:answer", handleTeamAnswer);
      unSubscribe("buzzer:notification", handleError);
    };
  }, []);

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
