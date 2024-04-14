import Admin from "../components/Admin";
import Buzzer from "../components/Buzzer";
import { GameContext } from "../contexts/GameProvider";
import { useContext } from "react";

export default function Room() {
  const { isAdmin } = useContext(GameContext) || {};

  return (
    <>
      <h1>{isAdmin}</h1>
      {isAdmin ? <Admin /> : <Buzzer />}
    </>
  );
}
