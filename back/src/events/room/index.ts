import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io";
import { Rooms, io } from "../..";
import { Room } from "../../interface";
import { deleteRoom, initRoom } from "../../utils/room";
import { ERROR_MSG, handleError } from "../../utils/error";
import { getTeamById, removeTeamById } from "../../utils/team";
import { getUserById, removeUserByTeamId, setUserData } from "../../utils/user";

export const handleRoomCreate = (socket: Socket) => {
  const id = uuidv4();
  const user = {
    id: socket.id,
    room: id,
    isAdmin: true,
  };
  const room = initRoom(id, user);

  setUserData(socket, user);
  socket.join(id);
  io.to(socket.id).emit("room:create", {
    room: room,
    user,
  });
};

export const handleRoomLeave = (
  socket: Socket,
  payload: { team?: string; user?: string }
) => {
  const { team: teamId, isAdmin, room: roomId } = socket.data.user;
  if (!Rooms.has(roomId)) {
    return handleError(socket, ERROR_MSG.ROOM);
  }

  let room = Rooms.get(roomId)!;

  if (!isAdmin) {
    const team = getTeamById(room, teamId);

    if (!team) {
      return handleError(socket, ERROR_MSG.TEAM);
    }

    removeUserByTeamId(team, socket.id);

    if (team!.users.length === 0) {
      removeTeamById(room, teamId);
    }

    const user = setUserData(socket, {
      id: undefined,
      name: undefined,
      room: undefined,
      hasBuzzed: undefined,
      team: undefined,
    });

    if (room.teams.length === 0) {
      room = deleteRoom(room) ? ({} as Room) : room;
    }

    io.to(roomId).emit("room:leave", {
      room,
    });

    io.to(socket.id).emit("room:user", {
      user,
    });

    socket.leave(room.id);
  } else if (isAdmin) {
    const { team: teamId, user } = payload;
    const team = getTeamById(room, teamId);

    if (!team) {
      return handleError(socket, ERROR_MSG.TEAM);
    }

    if (teamId && user === undefined) {
      removeTeamById(room, teamId);
    } else if (team && user) {
      removeUserByTeamId(team, user);
    }

    if (team!.users.length === 0) {
      removeTeamById(room, team.id);
    }

    io.to(roomId).emit("room:leave", {
      room,
    });
  }
};

export const handeRoomJoin = (socket: Socket, payload: { room: string }) => {
  const { room: roomId } = payload;
  if (!Rooms.has(roomId)) {
    return handleError(socket, ERROR_MSG.ROOM);
  }

  const room = Rooms.get(roomId)!;
  if (room.hasStarted) {
    return handleError(socket, ERROR_MSG.ALREADY_STARTED);
  }

  socket.join(room.id);
  setUserData(socket, { room: room.id });

  io.to(socket.id).emit("room:join", { room });
};

export const handleRoomInfo = (
  socket: Socket,
  payload: { user: string; room: string; team: string }
) => {
  const { room: roomId, user: userId, team: teamId } = payload;
  if (!Rooms.has(roomId)) {
    return handleError(socket, ERROR_MSG.ROOM);
  }
  const room = Rooms.get(roomId)!;
  const team = getTeamById(room, teamId);

  const user =
    getUserById(team, userId) || (room.admin.id === userId && room.admin);

  if (!user) {
    return handleError(socket, ERROR_MSG.USER);
  }

  setUserData(socket, user);

  io.to(socket.id).emit("room:info", {
    user,
    room,
  });
};
