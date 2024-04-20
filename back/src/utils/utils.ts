import { Rooms } from "..";
import { Room, Team } from "./interface";

export const createTeam = (id: string, name: string): Team => {
  return {
    id,
    name,
    point: 0,
    hasBuzzed: false,
    users:[]
  };
};

export const getTeamById = (room: Room, id: string): Team | undefined => {
  const filtered = Array.from(
    room.teams,
    ([id, team]: [id: string, team: Team]) => ({
      id,
      team,
    })
  ).filter((room) => {
    return room.team.id === id;
  });

  return filtered[0]?.team;
};

export const removeTeamById = (room: Room, id: string) => {
  const team = getTeamById(room, id);
  if (team) {
    room.teams.delete(team?.id);
  }
};

export const deleteRoom = (room: Room) => {
  Rooms.delete(room.id);
};

export const initRoom = (id: string) => {
  const room = { id, teams: new Map<string, Team>(), hasStarted: false };
  Rooms.set(id, room);
  return room;
};

export const mapToString = (map: any) => {
  return JSON.stringify(map, (key, value) =>
    value instanceof Map ? [...value] : value
  );
};
