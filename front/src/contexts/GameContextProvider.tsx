import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Room, Team } from "../types/interfaces";

export interface IGameContext {
  room?: Room;
  setRoom: (room: Room) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  currentTeam?: Team;
  setCurrentTeam: (team: Team) => void;
  setTeams: (team: Team) => void;
  setisGameStarted: (isGameStarted: boolean) => void;
  isGameStarted: boolean;
}
export const GameContext = createContext<IGameContext>({} as IGameContext);

export interface IGameContextProvider {
  children: ReactNode;
}

export default function GameContextProvider({
  children,
}: IGameContextProvider) {
  const [room, setRoom] = useState<Room>({} as Room);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentTeam, setCurrentTeam] = useState<Team | undefined>(undefined);

  const setTeams = useCallback(
    (team: Team) => {
      const nRoom = { ...room };
      nRoom.teams?.push(team);
      setRoom(nRoom);
    },
    [room]
  );

  const setisGameStarted = useCallback(
    (isStarted: boolean) => {
      const nRoom = { ...room };
      nRoom.hasStarted = isStarted;
      setRoom(nRoom);
    },
    [room]
  );

  const isGameStarted = useMemo(() => {
    return room?.hasStarted;
  }, [room]);

  return (
    <GameContext.Provider
      value={{
        isGameStarted,
        setisGameStarted,
        currentTeam,
        setCurrentTeam,
        room,
        setRoom,
        isAdmin,
        setIsAdmin,
        setTeams,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
