import { Socket } from "socket.io";
import { Rooms, io } from "..";
import { getTeamById, mapToString, handleError } from "../utils/utils";

export const setPoint = (socket: Socket, { point }: { point: number }) => {
  const { teamId } = socket.data;
  const [id] = socket.rooms;
  const room = Rooms.get(id);
  if (!room || !socket.data.isAdmin) {
    return handleError(
      socket,
      "No room or your not the Adminof the current Game"
    );
  }

  const team = getTeamById(room, teamId);
  if (!team) {
    return handleError(socket, "No team provided");
  }

  team.point = point || 0;
  io.emit("game:status", { room: mapToString(room) });
};

export const resetAllPoint = (socket: Socket) => {
  const [id] = socket.rooms;
  const room = Rooms.get(id);
  if (!room || !socket.data.isAdmin) {
    return handleError(
      socket,
      "No room or your not the Adminof the current Game"
    );
  }
  room.teams.forEach((team) => {
    team.point = 0;
  });
  io.emit("game:status", { room: mapToString(room) });
};
