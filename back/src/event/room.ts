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

export const leaveRoom = (socket: Socket) => {
  const { roomId, teamId, userId } = socket.data;
  const room = Rooms.get(roomId);
  if (room) {
    const team = getTeamById(room, teamId);
    if (team) {
      if (userId) {
        team.users = team.users.filter((user) => {
          return user.id !== userId;
        });
        if (team.users.length === 0) {
          removeTeamById(room, teamId);
        }
      } else {
        removeTeamById(room, teamId);
      }

      if (room.teams.size === 0) {
        deleteRoom(room);
      }

      io.to(room.id).emit("room:leave", { room });
      socket.leave(room.id);
    }
  }
};

export const joinRoom = (socket: Socket) => {
  const { roomId, teamId, teamName, userName } = socket.data;
  const room = Rooms.get(roomId);
  if (room) {
    let team = getTeamById(room, teamId);
    if (team) {
      team?.users.push({
        id: socket.id,
        name: userName ?? `envie_de_buzzer_${socket.id}`,
      });
    } else if (teamName) {
      const id = uuidv4();
      team = createTeam(id, teamName);
      room.teams.set(id, team);
    } else {
      return io.to(room.id).emit("room:error", {
        msg: "Provide atleast a team Name",
      });
    }

    socket.data.teamId = team.id;
    socket.data.teamName = teamName;

    io.to(room.id).emit("room:join", {
      room: mapToString(room),
      player: socket.data,
    });
  }
};

export const startGame = (socket: Socket) => {
  const { roomId } = socket.data;
  const room = Rooms.get(roomId);
  if (room) {
    room.hasStarted = true;
    io.to(room.id).emit("room:start", { room: mapToString(room) });
  }
};
