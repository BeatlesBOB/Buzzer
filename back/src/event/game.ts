import { Socket } from "socket.io";
import { Data } from "../utils/interface";
import { Rooms, io } from "..";
import { getTeamById, mapToString } from "../utils/utils";

export const answer = (socket: Socket, { id, teamId }: Data) => {
  const room = Rooms.get(id);
  if (room && room.hasStarted) {
    const team = getTeamById(room, teamId);
    if (team && !team.hasBuzzed) {
      team.hasBuzzed = true;
      io.to(id).emit("game:answer", { room: mapToString(room) });
      setTimeout(() => {
        team.hasBuzzed = false;
        io.to(id).emit("game:answer", { room: mapToString(room) });
      }, parseInt(process.env.TIMEOUT_ANSWER ?? "4000"));
    }
  }
};

export const resetAllAnswer = (socket: Socket, { id }: { id: string }) => {
  const room = Rooms.get(id);
  if (room && socket.data.isAdmin) {
    room.teams.forEach((team) => {
      team.hasBuzzed = false;
    });
    io.to(id).emit("game:answer", { room: mapToString(room) });
  }
};

export const resetTeamAnswer = (socket: Socket, { id, teamId }: Data) => {
  const room = Rooms.get(id);
  if (room) {
    const team = getTeamById(room, teamId);
    if (team) {
      team.hasBuzzed = false;
      io.to(id).emit("game:answer", { room: mapToString(room) });
    }
  }
};
