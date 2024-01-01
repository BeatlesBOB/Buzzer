import { Rooms } from "..";
import { Room, Team } from "./interface";

export const createTeam = (id: string, name: string): Team => {
  return {
    id,
    name,
    point: 0,
    hasBuzzed: false,
  };
};

export const getTeamByName = (room: Room, name: string): Team | undefined => {
  const filtered = Array.from(
    room.teams,
    ([id, team]: [id: string, team: Team]) => ({
      id,
      team,
    })
  ).filter((room) => {
    return room.team.name === name;
  });

  return filtered[0]?.team;
};

export const removeTeamByName = (room: Room, name: string) => {
  const team = getTeamByName(room, name);
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
