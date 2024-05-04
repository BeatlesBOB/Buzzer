import { Socket } from "socket.io";
import { Rooms, io } from "..";
import { getTeamById, handleError } from "../utils/utils";

export const setPoint = (
  socket: Socket,
  payload: { point: number; team: string }
) => {
  const { point, team: teamId } = payload;
  const { room: roomId, isAdmin } = socket.data;

  if (!Rooms.has(roomId) || !isAdmin) {
    return handleError(
      socket,
      "No room or your not the Admin of the current Game"
    );
  }
  const room = Rooms.get(roomId)!;
  const team = getTeamById(room, teamId);
  if (!team) {
    return handleError(socket, "No team provided");
  }

  team.point = point || 0;
  io.emit("game:status", { room: room });
};

export const resetAllPoint = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data;
  if (!Rooms.has(roomId) || !isAdmin) {
    return handleError(
      socket,
      "No room or your not the Admin of the current Game"
    );
  }

  const room = Rooms.get(roomId)!;
  room.teams.forEach((team) => {
    team.point = 0;
  });
  io.emit("game:status", { room });
};
