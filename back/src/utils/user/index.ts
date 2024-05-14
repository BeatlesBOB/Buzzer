import { Socket } from "socket.io";
import { Team, User } from "../../interface";

export const getUserById = (team: Team = {} as Team, userId: string) => {
  const index = team?.users?.findIndex((user) => {
    return user.id === userId;
  });

  if (!index || index === -1) {
    return false;
  }

  return team.users[index];
};

export const removeUserByTeamId = (team: Team, userId: string) => {
  const index = team.users.findIndex((user) => {
    return user.id === userId;
  });

  if (!index || index === -1) {
    return false;
  }

  team.users.splice(index, 1);
  return true;
};

export const setUserData = (socket: Socket, user: Partial<User>): User => {
  return (socket.data.user = Object.assign(socket.data.user || {}, user));
};
