import { ReactNode, createContext } from "react";
import { Socket, io } from "socket.io-client";

const socket: Socket = io("http://localhost:3000");
export const SocketContext = createContext(socket);

export interface SocketProvider {
  children: ReactNode;
}

export default function SocketContextProvider({ children }: SocketProvider) {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
