import { ReactNode, createContext, useState } from "react";
import { Room, Team } from "../types/interfaces";

export interface IGameContext {
  room?: Room;
  setRoom: (room: Room) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  teams?: Array<Team>;
  setTeams: (teams: Array<Team>) => void;
  isGameStarted: boolean;
  setisGameStarted: (hasGameStarted: boolean) => void;
  currentTeam: Team;
  setCurrentTeam: (team: Team) => void;
}
export const GameContext = createContext<IGameContext>({} as IGameContext);

export interface IGameContextProvider {
  children: ReactNode;
}

export default function GameContextProvider({
  children,
}: IGameContextProvider) {
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [teams, setTeams] = useState<Array<Team>>([]);
  const [isGameStarted, setisGameStarted] = useState<boolean>(false);
  const [currentTeam, setCurrentTeam] = useState({} as Team);

  return (
    <GameContext.Provider
      value={{
        currentTeam,
        setCurrentTeam,
        isGameStarted,
        setisGameStarted,
        room,
        setRoom,
        isAdmin,
        setIsAdmin,
        setTeams,
        teams,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
