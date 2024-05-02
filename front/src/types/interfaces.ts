export interface Room {
  id: string;
  teams: Array<Team>;
  hasStarted: boolean;
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
  team: string;
}
