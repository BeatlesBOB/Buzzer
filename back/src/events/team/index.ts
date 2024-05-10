import { Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Rooms, io } from "../..";
import { createTeam, getTeamById } from "../../utils/team";
import { handleError } from "../../utils/error";
import { setUserData } from "../../utils/user";
import { User } from "../../interface";

export const handleTeamCreate = (
  socket: Socket,
  payload: {
    userName: string;
    teamName: string;
  }
) => {
  const { room: roomId } = socket.data;
  const { userName, teamName } = payload;

  if (!Rooms.has(roomId)) {
    return handleError(socket, "Pas de room Bolosse");
  }

  const room = Rooms.get(roomId)!;
  if (room.hasStarted) {
    return handleError(socket, "Trop tard, ça a déjà commencé");
  }

  if (!userName) {
    return handleError(socket, "Pas de room ou nom d'utilisateur Bolosse");
  }

  const id = uuidv4();
  const team = createTeam(id, teamName);
  room.teams.push(team);
  const user: User = {
    id: socket.id,
    name: userName,
    hasBuzzed: false,
    team: team.id,
    room: room.id,
  };

  team.users.push(user);
  setUserData(socket, user);

  io.to(room.id).emit("team:create", { room });

  io.to(socket.id).emit("user:info", {
    user,
  });
};

export const handleTeamJoin = (
  socket: Socket,
  payload: { userName: string; teamId: string }
) => {
  const { room: roomId } = socket.data;
  const { userName, teamId } = payload;

  if (!Rooms.has(roomId)) {
    return handleError(socket, "Pas de room Bolosse");
  }

  const room = Rooms.get(roomId)!;
  if (room.hasStarted) {
    return handleError(socket, "Trop tard, ça a déjà commencé");
  }

  let team = getTeamById(room, teamId);

  if (!team || !userName) {
    return handleError(socket, "Pas de team ou nom d'utilisateur Bolosse");
  }

  const user: User = {
    id: socket.id,
    name: userName,
    hasBuzzed: false,
    team: team.id,
    room: room.id,
  };

  team.users.push(user);
  setUserData(socket, user);

  io.to(room.id).emit("team:join", { room });

  io.to(socket.id).emit("user:info", {
    user,
  });
};

export const handleTeamDelete = (
  socket: Socket,
  {
    userName,
    teamId,
  }: { userName?: string; teamName?: string; teamId?: string }
) => {
  const { room: roomId } = socket.data;
  if (!Rooms.has(roomId)) {
    return handleError(socket, "Pas de room Bolosse");
  }

  const room = Rooms.get(roomId)!;
  if (room.hasStarted) {
    return handleError(socket, "Trop tard, ça a déjà commencé");
  }

  let team = getTeamById(room, teamId);

  if (!team || !userName) {
    return handleError(socket, "Pas de team ou nom d'utilisateur Bolosse");
  }

  const user: User = {
    id: socket.id,
    name: userName,
    hasBuzzed: false,
    team: team.id,
    room: room.id,
  };

  team.users.push(user);
  setUserData(socket, user);

  io.to(room.id).emit("team:create", { room });

  io.to(socket.id).emit("room:user", {
    user,
  });
};
