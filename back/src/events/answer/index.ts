import { Socket } from "socket.io";
import { Rooms, io } from "../..";
import { BuzzerType } from "../../interface";
import { getTeamById } from "../../utils/team";
import { handleError } from "../../utils/error";
import { getUserById } from "../../utils/user";

export const handleAnswer = (socket: Socket, payload: { answer?: string }) => {
  const { team: teamId, room: roomId } = socket.data.user;
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

  io.to(room.id).except(room.admin.id).emit("game:answer", { room, team });
  io.to(room.admin.id).emit("game:answer", {
    room,
    team,
    user,
    answer: payload?.answer,
  });

  setTimeout(() => {
    team.hasBuzzed = false;
    io.to(room.id).emit("game:status", { room, team });
  }, parseInt(process.env.TIMEOUT_ANSWER ?? "30000"));
};

export const hansleAnswerResetAll = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data.user;

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

export const handleAnswerResetTeam = (
  socket: Socket,
  payload: { team: string }
) => {
  const { team: teamId } = payload;
  const { isAdmin, room: roomId } = socket.data.user;

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

export const handleAnswerType = (
  socket: Socket,
  payload: { type: BuzzerType; multiple: number }
) => {
  const { isAdmin, room: roomId } = socket.data.user;
  if (!isAdmin) {
    return handleError(socket, "No Admin of this room");
  }

  io.to(roomId, "game:answer:type");
};
