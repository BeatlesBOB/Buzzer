import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Room, Team, User } from "../types/interfaces";

export interface IGameContext {
  room?: Room;
  setRoom: (room: Room) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  setisGameStarted: (isGameStarted: boolean) => void;
  isGameStarted: boolean;
  user?: User;
  setUser: (user: User) => void;
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
  const [user, setUser] = useState<User | undefined>(undefined);

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
        user,
        setUser,
        room,
        setRoom,
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
