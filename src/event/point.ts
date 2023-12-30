import { Socket } from "socket.io";
import { Data } from "../utils/interface";
import { Rooms } from "..";
import { getTeamByName } from "../utils/utils";

export const setPoint = (socket: Socket, { id, name, point }: Data) => {
  const room = Rooms.get(id);
  if (room) {
    const team = getTeamByName(room, name);
    if (team) {
      team.point = point ?? 0;
    }
  }
};

export const resetAllPoint = (socket: Socket, { id, name }: Data) => {
  const room = Rooms.get(id);
  if (room) {
    room.teams.forEach((team) => {
      team.point = 0;
    });
  }
};
