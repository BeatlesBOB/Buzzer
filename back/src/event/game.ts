import { Socket } from "socket.io";
import { Rooms, io } from "..";
import { getTeamById, handleError } from "../utils/utils";

export const answer = (socket: Socket) => {
  const { team: teamId, room: roomId } = socket.data;
  if (!Rooms.has(roomId)) {
    return handleError(socket, "No room provided");
  }

  const room = Rooms.get(roomId)!;
  if (!room?.hasStarted) {
    return handleError(socket, "No room or the game isn't started yet");
  }

  const team = getTeamById(room, teamId);

  if (!team || team?.hasBuzzed) {
    return handleError(socket, "Team already buzzed");
  }

  team.hasBuzzed = true;
  io.to(room.id).emit("game:answer", { room, team });
  setTimeout(() => {
    team.hasBuzzed = false;
    io.to(room.id).emit("game:answer", { room, team });
  }, parseInt(process.env.TIMEOUT_ANSWER ?? "4000"));
};

export const resetAllAnswer = (socket: Socket) => {
  const { room: roomId } = socket.data;
  if (!Rooms.has(roomId) || !socket.data.isAdmin) {
    return handleError(
      socket,
      "No room or your not the admin of the current room"
    );
  }

  const room = Rooms.get(roomId)!;
  room.teams.forEach((team) => {
    team.hasBuzzed = false;
  });

  io.to(room.id).emit("game:answer", { room });
};

export const resetTeamAnswer = (socket: Socket) => {
  const { team: teamId, room: roomId } = socket.data;

  if (!Rooms.has(roomId)) {
    return handleError(socket, "No room provided");
  }

  const room = Rooms.get(roomId)!;
  const team = getTeamById(room, teamId);
  if (!team) {
    return handleError(socket, "No Team provided");
  }

  team.hasBuzzed = false;
  io.to(room.id).emit("game:answer", { room });
};

export const gamePaused = (socket: Socket) => {
  const [id] = socket.rooms;
  if (!Rooms.has(id) || !socket.data.isAdmin) {
    return handleError(
      socket,
      "No room or your not the admin of the current room"
    );
  }

  const room = Rooms.get(id)!;
  room.hasStarted = false;
};
