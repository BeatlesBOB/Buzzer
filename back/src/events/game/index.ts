import { Socket } from "socket.io";
import { Rooms, io } from "../..";
import { handleError } from "../../utils/error";

export const handleGameStart = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data.user;
  if (!Rooms.has(roomId)) {
    return handleError(socket, "No Room provided");
  }
  const room = Rooms.get(roomId)!;
  if (!isAdmin) {
    return handleError(socket, "You are not admin of this room");
  }
  room.hasStarted = true;
  io.to(room.id).emit("game:start", {
    room,
  });
};

export const handleGamePause = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data;

  if (!Rooms.has(roomId) || !isAdmin) {
    return handleError(
      socket,
      "No room or your not the admin of the current room"
    );
  }

  const room = Rooms.get(roomId)!;
  room.hasStarted = false;
  io.to(room.id).emit("room:status", { room });
};
