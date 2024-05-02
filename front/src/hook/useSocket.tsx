import { Socket, io } from "socket.io-client";
const socket: Socket = io(import.meta.env.VITE_BACKEND_URL);

export default function useSocket() {
  const dispatch = (type: string, payload?: object) => {
    socket.emit(type, payload);
  };
  const subscribe = (type: string, callback: (...args: any[]) => void) => {
    socket.on(type, (payload) => callback?.(payload));
  };

  const unSubscribe = (type: string, callback: (...args: any[]) => void) => {
    socket.off(type, callback);
  };

  return {
    dispatch,
    subscribe,
    unSubscribe,
  };
}
