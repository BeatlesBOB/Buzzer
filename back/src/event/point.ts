import { Socket } from "socket.io";
import { Data } from "../utils/interface";
import { Rooms, io } from "..";
import { getTeamById, mapToString } from "../utils/utils";

export const setPoint = (socket: Socket, { id, teamId, point }: Data) => {
  const room = Rooms.get(id);
  if (room && socket.data.isAdmin) {
    const team = getTeamById(room, teamId);
    if (team) {
      team.point = point || 0;
      io.emit("game:status", { room: mapToString(room) });
    }
  }
};

export const resetAllPoint = (socket: Socket, { id }: Data) => {
  const room = Rooms.get(id);
  if (room && socket.data.isAdmin) {
    room.teams.forEach((team) => {
      team.point = 0;
    });
    io.emit("game:status", { room: mapToString(room) });
  }
};
