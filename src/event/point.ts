import { Socket } from "socket.io";
import { Data } from "../utils/interface";
import { Rooms, io } from "..";
import { getTeamByName, mapToString } from "../utils/utils";

export const setPoint = (socket: Socket, { id, name, point }: Data) => {
  const room = Rooms.get(id);
  if (room && socket.data.isAdmin) {
    const team = getTeamByName(room, name);
    if (team) {
      team.point = point || 0;
      io.emit("game:status", { room: mapToString(room) });
    }
  }
};

export const resetAllPoint = (socket: Socket, { id, name }: Data) => {
  const room = Rooms.get(id);
  if (room && socket.data.isAdmin) {
    room.teams.forEach((team) => {
      team.point = 0;
    });
    io.emit("game:status", { room: mapToString(room) });
  }
};
