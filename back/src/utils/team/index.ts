import { Room, Team } from "../../interface";

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

  if (index === -1) {
    return false;
  }
  room.teams.splice(index, 1);
  return true;
};
