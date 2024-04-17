import Admin from "./Admin";
import Buzzer from "./Buzzer";
import { GameContext } from "../contexts/GameContextProvider";
import { useContext } from "react";

export default function Room() {
  const { isAdmin } = useContext(GameContext) || {};

  return !isAdmin ? <Admin /> : <Buzzer />;
}
