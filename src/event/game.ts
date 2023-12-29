import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io";
import { Rooms, io } from "..";
import {
  createTeam,
  deleteRoom,
  getTeamByName,
  initRoom,
  mapToString,
  removeTeam,
} from "../utils/utils";
import { Room, Team } from "../utils/interface";

export const createRoom = (socket: Socket) => {
  const id = uuidv4();
  socket.join(id);
  socket.emit("room:create", { room: initRoom(id) });
};

export const leaveRoom = (
  socket: Socket,
  { id, team }: { id: string; team: Team }
) => {
  const room = Rooms.get(id);
  if (room) {
    removeTeam(room, team);
    if (room.teams.size === 0) {
      deleteRoom(room);
    }
    io.to(room.id).emit({ room });
    socket.leave(room.id);
  }
};

export const joinRoom = (
  socket: Socket,
  { id, name }: { id: string; name: string }
) => {
  const room = Rooms.get(id);
  if (room && name) {
    let team = getTeamByName(room, name);
    if (!team) {
      const id = uuidv4();
      team = createTeam(id, name);
      room.teams.set(id, team);
    }
    socket.emit("room:team", { team: mapToString(team) });
    io.to(room.id).emit("room:join", { room: mapToString(room) });
  }
};
