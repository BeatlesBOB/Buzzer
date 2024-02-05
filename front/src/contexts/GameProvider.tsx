import { ReactNode, createContext, useState } from "react";
import { Room, Team } from "../utils/interfaces";

export interface GameContext {
  room?: Room;
  setRoom: (room: Room) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  teams?: Array<Team>;
  setTeams: (teams: Array<Team> ) => void;
}
export const GameContext = createContext<GameContext | null>(null);

export interface GameProvider {
  children: ReactNode;
}

export default function SocketProvider({ children }: GameProvider) {
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [teams, setTeams] = useState<Array<Team>>([]);

  return (
    <GameContext.Provider value={{ room, setRoom, isAdmin, setIsAdmin, setTeams, teams }}>
      {children}
    </GameContext.Provider>
  );
}
