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
import { Data } from "../utils/interface";

export const createRoom = (socket: Socket) => {
  const id = uuidv4();
  socket.data.isAdmin = true;
  socket.join(id);
  const room = initRoom(id);
  socket.emit("room:create", { room: mapToString(room), isAdmin: true });
};

export const leaveRoom = (socket: Socket, { id, teamId }: Data) => {
  const room = Rooms.get(id);
  if (room) {
    const team = getTeamById(room, teamId);
    if (team) {
      team.users = team.users.filter((user) => {
        return user !== socket.id;
      });

      if (team.users.length === 0) {
        removeTeamById(room, teamId);
        if (room.teams.size === 0) {
          deleteRoom(room);
        }
        io.to(room.id).emit("room:leave", { room });
        socket.leave(room.id);
      }
    }
  }
};

export const joinRoom = (socket: Socket, { id, teamId, name }: Data) => {
  const room = Rooms.get(id);
  if (room && (teamId || name)) {
    let team = getTeamById(room, teamId);
    if (!team && name) {
      const id = uuidv4();
      team = createTeam(id, name);
      room.teams.set(id, team);
    }
    team?.users.push(socket.id);
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
