import { Socket } from "socket.io";
import { io } from "../..";

export const handleError = (socket: Socket, msg: string) => {
  io.to(socket.id).emit("buzzer:notification", { msg });
};
