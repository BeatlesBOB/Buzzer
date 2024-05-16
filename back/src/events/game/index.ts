import { Socket } from "socket.io";
import { Rooms, io } from "../..";
import { ERROR_MSG, handleError } from "../../utils/error";

export const handleGameStart = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data.user;
  if (!Rooms.has(roomId)) {
    return handleError(socket, ERROR_MSG.ROOM);
  }
  const room = Rooms.get(roomId)!;
  if (!isAdmin) {
    return handleError(socket, ERROR_MSG.ADMIN);
  }
  room.hasStarted = true;
  io.to(room.id).emit("game:start", {
    room,
  });
};

export const handleGamePause = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data.user;

  if (!Rooms.has(roomId) || !isAdmin) {
    return handleError(socket, ERROR_MSG.ROOM_OR_ADMIN);
  }

  const room = Rooms.get(roomId)!;
  room.hasStarted = false;
  io.to(room.id).emit("room:status", { room });
};
