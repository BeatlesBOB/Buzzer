import { Socket } from "socket.io";
import { Rooms, io } from "..";
import { getTeamById, handleError } from "../utils/utils";

export const answer = (socket: Socket) => {
  const [id] = socket.rooms;
  if (!Rooms.has(id)) {
    return handleError(socket, "No room provided");
  }

  const room = Rooms.get(id)!;
  if (!room?.hasStarted) {
    return handleError(socket, "No room or the game isn't started yet");
  }

  const { team: teamId } = socket.data;
  const team = getTeamById(room, teamId);

  if (!team || team?.hasBuzzed) {
    return handleError(socket, "Team already buzzed");
  }

  team.hasBuzzed = true;
  io.to(room.id).emit("game:answer", { room });
  setTimeout(() => {
    team.hasBuzzed = false;
    io.to(room.id).emit("game:answer", { room });
  }, parseInt(process.env.TIMEOUT_ANSWER ?? "4000"));
};

export const resetAllAnswer = (socket: Socket) => {
  const [id] = socket.rooms;
  if (!Rooms.has(id) || !socket.data.isAdmin) {
    return handleError(
      socket,
      "No room or your not the admin of the current room"
    );
  }

  const room = Rooms.get(id)!;
  room.teams.forEach((team) => {
    team.hasBuzzed = false;
  });
  io.to(id).emit("game:answer", { room });
};

export const resetTeamAnswer = (socket: Socket) => {
  const [id] = socket.rooms;

  if (!Rooms.has(id)) {
    return handleError(socket, "No room provided");
  }

  const { team: teamId } = socket.data;
  const room = Rooms.get(id)!;
  const team = getTeamById(room, teamId);
  if (!team) {
    return handleError(socket, "No Team provided");
  }

  team.hasBuzzed = false;
  io.to(id).emit("game:answer", { room });
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
