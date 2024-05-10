import { ReactNode, createContext, useState } from "react";
import { Room, User } from "../types/interfaces";

export interface IGameContext {
  room?: Room;
  setRoom: (room: Room) => void;
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
  const [user, setUser] = useState<User | undefined>(undefined);

  return (
    <GameContext.Provider
      value={{
        user,
        setUser,
        room,
        setRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
