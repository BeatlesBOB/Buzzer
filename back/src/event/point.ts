import { Socket } from "socket.io";
import { Rooms, io } from "..";
import { getTeamById, mapToString } from "../utils/utils";

export const setPoint = (socket: Socket, { point }: { point: number }) => {
  const { teamId } = socket.data;
  const [id] = socket.rooms;
  const room = Rooms.get(id);
  if (room && socket.data.isAdmin) {
    const team = getTeamById(room, teamId);
    if (team) {
      team.point = point || 0;
      io.emit("game:status", { room: mapToString(room) });
    }
  }
};

export const resetAllPoint = (socket: Socket) => {
  const [id] = socket.rooms;
  const room = Rooms.get(id);
  if (room && socket.data.isAdmin) {
    room.teams.forEach((team) => {
      team.point = 0;
    });
    io.emit("game:status", { room: mapToString(room) });
  }
};
