export interface Room {
  id: string;
  teams: Array<Team>;
  isStarted: boolean;
}

export interface Team {
  id: string;
  name: string;
  point: number;
  hasBuzzed: boolean;
  users: Array<User>;
}

export interface User {
  id: string;
  name: string;
  room: string;
  hasBuzzed: boolean;
  team: string;
  isAdmin: boolean;
}

export interface Answer {
  user: User;
  team: Team;
}
