import { Socket } from "socket.io";
import { Rooms, io } from "..";
import { getTeamById, getUserById, handleError } from "../utils/utils";

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
  const user = getUserById(team, socket.id);
  if (!user) {
    return handleError(socket, "User not found");
  }

  io.to(room.id).emit("game:answer", { room, team });
  setTimeout(() => {
    team.hasBuzzed = false;
    user.hasBuzzed = false;
    io.to(room.id).emit("game:status", { room, team });
  }, parseInt(process.env.TIMEOUT_ANSWER ?? "4000"));
};

export const resetAllAnswer = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data;

  if (!Rooms.has(roomId) || !isAdmin) {
    return handleError(
      socket,
      "No room or your not the admin of the current room"
    );
  }

  const room = Rooms.get(roomId)!;
  room.teams.forEach((team) => {
    team.hasBuzzed = false;
  });

  io.to(room.id).emit("game:status", { room });
};

export const resetTeamAnswer = (socket: Socket, payload: { team: string }) => {
  const { team: teamId } = payload;
  const { isAdmin, room: roomId } = socket.data;

  if (!Rooms.has(roomId)) {
    return handleError(socket, "No room provided");
  }

  const room = Rooms.get(roomId)!;
  const team = getTeamById(room, teamId);
  if (!team || !isAdmin) {
    return handleError(socket, "No Team provided or not admin of this room");
  }

  team.hasBuzzed = false;
  io.to(room.id).emit("game:status", { room });
};

export const gamePause = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data;

  if (!Rooms.has(roomId) || !isAdmin) {
    return handleError(
      socket,
      "No room or your not the admin of the current room"
    );
  }

  const room = Rooms.get(roomId)!;
  room.hasStarted = false;
  io.to(room.id).emit("room:pause", { room });
};
