import { Socket } from "socket.io";
import { Rooms, io } from "..";
import { getTeamById, mapToString } from "../utils/utils";

export const answer = (socket: Socket) => {
  const { teamId } = socket.data;
  const [id] = socket.rooms;
  const room = Rooms.get(id);
  if (room && room.hasStarted) {
    const team = getTeamById(room, teamId);
    if (team && !team.hasBuzzed) {
      team.hasBuzzed = true;
      io.to(room.id).emit("game:answer", { room: mapToString(room) });
      setTimeout(() => {
        team.hasBuzzed = false;
        io.to(room.id).emit("game:answer", { room: mapToString(room) });
      }, parseInt(process.env.TIMEOUT_ANSWER ?? "4000"));
    }
  }
};

export const resetAllAnswer = (socket: Socket) => {
  const [id] = socket.rooms;
  const room = Rooms.get(id);
  if (room && socket.data.isAdmin) {
    room.teams.forEach((team) => {
      team.hasBuzzed = false;
    });
    io.to(id).emit("game:answer", { room: mapToString(room) });
  }
};

export const resetTeamAnswer = (socket: Socket) => {
  const { teamId } = socket.data;
  const [id] = socket.rooms;

  const room = Rooms.get(id);
  if (room) {
    const team = getTeamById(room, teamId);
    if (team) {
      team.hasBuzzed = false;
      io.to(id).emit("game:answer", { room: mapToString(room) });
    }
  }
};
