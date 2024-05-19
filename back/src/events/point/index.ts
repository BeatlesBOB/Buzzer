import { Socket } from "socket.io";
import { Rooms, io } from "../..";
import { ERROR_MSG, handleError } from "../../utils/error";
import { getTeamById } from "../../utils/team";

export const handlePointUpdate = (
  socket: Socket,
  payload: { point: number; team: string }
) => {
  const { point, team: teamId } = payload;
  const { room: roomId, isAdmin } = socket.data.user;

  if (!Rooms.has(roomId) || !isAdmin) {
    return handleError(
      socket,
      "No room or your not the Admin of the current Game"
    );
  }
  const room = Rooms.get(roomId)!;
  const team = getTeamById(room, teamId);
  if (!team) {
    return handleError(socket, ERROR_MSG.TEAM);
  }

  team.point = point || 0;
  io.emit("game:point", { room: room });
};

export const handlePointResetAll = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data.user;
  if (!Rooms.has(roomId) || !isAdmin) {
    return handleError(socket, ERROR_MSG.ROOM_OR_ADMIN);
  }

  const room = Rooms.get(roomId)!;
  room.teams.forEach((team) => {
    team.point = 0;
  });
  io.emit("game:point:reset", { room });
};
