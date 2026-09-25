import { useContext } from "react";
import { GameContext } from "../contexts/gameContextValue";

export default function useGame() {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame doit être utilisé dans <GameProvider>");
  return value;
}
