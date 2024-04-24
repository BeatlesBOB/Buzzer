import { Socket } from "socket.io";
import { Rooms, io } from "..";
import { getTeamById, handleError } from "../utils/utils";

export const setPoint = (socket: Socket, { point }: { point: number }) => {
  const { teamId } = socket.data;
  const [id] = socket.rooms;
  if (!Rooms.has(id) || !socket.data.isAdmin) {
    return handleError(
      socket,
      "No room or your not the Admin of the current Game"
    );
  }
  const room = Rooms.get(id)!;
  const team = getTeamById(room, teamId);
  if (!team) {
    return handleError(socket, "No team provided");
  }

  team.point = point || 0;
  io.emit("game:status", { room: room });
};

export const resetAllPoint = (socket: Socket) => {
  const [id] = socket.rooms;
  if (!Rooms.has(id) || !socket.data.isAdmin) {
    return handleError(
      socket,
      "No room or your not the Adminof the current Game"
    );
  }

  const room = Rooms.get(id)!;
  room.teams.forEach((team) => {
    team.point = 0;
  });
  io.emit("game:status", { room });
};
