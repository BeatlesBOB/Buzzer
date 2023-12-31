import { Socket } from "socket.io";
import { Data } from "../utils/interface";
import { Rooms, io } from "..";
import { getTeamByName, mapToString } from "../utils/utils";

export const answer = (socket: Socket, { id, name }: Data) => {
  const room = Rooms.get(id);
  if (room && room.hasStarted) {
    const team = getTeamByName(room, name);
    if (team && !team.hasBuzzed) {
      team.hasBuzzed = true;
      io.to(id).emit("game:answer", { room: mapToString(room) });
      setTimeout(() => {
        team.hasBuzzed = false;
        io.to(id).emit("game:answer", { room: mapToString(room) });
      }, parseInt(process.env.TIMEOUT_ANSWER!));
    }
  }
};

export const resetAllAnswer = (socket: Socket, { id }: { id: string }) => {
  const room = Rooms.get(id);
  if (room && socket.data.isAdmin) {
    room.teams.forEach((team) => {
      team.hasBuzzed = false;
    });
    io.to(id).emit("c", { room: mapToString(room) });
  }
};

export const resetTeamAnswer = (socket: Socket, { id, name }: Data) => {
  const room = Rooms.get(id);
  if (room) {
    const team = getTeamByName(room, name);
    if (team) {
      team.hasBuzzed = false;
      io.to(id).emit("game:answer", { room: mapToString(room) });
    }
  }
};
