import { Socket, io } from "socket.io-client";
const socket: Socket = io("http://localhost:3000");

interface IDispatch {
  type: string;
  payload?: unknown;
}

interface ISubscribe {
  type: string;
  callback?: (payload: unknown) => void;
}

export default function useSocket() {
  const dispatch = ({ type, payload }: IDispatch) => {
    socket.emit(type, payload);
  };
  const subscribe = ({ type, callback }: ISubscribe) => {
    socket.on(type, (payload) => callback?.(payload));
  };

  return {
    socket,
    dispatch,
    subscribe,
  };
}
