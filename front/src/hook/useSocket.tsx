import { Socket, io } from "socket.io-client";
const socket: Socket = io(import.meta.env.BACKEND_URL);

export default function useSocket() {
  const dispatch = (type: string, payload?: object) => {
    socket.emit(type, payload);
  };
  const subscribe = (
    type: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (socket: Socket, payload?: any) => void
  ) => {
    socket.on(type, (payload) => callback?.(socket, payload));
  };

  const unSubscribe = (type: string) => {
    socket.off(type);
  };

  return {
    socket,
    dispatch,
    subscribe,
    unSubscribe,
  };
}
