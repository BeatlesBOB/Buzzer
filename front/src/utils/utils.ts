import { Team } from "../types/interfaces";

export const parseTeams = (data: [[id: string, team: Team]]): Team[] => {
  return data.map((teamMap) => {
    return teamMap[1];
  });
};
