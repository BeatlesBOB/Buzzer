import { Socket } from "socket.io";
import { Rooms, io } from "..";
import { getTeamById, mapToString } from "../utils/utils";
import { handleError } from "./error";

export const answer = (socket: Socket) => {
  const { teamId } = socket.data;
  const [id] = socket.rooms;
  const room = Rooms.get(id);
  if (!room?.hasStarted) {
    return handleError(socket, "No room or the game isn't started yet");
  }

  const team = getTeamById(room, teamId);
  if (!team || team?.hasBuzzed) {
    return handleError(socket, "Team already buzzed");
  }

  team.hasBuzzed = true;
  io.to(room.id).emit("game:answer", { room: mapToString(room) });
  setTimeout(() => {
    team.hasBuzzed = false;
    io.to(room.id).emit("game:answer", { room: mapToString(room) });
  }, parseInt(process.env.TIMEOUT_ANSWER ?? "4000"));
};

export const resetAllAnswer = (socket: Socket) => {
  const [id] = socket.rooms;
  const room = Rooms.get(id);

  if (!room || !socket.data.isAdmin) {
    return handleError(
      socket,
      "No room or your not the admin of the current room"
    );
  }

  room.teams.forEach((team) => {
    team.hasBuzzed = false;
  });
  io.to(id).emit("game:answer", { room: mapToString(room) });
};

export const resetTeamAnswer = (socket: Socket) => {
  const { teamId } = socket.data;
  const [id] = socket.rooms;

  const room = Rooms.get(id);

  if (!room) {
    return handleError(socket, "No room provided");
  }

  const team = getTeamById(room, teamId);
  if (!team) {
    return handleError(socket, "No Team provided");
  }

  team.hasBuzzed = false;
  io.to(id).emit("game:answer", { room: mapToString(room) });
};
