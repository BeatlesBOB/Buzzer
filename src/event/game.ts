import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io";
import { Rooms, io } from "..";
import {
  createTeam,
  deleteRoom,
  getTeamByName,
  removeTeam,
} from "../utils/utils";

interface data {
  id: string;
  name: string;
}

export const createRoom = (socket: Socket) => {
  const id = uuidv4();
  socket.join(id);
  socket.emit("game:create", { id });
};

export const leaveRoom = (socket: Socket, { id, name }: data) => {
  const room = Rooms.get(id);
  if (room) {
    const team = getTeamByName(room, name);
    if (team) {
      removeTeam(room, team);
      if (room.teams.size === 0) {
        deleteRoom(room);
      }
      io.to(id).emit({ room });
      socket.leave(id);
    }
  }
};

export const joinRoom = (socket: Socket, { id, name }: data) => {
  const room = Rooms.get(id);
  if (room) {
    const team = getTeamByName(room, name);
    if (!team) {
      const id = uuidv4();
      room.teams.set(id, createTeam(id, name));
    }
    socket.emit("game:team", team);
    io.to(id).emit("game:join", { room });
  }
};
