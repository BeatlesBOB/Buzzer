import { useContext } from "react";
import { GameContext } from "../contexts/GameProvider";

export const useGameContext = () => {
  const currentGameContext = useContext(GameContext);

  if (!currentGameContext) {
    throw new Error(
      "currentGameContext has to be used within <CurrentGameContext.Provider>"
    );
  }

  return currentGameContext;
};
