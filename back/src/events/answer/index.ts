import { Socket } from "socket.io";
import { Rooms, io } from "../..";
import { BuzzerType } from "../../interface";
import { getTeamById } from "../../utils/team";
import { ERROR_MSG, handleError } from "../../utils/error";
import { getUserById } from "../../utils/user";

export const handleAnswer = (socket: Socket, payload: { answer?: string }) => {
  const { team: teamId, room: roomId, id: userId } = socket.data.user;
  if (!Rooms.has(roomId)) {
    return handleError(socket, ERROR_MSG.ROOM);
  }

  const room = Rooms.get(roomId)!;
  if (!room?.isStarted) {
    return handleError(socket, ERROR_MSG.DOESNT_STARTED);
  }

  const team = getTeamById(room, teamId);

  if (!team || team?.hasBuzzed) {
    return handleError(socket, ERROR_MSG.BUZZER);
  }

  team.hasBuzzed = true;
  const user = getUserById(team, userId);
  if (!user) {
    return handleError(socket, ERROR_MSG.USER);
  }

  const timer = process.env.TIMEOUT_ANSWER ?? "30000";

  user.hasBuzzed = true;
  io.to(room.id).emit("game:answer", {
    room,
    team,
    user,
    timer,
    answer: payload?.answer,
  });

  setTimeout(() => {
    team.hasBuzzed = false;
    user.hasBuzzed = false;
    io.to(room.id).emit("game:answer:reset", { room, team, user });
  }, parseInt(timer));
};

export const hansleAnswerResetAll = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data.user;

  if (!Rooms.has(roomId) || !isAdmin) {
    return handleError(socket, ERROR_MSG.ROOM_OR_ADMIN);
  }

  const room = Rooms.get(roomId)!;
  room.teams.forEach((team) => {
    team.hasBuzzed = false;
  });

  io.to(room.id).emit("game:answer:reset", { room });
};

export const handleAnswerResetTeam = (
  socket: Socket,
  payload: { team: string }
) => {
  const { team: teamId } = payload;
  const { isAdmin, room: roomId } = socket.data.user;

  if (!Rooms.has(roomId)) {
    return handleError(socket, ERROR_MSG.ROOM);
  }

  const room = Rooms.get(roomId)!;
  const team = getTeamById(room, teamId);
  if (!team || !isAdmin) {
    return handleError(socket, ERROR_MSG.ROOM_OR_ADMIN);
  }

  team.hasBuzzed = false;
  io.to(room.id).emit("game:answer:reset:all", { room });
};

export const handleAnswerType = (
  socket: Socket,
  payload: { type: BuzzerType; multiple: number }
) => {
  const { isAdmin, room: roomId } = socket.data.user;
  if (!isAdmin) {
    return handleError(socket, ERROR_MSG.ADMIN);
  }

  io.to(roomId).emit("game:answer:type", {});
};
