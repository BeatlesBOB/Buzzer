import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io";
import { Rooms, io } from "..";
import {
  createTeam,
  deleteRoom,
  getTeamById,
  initRoom,
  mapToString,
  removeTeamById,
} from "../utils/utils";
import { handleError } from "./error";

export const createRoom = (socket: Socket) => {
  const id = uuidv4();
  socket.data.isAdmin = true;
  socket.join(id);
  const room = initRoom(id);
  socket.emit("room:create", { room: mapToString(room), isAdmin: true });
};

export const leaveRoom = (socket: Socket, payload: any) => {
  const { teamId, isAdmin } = socket.data;
  const [id] = socket.rooms;

  const room = Rooms.get(id);
  if (!room) {
    return handleError(socket, "No Valid Room Provided");
  }

  const team = getTeamById(room, teamId);
  if (!team) {
    return handleError(socket, "No Valid Team Id Provided");
  }

  if (teamId) {
    team.users = team.users.filter((user) => {
      return user.id !== socket.id;
    });
    if (team.users.length === 0) {
      removeTeamById(room, teamId);
    }
  } else if (isAdmin && payload.teamId) {
    removeTeamById(room, teamId);
  }

  if (room.teams.size === 0) {
    deleteRoom(room);
  }

  io.to(room.id).emit("room:leave", { room });
  socket.leave(room.id);
};

export const joinRoom = (
  socket: Socket,
  { userName, teamName }: { userName: string; teamName: string }
) => {
  const [id] = socket.rooms;
  const room = Rooms.get(id);
  if (!room) {
    return handleError(socket, "No Room provided");
  }

  const { teamId } = socket.data;
  let team = getTeamById(room!, teamId);
  if (team) {
    team.users.push({
      id: socket.id,
      name: userName ?? `envie_de_buzzer_${socket.id}`,
    });
  } else if (teamName) {
    const id = uuidv4();
    team = createTeam(id, teamName);
    room.teams.set(id, team);
  } else {
    return handleError(socket, "Provide Atleast a Team name");
  }

  socket.data.teamId = team.id;
  socket.data.teamName = teamName;

  io.to(room.id).emit("room:join", {
    room: mapToString(room),
    player: socket.data,
  });
};

export const startGame = (socket: Socket) => {
  const [id] = socket.rooms;
  const room = Rooms.get(id);
  if (!room) {
    return handleError(socket, "Provide Atleast a Team name");
  }

  room.hasStarted = true;
  io.to(room.id).emit("room:start", { room: mapToString(room) });
};
