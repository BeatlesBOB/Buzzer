import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io";
import { Rooms, io } from "..";
import {
  createTeam,
  deleteRoom,
  getTeamById,
  initRoom,
  removeTeamById,
  handleError,
  removeUserFromTeam,
} from "../utils/utils";

export const createRoom = (socket: Socket) => {
  const id = uuidv4();
  socket.data.isAdmin = true;
  socket.data.room = id;
  socket.join(id);
  const room = initRoom(id, socket.id);
  socket.emit("room:create", { room: room, isAdmin: true });
};

export const leaveRoom = (socket: Socket, payload: any) => {
  const { team: teamId, isAdmin, room: roomId } = socket.data;
  if (!Rooms.has(roomId)) {
    return handleError(socket, "No Room provided");
  }

  const room = Rooms.get(roomId)!;
  const team = getTeamById(room, teamId);
  if (!team) {
    return handleError(socket, "No Valid Team Id Provided");
  }

  if (team) {
    removeUserFromTeam(team, socket.id);
  } else if (isAdmin) {
    if (payload.teamId) {
      removeTeamById(room, payload.teamId);
    }

    if (payload.userId) {
      removeUserFromTeam(team, payload.userId);
    }
  }

  if (team.users.length === 0) {
    removeTeamById(room, teamId);
  }

  io.to(room.id).emit("room:leave", {
    room,
  });
  io.to(socket.id).emit("room:user", {
    user: { id: socket.id, ...socket.data },
  });

  io.to(socket.id).emit("room:user:leave", {
    path: "/",
  });
  socket.leave(room.id);
};

export const joinRoom = (
  socket: Socket,
  {
    roomId,
    userName,
    teamName,
    teamId,
  }: { userName?: string; teamName?: string; teamId?: string; roomId: string }
) => {
  if (!Rooms.has(roomId)) {
    return handleError(socket, "No Room provided");
  }

  const room = Rooms.get(roomId)!;
  if (room.hasStarted) {
    return handleError(socket, "Game Already Started");
  }

  let team = getTeamById(room, teamId);

  if (!team) {
    const id = uuidv4();
    team = createTeam(id, teamName ?? `envie_de_buzzer_${id}`);
    room.teams.push(team);
  }

  const name = userName ?? `envie_de_buzzer_${socket.id}`;
  team.users.push({
    id: socket.id,
    name: name,
    hasBuzzed: false,
  });

  socket.data.team = team.id;
  socket.data.name = name;
  socket.data.room = room.id;
  io.to(room.id).emit("room:join", {
    room,
  });

  io.to(socket.id).emit("room:user", {
    user: { id: socket.id, ...socket.data },
  });
};

export const startGame = (socket: Socket) => {
  const { isAdmin, room: roomId } = socket.data;
  if (!Rooms.has(roomId)) {
    return handleError(socket, "No Room provided");
  }
  const room = Rooms.get(roomId)!;
  if (!isAdmin) {
    return handleError(socket, "You are not admin of this room");
  }
  room.hasStarted = true;
  io.to(room.id).emit("room:start", {
    room,
  });
};

export const handleLobbyStatus = (
  socket: Socket,
  payload: { lobby: string }
) => {
  const { lobby } = payload;
  if (!Rooms.has(lobby)) {
    return handleError(socket, "No Room provided");
  }
  const room = Rooms.get(lobby);
  io.to(socket.id).emit("room:join", { room });
  socket.join(lobby);
};
