import { Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Rooms, io } from "../..";
import { createTeam, getTeamById, removeTeamById } from "../../utils/team";
import { handleError } from "../../utils/error";
import { removeUserByTeamId, setUserData } from "../../utils/user";
import { Room, Team, User } from "../../interface";
import { deleteRoom } from "../../utils/room";

export const handleTeamCreate = (
  socket: Socket,
  payload: {
    userName: string;
    teamName: string;
  }
) => {
  const { room: roomId } = socket.data.user;
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
  const { room: roomId } = socket.data.user;
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

export const handleTeamLeave = (socket: Socket) => {
  const { room: roomId, team: teamId } = socket.data.user;

  if (!Rooms.has(roomId)) {
    return handleError(socket, "Pas de room Bolosse");
  }

  let room = Rooms.get(roomId)!;
  let team = getTeamById(room, teamId);

  if (!team) {
    return handleError(socket, "Pas de room Bolosse");
  }

  const isRemoved = removeUserByTeamId(team, socket.id);
  if (!isRemoved) {
    return handleError(socket, "Y'a couille dans le potage");
  }

  if (team!.users.length === 0) {
    removeTeamById(room, teamId);
  }

  if (room.teams.length === 0) {
    room = deleteRoom(room) ? ({} as Room) : room;
  }

  const user: Partial<User> = {
    team: undefined,
  };

  setUserData(socket, user);

  io.to(room.id).emit("team:leave", { room });

  io.to(socket.id).emit("user:info", {
    user,
  });
};
