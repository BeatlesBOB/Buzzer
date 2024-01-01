import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io";
import { Rooms, io } from "..";
import {
  createTeam,
  deleteRoom,
  getTeamByName,
  initRoom,
  mapToString,
  removeTeamByName,
} from "../utils/utils";
import { Data } from "../utils/interface";

export const createRoom = (socket: Socket) => {
  const id = uuidv4();
  socket.data.isAdmin = true;
  socket.join(id);
  const room = initRoom(id);
  io.emit("room:create", { room });
  socket.emit("room:create", { room });
};

export const leaveRoom = (socket: Socket, { id, name }: Data) => {
  const room = Rooms.get(id);
  if (room) {
    removeTeamByName(room, name);
    if (room.teams.size === 0) {
      deleteRoom(room);
    }
    io.to(room.id).emit({ room });
    socket.leave(room.id);
  }
};

export const joinRoom = (socket: Socket, { id, name }: Data) => {
  const room = Rooms.get(id);
  if (room && name) {
    let team = getTeamByName(room, name);
    if (!team) {
      const id = uuidv4();
      team = createTeam(id, name);
      room.teams.set(id, team);
    }
    socket.emit("room:team", { team: mapToString(team) });
    io.to(room.id).emit("room:join", {
      room: mapToString(room),
      player: socket.data,
    });
  }
};

export const startGame = (socket: Socket, { id }: { id: string }) => {
  const room = Rooms.get(id);
  if (room) {
    room.hasStarted = true;
    io.to(room.id).emit("room:start", { room: mapToString(room) });
  }
};
