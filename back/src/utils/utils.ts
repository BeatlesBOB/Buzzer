import { Socket } from "socket.io";
import { io } from "..";
import { Rooms } from "..";
import { Room, Team } from "./interface";

export const createTeam = (id: string, name: string): Team => {
  return {
    id,
    name,
    point: 0,
    hasBuzzed: false,
    users: [],
  };
};

export const getTeamById = (room: Room, id?: string): Team | undefined => {
  const index = room.teams.findIndex((team) => {
    return team.id === id;
  });

  if (index === -1) {
    return undefined;
  }

  return room.teams[index];
};

export const removeTeamById = (room: Room, id: string) => {
  const currentTeam = getTeamById(room, id);
  const index = room.teams.findIndex((team) => {
    return team.id === currentTeam?.id;
  });

  if (index !== -1) {
    room.teams.splice(index, 1);
  }
};

export const deleteRoom = (room: Room) => {
  Rooms.delete(room.id);
};

export const initRoom = (id: string, admin: string) => {
  const room = { id, teams: [], hasStarted: false, admin };
  Rooms.set(id, room);
  return room;
};

export const handleError = (socket: Socket, msg: string) => {
  io.to(socket.id).emit("buzzer:notification", msg);
};

export const removeUserFromTeam = (team: Team, userId: string) => {
  const index = team.users.findIndex((user) => {
    return user.id === userId;
  });

  if (index !== -1) {
    team.users.splice(index, 1);
  }
};

export const getUserById = (team: Team, userId: string) => {
  const index = team.users.findIndex((user) => {
    return user.id === userId;
  });

  if (index !== -1) {
    return team.users[index];
  }
};
